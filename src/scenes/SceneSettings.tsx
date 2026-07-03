import type { SealedHaiku } from "../types";
import { useSettings } from "../store/settings";
import { useMusicPlayer } from "../audio/useMusicPlayer";
import { exportJson, importHaiku, loadOrchard } from "../store/orchard";

// The gardener's bench — one scrollable settings page, eight sections.
// Sliders/toggles that have a real effect elsewhere in the app are wired
// live (aesthetics theme, archive sort/wither, grammar risky-joins/tag
// display, growth pacing, sound volume/loop); a few remain preference-only
// for now (cloud sync, image-card export) and say so honestly rather than
// pretending to work.

interface Props {
  orchard: SealedHaiku[];
  onDeleteWithered: (id: string) => void;
  onImported: (list: SealedHaiku[]) => void;
}

function toMarkdown(list: SealedHaiku[]): string {
  return list
    .map(
      (h) =>
        `## ${h.title}${h.titleJp ? ` / ${h.titleJp}` : ""}\n\n` +
        h.lines.map((l) => `${l.en}  \n*${l.jp}*`).join("\n\n") +
        `\n\n— ${h.themeEn}, sealed ${new Date(h.sealedAt).toLocaleDateString()}\n`
    )
    .join("\n---\n\n");
}

function toPlainText(list: SealedHaiku[]): string {
  return list
    .map((h) => `${h.title}\n${h.lines.map((l) => l.en).join("\n")}\n(${h.themeEn})\n`)
    .join("\n");
}

function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SceneSettings({ orchard, onDeleteWithered, onImported }: Props) {
  const { settings, update } = useSettings();
  const music = useMusicPlayer();

  const set = <S extends keyof typeof settings>(
    section: S,
    patch: Partial<(typeof settings)[S]>
  ) => update((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  const exportEverything = () => {
    if (settings.archive.exportFormat === "json") return exportJson(orchard);
    if (settings.archive.exportFormat === "markdown")
      return downloadText(toMarkdown(orchard), "seed-signal-orchard.md", "text/markdown");
    if (settings.archive.exportFormat === "text")
      return downloadText(toPlainText(orchard), "seed-signal-orchard.txt", "text/plain");
    window.alert("Image-card export isn't built yet — exporting JSON instead.");
    exportJson(orchard);
  };

  const importBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const list = JSON.parse(await file.text()) as SealedHaiku[];
      if (Array.isArray(list)) {
        await importHaiku(list);
        onImported(await loadOrchard());
      }
    } catch {
      // unreadable file — ignore
    }
    e.target.value = "";
  };

  const witheredEligible = orchard.filter(
    (h) =>
      h.withered &&
      h.witheredAt &&
      (Date.now() - new Date(h.witheredAt).getTime()) / 86400000 >= settings.archive.witherDays
  );

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await music.loadFile(file);
    e.target.value = "";
  };

  return (
    <div className="settings-scene">
      <h1 className="scene-title">the gardener's bench</h1>
      <div className="scene-sub">庭師の作業台</div>

      <div className="settings-body">
        <section className="settings-section">
          <h3>Sound Garden <em>音の庭</em></h3>
          <div className="track-list">
            {music.tracks.map((t, i) => (
              <div key={i} className={`track-row ${music.activeIndex === i ? "active" : ""}`}>
                <button className="icon-btn" onClick={() => music.selectTrack(i)}>
                  {music.activeIndex === i && music.playing ? "❚❚" : "▶"}
                </button>
                <span>{t.name}</span>
              </div>
            ))}
            <label className="dock-load upload-row">
              + upload audio
              <input type="file" accept="audio/*" onChange={onUpload} hidden />
            </label>
          </div>
          <div className="field-row">
            <label>master volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.sound.masterVolume}
              onChange={(e) => set("sound", { masterVolume: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>response sensitivity <span className="muted">(future audio-reactive visuals)</span></label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.sound.sensitivity}
              onChange={(e) => set("sound", { sensitivity: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>loop mode</label>
            <select
              value={settings.sound.loopMode}
              onChange={(e) => set("sound", { loopMode: e.target.value as typeof settings.sound.loopMode })}
            >
              <option value="seamless">seamless</option>
              <option value="shuffle">shuffle</option>
              <option value="once">once</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Growth <em>成長</em></h3>
          <div className="field-row">
            <label>germination time — {settings.growth.germinationSeconds}s</label>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={settings.growth.germinationSeconds}
              onChange={(e) => set("growth", { germinationSeconds: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>fruit density</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.growth.fruitDensity}
              onChange={(e) => set("growth", { fruitDensity: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>seeds per fruit — {settings.growth.seedsPerFruit}</label>
            <input
              type="range"
              min={4}
              max={20}
              step={1}
              value={settings.growth.seedsPerFruit}
              onChange={(e) => set("growth", { seedsPerFruit: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>ripening pattern</label>
            <select
              value={settings.growth.ripening}
              onChange={(e) => set("growth", { ripening: e.target.value as typeof settings.growth.ripening })}
            >
              <option value="gradual">gradual</option>
              <option value="all-at-once">all at once</option>
              <option value="random">random</option>
            </select>
          </div>
          <div className="field-row">
            <label>auto-Japanese translation</label>
            <input
              type="checkbox"
              checked={settings.growth.autoTranslate}
              onChange={(e) => set("growth", { autoTranslate: e.target.checked })}
            />
          </div>
        </section>

        <section className="settings-section">
          <h3>Language <em>言葉</em></h3>
          <div className="field-row">
            <label>primary language</label>
            <select
              value={settings.language.primary}
              onChange={(e) => set("language", { primary: e.target.value as typeof settings.language.primary })}
            >
              <option value="en">English</option>
              <option value="jp">日本語</option>
            </select>
          </div>
          <div className="field-row">
            <label>translation style</label>
            <select
              value={settings.language.translationStyle}
              onChange={(e) =>
                set("language", { translationStyle: e.target.value as typeof settings.language.translationStyle })
              }
            >
              <option value="literal">literal</option>
              <option value="poetic">poetic</option>
              <option value="both">both</option>
            </select>
          </div>
          <div className="field-row">
            <label>syllable rule</label>
            <select
              value={settings.language.syllableRule}
              onChange={(e) =>
                set("language", { syllableRule: e.target.value as typeof settings.language.syllableRule })
              }
            >
              <option value="strict">strict 5-7-5</option>
              <option value="loose">gently loose</option>
              <option value="free">free</option>
            </select>
          </div>
          <div className="field-row">
            <label>punctuation default</label>
            <select
              value={settings.language.punctuation}
              onChange={(e) =>
                set("language", { punctuation: e.target.value as typeof settings.language.punctuation })
              }
            >
              <option value="none">none</option>
              <option value="ask">ask each time</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Grammar Physics <em>文法の物理</em></h3>
          <div className="field-row">
            <label>magnetic strength</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.grammar.magneticStrength}
              onChange={(e) => set("grammar", { magneticStrength: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>verb-count guardrail <span className="muted">(warn at 2+ verbs/line)</span></label>
            <input
              type="checkbox"
              checked={settings.grammar.verbGuardrail}
              onChange={(e) => set("grammar", { verbGuardrail: e.target.checked })}
            />
          </div>
          <div className="field-row">
            <label>allow risky joins</label>
            <input
              type="checkbox"
              checked={settings.grammar.allowRiskyJoins}
              onChange={(e) => set("grammar", { allowRiskyJoins: e.target.checked })}
            />
          </div>
          <div className="field-row">
            <label>part-of-speech tag display</label>
            <select
              value={settings.grammar.tagDisplay}
              onChange={(e) => set("grammar", { tagDisplay: e.target.value as typeof settings.grammar.tagDisplay })}
            >
              <option value="dots">colored dots</option>
              <option value="labels">text labels</option>
              <option value="hidden">hidden</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h3>Aesthetics <em>美学</em></h3>
          <div className="field-row">
            <label>theme</label>
            <select
              value={settings.aesthetics.theme}
              onChange={(e) => set("aesthetics", { theme: e.target.value as typeof settings.aesthetics.theme })}
            >
              <option value="indigo">deep indigo</option>
              <option value="washi">washi paper</option>
              <option value="dawn">dawn</option>
            </select>
          </div>
          <div className="field-row">
            <label>motion speed</label>
            <input
              type="range"
              min={0.4}
              max={1.6}
              step={0.05}
              value={settings.aesthetics.motionSpeed}
              onChange={(e) => set("aesthetics", { motionSpeed: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>fruit glow warmth</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.aesthetics.fruitGlowWarmth}
              onChange={(e) => set("aesthetics", { fruitGlowWarmth: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>ambient watercolor bleed</label>
            <input
              type="checkbox"
              checked={settings.aesthetics.watercolorBleed}
              onChange={(e) => set("aesthetics", { watercolorBleed: e.target.checked })}
            />
          </div>
        </section>

        <section className="settings-section">
          <h3>Archive <em>保存</em></h3>
          <div className="field-row">
            <label>default sort</label>
            <select
              value={settings.archive.defaultSort}
              onChange={(e) => set("archive", { defaultSort: e.target.value as typeof settings.archive.defaultSort })}
            >
              <option value="newest">newest</option>
              <option value="oldest">oldest</option>
              <option value="grove">by grove</option>
              <option value="alphabetical">alphabetical</option>
            </select>
          </div>
          <div className="field-row">
            <label>wither before permanent removal — {settings.archive.witherDays}d</label>
            <input
              type="range"
              min={1}
              max={90}
              step={1}
              value={settings.archive.witherDays}
              onChange={(e) => set("archive", { witherDays: Number(e.target.value) })}
            />
          </div>
          <div className="field-row">
            <label>export format</label>
            <select
              value={settings.archive.exportFormat}
              onChange={(e) => set("archive", { exportFormat: e.target.value as typeof settings.archive.exportFormat })}
            >
              <option value="json">JSON</option>
              <option value="markdown">markdown</option>
              <option value="text">plain text</option>
              <option value="image">image card (not yet built)</option>
            </select>
          </div>
          <div className="settings-actions">
            <button className="ghost-btn" onClick={exportEverything}>
              export everything
            </button>
            <label className="ghost-btn file-label">
              import backup
              <input type="file" accept="application/json" onChange={importBackup} hidden />
            </label>
          </div>
          {witheredEligible.length > 0 && (
            <div className="withered-cleanup">
              <div className="muted">{witheredEligible.length} withered haiku past retention:</div>
              {witheredEligible.map((h) => (
                <div key={h.id} className="withered-row">
                  <span>{h.title}</span>
                  <button className="ghost-btn" onClick={() => onDeleteWithered(h.id)}>
                    delete forever
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="settings-section">
          <h3>Privacy <em>私性</em></h3>
          <div className="field-row">
            <label>data storage</label>
            <select
              value={settings.privacy.storage}
              onChange={(e) => set("privacy", { storage: e.target.value as typeof settings.privacy.storage })}
            >
              <option value="local">local only</option>
              <option value="cloud">local + cloud sync (not yet built)</option>
            </select>
          </div>
          <div className="field-row">
            <label>AI assistance <span className="muted">(governs translation/title/lexicon calls)</span></label>
            <input
              type="checkbox"
              checked={settings.privacy.aiAssistance}
              onChange={(e) => set("privacy", { aiAssistance: e.target.checked })}
            />
          </div>
          <div className="field-row">
            <label>offline mode</label>
            <input
              type="checkbox"
              checked={settings.privacy.offlineMode}
              onChange={(e) => set("privacy", { offlineMode: e.target.checked })}
            />
          </div>
          <div className="muted small-note">
            This build makes no network calls regardless of these settings — there is no AI backend
            configured yet. They're recorded now so the choice is already made when one is.
          </div>
        </section>

        <section className="settings-section">
          <h3>About</h3>
          <div className="about-block">
            <div>Seed Signal — version 0.1.0</div>
            <div className="muted">part of the water brain collective project</div>
            <div className="muted">feedback — reach out directly</div>
          </div>
        </section>
      </div>
    </div>
  );
}
