import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Photo from '../components/Photo';
import { events, getBook, upcoming, author } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';

export default function Events() {
  const { t, lang } = useLang();
  const up = upcoming();
  const past = events.filter((e) => !up.includes(e));
  const Row = ({ e }: { e: (typeof events)[number] }) => (
    <li className={`list__item${e.photo_key ? ' list__item--photo' : ''}`}>
      <span className="list__date">{fmtDate(e.date, lang, e.date_precision)}</span>
      <span>
        {e.photo_key && <Photo id={e.photo_key} alt="" sizes="(min-width: 640px) 420px, 100vw" className="event-photo" />}
        <span className="list__title">{e.title || e.book.map((s) => getBook(s)?.title_el).filter(Boolean).join(' & ')}</span>
        <span className="list__sub" style={{ display: 'block' }}>{[e.venue, e.city].filter(Boolean).join(', ')}</span>
        {e.speakers?.length ? <span className="list__sub" style={{ display: 'block' }}>{t.events.speakers}: {e.speakers.map((s) => s.role ? `${s.name} (${s.role})` : s.name).join(', ')}</span> : null}
        <span className="list__tags">
          {e.book.map((s) => getBook(s) ? <Link key={s} className="link-quiet" to={`/books/${s}`}>{getBook(s)!.title_el}</Link> : null)}
          {e.photos_url && <a className="link-quiet" href={e.photos_url} target="_blank" rel="noopener noreferrer">{t.events.photos} ↗</a>}
          {e.video_url && <a className="link-quiet" href={e.video_url} target="_blank" rel="noopener noreferrer">{t.events.video} ↗</a>}
          {e.url && <a className="link-quiet" href={e.url} target="_blank" rel="noopener noreferrer">↗</a>}
        </span>
      </span>
    </li>
  );
  return (
    <>
      <Seo title={t.events.title} description={t.events.metaDescription} />
      <header className="page-head wrap"><p className="label">{t.nav.events}</p><h1 className="display">{t.events.title}</h1><p className="lead">{t.events.lead}</p><hr className="rule" /></header>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        {up.length > 0 && (<><p className="label">{t.events.upcoming}</p><ul className="list" style={{ margin: '.75rem 0 2.5rem' }}>{up.map((e) => <Row key={e.id} e={e} />)}</ul></>)}
        <p className="label">{t.events.past}</p>
        <ul className="list" style={{ marginTop: '.75rem' }}>{past.map((e) => <Row key={e.id} e={e} />)}</ul>
        <p className="meta" style={{ marginTop: '2rem' }}>{t.events.invite} <a className="link" href={`mailto:${author.emails[0]}`}>{author.emails[0]}</a></p>
      </section>
    </>
  );
}
