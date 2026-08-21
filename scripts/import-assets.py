#!/usr/bin/env python3
"""
The single way content enters the site. Reads ~/Dropbox/books-assets and _old/, writes src/data and public/.

  books-assets/data/*.json                 -> src/data/{books,reviews,events,author}.json (publisher fixes, text links)
  books-assets/covers + _old/covers        -> public/covers/<slug>-{900,450}.webp + blur      -> src/data/covers.json
  books-assets/photos/portrait.jpg         -> public/photos/portrait-{1200,600}.webp          -> src/data/photos.json
  books-assets/media/**  (round 2)         -> public/media/<cat>/<owner>/<n>-{1600,800,400}.webp + blur, EXIF stripped
                                              captions + credits + source urls              -> src/data/media.json
  books-assets/media/video/video.json      -> src/data/video.json
  _old/texts/*.html (the author's excerpts) -> src/texts/<slug>.html + src/data/texts.json

Every file referenced by data/media_index.json, media/**/captions.json, events[].photo or books[].cover MUST exist,
otherwise the import stops with exit code 1 and lists what is missing. Captions are never invented: empty stays empty.

Run:  ~/Dropbox/toumpano-assets/tools/.venv/bin/python scripts/import-assets.py   (any python with Pillow)
"""
from __future__ import annotations
import base64, io, json, re, shutil, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path('/Users/graogro/Dropbox/books-assets')
OLD = ROOT / '_old'
OUT_COVERS = ROOT / 'public/covers'
OUT_PHOTOS = ROOT / 'public/photos'
OUT_MEDIA = ROOT / 'public/media'
OUT_DATA = ROOT / 'src/data'
OUT_TEXTS = ROOT / 'src/texts'
for d in (OUT_COVERS, OUT_PHOTOS, OUT_MEDIA, OUT_DATA, OUT_TEXTS): d.mkdir(parents=True, exist_ok=True)

missing: list[str] = []
def need(rel: str, why: str) -> Path | None:
    p = ASSETS / rel
    if not p.exists():
        missing.append(f'{rel}   ({why})')
        return None
    return p

# ---- data ---------------------------------------------------------------------------------
books = json.loads((ASSETS / 'data/books.json').read_text())
reviews = json.loads((ASSETS / 'data/reviews.json').read_text())
events = json.loads((ASSETS / 'data/events.json').read_text())
author = json.loads((ASSETS / 'data/author.json').read_text())
media_index = json.loads((ASSETS / 'data/media_index.json').read_text())

# corrections that Antigravity's own report established but did not apply
for b in books:
    if b['slug'] == 'istories-aplis-logikis':
        b['publisher'] = 'Νήσος'
        b['publisher_url'] = 'https://nissos.gr'
    if b['slug'] == 'dikaioma-stin-antifasi':
        b['publisher'] = 'Ιδιωτική έκδοση'

# ---- texts (author's excerpt pages) ------------------------------------------------------
TEXT_META = {  # slug -> (book slug or '', kind)
    'tsotyli': ('min-milas-den-einai-aparemfato', 'excerpt'),
    'tritoklitoi': ('min-milas-den-einai-aparemfato', 'excerpt'),
    'grover2': ('grover-2-i-yposimeiosi', 'excerpt'),
    'skalomenoi': ('skalomenoi-se-ena-mpar', 'excerpt'),
    'grover': ('grover', 'excerpt'),
    'isouzou': ('vatsnies', 'story'),
    'xlorini': ('istories-aplis-logikis', 'story'),
    'panta': ('', 'story'),
}
idx = (OLD / 'index.html').read_text()
m = re.search(r'const TEXTS = \[(.*?)\];', idx, re.S)
entries = re.findall(r'\{\s*kind: "(.*?)",\s*title: "(.*?)",\s*blurb: "(.*?)",\s*note: "(.*?)",\s*minutes: (\d+),\s*cover: "(.*?)",[^\n]*\s*href: "(.*?)"\s*\}', m.group(1), re.S)
texts = []
for kind, title, blurb, note, minutes, cover, href in entries:
    slug = Path(href).stem
    if slug not in TEXT_META: continue
    html = (OLD / href).read_text()
    art = re.search(r'<article>(.*?)</article>', html, re.S)
    body = art.group(1).strip() if art else ''
    body = re.sub(r'\s*\n\s*', '\n', body)
    (OUT_TEXTS / f'{slug}.html').write_text(body)
    credit = re.search(r'<p class="meta">Εικονογράφηση[^<]*</p>', html)
    book_slug, tkind = TEXT_META[slug]
    texts.append({
        'slug': slug, 'title': title, 'kind_label': kind, 'kind': tkind, 'blurb': blurb, 'note': re.sub(r'<.*?>', '', note),
        'note_html': note, 'minutes': int(minutes), 'book': book_slug, 'words': len(re.sub(r'<.*?>', ' ', body).split()),
        'collection': 'Ιστορίες με άχρηστα διαγράμματα και βαριά στατιστική ελαφρότητα' if slug == 'panta' else '',
        'cover': 'panta' if slug == 'panta' else book_slug,
        'cover_credit': re.sub(r'<.*?>', '', credit.group(0)) if credit else '',
    })
if (OLD / 'figures').exists():
    shutil.copytree(OLD / 'figures', ROOT / 'public/figures', dirs_exist_ok=True)
for t in texts:
    p = OUT_TEXTS / f"{t['slug']}.html"
    p.write_text(p.read_text().replace('../figures/', '/figures/'))
for b in books:
    b['texts'] = [t['slug'] for t in texts if t['book'] == b['slug']]

# ---- image helpers ------------------------------------------------------------------------
def load(src: Path) -> Image.Image:
    # exif_transpose applies orientation; convert('RGB') + save without exif = metadata stripped
    return ImageOps.exif_transpose(Image.open(src)).convert('RGB')

def blur_of(im: Image.Image, box=(24, 24)) -> str:
    b = im.copy(); b.thumbnail(box); buf = io.BytesIO(); b.save(buf, 'WEBP', quality=40)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def derive(src: Path, out_dir: Path, base: str, widths: tuple[int, ...], rel_prefix: str, quality=84) -> dict:
    """Write <out_dir>/<base>-<w>.webp for each width (never enlarging) and return {w,h,src,blur,orig}."""
    im = load(src)
    out = {'w': im.width, 'h': im.height, 'src': {}, 'orig': f'{im.width}x{im.height}'}
    out_dir.mkdir(parents=True, exist_ok=True)
    for w in widths:
        c = im.copy(); c.thumbnail((w, w))
        c.save(out_dir / f'{base}-{w}.webp', 'WEBP', quality=quality, method=6)
        out['src'][str(w)] = f'{rel_prefix}/{base}-{w}.webp'
    out['blur'] = blur_of(im)
    return out

# ---- covers -----------------------------------------------------------------------------
covers = {}
for b in books:
    if b.get('cover'):
        src = need(b['cover'], f"cover of {b['slug']}")
        if src:
            d = derive(src, OUT_COVERS, b['slug'], (900, 450), 'covers')
            covers[b['slug']] = {'w': d['w'], 'h': d['h'], 'src': d['src'], 'blur': d['blur']}
panta = OLD / 'covers/panta.jpg'
if panta.exists():
    d = derive(panta, OUT_COVERS, 'panta', (900, 450), 'covers')
    covers['panta'] = {'w': d['w'], 'h': d['h'], 'src': d['src'], 'blur': d['blur']}

# ---- portrait ---------------------------------------------------------------------------
photos = {}
portrait = need('photos/portrait.jpg', 'author portrait')
if portrait:
    d = derive(portrait, OUT_PHOTOS, 'portrait', (1200, 600), 'photos')
    photos['portrait'] = {'w': d['w'], 'h': d['h'], 'src': d['src'], 'blur': d['blur']}

# ---- media (round 2) --------------------------------------------------------------------
# Kinds checked by eye on 2026-08-18 (contact sheet of all 17 images): three are posters, the rest photos.
POSTERS = {'2025-03-27-enaestro', '2024-12-29-cafe-lotos', '2024-06-08-mple-elafi-kozani'}
# Home header band candidates, in order of preference (REPORT_MEDIA.md §3, wide shots of a reading or audience).
HERO = ['2019-12-29-fuit-grevena', '2017-12-27-fuit-grevena', '2021-10-20-arokaria', '2024-grover2-grevena', '2018-10-12-aition-athens']
GENERIC_CAPTION = re.compile(r'^(Φωτογραφία / Αφίσα από την εκδήλωση|Στιγμιότυπο δημοσιεύματος / κριτικής|Εξώφυλλο βιβλίου|Επίσημο πορτρέτο)')

def read_captions(folder: Path) -> dict[str, dict]:
    p = folder / 'captions.json'
    if not p.exists(): return {}
    return {c['file']: c for c in json.loads(p.read_text())}

def clean_caption(s: str) -> str:
    # captions Antigravity generated from the event/review title are not captions; the site derives alt text itself
    return '' if not s or GENERIC_CAPTION.match(s) else s.strip()

media = {'items': {}, 'events': {}, 'press': {}, 'books': {}, 'author': [], 'hero': [], 'press_kit': []}
event_ids = {e['id'] for e in events}
review_ids = {r['id'] for r in reviews}
book_slugs = {b['slug'] for b in books}

def add_item(cat: str, owner: str, n: str, src: Path, meta: dict, kind: str) -> str:
    mid = f'{cat}/{owner}/{n}'
    d = derive(src, OUT_MEDIA / cat / owner, n, (1600, 800, 400), f'media/{cat}/{owner}')
    media['items'][mid] = {
        'id': mid, 'category': cat, 'owner': owner, 'kind': kind,
        'caption': clean_caption(meta.get('caption', '')), 'credit': (meta.get('credit') or '').strip(),
        'source_url': (meta.get('source_url') or '').strip(), 'date': (meta.get('date') or '').strip(),
        'w': d['w'], 'h': d['h'], 'orig': d['orig'], 'src': d['src'], 'blur': d['blur'],
    }
    return mid

IMG = re.compile(r'\.(jpe?g|png|webp|tiff?)$', re.I)

# events: media/events/<id>/NN.jpg
ev_root = ASSETS / 'media/events'
for folder in sorted(p for p in ev_root.iterdir() if p.is_dir()) if ev_root.exists() else []:
    eid = folder.name
    if eid not in event_ids:
        print(f'! media/events/{eid}: no such event in events.json, skipped'); continue
    caps = read_captions(folder)
    for f in caps:  # every captioned file must exist
        need(f'media/events/{eid}/{f}', f'captions.json of event {eid}')
    files = sorted(f for f in folder.iterdir() if IMG.search(f.name))
    ids = []
    for f in files:
        meta = caps.get(f.name, {})
        kind = 'poster' if eid in POSTERS else (meta.get('kind') or 'photo')
        ids.append(add_item('events', eid, f.stem, f, meta, kind))
    if ids: media['events'][eid] = ids

# press: media/press/<review-id>-screenshot.jpg
# Screenshots that did not capture the article (checked by eye on 2026-08-18). Re-capture and remove from this set.
PRESS_BAD = {'neoplanodion-2021-vatsnies': 'Cloudflare "checking your browser" page instead of the article'}
pr_root = ASSETS / 'media/press'
if pr_root.exists():
    caps = read_captions(pr_root)
    for f in caps: need(f'media/press/{f}', 'media/press/captions.json')
    for f in sorted(p for p in pr_root.iterdir() if IMG.search(p.name)):
        rid = re.sub(r'-screenshot$', '', f.stem)
        if rid not in review_ids:
            print(f'! media/press/{f.name}: no review {rid}, skipped'); continue
        if rid in PRESS_BAD:
            print(f'! media/press/{f.name}: not shown, {PRESS_BAD[rid]}'); continue
        media['press'][rid] = add_item('press', rid, 'screenshot', f, caps.get(f.name, {}), 'screenshot')

# books: media/books/<slug>/NN.jpg  (files that are just the cover again are recorded but flagged is_cover)
bk_root = ASSETS / 'media/books'
for folder in sorted(p for p in bk_root.iterdir() if p.is_dir()) if bk_root.exists() else []:
    slug = folder.name
    if slug not in book_slugs:
        print(f'! media/books/{slug}: no such book, skipped'); continue
    caps = read_captions(folder)
    for f in caps: need(f'media/books/{slug}/{f}', f'captions.json of book {slug}')
    ids = []
    for f in sorted(p for p in folder.iterdir() if IMG.search(p.name)):
        meta = caps.get(f.name, {})
        mid = add_item('books', slug, f.stem, f, meta, meta.get('kind') or 'photo')
        media['items'][mid]['is_cover'] = (meta.get('kind') == 'cover')
        ids.append(mid)
    if ids: media['books'][slug] = ids

# author: media/author/NN.jpg
au_root = ASSETS / 'media/author'
if au_root.exists():
    caps = read_captions(au_root)
    for f in caps: need(f'media/author/{f}', 'media/author/captions.json')
    for f in sorted(p for p in au_root.iterdir() if IMG.search(p.name)):
        meta = caps.get(f.name, {})
        media['author'].append(add_item('author', 'author', f.stem, f, meta, meta.get('kind') or 'portrait'))

# every row of the master index must exist on disk
for row in media_index:
    need(row['file'], f"media_index.json row {row.get('id')}")
# every legacy event photo referenced in events.json
for e in events:
    if e.get('photo'): need(e['photo'], f"events.json photo of {e['id']}")

media['hero'] = [f'events/{eid}/01' for eid in HERO if f'events/{eid}/01' in media['items']]
# five event photos cleared for press (public, credited, landscape): the same wide shots
media['press_kit'] = media['hero'][:5]

# video / radio
video_src = ASSETS / 'media/video/video.json'
video = []
if video_src.exists():
    for v in json.loads(video_src.read_text()):
        u = (v.get('url') or '').strip()
        host_only = re.fullmatch(r'https?://[^/]+/?', u) is not None
        video.append({**v, 'url': '' if host_only else u, 'missing': host_only or not u})

# ---- stop if anything referenced is missing --------------------------------------------------
if missing:
    print('IMPORT FAILED, referenced files not found in books-assets:', file=sys.stderr)
    for x in missing: print('  ' + x, file=sys.stderr)
    sys.exit(1)

# events: drop the round-1 photo fields (media.json is the source now)
for e in events:
    e.pop('photo', None); e.pop('photo_source', None); e.pop('photo_key', None)
    e['media'] = media['events'].get(e['id'], [])
    e['poster'] = next((m for m in e['media'] if media['items'][m]['kind'] == 'poster'), '')

(OUT_DATA / 'books.json').write_text(json.dumps(books, ensure_ascii=False, indent=1))
(OUT_DATA / 'reviews.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=1))
(OUT_DATA / 'events.json').write_text(json.dumps(events, ensure_ascii=False, indent=1))
(OUT_DATA / 'author.json').write_text(json.dumps(author, ensure_ascii=False, indent=1))
(OUT_DATA / 'texts.json').write_text(json.dumps(texts, ensure_ascii=False, indent=1))
(OUT_DATA / 'covers.json').write_text(json.dumps(covers, ensure_ascii=False, indent=1))
(OUT_DATA / 'photos.json').write_text(json.dumps(photos, ensure_ascii=False, indent=1))
(OUT_DATA / 'media.json').write_text(json.dumps(media, ensure_ascii=False, indent=1))
(OUT_DATA / 'video.json').write_text(json.dumps(video, ensure_ascii=False, indent=1))
n_ev = sum(len(v) for v in media['events'].values())
print(f"{len(books)} books, {len(reviews)} reviews, {len(events)} events, {len(texts)} texts, {len(covers)} covers, "
      f"{len(media['items'])} media items ({n_ev} event images in {len(media['events'])} events, {len(media['press'])} press shots, "
      f"{sum(len(v) for v in media['books'].values())} book images, {len(media['author'])} author), {len(video)} video/radio")
