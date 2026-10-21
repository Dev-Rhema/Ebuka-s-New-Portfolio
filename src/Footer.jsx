import { useEffect, useRef, useState } from "react";
import Knight from "./Knight";
import { useDither } from "./components/Dither";
import { ContactEmail, KnightFigure, SocialLinks, grass } from "./Data";
import { shadowButton } from "./styles";

const u = (value) => `calc(var(--u) * ${value})`;

const KNIGHT_SCALE = 0.53;
const { view, tip } = KnightFigure;
const KNIGHT_W = view.w * KNIGHT_SCALE;
const TIP_Y = (tip.y - view.y) * KNIGHT_SCALE;
const TIP_OVERLAP = 13;
const MOBILE_SCALE = 0.72;
const RIDE_SPEED = 7.05 * 24 * KNIGHT_SCALE;
const RIDE_TIME = 1440 / RIDE_SPEED;
const MOBILE_RIDE_TIME = 440 / (RIDE_SPEED * MOBILE_SCALE);
const knightWidth = (scale = 1) =>
  `calc(var(--u) * ${KNIGHT_W * scale} * var(--knight-scale))`;

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
      className={`flex size-[calc(var(--u)*32)] shrink-0 items-center justify-center md:size-[calc(var(--u)*30)] ${shadowButton} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-[calc(var(--u)*18)] md:w-[calc(var(--u)*15)]"
      >
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
    <div
      className="order-first mx-[calc((100%-var(--u)*311)/2)] flex shrink-0 items-center rounded-full border-[calc(var(--u)*2)] border-[#d9d9d9] bg-[#ededed] font-['Geist'] font-medium tracking-[-0.03em] text-[#838383] md:order-none md:mx-0"
      style={{ width: u(311), height: u(50), paddingInline: u(7) }}
    >
      <a
        href={`mailto:${ContactEmail}`}
        className="flex min-w-0 flex-1 items-center"
        style={{ gap: u(10), fontSize: u(18) }}
      >
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-[#4A4A4A] text-[#F7F7F7] shadow-[inset_0_calc(var(--u)*-3)_calc(var(--u)*2)_rgba(0,0,0,0.25),inset_0_calc(var(--u)*2)_calc(var(--u)*2)_rgba(179,179,179,0.25)]"
          style={{ width: u(32), height: u(32) }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: u(15) }}>
            <path d="M21.4 2.6 2.9 10.2c-.8.3-.7 1.4.1 1.6l7.3 1.9 1.9 7.3c.2.8 1.3.9 1.6.1L21.4 2.6Z" />
          </svg>
        </span>
        <span className="truncate">{copied ? "Copied!" : ContactEmail}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className="flex shrink-0 items-center justify-center text-[#2b2b2b]"
        style={{ width: u(28), height: u(28) }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: u(17) }}>
          <rect x="3" y="3" width="13" height="13" rx="3" fill="#bdbdbd" />
          <rect x="8" y="8" width="13" height="13" rx="3" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

const GRASS = { w: 1439, h: 40, scale: 0.7 };

function GrassTile() {
  const imgRef = useRef(null);
  const { canvasRef, active } = useDither(imgRef);

  return (
    <div
      className="relative w-[calc(var(--u)*var(--grass-w)*var(--mobile-scale))] shrink-0 md:w-[calc(var(--u)*var(--grass-w))]"
      style={{
        "--grass-w": GRASS.w * GRASS.scale,
        "--mobile-scale": MOBILE_SCALE,
        aspectRatio: `${GRASS.w} / ${GRASS.h}`,
      }}
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

function Footer() {
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

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative overflow-hidden bg-white pt-[calc(var(--u)*80)] text-center [--u:calc(100vw/440)] md:[--u:calc(100vw/1440)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.075),transparent)]"
        style={{ top: u(170), width: u(860), height: u(520) }}
      />

      <h2 className="relative font-['DM-Serif'] text-[calc(var(--u)*40)] leading-none tracking-[-0.02em] text-black md:text-[calc(var(--u)*44)]">
        Ebuka Chidube
      </h2>
      <p className="relative mx-auto mt-[calc(var(--u)*16)] md:max-w-[calc(var(--u)*290)] font-['Geist'] text-[calc(var(--u)*19)] leading-[calc(var(--u)*25)] font-medium tracking-[-0.04em] text-[#838383] md:mt-[calc(var(--u)*18)] md:text-[calc(var(--u)*20)]">
        Helping your brand become more through intentional marketing
      </p>

      <div className="relative z-10 mt-[calc(var(--u)*32)] flex flex-wrap items-center justify-center gap-x-[calc(var(--u)*16)] gap-y-[calc(var(--u)*17)] md:mt-[calc(var(--u)*34)] md:flex-nowrap">
        <SocialButton {...x} className="order-2 md:order-none" />
        <SocialButton {...instagram} className="order-3 md:order-none" />
        <EmailPill />
        <SocialButton {...youtube} className="order-4 md:order-none" />
        <SocialButton {...linkedin} className="order-1 md:order-none" />
      </div>

      <div
        className="pointer-events-none relative z-20 mt-[calc(var(--u)*93)] [--knight-scale:var(--mobile-scale)] [--ride-time:var(--ride-mobile)] motion-safe:animate-knight-ride md:mt-[calc(var(--u)*var(--knight-top))] md:[--knight-scale:1] md:[--ride-time:var(--ride-desktop)]"
        style={{
          "--knight-top": -TIP_Y - TIP_OVERLAP,
          "--mobile-scale": MOBILE_SCALE,
          "--ride-mobile": `${MOBILE_RIDE_TIME}s`,
          "--ride-desktop": `${RIDE_TIME}s`,
          animationDuration: "var(--ride-time)",
          animationPlayState: inView ? "running" : "paused",
        }}
      >
        <Knight className="relative mx-auto" style={{ width: knightWidth() }} />
        <Knight
          className="absolute top-0 motion-reduce:hidden"
          style={{
            width: knightWidth(),
            left: `calc(-50% - ${knightWidth(0.5)})`,
          }}
        />
      </div>
      <Grass />
    </footer>
  );
}

export default Footer;
