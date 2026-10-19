import { useRef } from "react";
import { KnightFigure, knightSprite } from "./Data";
import { useDither } from "./components/Dither";

const { view, sprite } = KnightFigure;
const [cellW, cellH] = sprite.cell;

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
