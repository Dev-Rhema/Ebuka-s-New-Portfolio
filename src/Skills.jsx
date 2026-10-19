import { SkillsData, skillCard, skillDome } from "./Data";
import { callButton, sectionHeading, sectionLabel } from "./styles";

const CARD_W = 174;
const CARD_H = 244;
const FAN = [
  { x: -408, y: 110, angle: -24 },
  { x: -208, y: 33, angle: -12 },
  { x: 0, y: 0, angle: 0 },
  { x: 208, y: 33, angle: 12 },
  { x: 408, y: 110, angle: 24 },
];
const ICON_Y = 62;
const DOME_W = 1268;
const DOME_H = 239;
const DOME_TOP = 196;

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
      <img loading="lazy" src={skillCard} alt="" className="absolute inset-0 size-full" />

      <div
        className="absolute left-1/2"
        style={{ top: u(ICON_Y), transform: `rotate(${-icon.rotation}deg)` }}
      >
        <img
          loading="lazy"
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
    <section className="bg-white px-[5.556vw] pt-[calc(var(--u)*56)] text-center [--u:calc(100vw/1440)]">
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

      <div
        className="relative mt-[calc(var(--u)*40)]"
        style={{ height: u(DOME_TOP + DOME_H) }}
      >
        <ul>
          {SkillsData.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} slot={FAN[index]} />
          ))}
        </ul>

        <img
          loading="lazy"
          src={skillDome}
          alt=""
          className="absolute left-1/2 max-w-none -translate-x-1/2"
          style={{ top: u(DOME_TOP), width: u(DOME_W), height: u(DOME_H) }}
        />
      </div>
    </section>
  );
}

export default Skills;
