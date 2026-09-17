import { services } from '../data/site';
import { Reveal } from '../lib/reveal';

export function SectionHead({
  label,
  title,
  text,
  index,
}: {
  label: string;
  title: string;
  text?: string;
  index?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4">
        <p className="label-mono">{label}</p>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        {index && <p className="index-num">{index}</p>}
      </div>
      <h2 className="mt-6 text-[32px] leading-[1.02] font-extrabold sm:text-4xl lg:text-[52px]">
        {title}
      </h2>
      {text && <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">{text}</p>}
    </div>
  );
}

export function Services() {
  return (
    <section id="services" className="section">
      <div className="container-x">
        <Reveal>
          <SectionHead
            index="01 / 05"
            label="Услуги"
            title="Что можно отдать в работу"
            text="Шесть направлений: от сайта под ключ по вашей идее до точечных правок в готовом проекте."
          />
        </Reveal>

        <div className="mt-14 border-t-2 border-ink">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 40}>
              <article className="group grid gap-4 border-b border-line py-7 transition-colors duration-300 hover:bg-ink md:grid-cols-[70px_1fr_1.15fr] md:items-baseline md:gap-8">
                <span className="index-num">{service.index}</span>

                <h3 className="font-display text-2xl leading-tight font-bold text-ink transition-colors duration-300 group-hover:text-paper md:text-[26px]">
                  {service.title}
                </h3>

                <div>
                  <p className="text-[15px] leading-relaxed text-ink-soft transition-colors duration-300 group-hover:text-paper/75">
                    {service.benefit}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {service.tags.map((tag) => (
                      <li
                        key={tag}
                        className="tag-mono transition-colors duration-300 group-hover:border-paper/30 group-hover:bg-transparent group-hover:text-paper/70"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
