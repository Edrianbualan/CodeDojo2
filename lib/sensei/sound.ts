"use client";

export type Sound =
  | "open"
  | "reply"
  | "correct"
  | "incorrect"
  | "next"
  | "complete"
  | "level"
  | "send"
  | "click"
  | "run"
  | "runDone"
  | "runError"
  | "achievement"
  | "xp"
  | "select";
const melodies: Record<Sound, number[]> = {
  open: [392, 523],
  reply: [554, 659],
  correct: [523, 659, 784],
  incorrect: [392, 330],
  next: [440, 587],
  complete: [392, 523, 659, 784],
  level: [523, 659, 784, 1047],
  send: [659, 494],
  click: [330],
  run: [330, 440],
  runDone: [523, 784],
  runError: [294, 220],
  achievement: [440, 587, 880, 1175],
  xp: [784, 988],
  select: [440],
};
type AudioSettings = { enabled: boolean; volume: number };
const defaults: AudioSettings = { enabled: false, volume: 35 };
const key = "codedojo:sfx";
const eventName = "codedojo-sfx-change";
let settings = defaults;
let raw: string | null = null;
let audio: AudioContext | undefined;
let active: OscillatorNode[] = [];

export function audioDefaults() {
  return defaults;
}
export function audioSnapshot() {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== raw) {
      raw = stored;
      const config = stored ? JSON.parse(stored) : defaults;
      settings = {
        enabled: config?.enabled === true,
        volume:
          typeof config?.volume === "number" && Number.isFinite(config.volume)
            ? Math.max(0, Math.min(100, config.volume))
            : defaults.volume,
      };
    }
  } catch {
    /* Retain the in-memory preference. */
  }
  return settings;
}
export function subscribeAudio(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", listener);
  };
}
export function updateAudio(next: AudioSettings) {
  settings = next;
  raw = JSON.stringify(next);
  try {
    localStorage.setItem(key, raw);
  } catch {
    /* Settings still work for this visit. */
  }
  if (!next.enabled || !next.volume) stop();
  window.dispatchEvent(new Event(eventName));
}

function stop() {
  for (const oscillator of active) {
    try {
      oscillator.stop();
    } catch {
      /* Node already ended. */
    }
  }
  active = [];
}

export function unlockAudio(cue?: Sound) {
  const { enabled, volume } = audioSnapshot();
  if (!enabled || !volume) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "running") {
      if (cue) playSound(cue);
    } else {
      void audio
        .resume()
        .then(() => {
          if (cue) playSound(cue);
        })
        .catch(() => {});
    }
  } catch {
    /* Audio is optional. */
  }
}

export function playSound(sound: Sound) {
  const { enabled, volume } = audioSnapshot();
  if (!enabled || !volume || !audio || audio.state !== "running") return;
  stop();
  const context = audio;
  const start = context.currentTime + 0.006;
  active = melodies[sound].map((frequency, index) => {
    const time = start + index * 0.062;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = sound === "incorrect" ? "triangle" : "square";
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(
      0.055 * (volume / 100),
      time + 0.008,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.056);
    oscillator.connect(envelope).connect(context.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(time);
    oscillator.stop(time + 0.06);
    return oscillator;
  });
}
