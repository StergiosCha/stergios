import booksRaw from './books.json';
import reviewsRaw from './reviews.json';
import eventsRaw from './events.json';
import authorRaw from './author.json';
import textsRaw from './texts.json';
import coversRaw from './covers.json';
import photosRaw from './photos.json';

export interface Buy { shop: string; url: string }
export interface Book {
  slug: string; title_el: string; title_en?: string; subtitle_el?: string; subtitle_en?: string;
  kind: 'novel' | 'short-stories' | 'poetry' | 'non-fiction' | string; language?: string;
  publisher: string; publisher_url?: string; year: number; month?: number; isbn?: string;
  pages?: number; size?: string; price_eur?: number; blurb_el?: string; blurb_source?: string;
  contents?: string[]; cover?: string; buy?: Buy[]; reviews?: string[]; events?: string[]; notes?: string; texts?: string[];
  translated?: boolean;
}
export interface Review {
  id: string; book: string; type: string; outlet: string; author?: string; date?: string; title?: string; url: string; quote_el?: string;
}
export interface Ev {
  id: string; date: string; date_precision?: string; book: string[]; title?: string; venue?: string; city?: string; country?: string;
  speakers?: { name: string; role?: string }[]; url?: string; photos_url?: string; video_url?: string; upcoming?: boolean; photo_key?: string;
}
export interface TextItem {
  slug: string; title: string; kind_label: string; kind: string; blurb: string; note: string; note_html: string; minutes: number;
  book: string; words: number; collection: string; cover: string; cover_credit: string;
}
export interface Cover { w: number; h: number; src: Record<'900' | '450', string>; blur: string }
export interface Author {
  name_el: string; name_en: string; birth_year: number; birth_place: string; bio_el_original: string[] | string;
  bio_el_short: string; bio_el_medium: string; bio_en_short: string; bio_en_medium: string; bio_source: string;
  positions: string[]; emails: string[]; socials: Record<string, string>;
}

export const books = booksRaw as Book[];
export const reviews = reviewsRaw as Review[];
export const events = (eventsRaw as Ev[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
export const author = authorRaw as Author;
export const texts = textsRaw as TextItem[];
export const covers = coversRaw as Record<string, Cover>;
export interface PhotoAsset { w: number; h: number; src: Record<string, string>; blur: string }
export const photos = photosRaw as Record<string, PhotoAsset>;

export const getBook = (slug: string) => books.find((b) => b.slug === slug);
export const getText = (slug: string) => texts.find((t) => t.slug === slug);
export const bookReviews = (slug: string) => reviews.filter((r) => r.book === slug);
export const bookEvents = (slug: string) => events.filter((e) => e.book?.includes(slug));
export const bookTexts = (slug: string) => texts.filter((t) => t.book === slug);
export const upcoming = (today = new Date().toISOString().slice(0, 10)) => events.filter((e) => e.date >= today).reverse();

export const asset = (rel: string) => `${import.meta.env.BASE_URL}${rel.replace(/^\/+/, '')}`;

/** the raw excerpt HTML per text (author's own pages, article body only) */
export const textHtml = import.meta.glob('../texts/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
export const getTextHtml = (slug: string) => textHtml[`../texts/${slug}.html`] ?? '';
