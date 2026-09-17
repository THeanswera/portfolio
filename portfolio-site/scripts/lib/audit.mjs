// Разбор страницы в браузере на визуальные дефекты: пустые провалы между блоками,
// невидимый из-за анимации контент, не загруженные картинки, переполнение.
// Используется скриптом scripts/audit-visual.mjs и проверками кейсов.

/**
 * Раскрывает блоки, которые прячутся до скролла — и в портфолио, и в демо-мастерской.
 * Нужно, чтобы снимок и замеры показывали страницу целиком, а не первый экран.
 */
export const REVEAL_ALL = `
  (() => {
    const REVEAL = '[data-reveal], .head, .card, .promise, .step, .cta, .facts__item, .faq details, .split__aside, .note-line';
    document.querySelectorAll(REVEAL).forEach((el) => {
      el.classList.add('is-in', 'is-visible');
      el.style.transitionDelay = '0ms';
      el.style.transitionDuration = '0ms';
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
    // На всякий случай гасим и корневой класс анимаций, если он есть в проекте.
    document.querySelectorAll('[data-part]').forEach((el) => {
      el.classList.add('is-visible', 'is-in');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
    document.querySelectorAll('.frame__shot').forEach((img) => { img.style.animation = 'none'; });
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    try {
      localStorage.setItem('forma-cookie', 'all');
      localStorage.setItem('portfolio-cookie-consent', 'all');
    } catch {}
    document.querySelectorAll('[data-cookie], [data-cookie-consent]').forEach((el) => {
      if (el.tagName !== 'BODY') el.remove();
    });
    return true;
  })()`;

/** Плавно прокручивает страницу до конца, чтобы сработали наблюдатели и догрузились картинки. */
export const SCROLL_THROUGH = `
  (async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
    return true;
  })()`;

/**
 * Замер вертикальных провалов: где между соседними видимыми блоками зияет пустота.
 * Возвращает крупнейшие промежутки и контекст — что было до и что после.
 */
export const GAP_PROBE = `
  (() => {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const inViewportX = (r) => r.width > 1 && r.right > 0 && r.left < vw;

    const isPainted = (el) => {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      if (Number(s.opacity) < 0.05) return false;
      if (s.clipPath && s.clipPath !== 'none' && /inset\\([^)]*10[0-9]%/.test(s.clipPath)) return false;
      return true;
    };

    // Оставляем только элементы с собственным видимым содержимым: текст или картинка.
    const ownContent = (el) => {
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join('');
      if (text.length > 0) return true;
      if (el.tagName === 'IMG' || el.tagName === 'SVG' || el.tagName === 'CANVAS' || el.tagName === 'VIDEO') return true;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
      return false;
    };

    const blocks = [];
    document.querySelectorAll('body *').forEach((el) => {
      if (!isPainted(el) || !ownContent(el)) return;
      const r = el.getBoundingClientRect();
      if (r.height < 8 || !inViewportX(r)) return;
      if (r.width < 40) return;
      blocks.push({
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
        left: Math.round(r.left),
        width: Math.round(r.width),
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').split(/\\s+/).slice(0, 3).join(' '),
        text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 64),
      });
    });

    blocks.sort((a, b) => a.top - b.top);

    // Объединяем пересекающиеся блоки в «полосы контента».
    const bands = [];
    for (const b of blocks) {
      const last = bands[bands.length - 1];
      if (last && b.top <= last.bottom + 2) {
        last.bottom = Math.max(last.bottom, b.bottom);
        if (last.items.length < 6) last.items.push(b);
      } else {
        bands.push({ top: b.top, bottom: b.bottom, items: [b] });
      }
    }

    const gaps = [];
    for (let i = 1; i < bands.length; i += 1) {
      const gap = bands[i].top - bands[i - 1].bottom;
      if (gap < 140) continue;
      gaps.push({
        px: gap,
        from: bands[i - 1].bottom,
        to: bands[i].top,
        afterText: bands[i - 1].items[bands[i - 1].items.length - 1].text,
        afterCls: bands[i - 1].items[bands[i - 1].items.length - 1].cls,
        beforeText: bands[i].items[0].text,
        beforeCls: bands[i].items[0].cls,
      });
    }
    gaps.sort((a, b) => b.px - a.px);

    const hidden = [];
    document.querySelectorAll('[data-reveal], .head, .card, .promise, .step, .cta, .facts__item, .split__aside, .note-line')
      .forEach((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const opacity = Number(s.opacity);
        const clipped = s.clipPath && s.clipPath !== 'none';
        if ((opacity > 0.05 && !clipped && s.visibility !== 'hidden') || r.width < 20 || r.height < 20) return;
        hidden.push({
          cls: (typeof el.className === 'string' ? el.className : '').split(/\\s+/).slice(0, 3).join(' '),
          opacity,
          visibility: s.visibility,
          clipPath: clipped ? s.clipPath : '',
          top: Math.round(r.top + window.scrollY),
          height: Math.round(r.height),
          text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
        });
      });

    return {
      viewport: { width: vw, height: vh },
      docHeight: document.documentElement.scrollHeight,
      docScrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > vw + 1,
      bands: bands.length,
      contentBlocks: blocks.length,
      gaps: gaps.slice(0, 12),
      hiddenCount: hidden.length,
      hidden: hidden.slice(0, 12),
    };
  })()`;

/**
 * Прокручивает страницу так, как это делает человек: по экрану, с паузами.
 * Возвращает блоки, которые так и не появились — то есть пустые полосы,
 * которые видит посетитель. Именно так ловится забытый вызов наблюдателя появления.
 */
export const HUMAN_SCROLL_PROBE = `
  (async () => {
    const REVEAL = '[data-reveal], .head, .card, .promise, .step, .cta, .facts__item, .faq details, .split__aside, .note-line';
    const hiddenNow = () => [...document.querySelectorAll(REVEAL)].filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return Number(s.opacity) < 0.05 && r.height > 40 && r.width > 40;
    });

    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 420));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));

    return hiddenNow().map((el) => {
      const r = el.getBoundingClientRect();
      return {
        cls: (typeof el.className === 'string' ? el.className : '').split(/\\s+/).slice(0, 3).join(' '),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
      };
    });
  })()`;

/**
 * Изображения, которые не загрузились: битые адреса и отложенная загрузка,
 * до которой дело так и не дошло.
 */
export const IMAGE_PROBE = `
  (() => {
    const broken = [];
    const pending = [];
    document.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (img.complete && img.naturalWidth === 0) broken.push(src);
      else if (!img.complete) pending.push(src);
    });
    return { broken, pending };
  })()`;

/** Измеряет реальные промежутки между секциями верхнего уровня: где заканчивается контент и начинается следующий. */
export const SECTION_PROBE = `
  (() => {
    const vw = document.documentElement.clientWidth;
    const rows = [];
    document.querySelectorAll('main > section, main > * > section, footer').forEach((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      // Внутренние границы контента внутри секции: первый и последний видимый потомок.
      let innerTop = null;
      let innerBottom = null;
      el.querySelectorAll('*').forEach((child) => {
        const cs = getComputedStyle(child);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return;
        const cr = child.getBoundingClientRect();
        if (cr.width < 20 || cr.height < 8) return;
        if (cr.right < 0 || cr.left > vw) return;
        const top = cr.top + window.scrollY;
        const bottom = cr.bottom + window.scrollY;
        if (innerTop === null || top < innerTop) innerTop = top;
        if (innerBottom === null || bottom > innerBottom) innerBottom = bottom;
      });
      rows.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: (typeof el.className === 'string' ? el.className : '').split(/\\s+/).slice(0, 2).join(' '),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        contentTop: innerTop === null ? null : Math.round(innerTop),
        contentBottom: innerBottom === null ? null : Math.round(innerBottom),
        leadIn: innerTop === null ? null : Math.round(innerTop - (r.top + window.scrollY)),
        trailOut: innerBottom === null ? null : Math.round(r.bottom + window.scrollY - innerBottom),
      });
    });
    return rows;
  })()`;
