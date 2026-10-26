import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./animation";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!reduceMotion.matches) {
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9,
    anchors: true,
    autoRaf: false,
  });

  // GSAP's ticker drives Lenis, so ScrollTrigger reads the smoothed position on the same frame.
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
}
