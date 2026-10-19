import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase, SplitText);

gsap.ticker.lagSmoothing(250, 33);

CustomEase.create("reveal", "M0,0 C0.35,0 0,1 1,1");

CustomEase.create(
  "jump",
  "M0,0 C0.2,0.03 0.38,0.12 0.46,0.3 C0.5,0.42 0.5,0.7 0.56,0.8 C0.66,0.93 0.8,0.98 1,1",
);

CustomEase.create("logoMove", "M0,0 C0.99,0.18 0.08,0.82 1,1");

export { gsap, SplitText, useGSAP };
