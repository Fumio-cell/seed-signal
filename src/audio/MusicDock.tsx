import { useMusicPlayer } from "./useMusicPlayer";

// Looping background music — any track the user loads, not limited to a
// particular genre. Plays continuously across scenes — including,
// deliberately, the Strand scene. Minimal player docked bottom-right; it
// should not draw attention during composition. The actual playback
// engine lives in useMusicPlayer, shared with the Settings "Sound
// Garden" library.

export function MusicDock() {
  const { tracks, activeIndex, playing, progress, loadFile, play, pause, stop } =
    useMusicPlayer();

  const active = activeIndex !== null ? tracks[activeIndex] : null;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await loadFile(file);
    e.target.value = "";
  };

  return (
    <div className="music-dock">
      {active ? (
        <>
          <button
            className="dock-btn"
            onClick={playing ? pause : play}
            title={playing ? "pause" : "play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button className="dock-btn" onClick={stop} title="stop">
            ■
          </button>
          <div className="dock-info">
            <div className="dock-name">{active.name}</div>
            <div className="dock-bar">
              <div className="dock-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </>
      ) : (
        <label className="dock-load">
          ♪ add music
          <input type="file" accept="audio/*" onChange={onFile} hidden />
        </label>
      )}
    </div>
  );
}
