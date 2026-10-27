import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  gsap,
  revealButton,
  revealOnScroll,
  ScrollTrigger,
  splitLines,
  useGSAP,
} from "../animation";
import { ChatLink } from "../Data";
import Footer from "../Footer";
import { skipNextLoader } from "../skipLoader";
import { callButton } from "../styles";
import VideoPlayer from "./VideoPlayer";

const label =
  "font-['Geist'] text-14 leading-none font-medium tracking-[-0.04em] text-[#838383] uppercase";

function Header() {
  return (
    <header className="flex items-start justify-between pt-32">
      <a href="/" aria-label="Home" className="md:mt-2.5">
        <img
          src="/logo.svg"
          alt=""
          className="h-34.5 w-auto invert md:h-44 md:w-40"
        />
      </a>
      <nav className="flex font-['Geist'] font-medium">
        <a
          href={ChatLink}
          target="_blank"
          rel="noreferrer"
          className="flex h-32 items-center gap-12 bg-black pr-16 pl-14 text-14 tracking-[-0.04em] text-white md:h-46 md:px-18 md:text-16"
        >
          <span data-roll>Let’s Chat</span>
          <svg viewBox="0 0 12 12" className="size-10 md:size-11" fill="none">
            <path
              d="M1 11 11 1M3 1h8v8"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </a>
      </nav>
    </header>
  );
}

function GoBack() {
  // Returns to wherever the visitor came from on this site, or to the home page.
  const back = (event) => {
    skipNextLoader();
    if (document.referrer.startsWith(location.origin) && history.length > 1) {
      event.preventDefault();
      history.back();
    }
  };

  return (
    <a
      href="/"
      onClick={back}
      className="mt-24 flex w-fit items-center gap-10 font-['Geist'] text-16 leading-none font-medium tracking-[-0.04em] text-[#404040] md:mt-26"
    >
      <svg viewBox="0 0 14 10" className="w-14" fill="none">
        <path d="M14 5H1M5 1 1 5l4 4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      Go Back
    </a>
  );
}

// 9:16, the shape of the videos, so they show whole instead of being trimmed to fit.
const videoFrame =
  "reveal-media aspect-9/16 w-full md:col-start-1 md:row-span-2 md:row-start-1";

// Placeholder card for questions whose video hasn't arrived yet.
function VideoThumb({ title, thumbnail }) {
  return (
    <div className={`relative overflow-hidden bg-black ${videoFrame}`}>
      <img
        loading="lazy"
        src={thumbnail}
        alt=""
        className="size-full object-cover"
      />
      {/* Hides the title baked into the placeholder thumbnail so each card shows its own. */}
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(#000_60%,transparent)]" />
      <p className="absolute top-12 left-8 font-['Geist'] text-12 leading-none font-medium tracking-[-0.02em] text-white">
        {title}
      </p>
    </div>
  );
}

function Questions({ questions }) {
  const container = useRef(null);
  const list = useRef(null);
  const marker = useRef(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);

  // One marker glides to the active question rather than each one fading in and out.
  const placeMarker = (animate) => {
    const link = list.current.children[activeRef.current]?.firstElementChild;
    // The nav is hidden on phones, where there is nothing to measure.
    if (!link?.offsetHeight) return;
    const y =
      link.offsetTop + (link.offsetHeight - marker.current.offsetHeight) / 2;
    gsap.to(marker.current, {
      y,
      duration: animate ? 0.6 : 0,
      ease: "expo.inOut",
      overwrite: true,
    });
  };

  useLayoutEffect(() => {
    const first = activeRef.current === active;
    activeRef.current = active;
    placeMarker(!first);
  }, [active]);

  // Breakpoints and the web font change where each label sits, so jump straight there.
  useEffect(() => {
    const observer = new ResizeObserver(() => placeMarker(false));
    observer.observe(list.current);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray("[data-question]", container.current);
      blocks.forEach((block, index) => {
        ScrollTrigger.create({
          trigger: block,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && setActive(index),
        });
      });
      // Above the first question nothing is active, so point back at it.
      ScrollTrigger.create({
        trigger: blocks[0],
        start: "top center",
        onLeaveBack: () => setActive(0),
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className="mt-24 md:mt-26 md:flex md:items-start">
      <nav
        aria-label="Questions"
        className="hidden md:sticky md:top-32 md:block md:w-[26%] md:shrink-0 md:pr-20 xl:w-400 xl:pr-0"
      >
        <p className={`flex items-center gap-8.5 ${label}`}>
          <span
            aria-hidden="true"
            className="flex size-17 items-center justify-center rounded-full bg-[#d9d9d9] text-11 font-semibold text-[#838383]"
          >
            ?
          </span>
          Questions
        </p>
        <div className="relative mt-1.5">
          <ol ref={list}>
            {questions.map((item, index) => (
              <li key={item.label}>
                <a
                  href={`#question-${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                  className={`block w-fit py-8 font-['Geist'] text-15 leading-18 font-medium xl:py-10.5 xl:text-16 xl:leading-none tracking-[-0.04em] transition-colors duration-300 ${
                    active === index
                      ? "text-[#404040]"
                      : "text-[#838383] hover:text-[#404040]"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
          <span
            ref={marker}
            aria-hidden="true"
            className="absolute top-0 -left-12 h-14 w-4 rounded-full bg-[#E5BB5C]"
          />
        </div>
      </nav>

      <div className="md:mt-24 md:flex-1">
        {questions.map((item, index) => (
          <article
            key={item.label}
            id={`question-${index + 1}`}
            data-question
            // Phones stack question, video, answer; wider screens put the video beside both.
            className="grid scroll-mt-24 content-start gap-16 not-last:mb-16 not-last:bg-dashes not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat not-last:pb-16 md:scroll-mt-56 md:grid-cols-[38%_1fr] md:grid-rows-[auto_1fr] md:gap-x-20 md:gap-y-0 md:not-last:mb-24 md:not-last:pb-24 xl:grid-cols-[calc(var(--u)*308)_1fr] xl:gap-x-24"
          >
            <h2
              data-split
              className="reveal-text font-['Geist'] text-20 leading-20 font-medium tracking-[-0.02em] text-black md:col-start-2 md:row-start-1 md:text-22 md:leading-24 xl:text-28 xl:leading-28"
            >
              {item.question}
            </h2>
            {item.video ? (
              <VideoPlayer
                title={item.label}
                src={item.video}
                poster={item.poster}
                duration={item.duration}
                className={videoFrame}
              />
            ) : (
              <VideoThumb title={item.label} thumbnail={item.thumbnail} />
            )}
            {item.answer.length > 0 && (
              <div className="reveal-text space-y-16 md:col-start-2 md:row-start-2 md:mt-16 md:space-y-20 xl:mt-20 xl:space-y-24">
                {item.answer.map((paragraph, i) => (
                  <p
                    key={i}
                    data-split
                    className="font-['Geist'] text-14 leading-18 font-medium tracking-[-0.04em] text-[#838383] md:text-16 md:leading-21 xl:text-20 xl:leading-26"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function NextCaseStudy({ study }) {
  return (
    <section className="mt-66 md:mt-90">
      <div className="next-intro">
        <p data-split className={label}>
          Next case study
        </p>
        <div className="mt-18 flex flex-col gap-24 md:mt-24 md:flex-row md:items-end md:justify-between">
          <h2
            data-split
            className="font-['Geist'] text-18 leading-18 font-medium tracking-[-0.02em] text-black md:max-w-840 md:text-28 md:leading-28 xl:text-32 xl:leading-32"
          >
            {study.headline}
          </h2>
          {/* The banner below is the link on mobile. */}
          <a
            href={study.link}
            className={`next-button shrink-0 max-md:hidden ${callButton}`}
          >
            <span data-roll className="block">
              Next Case Study
            </span>
          </a>
        </div>
      </div>
      <a
        href={study.link}
        aria-label={`${study.name} case study`}
        className="reveal-media mt-16 block md:mt-24"
      >
        <img
          loading="lazy"
          src={study.banner}
          alt=""
          className="h-160 w-full object-cover md:h-auto md:aspect-16/5"
        />
      </a>
    </section>
  );
}

// The home page's reveals: text lines rise out of their masks, media wipes in from the left.
const revealLines = (tl, block, at = 0) => {
  const targets = block.matches("[data-split]")
    ? [block]
    : gsap.utils.toArray("[data-split]", block);
  const splits = targets.map((target) => splitLines(target));
  const lines = splits.flatMap((split) => split.lines);
  tl.from(lines, { yPercent: 100, stagger: 0.1 }, at);
  return { lines, revert: () => splits.forEach((split) => split.revert()) };
};

function CaseStudyPage({ study, next }) {
  const container = useRef(null);
  // Lines are split by measured width, so wait for the font first. Only the page's
  // Geist text is split here; the footer's serif font can finish loading later.
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts
      .load("500 1em Geist")
      .catch(() => {})
      .then(() => setFontsReady(true));
  }, []);

  useGSAP(
    () => {
      gsap.set(".reveal-text, .reveal-media, .next-intro", { autoAlpha: 0 });
    },
    { scope: container },
  );

  useGSAP(
    () => {
      if (!fontsReady) return;
      const page = container.current;

      gsap.utils.toArray(".reveal-text", page).forEach((block) => {
        revealOnScroll(block, (tl) => revealLines(tl, block).revert);
      });

      gsap.utils.toArray(".reveal-media", page).forEach((media) => {
        revealOnScroll(media, (tl) => {
          tl.fromTo(
            media,
            { clipPath: "inset(0% 100% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "logoMove",
              clearProps: "clipPath",
            },
          );
        });
      });

      const nextIntro = page.querySelector(".next-intro");
      if (nextIntro) {
        revealOnScroll(nextIntro, (tl) => {
          const { lines, revert } = revealLines(tl, nextIntro);
          revealButton(
            tl,
            nextIntro.querySelector(".next-button"),
            0.1 + lines.length * 0.1,
          );
          return revert;
        });
      }
    },
    { dependencies: [fontsReady], scope: container },
  );

  return (
    <>
      <main
        ref={container}
        className="bg-white px-24 unit-440 md:px-40 md:unit-tablet xl:px-80 xl:unit-1440"
      >
        <Header />
        <GoBack />
        <h1
          data-split
          className="reveal-text mt-18 font-['Geist'] text-28 leading-28 font-medium tracking-[-0.02em] text-black md:mt-24 md:text-36 md:leading-36 xl:text-40 xl:leading-40"
        >
          {study.headline}
        </h1>
        <img
          src={study.banner}
          alt={`${study.name} banner`}
          fetchPriority="high"
          className="reveal-media mt-16 h-200 w-full object-cover md:mt-28 md:h-auto md:aspect-16/5"
        />
        <Questions questions={study.questions} />
        {next && <NextCaseStudy study={next} />}
      </main>
      <Footer play />
    </>
  );
}

export default CaseStudyPage;
