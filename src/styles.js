// Class strings shared across sections. Sections size everything in --u: one
// design pixel at 1440 wide.

export const sectionLabel =
  "font-['Geist'] text-[calc(var(--u)*16)] leading-none font-medium tracking-[-0.04em] text-[#838383] uppercase";

export const sectionHeading =
  "font-['DM-Serif'] text-[calc(var(--u)*40)] leading-none tracking-[-0.02em] text-black";

export const callButton =
  "flex h-[calc(var(--u)*46)] w-[calc(var(--u)*144)] items-center justify-center bg-black font-['Geist'] text-[calc(var(--u)*16)] font-medium tracking-[-0.04em] text-white";

// Behind the hero photo; the loader hands over to the hero on the same grey
export const heroBackdrop = "bg-[linear-gradient(#aaa,#b4b4b4_40%)]";

// The dark round icon button from the About and Skills artwork (#4A4A4A with
// stacked drop shadows and a bevel), for icons drawn in code. Size it at the
// call site.
export const shadowButton =
  "rounded-full bg-[#4A4A4A] text-[#F7F7F7] shadow-[0_calc(var(--u)*10.28)_calc(var(--u)*10.5)_rgba(0,0,0,0.19),0_calc(var(--u)*28.42)_calc(var(--u)*29.05)_rgba(0,0,0,0.27),0_calc(var(--u)*68.43)_calc(var(--u)*69.94)_rgba(0,0,0,0.35),0_calc(var(--u)*227)_calc(var(--u)*232)_rgba(0,0,0,0.54),inset_0_calc(var(--u)*-3)_calc(var(--u)*2)_rgba(0,0,0,0.25),inset_0_calc(var(--u)*2)_calc(var(--u)*2)_rgba(179,179,179,0.25)]";
