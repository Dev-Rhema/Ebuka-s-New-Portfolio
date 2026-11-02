// Hovering a button slides each letter of its [data-roll] label down in turn, with a copy
// of the same letter following from above. Leaving slides it again.
const ROLL = {
  duration: 800,
  stagger: 40,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

const hover = window.matchMedia("(hover: hover)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const rolling = new WeakMap();

const span = (style, text) => {
  const el = document.createElement("span");
  el.style.cssText = style;
  el.textContent = text;
  return el;
};

const roll = (label) => {
  // A roll already underway restarts from its text, not from the reels it left in the label.
  const run = rolling.get(label);
  const text =
    run && label.firstChild === run.cells[0] ? run.text : label.textContent;

  const animations = [];
  const cells = [...text].map((char, i) => {
    // The cell clips the reel to the real letter, which sits on top and sets its size.
    const cell = span(
      "display:inline-block;white-space:pre;clip-path:inset(0)",
    );
    const reel = span("display:block;position:relative", char);
    cell.append(reel);
    if (!/[\p{L}\p{N}]/u.test(char)) return cell;

    const copy = span("position:absolute;left:0;top:100%", char);
    copy.setAttribute("aria-hidden", "true");
    reel.append(copy);
    animations.push(
      reel.animate(
        [{ transform: "translateY(-100%)" }, { transform: "none" }],
        {
          duration: ROLL.duration,
          delay: i * ROLL.stagger,
          easing: ROLL.easing,
          fill: "backwards",
        },
      ),
    );
    return cell;
  });

  // Split letters lose their kerning, so the label holds its width to keep the button still.
  if (!run) label.style.width = `${label.getBoundingClientRect().width}px`;
  const next = { text, cells };
  rolling.set(label, next);
  label.style.whiteSpace = "nowrap";
  label.replaceChildren(...cells);

  Promise.all(animations.map((animation) => animation.finished))
    .then(() => {
      if (rolling.get(label) !== next) return;
      rolling.delete(label);
      label.style.whiteSpace = "";
      label.style.width = "";
      // Leave the label alone if something else rewrote it mid-roll.
      if (label.firstChild === cells[0]) label.textContent = text;
    })
    .catch(() => {});
};

const onCross = (event) => {
  if (!hover.matches || reduceMotion.matches) return;
  const button = event.target.closest?.("a, button");
  if (!button || button.disabled || button.contains(event.relatedTarget)) {
    return;
  }
  const labels = button.matches("[data-roll]")
    ? [button]
    : button.querySelectorAll("[data-roll]");
  labels.forEach(roll);
};

document.addEventListener("mouseover", onCross);
document.addEventListener("mouseout", onCross);
