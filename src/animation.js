// GSAP setup shared by the loader and the hero
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase, SplitText);

// Play in real time through ordinary slow frames, but when the browser
// freezes (≥250ms, e.g. while the page is still being built, or the tab was
// hidden) carry on from where it was instead of jumping ahead unseen
gsap.ticker.lagSmoothing(250, 33);

// Logo and text reveal: cubic-bezier(0.35, 0, 0, 1)
CustomEase.create("reveal", "M0,0 C0.35,0 0,1 1,1");

// Slow start, quick jump, long settle
CustomEase.create(
  "jump",
  "M0,0 C0.2,0.03 0.38,0.12 0.46,0.3 C0.5,0.42 0.5,0.7 0.56,0.8 C0.66,0.93 0.8,0.98 1,1",
);

// Logo slide to corner: cubic-bezier(0.99, 0.18, 0.08, 0.82)
CustomEase.create("logoMove", "M0,0 C0.99,0.18 0.08,0.82 1,1");

export { gsap, SplitText, useGSAP };
