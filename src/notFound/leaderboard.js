import globe from "./globe.svg";
import { shadowButton } from "../styles";

export const leaders = [
  { name: "122.140.201.66", score: 4130 },
  { name: "122.140.201.66", score: 4130 },
  { name: "122.140.201.66", score: 4130 },
];

export function renderLeaderboard(list, entries, spacing = "pt-16 pb-16") {
  list.replaceChildren(
    ...entries.map(({ name, score }) => {
      const row = document.createElement("li");
      row.className = `flex items-center ${spacing} not-last:bg-dashes not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat`;
      row.innerHTML = `
        <span class="flex size-32 shrink-0 md:size-42 items-center justify-center ${shadowButton}">
          <img src="${globe}" alt="" class="size-16 md:size-20" />
        </span>
        <span class="ml-8 font-['Geist'] text-16 md:ml-9 md:text-19.7 leading-none font-medium tracking-[-0.04em] text-[#404040]"></span>
        <span class="ml-auto font-['Geist-Mono'] text-14 md:pr-7 md:text-18 leading-none tracking-widest text-[#8a8a8a]"></span>`;
      const [, nameEl, scoreEl] = row.children;
      nameEl.textContent = name;
      scoreEl.textContent = String(score).padStart(4, "0");
      return row;
    }),
  );
}
