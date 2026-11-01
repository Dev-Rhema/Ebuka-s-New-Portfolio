import { useSyncExternalStore } from "react";

const STORAGE_KEY = "low-power";
const SLOW_FRAME_MS = 28; // about 35fps, sustained
const WINDOW_MS = 2000;
const SLOW_WINDOWS = 3;
const IGNORED_GAP_MS = 500; // a hidden tab or a one-off stall says nothing about the device
const SETTLE_MS = 6000; // every device is busy while the page loads, so that doesn't count

// Most 3D canvases fit comfortably; this only reins in very large screens.
const PIXEL_BUDGET = 2_500_000;
const LOW_POWER_PIXEL_BUDGET = 1_000_000;

// Canvases that animate every frame draw at about 30fps in low power mode.
export const LOW_POWER_FRAME_MS = 30;

// TVs pair a huge screen with a modest chip, however expensive the TV is.
const isTv = () => {
  const agent = navigator.userAgent;
  return (
    /smart-?tv|tizen|web0s|webos|hbbtv|googletv|android tv|appletv|bravia|viera|netcast|vidaa|roku|crkey/i.test(
      agent,
    ) || /\bAFT[A-Z]/.test(agent)
  );
};

// Storage can throw in private windows; low power then lasts for this page only.
const remembered = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const remember = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Nothing to do: the next page measures again.
  }
};

// Adding ?lowpower to the URL forces the mode, for testing.
let lowPower =
  isTv() ||
  remembered() ||
  new URLSearchParams(location.search).has("lowpower");

const listeners = new Set();

// Marks the page, so the mode can be spotted in the browser's dev tools.
const applyClass = () =>
  document.documentElement.classList.toggle("low-power", lowPower);

const enter = () => {
  lowPower = true;
  remember();
  applyClass();
  listeners.forEach((listener) => listener());
};

export const isLowPower = () => lowPower;

export const onLowPower = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLowPower = () => useSyncExternalStore(onLowPower, isLowPower);

// The device pixel ratio that keeps a canvas of this size within the pixel budget.
export const cappedPixelRatio = (width, height) => {
  const budget = lowPower ? LOW_POWER_PIXEL_BUDGET : PIXEL_BUDGET;
  return Math.min(
    window.devicePixelRatio,
    2,
    Math.sqrt(budget / Math.max(width * height, 1)),
  );
};

// A device that can't hold its frame rate joins low power mode, whatever it says it is.
const watchFrameRate = () => {
  let previous = performance.now();
  let elapsed = 0;
  let frames = 0;
  let slowWindows = 0;

  const tick = (now) => {
    const gap = now - previous;
    previous = now;
    if (gap < IGNORED_GAP_MS) {
      elapsed += gap;
      frames++;
    }
    if (elapsed >= WINDOW_MS) {
      slowWindows = elapsed / frames > SLOW_FRAME_MS ? slowWindows + 1 : 0;
      elapsed = 0;
      frames = 0;
      if (slowWindows >= SLOW_WINDOWS) return enter();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

applyClass();
if (!lowPower) {
  const watchAfterLoad = () => setTimeout(watchFrameRate, SETTLE_MS);
  if (document.readyState === "complete") watchAfterLoad();
  else window.addEventListener("load", watchAfterLoad, { once: true });
}
