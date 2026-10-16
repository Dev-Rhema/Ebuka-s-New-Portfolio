import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import headerImgNoBg from "./assets/headerImgNoBg.webp";
import piggyvest from "./assets/Brands/piggyvest.svg";
import faceRings from "./assets/HeroImgs/faceRings.svg";
import instagramThumb from "./assets/HeroImgs/instagramThumb.jpg";

gsap.registerPlugin(useGSAP, CustomEase, SplitText);

CustomEase.create("reveal", "0.35, 0, 0, 1");

const SPEED = 0.6;

const backdrop = "bg-[linear-gradient(#aaa,#b4b4b4_40%)]";
const headline =
  "hero-line block font-['DM-Serif'] text-[calc(var(--u)*152)] leading-none tracking-[-0.02em] text-white";

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
      gsap.set(".hero-fade", { autoAlpha: 0, y: 40 });
      gsap.set(".hero-card", { autoAlpha: 0, x: 80 });
      gsap.set(".hero-paragraph, .hero-rings", { autoAlpha: 0 });
      // gsap.set(".hero-glow", { autoAlpha: 0 });
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
      const texts = [ebuka, chidube, subtitle, ...paragraph.lines];

      gsap
        .timeline({ defaults: { duration: 1, ease: "reveal" } })
        .timeScale(SPEED)
        // .to(
        //   ".hero-glow",
        //   { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" },
        //   0,
        // )
        .to(
          ".hero-rings",
          { autoAlpha: 1, duration: 0.8, ease: "sine.inOut" },
          0,
        )
        .fromTo(
          texts,
          { yPercent: 100, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, stagger: 0.12 },
          0.05,
        )
        .to(".hero-fade", { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.15)
        .to(".hero-card", { autoAlpha: 1, x: 0 }, 0.05 + texts.length * 0.12);
    },
    { dependencies: [play], scope: container },
  );

  return (
    <main ref={container}>
      <section className="relative h-screen overflow-hidden [--u:min(calc(100vw/1440),calc(100vh/900))]">
        <div className={`absolute inset-0 ${backdrop}`} />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`relative aspect-147/119 w-[min(100vw,calc(100vh*147/119))] shrink-0 overflow-hidden ${backdrop}`}
          >
            <img
              src={headerImgNoBg}
              alt="Ebuka Chidube"
              className="h-full w-full origin-top object-cover transform-[translate(0px,60px)_scale(1.1)]"
            />
            <img
              src={faceRings}
              alt=""
              className="hero-rings absolute top-[49.28%] left-1/2 w-[60.65%] -translate-1/2"
            />
          </div>
        </div>

        {/* <div className="hero-glow absolute inset-x-0 bottom-0 h-[31%] bg-[linear-gradient(rgb(255_255_255/0),rgb(255_255_255/0.13)_25%,rgb(255_255_255/0.45)_56%,rgb(255_255_255/0.85)_87%,white)]" /> */}

        <img
          src="/logo.svg"
          alt="Logo"
          className="absolute top-[34.5px] left-1/2 h-11 w-10 transform-[translate(-50%,0%)_translate(calc(5.556vw-50vw+20px),0px)]"
        />

        <nav className="absolute top-8 right-[5.556vw] flex gap-4 font-['Geist'] font-medium">
          <a
            href="#contact"
            className="hero-fade flex h-11.5 items-center gap-3 bg-black px-4.5 text-[20px] tracking-[-0.04em] text-white"
          >
            Let’s Chat
            <svg viewBox="0 0 12 12" className="size-2.75" fill="none">
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
            className="hero-fade flex size-11.5 flex-col items-center justify-center gap-1.75 bg-black"
          >
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
            <span className="h-0.5 w-6 bg-white" />
          </button>
        </nav>

        <div className="absolute top-[calc(58.18%-var(--u)*156.87)] left-[5.556vw] text-white">
          <h1 className="overflow-hidden pt-[0.06em]">
            <span className={headline}>EBUKA</span>
          </h1>
          <p className="mt-[calc(-11.76*var(--u))] overflow-hidden font-['Geist'] text-[calc(var(--u)*48)] leading-[1.3] font-medium tracking-[-0.04em]">
            <span className="hero-line flex items-center gap-[0.3em]">
              Senior Digital Marketer at
              <img
                src={piggyvest}
                alt="piggyvest"
                className="h-[0.9em] w-auto"
              />
            </span>
          </p>
        </div>

        <p className="hero-paragraph absolute top-[calc(58.18%+var(--u)*180.23)] left-[5.556vw] max-w-[25.5em] font-['Geist'] text-[calc(var(--u)*28)] leading-[1.29] font-medium tracking-[-0.04em] text-white">
          I am a commercially minded performance marketer who understands how to
          turn marketing spend into customer acquisition and revenue
        </p>

        <div className="absolute top-[calc(58.18%+var(--u)*185.73)] right-[5.556vw] overflow-hidden pt-[0.06em]">
          <span
            className={`${headline} bg-linear-to-b from-[#f3f3f3] to-white bg-clip-text pr-[0.02em] text-transparent`}
          >
            CHIDUBE
          </span>
        </div>

        <a
          href="https://www.instagram.com/reel/DeG7wJBKnIr/"
          target="_blank"
          rel="noreferrer"
          aria-label="Watch the latest Instagram reel"
          className="hero-card absolute top-[calc(58.18%-var(--u)*157.67)] right-[5.556vw] w-[14.5em] bg-black px-[0.5em] pb-[0.5em] text-[calc(var(--u)*16)] max-md:hidden"
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
    </main>
  );
}

export default Home;
