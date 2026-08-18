import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Photo from '../components/Photo';
import { author, books, videos } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';

export default function About() {
  const { t, lang } = useLang();
  const orig = Array.isArray(author.bio_el_original) ? author.bio_el_original : [author.bio_el_original];
  const bio = lang === 'el' ? orig : [author.bio_en_medium];
  return (
    <>
      <Seo title={t.about.title} description={t.about.metaDescription} />
      <header className="page-head wrap"><p className="label">{t.nav.about}</p><h1 className="display">{lang === 'el' ? author.name_el : author.name_en}</h1><hr className="rule" /></header>
      <section className="wrap section about-grid" style={{ paddingTop: 0 }}>
        <Photo id="portrait" alt={author.name_el} sizes="(min-width: 760px) 320px, 100vw" priority className="about-grid__photo" />
        <div>
          <div className="prose">{bio.map((p, i) => <p key={i}>{p}</p>)}</div>
          <p className="label" style={{ marginTop: '2.5rem' }}>{t.about.positions}</p>
          <ul className="prose" style={{ marginTop: '.5rem', paddingLeft: '1.2em' }}>{author.positions.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="meta" style={{ marginTop: '1.5rem' }}>
            <a className="link" href={author.socials.academic_site} target="_blank" rel="noopener noreferrer">{t.about.academic} ↗</a>
            {' · '}<Link className="link" to="/press">{t.about.pressKit} →</Link>
          </p>
        </div>
      </section>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <p className="label">{t.about.bibliography}</p>
        <ul className="list" style={{ marginTop: '.75rem' }}>
          {books.map((b) => (
            <li key={b.slug} className="list__item">
              <span className="list__date">{b.year}</span>
              <span><Link className="list__title link" to={`/books/${b.slug}`}>{b.title_el}</Link><span className="list__sub" style={{ display: 'block' }}>{t.kinds[b.kind] ?? b.kind}, {b.publisher}{b.isbn ? `, ISBN ${b.isbn}` : ''}</span></span>
            </li>
          ))}
        </ul>

        {videos.length > 0 && (
          <>
            <p className="label" style={{ marginTop: '3rem' }}>{t.about.video}</p>
            <ul className="list" style={{ marginTop: '.75rem' }}>
              {videos.map((v) => (
                <li key={v.title} className="list__item">
                  <span className="list__date">{fmtDate(v.date, lang, v.date.length === 4 ? 'year' : 'day')}<br /><span className="label" style={{ fontSize: '.65rem' }}>{v.platform}</span></span>
                  <span>
                    <span className="list__title">{v.title}</span>
                    <span className="list__tags">
                      {v.url ? <a className="link-quiet" href={v.url} target="_blank" rel="noopener noreferrer">{t.about.watch} ↗</a> : <span className="placeholder-tag">{t.about.missingLink}</span>}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
