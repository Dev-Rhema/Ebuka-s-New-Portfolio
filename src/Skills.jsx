import CircularGallery from "./components/CircularGallery";
import { SkillsData, skillCard, skillDome } from "./Data";
import { callButton, sectionHeading, sectionLabel } from "./styles";

const FAN = [
  { className: "top-232 -ml-408", angle: -24 },
  { className: "top-155 -ml-208", angle: -12 },
  { className: "top-122", angle: 0 },
  { className: "top-155 ml-208", angle: 12 },
  { className: "top-232 ml-408", angle: 24 },
];

function SkillCardFace({ skill }) {
  const { icon } = skill;

  return (
    <>
      <img loading="lazy" src={skillCard} alt="" className="absolute inset-0 size-full" />

      <div
        className="absolute top-62 left-1/2"
        style={{ transform: `rotate(${-icon.rotation}deg)` }}
      >
        <img
          loading="lazy"
          src={icon.src}
          alt=""
          className={`absolute max-w-none ${icon.className}`}
        />
      </div>

      <div className="absolute inset-x-16 top-96 text-center">
        <h3 className="mx-auto max-w-100 font-['DM-Serif'] text-18 leading-18 tracking-[-0.02em] text-white">
          {skill.title}
        </h3>
        <p className="mt-8 font-['Geist'] text-14 leading-18 font-medium tracking-[-0.04em] text-[#838383]">
          {skill.description}
        </p>
      </div>
    </>
  );
}

function SkillCard({ skill, slot }) {
  return (
    <li
      className={`absolute left-1/2 h-244 w-174 overflow-hidden rounded-8 ${slot.className}`}
      style={{ transform: `translate(-50%, -50%) rotate(${slot.angle}deg)` }}
    >
      <SkillCardFace skill={skill} />
    </li>
  );
}

function Skills() {
  return (
    <section className="overflow-hidden bg-white px-24 pt-25.5 text-center unit-440 md:overflow-visible md:px-[3.125vw] xl:px-[5.556vw] md:pt-56 md:unit-1440">
      <p className={sectionLabel}>Skills geared towards growth</p>
      <h2
        className={`mx-auto mt-10.5 md:mt-12 md:max-w-440 ${sectionHeading}`}
      >
        My core focus of services aims at growth
      </h2>
      <a
        href="#contact"
        className={`mx-auto mt-16 ${callButton}`}
      >
        Book a Call
      </a>

      <div
        className="relative mt-59 h-316 md:mt-40 md:h-435"
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
          itemClassName="h-244 w-174 overflow-hidden rounded-8"
          className="-mx-24 h-full md:hidden"
        />

        <img
          loading="lazy"
          src={skillDome}
          alt=""
          className="absolute top-219 left-1/2 h-239 w-1268 max-w-none -translate-x-1/2 md:top-196"
        />
      </div>
    </section>
  );
}

export default Skills;
