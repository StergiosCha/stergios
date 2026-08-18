import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Gallery from '../components/Gallery';
import Pic from '../components/Pic';
import { useLightbox } from '../components/Lightbox';
import { events, getBook, upcoming, author, eventPhotos, eventPoster, eventMedia, heroItems, type Ev } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';
import { altFor, eventTitle } from '../lib/alt';

/** One event in the timeline: poster + photo strip + facts. */
export function EventBlock({ e, deep = true }: { e: Ev; deep?: boolean }) {
  const { t, lang } = useLang();
  const { open } = useLightbox();
  const poster = eventPoster(e);
  const photos = eventPhotos(e);
  const all = eventMedia(e);
  const title = eventTitle(e);
  const hasPage = deep && photos.length >= 4;
  return (
    <article className="ev" id={e.id} aria-labelledby={`${e.id}-h`}>
      <div className="ev__when">
        <time dateTime={e.date}>{fmtDate(e.date, lang, e.date_precision)}</time>
      </div>
      <div className="ev__body">
        <h3 className="display ev__title" id={`${e.id}-h`}>
          {hasPage ? <Link to={`/events/${e.id}`}>{title || t.events.noTitle}</Link> : (title || t.events.noTitle)}
        </h3>
        <p className="ev__where">{[e.venue, e.city].filter(Boolean).join(', ')}</p>
        {e.speakers?.length ? <p className="ev__speakers"><span className="label">{t.events.speakers}</span> {e.speakers.map((s) => (s.role ? `${s.name} (${s.role})` : s.name)).join(', ')}</p> : null}
        <div className={`ev__media${poster && photos.length ? ' ev__media--both' : ''}`}>
          {poster && (
            <button type="button" className="ev__poster" onClick={() => open(all, all.indexOf(poster))} aria-label={`${t.events.poster}: ${altFor(poster, lang)}`}>
              <Pic item={poster} alt={altFor(poster, lang)} fit="contain" sizes="(min-width: 900px) 320px, 70vw" />
              {poster.credit && <span className="gal__cap">{poster.credit}</span>}
            </button>
          )}
          {photos.length > 0 && <Gallery items={photos} row={photos.length === 1 ? 20 : 14} />}
        </div>
        <p className="ev__links">
          {e.book.map((s) => (getBook(s) ? <Link key={s} className="link-quiet" to={`/books/${s}`}>{getBook(s)!.title_el}</Link> : null))}
          {hasPage && <Link className="link-quiet" to={`/events/${e.id}`}>{t.events.page} →</Link>}
          {e.photos_url && <a className="link-quiet" href={e.photos_url} target="_blank" rel="noopener noreferrer">{t.events.photos} ↗</a>}
          {e.video_url && <a className="link-quiet" href={e.video_url} target="_blank" rel="noopener noreferrer">{t.events.video} ↗</a>}
          {e.url && <a className="link-quiet" href={e.url} target="_blank" rel="noopener noreferrer">{t.events.source} ↗</a>}
        </p>
      </div>
    </article>
  );
}

export default function Events() {
  const { t } = useLang();
  const up = upcoming();
  const past = events.filter((e) => !up.includes(e));
  const years = Array.from(new Set(past.map((e) => e.date.slice(0, 4))));
  return (
    <>
      <Seo title={t.events.title} description={t.events.metaDescription} media={heroItems()[0]} events={events} />
      <header className="page-head wrap"><p className="label">{t.nav.events}</p><h1 className="display">{t.events.title}</h1><p className="lead">{t.events.lead}</p><hr className="rule" /></header>
      <section className="wrap section timeline" style={{ paddingTop: 0 }}>
        {up.length > 0 && (
          <div className="timeline__year">
            <h2 className="display timeline__label">{t.events.upcoming}</h2>
            {up.map((e) => <EventBlock key={e.id} e={e} />)}
          </div>
        )}
        {years.map((y) => (
          <div className="timeline__year" key={y}>
            <h2 className="display timeline__label" id={`y${y}`}>{y}</h2>
            {past.filter((e) => e.date.startsWith(y)).map((e) => <EventBlock key={e.id} e={e} />)}
          </div>
        ))}
        <p className="meta" style={{ marginTop: '3rem' }}>{t.events.invite} <a className="link" href={`mailto:${author.emails[0]}`}>{author.emails[0]}</a></p>
      </section>
    </>
  );
}
