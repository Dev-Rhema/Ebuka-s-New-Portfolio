import CircularGallery from "./components/CircularGallery";
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

const u = (value) => `calc(var(--u) * ${value})`;

function SkillCardFace({ skill }) {
  const { icon } = skill;

  return (
    <>
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
    </>
  );
}

function SkillCard({ skill, slot }) {
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
      <SkillCardFace skill={skill} />
    </li>
  );
}

function Skills() {
  return (
    <section className="overflow-hidden bg-white px-[calc(var(--u)*24)] pt-[calc(var(--u)*25.5)] text-center [--u:calc(100vw/440)] md:overflow-visible md:px-[3.125vw] xl:px-[5.556vw] md:pt-[calc(var(--u)*56)] md:[--u:calc(100vw/1440)]">
      <p className={sectionLabel}>Skills geared towards growth</p>
      <h2
        className={`mx-auto mt-[calc(var(--u)*10.5)] md:mt-[calc(var(--u)*12)] md:max-w-[calc(var(--u)*440)] ${sectionHeading}`}
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
        className="relative mt-[calc(var(--u)*59)] h-[calc(var(--u)*316)] md:mt-[calc(var(--u)*40)] md:h-[calc(var(--u)*435)]"
      >
        <ul className="hidden md:block">
          {SkillsData.map((skill, index) => (
            <SkillCard key={skill.title} skill={skill} slot={FAN[index]} />
          ))}
        </ul>

        <CircularGallery
          items={SkillsData}
          getKey={(skill) => skill.title}
          renderItem={(skill) => <SkillCardFace skill={skill} />}
          itemClassName="overflow-hidden rounded-[calc(var(--u)*8)]"
          itemStyle={{ width: u(CARD_W), height: u(CARD_H) }}
          className="-mx-[calc(var(--u)*24)] h-full md:hidden"
        />

        <img
          loading="lazy"
          src={skillDome}
          alt=""
          className="absolute top-[calc(var(--u)*219)] left-1/2 max-w-none -translate-x-1/2 md:top-[calc(var(--u)*196)]"
          style={{ width: u(DOME_W), height: u(DOME_H) }}
        />
      </div>
    </section>
  );
}

export default Skills;
