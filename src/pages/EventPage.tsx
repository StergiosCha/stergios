import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Gallery from '../components/Gallery';
import Pic from '../components/Pic';
import { useLightbox } from '../components/Lightbox';
import NotFound from './NotFound';
import { getEvent, getBook, eventPhotos, eventPoster, eventMedia } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';
import { altFor, eventTitle } from '../lib/alt';

/** Deep page of one event: full gallery, speakers, books, map link. Reachable for every event; linked from the timeline when it has 4+ photos. */
export default function EventPage() {
  const { id = '' } = useParams();
  const { t, lang } = useLang();
  const { open } = useLightbox();
  const e = getEvent(id);
  if (!e) return <NotFound message={t.events.notFound} />;
  const title = eventTitle(e) || t.events.noTitle;
  const photos = eventPhotos(e), poster = eventPoster(e), all = eventMedia(e);
  const where = [e.venue, e.city].filter(Boolean).join(', ');
  const map = where ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}` : '';
  const bks = e.book.map(getBook).filter((b): b is NonNullable<typeof b> => !!b);
  return (
    <>
      <Seo title={title} description={[where, fmtDate(e.date, lang, e.date_precision)].filter(Boolean).join(' · ')} media={all[0]} type="article" event={e} />
      <header className="page-head wrap">
        <p className="label"><Link className="link-quiet" to="/events">{t.nav.events}</Link> · {fmtDate(e.date, lang, e.date_precision)}</p>
        <h1 className="display">{title}</h1>
        {where && <p className="lead">{where}{map && <> · <a className="link" href={map} target="_blank" rel="noopener noreferrer">{t.events.map} ↗</a></>}</p>}
        <hr className="rule" />
      </header>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        {poster && (
          <button type="button" className="ev__poster ev__poster--page" onClick={() => open(all, all.indexOf(poster))} aria-label={`${t.events.poster}: ${altFor(poster, lang)}`}>
            <Pic item={poster} alt={altFor(poster, lang)} fit="contain" sizes="(min-width: 900px) 420px, 90vw" />
            {poster.credit && <span className="gal__cap">{poster.credit}</span>}
          </button>
        )}
        {photos.length > 0 && <Gallery items={photos} row={photos.length === 1 ? 24 : 16} />}
        <div className="ev-page__facts">
          {e.speakers?.length ? (
            <div>
              <p className="label">{t.events.speakers}</p>
              <ul className="prose" style={{ margin: '.5rem 0 0', paddingLeft: '1.2em' }}>{e.speakers.map((s) => <li key={s.name}>{s.name}{s.role ? <span className="meta"> · {s.role}</span> : null}</li>)}</ul>
            </div>
          ) : null}
          {bks.length > 0 && (
            <div>
              <p className="label">{t.events.books}</p>
              <div className="shelf shelf--small" style={{ marginTop: '.75rem' }}>
                {bks.map((b) => <Link key={b.slug} to={`/books/${b.slug}`} className="shelf__item"><Cover id={b.slug} alt={b.title_el} sizes="120px" /><span className="shelf__title">{b.title_el}</span></Link>)}
              </div>
            </div>
          )}
          <p className="ev__links">
            {e.photos_url && <a className="link-quiet" href={e.photos_url} target="_blank" rel="noopener noreferrer">{t.events.photos} ↗</a>}
            {e.video_url && <a className="link-quiet" href={e.video_url} target="_blank" rel="noopener noreferrer">{t.events.video} ↗</a>}
            {e.url && <a className="link-quiet" href={e.url} target="_blank" rel="noopener noreferrer">{t.events.source} ↗</a>}
            <Link className="link-quiet" to={`/events#${e.id}`}>← {t.events.all}</Link>
          </p>
        </div>
      </section>
    </>
  );
}
