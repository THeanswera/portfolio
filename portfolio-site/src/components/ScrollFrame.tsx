import { asset } from '../lib/asset';
import type { Work } from '../data/site';

type Size = 'mini' | 'default' | 'tall';

/**
 * Рамка браузера, внутри которой полная страница сайта медленно прокручивается.
 * Показывает то, чего не видно на статичном скриншоте: длину страницы и ритм блоков.
 */
export function ScrollFrame({
  work,
  size = 'default',
  caption = true,
}: {
  work: Work;
  size?: Size;
  caption?: boolean;
}) {
  const shot = work.scrollShot ?? work.shot;
  if (!shot) return null;

  const sizeClass = size === 'tall' ? 'frame--tall' : size === 'mini' ? 'frame--mini' : '';

  return (
    <figure className={`frame ${sizeClass}`}>
      <div className="frame__bar" aria-hidden="true">
        <span className="frame__dot" />
        <span className="frame__dot" />
        <span className="frame__dot" />
        <span className="frame__url">{work.urlLabel ?? work.title}</span>
      </div>
      <div className="frame__view">
        <img
          className="frame__shot"
          src={asset(shot)}
          alt={`Полная страница проекта «${work.title}»`}
          loading="lazy"
          decoding="async"
        />
      </div>
      {caption && (
        <figcaption className="label-mono mt-3">
          Страница прокручивается сама — наведите, чтобы ускорить
        </figcaption>
      )}
    </figure>
  );
}
