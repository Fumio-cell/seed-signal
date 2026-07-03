import { createContext, useContext, useEffect, useRef, useState } from "react";
import { audioContext } from "./sfx";
import type { AppSettings } from "../types";

// Shared music-player engine, consumed by both the docked mini-player
// (MusicDock, always visible) and the Settings "Sound Garden" library —
// one AudioContext graph, two UIs. Master volume and loop mode read
// live from AppSettings so a change in Settings takes effect immediately.

export interface Track {
  name: string;
  buffer: AudioBuffer;
}

export interface MusicPlayerState {
  tracks: Track[];
  activeIndex: number | null;
  playing: boolean;
  progress: number; // 0..1 within the current track
  loadFile: (file: File) => Promise<void>;
  selectTrack: (i: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useMusicPlayerEngine(settings: AppSettings): MusicPlayerState {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const offsetRef = useRef(0);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);
  const tracksRef = useRef<Track[]>([]);
  const activeRef = useRef<number | null>(null);
  tracksRef.current = tracks;
  activeRef.current = activeIndex;

  const gain = () => {
    if (!gainRef.current) {
      const c = audioContext();
      gainRef.current = c.createGain();
      gainRef.current.connect(c.destination);
    }
    return gainRef.current;
  };

  useEffect(() => {
    gain().gain.value = settings.sound.masterVolume;
  }, [settings.sound.masterVolume]);

  useEffect(() => {
    const tick = () => {
      const idx = activeRef.current;
      const buf = idx !== null ? tracksRef.current[idx]?.buffer : null;
      if (buf && sourceRef.current) {
        const c = audioContext();
        const elapsed = offsetRef.current + (c.currentTime - startedAtRef.current);
        setProgress((elapsed % buf.duration) / buf.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stopSource = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  };

  const play = () => {
    const idx = activeIndex;
    const buf = idx !== null ? tracks[idx]?.buffer : null;
    if (!buf) return;
    const c = audioContext();
    stopSource();
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = settings.sound.loopMode !== "once";
    src.connect(gain());
    src.start(0, offsetRef.current % buf.duration);
    sourceRef.current = src;
    startedAtRef.current = c.currentTime;
    setPlaying(true);
  };

  const pause = () => {
    const c = audioContext();
    offsetRef.current += c.currentTime - startedAtRef.current;
    stopSource();
    setPlaying(false);
  };

  const stop = () => {
    stopSource();
    offsetRef.current = 0;
    setProgress(0);
    setPlaying(false);
  };

  const selectTrack = (i: number) => {
    stopSource();
    offsetRef.current = 0;
    setProgress(0);
    setActiveIndex(i);
  };

  const loadFile = async (file: File) => {
    const c = audioContext();
    const data = await file.arrayBuffer();
    const buffer = await c.decodeAudioData(data);
    setTracks((t) => {
      const next = [...t, { name: file.name, buffer }];
      selectTrack(next.length - 1);
      return next;
    });
  };

  useEffect(() => {
    if (activeIndex !== null && tracks[activeIndex]) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return { tracks, activeIndex, playing, progress, loadFile, selectTrack, play, pause, stop };
}

export const MusicContext = createContext<MusicPlayerState | null>(null);

export function useMusicPlayer(): MusicPlayerState {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicContext.Provider");
  return ctx;
}
