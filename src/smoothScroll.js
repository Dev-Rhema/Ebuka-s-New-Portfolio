import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./animation";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Null when the visitor prefers reduced motion; the page then scrolls natively.
export const lenis = reduceMotion.matches
  ? null
  : new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      anchors: true,
      autoRaf: false,
    });

if (lenis) {
  // GSAP's ticker drives Lenis, so ScrollTrigger reads the smoothed position on the same frame.
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
}
