import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../animation";
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
    <div className="relative mx-auto h-484 w-308 shrink-0 overflow-hidden bg-black md:mx-0">
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
      className="mt-40 md:mt-26 md:flex md:items-start"
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
            className="flex scroll-mt-24 flex-col gap-24 not-last:mb-24 not-last:bg-dashes not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat not-last:pb-24 md:scroll-mt-56 md:flex-row"
          >
            <VideoThumb title={item.label} thumbnail={item.thumbnail} />
            <div className="md:flex-1">
              <h2 className="font-['Geist'] text-24 leading-26 font-medium tracking-[-0.02em] text-black md:text-28 md:leading-28">
                {item.question}
              </h2>
              <div className="mt-20 space-y-24">
                {item.answer.map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-['Geist'] text-16 leading-20 font-medium tracking-[-0.04em] text-[#838383] md:text-20 md:leading-26"
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
    <section className="mt-80 md:mt-90">
      <p className={label}>Next case study</p>
      <div className="mt-24 flex flex-col gap-24 md:flex-row md:items-end md:justify-between">
        <h2 className="font-['Geist'] text-24 leading-26 font-medium tracking-[-0.02em] text-black md:max-w-840 md:text-32 md:leading-32">
          {study.headline}
        </h2>
        <a href={study.link} className={`shrink-0 ${callButton}`}>
          Next Case Study
        </a>
      </div>
      <a href={study.link} aria-label={`${study.name} case study`}>
        <img
          loading="lazy"
          src={study.banner}
          alt=""
          className="mt-24 aspect-16/5 w-full object-cover"
        />
      </a>
    </section>
  );
}

function CaseStudyPage({ study, next }) {
  return (
    <>
      <main className="bg-white px-24 unit-440 md:px-80 md:unit-1440">
        <Header />
        <GoBack />
        <h1 className="mt-24 font-['Geist'] text-28 leading-28 font-medium tracking-[-0.02em] text-black md:text-40 md:leading-40">
          {study.headline}
        </h1>
        <img
          src={study.banner}
          alt={`${study.name} banner`}
          className="mt-24 aspect-16/5 w-full object-cover md:mt-28"
        />
        <Questions questions={study.questions} />
        {next && <NextCaseStudy study={next} />}
      </main>
      <Footer play />
    </>
  );
}

export default CaseStudyPage;
