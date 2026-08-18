import { useLightbox } from './Lightbox';
import Pic from './Pic';
import { type MediaItem } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { altFor } from '../lib/alt';

interface Props {
  items: MediaItem[];
  /** row height in rem for the justified layout (desktop) */
  row?: number;
  /** show caption/credit under each */
  captions?: boolean;
  className?: string;
  /** called instead of the lightbox when set (e.g. open the event) */
  onPick?: (m: MediaItem, i: number) => void;
}

/**
 * Justified strip: 2 to 4 per row, widths follow aspect ratio; one image sits alone at a natural size.
 * On small screens it becomes a horizontal scroll strip with snap (CSS). Click opens the lightbox.
 */
export default function Gallery({ items, row = 15, captions = true, className, onPick }: Props) {
  const { open } = useLightbox();
  const { lang, t } = useLang();
  if (!items.length) return null;
  const one = items.length === 1;
  return (
    <ul className={`gal${one ? ' gal--one' : ''}${className ? ' ' + className : ''}`} style={{ ['--row' as string]: `${row}rem` }}>
      {items.map((m, i) => {
        const r = m.w / m.h;
        const alt = altFor(m, lang);
        const poster = m.kind === 'poster';
        return (
          <li key={m.id} className={`gal__item${poster ? ' gal__item--poster' : ''}`} style={{ ['--r' as string]: r }}>
            <button type="button" className="gal__btn" onClick={() => (onPick ? onPick(m, i) : open(items, i))} aria-label={`${t.lightbox.openLabel}: ${alt}`}>
              <Pic item={m} alt={alt} fit={poster ? 'contain' : 'cover'} sizes={one ? '(min-width: 900px) 720px, 100vw' : '(min-width: 900px) 40vw, 80vw'} />
            </button>
            {captions && (m.caption || m.credit) && (
              <p className="gal__cap">{m.caption}{m.caption && m.credit ? ' · ' : ''}{m.credit && <span className="gal__credit">{m.credit}</span>}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
