import { useLayoutEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

function CircularGallery({
  items,
  renderItem,
  getKey = (_, index) => index,
  itemClassName = "",
  itemStyle,
  gap = 0.12,
  bend = 4.5,
  speed = 0.3,
  className = "",
}) {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const elements = itemRefs.current.slice(0, items.length);
    if (!root || elements.length === 0) return;

    let itemWidth = 0;
    let step = 0;
    let radius = 0;
    let total = 0;
    let offset = 0;
    let velocity = 0;
    let dragging = false;
    let pointerX = 0;
    let pointerTime = 0;
    let visible = false;
    let previous = performance.now();
    let frame;

    const measure = () => {
      itemWidth = elements[0].offsetWidth;
      step = itemWidth * (1 + gap);
      radius = itemWidth * bend;
      total = step * elements.length;
    };

    const place = () => {
      elements.forEach((element, index) => {
        const x = modulo(index * step - offset + total / 2, total) - total / 2;
        const sine = clamp(x / radius, -1, 1);
        const y = radius - Math.sqrt(Math.max(radius * radius - x * x, 0));
        element.style.transform = `translate(calc(-50% + ${x}px), ${y}px) rotate(${Math.asin(sine)}rad)`;
      });
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!visible || dragging) return;
      const cruise = reducedMotion.matches ? 0 : speed * itemWidth;
      velocity += (cruise - velocity) * (1 - Math.exp(-delta * 2.5));
      offset += velocity * delta;
      place();
    };

    const onDown = (event) => {
      dragging = true;
      pointerX = event.clientX;
      pointerTime = event.timeStamp;
      velocity = 0;
      root.setPointerCapture(event.pointerId);
    };

    const onMove = (event) => {
      if (!dragging) return;
      const moved = event.clientX - pointerX;
      const elapsed = Math.max((event.timeStamp - pointerTime) / 1000, 0.001);
      offset -= moved;
      velocity = velocity * 0.6 + (-moved / elapsed) * 0.4;
      pointerX = event.clientX;
      pointerTime = event.timeStamp;
      place();
    };

    const onUp = () => {
      dragging = false;
    };

    measure();
    place();

    const resizeObserver = new ResizeObserver(() => {
      measure();
      place();
    });
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(root);

    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, [items, gap, bend, speed]);

  return (
    <div
      ref={rootRef}
      className={`relative cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          className={`absolute top-0 left-1/2 will-change-transform ${itemClassName}`}
          style={itemStyle}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default CircularGallery;
