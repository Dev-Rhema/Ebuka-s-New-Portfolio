import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "./animation";
import About from "./About";
import CaseStudies from "./CaseStudies";
import Footer from "./Footer";
import Skills from "./Skills";
import {
  headerImgNoBg,
  piggyvestWordmark,
  faceRings,
  faceRingsMobile,
  faceRingsTablet,
  instagramThumb,
} from "./Data";
import { heroBackdrop } from "./styles";

const headline =
  "hero-line block font-['DM-Serif'] text-[calc(var(--u)*72)] leading-none tracking-[-0.02em] text-white md:text-[calc(var(--u)*100)] xl:text-[calc(var(--u)*152)]";

function MarqueeItems() {
  return Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="flex items-center">
      NEW INSTAGRAM POST
      <span className="mx-[0.75em] size-[0.333em] bg-white" />
    </span>
  ));
}

function Home({ play }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".hero-line", { yPercent: 100, autoAlpha: 0 });
      gsap.set(".hero-button", { scaleX: 0, transformOrigin: "right" });
      gsap.set(".hero-button-content", { autoAlpha: 0 });
      gsap.set(".hero-wordmark", { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(".hero-card", { clipPath: "inset(0% 0% 100% 100%)" });
      gsap.set(".hero-paragraph, .hero-rings", { autoAlpha: 0 });
    },
    { scope: container },
  );

  useGSAP(
    () => {
      if (!play) return;

      const paragraph = SplitText.create(".hero-paragraph", {
        type: "lines",
        mask: "lines",
      });
      gsap.set(".hero-paragraph", { autoAlpha: 1 });

      const [ebuka, subtitle, chidube] = gsap.utils.toArray(
        ".hero-line",
        container.current,
      );
      const [chat, menu] = gsap.utils.toArray(
        ".hero-button",
        container.current,
      );

      gsap
        .timeline({ defaults: { duration: 0.35, ease: "reveal" } })
        .fromTo(
          ".hero-rings",
          { scale: 0.3, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" },
          0.05,
        )
        .to(menu, { scaleX: 1, duration: 0.2 }, 0)
        .to(ebuka, { yPercent: 0, autoAlpha: 1 }, 0.05)
        .to(subtitle, { yPercent: 0, autoAlpha: 1 }, 0.3)
        .to(chidube, { yPercent: 0, autoAlpha: 1 }, 0.45)
        .fromTo(
          paragraph.lines,
          { yPercent: 100 },
          { yPercent: 0, stagger: 0.08 },
          0.55,
        )
        .to(
          ".hero-wordmark",
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.65,
            ease: "power1.inOut",
          },
          0.4,
        )
        .to(
          menu.querySelectorAll(".hero-button-content"),
          { autoAlpha: 1, duration: 0.2 },
          0.6,
        )
        .to(chat, { scaleX: 1, duration: 0.4 }, 0.65)
        .to(
          chat.querySelectorAll(".hero-button-content"),
          { autoAlpha: 1, duration: 0.2 },
          1.0,
        )
        .to(
          ".hero-card",
          {
            keyframes: [
              { clipPath: "inset(0% 0% 99% 0%)", duration: 0.25 },
              { clipPath: "inset(0% 0% 89% 0%)", duration: 0.15 },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45 },
            ],
            ease: "power2.inOut",
          },
          0.6,
        );
    },
    { dependencies: [play], scope: container },
  );

  return (
    <main ref={container}>
      <section className="relative h-[calc(var(--u)*510)] overflow-hidden [--u:calc(100vw/440)] md:h-[calc(var(--u)*640)] md:[--u:calc(100vw/1024)] xl:h-[min(100vh,62.5vw)] xl:[--s:var(--u)] xl:[--u:min(calc(100vw/1440),calc(100vh/900))]">
        <div className={`absolute inset-0 ${heroBackdrop}`} />

        <div className="absolute inset-0 flex items-start justify-center xl:items-center">
          <div
            className={`relative mt-[calc(var(--u)*93)] aspect-147/119 w-[calc(var(--u)*515)] shrink-0 md:mt-[calc(var(--u)*28)] md:w-[calc(var(--u)*1016)] xl:mt-0 xl:w-[calc(var(--u)*900*147/119)] xl:overflow-hidden max-md:bg-none ${heroBackdrop}`}
          >
            <img
              src={headerImgNoBg}
              alt="Ebuka Chidube"
              className="h-full w-full origin-top object-cover xl:transform-[translate(0px,calc(var(--u)*60))_scale(1.1)]"
            />
            <picture>
              <source media="(min-width: 1280px)" srcSet={faceRings} />
              <source media="(min-width: 768px)" srcSet={faceRingsTablet} />
              <img
                src={faceRingsMobile}
                alt=""
                className="hero-rings absolute top-[calc(var(--u)*129)] left-1/2 w-[calc(var(--u)*434)] -translate-1/2 md:top-[35.19%] md:w-[55.9%] xl:top-[49.28%] xl:w-[60.65%]"
              />
            </picture>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 h-[calc(var(--u)*32)] bg-linear-to-b from-transparent to-white md:z-0 md:h-[calc(var(--u)*66)] xl:h-[29.5%]" />

        <img
          src="/logo.svg"
          alt="Logo"
          className="absolute top-[calc(var(--u)*32.5)] left-[calc(var(--u)*24)] h-[calc(var(--u)*34.5)] w-auto md:top-[calc(var(--u)*35.5)] md:left-[calc(var(--u)*32)] md:h-[calc(var(--u)*36.6)] xl:top-[calc(var(--s)*34.5)] xl:left-[5.556vw] xl:h-[calc(var(--s)*44)] xl:w-[calc(var(--s)*40)]"
        />

        <nav className="absolute top-[calc(var(--u)*32)] right-[calc(var(--u)*24)] flex gap-[calc(var(--u)*16)] font-['Geist'] font-medium md:right-[calc(var(--u)*32)] xl:top-[calc(var(--s)*32)] xl:right-[5.556vw] xl:gap-[calc(var(--s)*16)]">
          <a
            href="#contact"
            className="hero-button flex h-[calc(var(--u)*32)] items-center gap-[calc(var(--u)*12)] bg-black pr-[calc(var(--u)*16)] pl-[calc(var(--u)*14)] text-[calc(var(--u)*14)] tracking-[-0.04em] text-white md:h-[calc(var(--u)*40)] md:gap-[calc(var(--u)*12.5)] md:pr-[calc(var(--u)*17.5)] md:pl-[calc(var(--u)*16)] md:text-[calc(var(--u)*16)] xl:h-[calc(var(--s)*46)] xl:gap-[calc(var(--s)*12)] xl:px-[calc(var(--s)*18)] xl:text-[calc(var(--s)*16)]"
          >
            <span className="hero-button-content">Let’s Chat</span>
            <svg
              viewBox="0 0 12 12"
              className="hero-button-content size-[calc(var(--u)*10)] md:size-[calc(var(--u)*11)] xl:size-[calc(var(--s)*11)]"
              fill="none"
            >
              <path
                d="M1 11 11 1M3 1h8v8"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </a>
          <button
            type="button"
            aria-label="Open menu"
            className="hero-button flex size-[calc(var(--u)*32)] flex-col items-center justify-center gap-[calc(var(--u)*4)] bg-black md:size-[calc(var(--u)*40)] md:gap-[calc(var(--u)*5)] xl:size-[calc(var(--s)*46)] xl:gap-[calc(var(--s)*7)]"
          >
            <span className="hero-button-content h-0.5 w-[calc(var(--u)*20)] bg-white md:w-[calc(var(--u)*24)] xl:h-[calc(var(--s)*2)] xl:w-[calc(var(--s)*24)]" />
            <span className="hero-button-content h-0.5 w-[calc(var(--u)*20)] bg-white md:w-[calc(var(--u)*24)] xl:h-[calc(var(--s)*2)] xl:w-[calc(var(--s)*24)]" />
            <span className="hero-button-content h-0.5 w-[calc(var(--u)*20)] bg-white md:w-[calc(var(--u)*24)] xl:h-[calc(var(--s)*2)] xl:w-[calc(var(--s)*24)]" />
          </button>
        </nav>

        <div className="absolute top-[calc(var(--u)*233.5)] left-[calc(var(--u)*24)] z-10 flex w-[calc(var(--u)*392)] flex-col text-white md:contents">
          <div className="contents md:absolute md:top-[calc(var(--u)*293)] md:left-[calc(var(--u)*32)] md:block xl:top-[calc(58.18%-var(--u)*156.87)] xl:left-[5.556vw]">
            <h1 className="order-1 overflow-hidden pt-[0.06em]">
              <span className={headline}>EBUKA</span>
            </h1>
            <p className="order-3 mt-[calc(var(--u)*5)] overflow-hidden font-['Geist'] text-[calc(var(--u)*22.5)] leading-[1.3] font-medium tracking-[-0.04em] md:mt-[calc(var(--u)*-7.3)] md:text-[calc(var(--u)*28.8)] xl:mt-[calc(-11.76*var(--u))] xl:text-[calc(var(--u)*48)]">
              <span className="hero-line flex items-center gap-[0.3em] md:gap-[calc(var(--u)*17.5)] xl:gap-[0.3em]">
                Senior Digital Marketer at
                <img
                  src={piggyvestWordmark}
                  alt="piggyvest"
                  className="hero-wordmark h-[0.9em] w-auto md:h-[calc(var(--u)*32)] xl:h-[0.9em]"
                />
              </span>
            </p>
          </div>

          <p className="hero-paragraph order-4 mt-[calc(var(--u)*14)] font-['Geist'] text-[calc(var(--u)*18)] leading-[calc(var(--u)*22)] font-light tracking-[-0.04em] text-white md:absolute md:top-[calc(var(--u)*458.5)] md:left-[calc(var(--u)*32)] md:mt-0 md:max-w-[calc(var(--u)*540)] md:text-[calc(var(--u)*24)] md:leading-[calc(var(--u)*29)] xl:top-[calc(58.18%+var(--u)*180.23)] xl:left-[5.556vw] xl:max-w-[25.5em] xl:text-[calc(var(--u)*28)] xl:leading-[1.29] xl:font-medium">
            I am a commercially minded performance marketer who understands how
            to turn marketing spend into customer acquisition and revenue
          </p>

          <div className="order-2 mt-[calc(var(--u)*-25.5)] overflow-hidden pt-[0.06em] md:absolute md:top-[calc(var(--u)*453.7)] md:right-[calc(var(--u)*32)] md:mt-0 xl:top-[calc(58.18%+var(--u)*185.73)] xl:right-[5.556vw]">
            <span
              className={`${headline} bg-linear-to-b from-[#f3f3f3] to-white bg-clip-text pr-[0.02em] text-transparent`}
            >
              CHIDUBE
            </span>
          </div>
        </div>

        <a
          href="https://www.instagram.com/reel/DeG7wJBKnIr/"
          target="_blank"
          rel="noreferrer"
          aria-label="Watch the latest Instagram reel"
          className="hero-card absolute top-[calc(var(--u)*141)] right-[calc(var(--u)*32)] hidden w-[14.5em] bg-black px-[0.5em] pb-[0.5em] text-[calc(var(--u)*16)] md:block xl:top-[calc(58.18%-var(--u)*157.67)] xl:right-[5.556vw]"
        >
          <div className="h-[2.667em] overflow-hidden pt-[0.417em] font-['Geist'] text-[0.75em] leading-none font-medium whitespace-nowrap text-white">
            <div className="flex w-max animate-marquee">
              <MarqueeItems />
              <MarqueeItems />
            </div>
          </div>
          <div className="relative aspect-216/278 overflow-hidden">
            <img
              src={instagramThumb}
              alt="Latest Instagram post"
              className="h-full w-full object-cover"
            />
            <span className="absolute top-1/2 left-1/2 flex size-[3.5625em] -translate-1/2 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 22 26" className="ml-[0.25em] w-[1.375em]">
                <path
                  d="M3 2.5v21l17-10.5z"
                  fill="black"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </a>
      </section>

      <About />
      <CaseStudies />
      <Skills />
      <Footer />
    </main>
  );
}

export default Home;
