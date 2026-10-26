import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger, SplitText);

gsap.ticker.lagSmoothing(250, 33);

CustomEase.create("reveal", "M0,0 C0.35,0 0,1 1,1");

CustomEase.create(
  "jump",
  "M0,0 C0.2,0.03 0.38,0.12 0.46,0.3 C0.5,0.42 0.5,0.7 0.56,0.8 C0.66,0.93 0.8,0.98 1,1",
);

CustomEase.create("logoMove", "M0,0 C0.99,0.18 0.08,0.82 1,1");

CustomEase.create("heroText", "M0,0 C0.83,0.27 0.02,1 1,1");

CustomEase.create("textReveal", "M0,0 C0.23,0 0.02,1 1,1");

CustomEase.create("fadeInOut", "M0,0 C0.5,0 0.5,1 1,1");

const splitLines = (targets) => {
  const split = SplitText.create(targets, { type: "lines", mask: "lines" });
  gsap.set(split.masks, { paddingBottom: "0.12em", marginBottom: "-0.12em" });
  return split;
};

const revealOnScroll = (trigger, build) => {
  let prepared = null;

  const prepare = () => {
    if (prepared?.width === trigger.offsetWidth) return;
    if (prepared) {
      prepared.tl.revert();
      prepared.cleanup?.(false);
    }
    trigger.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decode().catch(() => {});
    });
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "textReveal" },
    });
    const cleanup = build(tl);
    tl.eventCallback("onComplete", () => cleanup?.(true));
    prepared = { tl, cleanup, width: trigger.offsetWidth };
  };

  ScrollTrigger.create({
    trigger,
    start: "top bottom+=100%",
    once: true,
    onEnter: prepare,
  });

  return ScrollTrigger.create({
    trigger,
    start: "top 80%",
    once: true,
    onEnter: () => {
      prepare();
      prepared.tl.play();
      gsap.set(trigger, { autoAlpha: 1 });
    },
  });
};

const wipeIn = (tl, button, at) =>
  tl.fromTo(
    button,
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "logoMove",
      clearProps: "clipPath",
    },
    at,
  );

const revealButton = (tl, button, at) =>
  wipeIn(tl, button, at).from(
    button.firstElementChild,
    { y: () => button.offsetHeight / 2, ease: "logoMove" },
    at + 0.1,
  );

// Buttons with a trailing arrow reveal like the hero's "Let's Chat": the label, then
// the arrow, each rising inside its own mask (the button's two child spans).
const revealArrowButton = (tl, button, at) => {
  const [label, arrow] = [...button.children].map(
    (mask) => mask.firstElementChild,
  );
  return wipeIn(tl, button, at)
    .from(label, { yPercent: 110, ease: "heroText" }, at + 0.38)
    .from(
      arrow,
      { yPercent: 110, duration: 0.58, ease: "heroText" },
      at + 1.42,
    );
};

export {
  gsap,
  revealArrowButton,
  revealButton,
  revealOnScroll,
  ScrollTrigger,
  splitLines,
  SplitText,
  useGSAP,
};
