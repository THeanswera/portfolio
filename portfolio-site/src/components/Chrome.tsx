import { Send } from 'lucide-react';
import { site } from '../data/site';
import { useScrollPosition } from '../lib/reveal';

export function ScrollProgress() {
  const { progress } = useScrollPosition();

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-60 h-[3px] bg-transparent">
      <div
        className="h-full origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function FloatingActions({ lifted = false }: { lifted?: boolean }) {
  const { y } = useScrollPosition();
  const visible = y > 620;

  return (
    <div
      className={`pointer-events-none fixed right-4 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-300 md:right-8 ${
        lifted ? 'bottom-52 sm:bottom-44' : 'bottom-4 md:bottom-8'
      }`}
    >
      <a
        href={site.telegram}
        target="_blank"
        rel="noreferrer"
        className={`pointer-events-auto inline-flex items-center gap-2.5 bg-ink px-5 py-3.5 font-mono text-[11px] tracking-[0.12em] text-paper uppercase transition-all duration-300 hover:bg-accent ${
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <Send className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Написать в Telegram</span>
        <span className="sm:hidden">Telegram</span>
      </a>
    </div>
  );
}
