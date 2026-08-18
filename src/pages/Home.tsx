import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Photo from '../components/Photo';
import { books, texts, events, reviews, author, upcoming } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';

export default function Home() {
  const { t, lang } = useLang();
  const latest = books[0];
  const shelf = books.slice(1).filter((b) => b.cover);
  const up = upcoming();
  const evs = up.length ? up.slice(0, 3) : events.slice(0, 3);
  const quotes = reviews.filter((r) => r.quote_el && r.type === 'review').slice(0, 3);
  const bt = (b: typeof latest) => (lang === 'en' && b.title_en ? b.title_en : b.title_el);

  return (
    <>
      <Seo description={t.home.metaDescription} image={latest.slug} />
      <section className="intro wrap intro--photo">
        <div>
          <p className="label">{lang === 'el' ? 'Συγγραφέας' : 'Author'}</p>
          <h1 className="display">{lang === 'el' ? author.name_el : author.name_en}</h1>
          <p>{t.home.intro}</p>
        </div>
        <Photo id="portrait" alt={lang === 'el' ? author.name_el : author.name_en} sizes="(min-width: 760px) 300px, 60vw" priority className="intro__photo" />
      </section>

      <section className="wrap feature" aria-labelledby="latest">
        <Link to={`/books/${latest.slug}`}><Cover id={latest.slug} alt={latest.title_el} sizes="260px" priority /></Link>
        <div>
          <p className="label" id="latest">{t.home.latest} · {latest.year}</p>
          <h2 className="display feature__title"><Link to={`/books/${latest.slug}`}>{bt(latest)}</Link></h2>
          <p className="meta">{t.kinds[latest.kind] ?? latest.kind} · {latest.publisher}</p>
          {latest.blurb_el && <p className="feature__blurb">{latest.blurb_el}</p>}
          <div className="feature__actions">
            <Link to={`/books/${latest.slug}`} className="btn">{lang === 'el' ? 'Το βιβλίο' : 'The book'}</Link>
            {latest.buy?.[0] && <a className="btn btn--ghost" href={latest.buy[0].url} target="_blank" rel="noopener noreferrer">{t.books.buy} · {latest.buy[0].shop}</a>}
            {latest.texts?.[0] && <Link to={`/texts/${latest.texts[0]}`} className="link-quiet meta">{t.home.readOnline} →</Link>}
          </div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="shelf">
        <p className="label" id="shelf">{t.nav.books}</p>
        <div className="shelf" style={{ marginTop: '1.25rem' }}>
          {shelf.map((b) => (
            <Link key={b.slug} to={`/books/${b.slug}`} className="shelf__item">
              <Cover id={b.slug} alt={b.title_el} sizes="160px" />
              <span className="shelf__title">{bt(b)}</span>
              <span className="shelf__meta">{b.year} · {b.publisher}</span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: '1.5rem' }}><Link to="/books" className="link meta">{t.home.allBooks} →</Link></p>
      </section>

      <section className="wrap section" aria-labelledby="texts">
        <p className="label" id="texts">{t.home.texts}</p>
        <div className="texts" style={{ marginTop: '1.25rem' }}>
          {texts.slice(0, 3).map((x) => (
            <Link key={x.slug} to={`/texts/${x.slug}`} className="text-card">
              <Cover id={x.cover} alt="" sizes="90px" />
              <span>
                <span className="label">{x.kind_label}</span>
                <span className="text-card__title" style={{ display: 'block' }}>{x.title}</span>
                <span className="text-card__blurb">{x.blurb}</span>
                <span className="text-card__meta" style={{ display: 'block' }}>{t.texts.minutes(x.minutes)}</span>
              </span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: '1.5rem' }}><Link to="/texts" className="link meta">{t.home.allTexts} →</Link></p>
      </section>

      {quotes.length > 0 && (
        <section className="wrap section" aria-labelledby="press">
          <p className="label" id="press">{t.home.press}</p>
          <ul className="list" style={{ marginTop: '1.25rem' }}>
            {quotes.map((r) => (
              <li key={r.id} className="list__item">
                <span className="list__date">{r.outlet}{r.author ? `, ${r.author}` : ''}</span>
                <span>
                  <p className="list__quote" style={{ margin: 0 }}>{r.quote_el}</p>
                  <span className="list__tags"><a className="link-quiet" href={r.url} target="_blank" rel="noopener noreferrer">{t.reviews.read} ↗</a></span>
                </span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '1.5rem' }}><Link to="/reviews" className="link meta">{t.home.allReviews} →</Link></p>
        </section>
      )}

      <section className="wrap section" aria-labelledby="events">
        <p className="label" id="events">{up.length ? t.home.upcoming : t.home.recent}</p>
        <ul className="list" style={{ marginTop: '1.25rem' }}>
          {evs.map((e) => (
            <li key={e.id} className="list__item">
              <span className="list__date">{fmtDate(e.date, lang, e.date_precision)}</span>
              <span>
                <span className="list__title">{e.title || e.book.map((s) => books.find((b) => b.slug === s)?.title_el).filter(Boolean).join(' & ')}</span>
                <span className="list__sub" style={{ display: 'block' }}>{[e.venue, e.city].filter(Boolean).join(', ')}</span>
              </span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '1.5rem' }}><Link to="/events" className="link meta">{t.home.allEvents} →</Link></p>
      </section>

      <section className="wrap section">
        <p className="meta">{t.home.academic} <a className="link" href={author.socials.academic_site} target="_blank" rel="noopener noreferrer">stergioscha.github.io ↗</a></p>
      </section>
    </>
  );
}
