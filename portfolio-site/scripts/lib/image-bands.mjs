// Разбор готового снимка на пустые полосы: длинные участки одного цвета означают,
// что страница снята до появления блоков или блоки не отрисовались.
// Используется в audit-image.mjs и в захвате скриншотов для кейсов.
import sharp from 'sharp';

/** Средний цвет строки и разброс яркости по строке. */
function rowStats(data, width, y, channels) {
  let r = 0;
  let g = 0;
  let b = 0;
  let min = 255;
  let max = 0;
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  return { r: r / width, g: g / width, b: b / width, spread: max - min };
}

const luminance = (color) => color.r * 0.299 + color.g * 0.587 + color.b * 0.114;

/**
 * Находит однотонные полосы длиннее minRun пикселей.
 * @param {Buffer|string} input буфер изображения или путь к файлу
 * @param {{minRun?: number, scale?: number}} options scale — доля ширины для ускорения разбора
 */
export async function findFlatBands(input, { minRun = 200, scale = 1 } = {}) {
  let image = sharp(input);
  const meta = await image.metadata();
  if (scale !== 1) image = image.resize({ width: Math.max(64, Math.round((meta.width ?? 800) * scale)) });

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const bands = [];
  let runStart = 0;
  let previous = null;
  let runColor = null;

  const flush = (end) => {
    const length = end - runStart;
    if (length >= minRun && runColor) {
      bands.push({
        from: runStart,
        to: end,
        px: length,
        share: Number((length / height).toFixed(4)),
        color: `rgb(${Math.round(runColor.r)}, ${Math.round(runColor.g)}, ${Math.round(runColor.b)})`,
        luminance: Math.round(luminance(runColor)),
      });
    }
  };

  for (let y = 0; y < height; y += 1) {
    const stats = rowStats(data, width, y, channels);
    const flat = stats.spread < 10 && (!previous || Math.abs(luminance(stats) - luminance(previous)) < 6);
    if (flat) {
      if (!runColor) {
        runColor = stats;
        runStart = y;
      }
      previous = stats;
    } else {
      if (runColor) flush(y);
      runColor = null;
      previous = stats;
    }
  }
  if (runColor) flush(height);

  bands.sort((a, b) => b.px - a.px);
  return { width, height, bands };
}

/** Суммарная доля высоты, занятая однотонными полосами длиннее minRun. */
export function blankShare(bands, height) {
  const total = bands.reduce((sum, band) => sum + band.px, 0);
  return height === 0 ? 0 : Number((total / height).toFixed(3));
}

/**
 * Доля высоты, где нет ни одной отметки: соседние полосы склеиваются.
 * У живого сайта с крупными отступами это 15–25 %, у снимка, снятого
 * до появления блоков, — больше половины.
 */
export function emptyShare(bands, height) {
  if (height === 0) return 0;
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  let empty = 0;
  let cursor = 0;
  for (const band of sorted) {
    const from = Math.max(band.from, cursor);
    if (band.to > from) {
      empty += band.to - from;
      cursor = band.to;
    }
  }
  return Number((empty / height).toFixed(3));
}
