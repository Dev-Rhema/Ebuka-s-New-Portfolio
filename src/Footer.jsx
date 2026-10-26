import { useEffect, useRef, useState } from "react";
import { gsap, revealOnScroll, splitLines, useGSAP } from "./animation";
import Knight from "./Knight";
import { useDither } from "./components/Dither";
import { ContactEmail, SocialLinks, grass } from "./Data";
import { shadowButton } from "./styles";

const KNIGHT_SCALE = 0.53;
const MOBILE_SCALE = 0.72;
const RIDE_SPEED = 7.05 * 24 * KNIGHT_SCALE;
const RIDE_TIME = 1440 / RIDE_SPEED;
const MOBILE_RIDE_TIME = 440 / (RIDE_SPEED * MOBILE_SCALE);

const GLYPHS = {
  X: (
    <path d="M17.8 3h3.1l-6.8 7.8 8 10.6h-6.3l-4.9-6.4L5.3 21.4H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.5h1.7L7.2 4.8H5.4l11.3 14.7Z" />
  ),
  Instagram: (
    <>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.3" cy="6.7" r="1.3" />
    </>
  ),
  YouTube: (
    <path
      fillRule="evenodd"
      d="M3.6 5.6C5.1 5 12 5 12 5s6.9 0 8.4.6c.9.3 1.5 1 1.7 1.9.4 1.6.4 4.5.4 4.5s0 2.9-.4 4.5c-.2.9-.8 1.6-1.7 1.9-1.5.6-8.4.6-8.4.6s-6.9 0-8.4-.6c-.9-.3-1.5-1-1.7-1.9C1.5 14.9 1.5 12 1.5 12s0-2.9.4-4.5c.2-.9.8-1.6 1.7-1.9ZM10 8.8v6.4l5.4-3.2L10 8.8Z"
    />
  ),
  LinkedIn: (
    <>
      <rect x="3.5" y="9" width="3.6" height="11.5" />
      <circle cx="5.3" cy="5.2" r="2.1" />
      <path d="M9.6 9h3.4v1.6c.6-1 1.9-1.9 3.8-1.9 3.2 0 4.2 2 4.2 5.1v6.7h-3.6v-6c0-1.5-.4-2.7-1.9-2.7-1.6 0-2.3 1.2-2.3 2.8v5.9H9.6V9Z" />
    </>
  ),
};

function SocialButton({ name, href, className = "" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      className={`footer-icon flex size-32 shrink-0 items-center justify-center md:size-30 ${shadowButton} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-18 md:w-15">
        {GLYPHS[name]}
      </svg>
    </a>
  );
}

function EmailPill() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ContactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${ContactEmail}`;
    }
  };

  return (
    <div className="order-first flex basis-full justify-center md:contents">
      <div className="footer-email flex h-50 w-311 shrink-0 items-center rounded-full border-pill border-[#d9d9d9] bg-[#ededed] px-7 font-['Geist'] font-medium tracking-[-0.03em] text-[#838383]">
        <a
          href={`mailto:${ContactEmail}`}
          className="flex min-w-0 flex-1 items-center gap-10 text-18"
        >
          <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-[#4A4A4A] text-[#F7F7F7] inset-shadow-bevel">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-15">
              <path d="M21.4 2.6 2.9 10.2c-.8.3-.7 1.4.1 1.6l7.3 1.9 1.9 7.3c.2.8 1.3.9 1.6.1L21.4 2.6Z" />
            </svg>
          </span>
          <span className="truncate">{copied ? "Copied!" : ContactEmail}</span>
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy email address"
          className="flex size-28 shrink-0 items-center justify-center text-[#2b2b2b]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-17">
            <rect x="3" y="3" width="13" height="13" rx="3" fill="#bdbdbd" />
            <rect
              x="8"
              y="8"
              width="13"
              height="13"
              rx="3"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const GRASS = { w: 1439, h: 40, scale: 0.7 };

function GrassTile() {
  const imgRef = useRef(null);
  const { canvasRef, active } = useDither(imgRef);

  return (
    <div
      className="relative w-725.25 shrink-0 md:w-1007.25"
      style={{ aspectRatio: `${GRASS.w} / ${GRASS.h}` }}
    >
      <img
        ref={imgRef}
        loading="lazy"
        src={grass}
        alt=""
        className={`absolute inset-0 size-full ${active ? "opacity-0" : ""}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 size-full ${active ? "" : "hidden"}`}
      />
    </div>
  );
}

function Grass() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2"
    >
      <GrassTile />
      <GrassTile />
    </div>
  );
}

function Footer({ play }) {
  const [x, instagram, youtube, linkedin] = SocialLinks;
  const footerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      gsap.set(".footer-intro", { autoAlpha: 0 });
    },
    { scope: footerRef },
  );

  useGSAP(
    () => {
      if (!play) return;

      const footer = footerRef.current;
      const icon = (name) => footer.querySelector(`[aria-label="${name}"]`);

      revealOnScroll(footer.querySelector(".footer-intro"), (tl) => {
        const name = splitLines(footer.querySelector(".footer-name"));
        const copy = splitLines(footer.querySelector(".footer-copy"));
        const icons = gsap.utils.toArray(".footer-icon", footer);
        // Keeps the large shadows from re-rasterizing at every scale step.
        gsap.set(icons, { willChange: "transform" });

        tl.from(name.lines, { yPercent: 100 }, 0)
          .from(copy.lines, { yPercent: 100, stagger: 0.1 }, 0.1)
          .from(
            footer.querySelector(".footer-email"),
            { opacity: 0, ease: "fadeInOut" },
            0,
          )
          .from(
            [icon("Instagram"), icon("YouTube")],
            { scale: 0, ease: "logoMove" },
            0.2,
          )
          .from(
            [icon("X"), icon("LinkedIn")],
            { scale: 0, ease: "logoMove" },
            0.4,
          );

        return () => {
          [name, copy].forEach((split) => split.revert());
          gsap.set(icons, { clearProps: "willChange" });
        };
      });
    },
    { dependencies: [play], scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative overflow-hidden bg-white pt-80 text-center unit-440 md:unit-1440"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-170 left-1/2 h-520 w-860 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.075),transparent)]"
      />

      <div className="footer-intro">
        <h2 className="footer-name relative font-['DM-Serif'] text-40 leading-none tracking-[-0.02em] text-black md:text-44">
          Ebuka Chidube
        </h2>
        <p className="footer-copy relative mx-auto mt-16 md:max-w-290 font-['Geist'] text-19 leading-25 font-medium tracking-[-0.04em] text-[#838383] md:mt-18 md:text-20">
          Helping your brand become more through intentional marketing
        </p>

        <div className="relative z-10 mt-32 flex flex-wrap items-center justify-center gap-x-16 gap-y-17 md:mt-34 md:flex-nowrap">
          <SocialButton {...x} className="order-2 md:order-none" />
          <SocialButton {...instagram} className="order-3 md:order-none" />
          <EmailPill />
          <SocialButton {...youtube} className="order-4 md:order-none" />
          <SocialButton {...linkedin} className="order-1 md:order-none" />
        </div>
      </div>

      <div
        className="pointer-events-none relative z-20 mt-93 [--ride-time:var(--ride-mobile)] motion-safe:animate-knight-ride md:-mt-14 md:[--ride-time:var(--ride-desktop)]"
        style={{
          "--ride-mobile": `${MOBILE_RIDE_TIME}s`,
          "--ride-desktop": `${RIDE_TIME}s`,
          animationDuration: "var(--ride-time)",
          animationPlayState: inView ? "running" : "paused",
        }}
      >
        <Knight className="relative mx-auto w-204 md:w-283.25" />
        <Knight className="absolute top-0 -left-1/2 -ml-102 w-204 motion-reduce:hidden md:-ml-141.75 md:w-283.25" />
      </div>
      <Grass />
    </footer>
  );
}

export default Footer;
