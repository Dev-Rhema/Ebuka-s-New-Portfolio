import aboutStar from "./assets/AboutImgs/aboutStar.png";
import aboutBrands from "./assets/AboutImgs/aboutBrands.svg";
import shadowData from "./assets/AboutImgs/shadowData.svg";
import shadowDecisions from "./assets/AboutImgs/shadowDecisions.svg";
import Spiral from "./components/Spiral";
import { Naira, Plus } from "./components/StatSymbols";

const label =
  "font-['Geist'] text-[calc(var(--u)*16)] leading-none font-medium tracking-[-0.04em] text-[#838383] uppercase";

const stats = [
  { value: "20", label: "Brands Worked With" },
  { value: "3m", label: "New Customers Acquired" },
  { value: "3b", naira: true, label: "Total Revenue Generated" },
  { value: "35b", naira: true, label: "Total Inflow Attributed" },
];

function Star() {
  return (
    <img
      src={aboutStar}
      alt=""
      className="mr-[calc(var(--u)*2.5)] ml-[calc(var(--u)*3.5)] inline-block size-[calc(var(--u)*48)] align-[calc(var(--u)*-4)]"
    />
  );
}

function ShadowIcon({ src, className = "" }) {
  return (
    <span
      className={`relative inline-block size-[calc(var(--u)*40)] align-baseline ${className}`}
    >
      <img
        src={src}
        alt=""
        className="pointer-events-none absolute top-[calc(var(--u)*-5)] left-[calc(var(--u)*-232)] size-[calc(var(--u)*504)] max-w-none"
      />
    </span>
  );
}

function About() {
  return (
    <section className="relative bg-white px-[5.556vw] [--u:calc(100vw/1440)]">
      <p className={`absolute top-[calc(var(--u)*59)] left-[5.556vw] ${label}`}>
        About me
      </p>

      <p className="py-[calc(var(--u)*56)] indent-[calc(var(--u)*101.5)] font-['DM-Serif'] text-[calc(var(--u)*55)] leading-[calc(var(--u)*53.5)] tracking-[-0.01em] [word-spacing:-0.03em] text-[#838383]">
        With <Star /> <span className="text-black">7 years of experience</span>{" "}
        <Star /> I have helped brands{" "}
        <img
          src={aboutBrands}
          alt="piggyvest, SendSprint and Lenco"
          className="mr-[calc(var(--u)*-5)] ml-[calc(var(--u)*-3)] inline-block h-[calc(var(--u)*46)] w-auto align-[calc(var(--u)*-3)]"
        />{" "}
        grow by using <span className="text-black">data</span>{" "}
        <ShadowIcon src={shadowData} className="mx-[calc(var(--u)*-1)]" /> to make campaign decisions{" "}
        <ShadowIcon
          src={shadowDecisions}
          className="mr-[calc(var(--u)*-2)]"
        /> that significantly impacts{" "}
        <span className="text-black">revenue</span>
      </p>

      <div className="absolute top-[calc(var(--u)*301)] h-screen left-[calc(var(--u)*469)] w-[calc(var(--u)*581)] mask-[linear-gradient(transparent,black_18%,black_82%,transparent)]">
        <Spiral viewHeight={900} cardWidth={200} cardHeight={280} />
      </div>

      <div className="mt-[calc(var(--u)*64)] flex min-h-screen items-start justify-between">
        <div className="w-[calc(var(--u)*360)]">
          <p className={`mt-[calc(var(--u)*4)] ${label}`}>
            Trusted by incredible companies
          </p>
          <h2 className="mt-[calc(var(--u)*10)] font-['DM-Serif'] text-[calc(var(--u)*40)] leading-[1] tracking-[-0.02em] text-black">
            Making good brands great with data
          </h2>
          <p className="mt-[calc(var(--u)*14)] font-['Geist'] text-[calc(var(--u)*20)] leading-[1.3] font-medium tracking-[-0.04em] text-[#838383]">
            The difference between good and great is in the marketing. Let us
            make your brand great together
          </p>
          <a
            href="#contact"
            className="mt-[calc(var(--u)*18)] flex h-[calc(var(--u)*46)] w-[calc(var(--u)*144)] items-center justify-center bg-black font-['Geist'] text-[calc(var(--u)*16)] font-medium tracking-[-0.04em] text-white"
          >
            Book a Call
          </a>
        </div>

        <ul className="mb-[calc(var(--u)*56)] w-[calc(var(--u)*289)] self-end">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={`flex h-[calc(var(--u)*120)] items-start pt-[calc(var(--u)*36.5)] ${
                index < stats.length - 1
                  ? "bg-[repeating-linear-gradient(to_right,#d7d7d7_0_2px,transparent_2px_3px)] bg-[length:100%_1px] bg-bottom bg-no-repeat"
                  : ""
              }`}
            >
              <span className="flex w-[calc(var(--u)*136)] justify-end font-['DM-Serif'] whitespace-nowrap text-[calc(var(--u)*64)] leading-[0.75] tracking-[-0.02em] text-black">
                {stat.naira && <Naira />}
                {stat.value}
                <Plus />
              </span>
              <span className="ml-[calc(var(--u)*12)] w-[calc(var(--u)*141)] font-['Geist'] text-[calc(var(--u)*20)] leading-[calc(var(--u)*26)] font-medium tracking-[-0.04em] text-[#838383] [margin-top:calc(var(--u)*-1.5)]">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default About;
