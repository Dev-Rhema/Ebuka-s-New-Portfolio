import globe from "./globe.svg";
import { flag } from "../scoresApi";

/** Renders score rows, or a single muted note when `entries` is a string. */
export function renderLeaderboard(list, entries, spacing = "pt-16 pb-16") {
  if (typeof entries === "string") {
    const note = document.createElement("li");
    note.className = `${spacing} font-['Geist-Mono'] text-14 md:text-16 leading-none tracking-widest text-[#8a8a8a]`;
    note.textContent = entries;
    list.replaceChildren(note);
    return;
  }
  list.replaceChildren(
    ...entries.map(({ name, score, country }) => {
      const row = document.createElement("li");
      row.className = `flex items-center ${spacing} not-last:bg-dashes not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat`;
      row.innerHTML = `
        <span class="flex size-32 shrink-0 md:size-42 items-center justify-center rounded-full bg-[#4A4A4A] inset-shadow-bevel">
          <img src="${globe}" alt="" class="size-16 md:size-20" />
        </span>
        <span class="ml-8 font-['Geist'] text-16 md:ml-9 md:text-19.7 leading-none font-medium tracking-[-0.04em] text-[#404040]"></span>
        <span class="ml-auto font-['Geist-Mono'] text-14 md:pr-7 md:text-18 leading-none tracking-widest text-[#8a8a8a]"></span>`;
      const [badge, nameEl, scoreEl] = row.children;
      if (country) {
        badge.innerHTML = `<span role="img" class="text-16 md:text-20 leading-none"></span>`;
        badge.firstChild.textContent = flag(country);
        badge.firstChild.setAttribute("aria-label", country);
      }
      nameEl.textContent = name;
      scoreEl.textContent = String(score).padStart(4, "0");
      return row;
    }),
  );
}
