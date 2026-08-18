# Στέργιος Χατζηκυριακίδης, λογοτεχνικός ιστότοπος

Live: https://stergioscha.github.io/stergios/

React 18 + Vite + TypeScript, plain CSS, ΕΛ/EN, φωτεινό/σκοτεινό θέμα. Καμία βάση, κανένα CMS. Οδηγός για αλλαγές χωρίς προγραμματισμό: `ΟΔΗΓΟΣ.md`.

## Τοπικά
    npm install
    npm run dev          # http://localhost:5173/stergios/
    npm run build        # sitemap + robots, tsc, vite

## Πού είναι το περιεχόμενο
Όλα τα δεδομένα έρχονται από `~/Dropbox/books-assets/` (round 1: data, covers, photos· round 2: media/) και τον παλιό ιστότοπο (`_old/`, τα κείμενα του συγγραφέα):

    ~/Dropbox/toumpano-assets/tools/.venv/bin/python scripts/import-assets.py   # οποιοδήποτε python με Pillow

Παράγει `src/data/{books,reviews,events,author,texts,covers,photos,media,video}.json`, `public/covers/*.webp`, `public/photos/*.webp`, `public/media/**.webp` (1600/800/400 + blur, χωρίς EXIF), `src/texts/*.html`. Αν λείπει αρχείο που αναφέρεται στο `media_index.json`, σε `captions.json`, σε `events[].photo` ή σε `books[].cover`, το import σταματά με exit 1 και τα απαριθμεί.

- Νέο βιβλίο: `books-assets/data/books.json` + εξώφυλλο στο `books-assets/covers/<slug>.jpg`, ξανατρέξε το import.
- Νέα κριτική / παρουσίαση: `books-assets/data/reviews.json` / `events.json`. Παρουσιάσεις με ημερομηνία στο μέλλον εμφανίζονται ως Επόμενες.
- Νέα φωτογραφία παρουσίασης: `books-assets/media/events/<event-id>/NN.jpg` + γραμμή στο `captions.json` του φακέλου, ξανατρέξε το import. Ή από τον browser: φάκελος `inbox/` (δες ΟΔΗΓΟΣ.md), το GitHub Action `inbox.yml` κάνει WebP, ενημερώνει το `media.json` και κάνει deploy.
- Νέο κείμενο προς ανάγνωση: `<article>` HTML στο `_old/texts/<slug>.html`, καταχώριση στη λίστα `TEXTS` του `_old/index.html` και στο `TEXT_META` του import script.
- Κείμενα UI: `src/i18n/strings.ts`.

Το `media.json` περιέχει `items` (κάθε εικόνα με caption, credit, source_url, μεγέθη, blur), `events` (event id → εικόνες), `press` (review id → στιγμιότυπο), `books` (slug → εικόνες, οι επαναλήψεις του εξωφύλλου σημαίνονται is_cover), `hero` (η φωτογραφία της αρχικής), `press_kit` (5 φωτογραφίες για τον Τύπο). Λεζάντες που δεν υπάρχουν μένουν κενές· το alt βγαίνει από τίτλο + χώρο της παρουσίασης.

## Deploy
GitHub Actions σε κάθε push στο `main` (`.github/workflows/deploy.yml`) προς GitHub Pages. Το `inbox.yml` τρέχει σε push που αγγίζει `inbox/**`. Custom domain αργότερα: `vite.config.ts` base `/`, `public/404.html` pathSegmentsToKeep 0, `scripts/gen-seo.mjs` και `src/components/Seo.tsx` origin, `import-assets.py` το `/stergios/figures/`.

`_old/` κρατά τον προηγούμενο στατικό ιστότοπο (τα κείμενα και τα εξώφυλλα) ως πηγή. Δεν δημοσιεύεται.
