import { useEffect, useRef, useState } from "react";
import {
  gsap,
  revealButton,
  revealOnScroll,
  splitLines,
  useGSAP,
} from "./animation";
import Spiral from "./components/Spiral";
import { Naira, Plus } from "./components/StatSymbols";
import {
  StatsData,
  aboutBrands,
  aboutIconCircle,
  aboutIconShadow,
} from "./Data";
import { callButton, sectionHeading, sectionLabel } from "./styles";

// The layers share the 504px artboard so they register exactly. The drop
// shadows are pre-rendered: as live SVG filters they re-rasterize whenever
// the icon scales.
const iconLayer =
  "pointer-events-none absolute -top-4 -left-185.5 size-403.25 max-w-none md:-top-5 md:-left-232 md:size-504";

function ShadowIcon({ cycle, children, className = "" }) {
  return (
    <span
      data-cycle={cycle}
      className={`about-icon relative -my-6 inline-block size-32 align-1 md:my-0 md:size-40 md:align-baseline ${className}`}
    >
      <img loading="lazy" src={aboutIconShadow} alt="" className={iconLayer} />
      <img loading="lazy" src={aboutIconCircle} alt="" className={iconLayer} />
      <svg viewBox="0 0 504 504" fill="#F7F7F7" className={iconLayer}>
        {children}
      </svg>
    </span>
  );
}

function ChartGlyph() {
  return (
    <>
      <path
        opacity="0.4"
        d="M258.25 31.5H247.75C246.233 31.5 245 30.2666 245 28.75V18.75C245 18.3359 245.336 18 245.75 18C246.164 18 246.5 18.3359 246.5 18.75V28.75C246.5 29.4395 247.061 30 247.75 30H258.25C258.664 30 259 30.3359 259 30.75C259 31.1641 258.664 31.5 258.25 31.5Z"
      />
      <path
        className="about-bar-tall"
        d="M256 19.5H254.5C253.948 19.5 253.5 19.9477 253.5 20.5V27C253.5 27.5523 253.948 28 254.5 28H256C256.552 28 257 27.5523 257 27V20.5C257 19.9477 256.552 19.5 256 19.5Z"
      />
      <path
        className="about-bar-short"
        d="M251 23H249.5C248.948 23 248.5 23.4477 248.5 24V27C248.5 27.5523 248.948 28 249.5 28H251C251.552 28 252 27.5523 252 27V24C252 23.4477 251.552 23 251 23Z"
      />
    </>
  );
}

function TargetGlyph() {
  return (
    <>
      <path
        fillOpacity="0.4"
        d="M244 25C244 20.5817 247.582 17 252 17C256.418 17 260 20.5817 260 25C260 29.4183 256.418 33 252 33C247.582 33 244 29.4183 244 25Z"
      />
      <path
        className="about-ring"
        fillRule="evenodd"
        d="M246.25 25C246.25 21.8244 248.825 19.25 252 19.25C255.175 19.25 257.75 21.8244 257.75 25C257.75 28.1756 255.175 30.75 252 30.75C248.825 30.75 246.25 28.1756 246.25 25ZM252 20.75C249.653 20.75 247.75 22.6528 247.75 25C247.75 27.3472 249.653 29.25 252 29.25C254.347 29.25 256.25 27.3472 256.25 25C256.25 22.6528 254.347 20.75 252 20.75Z"
      />
      <path
        className="about-dot"
        d="M250 25C250 23.8952 250.896 23 252 23C253.104 23 254 23.8952 254 25C254 26.1048 253.104 27 252 27C250.896 27 250 26.1048 250 25Z"
      />
    </>
  );
}

// One 2s pass of each icon's hover loop.
const hoverCycles = {
  chart: (tl, icon) => {
    const short = icon.querySelector(".about-bar-short");
    const tall = icon.querySelector(".about-bar-tall");
    gsap.set([short, tall], { transformOrigin: "50% 100%" });
    return tl
      .to(short, { scaleY: 0.3, duration: 0.5 }, 0)
      .to(short, { scaleY: 1, duration: 0.5 }, 0.5)
      .to(tall, { scaleY: 0.3, duration: 0.61 }, 0)
      .to(tall, { scaleY: 1, duration: 0.61 }, 0.61);
  },
  target: (tl, icon) => {
    const dot = icon.querySelector(".about-dot");
    const ring = icon.querySelector(".about-ring");
    gsap.set([dot, ring], { transformOrigin: "50% 50%" });
    return tl
      .to(dot, { scale: 1.5, duration: 0.6 }, 0)
      .to(dot, { scale: 1, duration: 0.4 }, 1.2)
      .to(ring, { scale: 1.5, duration: 0.74 }, 0)
      .to(ring, { scale: 1, duration: 0.49 }, 1.48);
  },
};

function useMedia(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function About({ play }) {
  const container = useRef(null);
  const isMobile = !useMedia("(min-width: 768px)");
  const isDesktop = useMedia("(min-width: 1280px)");
  const isTablet = !isMobile && !isDesktop;

  useGSAP(
    () => {
      gsap.set(".about-label, .about-text, .trusted-block, .trusted-stats", {
        autoAlpha: 0,
      });
    },
    { scope: container },
  );

  useGSAP(
    (_, contextSafe) => {
      if (!play) return;

      let overlays = [];
      const listeners = [];

      // Hovering loops the icon's cycle; leaving lets the current pass finish.
      // Bound after the reveal because reverting the split rebuilds the nodes.
      const bindHovers = contextSafe(() => {
        const icons = gsap.utils.toArray("[data-cycle]", container.current);
        icons.forEach((icon) => {
          let hovered = false;
          const cycle = gsap.timeline({
            paused: true,
            defaults: { ease: "logoMove" },
            onComplete: () => hovered && cycle.restart(),
          });
          hoverCycles[icon.dataset.cycle](cycle, icon).set({}, {}, 2);

          const enter = () => {
            hovered = true;
            if (!cycle.isActive()) cycle.restart();
          };
          const leave = () => {
            hovered = false;
          };
          icon.addEventListener("mouseenter", enter);
          icon.addEventListener("mouseleave", leave);
          listeners.push(() => {
            icon.removeEventListener("mouseenter", enter);
            icon.removeEventListener("mouseleave", leave);
          });
        });
      });

      const section = container.current;
      const text = section.querySelector(".about-text");

      revealOnScroll(text, (tl) => {
        const label = splitLines(".about-label");
        const lines = splitLines(text);

        // Icons scale in place on overlays so the line masks don't clip
        // their shadows; the originals return once the lines are reverted.
        const origin = section.getBoundingClientRect();
        const icons = gsap.utils.toArray(".about-icon", section);
        overlays = icons.map((icon) => {
          const { left, top, width, height } = icon.getBoundingClientRect();
          const overlay = icon.cloneNode(true);
          Object.assign(overlay.style, {
            position: "absolute",
            left: `${left - origin.left}px`,
            top: `${top - origin.top}px`,
            width: `${width}px`,
            height: `${height}px`,
            margin: 0,
            pointerEvents: "none",
            // Keeps Chrome from re-rasterizing the filtered shadow SVGs at
            // every scale step.
            willChange: "transform",
          });
          return overlay;
        });
        text.after(...overlays);

        const brands = overlays.filter((el) => el.matches(".about-brand"));
        const others = overlays.filter((el) => !el.matches(".about-brand"));

        tl.set(icons, { visibility: "hidden" }, 0)
          .set(".about-label", { autoAlpha: 1 }, 0)
          .from(label.lines, { yPercent: 100 }, 0)
          .from(lines.lines, { yPercent: 100, stagger: 0.1 }, 0.1)
          .from(others, { scale: 0 }, 0)
          .from(brands, { scale: 0, stagger: 0.1 }, 0);

        return (finished) => {
          label.revert();
          lines.revert();
          overlays.forEach((el) => el.remove());
          if (finished) bindHovers();
        };
      });

      const find = (selector) => container.current.querySelector(selector);

      revealOnScroll(find(".trusted-block"), (tl) => {
        const label = splitLines(".trusted-label");
        const heading = splitLines(".trusted-heading");
        const copy = splitLines(".trusted-copy");

        tl.from(label.lines, { yPercent: 100 }, 0)
          .from(heading.lines, { yPercent: 100, stagger: 0.1 }, 0.1)
          .from(copy.lines, { yPercent: 100, stagger: 0.1 }, 0.3);
        revealButton(tl, find(".trusted-button"), 0.6);

        return () => [label, heading, copy].forEach((split) => split.revert());
      });

      revealOnScroll(find(".trusted-stats"), (tl) => {
        const masks = gsap.utils.toArray(
          ".trusted-value-mask",
          container.current,
        );
        const labels = splitLines(".trusted-stat-label");
        // Clips only the bottom edge so the values' glyphs can overflow
        // their tight line boxes.
        gsap.set(masks, { clipPath: "inset(-50% -50% 0% -50%)" });

        gsap.utils
          .toArray(".trusted-stat", container.current)
          .forEach((row, i) => {
            const value = row.querySelector(".trusted-value");
            tl.from(value, { yPercent: 100 }, i * 0.1);
            tl.from(
              labels.lines.filter((line) => row.contains(line)),
              { yPercent: 100, stagger: 0.1 },
              i * 0.1 + 0.1,
            );
          });
        tl.from(
          ".trusted-divider",
          { scaleX: 0, transformOrigin: "right", stagger: 0.2 },
          0,
        );

        return () => {
          labels.revert();
          gsap.set(masks, { clearProps: "clipPath" });
        };
      });

      return () => {
        overlays.forEach((el) => el.remove());
        listeners.forEach((unbind) => unbind());
      };
    },
    { dependencies: [play], scope: container },
  );

  return (
    <section
      ref={container}
      className="relative flex flex-col overflow-x-clip bg-white px-24 unit-440 md:block md:px-[3.125vw] xl:px-[5.556vw] md:unit-1440"
    >
      <p
        className={`about-label mt-34 md:absolute md:top-59 md:left-[3.125vw] xl:left-[5.556vw] md:mt-0 ${sectionLabel}`}
      >
        About me
      </p>

      <p className="about-text -mr-4 pt-12.5 font-['DM-Serif'] text-28 leading-33 tracking-[-0.01em] [word-spacing:-0.03em] text-[#838383] md:mr-0 md:py-56 md:text-55 md:leading-53.5">
        <span className="hidden md:inline-block md:w-101.5" />
        With over{" "}
        <span className="text-black">
          7 years
          <Plus className="inline-block align-[0.08em]" /> of experience
        </span>{" "}
        <span className="block md:hidden" />
        I have helped brands{" "}
        <span
          role="img"
          aria-label="piggyvest, SendSprint and Lenco"
          className="-my-6 -mr-2.5 -ml-1.5 inline-block align-4 md:my-0 md:-mr-5 md:-ml-3 md:-align-3"
        >
          {aboutBrands.map((src) => (
            <img
              key={src}
              loading="lazy"
              src={src}
              alt=""
              className="about-icon about-brand float-left size-32 not-first:-ml-9.75 md:size-46 md:not-first:-ml-14"
            />
          ))}
        </span>{" "}
        <span className="block md:hidden" />
        grow by using <span className="text-black">data</span>{" "}
        <ShadowIcon cycle="chart" className="ml-3 md:-mx-1">
          <ChartGlyph />
        </ShadowIcon>{" "}
        to make <span className="block md:hidden" />
        campaign decisions{" "}
        <ShadowIcon cycle="target" className="ml-1 md:-mr-2 md:ml-0">
          <TargetGlyph />
        </ShadowIcon>{" "}
        that <span className="block md:hidden" />
        significantly impacts{" "}
        <span className="text-black">revenue</span>
      </p>

      <div className="order-last -mx-24 h-500 mask-[linear-gradient(transparent,black_18%,black_82%,transparent)] md:absolute md:top-301 md:left-469 md:mx-0 md:h-view md:w-581">
        <Spiral
          viewHeight={isMobile ? 906 : 900}
          radius={isTablet ? 270 : 300}
          cardWidth={200}
          cardHeight={280}
        />
      </div>

      <div className="mt-48 flex flex-col items-center md:mt-64 md:min-h-view md:flex-row md:items-start md:justify-between">
        <div className="trusted-block flex flex-col items-center text-center md:block md:w-360 md:text-left">
          <p className={`trusted-label mt-4 ${sectionLabel}`}>
            Trusted by incredible companies
          </p>
          <h2 className={`trusted-heading mt-10 ${sectionHeading}`}>
            Making good brands great with data
          </h2>
          <p className="trusted-copy mt-16.5 font-['Geist'] text-16 leading-19 font-medium tracking-[-0.04em] text-[#838383] md:mt-14 md:text-20 md:leading-[1.3]">
            The difference between good and great is in the marketing. Let us
            make your brand great together
          </p>
          <a
            href="#contact"
            className={`trusted-button mt-15.5 md:mt-18 ${callButton}`}
          >
            <span className="block">Book a Call</span>
          </a>
        </div>

        <ul className="trusted-stats mt-16 w-200 md:mt-0 md:mb-56 md:w-289 md:self-end">
          {StatsData.map((stat, index) => (
            <li
              key={stat.label}
              className="trusted-stat relative flex h-129 flex-col items-center pt-31.5 md:h-120 md:pt-36.5 md:flex-row md:items-start"
            >
              <span className="trusted-value-mask">
                <span className="trusted-value flex justify-center font-['DM-Serif'] text-48 leading-[0.75] tracking-[-0.02em] whitespace-nowrap text-black md:w-136 md:justify-end md:text-64">
                  {stat.naira && <Naira />}
                  {stat.value}
                  <Plus />
                </span>
              </span>
              <span className="trusted-stat-label mt-22.5 font-['Geist'] text-18 leading-26 font-medium tracking-[-0.04em] text-[#838383] md:-mt-1.5 md:ml-12 md:w-141 md:text-20">
                {stat.label}
              </span>
              {index < StatsData.length - 1 && (
                <span className="trusted-divider absolute inset-x-0 bottom-0 h-px bg-[repeating-linear-gradient(to_right,#d7d7d7_0_2px,transparent_2px_3px)]" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default About;
