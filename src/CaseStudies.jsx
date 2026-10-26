import { CaseStudyData } from "./Data";
import { Naira, Plus } from "./components/StatSymbols";
import { WavingFlag } from "./components/WavingFlag";
import { sectionLabel } from "./styles";

function CaseStudy({ study }) {
  const { stat, testimonial } = study;

  return (
    <article className="mb-32">
      <WavingFlag
        logo={study.logo}
        className="h-48 w-94"
      />
      <h3 className="font-['DM-Serif'] text-28 leading-none tracking-[-0.02em] text-black md:mt-16 md:text-40">
        {study.name}
      </h3>

      <div className="mt-8 md:grid md:grid-cols-headline">
        <p className="font-['Geist'] text-18 leading-20 font-medium tracking-[-0.025em] text-black md:max-w-560 md:tracking-[-0.02em] md:text-28 md:leading-28">
          {study.headline}
        </p>

        <div className="mt-15.5 md:mt-0">
          <p className="font-['Geist'] text-14 leading-18 font-medium tracking-[-0.04em] text-[#838383] md:text-20 md:leading-26">
            {study.summary}
          </p>
          <a
            href={study.link}
            className="mt-19 inline-flex items-center gap-9 md:mt-20 font-['Geist'] text-16 leading-none font-medium tracking-[-0.04em] text-black md:gap-5 md:text-20"
          >
            Read Case Study
            <svg
              viewBox="0 0 20 14"
              className="w-15 md:w-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M0 7h18M12 1l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-23 flex flex-col gap-16 md:mt-30 md:grid md:h-447 md:grid-cols-media">
        <div className="h-188 overflow-hidden rounded-8 md:h-auto">
          <img
            loading="lazy"
            src={study.cover}
            alt={`${study.name} case study`}
            className="h-447 w-794 max-w-none -translate-x-32 object-cover md:size-full md:translate-x-0"
          />
        </div>

        <div className="flex flex-col gap-16">
          <div className="relative flex h-188 shrink-0 flex-col justify-end overflow-hidden rounded-8 bg-[#d9d9d9] p-16 text-white md:h-225">
            {stat.image && (
              <img
                loading="lazy"
                src={stat.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/35" />
            <span className="relative flex font-['DM-Serif'] text-48 leading-[0.75] tracking-[-0.02em] whitespace-nowrap md:text-64">
              {stat.naira && <Naira />}
              {stat.value}
              {stat.plus && <Plus />}
            </span>
            <p className="relative mt-7 font-['Geist'] text-20 leading-24 font-medium tracking-[-0.04em] md:mt-14 md:text-24 md:leading-28">
              {stat.label}
            </p>
          </div>

          <figure className="flex-1 rounded-8 bg-[#e5e5e5] px-16 pt-16 pb-14 md:pb-0">
            <p className="font-['Geist'] text-18 leading-20 font-medium tracking-[-0.04em] text-black md:text-24 md:leading-26">
              {testimonial.title}
            </p>
            <blockquote className="mt-8.5 font-['Geist'] text-14 leading-18 font-medium tracking-[-0.04em] text-[#838383] md:mt-16 md:text-16 md:leading-21">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-14 flex items-center gap-15 md:gap-16">
              <img
                loading="lazy"
                src={testimonial.avatar}
                alt=""
                className="-m-2 size-42 max-w-none md:size-52"
              />
              <div className="font-['Geist'] text-14 leading-21 font-medium tracking-[-0.04em] md:text-16 md:leading-24">
                <p className="text-[#4d4d4d] italic">{testimonial.name}</p>
                <p className="text-12 text-[#9a9a9a] md:text-14">
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
    <section className="bg-white px-24 pt-56 unit-440 md:pb-32 md:px-[3.125vw] xl:px-[5.556vw] md:unit-1440">
      <p className={`mb-26 ${sectionLabel}`}>
        Selected case studies
      </p>

      {CaseStudyData.map((study) => (
        <CaseStudy key={study.id} study={study} />
      ))}
    </section>
  );
}

export default CaseStudies;
