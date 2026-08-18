// Turns whatever is dropped in inbox/ into site assets, with no terminal needed by the author.
//
//   inbox/events/<event-id>/*.jpg|png   -> public/media/events/<event-id>/<name>-{1600,800,400}.webp + media.json entry, appended to that event
//                                          (event-id must exist in src/data/events.json; captions come from inbox/events/<event-id>/captions.json if present)
//   inbox/books/<slug>/*.jpg|png        -> public/media/books/<slug>/... + media.json (back cover, spreads); slug must exist in books.json
//   inbox/press/<review-id>.jpg|png     -> public/media/press/<review-id>/screenshot-*.webp + media.json (replaces the clipping of that review)
//   inbox/portrait.jpg                  -> public/photos/portrait-{1200,600}.webp + src/data/photos.json
//   inbox/hero.txt                      -> one media id (e.g. events/2019-12-29-fuit-grevena/01), becomes the home header band
//
// Optional captions: inbox/events/<id>/captions.json = [{"file":"x.jpg","caption":"...","credit":"...","source_url":"..."}]
// Processed originals are deleted from inbox/ (they stay in git history, so upload web-size exports, not RAW).
// Runs in GitHub Actions on every push that touches inbox/ (.github/workflows/inbox.yml). Also runnable locally: node scripts/process-inbox.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, appendFileSync } from 'node:fs';
import { resolve, join, extname, basename } from 'node:path';
import sharp from 'sharp';

const root = resolve(new URL('..', import.meta.url).pathname);
const INBOX = join(root, 'inbox');
const PUB = join(root, 'public');
const MEDIA = join(root, 'src/data/media.json');
const EVENTS = join(root, 'src/data/events.json');
const LOG = join(INBOX, 'ΑΝΕΒΗΚΑΝ.txt');
const IMG = /\.(jpe?g|png|webp|tiff?)$/i;

if (!existsSync(INBOX)) { console.log('no inbox/'); process.exit(0); }
const media = JSON.parse(readFileSync(MEDIA, 'utf8'));
const events = JSON.parse(readFileSync(EVENTS, 'utf8'));
const books = JSON.parse(readFileSync(join(root, 'src/data/books.json'), 'utf8'));
const reviews = JSON.parse(readFileSync(join(root, 'src/data/reviews.json'), 'utf8'));
let changed = false, eventsChanged = false;
const log = (line) => { console.log(line); appendFileSync(LOG, `${new Date().toISOString().slice(0, 16).replace('T', ' ')}  ${line}\n`); };

const GR = { α: 'a', ά: 'a', β: 'b', γ: 'g', δ: 'd', ε: 'e', έ: 'e', ζ: 'z', η: 'i', ή: 'i', θ: 'th', ι: 'i', ί: 'i', ϊ: 'i', ΐ: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', ό: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', ύ: 'y', ϋ: 'y', ΰ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o', ώ: 'o' };
const slugify = (s) => Array.from(s.toLowerCase()).map((c) => GR[c] ?? c).join('').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';

/** WebP at the given widths (never enlarging), EXIF applied then stripped, plus a blur placeholder. */
async function derive(file, outDir, base, sizes, relPrefix) {
  mkdirSync(outDir, { recursive: true });
  const meta = await sharp(file).rotate().metadata();
  const src = {};
  let w = 0, h = 0;
  for (const s of sizes) {
    const info = await sharp(file).rotate().resize({ width: s, height: s, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(join(outDir, `${base}-${s}.webp`));
    if (s === sizes[0]) { w = info.width; h = info.height; }
    src[String(s)] = `${relPrefix}/${base}-${s}.webp`;
  }
  const blurBuf = await sharp(file).rotate().resize({ width: 24, height: 24, fit: 'inside' }).webp({ quality: 40 }).toBuffer();
  return { src, w, h, blur: 'data:image/webp;base64,' + blurBuf.toString('base64'), orig: `${meta.width}x${meta.height}` };
}

function readCaptions(dir) {
  const p = join(dir, 'captions.json');
  if (!existsSync(p)) return {};
  try { return Object.fromEntries(JSON.parse(readFileSync(p, 'utf8')).map((c) => [c.file, c])); }
  catch { log(`captions.json σε ${dir}: δεν διαβάζεται, αγνοήθηκε`); return {}; }
}

async function addItem(cat, owner, file, meta, kind) {
  const n = slugify(basename(file, extname(file)));
  const id = `${cat}/${owner}/${n}`;
  const d = await derive(file, join(PUB, 'media', cat, owner), n, [1600, 800, 400], `media/${cat}/${owner}`);
  media.items[id] = {
    id, category: cat, owner, kind: meta.kind || kind, caption: (meta.caption || '').trim(), credit: (meta.credit || '').trim(),
    source_url: (meta.source_url || '').trim(), date: (meta.date || '').trim(), w: d.w, h: d.h, orig: d.orig, src: d.src, blur: d.blur,
  };
  changed = true;
  return { id, orig: d.orig };
}

// ---- events / books --------------------------------------------------------------------------
for (const [cat, valid] of [['events', new Set(events.map((e) => e.id))], ['books', new Set(books.map((b) => b.slug))]]) {
  const dir = join(INBOX, cat);
  if (!existsSync(dir)) continue;
  for (const owner of readdirSync(dir)) {
    const p = join(dir, owner);
    if (!statSync(p).isDirectory()) continue;
    const files = readdirSync(p).filter((f) => IMG.test(f) && !f.startsWith('.'));
    if (!files.length) continue;
    if (!valid.has(owner)) { log(`${cat}/${owner}: δεν υπάρχει τέτοιο ${cat === 'events' ? 'event id στο events.json' : 'slug βιβλίου'}, τα αρχεία έμειναν στο inbox`); continue; }
    const caps = readCaptions(p);
    for (const f of files.sort()) {
      const { id, orig } = await addItem(cat, owner, join(p, f), caps[f] || {}, 'photo');
      media[cat][owner] = media[cat][owner] || [];
      if (!media[cat][owner].includes(id)) media[cat][owner].push(id);
      if (cat === 'events') {
        const e = events.find((x) => x.id === owner);
        e.media = e.media || [];
        if (!e.media.includes(id)) { e.media.push(id); eventsChanged = true; }
        if ((caps[f]?.kind === 'poster') && !e.poster) { e.poster = id; eventsChanged = true; }
      }
      unlinkSync(join(p, f));
      log(`+ ${cat}/${owner}/${f} (${orig}) → ${id}`);
    }
    if (existsSync(join(p, 'captions.json'))) unlinkSync(join(p, 'captions.json'));
  }
}

// ---- press clippings ---------------------------------------------------------------------------
const pressDir = join(INBOX, 'press');
if (existsSync(pressDir)) {
  const ids = new Set(reviews.map((r) => r.id));
  for (const f of readdirSync(pressDir).filter((f) => IMG.test(f) && !f.startsWith('.'))) {
    const rid = basename(f, extname(f)).replace(/-screenshot$/, '');
    if (!ids.has(rid)) { log(`press/${f}: δεν υπάρχει κριτική με id ${rid} στο reviews.json, έμεινε στο inbox`); continue; }
    const r = reviews.find((x) => x.id === rid);
    const d = await derive(join(pressDir, f), join(PUB, 'media/press', rid), 'screenshot', [1600, 800, 400], `media/press/${rid}`);
    const id = `press/${rid}/screenshot`;
    media.items[id] = { id, category: 'press', owner: rid, kind: 'screenshot', caption: '', credit: r.outlet || '', source_url: r.url || '', date: r.date || '', w: d.w, h: d.h, orig: d.orig, src: d.src, blur: d.blur };
    media.press[rid] = id; changed = true;
    unlinkSync(join(pressDir, f)); log(`+ press/${f} (${d.orig}) → ${id}`);
  }
}

// ---- portrait ---------------------------------------------------------------------------------
const portrait = readdirSync(INBOX).find((x) => IMG.test(x) && basename(x, extname(x)).toLowerCase() === 'portrait');
if (portrait) {
  const d = await derive(join(INBOX, portrait), join(PUB, 'photos'), 'portrait', [1200, 600], 'photos');
  const photosPath = join(root, 'src/data/photos.json');
  const photos = existsSync(photosPath) ? JSON.parse(readFileSync(photosPath, 'utf8')) : {};
  photos.portrait = { w: d.w, h: d.h, src: d.src, blur: d.blur };
  writeFileSync(photosPath, JSON.stringify(photos, null, 1));
  unlinkSync(join(INBOX, portrait)); changed = true; log(`νέο πορτρέτο (${d.orig})`);
}

// ---- hero -------------------------------------------------------------------------------------
const heroFile = join(INBOX, 'hero.txt');
if (existsSync(heroFile)) {
  const id = readFileSync(heroFile, 'utf8').trim();
  if (media.items[id]) { media.hero = [id, ...media.hero.filter((x) => x !== id)]; changed = true; log(`νέα φωτογραφία αρχικής: ${id}`); }
  else log(`hero.txt: ο κωδικός ${id} δεν υπάρχει στο media.json, αγνοήθηκε`);
}

if (changed) writeFileSync(MEDIA, JSON.stringify(media, null, 1));
if (eventsChanged) writeFileSync(EVENTS, JSON.stringify(events, null, 1));
console.log(changed ? 'inbox processed' : 'nothing to do');
