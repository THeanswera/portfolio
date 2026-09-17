import { X } from 'lucide-react';

export type CookieChoice = 'all' | 'necessary';

export const COOKIE_KEY = 'portfolio-cookie-consent';

/** Уведомление об использовании cookie и локального хранилища. */
export function CookieBanner({ onDecide }: { onDecide: (choice: CookieChoice) => void }) {
  return (
    <div
      role="dialog"
      aria-label="Использование cookie"
      className="fixed inset-x-3 bottom-3 z-70 mx-auto max-w-2xl border border-ink bg-paper p-5 sm:bottom-6 sm:left-6 sm:mx-0 sm:p-6"
      style={{ boxShadow: '8px 8px 0 0 var(--color-ink)' }}
    >
      <div className="flex items-start gap-4">
        <div>
          <p className="label-mono text-accent">Cookie</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Сайт использует технические cookie и локальное хранилище, чтобы запомнить ваш выбор и
            работу разделов. Аналитики, рекламных трекеров и передачи данных третьим лицам нет.
          </p>
          <a
            href="privacy.html"
            target="_blank"
            rel="noreferrer"
            className="link-draw label-mono mt-3 inline-flex min-h-7 items-center text-ink"
          >
            Политика конфиденциальности
          </a>
        </div>
        <button
          type="button"
          onClick={() => onDecide('necessary')}
          aria-label="Закрыть уведомление"
          className="ml-auto grid size-9 shrink-0 place-items-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => onDecide('all')} className="btn btn-primary flex-1">
          Принять
        </button>
        <button type="button" onClick={() => onDecide('necessary')} className="btn btn-ghost flex-1">
          Только необходимые
        </button>
      </div>
    </div>
  );
}
