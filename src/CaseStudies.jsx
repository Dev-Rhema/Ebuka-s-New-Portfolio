import { CaseStudyData } from "./Data";
import { Naira, Plus } from "./components/StatSymbols";
import { Fabric } from "./components/Fabric";
import { WavingFlag } from "./components/WavingFlag";

const label =
  "font-['Geist'] text-[calc(var(--u)*16)] leading-none font-medium tracking-[-0.04em] text-[#838383] uppercase";

function CaseStudy({ study }) {
  const { stat, testimonial } = study;

  return (
    <article className="mt-[calc(var(--u)*26)]">
      <div className="grid grid-cols-[calc(var(--u)*759)_1fr]">
        <div>
          <div className="relative h-[calc(var(--u)*48)] w-[calc(var(--u)*94)]">
            {study.logoFlag && (
              // The pennant's spot on the 94×48 staff
              <div className="absolute top-[calc(var(--u)*15.744)] left-[calc(var(--u)*4.91)] h-[calc(var(--u)*13.25)] w-[calc(var(--u)*88.85)]">
                <WavingFlag image={study.logoFlag} />
              </div>
            )}
            {/* Staff drawn over the cloth's edge, as in the original logo */}
            <img
              src={study.logo}
              alt=""
              className="pointer-events-none relative size-full"
            />
          </div>
          <h3 className="mt-[calc(-16*var(--u))] font-['DM-Serif'] text-[calc(var(--u)*40)] leading-none tracking-[-0.02em] text-black">
            {study.name}
          </h3>
          <p className="mt-[calc(var(--u)*16)] max-w-[calc(var(--u)*560)] font-['Geist'] text-[calc(var(--u)*28)] leading-[calc(var(--u)*28)] font-medium tracking-[-0.025em] text-[#6a6a6a]">
            {study.headline}
          </p>
        </div>

        <div className="pt-[calc(var(--u)*32)]">
          <p className="font-['Geist'] text-[calc(var(--u)*20)] leading-[calc(var(--u)*26)] font-medium tracking-[-0.04em] text-[#838383]">
            {study.summary}
          </p>
          <a
            href={study.link}
            className="mt-[calc(var(--u)*20)] inline-flex items-center gap-[calc(var(--u)*5)] font-['Geist'] text-[calc(var(--u)*20)] leading-none font-medium tracking-[-0.04em] text-black"
          >
            Read Case Study
            <svg
              viewBox="0 0 20 14"
              className="w-[calc(var(--u)*20)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M0 7h18M12 1l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-[calc(var(--u)*24)] grid h-[calc(var(--u)*447)] grid-cols-[calc(var(--u)*794)_1fr] gap-[calc(var(--u)*16)]">
        {study.fabricCover ? (
          <Fabric image={study.cover} />
        ) : (
          <img
            src={study.cover}
            alt={`${study.name} case study`}
            className="size-full rounded-[calc(var(--u)*8)] object-cover"
          />
        )}

        <div className="flex flex-col gap-[calc(var(--u)*16)]">
          <div className="grid h-[calc(var(--u)*205)] shrink-0 grid-cols-2 overflow-hidden rounded-[calc(var(--u)*8)]">
            <div className="bg-[#f0d79e] pt-[calc(var(--u)*50)] pl-[calc(var(--u)*29.5)]">
              <span className="flex font-['DM-Serif'] text-[calc(var(--u)*64)] leading-[0.75] tracking-[-0.02em] whitespace-nowrap text-black">
                {stat.naira && <Naira />}
                {stat.value}
                <Plus />
              </span>
              <p className="mt-[calc(var(--u)*22)] max-w-[calc(var(--u)*160)] font-['Geist'] text-[calc(var(--u)*24)] leading-[calc(var(--u)*28)] font-medium tracking-[-0.04em] text-[#4d4d4d]">
                {stat.label}
              </p>
            </div>
            {stat.image ? (
              <img src={stat.image} alt="" className="size-full object-cover" />
            ) : (
              <div className="bg-[#d9d9d9]" />
            )}
          </div>

          <figure className="flex-1 rounded-[calc(var(--u)*8)] bg-[#e5e5e5] px-[calc(var(--u)*16)] pt-[calc(var(--u)*16)]">
            <p className="font-['DM-Serif'] text-[calc(var(--u)*30)] leading-[calc(var(--u)*31)] tracking-[-0.02em] text-black">
              {testimonial.title}
            </p>
            <blockquote className="mt-[calc(var(--u)*16)] font-['Geist'] text-[calc(var(--u)*20)] leading-[calc(var(--u)*26)] font-medium tracking-[-0.04em] text-[#838383]">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-[calc(var(--u)*14)] flex items-center gap-[calc(var(--u)*16)]">
              <img
                src={testimonial.avatar}
                alt=""
                className="size-[calc(var(--u)*48)]"
              />
              <div className="font-['Geist'] text-[calc(var(--u)*16)] leading-[calc(var(--u)*24)] font-medium tracking-[-0.04em]">
                <p className="text-[#4d4d4d] italic">{testimonial.name}</p>
                <p className="text-[#9a9a9a]">{testimonial.role}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </article>
  );
}

function CaseStudies() {
  return (
    <section className="bg-white px-[5.556vw] pt-[calc(var(--u)*34.5)] pb-[calc(var(--u)*32)] [--u:calc(100vw/1440)]">
      <p className={label}>Selected case studies</p>

      {CaseStudyData.map((study) => (
        <CaseStudy key={study.id} study={study} />
      ))}
    </section>
  );
}

export default CaseStudies;
