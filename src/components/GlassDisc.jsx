import { useId } from "react";

// Recreates the Figma "Glass" effect: light -45° at 80%, refraction 52, depth 100,
// dispersion 49, frost 0. The video behind the disc is bent like a thick lens.
const REFRACTION = 0.26; // the furthest the backdrop shifts, as a share of the disc's width
const DEPTH = 0.55; // how far in from the rim the glass curves
const DISPERSION = 0.08; // how much further red bends than green, and blue less

// Only Chromium renders SVG filters in backdrop-filter; other browsers get the
// highlights over a brightened backdrop instead of the refraction.
const refracts =
  typeof navigator !== "undefined" &&
  Boolean(navigator.userAgentData?.brands?.some((b) => b.brand === "Chromium"));

// Red and green hold each pixel's x and y shift: inward near the rim, none at the centre.
let displacementMap;
const getDisplacementMap = () => {
  if (displacementMap) return displacementMap;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const r = Math.hypot(nx, ny);
      const bend = r > 0 && r <= 1 ? Math.max(0, 1 - (1 - r) / DEPTH) ** 2 : 0;
      const i = (y * size + x) * 4;
      image.data[i] = 128 - (nx / (r || 1)) * bend * 127;
      image.data[i + 1] = 128 - (ny / (r || 1)) * bend * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return (displacementMap = canvas.toDataURL());
};

const CHANNELS = [
  ["r", 1 + DISPERSION, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"],
  ["g", 1, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"],
  ["b", 1 - DISPERSION, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"],
];

function GlassDisc({ className = "", children }) {
  const id = useId();

  return (
    <span
      className={`relative flex items-center justify-center rounded-full ${refracts ? "" : "bg-white/10 backdrop-brightness-125 backdrop-saturate-150"} ${className}`}
      style={
        refracts ? { backdropFilter: `url(#${CSS.escape(id)})` } : undefined
      }
    >
      {refracts && (
        <svg aria-hidden="true" className="absolute size-0">
          <filter
            id={id}
            x="0"
            y="0"
            width="1"
            height="1"
            primitiveUnits="objectBoundingBox"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={getDisplacementMap()}
              x="0"
              y="0"
              width="1"
              height="1"
              preserveAspectRatio="none"
              result="map"
            />
            {/* Each colour channel bends by a slightly different amount: the dispersion. */}
            {CHANNELS.map(([name, scale]) => (
              <feDisplacementMap
                key={name}
                in="SourceGraphic"
                in2="map"
                scale={REFRACTION * 2 * scale}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`${name}-shift`}
              />
            ))}
            {CHANNELS.map(([name, , matrix]) => (
              <feColorMatrix
                key={name}
                in={`${name}-shift`}
                values={matrix}
                result={name}
              />
            ))}
            <feBlend in="r" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b" mode="screen" />
          </filter>
        </svg>
      )}
      {/* Light from the top left at 80%, with a softer reflection opposite. */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.35),transparent_40%,transparent_65%,rgba(255,255,255,0.12))] shadow-[inset_1.5px_1.5px_1px_rgba(255,255,255,0.8),inset_-1px_-1px_1px_rgba(255,255,255,0.35)]" />
      {children}
    </span>
  );
}

export default GlassDisc;
