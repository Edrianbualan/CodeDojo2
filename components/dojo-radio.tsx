"use client";

import { useEffect, useRef, useState } from "react";
import { connectRadio, defaultRadio, type RadioState } from "../lib/dojo-radio";
import styles from "./dojo-radio.module.css";

export function DojoRadioProvider() {
  const audio = useRef<HTMLAudioElement>(null);
  const dock = useRef<HTMLElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const controller = useRef<ReturnType<typeof connectRadio>>(null);
  const [radio, setRadio] = useState<RadioState>({
    ...defaultRadio,
    playback: "idle",
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!audio.current) return;
    const connection = connectRadio(audio.current, setRadio);
    controller.current = connection;
    return () => {
      controller.current = null;
      connection.dispose();
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !dock.current?.contains(event.target)
      ) {
        setExpanded(false);
      }
    }
    function escape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        dock.current?.contains(document.activeElement)
      ) {
        setExpanded(false);
        disclosure.current?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded]);

  const playing = radio.playback === "playing";
  const active = playing || radio.playback === "loading";
  const playLabel = active ? "Pause music" : "Play music";

  function togglePlayback() {
    if (active) controller.current?.update({ paused: true });
    else if (!radio.enabled || radio.paused) {
      controller.current?.update({ enabled: true, paused: false });
    } else controller.current?.start(true);
  }

  return (
    <aside className={styles.dock} aria-label="Dojo Radio" ref={dock}>
      <audio
        ref={audio}
        src="/audio/background.mp3"
        preload="none"
        loop
        hidden
      />
      <div className={styles.bar}>
        <button
          ref={disclosure}
          type="button"
          className={styles.disclosure}
          aria-expanded={expanded}
          aria-controls="dojo-radio-controls"
          title={expanded ? "Minimize Dojo Radio" : "Expand Dojo Radio"}
          onClick={() => setExpanded(!expanded)}
        >
          <span
            className={styles.meter}
            data-playing={playing && !radio.muted && radio.volume > 0}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </span>
          Dojo Radio
          <span className={styles.chevron} aria-hidden="true">
            {expanded ? "−" : "+"}
          </span>
        </button>
        <button
          type="button"
          className={styles.play}
          onClick={togglePlayback}
          data-radio-playback
          aria-label={playLabel}
          title={playLabel}
        >
          <span
            className={active ? styles.pauseIcon : styles.playIcon}
            aria-hidden="true"
          />
        </button>
      </div>
      <div id="dojo-radio-controls" className={styles.panel} hidden={!expanded}>
        <div className={styles.track}>Background</div>
        {radio.playback === "error" && (
          <p role="status">Track unavailable. Press Play to retry.</p>
        )}
        {radio.playback === "blocked" && (
          <p role="status">Press Play to start the soundtrack.</p>
        )}
        <div className={styles.options}>
          <button
            type="button"
            className={styles.option}
            aria-pressed={radio.muted}
            onClick={() => controller.current?.update({ muted: !radio.muted })}
          >
            {radio.muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            className={styles.option}
            role="switch"
            aria-checked={radio.enabled}
            data-radio-playback
            aria-label="Background music"
            onClick={() =>
              controller.current?.update({
                enabled: !radio.enabled,
                paused: false,
              })
            }
          >
            Music {radio.enabled ? "on" : "off"}
          </button>
        </div>
        <label className={styles.volume}>
          <span>Volume</span>
          <span aria-hidden="true">{Math.round(radio.volume * 100)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(radio.volume * 100)}
            aria-valuetext={`${Math.round(radio.volume * 100)}%`}
            onChange={(event) =>
              controller.current?.update({
                volume: event.currentTarget.valueAsNumber / 100,
              })
            }
          />
        </label>
      </div>
    </aside>
  );
}
