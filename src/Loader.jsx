import { useRef } from "react";
import { gsap, useGSAP } from "./animation";
import { headerImg, headerImgNoBg } from "./Data";
import { heroBackdrop } from "./styles";

// Playback speed of the whole loader (1 = original, lower = slower)
const SPEED = 0.6;

const nameColumn =
  "flex h-29.75 flex-col justify-between font-['DM-Serif'] text-[38px] leading-none text-white";
const subText = "sub pb-1 font-['Geist'] text-lg/none font-medium text-[#555]";

function Loader({ onComplete }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".logo", { xPercent: -50 });

      // The B&W frame starts exactly on top of the colour photo, then grows
      const photo = container.current
        .querySelector(".photo")
        .getBoundingClientRect();
      const full = container.current
        .querySelector(".fullscreen")
        .getBoundingClientRect();

      let startedAt = 0;
      const tl = gsap
        .timeline({
          paused: true,
          onComplete: () => {
            if (import.meta.env.DEV) {
              console.info(
                `Loader took ${((performance.now() - startedAt) / 1000).toFixed(2)}s`,
              );
            }
            onComplete?.();
          },
        })
        .timeScale(SPEED)
        // Intro
        .from(
          ".name",
          {
            yPercent: -110,
            duration: 1,
            ease: "reveal",
            stagger: { each: 0.01, from: "end" },
          },
          0.36,
        )
        .from(".sub", { yPercent: 100, duration: 1, ease: "reveal" }, 0.465)
        .from(
          ".line",
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 1,
            ease: "reveal",
          },
          0.1,
        )
        .fromTo(
          ".photo",
          { clipPath: "inset(50% 50% 50% 50%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "reveal",
          },
          0.09,
        )
        .from(
          ".photo img",
          { scale: 0.5, duration: 0.3, ease: "power2.out" },
          0.09,
        )
        .from(".logo", { scale: 0, duration: 1.2, ease: "reveal" }, 0.12)
        .from(
          ".counter",
          { x: 100, opacity: 0, duration: 0.3, ease: "power3.out" },
          0.15,
        )
        .to(
          ".count",
          {
            textContent: 100,
            snap: { textContent: 1 },
            duration: 0.65,
            ease: "power1.inOut",
          },
          0.2,
        )
        // Full-size photo grows over everything
        // Colour fades to B&W in place, then the B&W photo grows
        .from(
          ".fullscreen",
          { opacity: 0, duration: 0.22, ease: "sine.inOut" },
          0.88,
        )
        .from(
          ".fullscreen",
          {
            scale: photo.width / full.width,
            y: photo.top + photo.height / 2 - (full.top + full.height / 2),
            duration: 0.77,
            ease: "jump",
          },
          1.1,
        )
        // Person eases into the larger, lower full-view framing
        .fromTo(
          ".fullscreen img",
          { scale: 1, y: 0 },
          {
            scale: 1.1,
            y: 60,
            transformOrigin: "top",
            duration: 0.77,
            ease: "jump",
          },
          1.1,
        )
        .from(".backdrop", { opacity: 0, duration: 0.35 }, 1.47)
        // Logo slides from top centre to 80px (at 1440 wide) from the left edge
        .to(
          ".logo",
          {
            x: (_, el) =>
              window.innerWidth * (80 / 1440 - 0.5) + el.offsetWidth / 2,
            duration: 0.8,
            ease: "logoMove",
          },
          1.58,
        );

      // Start only once the whole page has loaded, the loader's images are
      // decoded, the fonts are in and the tab is actually on screen, then
      // wait two frames so the loader has been painted before it moves
      const pageLoaded = new Promise((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", resolve, { once: true });
      });
      const pageVisible = new Promise((resolve) => {
        if (document.visibilityState === "visible") return resolve();
        const onChange = () => {
          if (document.visibilityState !== "visible") return;
          document.removeEventListener("visibilitychange", onChange);
          resolve();
        };
        document.addEventListener("visibilitychange", onChange);
      });
      const images = container.current.querySelectorAll("img");

      let cancelled = false;
      let frameId;
      Promise.all([
        pageLoaded,
        ...[...images].map((img) => img.decode().catch(() => {})),
        document.fonts.ready,
      ])
        .then(() => pageVisible)
        .then(() => {
          frameId = requestAnimationFrame(() => {
            frameId = requestAnimationFrame(() => {
              if (cancelled) return;
              startedAt = performance.now();
              tl.play();
            });
          });
        });

      return () => {
        cancelled = true;
        cancelAnimationFrame(frameId);
      };
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="fixed inset-0 z-50 overflow-hidden bg-black"
    >
      <div className="line absolute top-[calc(50%-9px)] h-px w-full bg-[repeating-linear-gradient(to_right,#161616_0_4px,transparent_4px_5px)]" />

      <div className="absolute inset-0 grid -translate-y-2.25 grid-cols-[1fr_auto_1fr] items-center max-sm:scale-[0.55]">
        <div className={`${nameColumn} items-end`}>
          <div className="overflow-hidden pt-1.5">
            <p className="name">EBUKA</p>
          </div>
          <div className="-mb-1.75 overflow-hidden">
            <p className={subText}>Nihil Sine Deo</p>
          </div>
        </div>

        <div className="photo mx-4.5 h-29.75 w-36.75 overflow-hidden">
          <img
            src={headerImg}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>

        <div className={nameColumn}>
          <div className="mt-6.5 overflow-hidden">
            <p className={subText}>Senior Digital Marketer</p>
          </div>
          <div className="-mb-1.5 overflow-hidden pt-1.5">
            <p className="name">CHIDUBE</p>
          </div>
        </div>
      </div>

      <p className="counter absolute bottom-10 w-full text-center font-['Geist'] text-[16px] font-medium leading-none text-[#555]">
        <span className="count">0</span>%
      </p>

      <div className={`backdrop absolute inset-0 ${heroBackdrop}`} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`fullscreen aspect-147/119 w-[min(100vw,calc(100vh*147/119))] shrink-0 overflow-hidden will-change-transform ${heroBackdrop}`}
        >
          <img
            src={headerImgNoBg}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <img
        src="/logo.svg"
        alt="Logo"
        className="logo absolute top-[34.5px] left-1/2 h-11 w-10"
      />
    </div>
  );
}

export default Loader;
