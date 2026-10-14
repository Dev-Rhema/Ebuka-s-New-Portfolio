import { useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import headerImg from "./assets/headerImg.svg";
import headerImgCutout from "./assets/headerImgCutout.png";

gsap.registerPlugin(useGSAP, CustomEase);

// slow start, quick jump, long settle
CustomEase.create(
  "jump",
  "M0,0 C0.2,0.03 0.38,0.12 0.46,0.3 C0.5,0.42 0.5,0.7 0.56,0.8 C0.66,0.93 0.8,0.98 1,1",
);

function Loader({ onComplete }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".logo", { xPercent: -50 });

      gsap
        .timeline({ onComplete })
        .from(
          ".name",
          {
            yPercent: -100,
            duration: 0.47,
            ease: "power2.out",
            stagger: { each: 0.01, from: "end" },
          },
          0.06,
        )
        .from(
          ".sub",
          { yPercent: 100, duration: 0.37, ease: "power2.out" },
          0.165,
        )
        .from(
          ".line",
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.8,
            ease: "power3.out",
          },
          0.1,
        )
        .fromTo(
          ".photo",
          { clipPath: "inset(50% 50% 50% 50%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.75,
            ease: "power3.out",
          },
          0.09,
        )
        .from(
          ".photo img",
          { scale: 0.5, duration: 0.3, ease: "power2.out" },
          0.09,
        )
        .from(".logo", { scale: 0, duration: 0.5, ease: "sine.out" }, 0.12)
        .from(
          ".counter",
          { x: 100, opacity: 0, duration: 0.3, ease: "power3.out" },
          0.15,
        )
        .from(".fullscreen", { opacity: 0, duration: 0.11 }, 0.88)
        .from(
          ".fullscreen",
          {
            scale: (_, el) => 176 / el.offsetWidth,
            y: -9,
            duration: 0.77,
            ease: "jump",
          },
          0.88,
        )
        .from(".backdrop", { opacity: 0, duration: 0.35 }, 1.25)
        .to(
          ".logo",
          { left: "4.4vw", xPercent: 0, duration: 0.65, ease: "jump" },
          1.36,
        );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="fixed inset-0 z-50 overflow-hidden bg-black"
    >
      <div className="line absolute top-[calc(50%-9px)] h-px w-full bg-[repeating-linear-gradient(to_right,#161616_0_4px,transparent_4px_5px)]" />

      <div className="absolute inset-0 grid -translate-y-[9px] grid-cols-[1fr_auto_1fr] items-center max-sm:scale-[0.55]">
        <div className="flex h-29.75 flex-col items-end justify-between font-['DM-Serif'] text-[38px] leading-none text-white">
          <div className="overflow-hidden pt-1.5">
            <p className="name">EBUKA</p>
          </div>
          <div className="-mb-1.75 overflow-hidden">
            <p className="sub pb-1 font-['Geist'] text-lg/none font-medium text-[#555]">
              Nihil Sine Deo
            </p>
          </div>
        </div>

        <div className="photo mx-4.5 h-29.75 w-36.75 overflow-hidden">
          <img
            src={headerImg}
            alt=""
            className="h-full w-full object-cover object-[50%_17%]"
          />
        </div>

        <div className="flex h-29.75 flex-col justify-between font-['DM-Serif'] text-[38px] leading-none text-white">
          <div className="mt-6.5 overflow-hidden">
            <p className="sub pb-1 font-['Geist'] text-lg/none font-medium text-[#555]">
              Senior Digital Marketer
            </p>
          </div>
          <div className="-mb-1.5 overflow-hidden pt-1.5">
            <p className="name">CHIDUBE</p>
          </div>
        </div>
      </div>

      <p className="counter absolute bottom-10 w-full text-center font-['Geist'] text-[28px] font-medium leading-none text-[#555]">
        0%
      </p>

      <div className="backdrop absolute inset-0 bg-[linear-gradient(#aaa,#b4b4b4_40%)]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="fullscreen aspect-176/143 w-[min(100vw,calc(100vh*176/143))] shrink-0 overflow-hidden bg-[linear-gradient(#aaa,#b4b4b4_40%)]">
          <img
            src={headerImgCutout}
            alt=""
            className="h-full w-full origin-top translate-y-15 scale-110 object-cover brightness-[.85] grayscale"
          />
        </div>
      </div>

      <img
        src="/logo.svg"
        alt="Logo"
        className="logo absolute top-7.75 left-1/2 h-11 w-10"
      />
    </div>
  );
}

export default Loader;
