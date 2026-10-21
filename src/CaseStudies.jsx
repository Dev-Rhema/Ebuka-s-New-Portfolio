import { CaseStudyData } from "./Data";
import { Naira, Plus } from "./components/StatSymbols";
import { WavingFlag } from "./components/WavingFlag";
import { sectionLabel } from "./styles";

function CaseStudy({ study }) {
  const { stat, testimonial } = study;

  return (
    <article className="mb-[calc(var(--u)*32)]">
      <WavingFlag
        logo={study.logo}
        className="h-[calc(var(--u)*48)] w-[calc(var(--u)*94)]"
      />
      <h3 className="font-['DM-Serif'] text-[calc(var(--u)*28)] leading-none tracking-[-0.02em] text-black md:mt-[calc(var(--u)*16)] md:text-[calc(var(--u)*40)]">
        {study.name}
      </h3>

      <div className="mt-[calc(var(--u)*8)] md:grid md:grid-cols-[calc(var(--u)*759)_1fr]">
        <p className="font-['Geist'] text-[calc(var(--u)*18)] leading-[calc(var(--u)*20)] font-medium tracking-[-0.025em] text-black md:max-w-[calc(var(--u)*560)] md:tracking-[-0.02em] md:text-[calc(var(--u)*28)] md:leading-[calc(var(--u)*28)]">
          {study.headline}
        </p>

        <div className="mt-[calc(var(--u)*15.5)] md:mt-0">
          <p className="font-['Geist'] text-[calc(var(--u)*14)] leading-[calc(var(--u)*18)] font-medium tracking-[-0.04em] text-[#838383] md:text-[calc(var(--u)*20)] md:leading-[calc(var(--u)*26)]">
            {study.summary}
          </p>
          <a
            href={study.link}
            className="mt-[calc(var(--u)*19)] inline-flex items-center gap-[calc(var(--u)*9)] md:mt-[calc(var(--u)*20)] font-['Geist'] text-[calc(var(--u)*16)] leading-none font-medium tracking-[-0.04em] text-black md:gap-[calc(var(--u)*5)] md:text-[calc(var(--u)*20)]"
          >
            Read Case Study
            <svg
              viewBox="0 0 20 14"
              className="w-[calc(var(--u)*15)] md:w-[calc(var(--u)*20)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M0 7h18M12 1l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-[calc(var(--u)*23)] flex flex-col gap-[calc(var(--u)*16)] md:mt-[calc(var(--u)*30)] md:grid md:h-[calc(var(--u)*447)] md:grid-cols-[calc(var(--u)*794)_1fr]">
        <div className="h-[calc(var(--u)*188)] overflow-hidden rounded-[calc(var(--u)*8)] md:h-auto">
          <img
            loading="lazy"
            src={study.cover}
            alt={`${study.name} case study`}
            className="h-[calc(var(--u)*447)] w-[calc(var(--u)*794)] max-w-none -translate-x-[calc(var(--u)*32)] object-cover md:size-full md:translate-x-0"
          />
        </div>

        <div className="flex flex-col gap-[calc(var(--u)*16)]">
          <div className="relative flex h-[calc(var(--u)*188)] shrink-0 flex-col justify-end overflow-hidden rounded-[calc(var(--u)*8)] bg-[#d9d9d9] p-[calc(var(--u)*16)] text-white md:h-[calc(var(--u)*225)]">
            {stat.image && (
              <img
                loading="lazy"
                src={stat.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/35" />
            <span className="relative flex font-['DM-Serif'] text-[calc(var(--u)*48)] leading-[0.75] tracking-[-0.02em] whitespace-nowrap md:text-[calc(var(--u)*64)]">
              {stat.naira && <Naira />}
              {stat.value}
              {stat.plus && <Plus />}
            </span>
            <p className="relative mt-[calc(var(--u)*7)] font-['Geist'] text-[calc(var(--u)*20)] leading-[calc(var(--u)*24)] font-medium tracking-[-0.04em] md:mt-[calc(var(--u)*14)] md:text-[calc(var(--u)*24)] md:leading-[calc(var(--u)*28)]">
              {stat.label}
            </p>
          </div>

          <figure className="flex-1 rounded-[calc(var(--u)*8)] bg-[#e5e5e5] px-[calc(var(--u)*16)] pt-[calc(var(--u)*16)] pb-[calc(var(--u)*14)] md:pb-0">
            <p className="font-['Geist'] text-[calc(var(--u)*18)] leading-[calc(var(--u)*20)] font-medium tracking-[-0.04em] text-black md:text-[calc(var(--u)*24)] md:leading-[calc(var(--u)*26)]">
              {testimonial.title}
            </p>
            <blockquote className="mt-[calc(var(--u)*8.5)] font-['Geist'] text-[calc(var(--u)*14)] leading-[calc(var(--u)*18)] font-medium tracking-[-0.04em] text-[#838383] md:mt-[calc(var(--u)*16)] md:text-[calc(var(--u)*16)] md:leading-[calc(var(--u)*21)]">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-[calc(var(--u)*14)] flex items-center gap-[calc(var(--u)*15)] md:gap-[calc(var(--u)*16)]">
              <img
                loading="lazy"
                src={testimonial.avatar}
                alt=""
                className="m-[calc(-2*var(--u))] size-[calc(var(--u)*42)] max-w-none md:size-[calc(var(--u)*52)]"
              />
              <div className="font-['Geist'] text-[calc(var(--u)*14)] leading-[calc(var(--u)*21)] font-medium tracking-[-0.04em] md:text-[calc(var(--u)*16)] md:leading-[calc(var(--u)*24)]">
                <p className="text-[#4d4d4d] italic">{testimonial.name}</p>
                <p className="text-[calc(var(--u)*12)] text-[#9a9a9a] md:text-[calc(var(--u)*14)]">
                  {testimonial.role}
                </p>
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
    <section className="bg-white px-[calc(var(--u)*24)] pt-[calc(var(--u)*56)] [--u:calc(100vw/440)] md:pb-[calc(var(--u)*32)] md:px-[3.125vw] xl:px-[5.556vw] md:[--u:calc(100vw/1440)]">
      <p className={`mb-[calc(var(--u)*26)] ${sectionLabel}`}>
        Selected case studies
      </p>

      {CaseStudyData.map((study) => (
        <CaseStudy key={study.id} study={study} />
      ))}
    </section>
  );
}

export default CaseStudies;
