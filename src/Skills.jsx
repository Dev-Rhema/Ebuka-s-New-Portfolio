import { useRef } from "react";
import {
  gsap,
  revealButton,
  revealOnScroll,
  ScrollTrigger,
  splitLines,
  useGSAP,
} from "./animation";
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

// The center card comes first in the DOM so the others fan out from behind it.
const FAN_CARDS = SkillsData.map((skill, index) => ({
  skill,
  slot: FAN[index],
})).sort((a, b) => Number(b.slot.angle === 0) - Number(a.slot.angle === 0));

function SkillCardFace({ skill }) {
  const { icon } = skill;

  return (
    <>
      <img
        loading="lazy"
        src={skillCard}
        alt=""
        className="absolute inset-0 size-full"
      />

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
      data-angle={slot.angle}
      className={`skill-card absolute left-1/2 h-244 w-174 overflow-hidden rounded-8 ${slot.className}`}
    >
      <SkillCardFace skill={skill} />
    </li>
  );
}

function Skills({ play }) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.set(".skills-intro", { autoAlpha: 0 });
      // GSAP owns the cards' transforms so the reveal can animate their position and angle.
      gsap.set(".skill-card", {
        xPercent: -50,
        yPercent: -50,
        rotation: (i, card) => Number(card.dataset.angle),
      });
    },
    { scope: container },
  );

  useGSAP(
    () => {
      if (!play) return;

      const find = (selector) => container.current.querySelector(selector);

      // Starts once the intro is a quarter of the way up the screen; the fan has its own trigger.
      revealOnScroll(
        find(".skills-intro"),
        (tl) => {
          const label = splitLines(find(".skills-label"));
          const heading = splitLines(find(".skills-heading"));
          const cards = gsap.utils.toArray(".skill-card", container.current);
          const center = cards.find((card) => card.dataset.angle === "0");

          tl.from(label.lines, { yPercent: 100 }, 0).from(
            heading.lines,
            { yPercent: 100, stagger: 0.1 },
            0.1,
          );
          revealButton(tl, find(".skills-button"), 0.6);
          // Every part of the intro now starts hidden by its own tween.
          gsap.set(find(".skills-intro"), { autoAlpha: 1 });

          // The cards wait as one stack until the whole stack is on screen, then fan out.
          const fan = gsap.from(cards, {
            x: (i, card) => center.offsetLeft - card.offsetLeft,
            rotation: 0,
            duration: 1,
            ease: "textReveal",
            paused: true,
          });
          const lowest = cards.find((card) => card.dataset.angle === "24");
          const fanTrigger = ScrollTrigger.create({
            trigger: lowest,
            start: "bottom bottom",
            once: true,
            onEnter: () => fan.play(),
          });

          return (done) => {
            [label, heading].forEach((split) => split.revert());
            // Finishing the text must not cancel a fan that is still waiting.
            if (done) return;
            fanTrigger.kill();
            fan.revert();
          };
        },
        "top 75%",
      );
    },
    { dependencies: [play], scope: container },
  );

  return (
    <section
      ref={container}
      className="overflow-hidden bg-white px-24 pt-25.5 text-center unit-440 md:overflow-visible md:px-[3.125vw] xl:px-[5.556vw] md:pt-56 md:unit-1440"
    >
      <div className="skills-intro">
        <p className={`skills-label ${sectionLabel}`}>
          Skills geared towards growth
        </p>
        <h2
          className={`skills-heading mx-auto mt-10.5 md:mt-12 md:max-w-440 ${sectionHeading}`}
        >
          My core focus of services aims at growth
        </h2>
        <a
          href="#contact"
          className={`skills-button mx-auto mt-16 ${callButton}`}
        >
          <span data-roll className="block">
            Book a Call
          </span>
        </a>
      </div>

      <div className="skills-fan relative mt-59 h-316 md:mt-40 md:h-435">
        <ul className="hidden md:block">
          {FAN_CARDS.map(({ skill, slot }) => (
            <SkillCard key={skill.title} skill={skill} slot={slot} />
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
