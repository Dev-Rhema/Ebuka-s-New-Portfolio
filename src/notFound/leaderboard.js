import globe from "./globe.svg";

export const leaders = [
  { name: "122.140.201.66", score: 4130 },
  { name: "122.140.201.66", score: 4130 },
  { name: "122.140.201.66", score: 4130 },
];

export function renderLeaderboard(list, entries) {
  list.replaceChildren(
    ...entries.map(({ name, score }) => {
      const row = document.createElement("li");
      row.className =
        "flex items-center pt-[calc(var(--u)*16)] pb-[calc(var(--u)*16)] not-last:bg-[repeating-linear-gradient(to_right,#d8d8d8_0_calc(var(--u)*4),transparent_calc(var(--u)*4)_calc(var(--u)*5.25))] not-last:bg-[length:100%_1px] not-last:bg-bottom not-last:bg-no-repeat";
      row.innerHTML = `
        <span class="flex size-[calc(var(--u)*42)] shrink-0 items-center justify-center rounded-full bg-[#c9c9c9] shadow-[inset_0_calc(var(--u)*-3)_calc(var(--u)*2)_rgba(0,0,0,0.12),inset_0_calc(var(--u)*2)_calc(var(--u)*2)_rgba(255,255,255,0.45)]">
          <img src="${globe}" alt="" class="size-[calc(var(--u)*20)]" />
        </span>
        <span class="ml-[calc(var(--u)*9)] font-['Geist'] text-[calc(var(--u)*19.7)] leading-none font-medium tracking-[-0.04em] text-[#404040]"></span>
        <span class="ml-auto pr-[calc(var(--u)*7)] font-['Geist-Mono'] text-[calc(var(--u)*18)] leading-none tracking-widest text-[#8a8a8a]"></span>`;
      const [, nameEl, scoreEl] = row.children;
      nameEl.textContent = name;
      scoreEl.textContent = String(score).padStart(4, "0");
      return row;
    }),
  );
}
