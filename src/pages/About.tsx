import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Photo from '../components/Photo';
import { author, books, asset, covers } from '../data';
import { useLang } from '../i18n/LanguageContext';

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
        <p className="meta" style={{ marginTop: '1.5rem' }}><a className="link" href={author.socials.academic_site} target="_blank" rel="noopener noreferrer">{t.about.academic} ↗</a></p>
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

        <p className="label" style={{ marginTop: '3rem' }}>{t.about.press}</p>
        <p className="meta" style={{ maxWidth: '60ch' }}>{t.about.pressLead}</p>
        <p className="label" style={{ marginTop: '1.5rem', fontSize: '.65rem' }}>{t.about.bioShort}</p>
        <p className="prose" style={{ marginTop: '.4rem' }}>{lang === 'el' ? author.bio_el_short : author.bio_en_short}</p>
        <p className="label" style={{ marginTop: '1.5rem', fontSize: '.65rem' }}>{t.about.bioMedium}</p>
        <p className="prose" style={{ marginTop: '.4rem' }}>{lang === 'el' ? author.bio_el_medium : author.bio_en_medium}</p>
        <p className="label" style={{ marginTop: '1.5rem', fontSize: '.65rem' }}>{lang === 'el' ? 'Φωτογραφία' : 'Photograph'}</p>
        <div className="shelf" style={{ marginTop: '.75rem' }}><a href={asset('photos/portrait-1200.webp')} className="shelf__item" download><Photo id="portrait" alt={author.name_el} sizes="150px" /><span className="shelf__meta">1200 px</span></a></div>
        <p className="label" style={{ marginTop: '1.5rem', fontSize: '.65rem' }}>{t.about.covers}</p>
        <div className="shelf" style={{ marginTop: '.75rem' }}>
          {books.filter((b) => covers[b.slug]).map((b) => (
            <a key={b.slug} href={asset(covers[b.slug].src['900'])} className="shelf__item" download>
              <Cover id={b.slug} alt={b.title_el} sizes="150px" />
              <span className="shelf__meta">{covers[b.slug].w}×{covers[b.slug].h}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
