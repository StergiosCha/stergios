// Generates public/sitemap.xml and public/robots.txt from the manifest.
// SITE_URL can be overridden for a custom domain: SITE_URL=https://prunak.example npm run build
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const books = JSON.parse(readFileSync(resolve(root, 'src/data/books.json'), 'utf8'));
const texts = JSON.parse(readFileSync(resolve(root, 'src/data/texts.json'), 'utf8'));
const events = JSON.parse(readFileSync(resolve(root, 'src/data/events.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL ?? 'https://stergioscha.github.io/stergios').replace(/\/$/, '');

const routes = ['/', '/books', '/texts', '/reviews', '/events', '/press', '/about', '/contact', ...books.map((b) => `/books/${b.slug}`), ...texts.map((t) => `/texts/${t.slug}`), ...events.map((e) => `/events/${e.id}`)];
const today = new Date().toISOString().slice(0, 10);

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map((r) => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n') +
  `\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);
writeFileSync(resolve(root, 'public/robots.txt'), robots);
console.log(`✓ sitemap.xml (${routes.length} routes) + robots.txt written for ${SITE_URL}`);
