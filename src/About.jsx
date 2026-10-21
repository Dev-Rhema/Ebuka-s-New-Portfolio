import { useEffect, useState } from "react";
import Spiral from "./components/Spiral";
import { Naira, Plus } from "./components/StatSymbols";
import {
  StatsData,
  aboutStar,
  aboutBrands,
  shadowData,
  shadowDecisions,
} from "./Data";
import { callButton, sectionHeading, sectionLabel } from "./styles";

function Star() {
  return (
    <img
      loading="lazy"
      src={aboutStar}
      alt=""
      className="-my-[calc(var(--u)*4)] mr-[calc(var(--u)*4)] ml-[calc(var(--u)*5)] inline-block size-[calc(var(--u)*24)] align-[calc(var(--u)*2)] md:my-0 md:mr-[calc(var(--u)*2.5)] md:ml-[calc(var(--u)*3.5)] md:size-[calc(var(--u)*48)] md:align-[calc(var(--u)*-4)]"
    />
  );
}

function ShadowIcon({ src, className = "" }) {
  return (
    <span
      className={`relative -my-[calc(var(--u)*6)] inline-block size-[calc(var(--u)*32)] align-[calc(var(--u)*1)] md:my-0 md:size-[calc(var(--u)*40)] md:align-baseline ${className}`}
    >
      <img
        loading="lazy"
        src={src}
        alt=""
        className="pointer-events-none absolute top-[calc(var(--u)*-4)] left-[calc(var(--u)*-185.6)] size-[calc(var(--u)*403.2)] max-w-none md:top-[calc(var(--u)*-5)] md:left-[calc(var(--u)*-232)] md:size-[calc(var(--u)*504)]"
      />
    </span>
  );
}

function useMedia(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function About() {
  const isMobile = !useMedia("(min-width: 768px)");
  const isDesktop = useMedia("(min-width: 1280px)");
  const isTablet = !isMobile && !isDesktop;

  return (
    <section className="relative flex flex-col overflow-x-clip bg-white px-[calc(var(--u)*24)] [--u:calc(100vw/440)] md:block md:px-[3.125vw] xl:px-[5.556vw] md:[--u:calc(100vw/1440)]">
      <p
        className={`mt-[calc(var(--u)*34)] md:absolute md:top-[calc(var(--u)*59)] md:left-[3.125vw] xl:left-[5.556vw] md:mt-0 ${sectionLabel}`}
      >
        About me
      </p>

      <p className="-mr-[calc(var(--u)*4)] pt-[calc(var(--u)*12.5)] font-['DM-Serif'] text-[calc(var(--u)*28)] leading-[calc(var(--u)*33)] tracking-[-0.01em] [word-spacing:-0.03em] text-[#838383] md:mr-0 md:py-[calc(var(--u)*56)] md:indent-[calc(var(--u)*101.5)] md:text-[calc(var(--u)*55)] md:leading-[calc(var(--u)*53.5)]">
        With <Star /> <span className="text-black">7 years of experience</span>{" "}
        <Star />{" "}
        <br className="md:hidden" />
        I have helped brands{" "}
        <img
          loading="lazy"
          src={aboutBrands}
          alt="piggyvest, SendSprint and Lenco"
          className="-my-[calc(var(--u)*6)] mr-[calc(var(--u)*-2.5)] ml-[calc(var(--u)*-1.5)] inline-block h-[calc(var(--u)*32)] w-auto align-[calc(var(--u)*4)] md:my-0 md:mr-[calc(var(--u)*-5)] md:ml-[calc(var(--u)*-3)] md:h-[calc(var(--u)*46)] md:align-[calc(var(--u)*-3)]"
        />{" "}
        <br className="md:hidden" />
        grow by using <span className="text-black">data</span>{" "}
        <ShadowIcon
          src={shadowData}
          className="ml-[calc(var(--u)*3)] md:mx-[calc(var(--u)*-1)]"
        /> to
        make <br className="md:hidden" />
        campaign decisions{" "}
        <ShadowIcon
          src={shadowDecisions}
          className="ml-[calc(var(--u)*1)] md:mr-[calc(var(--u)*-2)] md:ml-0"
        /> that <br className="md:hidden" />
        significantly impacts{" "}
        <span className="text-black">revenue</span>
      </p>

      <div className="order-last -mx-[calc(var(--u)*24)] h-[calc(var(--u)*773)] mask-[linear-gradient(transparent,black_18%,black_82%,transparent)] md:absolute md:top-[calc(var(--u)*301)] md:left-[calc(var(--u)*469)] md:mx-0 md:h-[min(100vh,calc(var(--u)*900))] md:w-[calc(var(--u)*581)]">
        <Spiral
          viewHeight={isMobile ? 1400 : 900}
          radius={isTablet ? 270 : 300}
          cardWidth={200}
          cardHeight={280}
        />
      </div>

      <div className="mt-[calc(var(--u)*48)] flex flex-col items-center md:mt-[calc(var(--u)*64)] md:min-h-[min(100vh,calc(var(--u)*900))] md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center text-center md:block md:w-[calc(var(--u)*360)] md:text-left">
          <p className={`mt-[calc(var(--u)*4)] ${sectionLabel}`}>
            Trusted by incredible companies
          </p>
          <h2
            className={`mt-[calc(var(--u)*10)] ${sectionHeading}`}
          >
            Making good brands great with data
          </h2>
          <p className="mt-[calc(var(--u)*16.5)] font-['Geist'] text-[calc(var(--u)*16)] leading-[calc(var(--u)*19)] font-medium tracking-[-0.04em] text-[#838383] md:mt-[calc(var(--u)*14)] md:text-[calc(var(--u)*20)] md:leading-[1.3]">
            The difference between good and great is in the marketing. Let us
            make your brand great together
          </p>
          <a
            href="#contact"
            className={`mt-[calc(var(--u)*15.5)] md:mt-[calc(var(--u)*18)] ${callButton}`}
          >
            Book a Call
          </a>
        </div>

        <ul className="mt-[calc(var(--u)*16)] w-[calc(var(--u)*200)] md:mt-0 md:mb-[calc(var(--u)*56)] md:w-[calc(var(--u)*289)] md:self-end">
          {StatsData.map((stat, index) => (
            <li
              key={stat.label}
              className={`flex h-[calc(var(--u)*129)] flex-col items-center pt-[calc(var(--u)*31.5)] md:h-[calc(var(--u)*120)] md:pt-[calc(var(--u)*36.5)] md:flex-row md:items-start ${
                index < StatsData.length - 1
                  ? "bg-[repeating-linear-gradient(to_right,#d7d7d7_0_2px,transparent_2px_3px)] bg-[length:100%_1px] bg-bottom bg-no-repeat"
                  : ""
              }`}
            >
              <span className="flex justify-center font-['DM-Serif'] text-[calc(var(--u)*48)] leading-[0.75] tracking-[-0.02em] whitespace-nowrap text-black md:w-[calc(var(--u)*136)] md:justify-end md:text-[calc(var(--u)*64)]">
                {stat.naira && <Naira />}
                {stat.value}
                <Plus />
              </span>
              <span className="mt-[calc(var(--u)*22.5)] font-['Geist'] text-[calc(var(--u)*18)] leading-[calc(var(--u)*26)] font-medium tracking-[-0.04em] text-[#838383] md:mt-[calc(var(--u)*-1.5)] md:ml-[calc(var(--u)*12)] md:w-[calc(var(--u)*141)] md:text-[calc(var(--u)*20)]">
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
