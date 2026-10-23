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
      className="-my-4 mr-4 ml-5 inline-block size-24 align-2 md:my-0 md:mr-2.5 md:ml-3.5 md:size-48 md:-align-4"
    />
  );
}

function ShadowIcon({ src, className = "" }) {
  return (
    <span
      className={`relative -my-6 inline-block size-32 align-1 md:my-0 md:size-40 md:align-baseline ${className}`}
    >
      <img
        loading="lazy"
        src={src}
        alt=""
        className="pointer-events-none absolute -top-4 -left-185.5 size-403.25 max-w-none md:-top-5 md:-left-232 md:size-504"
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
    <section className="relative flex flex-col overflow-x-clip bg-white px-24 unit-440 md:block md:px-[3.125vw] xl:px-[5.556vw] md:unit-1440">
      <p
        className={`mt-34 md:absolute md:top-59 md:left-[3.125vw] xl:left-[5.556vw] md:mt-0 ${sectionLabel}`}
      >
        About me
      </p>

      <p className="-mr-4 pt-12.5 font-['DM-Serif'] text-28 leading-33 tracking-[-0.01em] [word-spacing:-0.03em] text-[#838383] md:mr-0 md:py-56 md:indent-101.5 md:text-55 md:leading-53.5">
        With <Star /> <span className="text-black">7 years of experience</span>{" "}
        <Star />{" "}
        <br className="md:hidden" />
        I have helped brands{" "}
        <img
          loading="lazy"
          src={aboutBrands}
          alt="piggyvest, SendSprint and Lenco"
          className="-my-6 -mr-2.5 -ml-1.5 inline-block h-32 w-auto align-4 md:my-0 md:-mr-5 md:-ml-3 md:h-46 md:-align-3"
        />{" "}
        <br className="md:hidden" />
        grow by using <span className="text-black">data</span>{" "}
        <ShadowIcon
          src={shadowData}
          className="ml-3 md:-mx-1"
        /> to
        make <br className="md:hidden" />
        campaign decisions{" "}
        <ShadowIcon
          src={shadowDecisions}
          className="ml-1 md:-mr-2 md:ml-0"
        /> that <br className="md:hidden" />
        significantly impacts{" "}
        <span className="text-black">revenue</span>
      </p>

      <div className="order-last -mx-24 h-500 mask-[linear-gradient(transparent,black_18%,black_82%,transparent)] md:absolute md:top-301 md:left-469 md:mx-0 md:h-view md:w-581">
        <Spiral
          viewHeight={isMobile ? 906 : 900}
          radius={isTablet ? 270 : 300}
          cardWidth={200}
          cardHeight={280}
        />
      </div>

      <div className="mt-48 flex flex-col items-center md:mt-64 md:min-h-view md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center text-center md:block md:w-360 md:text-left">
          <p className={`mt-4 ${sectionLabel}`}>
            Trusted by incredible companies
          </p>
          <h2
            className={`mt-10 ${sectionHeading}`}
          >
            Making good brands great with data
          </h2>
          <p className="mt-16.5 font-['Geist'] text-16 leading-19 font-medium tracking-[-0.04em] text-[#838383] md:mt-14 md:text-20 md:leading-[1.3]">
            The difference between good and great is in the marketing. Let us
            make your brand great together
          </p>
          <a
            href="#contact"
            className={`mt-15.5 md:mt-18 ${callButton}`}
          >
            Book a Call
          </a>
        </div>

        <ul className="mt-16 w-200 md:mt-0 md:mb-56 md:w-289 md:self-end">
          {StatsData.map((stat, index) => (
            <li
              key={stat.label}
              className={`flex h-129 flex-col items-center pt-31.5 md:h-120 md:pt-36.5 md:flex-row md:items-start ${
                index < StatsData.length - 1
                  ? "bg-[repeating-linear-gradient(to_right,#d7d7d7_0_2px,transparent_2px_3px)] bg-[length:100%_1px] bg-bottom bg-no-repeat"
                  : ""
              }`}
            >
              <span className="flex justify-center font-['DM-Serif'] text-48 leading-[0.75] tracking-[-0.02em] whitespace-nowrap text-black md:w-136 md:justify-end md:text-64">
                {stat.naira && <Naira />}
                {stat.value}
                <Plus />
              </span>
              <span className="mt-22.5 font-['Geist'] text-18 leading-26 font-medium tracking-[-0.04em] text-[#838383] md:-mt-1.5 md:ml-12 md:w-141 md:text-20">
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
