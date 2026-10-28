import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { author, covers, books, asset, largest, type Book, type Ev, type MediaItem } from '../data';
import { eventTitle } from '../lib/alt';

interface Props {
  /** page title without the site name */
  title?: string;
  description: string;
  /** cover id (book slug) for og:image; `media` wins when given */
  image?: string;
  /** a media item (event photo) for og:image */
  media?: MediaItem;
  type?: 'website' | 'article';
  /** structured data emitted alongside Person */
  book?: Book;
  event?: Ev;
  events?: Ev[];
  bookList?: Book[];
}

export const SITE_ORIGIN = 'https://stergios.chatzikyriakidis.org';

function upsertJsonLd(id: string, data: object | null) {
  let el = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${id}"]`);
  if (!data) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.jsonld = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

const abs = (rel: string) => new URL(asset(rel), `${SITE_ORIGIN}/`).toString();

export function bookLd(b: Book, base: string) {
  return {
    '@context': 'https://schema.org', '@type': 'Book', name: b.title_el, alternateName: b.title_en || undefined,
    author: { '@type': 'Person', name: author.name_el }, isbn: b.isbn || undefined, publisher: b.publisher ? { '@type': 'Organization', name: b.publisher } : undefined,
    datePublished: b.month ? `${b.year}-${String(b.month).padStart(2, '0')}` : String(b.year), inLanguage: b.language || 'el',
    numberOfPages: b.pages || undefined, image: covers[b.slug] ? abs(covers[b.slug].src['900']) : undefined, url: `${SITE_ORIGIN}${base}/books/${b.slug}`,
    description: b.blurb_el ? b.blurb_el.slice(0, 300) : undefined,
  };
}
export function eventLd(e: Ev, base: string, image?: string) {
  return {
    '@context': 'https://schema.org', '@type': 'Event', name: eventTitle(e) || 'Παρουσίαση', startDate: e.date,
    location: e.venue || e.city ? { '@type': 'Place', name: e.venue || e.city, address: [e.city, e.country].filter(Boolean).join(', ') } : undefined,
    performer: { '@type': 'Person', name: author.name_el }, image, url: `${SITE_ORIGIN}${base}/events/${e.id}`,
    eventStatus: 'https://schema.org/EventScheduled', about: e.book.map((s) => books.find((b) => b.slug === s)).filter(Boolean).map((b) => ({ '@type': 'Book', name: b!.title_el })),
  };
}

/** Client-side per-page <head>: title, description, OpenGraph, canonical, JSON-LD (Person always; Book/Event when given). */
export default function Seo({ title, description, image, media, type = 'website', book, event, events, bookList }: Props) {
  const { lang, t } = useLang();
  const { pathname } = useLocation();

  useEffect(() => {
    const full = title ? `${title} · ${t.siteName}` : `${t.siteName} · ${t.tagline}`;
    document.title = full;
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const url = `${SITE_ORIGIN}${base}${pathname}`;
    let img = '', w = 0, h = 0;
    if (media) { img = abs(largest(media.src)); w = media.w; h = media.h; }
    else {
      const coverId = image && covers[image] ? image : books.find((b) => covers[b.slug])?.slug ?? '';
      const cov = covers[coverId];
      if (cov) { img = abs(cov.src['900']); w = cov.w; h = cov.h; }
    }
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:site_name', t.siteName);
    upsertMeta('property', 'og:title', full);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:image:width', String(w));
    upsertMeta('property', 'og:image:height', String(h));
    upsertMeta('property', 'og:locale', lang === 'el' ? 'el_GR' : 'en_GB');
    upsertMeta('property', 'og:locale:alternate', lang === 'el' ? 'en_GB' : 'el_GR');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', full);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', img);
    upsertLink('canonical', url);

    upsertJsonLd('person', {
      '@context': 'https://schema.org', '@type': 'Person', name: lang === 'el' ? author.name_el : author.name_en,
      alternateName: lang === 'el' ? author.name_en : author.name_el,
      jobTitle: lang === 'el' ? 'Συγγραφέας, Καθηγητής Υπολογιστικής Γλωσσολογίας' : 'Author, Professor of Computational Linguistics',
      birthDate: String(author.birth_year), birthPlace: 'Grevena, Greece', url: `${SITE_ORIGIN}${base}/`,
      sameAs: Object.values(author.socials), affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Crete' },
    });
    upsertJsonLd('book', book ? bookLd(book, base) : null);
    upsertJsonLd('event', event ? eventLd(event, base, img || undefined) : null);
    upsertJsonLd('events', events?.length ? events.map((e) => eventLd(e, base)) : null);
    upsertJsonLd('books', bookList?.length ? bookList.map((b) => bookLd(b, base)) : null);
  }, [title, description, image, media, type, lang, t, pathname, book, event, events, bookList]);

  return null;
}
