import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Photo from '../components/Photo';
import Pic from '../components/Pic';
import HeroBand from '../components/HeroBand';
import { books, texts, events, reviews, author, upcoming, eventMedia, heroItems } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';
import { altFor, eventTitle } from '../lib/alt';

export default function Home() {
  const { t, lang } = useLang();
  const latest = books[0];
  const shelf = books.slice(1).filter((b) => b.cover);
  const up = upcoming();
  const evs = up.length ? up.slice(0, 3) : events.slice(0, 3);
  const quotes = reviews.filter((r) => r.quote_el && r.type === 'review').slice(0, 3);
  const bt = (b: typeof latest) => (lang === 'en' && b.title_en ? b.title_en : b.title_el);
  const name = lang === 'el' ? author.name_el : author.name_en;
  const hero = heroItems()[0];

  return (
    <>
      <Seo description={t.home.metaDescription} media={hero} image={latest.slug} bookList={books} />
      <HeroBand title={name} kicker={t.home.kicker} />

      <section className="intro wrap intro--photo">
        <div>
          <p className="intro__lead">{t.home.intro}</p>
          <p className="meta" style={{ marginTop: '1rem' }}>{t.home.academic} <a className="link" href={author.socials.academic_site} target="_blank" rel="noopener noreferrer">stergioschatzikyriakidis.org ↗</a></p>
        </div>
        <Photo id="portrait" alt={name} sizes="(min-width: 760px) 260px, 50vw" priority className="intro__photo" />
      </section>

      <section className="wrap feature" aria-labelledby="latest">
        <Link to={`/books/${latest.slug}`}><Cover id={latest.slug} alt={latest.title_el} sizes="(min-width: 760px) 300px, 60vw" priority /></Link>
        <div>
          <p className="label" id="latest">{t.home.latest} · {latest.year}</p>
          <h2 className="display feature__title"><Link to={`/books/${latest.slug}`}>{bt(latest)}</Link></h2>
          <p className="meta">{t.kinds[latest.kind] ?? latest.kind} · {latest.publisher}{latest.pages ? ` · ${latest.pages} ${t.books.pages}` : ''}</p>
          {latest.blurb_el && (
            <div className="feature__blurb prose">
              <p className="label" style={{ marginTop: '1.5rem' }}>{t.books.blurb}</p>
              {latest.blurb_el.split(/\n+/).map((p, k) => <p key={k}>{p}</p>)}
            </div>
          )}
          <div className="feature__actions">
            <Link to={`/books/${latest.slug}`} className="btn">{t.home.theBook}</Link>
            {latest.buy?.map((x) => <a key={x.url} className="btn btn--ghost" href={x.url} target="_blank" rel="noopener noreferrer">{t.books.buy} · {x.shop}</a>)}
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
          <ul className="quotes" style={{ marginTop: '1.25rem' }}>
            {quotes.map((r) => (
              <li key={r.id} className="quote">
                <blockquote className="quote__text">{r.quote_el}</blockquote>
                <p className="quote__by">{r.outlet}{r.author ? `, ${r.author}` : ''}{r.url ? <> · <a className="link-quiet" href={r.url} target="_blank" rel="noopener noreferrer">{t.reviews.read} ↗</a></> : null}</p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '1.5rem' }}><Link to="/reviews" className="link meta">{t.home.allReviews} →</Link></p>
        </section>
      )}

      <section className="wrap section" aria-labelledby="events">
        <p className="label" id="events">{up.length ? t.home.upcoming : t.home.recent}</p>
        <ul className="ev-cards" style={{ marginTop: '1.25rem' }}>
          {evs.map((e) => {
            const m = eventMedia(e)[0];
            return (
              <li key={e.id} className="ev-card">
                <Link to={`/events#${e.id}`} className="ev-card__link">
                  {m && <Pic item={m} alt={altFor(m, lang)} fit={m.kind === 'poster' ? 'contain' : 'cover'} sizes="(min-width: 760px) 30vw, 100vw" className={`ev-card__pic${m.kind === 'poster' ? ' ev-card__pic--poster' : ''}`} />}
                  <span className="ev-card__date">{fmtDate(e.date, lang, e.date_precision)}</span>
                  <span className="ev-card__title">{eventTitle(e) || t.events.noTitle}</span>
                  <span className="ev-card__where">{[e.venue, e.city].filter(Boolean).join(', ')}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p style={{ marginTop: '1.5rem' }}><Link to="/events" className="link meta">{t.home.allEvents} →</Link></p>
      </section>
    </>
  );
}
