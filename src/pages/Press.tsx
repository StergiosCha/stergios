import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Cover from '../components/Cover';
import Photo from '../components/Photo';
import Pic from '../components/Pic';
import CopyButton from '../components/CopyButton';
import { useLightbox } from '../components/Lightbox';
import { author, books, covers, asset, photos, pressKitPhotos, largest, eventOf } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { altFor, eventTitle } from '../lib/alt';
import { fmtDate } from '../lib/format';

function Bio({ label, el, en }: { label: string; el: string; en: string }) {
  return (
    <div className="press__bio">
      <div className="press__bio-head"><p className="label">{label} · ΕΛ</p><CopyButton text={el} /></div>
      <p className="prose" lang="el">{el}</p>
      <div className="press__bio-head" style={{ marginTop: '1.5rem' }}><p className="label">{label} · EN</p><CopyButton text={en} /></div>
      <p className="prose" lang="en">{en}</p>
    </div>
  );
}

export default function Press() {
  const { t, lang } = useLang();
  const { open } = useLightbox();
  const kit = pressKitPhotos();
  const portrait = photos['portrait'];
  return (
    <>
      <Seo title={t.press.title} description={t.press.metaDescription} />
      <header className="page-head wrap"><p className="label">{t.nav.press}</p><h1 className="display">{t.press.title}</h1><p className="lead">{t.press.lead}</p><hr className="rule" /></header>
      <section className="wrap section press" style={{ paddingTop: 0 }}>
        <Bio label={t.press.bioShort} el={author.bio_el_short} en={author.bio_en_short} />
        <Bio label={t.press.bioLong} el={author.bio_el_medium} en={author.bio_en_medium} />

        {portrait && (
          <div className="press__block">
            <p className="label">{t.press.portrait}</p>
            <div className="press__portrait">
              <Photo id="portrait" alt={author.name_el} sizes="220px" />
              <p className="meta"><a className="btn btn--ghost btn--sm" href={asset(largest(portrait.src))} download>{t.press.download} · {portrait.w}×{portrait.h}</a></p>
            </div>
          </div>
        )}

        <div className="press__block">
          <p className="label">{t.press.covers}</p>
          <div className="shelf" style={{ marginTop: '.75rem' }}>
            {books.filter((b) => covers[b.slug]).map((b) => (
              <a key={b.slug} href={asset(covers[b.slug].src['900'])} className="shelf__item" download>
                <Cover id={b.slug} alt={b.title_el} sizes="150px" />
                <span className="shelf__title">{b.title_el}</span>
                <span className="shelf__meta">{t.press.download} · {covers[b.slug].w}×{covers[b.slug].h}</span>
              </a>
            ))}
          </div>
        </div>

        {kit.length > 0 && (
          <div className="press__block">
            <p className="label">{t.press.photos}</p>
            <p className="meta" style={{ margin: '.3rem 0 1rem', maxWidth: '60ch' }}>{t.press.photosNote}</p>
            <ul className="press__photos">
              {kit.map((m, i) => {
                const e = eventOf(m);
                return (
                  <li key={m.id} className="press__photo">
                    <button type="button" className="gal__btn" onClick={() => open(kit, i)} aria-label={`${t.lightbox.openLabel}: ${altFor(m, lang)}`}>
                      <Pic item={m} alt={altFor(m, lang)} sizes="(min-width: 900px) 30vw, 100vw" />
                    </button>
                    <p className="gal__cap">
                      {e && <>{eventTitle(e)} · {[e.venue, e.city].filter(Boolean).join(', ')} · {fmtDate(e.date, lang, e.date_precision)}<br /></>}
                      {m.credit && <span className="gal__credit">{t.lightbox.credit}: {m.credit}</span>}
                      {' · '}<a className="link-quiet" href={asset(largest(m.src))} download>{t.press.download} · {m.orig}</a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="press__block">
          <p className="label">{t.press.contact}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,2.2vw,1.6rem)', margin: '.4rem 0 0' }}>{author.emails.map((e) => <a key={e} className="link" href={`mailto:${e}`} style={{ display: 'block' }}>{e}</a>)}</p>
          <p className="meta" style={{ marginTop: '.75rem' }}><Link className="link-quiet" to="/contact">{t.nav.contact} →</Link></p>
        </div>
      </section>
    </>
  );
}
