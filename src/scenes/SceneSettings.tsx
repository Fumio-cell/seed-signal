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

// Name the surreality dial's current position for the slider label.
function surrealityLabel(s: number): string {
  if (s < 0.25) return "grounded 地に足";
  if (s < 0.5) return "poetic 詩的";
  if (s < 0.75) return "surreal 超現実";
  return "dream-logic 夢の論理";
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
        </section>

        <section className="settings-section">
          <h3>Language <em>言葉</em></h3>
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
        </section>

        <section className="settings-section">
          <h3>Grammar Physics <em>文法の物理</em></h3>
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
          <h3>Vocabulary <em>言葉の生成</em></h3>
          <div className="field-row">
            <label>
              generative fragments{" "}
              <span className="muted">(compose fresh words each break)</span>
            </label>
            <input
              type="checkbox"
              checked={settings.vocabulary.generative}
              onChange={(e) => set("vocabulary", { generative: e.target.checked })}
            />
          </div>
          <div className="field-row">
            <label>
              surreality — {surrealityLabel(settings.vocabulary.surreality)}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.vocabulary.surreality}
              disabled={!settings.vocabulary.generative}
              onChange={(e) => set("vocabulary", { surreality: Number(e.target.value) })}
            />
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
