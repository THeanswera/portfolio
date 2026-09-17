import type { ConceptWork } from '../data/concepts';

/** Макеты концептов: интерфейсные кейсы в «печатной» палитре проекта. */
export function ConceptMock({ variant }: { variant: ConceptWork['mock'] }) {
  if (variant === 'dashboard') return <DashboardMock />;
  if (variant === 'uikit') return <UikitMock />;
  return <QuizMock />;
}

function DashboardMock() {
  const bars = [42, 58, 36, 70, 52, 84, 62, 76, 48, 68, 58, 88];
  const rows = [
    { id: '№4821', city: 'Москва', status: 'В пути' },
    { id: '№4820', city: 'Химки', status: 'Доставлено' },
    { id: '№4819', city: 'Одинцово', status: 'Задержка' },
  ];

  return (
    <div className="bg-paper p-4" aria-hidden="true">
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { label: 'Заказы', value: '1 284' },
          { label: 'В пути', value: '312' },
          { label: 'Среднее', value: '2 ч 14 м' },
        ].map((kpi) => (
          <div key={kpi.label} className="flex-1 border border-ink bg-paper-2 px-3 py-2">
            <p className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">
              {kpi.label}
            </p>
            <p className="font-display mt-1 text-lg leading-none font-bold text-ink">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-line bg-paper-2 p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">
            Заказы по часам
          </p>
          <span className="font-mono text-[9px] tracking-[0.14em] text-accent uppercase">live</span>
        </div>
        <div className="flex h-16 items-end gap-1">
          {bars.map((height, index) => (
            <span
              key={index}
              className={index === 11 ? 'flex-1 bg-accent' : 'flex-1 bg-ink/20'}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="flex items-center gap-3 border border-line bg-paper px-3 py-2"
          >
            <span className="font-mono text-[10px] text-ink">{row.id}</span>
            <span className="text-[11px] text-ink-soft">{row.city}</span>
            <span
              className={`ml-auto font-mono text-[9px] tracking-[0.1em] uppercase ${
                index === 2 ? 'text-accent' : 'text-ink-soft'
              }`}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UikitMock() {
  const swatches = ['#14120f', '#6e675e', '#d33a1c', '#ebe6db', '#f4f1ea'];

  return (
    <div className="bg-paper p-4" aria-hidden="true">
      <p className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">Цвета</p>
      <div className="mt-2 flex gap-1.5">
        {swatches.map((color) => (
          <span
            key={color}
            className="h-8 flex-1 border border-ink/30"
            style={{ background: color }}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">Шкала</p>
      <div className="mt-2 space-y-1.5">
        <p className="font-display text-xl font-bold text-ink">Заголовок H3</p>
        <p className="text-[13px] text-ink-soft">Основной текст интерфейса, 16/1.6</p>
        <p className="font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase">
          Метка · mono
        </p>
      </div>

      <p className="mt-4 font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">
        Компоненты
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="bg-ink px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-paper uppercase">
          Primary
        </span>
        <span className="border border-ink px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-ink uppercase">
          Ghost
        </span>
        <span className="border border-accent px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-accent uppercase">
          Focus
        </span>
        <span className="bg-ink/10 px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-ink-soft uppercase">
          Disabled
        </span>
      </div>

      <div className="mt-3 border border-line bg-paper-2 px-3 py-2">
        <p className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">E-mail</p>
        <div className="mt-2 h-1 w-1/3 bg-accent/70" />
        <p className="mt-1 font-mono text-[9px] text-ink-soft">Подсказка к полю</p>
      </div>
    </div>
  );
}

function QuizMock() {
  const options = ['Программирование', 'Дизайн интерфейсов', 'Аналитика данных'];

  return (
    <div className="bg-paper p-4" aria-hidden="true">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((step) => (
          <span key={step} className={`h-1 flex-1 ${step < 2 ? 'bg-accent' : 'bg-ink/15'}`} />
        ))}
        <span className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">2 / 3</span>
      </div>

      <p className="font-display mt-4 text-base font-bold text-ink">
        Какое направление интересно?
      </p>

      <div className="mt-3 space-y-1.5">
        {options.map((option, index) => (
          <div
            key={option}
            className={`flex items-center gap-2 border px-3 py-2 text-[11px] ${
              index === 1 ? 'border-accent bg-accent/10 text-ink' : 'border-line bg-paper-2 text-ink-soft'
            }`}
          >
            <span
              className={`grid size-3.5 place-items-center rounded-full border ${
                index === 1 ? 'border-accent bg-accent' : 'border-ink/30'
              }`}
            >
              {index === 1 && <span className="size-1.5 rounded-full bg-paper" />}
            </span>
            {option}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="bg-ink px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-paper uppercase">
          Далее
        </span>
        <span className="font-mono text-[9px] tracking-[0.14em] text-ink-soft uppercase">
          Шаг 2 из 3
        </span>
      </div>
    </div>
  );
}
