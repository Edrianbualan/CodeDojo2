import assert from "node:assert/strict";
import { test } from "node:test";
import { connectRadio } from "../lib/dojo-radio.ts";

function fixture(t, { blocked = false, saved, fixedVolume = false } = {}) {
  const key = "codedojo.dojo-radio.v1";
  const storage = new Map(saved ? [[key, JSON.stringify(saved)]] : []);
  const listeners = new Map();
  const frames = new Map();
  let id = 0;
  let state;
  let playCalls = 0;
  const audio = Object.assign(new EventTarget(), {
    volume: 1,
    paused: true,
    async play() {
      playCalls++;
      if (blocked)
        throw new DOMException("User gesture required", "NotAllowedError");
      this.paused = false;
    },
    pause() {
      this.paused = true;
    },
  });
  const gain = { gain: { value: 1 }, connect() {} };
  if (fixedVolume) {
    Object.defineProperty(audio, "volume", { get: () => 1, set() {} });
  }
  const browser = {
    localStorage: {
      getItem: storage.get.bind(storage),
      setItem: storage.set.bind(storage),
    },
    document: {
      hidden: false,
      addEventListener: (type, handler) => listeners.set(type, handler),
      removeEventListener: (type) => listeners.delete(type),
    },
    Element: class {},
    AudioContext: class {
      state = "suspended";
      createGain() {
        return gain;
      }
      createMediaElementSource() {
        return { connect() {} };
      }
      async resume() {
        this.state = "running";
      }
      async suspend() {
        this.state = "suspended";
      }
    },
    requestAnimationFrame: (step) => {
      frames.set(++id, step);
      return id;
    },
    cancelAnimationFrame: (frame) => frames.delete(frame),
  };
  const previous = Object.fromEntries(
    Object.keys(browser).map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ]),
  );
  for (const [name, value] of Object.entries(browser)) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  const connection = connectRadio(audio, (next) => {
    state = next;
  });
  t.after(() => {
    connection.dispose();
    for (const [name, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  return {
    audio,
    gain,
    connection,
    saved: () => JSON.parse(storage.get(key)),
    state: () => state,
    calls: () => playCalls,
    gesture(isTrusted) {
      if (isTrusted) blocked = false;
      listeners.get("click")({ isTrusted });
    },
    flushFade() {
      const active = [...frames.values()];
      frames.clear();
      for (const step of active) step(performance.now() + 600);
    },
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test("Dojo Radio controls output gain when media volume is read-only", async (t) => {
  const radio = fixture(t, { fixedVolume: true });
  assert.equal(radio.calls(), 0);
  assert.equal(radio.state().playback, "blocked");
  radio.gesture(true);
  await settle();
  radio.flushFade();
  assert.equal(radio.audio.volume, 1);
  assert.equal(radio.gain.gain.value, 0.15);
  radio.connection.update({ muted: true });
  radio.flushFade();
  assert.equal(radio.gain.gain.value, 0);
});

test("Dojo Radio automatically plays at 15% with a fade when permitted", async (t) => {
  const radio = fixture(t);
  await settle();
  assert.equal(radio.state().playback, "playing");
  assert.equal(radio.audio.volume, 0);
  radio.flushFade();
  assert.equal(radio.audio.volume, 0.15);
  radio.gesture(true);
  assert.equal(radio.calls(), 1);
});

test("Dojo Radio retries blocked autoplay after the first trusted click", async (t) => {
  const radio = fixture(t, { blocked: true });
  await settle();
  assert.equal(radio.state().playback, "blocked");
  radio.gesture(false);
  assert.equal(radio.calls(), 1);
  radio.gesture(true);
  await settle();
  assert.equal(radio.state().playback, "playing");
  assert.equal(radio.calls(), 2);
});

test("Dojo Radio restores saved disabled, mute, and volume settings", async (t) => {
  const radio = fixture(t, {
    saved: { enabled: false, muted: true, volume: 0.35 },
  });
  radio.gesture(true);
  assert.equal(radio.calls(), 0);
  assert.equal(radio.state().enabled, false);
  radio.connection.update({ enabled: true });
  await settle();
  radio.flushFade();
  assert.equal(radio.audio.volume, 0);
  radio.connection.update({ muted: false });
  radio.flushFade();
  assert.equal(radio.audio.volume, 0.35);
  assert.deepEqual(radio.saved(), {
    enabled: true,
    paused: false,
    muted: false,
    volume: 0.35,
  });
});

test("Dojo Radio fades out on pause and stays paused on other interactions", async (t) => {
  const radio = fixture(t);
  await settle();
  radio.flushFade();
  radio.connection.update({ paused: true });
  assert.equal(radio.audio.paused, false);
  radio.flushFade();
  assert.equal(radio.audio.paused, true);
  assert.equal(radio.saved().paused, true);
  radio.gesture(true);
  assert.equal(radio.calls(), 1);
  radio.connection.update({ paused: false });
  await settle();
  assert.equal(radio.audio.paused, false);
  assert.equal(radio.calls(), 2);
});
