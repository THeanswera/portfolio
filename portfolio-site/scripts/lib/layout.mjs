// Пробы для проверки вёрстки: наложение текста и случайные повторы слов.
//
// Повод: на демо «ТехРемонт» в css/style.css список селекторов остался без
// закрывающей скобки, и ссылки в крошках, подвале и контактах получили
// position: absolute. Часть текста уехала к левому краю и наложилась на другие
// слова. Глазами это видно не на каждой странице, а разбор прямоугольников
// находит все такие места сразу.

/**
 * Останавливает анимации, ждёт шрифты и раскрывает блоки, которые появляются
 * при прокрутке.
 *
 * Длительность обнуляется, а не отключение целиком: у анимаций с
 * `animation-fill-mode: forwards` элемент сразу получает конечное состояние.
 * Ожидание `document.fonts.ready` обязательно: ширина текста на подменном
 * шрифте другая, и без него проверка давала бы то замечание, то нет.
 */
export const FREEZE_MOTION = `(async () => {
  const style = document.createElement('style');
  style.textContent =
    '*, *::before, *::after {' +
    ' transition-duration: 0.001s !important;' +
    ' transition-delay: 0s !important;' +
    ' animation-duration: 0.001s !important;' +
    ' animation-delay: 0s !important; }' +
    '[data-reveal], .reveal { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  // Демо «ТехРемонт» включает прятание блоков атрибутом на <html>: снимаем его,
  // иначе часть страницы остаётся сдвинутой на translateY и меряется не на месте.
  document.querySelectorAll('[data-reveal="on"]').forEach((el) => el.setAttribute('data-reveal', 'off'));

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* шрифты не дождались — меряем как есть */ }
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return true;
})()`;

/**
 * Ищет прямоугольники текста, которые накладываются друг на друга, и текст,
 * выехавший за пределы своего контейнера.
 *
 * Сравниваются только куски текста из разных «потоков»: внутри одного блока
 * слова расставляет сама вёрстка, и накладываться там нечему. Поэтому наложение
 * двух слов всегда означает ошибку позиционирования, а не особенность шрифта.
 */
export const LAYOUT_PROBE = `(() => {
  const MIN_SIDE = 3;
  const MIN_RATIO = 0.12;
  const MAX_REPORT = 40;

  const items = [];
  const roots = [];
  const containers = [];

  function label(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      const name = node.tagName.toLowerCase();
      const cls =
        typeof node.className === 'string' && node.className.trim()
          ? '.' + node.className.trim().split(/\\s+/).slice(0, 2).join('.')
          : '';
      parts.unshift(name + cls);
      node = node.parentElement;
    }
    return parts.slice(-4).join(' > ');
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility !== 'function') return true;
    return el.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
      contentVisibilityAuto: true,
    });
  }

  /**
   * Скрытое от глаза, но не от разбора: блок для скринридера и ссылка «к
   * содержанию» сжаты до пикселя и обрезаны, а прямоугольник текста внутри них
   * остаётся настоящим. Без этой проверки они «наезжают» на всё подряд.
   */
  function isCollapsed(el) {
    let node = el;
    while (node && node !== document.body) {
      const box = node.getBoundingClientRect();
      if (box.width <= 2 && box.height <= 2) return true;
      const style = getComputedStyle(node);
      if (style.clipPath && style.clipPath !== 'none' && style.clipPath.indexOf('inset(50%') === 0) return true;
      node = node.parentElement;
    }
    return false;
  }

  /**
   * Всплывающее окно или липкая шапка: такое перекрывает содержимое по замыслу,
   * а не из-за ошибки позиционирования. Окно cookie поверх текста — не дефект.
   */
  function isFloating(el) {
    let node = el;
    while (node && node !== document.body) {
      const position = getComputedStyle(node).position;
      if (position === 'fixed' || position === 'sticky') return true;
      node = node.parentElement;
    }
    return false;
  }

  /** Ближайший предок, задающий поток: текст внутри одного такого блока не пересекается. */
  function flowRoot(el) {
    let node = el;
    while (node && node !== document.body) {
      const display = getComputedStyle(node).display;
      if (display !== 'inline' && display !== 'contents') return node;
      node = node.parentElement;
    }
    return document.body;
  }

  const rootIds = new Map();
  function rootId(el) {
    if (!rootIds.has(el)) {
      rootIds.set(el, roots.length);
      roots.push(el);
    }
    return rootIds.get(el);
  }

  /**
   * Поворот в оформлении: наклейка, «лист бумаги» в первом экране портфолио
   * повёрнуты на градус-другой. Прямоугольник повёрнутого блока шире его места
   * в сетке по построению, поэтому сравнивать его с колонкой нельзя.
   * Проверяются только поворот и наклон: сдвиг оставлен под проверкой, потому
   * что сдвиг как раз и уводит текст за сетку.
   */
  function isRotated(el) {
    let node = el;
    while (node && node !== document.body) {
      const transform = getComputedStyle(node).transform;
      if (transform && transform !== 'none') {
        const numbers = transform.match(/-?[\\d.]+(?:e-?\\d+)?/g);
        // matrix(a, b, c, d, e, f) и matrix3d(m11, m12, …): b — синус поворота.
        if (numbers && numbers.length >= 4) {
          if (Math.abs(Number(numbers[1])) > 0.001 || Math.abs(Number(numbers[2])) > 0.001) return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  /**
   * Ближайшая колонка сетки: текст не должен вылезать за её границы.
   *
   * Если между текстом и колонкой есть своя горизонтальная прокрутка (широкая
   * таблица цен), переполнение задумано автором: содержимое прокручивается
   * внутри блока и за сетку не выезжает. Такие куски пропускаем, а вот
   * обрезка на самой секции (например, на первом экране) — не повод
   * пропускать: она стоит выше колонки и к её границам отношения не имеет.
   */
  const containerIds = new Map();
  function gridInfo(el) {
    let node = el;
    let scroller = false;
    while (node && node !== document.body) {
      const isGrid = typeof node.className === 'string' && /(^|[-_])container/.test(node.className);
      if (isGrid) {
        if (scroller || isRotated(el)) return null;
        if (!containerIds.has(node)) {
          const box = node.getBoundingClientRect();
          containerIds.set(node, containers.length);
          containers.push({ left: box.left, right: box.right, path: label(node) });
        }
        return containerIds.get(node);
      }
      const overflowX = getComputedStyle(node).overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden' || overflowX === 'clip') {
        scroller = true;
      }
      node = node.parentElement;
    }
    return null;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.nodeValue || '').replace(/\\s+/g, ' ').trim();
    if (text.length < 2) continue;

    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') continue;
    if (!isVisible(parent) || isCollapsed(parent) || isFloating(parent)) continue;

    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects());
    if (rects.length === 0) continue;

    const root = rootId(flowRoot(parent));
    const container = gridInfo(parent);
    const path = label(parent);

    rects.forEach((rect) => {
      if (rect.width < 2 || rect.height < 2) return;
      items.push({
        text: text.slice(0, 70),
        path: path,
        root: root,
        container: container,
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      });
    });
  }

  const collisions = [];
  const seen = new Set();
  let collisionCount = 0;

  for (let i = 0; i < items.length; i += 1) {
    const a = items[i];
    for (let j = i + 1; j < items.length; j += 1) {
      const b = items[j];
      if (a.root === b.root) continue;
      if (a.y + a.h <= b.y || b.y + b.h <= a.y) continue;
      if (a.x + a.w <= b.x || b.x + b.w <= a.x) continue;

      const rootA = roots[a.root];
      const rootB = roots[b.root];
      if (rootA.contains(rootB) || rootB.contains(rootA)) continue;

      const width = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const height = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (width < MIN_SIDE || height < MIN_SIDE) continue;

      const area = width * height;
      const smaller = Math.min(a.w * a.h, b.w * b.h);
      if (area / smaller < MIN_RATIO) continue;

      collisionCount += 1;
      const key = a.path + '|' + b.path;
      if (seen.has(key) || collisions.length >= MAX_REPORT) continue;
      seen.add(key);
      collisions.push({
        a: { text: a.text, path: a.path, x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.w), h: Math.round(a.h) },
        b: { text: b.text, path: b.path, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) },
        overlap: { w: Math.round(width), h: Math.round(height), ratio: Math.round((area / smaller) * 100) },
      });
    }
  }

  const outside = [];
  const outsideSeen = new Set();
  for (const item of items) {
    if (item.container === null) continue;
    const box = containers[item.container];
    const left = Math.round(item.x - box.left);
    const right = Math.round(item.x + item.w - box.right);
    if (left >= -2 && right <= 2) continue;
    const key = item.path + '|' + item.text;
    if (outsideSeen.has(key)) continue;
    outsideSeen.add(key);
    outside.push({
      text: item.text,
      path: item.path,
      container: box.path,
      overLeft: left < -2 ? -left : 0,
      overRight: right > 2 ? right : 0,
    });
  }

  return {
    collisions: collisions,
    collisionCount: collisionCount,
    outside: outside,
    textRects: items.length,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  };
})()`;

/**
 * Ищет подряд идущие одинаковые слова: «цены указаны и указаны» — это опечатка,
 * которую при чтении легко пропустить, а в тексте она видна каждому.
 *
 * Слова собираются по блокам, а не по всей странице: иначе конец одной кнопки
 * и начало следующего заголовка склеиваются в «цены цены» и дают ложный сигнал.
 */
export const DOUBLED_WORDS_PROBE = `(() => {
  function flowRoot(el) {
    let node = el;
    while (node && node !== document.body) {
      const display = getComputedStyle(node).display;
      if (display !== 'inline' && display !== 'contents') return node;
      node = node.parentElement;
    }
    return document.body;
  }

  const groups = new Map();
  const order = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.nodeValue || '').replace(/\\s+/g, ' ').trim();
    if (!text) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') continue;
    const root = flowRoot(parent);
    if (!groups.has(root)) {
      groups.set(root, { text: '', path: '' });
      order.push(root);
    }
    const group = groups.get(root);
    group.text += ' ' + text;
    if (!group.path) {
      const name = parent.tagName.toLowerCase();
      const cls = typeof parent.className === 'string' && parent.className.trim()
        ? '.' + parent.className.trim().split(/\\s+/).slice(0, 1).join('')
        : '';
      group.path = name + cls;
    }
  }

  const connectors = ['и', 'не', 'или'];
  const found = [];
  for (const root of order) {
    const group = groups.get(root);
    // Слова короче двух букв не отбрасываем: без них «от «работает» до
    // «работает красиво»» выглядит как повтор подряд.
    const words = group.text.toLowerCase().match(/[а-яёa-z]{2,}/g) || [];
    for (let i = 0; i + 1 < words.length; i += 1) {
      let phrase = null;
      if (words[i + 1] === words[i]) phrase = words[i] + ' ' + words[i + 1];
      else if (connectors.includes(words[i + 1]) && words[i + 2] === words[i]) {
        phrase = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
      }
      if (phrase) found.push({ phrase: phrase, path: group.path });
    }
  }

  const unique = new Map();
  for (const item of found) unique.set(item.phrase + '|' + item.path, item);
  return Array.from(unique.values());
})()`;
