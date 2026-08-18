import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { asset, eventOf, type MediaItem } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { altFor, eventTitle } from '../lib/alt';
import { fmtDate } from '../lib/format';

interface LightboxCtx { open: (items: MediaItem[], index: number) => void }
const Ctx = createContext<LightboxCtx>({ open: () => {} });
export const useLightbox = () => useContext(Ctx);

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [i, setI] = useState(0);
  const [openState, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((list: MediaItem[], index: number) => {
    opener.current = document.activeElement as HTMLElement | null;
    setItems(list); setI(index); setOpen(true);
  }, []);
  const close = useCallback(() => { setOpen(false); }, []);
  useEffect(() => { if (!openState && opener.current) { opener.current.focus?.(); opener.current = null; } }, [openState]);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {openState && items.length > 0 && <Dialog items={items} index={i} setIndex={setI} onClose={close} />}
    </Ctx.Provider>
  );
}

function Dialog({ items, index, setIndex, onClose }: { items: MediaItem[]; index: number; setIndex: (n: number) => void; onClose: () => void }) {
  const { t, lang } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const m = items[index];
  const many = items.length > 1;
  const prev = useCallback(() => setIndex((index - 1 + items.length) % items.length), [index, items.length, setIndex]);
  const next = useCallback(() => setIndex((index + 1) % items.length), [index, items.length, setIndex]);

  // scroll lock + focus trap + keys
  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const first = box.current?.querySelector<HTMLElement>(FOCUSABLE);
    (box.current?.querySelector<HTMLElement>('[data-close]') ?? first)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowLeft' && many) { e.preventDefault(); prev(); return; }
      if (e.key === 'ArrowRight' && many) { e.preventDefault(); next(); return; }
      if (e.key === 'Tab' && box.current) {
        const els = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!els.length) return;
        const firstEl = els[0], lastEl = els[els.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.style.overflow = prevOverflow; };
  }, [onClose, prev, next, many]);

  // swipe
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && many) { if (dx < 0) next(); else prev(); }
  };

  const ev = eventOf(m);
  const ws = Object.keys(m.src).map(Number).sort((a, b) => a - b);
  const alt = altFor(m, lang);
  const title = m.caption || (ev ? eventTitle(ev) : alt);
  const sub = ev ? [[ev.venue, ev.city].filter(Boolean).join(', '), fmtDate(ev.date, lang, ev.date_precision)].filter(Boolean).join(' · ') : '';

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={title} ref={box} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className="lb__btn lb__close" data-close onClick={onClose} aria-label={t.lightbox.close}>×</button>
      {many && <button type="button" className="lb__btn lb__arrow lb__arrow--prev" onClick={prev} aria-label={t.lightbox.prev}>←</button>}
      {many && <button type="button" className="lb__btn lb__arrow lb__arrow--next" onClick={next} aria-label={t.lightbox.next}>→</button>}
      <figure className="lb__fig" key={m.id}>
        <img className="lb__img" src={asset(m.src[String(ws[ws.length - 1])])} srcSet={ws.map((w) => `${asset(m.src[String(w)])} ${w}w`).join(', ')}
          sizes="100vw" width={m.w} height={m.h} alt={alt} decoding="async" />
        <figcaption className="lb__cap">
          <span className="lb__title">{title}</span>
          {sub && <span className="lb__sub">{sub}</span>}
          <span className="lb__meta">
            {many && <span>{index + 1} / {items.length}</span>}
            {m.credit && <span>{t.lightbox.credit}: {m.credit}</span>}
            {m.source_url && <a className="link-quiet" href={m.source_url} target="_blank" rel="noopener noreferrer">{t.lightbox.source} ↗</a>}
            {ev && <Link className="link-quiet" to={`/events#${ev.id}`} onClick={onClose}>{t.lightbox.event} →</Link>}
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
