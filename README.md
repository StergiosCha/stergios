# Στέργιος Χατζηκυριακίδης, λογοτεχνικός ιστότοπος

Live: https://stergioscha.github.io/stergios/

React 18 + Vite + TypeScript, plain CSS, ΕΛ/EN, φωτεινό/σκοτεινό θέμα. Καμία βάση, κανένα CMS.

## Τοπικά
    npm install
    npm run dev          # http://localhost:5173/stergios/
    npm run build        # sitemap + robots, tsc, vite

## Πού είναι το περιεχόμενο
Όλα τα δεδομένα έρχονται από `~/Dropbox/books-assets/` (η έξοδος του Antigravity) και τον παλιό ιστότοπο (`_old/`):

    scripts/import-assets.py     # τρέξ' το με python που έχει Pillow, π.χ. ../toumpano-assets/tools/.venv/bin/python

Παράγει `src/data/{books,reviews,events,author,texts,covers}.json`, `public/covers/*.webp`, `src/texts/*.html`.

- Νέο βιβλίο: πρόσθεσέ το στο `books-assets/data/books.json` και το εξώφυλλο στο `books-assets/covers/<slug>.jpg`, ξανατρέξε το import.
- Νέα κριτική / παρουσίαση: `books-assets/data/reviews.json` / `events.json` (τα πεδία φαίνονται στα υπάρχοντα). Παρουσιάσεις με ημερομηνία στο μέλλον εμφανίζονται ως Επόμενες.
- Νέο κείμενο προς ανάγνωση: πρόσθεσε `<article>` HTML στο `_old/texts/<slug>.html`, καταχώρισέ το στη λίστα `TEXTS` του `_old/index.html` και στο `TEXT_META` του import script (ποιο βιβλίο). Ξανατρέξε το import.
- Βιογραφικό: `books-assets/data/author.json`. Λείπει φωτογραφία συγγραφέα.
- Κείμενα UI: `src/i18n/strings.ts`.

## Deploy
GitHub Actions σε κάθε push στο `main` (`.github/workflows/deploy.yml`) προς GitHub Pages. Custom domain αργότερα: `vite.config.ts` base `/`, `public/404.html` pathSegmentsToKeep 0, `scripts/gen-seo.mjs` και `src/components/Seo.tsx` origin.

`_old/` κρατά τον προηγούμενο στατικό ιστότοπο (τα κείμενα και τα εξώφυλλα) ως πηγή. Δεν δημοσιεύεται.
