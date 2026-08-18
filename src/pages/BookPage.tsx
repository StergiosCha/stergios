import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Gallery from '../components/Gallery';
import Pic from '../components/Pic';
import { useLightbox } from '../components/Lightbox';
import NotFound from './NotFound';
import { getBook, bookReviews, bookEvents, bookTexts, books, eventPhotos, eventPoster, pressShot, bookExtraMedia, eventOf } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';
import { altFor, eventTitle } from '../lib/alt';

export default function BookPage() {
  const { slug = '' } = useParams();
  const { t, lang } = useLang();
  const { open } = useLightbox();
  const nav = useNavigate();
  const b = getBook(slug);
  if (!b) return <NotFound message={t.books.notFound} />;
  const revs = bookReviews(slug), evs = bookEvents(slug), txts = bookTexts(slug);
  const title = lang === 'en' && b.title_en ? b.title_en : b.title_el;
  const i = books.findIndex((x) => x.slug === slug);
  const prev = books[(i + 1) % books.length], next = books[(i - 1 + books.length) % books.length];
  // photos from this book's events, newest first, posters included at the end
  const evPhotos = [...evs.flatMap(eventPhotos), ...evs.map(eventPoster).filter((m): m is NonNullable<typeof m> => !!m)];
  const extra = bookExtraMedia(slug);
  return (
    <>
      <Seo title={b.title_el} description={(b.blurb_el || title).slice(0, 160)} image={b.slug} type="article" book={b} />
      <header className="page-head wrap">
        <p className="label">{t.kinds[b.kind] ?? b.kind} · {b.year}</p>
        <h1 className="display">{title}</h1>
        {lang === 'en' && b.title_en && <p className="meta">{b.title_el} · {t.books.translated}</p>}
        {b.subtitle_el && <p className="lead">{b.subtitle_el}</p>}
        <hr className="rule" />
      </header>
      <section className="wrap book" style={{ paddingBottom: 'clamp(3rem,8vh,6rem)' }}>
        <aside className="book__side">
          <Cover id={b.slug} alt={b.title_el} title={b.title_el} sizes="(min-width: 760px) 300px, 70vw" priority />
          <ul className="book__facts">
            <li>{b.publisher}{b.publisher_url ? <> · <a className="link-quiet" href={b.publisher_url} target="_blank" rel="noopener noreferrer">↗</a></> : null}</li>
            <li>{b.year}{b.month ? `.${String(b.month).padStart(2, '0')}` : ''}</li>
            {b.pages ? <li>{b.pages} {t.books.pages}{b.size ? `, ${b.size} cm` : ''}</li> : null}
            {b.isbn ? <li>ISBN {b.isbn}</li> : null}
            {b.price_eur ? <li>{b.price_eur.toFixed(2)} €</li> : null}
          </ul>
          {b.buy?.length ? <div className="book__buy">{b.buy.map((x) => <a key={x.url} className="btn btn--ghost" href={x.url} target="_blank" rel="noopener noreferrer">{x.shop}</a>)}</div> : null}
          {b.notes && <p className="meta" style={{ marginTop: '1rem' }}>{b.slug === 'dikaioma-stin-antifasi' ? t.books.freeCopy : b.notes}</p>}
        </aside>
        <div>
          {b.blurb_el && (<><p className="label">{t.books.blurb}</p><div className="prose" style={{ marginTop: '.75rem' }}>{b.blurb_el.split(/\n+/).map((p, k) => <p key={k}>{p}</p>)}</div></>)}

          {evPhotos.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.fromEvents}</p>
              <Gallery items={evPhotos} row={evPhotos.length === 1 ? 18 : 11} className="gal--strip" captions={false}
                onPick={(m) => { const e = eventOf(m); if (e) nav(`/events#${e.id}`); }} />
              <p className="meta" style={{ marginTop: '.5rem' }}>{evs.map((e) => <Link key={e.id} className="link-quiet" to={`/events#${e.id}`} style={{ marginRight: '1rem' }}>{[e.venue, e.city].filter(Boolean).join(', ')} · {fmtDate(e.date, lang, e.date_precision)}</Link>)}</p>
            </section>
          )}

          {extra.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.gallery}</p>
              <Gallery items={extra} row={12} />
            </section>
          )}

          {txts.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.excerpts}</p>
              <ul className="list" style={{ marginTop: '.75rem' }}>
                {txts.map((x) => (
                  <li key={x.slug} className="list__item" style={{ gridTemplateColumns: '1fr' }}>
                    <span><Link className="list__title link" to={`/texts/${x.slug}`}>{x.title === b.title_el ? x.note : x.title}</Link><span className="list__sub" style={{ display: 'block' }}>{x.blurb}</span><span className="list__tags">{t.texts.minutes(x.minutes)}</span></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {b.contents?.length ? (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.contents}</p>
              <ol className="book__contents" style={{ marginTop: '.75rem' }}>{b.contents.map((c, k) => <li key={k}>{c}</li>)}</ol>
            </section>
          ) : null}

          {revs.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.reviews}</p>
              <ul className="list" style={{ marginTop: '.75rem' }}>
                {revs.map((r) => {
                  const shot = pressShot(r.id);
                  return (
                    <li key={r.id} className="list__item list__item--clip">
                      <span className="list__date">{fmtDate(r.date ?? '', lang)}</span>
                      <span>
                        <span className="list__title">{r.outlet}</span>{r.author ? <span className="list__sub" style={{ display: 'inline' }}> · {r.author}</span> : null}
                        <span className="meta" style={{ display: 'block' }}>{t.reviews.types[r.type] ?? r.type}{r.title ? ` · ${r.title}` : ''}</span>
                        {r.quote_el && <p className="list__quote">{r.quote_el}</p>}
                        <span className="list__tags"><a className="link-quiet" href={r.url} target="_blank" rel="noopener noreferrer">{t.reviews.read} ↗</a></span>
                      </span>
                      {shot && (
                        <button type="button" className="clip" onClick={() => open([shot], 0)} aria-label={`${t.reviews.clipping}: ${r.outlet}`}>
                          <Pic item={shot} alt={altFor(shot, lang)} fit="cover" sizes="160px" className="clip__pic" ratio={false} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {evs.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <p className="label">{t.books.events}</p>
              <ul className="list" style={{ marginTop: '.75rem' }}>
                {evs.map((e) => (
                  <li key={e.id} className="list__item">
                    <span className="list__date">{fmtDate(e.date, lang, e.date_precision)}</span>
                    <span><Link className="list__title link" to={`/events#${e.id}`}>{[e.venue, e.city].filter(Boolean).join(', ') || eventTitle(e)}</Link>{e.speakers?.length ? <span className="list__sub" style={{ display: 'block' }}>{e.speakers.map((s) => s.name).join(', ')}</span> : null}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
      <nav className="wrap reader-nav" style={{ maxWidth: 'var(--max)' }} aria-label={t.nav.books}>
        <Link className="link-quiet meta" to={`/books/${prev.slug}`}>← {prev.title_el}</Link>
        <Link className="link-quiet meta" to={`/books/${next.slug}`}>{next.title_el} →</Link>
      </nav>
    </>
  );
}
