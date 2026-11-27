const storageKey = "codedojo.dojo-radio.v1";
const fadeMs = 250;

export const defaultRadio = {
  enabled: true,
  paused: false,
  muted: false,
  volume: 0.15,
};

type Preferences = typeof defaultRadio;
type Playback = "idle" | "loading" | "playing" | "blocked" | "error";
export type RadioState = Preferences & { playback: Playback };

function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    return {
      enabled: typeof saved?.enabled === "boolean" ? saved.enabled : true,
      paused: saved?.paused === true,
      muted: saved?.muted === true,
      volume: Number.isFinite(saved?.volume)
        ? Math.min(1, Math.max(0, saved.volume))
        : defaultRadio.volume,
    };
  } catch {
    return { ...defaultRadio };
  }
}

export function connectRadio(
  audio: HTMLAudioElement,
  publish: (state: RadioState) => void,
) {
  let preferences = readPreferences();
  let playback: Playback = "idle";
  let attempt = 0;
  let frame = 0;
  let level = 0;
  let context: AudioContext | undefined;
  let gain: GainNode | undefined;
  let disposed = false;

  audio.volume = 0;
  const nativeVolume = audio.volume === 0;
  const wantsPlayback = () => preferences.enabled && !preferences.paused;
  const target = () => (preferences.muted ? 0 : preferences.volume);
  const report = (next = playback) => {
    playback = next;
    publish({ ...preferences, playback });
  };

  function setLevel(value: number) {
    level = value;
    if (gain) gain.gain.value = value;
    else if (nativeVolume) audio.volume = value;
  }

  function fade(to: number, done?: () => void) {
    cancelAnimationFrame(frame);
    const from = level;
    const start = performance.now();
    if (from === to) {
      done?.();
      return;
    }
    const step = (now: number) => {
      const elapsed = Math.min(1, (now - start) / fadeMs);
      setLevel(from + (to - from) * elapsed);
      if (elapsed < 1) frame = requestAnimationFrame(step);
      else done?.();
    };
    frame = requestAnimationFrame(step);
  }

  function start(fromGesture = false) {
    if (
      !wantsPlayback() ||
      playback === "playing" ||
      (playback === "loading" && !fromGesture)
    )
      return;

    const current = ++attempt;
    report("loading");
    try {
      let outputReady: Promise<void> | undefined;
      if (!nativeVolume) {
        // Mobile Safari controls device volume itself. Put the soundtrack
        // through its own gain node so the radio still has a volume control.
        if (!context && !fromGesture) {
          report("blocked");
          return;
        }
        context ??= new AudioContext();
        if (!gain) {
          const volume = context.createGain();
          volume.gain.value = 0;
          volume.connect(context.destination);
          context.createMediaElementSource(audio).connect(volume);
          gain = volume;
        }
        if (context.state !== "running") {
          if (!fromGesture) {
            report("blocked");
            return;
          }
          outputReady = context.resume();
        }
      }

      // Invoke both permission-gated APIs during the trusted event.
      cancelAnimationFrame(frame);
      if (audio.paused) setLevel(0);
      void Promise.all([audio.play(), outputReady])
        .then(() => {
          if (disposed || current !== attempt || !wantsPlayback()) return;
          report("playing");
          fade(target());
        })
        .catch((error: unknown) => {
          if (disposed || current !== attempt) return;
          audio.pause();
          report(
            error instanceof DOMException &&
              (error.name === "NotAllowedError" || error.name === "AbortError")
              ? "blocked"
              : "error",
          );
        });
    } catch {
      audio.pause();
      report("error");
    }
  }

  const gesture = (event: MouseEvent) => {
    if (
      !event.isTrusted ||
      (event.target instanceof Element &&
        event.target.closest("[data-radio-playback]"))
    )
      return;
    if (playback === "blocked") start(true);
  };
  const interrupted = () => {
    if (wantsPlayback() && playback === "playing" && audio.paused) {
      report("blocked");
    }
  };
  const failed = () => {
    if (wantsPlayback()) report("error");
  };
  document.addEventListener("click", gesture, true);
  audio.addEventListener("pause", interrupted);
  audio.addEventListener("error", failed);
  report();
  start();

  return {
    start,
    update(changes: Partial<Preferences>) {
      const wasWanted = wantsPlayback();
      preferences = { ...preferences, ...changes };
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch {
        // Storage may be unavailable in some browser modes.
      }
      if (!wantsPlayback()) {
        ++attempt;
        const canFade = playback === "playing" && !document.hidden;
        report("idle");
        if (canFade) fade(0, () => audio.pause());
        else {
          cancelAnimationFrame(frame);
          setLevel(0);
          audio.pause();
        }
      } else if (!wasWanted) {
        start(true);
      } else {
        report();
        if (playback === "playing") fade(target());
        else if (playback === "blocked") start(true);
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("click", gesture, true);
      audio.removeEventListener("pause", interrupted);
      audio.removeEventListener("error", failed);
      audio.pause();
      void context?.suspend().catch(() => {});
    },
  };
}
