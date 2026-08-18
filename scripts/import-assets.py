#!/usr/bin/env python3
"""
Import content into the site:
  - books-assets/data/*.json  -> src/data/*.json (books get publisher fixes + text links)
  - covers (books-assets/covers + _old/covers) -> public/covers/<slug>-{900,450}.webp + blur, sizes in src/data/covers.json
  - _old/texts/*.html (the author's excerpt pages) -> src/texts/<slug>.html (article body only) + src/data/texts.json

Run:  ./tools/.venv/bin/python scripts/import-assets.py   (needs Pillow; reuse the toumpano venv or pip install pillow)
"""
from __future__ import annotations
import base64, io, json, re, shutil
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path('/Users/graogro/Dropbox/books-assets')
OLD = ROOT / '_old'
OUT_COVERS = ROOT / 'public/covers'
OUT_DATA = ROOT / 'src/data'
OUT_TEXTS = ROOT / 'src/texts'
for d in (OUT_COVERS, OUT_DATA, OUT_TEXTS): d.mkdir(parents=True, exist_ok=True)

# ---- data ---------------------------------------------------------------------------------
books = json.loads((ASSETS / 'data/books.json').read_text())
reviews = json.loads((ASSETS / 'data/reviews.json').read_text())
events = json.loads((ASSETS / 'data/events.json').read_text())
author = json.loads((ASSETS / 'data/author.json').read_text())

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
    # keep only paragraphs/headings/blockquotes/em/strong/br/hr/img(figures)
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
# copy figures used inside texts (e.g. panta-sxima1.png)
if (OLD / 'figures').exists():
    shutil.copytree(OLD / 'figures', ROOT / 'public/figures', dirs_exist_ok=True)
for t in texts:
    p = OUT_TEXTS / f"{t['slug']}.html"
    s = p.read_text().replace('../figures/', '/stergios/figures/')
    p.write_text(s)

# link texts to books
for b in books:
    b['texts'] = [t['slug'] for t in texts if t['book'] == b['slug']]

# ---- covers -----------------------------------------------------------------------------
def derive(src: Path, slug: str) -> dict:
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    out = {'w': im.width, 'h': im.height, 'src': {}}
    for w in (900, 450):
        c = im.copy(); c.thumbnail((w, w * 3))
        c.save(OUT_COVERS / f'{slug}-{w}.webp', 'WEBP', quality=84, method=6)
        out['src'][str(w)] = f'covers/{slug}-{w}.webp'
    b = im.copy(); b.thumbnail((16, 24)); buf = io.BytesIO(); b.save(buf, 'WEBP', quality=40)
    out['blur'] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return out

covers = {}
for b in books:
    src = ASSETS / (b.get('cover') or '')
    if b.get('cover') and src.exists():
        covers[b['slug']] = derive(src, b['slug'])
    else:
        b['cover'] = ''
# extra cover for the unpublished collection text
panta = OLD / 'covers/panta.jpg'
if panta.exists(): covers['panta'] = derive(panta, 'panta')

(OUT_DATA / 'books.json').write_text(json.dumps(books, ensure_ascii=False, indent=1))
(OUT_DATA / 'reviews.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=1))
(OUT_DATA / 'events.json').write_text(json.dumps(events, ensure_ascii=False, indent=1))
(OUT_DATA / 'author.json').write_text(json.dumps(author, ensure_ascii=False, indent=1))
(OUT_DATA / 'texts.json').write_text(json.dumps(texts, ensure_ascii=False, indent=1))
(OUT_DATA / 'covers.json').write_text(json.dumps(covers, ensure_ascii=False, indent=1))
print(f'{len(books)} books, {len(reviews)} reviews, {len(events)} events, {len(texts)} texts, {len(covers)} covers')
