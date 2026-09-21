import { site } from '../data/site';
import { homeUrl } from '../lib/links';

/** Монограмма с типографскими метками-уголками. */
export function LogoMark({ className = 'size-10' }: { className?: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${className}`} aria-hidden="true">
      <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t-2 border-l-2 border-ink" />
      <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t-2 border-r-2 border-ink" />
      <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-ink" />
      <span className="absolute right-0 bottom-0 h-2.5 w-2.5 border-r-2 border-b-2 border-ink" />
      <span className="font-display text-[15px] leading-none font-bold tracking-tight text-ink">
        АМ
      </span>
    </span>
  );
}

export function Logo({ withSubtitle = true }: { withSubtitle?: boolean }) {
  return (
    <a
      // Логотип всегда ведёт на главную: на странице кейса якоря #top нет.
      href={homeUrl()}
      className="flex min-h-11 items-center gap-3"
      aria-label={`${site.name} — на главную`}
    >
      <LogoMark />
      <span className="flex flex-col">
        <span className="font-display text-[17px] leading-none font-bold tracking-tight text-ink">
          Александра Мельникова
        </span>
        {withSubtitle && (
          <span className="label-mono mt-1.5 hidden text-[9.5px] leading-none sm:block">
            верстка · сайты · wordpress
          </span>
        )}
      </span>
    </a>
  );
}
