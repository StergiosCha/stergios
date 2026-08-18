import type { Lang } from '../i18n/strings';
import { eventOf, getBook, type MediaItem } from '../data';
import { fmtDate } from './format';

/** Alt text for a media item: its caption, else event title + venue (or review/book owner), never empty for content images. */
export function altFor(m: MediaItem, lang: Lang): string {
  if (m.caption) return m.caption;
  const e = eventOf(m);
  if (e) {
    const title = e.title || e.book.map((s) => getBook(s)?.title_el).filter(Boolean).join(' & ');
    const where = [e.venue, e.city].filter(Boolean).join(', ');
    const when = fmtDate(e.date, lang, e.date_precision);
    const kind = m.kind === 'poster' ? (lang === 'el' ? 'Αφίσα' : 'Poster') : (lang === 'el' ? 'Φωτογραφία' : 'Photograph');
    return [kind, title, where, when].filter(Boolean).join(', ');
  }
  if (m.category === 'books') { const b = getBook(m.owner); return b ? b.title_el : m.owner; }
  if (m.category === 'press') return lang === 'el' ? 'Στιγμιότυπο δημοσιεύματος' : 'Article screenshot';
  return '';
}

/** Short label of an event: its title, else the titles of its books. */
export function eventTitle(e: { title?: string; book: string[] }): string {
  return e.title || e.book.map((s) => getBook(s)?.title_el).filter(Boolean).join(' & ');
}
