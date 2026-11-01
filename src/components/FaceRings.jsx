const RINGS = [
  {
    className: "md:hidden",
    size: 780,
    inner: { r: 279, width: 45, dash: 9.96 },
    outer: { r: 367.5, width: 45, dash: 24.05 },
  },
  {
    className: "hidden md:block xl:hidden",
    size: 568,
    inner: { r: 206.5, width: 25, dash: 5.41 },
    outer: { r: 271.5, width: 25, dash: 13.33 },
  },
  {
    className: "hidden xl:block",
    size: 872,
    inner: { r: 322.5, width: 25, dash: 6.73 },
    outer: { r: 423.5, width: 25, dash: 15.71 },
  },
];

// Each ring spins as its own svg. Spinning the svg rather than a circle inside it lets
// the graphics chip turn it, so no browser has to repaint the ring on every frame.
function Ring({ size, ring, className }) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={`h-auto w-full ${className}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={ring.r}
        opacity="0.2"
        stroke="white"
        strokeWidth={ring.width}
        strokeDasharray={`${ring.dash} ${ring.dash}`}
      />
    </svg>
  );
}

function FaceRings({ className = "" }) {
  return (
    <div aria-hidden="true" className={className}>
      {RINGS.map(({ className: visibility, size, inner, outer }) => (
        <div key={size + visibility} className={`relative ${visibility}`}>
          <Ring
            size={size}
            ring={inner}
            className="motion-safe:animate-[spin_40s_linear_infinite_reverse]"
          />
          <Ring
            size={size}
            ring={outer}
            className="absolute inset-0 motion-safe:animate-[spin_60s_linear_infinite]"
          />
        </div>
      ))}
    </div>
  );
}

export default FaceRings;
