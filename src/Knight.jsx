import { useRef } from "react";
import { KnightFigure, knightSprite } from "./Data";
import { useDither } from "./components/Dither";

// One stride (32 frames) of an AI video of the knight, flag and lance
// included, cleaned up into a sprite sheet and played at 24fps through the
// footer's dither.
const { view, sprite } = KnightFigure;
const [cellW, cellH] = sprite.cell;

// The knight walking (the footer moves him across). Size it with
// `className`/`style` (a width and a position); it keeps KnightFigure.view's
// proportions.
function Knight({ className = "", style }) {
  const imageRef = useRef(null);
  const { canvasRef, active } = useDither(imageRef, sprite);

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden ${className}`}
      style={{ aspectRatio: `${view.w} / ${view.h}`, ...style }}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 size-full ${active ? "" : "hidden"}`}
      />
      {/* The sheet feeds the canvas; without WebGL it shows its first frame */}
      <img
        ref={imageRef}
        loading="lazy"
        src={knightSprite}
        alt=""
        className={`absolute top-0 left-0 max-w-none ${active ? "opacity-0" : ""}`}
        style={{
          width: `${((sprite.cols * (cellW + sprite.gap)) / cellW) * 100}%`,
          height: `${((sprite.rows * (cellH + sprite.gap)) / cellH) * 100}%`,
        }}
      />
    </div>
  );
}

export default Knight;
