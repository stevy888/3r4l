# 3r4l.org

Four static pages that hold up a card: the home page and the what-next page, in Tagalog at the front door and in English under `/en/`. Jeff's card wording byte-identical from his PDF (never retyped), Steve's lines as typed, a verse a day from a text of record (English: the New International Version from the Knowing Jesus NIV rows through its verse door, with Biblica's gratis-use notice at the foot of each page — the owner's word 2026-10-07; Tagalog: Ang Dating Biblia 1905, public domain), and the paper door for Jeff: the QR, the print sheet and a one-page manual.

No menu, no sign-up, no cookie, no tracker, no server: HTML files served by GitHub Pages from `docs/`.

## The state today (2026-10-07)
THE INTERIM: the English pair serves at the apex and under `/en/`; the card block is a greyed placeholder until Jeff's card PDF is on disk; the Tagalog pair is built the moment a named pastor's signed check of the Tagalog lines exists. Nothing here claims to be the prayer or the rules.

## The runbook (no model, no token; ten minutes)
- Set the journey's first day (the day the address first goes out on Jeff's cards): edit `content/journey.json`, then build, fence, commit and push (the three commands below).
- Add a pool row or a testimonial: edit `content/`, then the same three commands.
- The three commands: `node build.mjs` · `bash check-wording docs/` · commit and push `docs/` and `content/`.
- Re-resolve the English verses: `KJ_VERSE_DOOR=http://127.0.0.1:3020 node build.mjs --refresh` against the Studio twin of the verse door (the full catalog; staging's public catalog folds `niv` to `vsb` and the build refuses the fold). Against staging itself the access token rides in a subshell: `( set -a; . ~/.config/kj/external-probe.env; set +a; node build.mjs --refresh )`.
- After the www go-live word: `node build.mjs --canonical` moves the forty doors to `/bible/<book>/<chapter>/<verse>`.
- The kit: `.venv/bin/python kit/make_kit.py [--stamp-back]` (the sheets need Jeff's card PDF beside the repo).
- The proofs: `./doctor` · `bash check-wording docs/` · `node measure.mjs <base-url>` · `bash probe-links <base-url>` · `bash dod-probe`.

## The scripts
`build.mjs` (reads `content/`, writes `docs/`) · `check-wording` (the copy fence) · `normalise.mjs` (the one normaliser) · `measure.mjs` (the measured first screen) · `probe-links` · `doctor` · `kit/make_kit.py` · `dod-probe`.
