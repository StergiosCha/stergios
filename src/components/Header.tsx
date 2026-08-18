import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { useTheme } from './Theme';

export default function Header() {
  const { t, lang, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const items = [['/books', t.nav.books], ['/texts', t.nav.texts], ['/reviews', t.nav.reviews], ['/events', t.nav.events], ['/press', t.nav.press], ['/about', t.nav.about], ['/contact', t.nav.contact]] as const;

  // close on route change, Esc, or resize to desktop; lock scroll while open
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const mq = matchMedia('(min-width: 900px)');
    const onMq = () => { if (mq.matches) setOpen(false); };
    document.addEventListener('keydown', onKey); mq.addEventListener('change', onMq);
    return () => { document.removeEventListener('keydown', onKey); mq.removeEventListener('change', onMq); document.documentElement.style.overflow = prev; };
  }, [open]);

  const tools = (
    <>
      <button type="button" className="hdr__btn hdr__lang" onClick={toggle} aria-label={t.langToggle}>
        <span className={lang === 'el' ? 'is-on' : ''}>ΕΛ</span> / <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
      </button>
      <button type="button" className="hdr__btn" onClick={toggleTheme} aria-label={t.themeToggle} title={t.themeToggle}>{theme === 'dark' ? '☀' : '◐'}</button>
    </>
  );

  return (
    <header className={`hdr${open ? ' is-open' : ''}`}>
      <a href="#main" className="skip-link">{t.skip}</a>
      <div className="hdr__inner wrap">
        <Link to="/" className="hdr__brand">{t.siteName}</Link>
        <div className="hdr__mobile-tools">
          {tools}
          <button type="button" className="hdr__burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu" aria-label={open ? t.menuClose : t.menuOpen}>
            <span aria-hidden="true" />
          </button>
        </div>
        <nav className="hdr__nav" id="site-menu" aria-label="Menu" ref={panel}>
          <ul>
            {items.map(([to, label]) => (
              <li key={to}><NavLink to={to} className={({ isActive }) => 'hdr__link' + (isActive ? ' is-active' : '')}>{label}</NavLink></li>
            ))}
            <li className="hdr__tools">{tools}</li>
          </ul>
        </nav>
      </div>
      {open && <button type="button" className="hdr__veil" aria-label={t.menuClose} onClick={() => setOpen(false)} tabIndex={-1} />}
    </header>
  );
}
