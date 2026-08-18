import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import Pic from '../components/Pic';
import { useLightbox } from '../components/Lightbox';
import { reviews, getBook, books, pressShot } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { fmtDate } from '../lib/format';
import { altFor } from '../lib/alt';

export default function Reviews() {
  const { t, lang } = useLang();
  const { open } = useLightbox();
  const [params, setParams] = useSearchParams();
  const filter = params.get('book') ?? '';
  const withReviews = books.filter((b) => reviews.some((r) => r.book === b.slug));
  const list = reviews.filter((r) => !filter || r.book === filter).sort((a, b) => ((a.date ?? '') < (b.date ?? '') ? 1 : -1));
  const setFilter = (slug: string) => setParams(slug ? { book: slug } : {}, { replace: true });
  return (
    <>
      <Seo title={t.reviews.title} description={t.reviews.metaDescription} />
      <header className="page-head wrap"><p className="label">{t.nav.reviews}</p><h1 className="display">{t.reviews.title}</h1><p className="lead">{t.reviews.lead}</p><hr className="rule" /></header>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="filter" role="group" aria-label={t.reviews.filter}>
          <span className="label">{t.reviews.filter}</span>
          <button type="button" className={`chip${!filter ? ' is-on' : ''}`} aria-pressed={!filter} onClick={() => setFilter('')}>{t.reviews.all}</button>
          {withReviews.map((b) => (
            <button key={b.slug} type="button" className={`chip${filter === b.slug ? ' is-on' : ''}`} aria-pressed={filter === b.slug} onClick={() => setFilter(b.slug)}>{b.title_el}</button>
          ))}
        </div>
        {list.length === 0 && <p className="meta">{t.reviews.none}</p>}
        <ul className="list" style={{ marginTop: '1.5rem' }}>
          {list.map((r) => {
            const b = getBook(r.book);
            const shot = pressShot(r.id);
            return (
              <li key={r.id} className="list__item list__item--clip">
                <span className="list__date">{fmtDate(r.date ?? '', lang)}<br /><span className="label" style={{ fontSize: '.65rem' }}>{t.reviews.types[r.type] ?? r.type}</span></span>
                <span>
                  <span className="list__title">{r.outlet}{r.author ? <span className="list__sub" style={{ display: 'inline' }}> · {r.author}</span> : null}</span>
                  {r.title && <span className="list__sub" style={{ display: 'block' }}>{r.title}</span>}
                  {b && <span className="list__sub" style={{ display: 'block' }}>{t.reviews.on} <Link className="link" to={`/books/${b.slug}`}>{b.title_el}</Link></span>}
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
    </>
  );
}
