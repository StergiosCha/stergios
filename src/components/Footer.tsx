import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { author } from '../data';

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="ftr">
      <div className="wrap ftr__inner">
        <p className="meta" style={{ margin: 0 }}>© {new Date().getFullYear()} {lang === 'el' ? author.name_el : author.name_en}. {t.footer.rights} {t.footer.texts} {t.footer.photos}</p>
        <ul className="ftr__links meta">
          <li><a className="link-quiet" href={author.socials.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
          {author.socials.goodreads && <li><a className="link-quiet" href={author.socials.goodreads} target="_blank" rel="noopener noreferrer">Goodreads</a></li>}
          <li><a className="link-quiet" href={author.socials.academic_site} target="_blank" rel="noopener noreferrer">{t.about.academic}</a></li>
          <li><Link className="link-quiet" to="/press">{t.nav.press}</Link></li>
          <li><Link className="link-quiet" to="/contact">{t.nav.contact}</Link></li>
        </ul>
      </div>
    </footer>
  );
}
