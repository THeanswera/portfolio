/**
 * Копирование текста в буфер обмена с честным результатом.
 *
 * Раньше ошибка Clipboard API глушилась пустым catch, а посетителю всё равно
 * показывали «скопировано» — человек вставлял в чат пустоту и не понимал, что
 * произошло. Теперь результат копирования возвращается наружу, и интерфейс
 * сообщает об успехе только после настоящего успеха.
 */

export type CopyOutcome = 'copied' | 'unsupported' | 'blocked' | 'failed';

/** Синхронный запасной путь: работает там, где нет navigator.clipboard. */
function copyWithTextarea(text: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Тестовый переключатель: ?clipboard=off — недоступный API, ?clipboard=deny — отказ. */
function forcedOutcome(): CopyOutcome | null {
  if (typeof window === 'undefined') return null;
  const mode = new URLSearchParams(window.location.search).get('clipboard');
  if (mode === 'off') return 'unsupported';
  if (mode === 'deny') return 'blocked';
  return null;
}

export async function copyText(text: string): Promise<CopyOutcome> {
  const forced = forcedOutcome();
  if (forced) return forced;

  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;

  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return copyWithTextarea(text) ? 'copied' : 'unsupported';
  }

  try {
    await clipboard.writeText(text);
    return 'copied';
  } catch {
    // Разрешение могло быть отклонено или страница потеряла фокус — пробуем запасной путь.
    return copyWithTextarea(text) ? 'copied' : 'blocked';
  }
}

/** Выделяет текст целиком — ручной путь, когда копирование недоступно. */
export function selectText(node: HTMLTextAreaElement | null) {
  if (!node) return;
  node.focus();
  node.select();
}
