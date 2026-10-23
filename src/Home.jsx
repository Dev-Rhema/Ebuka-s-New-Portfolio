import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "./animation";
import About from "./About";
import CaseStudies from "./CaseStudies";
import Footer from "./Footer";
import FaceRings from "./components/FaceRings";
import Skills from "./Skills";
import { headerImgNoBg, piggyvestWordmark, instagramThumb } from "./Data";
import { heroBackdrop } from "./styles";

const headline =
  "hero-line block font-['DM-Serif'] text-72 leading-none tracking-[-0.02em] text-white md:text-100 xl:text-152";

function MarqueeItems() {
  return Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="flex items-center">
      NEW INSTAGRAM POST
      <span className="mx-[0.75em] size-[0.333em] bg-white" />
    </span>
  ));
}

function Home({ play, showLogo }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".hero-line", { yPercent: 100, autoAlpha: 0 });
      gsap.set(".hero-button, .hero-menu-line", {
        scaleX: 0,
        transformOrigin: "right",
      });
      gsap.set(".hero-chat-text, .hero-chat-arrow", { yPercent: 110 });
      gsap.set(".hero-wordmark", { clipPath: "inset(0% 81% 0% 0%)" });
      gsap.set(".hero-card", { clipPath: "inset(0% 0% 100% 0%)" });
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
      const rise = { yPercent: 0, autoAlpha: 1, duration: 1, ease: "heroText" };
      const bar = { scaleX: 1, ease: "logoMove" };

      gsap
        .timeline()
        .timeScale(0.85)
        .to(menu, { ...bar, duration: 1 }, 0)
        .fromTo(
          ".hero-rings",
          { scale: 0.05, autoAlpha: 1 },
          { scale: 1, duration: 0.6, ease: "logoMove" },
          0.2,
        )
        .to(ebuka, rise, 0)
        .to(subtitle, rise, 0.2)
        .to(chidube, rise, 0.4)
        .fromTo(
          paragraph.lines,
          { yPercent: 100 },
          { yPercent: 0, duration: 1, stagger: 0.1, ease: "heroText" },
          0.4,
        )
        .to(".hero-menu-line", { ...bar, duration: 1, stagger: 0.2 }, 0.6)
        .to(chat, { ...bar, duration: 1 }, 1)
        .to(
          ".hero-wordmark",
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "logoMove",
          },
          0.6,
        )
        .to(
          ".hero-card",
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "logoMove" },
          1.1,
        )
        .to(
          ".hero-chat-text",
          { yPercent: 0, duration: 1, ease: "heroText" },
          1.38,
        )
        .to(
          ".hero-chat-arrow",
          { yPercent: 0, duration: 0.58, ease: "heroText" },
          2.42,
        );
    },
    { dependencies: [play], scope: container },
  );

  return (
    <main ref={container}>
      <section className="relative h-510 overflow-hidden unit-440 md:h-640 md:unit-1024 xl:h-hero xl:unit-fit">
        <div className={`absolute inset-0 ${heroBackdrop}`} />

        <div className="absolute inset-0 flex items-start justify-center xl:items-center">
          <div
            className={`relative mt-93 aspect-147/119 w-515 shrink-0 md:mt-28 md:w-1016 xl:mt-0 xl:w-1111.75 xl:overflow-hidden max-md:bg-none ${heroBackdrop}`}
          >
            <img
              src={headerImgNoBg}
              alt="Ebuka Chidube"
              className="h-full w-full origin-top object-cover xl:translate-y-60 xl:scale-110"
            />
            <FaceRings className="hero-rings absolute top-129 left-1/2 w-434 -translate-1/2 md:top-[35.19%] md:w-[55.9%] xl:top-[49.28%] xl:w-[60.65%]" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-fade-white md:z-0 md:h-40 xl:h-[15%]" />

        <img
          src="/logo.svg"
          alt="Logo"
          className={`absolute ${showLogo ? "" : "invisible"} top-32.5 left-24 h-34.5 w-auto md:top-35.5 md:left-32 md:h-36.5 xl:top-34.5 xl:left-[5.556vw] xl:h-44 xl:w-40`}
        />

        <nav className="absolute top-32 right-24 flex gap-16 font-['Geist'] font-medium md:right-32 xl:top-32 xl:right-[5.556vw] xl:gap-16">
          <a
            href="#contact"
            className="hero-button flex h-32 items-center gap-12 bg-black pr-16 pl-14 text-14 tracking-[-0.04em] text-white md:h-40 md:gap-12.5 md:pr-17.5 md:pl-16 md:text-16 xl:h-46 xl:gap-12 xl:px-18 xl:text-16"
          >
            <span className="overflow-hidden py-[0.1em]">
              <span className="hero-chat-text block">Let’s Chat</span>
            </span>
            <span className="overflow-hidden">
              <svg
                viewBox="0 0 12 12"
                className="hero-chat-arrow block size-10 md:size-11 xl:size-11"
                fill="none"
              >
                <path
                  d="M1 11 11 1M3 1h8v8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </span>
          </a>
          <button
            type="button"
            aria-label="Open menu"
            className="hero-button flex size-32 flex-col items-center justify-center gap-4 bg-black md:size-40 md:gap-5 xl:size-46 xl:gap-7"
          >
            <span className="hero-menu-line h-[2px] w-20 bg-white md:w-24 xl:h-2 xl:w-24" />
            <span className="hero-menu-line h-[2px] w-20 bg-white md:w-24 xl:h-2 xl:w-24" />
            <span className="hero-menu-line h-[2px] w-20 bg-white md:w-24 xl:h-2 xl:w-24" />
          </button>
        </nav>

        <div className="absolute top-233.5 left-24 z-10 flex w-392 flex-col text-white md:contents">
          <div className="contents md:absolute md:top-293 md:left-32 md:block xl:top-[58.18%] xl:-mt-156.75 xl:left-[5.556vw]">
            <h1 className="order-1 overflow-hidden pt-[0.06em]">
              <span className={headline}>EBUKA</span>
            </h1>
            <p className="order-3 mt-5 overflow-hidden font-['Geist'] text-22.5 leading-[1.3] font-medium tracking-[-0.04em] md:-mt-7.25 md:text-28.8 xl:-mt-11.75 xl:text-48">
              <span className="hero-line flex items-center gap-[0.3em] md:gap-17.5 xl:gap-[0.3em]">
                Senior Digital Marketer at
                <img
                  src={piggyvestWordmark}
                  alt="piggyvest"
                  className="hero-wordmark h-[0.9em] w-auto md:h-32 xl:h-[0.9em]"
                />
              </span>
            </p>
          </div>

          <p className="hero-paragraph order-4 mt-14 font-['Geist'] text-18 leading-22 font-light tracking-[-0.04em] text-white md:absolute md:top-458.5 md:left-32 md:mt-0 md:max-w-540 md:text-24 md:leading-29 xl:top-[58.18%] xl:mt-180.25 xl:left-[5.556vw] xl:max-w-[25.5em] xl:text-28 xl:leading-[1.29] xl:font-medium">
            I am a commercially minded performance marketer who understands how
            to turn marketing spend into customer acquisition and revenue
          </p>

          <div className="order-2 -mt-7.5 overflow-hidden pt-[0.06em] md:absolute md:top-453.75 md:right-32 md:mt-0 xl:top-[58.18%] xl:mt-185.75 xl:right-[5.556vw]">
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
          className="hero-card absolute top-141 right-32 hidden w-[14.5em] bg-black px-[0.5em] pb-[0.5em] text-16 md:block xl:top-[58.18%] xl:-mt-157.75 xl:right-[5.556vw]"
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
