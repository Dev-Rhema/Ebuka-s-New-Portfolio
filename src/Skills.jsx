import { SkillsData, skillCard } from "./Data";
import { callButton, sectionHeading, sectionLabel } from "./styles";

const CARD_W = 174;
const CARD_H = 244;
// Where each card's centre sits relative to the middle card's top centre,
// and its tilt, left to right
const FAN = [
  { x: -408, y: 110, angle: -24 },
  { x: -208, y: 33, angle: -12 },
  { x: 0, y: 0, angle: 0 },
  { x: 208, y: 33, angle: 12 },
  { x: 408, y: 110, angle: 24 },
];
// The icon circle's centre on the card
const ICON_Y = 62;

const u = (value) => `calc(var(--u) * ${value})`;

function SkillCard({ skill, slot }) {
  const { icon } = skill;

  return (
    <li
      className="absolute overflow-hidden rounded-[calc(var(--u)*8)]"
      style={{
        left: `calc(50% + ${u(slot.x)})`,
        top: u(CARD_H / 2 + slot.y),
        width: u(CARD_W),
        height: u(CARD_H),
        transform: `translate(-50%, -50%) rotate(${slot.angle}deg)`,
      }}
    >
      <img src={skillCard} alt="" className="absolute inset-0 size-full" />

      {/* Undo the tilt baked into the icon so it lines up with the card */}
      <div
        className="absolute left-1/2"
        style={{ top: u(ICON_Y), transform: `rotate(${-icon.rotation}deg)` }}
      >
        <img
          src={icon.src}
          alt=""
          className="absolute max-w-none"
          style={{
            left: u(-icon.center[0]),
            top: u(-icon.center[1]),
            width: u(icon.width),
          }}
        />
      </div>

      <div className="absolute inset-x-[calc(var(--u)*16)] top-[calc(var(--u)*96)] text-center">
        <h3 className="mx-auto max-w-[calc(var(--u)*100)] font-['DM-Serif'] text-[calc(var(--u)*18)] leading-[calc(var(--u)*18)] tracking-[-0.02em] text-white">
          {skill.title}
        </h3>
        <p className="mt-[calc(var(--u)*8)] font-['Geist'] text-[calc(var(--u)*14)] leading-[calc(var(--u)*18)] font-medium tracking-[-0.04em] text-[#838383]">
          {skill.description}
        </p>
      </div>
    </li>
  );
}

function Skills() {
  return (
    <section className="bg-white px-[5.556vw] pt-[calc(var(--u)*56)] pb-[calc(var(--u)*56)] text-center [--u:calc(100vw/1440)]">
      <p className={sectionLabel}>Skills geared towards growth</p>
      <h2
        className={`mx-auto mt-[calc(var(--u)*12)] max-w-[calc(var(--u)*440)] ${sectionHeading}`}
      >
        My core focus of services aims at growth
      </h2>
      <a
        href="#contact"
        className={`mx-auto mt-[calc(var(--u)*16)] ${callButton}`}
      >
        Book a Call
      </a>

      {/* The fade curves with the fan, so the outer cards fade out lower */}
      <ul className="relative mt-[calc(var(--u)*40)] h-[calc(var(--u)*300)] mask-[radial-gradient(circle_at_50%_calc(var(--u)*3102),transparent_calc(var(--u)*2857),black_calc(var(--u)*2937))]">
        {SkillsData.map((skill, index) => (
          <SkillCard key={skill.title} skill={skill} slot={FAN[index]} />
        ))}
      </ul>
    </section>
  );
}

export default Skills;
