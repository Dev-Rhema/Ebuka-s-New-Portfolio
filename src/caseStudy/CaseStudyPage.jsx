import { useEffect, useRef, useState } from "react";
import {
  gsap,
  revealButton,
  revealOnScroll,
  ScrollTrigger,
  splitLines,
  useGSAP,
} from "../animation";
import Footer from "../Footer";
import { callButton } from "../styles";

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
      <nav className="flex gap-16 font-['Geist'] font-medium">
        <a
          href="#contact"
          className="flex h-32 items-center gap-12 bg-black pr-16 pl-14 text-14 tracking-[-0.04em] text-white md:h-46 md:px-18 md:text-16"
        >
          Let’s Chat
          <svg viewBox="0 0 12 12" className="size-10 md:size-11" fill="none">
            <path d="M1 11 11 1M3 1h8v8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-32 flex-col items-center justify-center gap-4 bg-black md:size-46 md:gap-7"
        >
          <span className="h-[2px] w-20 bg-white md:h-2 md:w-24" />
          <span className="h-[2px] w-20 bg-white md:h-2 md:w-24" />
          <span className="h-[2px] w-20 bg-white md:h-2 md:w-24" />
        </button>
      </nav>
    </header>
  );
}

function GoBack() {
  // Returns to wherever the visitor came from on this site, or to the home page.
  const back = (event) => {
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

function VideoThumb({ title, thumbnail }) {
  return (
    <div className="reveal-media relative h-282 w-full shrink-0 overflow-hidden bg-black md:h-484 md:w-308">
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
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.utils.toArray("[data-question]", container.current).forEach(
        (block, index) => {
          ScrollTrigger.create({
            trigger: block,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => self.isActive && setActive(index),
          });
        },
      );
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="mt-24 md:mt-26 md:flex md:items-start"
    >
      <nav
        aria-label="Questions"
        className="hidden md:sticky md:top-32 md:block md:w-400 md:shrink-0"
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
        <ol className="mt-1.5">
          {questions.map((item, index) => (
            <li key={item.label}>
              <a
                href={`#question-${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                className={`relative block w-fit py-10.5 font-['Geist'] text-16 leading-none font-medium tracking-[-0.04em] transition-colors duration-300 ${
                  active === index
                    ? "text-[#404040]"
                    : "text-[#838383] hover:text-[#404040]"
                }`}
              >
                <span
                  className={`absolute top-1/2 -left-12 h-14 w-4 -translate-y-1/2 rounded-full bg-[#E5BB5C] transition-opacity duration-300 ${
                    active === index ? "opacity-100" : "opacity-0"
                  }`}
                />
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="md:mt-24 md:flex-1">
        {questions.map((item, index) => (
          <article
            key={item.label}
            id={`question-${index + 1}`}
            data-question
            className="flex scroll-mt-24 flex-col gap-16 not-last:mb-16 not-last:bg-dashes not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat not-last:pb-16 md:scroll-mt-56 md:flex-row md:gap-24 md:not-last:mb-24 md:not-last:pb-24"
          >
            <VideoThumb title={item.label} thumbnail={item.thumbnail} />
            <div className="reveal-text md:flex-1">
              <h2
                data-split
                className="font-['Geist'] text-20 leading-20 font-medium tracking-[-0.02em] text-black md:text-28 md:leading-28"
              >
                {item.question}
              </h2>
              <div className="mt-16 space-y-16 md:mt-20 md:space-y-24">
                {item.answer.map((paragraph, i) => (
                  <p
                    key={i}
                    data-split
                    className="font-['Geist'] text-14 leading-18 font-medium tracking-[-0.04em] text-[#838383] md:text-20 md:leading-26"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
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
            className="font-['Geist'] text-18 leading-18 font-medium tracking-[-0.02em] text-black md:max-w-840 md:text-32 md:leading-32"
          >
            {study.headline}
          </h2>
          {/* The banner below is the link on mobile. */}
          <a
            href={study.link}
            className={`next-button shrink-0 max-md:hidden ${callButton}`}
          >
            <span className="block">Next Case Study</span>
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
  // Lines are split by measured width, so wait for the web fonts first.
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
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
        className="bg-white px-24 unit-440 md:px-80 md:unit-1440"
      >
        <Header />
        <GoBack />
        <h1
          data-split
          className="reveal-text mt-18 font-['Geist'] text-28 leading-28 font-medium tracking-[-0.02em] text-black md:mt-24 md:text-40 md:leading-40"
        >
          {study.headline}
        </h1>
        <img
          src={study.banner}
          alt={`${study.name} banner`}
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
