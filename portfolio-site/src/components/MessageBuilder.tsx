import { useMemo, useRef, useState } from 'react';
import { Check, Copy, Mail, Send, TriangleAlert } from 'lucide-react';
import { site } from '../data/site';
import { copyText, selectText } from '../lib/clipboard';
import type { CopyOutcome } from '../lib/clipboard';

type Status = 'idle' | 'error' | 'done';

/** Вид блока: светлый на бумаге и тёмный в секции связи. */
type Tone = 'light' | 'dark';

export type MessageBuilderProps = {
  /** Текст, который посетитель отправит сам. */
  message: string;
  /** Тема письма. */
  subject: string;
  heading: string;
  /** Пояснение под заголовком. */
  note?: string;
  /** Кнопка отправки выключена, пока нет согласия на обработку данных. */
  requireConsent?: boolean;
  tone?: Tone;
  idPrefix?: string;
};

const text = {
  light: {
    idle: 'text-ink-soft',
    strong: 'text-ink',
    accent: 'text-accent',
    panel: 'border border-line bg-paper',
    field:
      'border border-line bg-paper-2 text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none',
  },
  dark: {
    idle: 'text-paper/60',
    strong: 'text-paper',
    accent: 'text-accent-soft',
    panel: 'border border-paper/25 bg-ink',
    field:
      'border border-paper/25 bg-night-2 text-paper placeholder:text-paper/40 focus:border-accent focus:outline-none',
  },
} as const;

/** Название действия для каждого исхода копирования. */
function describe(outcome: CopyOutcome): Status {
  return outcome === 'copied' ? 'done' : 'error';
}

/**
 * Подготовка сообщения: посетитель копирует готовый текст, а отправляет его сам —
 * в Telegram или письмом. Копирование, открытие мессенджера и отправка — разные
 * действия, и интерфейс говорит об этом прямо.
 */
export function MessageBuilder({
  message,
  subject,
  heading,
  note,
  requireConsent = false,
  tone = 'light',
  idPrefix = 'message',
}: MessageBuilderProps) {
  const theme = text[tone];
  const [consent, setConsent] = useState(!requireConsent);
  const [status, setStatus] = useState<Status>('idle');
  const [outcome, setOutcome] = useState<CopyOutcome | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const mailto = useMemo(
    () => `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    [message, subject],
  );

  const copy = async () => {
    const result = await copyText(message);
    setOutcome(result);
    setStatus(describe(result));
    if (result !== 'copied') selectText(areaRef.current);
  };

  return (
    <div className={theme.panel + ' p-5 sm:p-6'}>
      <p className={`label-mono ${theme.accent}`}>Подготовка сообщения</p>
      <h3 className={`font-display mt-3 text-xl font-bold sm:text-2xl ${theme.strong}`}>{heading}</h3>
      {note && <p className={`mt-3 text-[14px] leading-relaxed ${theme.idle}`}>{note}</p>}

      <label className={`label-mono mt-5 block ${theme.idle}`} htmlFor={`${idPrefix}-text`}>
        Текст сообщения — можно поправить перед отправкой
      </label>
      <textarea
        id={`${idPrefix}-text`}
        ref={areaRef}
        rows={7}
        value={message}
        readOnly
        spellCheck={false}
        onFocus={(event) => event.currentTarget.select()}
        className={`mt-2 w-full resize-y px-4 py-3 font-mono text-[13px] leading-relaxed ${theme.field}`}
      />

      {requireConsent && (
        <label className={`mt-4 flex items-start gap-3 text-[13px] leading-relaxed ${theme.idle}`}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[#d33a1c]"
          />
          <span>
            Согласен на обработку персональных данных и с{' '}
            <a href="./privacy.html" target="_blank" rel="noreferrer" className={`link-draw ${theme.strong}`}>
              политикой конфиденциальности
            </a>
            .
          </span>
        </label>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!consent}
          className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy className="size-4" aria-hidden="true" />
          Скопировать текст
        </button>

        <a
          href={site.telegram}
          target="_blank"
          rel="noreferrer"
          className={`btn flex-1 ${tone === 'dark' ? 'border border-paper/40 text-paper hover:bg-paper hover:text-ink' : 'btn-ghost'}`}
        >
          <Send className="size-4" aria-hidden="true" />
          Открыть Telegram
        </a>

        <a
          href={consent ? mailto : undefined}
          aria-disabled={!consent}
          onClick={(event) => {
            if (!consent) event.preventDefault();
          }}
          className={`btn flex-1 ${tone === 'dark' ? 'border border-paper/40 text-paper hover:bg-paper hover:text-ink' : 'btn-ghost'} ${
            consent ? '' : 'cursor-not-allowed opacity-40'
          }`}
        >
          <Mail className="size-4" aria-hidden="true" />
          Написать на почту
        </a>
      </div>

      <div aria-live="polite" className="mt-4">
        {status === 'done' && (
          <p className={`flex items-start gap-2 text-[13px] leading-relaxed ${theme.accent}`}>
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Текст скопирован. Отправка — за вами: вставьте его в чат Telegram, в письмо или в другое
              приложение. Заявка считается отправленной только после этого.
            </span>
          </p>
        )}

        {status === 'error' && (
          <p
            role="alert"
            className={`flex items-start gap-2 text-[13px] leading-relaxed ${
              tone === 'dark' ? 'text-accent-soft' : 'text-accent'
            }`}
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {outcome === 'unsupported'
                ? 'Браузер не даёт скопировать автоматически. Текст уже выделен — скопируйте его вручную (Ctrl+C или ⌘+C) и вставьте в чат или письмо.'
                : 'Не удалось скопировать автоматически. Текст уже выделен — скопируйте его вручную (Ctrl+C или ⌘+C). Он остаётся на странице, ничего не потеряно.'}
            </span>
          </p>
        )}
      </div>

      <p className={`label-mono mt-5 leading-relaxed ${theme.idle}`}>
        Кнопки ниже ничего не отправляют сами: «Открыть Telegram» открывает чат, «Написать на почту» —
        письмо с готовым текстом. Подтверждение заявки — только ответ исполнителя.
      </p>
    </div>
  );
}
