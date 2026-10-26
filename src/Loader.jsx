import { useRef } from "react";
import { gsap, useGSAP } from "./animation";
import FaceRings from "./components/FaceRings";
import { headerImg, headerImgNoBg } from "./Data";
import { heroBackdrop, heroRings } from "./styles";

const SPEED = 0.6;

const nameColumn =
  "flex h-[119px] flex-col justify-between font-['DM-Serif'] text-[38px] leading-none text-white";
const subText = "sub pb-[4px] whitespace-nowrap font-['Geist'] text-lg/none font-medium text-[#555]";

function MobileHero({ className = "", rings = false }) {
  return (
    <div
      className={`flex items-start justify-center overflow-hidden ${heroBackdrop} ${className}`}
    >
      <div className="relative mt-93 aspect-147/119 w-515 shrink-0">
        <img
          src={headerImgNoBg}
          alt=""
          className="relative h-full w-full object-cover"
        />
        {rings && <FaceRings className={heroRings} />}
      </div>
    </div>
  );
}

function Loader({ onLogoMove, onComplete }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".logo", { xPercent: -50 });
      gsap.set(".hero-rings", { autoAlpha: 0 });

      const desktop = window.matchMedia("(min-width: 1280px)").matches;
      const tablet = window.matchMedia("(min-width: 768px)").matches;
      const unit = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
      const logoLeft = desktop ? 80 / 1440 : tablet ? 32 / 1024 : 24 / 440;

      const photo = container.current
        .querySelector(".photo")
        .getBoundingClientRect();
      const full = container.current
        .querySelector(tablet ? ".fullscreen" : ".frame")
        .getBoundingClientRect();
      const grow = photo.width / full.width;

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
          ".photo > *",
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
        .from(
          tablet ? ".fullscreen" : ".frame",
          { opacity: 0, duration: 0.22, ease: "sine.inOut" },
          0.88,
        );

      if (tablet) {
        tl.from(
          ".fullscreen",
          {
            scale: grow,
            y: photo.top + photo.height / 2 - (full.top + full.height / 2),
            duration: 0.77,
            ease: "jump",
          },
          1.1,
        );
      } else {
        tl.from(
          ".frame",
          {
            scale: grow,
            y: photo.top + photo.height / 2 - (full.bottom - (full.height * grow) / 2),
            transformOrigin: "50% 100%",
            duration: 0.77,
            ease: "jump",
          },
          1.1,
        )
          .fromTo(
            ".wipe",
            { clipPath: "circle(0% at 50% 100%)" },
            {
              clipPath: "circle(150% at 50% 100%)",
              duration: 0.6,
              ease: "power2.inOut",
            },
            1.72,
          )
          .from(".fade", { opacity: 0, duration: 0.4 }, 1.92);
      }

      tl.set(".photo", { autoAlpha: 0 }, 1.1)
        .to(
          ".intro, .line, .counter",
          { autoAlpha: 0, duration: 0.25, ease: "sine.inOut" },
          1.1,
        )
        .fromTo(
          ".fullscreen img",
          { scale: 1, y: 0 },
          {
            scale: desktop ? 1.1 : 1,
            y: desktop ? 60 * unit : 0,
            transformOrigin: "top",
            duration: 0.77,
            ease: "jump",
          },
          1.1,
        )
        .from(".backdrop", { opacity: 0, duration: 0.35 }, 1.47)
        .to(
          ".logo",
          {
            x: (_, el) =>
              window.innerWidth * (logoLeft - 0.5) + el.offsetWidth / 2,
            duration: 0.8,
            ease: "logoMove",
          },
          1.58,
        )
        .call(() => onLogoMove?.(), null, 1.58)
        .call(
          () => {
            const loader = container.current;
            gsap.set(loader, {
              backgroundColor: "transparent",
              pointerEvents: "none",
            });
            gsap.set(
              [...loader.children].filter((el) => !el.matches(".logo")),
              { autoAlpha: 0 },
            );
          },
          null,
          2.2,
        );

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
      className="fixed inset-0 z-50 overflow-hidden bg-black unit-440 md:unit-1024 xl:unit-fit"
    >
      <div className="line absolute top-1/2 -mt-[9px] h-px w-full bg-[repeating-linear-gradient(to_right,#161616_0_4px,transparent_4px_5px)]" />

      <div className="intro absolute inset-y-0 -inset-x-[41%] grid -translate-y-[9px] scale-[0.55] grid-cols-[1fr_auto_1fr] items-center sm:inset-x-0 sm:scale-100">
        <div className={`${nameColumn} items-end`}>
          <div className="overflow-hidden pt-[6px]">
            <p className="name">EBUKA</p>
          </div>
          <div className="-mb-[7px] overflow-hidden max-sm:-translate-y-[23.5px]">
            <p className={subText}>Nihil Sine Deo</p>
          </div>
        </div>

        <div className="photo mx-[18px] h-[119px] w-[102.67px] overflow-hidden md:w-[147px]">
          <MobileHero className="h-510 w-440 unit-photo md:hidden" />
          <img
            src={headerImg}
            alt=""
            fetchPriority="high"
            className="hidden h-full w-full object-cover md:block"
          />
        </div>

        <div className={nameColumn}>
          <div className="mt-[26px] overflow-hidden">
            <p className={subText}>Senior Digital Marketer</p>
          </div>
          <div className="-mb-[6px] overflow-hidden pt-[6px] max-sm:-translate-y-[16.5px]">
            <p className="name">CHIDUBE</p>
          </div>
        </div>
      </div>

      <p className="counter absolute bottom-[40px] w-full text-center font-['Geist'] text-[16px] font-medium leading-none text-[#555]">
        <span className="count">0</span>%
      </p>

      <div
        className={`backdrop absolute inset-x-0 top-0 hidden md:block md:h-640 xl:h-hero ${heroBackdrop}`}
      />

      <div className="wipe absolute inset-x-0 top-478 bottom-0 bg-white md:hidden" />

      <MobileHero
        rings
        className="frame absolute inset-x-0 top-0 h-510 will-change-transform md:hidden"
      />
      <div className="fade absolute inset-x-0 top-478 h-32 bg-fade-white md:hidden" />

      <div className="absolute inset-x-0 top-0 hidden md:flex md:h-640 md:items-start md:justify-center xl:h-hero xl:items-center">
        <div
          className={`fullscreen relative aspect-147/119 shrink-0 overflow-hidden will-change-transform md:mt-28 md:w-1016 xl:mt-0 xl:w-1111.75 ${heroBackdrop}`}
        >
          <img
            src={headerImgNoBg}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <FaceRings className={heroRings} />
        </div>
      </div>

      <div className="backdrop absolute inset-x-0 hidden md:top-600 md:block md:h-40 md:bg-fade-white xl:top-0 xl:h-hero xl:bg-[length:100%_15%] xl:bg-bottom xl:bg-no-repeat" />
      <div className="backdrop absolute inset-x-0 bottom-0 hidden bg-white md:top-640 md:block xl:top-hero" />

      <img
        src="/logo.svg"
        alt="Logo"
        className="logo absolute top-32.5 left-1/2 h-34.5 w-auto md:top-35.5 md:h-36.5 xl:top-34.5 xl:h-44 xl:w-40"
      />
    </div>
  );
}

export default Loader;
