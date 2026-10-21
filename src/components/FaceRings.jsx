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
    size: 780,
    inner: { r: 287.5, width: 25, dash: 6 },
    outer: { r: 377.5, width: 25, dash: 14 },
  },
];

function Ring({ center, ring, className }) {
  return (
    <circle
      cx={center}
      cy={center}
      r={ring.r}
      opacity="0.2"
      stroke="white"
      strokeWidth={ring.width}
      strokeDasharray={`${ring.dash} ${ring.dash}`}
      className={`origin-center [transform-box:fill-box] ${className}`}
    />
  );
}

function FaceRings({ className = "" }) {
  return (
    <div aria-hidden="true" className={className}>
      {RINGS.map(({ className: visibility, size, inner, outer }) => (
        <svg
          key={size + visibility}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          className={`h-auto w-full ${visibility}`}
        >
          <Ring
            center={size / 2}
            ring={inner}
            className="motion-safe:animate-[spin_40s_linear_infinite_reverse]"
          />
          <Ring
            center={size / 2}
            ring={outer}
            className="motion-safe:animate-[spin_60s_linear_infinite]"
          />
        </svg>
      ))}
    </div>
  );
}

export default FaceRings;
