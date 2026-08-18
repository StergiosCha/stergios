import { Link, NavLink } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { useTheme } from './Theme';

export default function Header() {
  const { t, lang, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const items = [['/books', t.nav.books], ['/texts', t.nav.texts], ['/reviews', t.nav.reviews], ['/events', t.nav.events], ['/press', t.nav.press], ['/about', t.nav.about], ['/contact', t.nav.contact]] as const;
  return (
    <header className="hdr">
      <a href="#main" className="skip-link">{t.skip}</a>
      <div className="hdr__inner wrap">
        <Link to="/" className="hdr__brand">{t.siteName}</Link>
        <nav className="hdr__nav" aria-label="Menu">
          <ul>
            {items.map(([to, label]) => (
              <li key={to}><NavLink to={to} className={({ isActive }) => 'hdr__link' + (isActive ? ' is-active' : '')}>{label}</NavLink></li>
            ))}
            <li className="hdr__tools">
              <button type="button" className="hdr__btn hdr__lang" onClick={toggle} aria-label={t.langToggle}>
                <span className={lang === 'el' ? 'is-on' : ''}>ΕΛ</span> / <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
              </button>
              <button type="button" className="hdr__btn" onClick={toggleTheme} aria-label={t.themeToggle} title={t.themeToggle}>{theme === 'dark' ? '☀' : '◐'}</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
