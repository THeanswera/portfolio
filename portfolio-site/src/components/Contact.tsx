import { useMemo, useState } from 'react';
import { ArrowUpRight, Mail, RotateCcw, Send } from 'lucide-react';
import { site } from '../data/site';
import { privacyUrl } from '../lib/links';
import { Reveal } from '../lib/reveal';
import { MessageBuilder } from './MessageBuilder';

/**
 * Шаги квиза. Раньше первый шаг смешивал тип работы и наличие макета: можно было
 * выбрать «Лендинг по макету» вместе с «Только идея и описание» и получить
 * противоречивую заявку. Теперь тип работы и материалы — разные вопросы.
 */
const questions = [
  {
    id: 'goal',
    title: 'Что нужно сделать?',
    hint: 'Выберите подходящий вариант',
    options: [
      'Лендинг с нуля',
      'Вёрстка по готовому макету',
      'Многостраничный сайт',
      'WordPress с редактированием',
      'Доработка существующего сайта',
      'Нужна консультация',
    ],
  },
  {
    id: 'material',
    title: 'Что уже есть?',
    hint: 'Поможет оценить сроки',
    options: [
      'Готовый макет в Figma',
      'Техническое задание или описание',
      'Старый сайт, который нужно обновить',
      'Только идея',
    ],
  },
  {
    id: 'time',
    title: 'Когда нужно?',
    hint: 'Честный срок помогает спланировать',
    options: ['Как можно скорее', 'В течение месяца', 'Пока присматриваюсь'],
  },
] as const;

type Answers = Record<string, string>;

const summaryLabels: Record<string, string> = {
  goal: 'Задача',
  material: 'Есть',
  time: 'Срок',
};

/** Вопрос шага, на котором нужно уточнение. */
const clarification: Record<string, string> = {
  'Вёрстка по готовому макету':
    'Для вёрстки по макету нужен файл Figma. Если макета нет — это уже не вёрстка, а сборка сайта с нуля: напишите об этом в комментарии, и я предложу структуру.',
  'Готовый макет в Figma': 'Пришлите ссылку на макет — посмотрю сетку и состояния элементов до оценки.',
  'Доработка существующего сайта': 'Напишите адрес сайта и что именно не устраивает: так оценка будет точнее.',
};

export function Contact() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [comment, setComment] = useState('');

  const finished = step >= questions.length;
  const current = questions[step];

  const message = useMemo(() => {
    const lines = [
      'Здравствуйте! Пишу с сайта-портфолио.',
      '',
      `Задача: ${answers.goal ?? '—'}`,
      `Исходники: ${answers.material ?? '—'}`,
      `Срок: ${answers.time ?? '—'}`,
    ];
    if (comment.trim()) lines.push('', `Комментарий: ${comment.trim()}`);
    return lines.join('\n');
  }, [answers, comment]);

  const choose = (value: string) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setStep((prev) => Math.min(prev + 1, questions.length));
  };

  const back = () => setStep((prev) => Math.max(0, prev - 1));

  const reset = () => {
    setAnswers({});
    setComment('');
    setStep(0);
  };

  const hint = current ? clarification[answers[current.id] ?? ''] ?? null : null;

  return (
    <section id="contact" className="section bg-ink text-paper">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <div className="max-w-3xl">
                <div className="flex items-center gap-4">
                  <p className="label-mono text-paper/60">Связь</p>
                  <span className="h-px flex-1 bg-paper/20" aria-hidden="true" />
                  <p className="index-num">06 / 06</p>
                </div>
                <h2 className="mt-6 text-[34px] leading-[1.02] font-extrabold text-paper sm:text-4xl lg:text-[52px]">
                  Какой сайт вам нужен?
                </h2>
                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/70">
                  Опишите задачу своими словами — этого достаточно. Отвечу, предложу структуру и
                  скажу, сколько времени займёт работа.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-9 flex flex-col border-t border-paper/20">
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 border-b border-paper/20 py-5"
                >
                  <Send className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="label-mono block text-paper/50">
                      Telegram — самый быстрый способ
                    </span>
                    <span className="font-display mt-1 block text-lg font-bold text-paper break-all sm:text-xl">
                      {site.telegramHandle}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="ml-auto size-5 shrink-0 text-paper/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent('Задача по сайту')}`}
                  className="group flex items-center gap-4 border-b border-paper/20 py-5"
                >
                  <Mail className="size-5 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="label-mono block text-paper/50">Почта для ТЗ и файлов</span>
                    <span className="font-display mt-1 block text-lg font-bold text-paper break-all sm:text-xl">
                      {site.email}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="ml-auto size-5 shrink-0 text-paper/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <p className="label-mono mt-6 leading-relaxed text-paper/50">
                Отвечу лично в течение дня · Смотрю задачу до обсуждения цены · Telegram не
                обязателен: пишите на почту
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="border border-paper/25 bg-night-2 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1.5" aria-hidden="true">
                  {questions.map((question, index) => (
                    <span
                      key={question.id}
                      className={`h-1 flex-1 transition-colors duration-300 ${
                        index < step ? 'bg-accent' : 'bg-paper/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="label-mono text-paper/50">
                  {Math.min(step + 1, questions.length)} / {questions.length}
                </span>
              </div>

              {!finished && current ? (
                <div className="mt-6">
                  <h3 id="quiz-step-title" className="font-display text-2xl font-bold text-paper">
                    {current.title}
                  </h3>
                  <p className="label-mono mt-2 text-paper/50">{current.hint}</p>

                  <div className="mt-5 flex flex-col gap-2">
                    {current.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={answers[current.id] === option}
                        onClick={() => choose(option)}
                        className="group flex min-h-12 items-center gap-3 border border-paper/20 px-4 text-left text-[15px] text-paper/75 transition-colors hover:border-accent hover:text-paper"
                      >
                        <span
                          className="size-2 shrink-0 bg-paper/30 transition-colors group-hover:bg-accent"
                          aria-hidden="true"
                        />
                        {option}
                      </button>
                    ))}
                  </div>

                  {hint && (
                    <p className="mt-5 border-l-2 border-accent pl-3 text-[13px] leading-relaxed text-paper/60">
                      {hint}
                    </p>
                  )}

                  {step > 0 && (
                    <button
                      type="button"
                      onClick={back}
                      className="label-mono mt-5 text-paper/60 transition-colors hover:text-paper"
                    >
                      ← Назад
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="font-display text-2xl font-bold text-paper">Проверьте заявку</h3>

                  <dl className="mt-5 space-y-2.5">
                    {questions.map((question) => (
                      <div key={question.id} className="flex gap-3 text-[14px]">
                        <dt className="label-mono w-24 shrink-0 pt-0.5 text-paper/50">
                          {summaryLabels[question.id]}
                        </dt>
                        <dd className="text-paper/80">{answers[question.id] ?? '—'}</dd>
                      </div>
                    ))}
                  </dl>

                  <label className="label-mono mt-6 block text-paper/60" htmlFor="comment">
                    Комментарий — по желанию
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Например: нужен лендинг для услуги, макет в Figma, запуск к концу месяца"
                    className="mt-2 w-full resize-none border border-paper/25 bg-ink px-4 py-3 text-[15px] text-paper placeholder:text-paper/40 focus:border-accent focus:outline-none"
                  />

                  <div className="mt-6">
                    <MessageBuilder
                      idPrefix="quiz"
                      tone="dark"
                      requireConsent
                      heading="Готовое сообщение"
                      note="Проверьте текст — его можно поправить в комментарии выше. Копирование и отправка разделены: сначала скопируйте, потом вставьте в чат или письмо."
                      subject="Задача по сайту"
                      message={message}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={reset}
                      className="label-mono inline-flex items-center gap-2 text-paper/60 transition-colors hover:text-paper"
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      Заполнить заново
                    </button>
                    <a
                      href={privacyUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="label-mono text-paper/40 transition-colors hover:text-paper/70"
                    >
                      Политика конфиденциальности
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
