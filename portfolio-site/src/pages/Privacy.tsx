import { legal, site } from '../data/site';
import { Logo } from '../components/Logo';

const sections: { title: string; body: string[] }[] = [
  {
    title: '1. Общие положения',
    body: [
      `Настоящая политика описывает, как ${legal.operator} (далее — «исполнитель») обрабатывает персональные данные посетителей сайта ${site.name}, размещённого по адресу rootlost.online.`,
      `Оператор: ${legal.operator}, ${legal.status}, ИНН ${legal.inn}. Контакт для обращений: ${legal.email}, Telegram ${legal.telegram}.`,
      'Политика составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».',
    ],
  },
  {
    title: '2. Какие данные обрабатываются',
    body: [
      'Сайт не содержит регистрации, личного кабинета и форм, отправляющих данные на сервер. Обрабатываются только те данные, которые посетитель сообщает сам, если решает связаться:',
      '— имя или обращение;',
      '— контакт для ответа: имя пользователя в Telegram, номер телефона или адрес электронной почты;',
      '— описание задачи, которое посетитель пишет добровольно.',
      'Данные передаются исполнителю через мессенджер Telegram или по электронной почте — эти сервисы работают по своим правилам, с которыми можно ознакомиться на их сайтах.',
    ],
  },
  {
    title: '3. Cookie и локальное хранилище',
    body: [
      'Сайт не использует системы аналитики, рекламные и сторонние трекеры. В браузере сохраняется только техническая запись о вашем выборе в уведомлении об использовании cookie (localStorage).',
      'Вы можете удалить эту запись в настройках браузера в любой момент — работа сайта от этого не изменится.',
      'Хостинг-провайдер может вести стандартные серверные журналы обращений (IP-адрес, время, запрошенный адрес). Они нужны для работы и защиты сайта и обрабатываются провайдером.',
    ],
  },
  {
    title: '4. Цели и правовые основания',
    body: [
      'Цели обработки: ответ на обращение, обсуждение задачи, подготовка предложения и выполнение работ.',
      'Правовое основание — согласие посетителя, выраженное действием: отправкой сообщения исполнителю и отметкой о согласии в формах на сайте.',
    ],
  },
  {
    title: '5. Сроки обработки',
    body: [
      'Данные обрабатываются до достижения целей обработки: до завершения переписки или выполнения работ, либо до отзыва согласия.',
      'Если работа не началась, данные удаляются по запросу посетителя в течение трёх рабочих дней.',
    ],
  },
  {
    title: '6. Передача третьим лицам',
    body: [
      'Персональные данные не продаются, не публикуются и не передаются третьим лицам, кроме случаев, прямо предусмотренных законом.',
    ],
  },
  {
    title: '7. Права посетителя',
    body: [
      'Вы вправе запросить сведения об обработке ваших данных, потребовать их уточнения, блокирования или удаления, а также отозвать согласие.',
      `Для этого достаточно написать на ${legal.email} или в Telegram ${legal.telegram}. Запрос рассматривается в течение десяти рабочих дней.`,
    ],
  },
  {
    title: '8. Изменения политики',
    body: [
      `Актуальная редакция всегда размещена на этой странице. Дата последнего обновления: ${legal.updated}.`,
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink">
        <div className="container-x flex h-[68px] items-center justify-between gap-4 md:h-[80px]">
          <Logo withSubtitle={false} />
          <a href="index.html" className="btn btn-ghost min-h-11 px-4">
            Вернуться на сайт
          </a>
        </div>
      </header>

      <main className="container-x py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="label-mono flex items-center gap-3">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Документы
          </p>
          <h1 className="mt-6 text-[30px] leading-[1.05] font-extrabold hyphens-auto break-words sm:text-5xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            Коротко: сайт не собирает данные скрытно, не использует аналитику и трекеры. Данные
            появляются только тогда, когда посетитель сам решает написать исполнителю.
          </p>
        </div>

        <div className="mt-12 max-w-3xl border-t-2 border-ink">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-line py-7">
              <h2 className="font-display text-xl leading-tight font-bold text-ink md:text-2xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-2.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-relaxed text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t-2 border-ink bg-paper-2">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-8">
          <p className="label-mono">
            © {new Date().getFullYear()} {site.name}
          </p>
          <p className="label-mono">
            {site.telegramHandle} · {site.email}
          </p>
        </div>
      </footer>
    </div>
  );
}
