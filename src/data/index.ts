import booksRaw from './books.json';
import reviewsRaw from './reviews.json';
import eventsRaw from './events.json';
import authorRaw from './author.json';
import textsRaw from './texts.json';
import coversRaw from './covers.json';
import photosRaw from './photos.json';
import mediaRaw from './media.json';
import videoRaw from './video.json';

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
  speakers?: { name: string; role?: string }[]; url?: string; photos_url?: string; video_url?: string; upcoming?: boolean;
  /** media item ids (media.json) in display order; poster is the id of the poster among them, if any */
  media: string[]; poster: string;
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
export interface PhotoAsset { w: number; h: number; src: Record<string, string>; blur: string }
/** one image from books-assets/media, any category */
export interface MediaItem {
  id: string; category: 'events' | 'press' | 'books' | 'author' | string; owner: string;
  kind: 'photo' | 'poster' | 'screenshot' | 'cover' | 'portrait' | string;
  caption: string; credit: string; source_url: string; date: string;
  w: number; h: number; orig: string; src: Record<string, string>; blur: string; is_cover?: boolean;
}
export interface Media {
  items: Record<string, MediaItem>; events: Record<string, string[]>; press: Record<string, string>;
  books: Record<string, string[]>; author: string[]; hero: string[]; press_kit: string[];
}
export interface Video { event_or_book: string; title: string; url: string; platform: string; date: string; missing: boolean }

export const books = booksRaw as Book[];
export const reviews = reviewsRaw as Review[];
export const events = (eventsRaw as Ev[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
export const author = authorRaw as Author;
export const texts = textsRaw as TextItem[];
export const covers = coversRaw as Record<string, Cover>;
export const photos = photosRaw as Record<string, PhotoAsset>;
export const media = mediaRaw as Media;
export const videos = videoRaw as Video[];

export const getBook = (slug: string) => books.find((b) => b.slug === slug);
export const getText = (slug: string) => texts.find((t) => t.slug === slug);
export const getEvent = (id: string) => events.find((e) => e.id === id);
export const bookReviews = (slug: string) => reviews.filter((r) => r.book === slug);
export const bookEvents = (slug: string) => events.filter((e) => e.book?.includes(slug));
export const bookTexts = (slug: string) => texts.filter((t) => t.book === slug);
export const upcoming = (today = new Date().toISOString().slice(0, 10)) => events.filter((e) => e.date >= today).reverse();

/** media helpers: always resolve to items, never to undefined entries */
const pick = (ids: string[] | undefined) => (ids ?? []).map((id) => media.items[id]).filter((m): m is MediaItem => !!m);
export const mediaItem = (id: string): MediaItem | undefined => media.items[id];
export const eventMedia = (e: Ev): MediaItem[] => pick(e.media);
export const eventPhotos = (e: Ev): MediaItem[] => eventMedia(e).filter((m) => m.kind !== 'poster');
export const eventPoster = (e: Ev): MediaItem | undefined => (e.poster ? mediaItem(e.poster) : undefined);
export const pressShot = (reviewId: string): MediaItem | undefined => (media.press[reviewId] ? mediaItem(media.press[reviewId]) : undefined);
/** extra images of a book (back cover, spreads); files that are the cover again are excluded */
export const bookExtraMedia = (slug: string): MediaItem[] => pick(media.books[slug]).filter((m) => !m.is_cover);
export const heroItems = (): MediaItem[] => pick(media.hero);
export const pressKitPhotos = (): MediaItem[] => pick(media.press_kit);
/** owner event of a media item, if it is an event image */
export const eventOf = (m: MediaItem) => (m.category === 'events' ? getEvent(m.owner) : undefined);

export const asset = (rel: string) => `${import.meta.env.BASE_URL}${rel.replace(/^\/+/, '')}`;
export const largest = (src: Record<string, string>) => src[String(Math.max(...Object.keys(src).map(Number)))];

/** the raw excerpt HTML per text (author's own pages, article body only), loaded on demand so the main bundle stays small */
const textLoaders = import.meta.glob('../texts/*.html', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
export const loadTextHtml = (slug: string): Promise<string> => textLoaders[`../texts/${slug}.html`]?.() ?? Promise.resolve('');
