/**
 * Параметрический чертёж кухни. Чистые функции без DOM —
 * один и тот же код рисует кухню при сборке страницы и в браузере,
 * когда посетитель меняет размеры или фасад.
 *
 * Система координат — сантиметры: 1 единица viewBox = 1 см.
 * Штрихи рисуются с vector-effect="non-scaling-stroke", поэтому остаются
 * волосяными при любом размере чертежа. Подписи размеров — не в SVG,
 * а в HTML поверх него: иначе на телефоне они становятся нечитаемыми.
 */

const PLINTH = 10; // цоколь
const BASE = 72; // корпус нижних шкафов
const WORKTOP = 4; // столешница
const COUNTER = PLINTH + BASE + WORKTOP; // 86 см — высота рабочей поверхности
const SPLASH = 60; // фартук
const UPPER = 72; // верхние шкафы
const TOP = COUNTER + SPLASH + UPPER; // 218 см — верх верхних шкафов
const CEILING = 250; // высота потолка на чертеже

const FLOOR = 300; // y пола
const M_LEFT = 24;
const M_RIGHT = 76;
const VB_H = 348;

const GAP = 0.7; // зазор между фасадами, см
const DIM_Y = 326; // линия размера под полом
const DIM_X = 40; // линия размера справа

/** Осветление и затемнение цвета — для мягкого объёма на плоском чертеже. */
export function shade(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  return `#${((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1)}`;
}

/** Делит длину на секции по ~target см: 320 см → 5 секций по 64 см. */
function sections(total, target) {
  const count = Math.max(1, Math.round(total / target));
  return Array.from({ length: count }, () => total / count);
}

/** Позиции секций: [{x, w, index}] */
function layoutSections(total, target, offset = 0) {
  const widths = sections(total, target);
  let x = offset;
  return widths.map((w, index) => {
    const item = { x, w, index };
    x += w;
    return item;
  });
}

const dim = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="d-dim" vector-effect="non-scaling-stroke"/>`;

/** Засечка размерной линии. */
const tick = (x, y, horizontal) =>
  horizontal
    ? dim(x, y - 4, x, y + 4)
    : dim(x - 4, y, x + 4, y);

/**
 * Фасад кухни (вид спереди) с размерами.
 * Возвращает HTML: SVG с геометрией и HTML-подписи поверх него.
 */
export function elevation({
  wall,
  facadeHex,
  worktopHex,
  uid = 'd',
  bg = '#151816',
  surface = '#1D211E',
  line = '#333A36',
  text = '#8E958F',
  compact = false,
}) {
  const W = Math.round(wall);
  const mRight = compact ? 16 : M_RIGHT;
  const y = (cm) => FLOOR - cm;
  // В карточке кадрируем пустоту над шкафами: чертёж занимает всю ширину.
  const topY = compact ? y(TOP) - 14 : y(CEILING);
  const vbY = compact ? topY : 0;
  const vbH = compact ? FLOOR + 12 - topY : VB_H;
  const VW = W + M_LEFT + mRight;
  const x0 = M_LEFT;
  const s = [];

  // --- стены и пол
  if (!compact) {
    s.push(`<line x1="6" y1="${y(CEILING)}" x2="${VW - 6}" y2="${y(CEILING)}" class="d-line d-dash" vector-effect="non-scaling-stroke"/>`);
    s.push(`<line x1="6" y1="${y(CEILING)}" x2="6" y2="${FLOOR}" class="d-line" vector-effect="non-scaling-stroke"/>`);
    s.push(`<line x1="${VW - 6}" y1="${y(CEILING)}" x2="${VW - 6}" y2="${FLOOR}" class="d-line" vector-effect="non-scaling-stroke"/>`);
  }
  s.push(`<line x1="0" y1="${FLOOR}" x2="${VW}" y2="${FLOOR}" class="d-floor" vector-effect="non-scaling-stroke"/>`);

  // --- фартук: плитка 15 × 15 см
  s.push(
    `<rect x="${x0}" y="${y(COUNTER + SPLASH)}" width="${W}" height="${SPLASH}" fill="url(#${uid}-tile)"/>`,
  );

  // --- корпус нижних шкафов
  s.push(`<rect x="${x0}" y="${y(COUNTER - WORKTOP)}" width="${W}" height="${BASE}" fill="${surface}"/>`);
  s.push(`<rect x="${x0}" y="${y(PLINTH)}" width="${W}" height="${PLINTH}" fill="${shade(surface, -0.35)}"/>`);

  // --- фасады нижних шкафов: двери и ящики по очереди
  const base = layoutSections(W, 60, x0);
  const sinkIndex = base.length >= 4 ? 1 : 0;
  const hobIndex = Math.min(2, base.length - 1);

  base.forEach(({ x, w, index }) => {
    const isDrawers = index % 3 === 1 && index !== sinkIndex;
    const fx = x + GAP / 2;
    const fw = w - GAP;
    const fy = y(COUNTER - WORKTOP) + GAP / 2;
    const fh = BASE - GAP;
    s.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${uid}-facade)"/>`);

    if (isDrawers) {
      for (let d = 1; d <= 2; d += 1) {
        const dy = fy + (fh / 3) * d;
        s.push(dim(fx, dy, fx + fw, dy));
        s.push(
          `<line x1="${fx + 6}" y1="${dy - 3}" x2="${fx + fw - 6}" y2="${dy - 3}" class="d-handle" vector-effect="non-scaling-stroke"/>`,
        );
      }
      s.push(
        `<line x1="${fx + 6}" y1="${fy + 3}" x2="${fx + fw - 6}" y2="${fy + 3}" class="d-handle" vector-effect="non-scaling-stroke"/>`,
      );
    } else {
      s.push(
        `<line x1="${fx + 6}" y1="${fy + 4}" x2="${fx + fw - 6}" y2="${fy + 4}" class="d-handle" vector-effect="non-scaling-stroke"/>`,
      );
    }
  });

  // --- столешница
  s.push(
    `<rect x="${x0 - 1}" y="${y(COUNTER)}" width="${W + 2}" height="${WORKTOP}" fill="url(#${uid}-top)"/>`,
  );
  s.push(dim(x0 - 1, y(COUNTER) + 0.6, x0 + W + 1, y(COUNTER) + 0.6));

  // --- смеситель над мойкой
  const sinkSection = base[sinkIndex];
  const tapX = sinkSection.x + sinkSection.w / 2;
  s.push(
    `<path d="M${tapX} ${y(COUNTER)} V${y(COUNTER + 20)} h8" class="d-tap" vector-effect="non-scaling-stroke"/>`,
  );

  // --- верхние шкафы
  s.push(`<rect x="${x0}" y="${y(TOP)}" width="${W}" height="${UPPER}" fill="${surface}"/>`);
  const upper = layoutSections(W, 60, x0);
  upper.forEach(({ x, w }) => {
    const fx = x + GAP / 2;
    const fw = w - GAP;
    const fy = y(TOP) + GAP / 2;
    const fh = UPPER - GAP;
    s.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${uid}-facade)"/>`);
    s.push(
      `<line x1="${fx + 6}" y1="${fy + fh - 4}" x2="${fx + fw - 6}" y2="${fy + fh - 4}" class="d-handle" vector-effect="non-scaling-stroke"/>`,
    );
  });

  // --- вытяжка: вырезаем верхний шкаф над варочной зоной и рисуем короб с трубой
  const hob = base[hobIndex];
  const hobX = hob.x + hob.w / 2;
  s.push(`<rect x="${hobX - 32}" y="${topY}" width="64" height="${y(COUNTER + SPLASH) - topY}" fill="${bg}"/>`);
  s.push(`<rect x="${hobX - 5}" y="${topY}" width="10" height="${y(190) - topY}" fill="${shade(surface, 0.08)}"/>`);
  s.push(`<rect x="${hobX - 30}" y="${y(190)}" width="60" height="40" fill="${shade(surface, 0.14)}"/>`);
  s.push(dim(hobX - 30, y(190) + 8, hobX + 30, y(190) + 8));

  // --- размеры
  if (!compact) {
    s.push(dim(x0, DIM_Y, x0 + W, DIM_Y));
    s.push(tick(x0, DIM_Y, true), tick(x0 + W, DIM_Y, true));
    s.push(dim(VW - DIM_X, y(COUNTER), VW - DIM_X, FLOOR));
    s.push(tick(VW - DIM_X, y(COUNTER), false), tick(VW - DIM_X, FLOOR, false));
  }

  const label = (left, top, content, cls = '') =>
    `<span class="draw__label ${cls}" style="left:${((left / VW) * 100).toFixed(2)}%;top:${(((top - vbY) / vbH) * 100).toFixed(2)}%">${content}</span>`;

  const labels = compact
    ? ''
    : [
        label(x0 + W / 2, DIM_Y + 14, `${W}\u00A0см`, 'draw__label--wide'),
        label(VW - DIM_X, (y(COUNTER) + FLOOR) / 2, `${COUNTER}`, 'draw__label--side'),
        label(VW - DIM_X, y(TOP) - 12, `${TOP}`, 'draw__label--side'),
      ].join('');

  return `<div class="draw${compact ? ' draw--compact' : ''}">
<svg class="draw__svg" viewBox="0 ${vbY} ${VW} ${vbH}" role="img" aria-label="Чертёж кухни: фасад шириной ${W} сантиметров, высота рабочей поверхности ${COUNTER} сантиметров" preserveAspectRatio="xMidYMid meet">
<defs>
<linearGradient id="${uid}-facade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${shade(facadeHex, 0.12)}"/>
<stop offset="1" stop-color="${shade(facadeHex, -0.06)}"/>
</linearGradient>
<linearGradient id="${uid}-top" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${shade(worktopHex, 0.16)}"/>
<stop offset="1" stop-color="${shade(worktopHex, -0.08)}"/>
</linearGradient>
<pattern id="${uid}-tile" width="15" height="15" patternUnits="userSpaceOnUse">
<rect width="15" height="15" fill="${shade(surface, 0.03)}"/>
<path d="M15 0 V15 M0 15 H15" stroke="${line}" stroke-width="0.35" opacity="0.55"/>
</pattern>
</defs>
${s.join('\n')}
</svg>
${labels}
</div>`;
}

/**
 * План помещения (вид сверху): показывает, как планировка распределяет гарнитур.
 */
export function plan({ layout, wall, uid = 'p', accent = '#C08A52', line = '#39403B', surface = '#1D211E' }) {
  const run = Math.min(wall, 300);
  // Комната ровно по длине стены: гарнитур занимает её целиком, поэтому углы
  // угловой и П-образной планировок смыкаются без разрыва. Раньше справа
  // оставалась полоса в 80 см, из-за неё правый угол П-образной пустовал.
  const roomW = Math.round(run);
  // Острову нужен проход с двух сторон, поэтому комната глубже.
  const roomD = layout === 'island' ? 360 : 300;
  const M = 20;
  const VW = roomW + M * 2;
  const VH = roomD + M * 2;
  const s = [];

  s.push(`<rect x="${M}" y="${M}" width="${roomW}" height="${roomD}" fill="none" class="d-line" vector-effect="non-scaling-stroke"/>`);

  // вход: проём в нижней стене со створкой. Ширина створки — не больше 40 %
  // стены, иначе на короткой стене она выходит за габарит комнаты.
  const doorW = Math.min(90, Math.round(roomW * 0.4));
  const doorX = M + roomW * 0.55;
  s.push(`<line x1="${doorX}" y1="${M + roomD}" x2="${doorX + doorW}" y2="${M + roomD}" stroke="var(--d-bg, #151816)" stroke-width="6" vector-effect="non-scaling-stroke"/>`);
  s.push(`<path d="M${doorX} ${M + roomD} A${doorW} ${doorW} 0 0 1 ${doorX + doorW} ${M + roomD - doorW}" fill="none" class="d-line d-dash" vector-effect="non-scaling-stroke"/>`);

  const cabinet = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${surface}" stroke="${accent}" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`;

  // основная стена — во всю ширину комнаты
  s.push(cabinet(M, M, roomW, 60));
  if (layout === 'corner' || layout === 'u') s.push(cabinet(M, M + 60, 60, 120));
  if (layout === 'u') s.push(cabinet(M + roomW - 60, M + 60, 60, 120));
  if (layout === 'island') {
    // Остров короче стены, иначе он упирается в боковые стены узкой комнаты.
    const islandW = Math.round(Math.min(180, roomW * 0.6) / 10) * 10;
    s.push(cabinet(M + (roomW - islandW) / 2, M + 150, islandW, 90));
  }

  // мойка и варочная зона на основной стене
  const sinkX = M + roomW * 0.3;
  const hobX = M + roomW * 0.68;
  s.push(`<circle cx="${sinkX}" cy="${M + 30}" r="13" fill="none" class="d-line" vector-effect="non-scaling-stroke"/>`);
  s.push(`<circle cx="${sinkX}" cy="${M + 30}" r="4" fill="${accent}" opacity="0.7"/>`);
  for (const [dx, dy] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) {
    s.push(`<circle cx="${hobX + dx}" cy="${M + 30 + dy}" r="5" fill="none" class="d-line" vector-effect="non-scaling-stroke"/>`);
  }

  return `<svg class="plan__svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="План помещения с расстановкой мебели" preserveAspectRatio="xMidYMid meet">${s.join('\n')}</svg>`;
}
