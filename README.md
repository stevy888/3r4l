# 3r4l.org

Four static pages that hold up a card: the home page and the what-next page, in Tagalog at the front door and in English under `/en/`. brother Daniel's card wording byte-identical from his PDF (never retyped), Steve's lines as typed, a verse a day from a text of record (English: the New International Version from the Knowing Jesus NIV rows through its verse door, with Biblica's gratis-use notice at the foot of each page — the owner's word 2026-10-07; Tagalog: Ang Dating Biblia 1905, public domain), and the paper door for brother Daniel: the QR, the print sheet and a one-page manual.

No menu, no sign-up, no cookie, no tracker, no server: HTML files served by GitHub Pages from `docs/`.

## The state today (2026-10-09)

2026-10-09 (seat build-3r4l-plate-1009, owner "Go plate"): THE PLATE serves on the home (b114102) — the hero is one drawn plate in the Knowing Jesus ask-plate's manner: a road from the left edge up the hill to the cross that draws itself as the voice reads (rule 1 a man setting a tied sack down with open hands · rule 2 open palms at the waist · rule 3 one reaching for one half-turned · "everyday" the sun rising with four rays · the little prayer a street of six heads · "See the other side" the path up to the cross), the card's line in a navy box over the sky one cue at a time, the finished picture at rest and under reduced motion, the lamp's pale line by night. Three rival plates (one hill · the broadside · the journey) and two blind judges chose the journey (7.26 of two); the cure folded where both agreed. The living card's paper-writing is retired; the audio, the cues, the lit rules and /card/ are unchanged. New proof: `node frames-plate.mjs <base> <dir>` (the first screen at seven moments of the voice, no decoder needed). The home is 61,110 B of its 61,440 bar — the next byte needs a cut. His eye: TRP-plate-eye.

2026-10-09 (seat build-3r4l-p2b-1009): THE LIVING CARD serves — the one audio docs/film/card.m4a (the film master's track; the video retired), the cues of content/card.vtt baked into the lines, the play glyph on the sun and the hear door under the rules card, /card/'s round play and the lit cue; THE ENGRAVED RULES CARD (the fleet's winner); the foot row on every page; /what-next/ without the forty list — the big door opens docs/forty.pdf, THE PATH TO THE CROSS (kit/make-forty-sheet.mjs; four blind rounds ≈ 7.7); the tl/ur card doors wait on card-tl.pdf / card-ur.pdf. Panel r2: home 7.94 · card 7.80 · what-next 7.70 · contact 7.08 · privacy 7.33. Proof: `bash check-wording docs/` · `node measure.mjs <base> --frames <dir>` · `node prove-reading.mjs <base>` (Chrome for the decoder). The owner's eye is the next gate (TR2B-eye-pages).

The state of 2026-10-07 follows.
THE INTERIM: the English pair serves at the apex and under `/en/`; the Tagalog pair is built the moment a named pastor's signed check of the Tagalog lines exists. THE CARD (2026-10-07): brother Daniel's card is on disk beside the repo and `content/card.txt` is its wording of record (eight blocks in the card's order, both faces; `content/card.sha`); the page serves it as the two printed faces. The print files stay OUT of this public repo until brother Daniel's yes.

## The runbook (no model, no token; ten minutes)
- Set the journey's first day (the day the address first goes out on brother Daniel's cards): edit `content/journey.json`, then build, fence, commit and push (the three commands below).
- Add a pool row or a testimonial: edit `content/`, then the same three commands.
- The three commands: `node build.mjs` · `bash check-wording docs/` · commit and push `docs/` and `content/`.
- Re-resolve the English verses: `KJ_VERSE_DOOR=http://127.0.0.1:3020 node build.mjs --refresh` against the Studio twin of the verse door (the full catalog; staging's public catalog folds `niv` to `vsb` and the build refuses the fold). Against staging itself the access token rides in a subshell: `( set -a; . ~/.config/kj/external-probe.env; set +a; node build.mjs --refresh )`.
- After the www go-live word: `node build.mjs --canonical` moves the forty doors to `/bible/<book>/<chapter>/<verse>`.
- The kit: `.venv/bin/python kit/make_kit.py` writes kit.pdf (both faces N-up, A4 + Letter, every cell pixel-proven) to `/Users/aibrain/projects/3r4l-inputs/kit/` — PRIVATE. On brother Daniel's yes: add the line `- jeff_yes_to_download: YES <his words, date>` to `3r4l-inputs/INPUTS.md`, then `.venv/bin/python kit/make_kit.py --publish` (copies card.pdf + kit.pdf into `docs/`) and the three commands (the print doors and `/card` `/kit` appear).
- The wording proof: `pdftotext -layout /Users/aibrain/projects/3r4l-inputs/card-of-record.pdf - | node prove-card.mjs` → EQUAL.
- The proofs: `./doctor` · `bash check-wording docs/` · `node measure.mjs <base-url>` · `bash probe-links <base-url>` · `bash dod-probe`.

## The scripts
`build.mjs` (reads `content/`, writes `docs/`) · `check-wording` (the copy fence) · `normalise.mjs` (the one normaliser) · `prove-card.mjs` (the wording proof) · `measure.mjs` (the measured first screen) · `probe-links` · `doctor` · `kit/make_kit.py` · `dod-probe`.
