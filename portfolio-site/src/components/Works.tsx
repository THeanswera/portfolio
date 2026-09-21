import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { works } from '../data/site';
import type { Work } from '../data/site';
import { caseUrl } from '../lib/links';
import { plural } from '../lib/plural';
import { SectionHead } from './Services';
import { Reveal } from '../lib/reveal';
import { ScrollFrame } from './ScrollFrame';

const PREVIEW_WIDTH = 360;
const PREVIEW_MIN_Y = 92; // ниже фиксированной шапки

const caseHref = (work: Work) => caseUrl(work.id);

/** Метка состояния живой ссылки: обещать открытие недоступного демо нельзя. */
function LinkStatus({ work }: { work: Work }) {
  if (!work.url || work.urlDown) {
    return (
      <span className="label-mono inline-flex items-center border border-line px-2 py-1 text-ink-soft">
        демо недоступно — смотрите разбор
      </span>
    );
  }

  return (
    <a
      href={work.url}
      target="_blank"
      rel="noreferrer"
      className="link-draw label-mono inline-flex min-h-7 items-center gap-1.5 text-ink-soft hover:text-ink"
    >
      {work.urlLabel ?? 'открыть сайт'}
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </a>
  );
}

/** Устройства с настоящим курсором — только там включаем превью, следующее за мышью. */
function useHoverCapable() {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (min-width: 1024px)');
    const update = () => setCapable(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return capable;
}

/** Главный кейс: крупная подача вместо строки в списке. */
function Featured({ work }: { work: Work }) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
      <div>
        <p className="label-mono">Главный кейс · {work.tag}</p>
        <h3 className="font-display mt-5 text-[30px] leading-[1.05] font-bold text-ink sm:text-5xl">
          {work.title}
        </h3>
        <p className="measure mt-5 text-[16px] leading-relaxed text-ink-soft">{work.lead ?? work.summary}</p>

        {work.facts && (
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {work.facts.map((fact) => (
              <li key={fact.label}>
                <span className="font-display block text-2xl font-bold text-ink">{fact.value}</span>
                <span className="label-mono mt-1 block">{fact.label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href={caseHref(work)} className="btn btn-primary">
            Разобрать кейс
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <LinkStatus work={work} />
        </div>
      </div>

      <a href={caseHref(work)} aria-label={`Кейс «${work.title}»`} className="block">
        <ScrollFrame work={work} size="tall" caption={false} />
      </a>
    </article>
  );
}

export function Works() {
  const [featured, ...rest] = works;
  const [hovered, setHovered] = useState<Work | null>(null);
  const canHover = useHoverCapable();

  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // Превью держится рядом с курсором и не заезжает под шапку и за края экрана.
  const updateTarget = (clientX: number, clientY: number) => {
    const node = previewRef.current;
    const height = node?.offsetHeight ?? 250;
    const gap = 26;

    let x = clientX + gap;
    if (x + PREVIEW_WIDTH > window.innerWidth - 20) {
      x = clientX - PREVIEW_WIDTH - gap;
    }

    const y = Math.max(
      PREVIEW_MIN_Y,
      Math.min(clientY - height / 2, window.innerHeight - height - 20),
    );

    target.current = { x: Math.max(16, x), y };
  };

  useEffect(() => {
    if (!canHover) return;

    const onMove = (event: MouseEvent) => updateTarget(event.clientX, event.clientY);
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      const node = previewRef.current;
      if (node) {
        node.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame = window.requestAnimationFrame(loop);
    };

    let frame = window.requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [canHover]);

  return (
    <section id="works" className="section bg-paper-2">
      <div className="container-x">
        <Reveal>
          <SectionHead
            index="02 / 06"
            label="Работы"
            title="Проекты, которые можно открыть и потрогать"
            text="По каждой работе есть разбор: задача, что сделано, экраны и стек. Часть проектов — демонстрационные сайты вымышленных компаний; где живая ссылка не открывается, это указано прямо в карточке."
          />
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-12 border-t border-line pt-12">
            <Featured work={featured} />
          </div>
        </Reveal>
      </div>

      <div className="container-x mt-16">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <p className="label-mono">
              Ещё {rest.length} {plural(rest.length, 'работа', 'работы', 'работ')} · нажмите, чтобы открыть разбор
            </p>
            {canHover && (
              <span className="label-mono hidden lg:block">наведите на строку — сайт прокрутится</span>
            )}
          </div>
        </Reveal>

        <ul className="mt-2">
          {rest.map((work, index) => (
            <li
              key={work.id}
              onMouseEnter={(event) => {
                updateTarget(event.clientX, event.clientY);
                current.current = { ...target.current };
                setHovered(work);
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="grid w-full grid-cols-[46px_1fr] items-baseline gap-x-4 gap-y-3 border-b border-line py-6 md:grid-cols-[64px_1.4fr_1fr_auto_auto] md:items-center md:gap-6">
                <span className="index-num">{String(index + 1).padStart(2, '0')}</span>

                {/*
                  Ссылка на разбор занимает заголовок и метку, а живая ссылка на
                  сайт стоит отдельной колонкой. Вложенные <a> недопустимы, и
                  браузер разрывал бы такую разметку при разборе HTML.
                */}
                <a
                  href={caseHref(work)}
                  className="group col-start-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 md:col-span-2 md:col-start-auto md:grid md:grid-cols-[1.4fr_1fr] md:gap-6"
                >
                  <span className="font-display text-[26px] leading-tight font-bold text-ink transition-colors duration-300 group-hover:text-accent md:text-[34px]">
                    {work.title}
                  </span>
                  <span className="label-mono">{work.tag}</span>
                </a>

                <span className="col-start-2 md:col-start-auto">
                  <LinkStatus work={work} />
                </span>

                <a
                  href={caseHref(work)}
                  aria-label={`Разбор кейса «${work.title}»`}
                  className="group col-start-2 inline-flex items-center gap-3 md:col-start-auto"
                >
                  <span className="label-mono">{work.year}</span>
                  <ArrowUpRight
                    className="size-5 text-ink-soft transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6">
          <a href="./cases/" className="btn btn-ghost">
            Все кейсы отдельной страницей
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </p>
      </div>

      {/* Превью, следующее за курсором */}
      {canHover && (
        <div
          ref={previewRef}
          aria-hidden="true"
          className={`pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: PREVIEW_WIDTH, transform: 'translate3d(-600px, -600px, 0)' }}
        >
          {hovered && <ScrollFrame work={hovered} size="mini" caption={false} />}
        </div>
      )}
    </section>
  );
}
