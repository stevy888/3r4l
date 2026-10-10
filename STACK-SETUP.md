# Build the 3R4L site from scratch on a Mac

**The setup guide — the right software, every install and download, in order; then the supplementary notes.**

_2026-10-10 · from the site's own files and this Mac's toolchain · the site: https://stevy888.github.io/3r4l/ · the repo: github.com/stevy888/3r4l_

---

# PART 1 — THE SETUP (the main thing)


## 1. Accounts to open and the software to install (with versions and why)

**Accounts to open, in order**
1. GitHub — free (Pages on a public repo is free; a *private* repo needs GitHub Pro, paid)
2. Claude subscription for Claude Code — tier and monthly price: not on record here; check claude.ai/pricing
3. Anthropic Console API key + prepaid credit — only for blind AI scoring; minimum top-up not on record
4. Cloudflare — free account; the .org at registrar cost (≈ $10–12/yr for one)
5. Kit (kit.com) — free plan (10,000 subscribers, double opt-in on by default)
6. ElevenLabs — only to re-record the audio; price not on record. macOS `say` is the free stand-in
7. Suno via kie.ai — optional music bed, ≈ $0.66 a track

| Layer | Recommended | Version | Cost | Why |
|---|---|---|---|---|
| Machine | Any Apple-silicon Mac | macOS 14+ | — | The build is tiny; 8 GB RAM is plenty |
| Shell / terminal | zsh in Terminal.app | stock | free | Same as ours; nothing to install |
| Package manager | Homebrew | current | free | One command per tool |
| Editor / harness | Claude Code CLI | current (we ran 2.1.296) | subscription | Reads, edits, runs the scripts; you review |
| Version control | git + `gh` | current | free | `gh` logs in once and is the deploy credential |
| Runtime | Node, current Homebrew formula (`brew install node`) | ≥ 20 (we ran 25.9) | free | The scripts only need `node:fs/path/crypto` + global `fetch`; current is fine |
| Site build | Clone our `build.mjs` + `content/` | — | free | Simpler than any framework; one file, no deps. (Eleventy/Astro would work but add nothing here) |
| Fonts | Source Serif 4 WOFF2 400/400i/500 — already in the clone | 4.327 | free (OFL) | To re-make: google-webfonts-helper → Source Serif 4, latin, 400/400i/500, or `@fontsource/source-serif-4`; ship the OFL licence beside them |
| Phone tests | `@playwright/test` + Chromium | pin `@playwright/test@1.59` | free | What the tests were proven on |
| Audio test | Google Chrome | any current | free | Optional; without it the audio-decode row is skipped |
| Wording check | `check-wording` from the clone | — | free | Most friends would skip it; keep it if you print the card — it stops a retyped word |
| PDF text | poppler | current | free | `pdftotext` once per card PDF |
| Print PDFs | Python 3.14 venv: pymupdf, segno, pillow | 3.14 | free | Only if you print cards; skip otherwise |
| Images | webp (`cwebp`) + `sips` | current | free | No ImageMagick needed |
| Media | ffmpeg; `say` or ElevenLabs; whisper-cpp optional | current | free / paid TTS | The clone already holds the finished `card.m4a`; re-recording is optional |
| Hosting | GitHub Pages from `docs/` (public repo) | — | $0 | Push = deploy. Cloudflare Pages only if the repo must be private and you will not pay for Pro |
| Domain + DNS + inbound mail | Cloudflare Registrar, DNS (grey-cloud), Email Routing | — | ≈ $10–12/yr | At-cost registrar, free forwarding for hello@/privacy@ |
| Mail list | Kit free, plain `<form method=post>` | API v4 | free | One sequence, 41 mails, loadable by script; or paste them in Kit's UI |
| AI, interactive | Claude Code, `/model claude-fable-5-1`, effort xhigh | — | subscription | Our design and build sessions |
| AI, blind scoring | `claude-opus-5-5` on the Message Batches API ($2 in / $10 out per Mtok) | SDK ≥ 0.79 | $1–2.3 a round | Optional; your own eye is free |
| Secrets | `~/.secrets/3r4l.env`, gitignored, read in a subshell | — | free | `(set -a; . ~/.secrets/3r4l.env; set +a; node mail/load-sequence.mjs --dry-run)` |

**Two edits the clone needs today (not yet made in our repo):**
- `build.mjs` line 14 reads `/Users/aibrain/kj-rebuild/.../legacy-www-redirects.json` — on a fresh clone `node build.mjs` dies with ENOENT. Copy that JSON to `content/redirects.json` and read it from there (or guard with `existsSync` → `{rows:[]}`).
- `build.mjs` line 10 and `check-wording` line 20 hard-code `/Users/aibrain/projects/3r4l-inputs`. Make it `process.env.INPUTS || '../3r4l-inputs'`. The folder may be empty; it may hold `card-of-record.pdf`, `dns-rows.txt`, `pastor-check.txt`, `card-tl.txt`, `controller.txt` — each only unlocks an extra feature.

## 2. Install and download everything, then build and deploy — the commands in order

Budget about 30–60 minutes online; the Chromium download is the largest piece (a few hundred MB; not measured here). Lines marked *optional* can wait.

```sh
xcode-select --install                                   # Command Line Tools (Homebrew needs them)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   # Homebrew
brew install git gh node python@3.14 poppler ffmpeg webp # node ≥ 20 is enough; poppler = pdftotext; webp = cwebp
brew install --cask google-chrome                        # optional: real AAC decoder for prove-reading
brew install whisper-cpp                                 # optional: only to re-check re-recorded audio
gh auth login                                            # GitHub; this is the deploy credential
npm i -g @anthropic-ai/claude-code && claude             # Claude Code; then /login with your subscription
#   in Claude Code: /model claude-fable-5-1  — effort is set in ~/.claude/settings.json ("effortLevel": "xhigh")
gh repo fork stevy888/3r4l --clone && cd 3r4l            # clone, don't git init (content/, fonts, card.m4a all come with it)
#   make the two path edits from §2 (redirects.json; INPUTS env var) before the first build
npm init -y && npm i -D @playwright/test@1.59            # creates package.json + package-lock.json: commit both (node_modules is gitignored)
npx playwright install chromium                          # Playwright's own Chromium build (ours is a symlinked node_modules; yours is real)
python3.14 -m venv .venv && .venv/bin/pip install pymupdf segno pillow anthropic   # python3.14 explicitly: Apple's python3 has no pymupdf wheel; anthropic only for blind scoring
./doctor                                                 # expect OK on: node, @playwright/test+chromium, venv, pdftotext, gh auth (+ getbible if online). The token-file and two staging lines FAIL for you — fine, they serve only `--refresh`
mkdir -p ../serve && ln -s "$PWD/docs" ../serve/3r4l     # measure and probe-links expect the site under /3r4l/, exactly as github.io/<repo>/ serves it
node build.mjs                                           # content/ → docs/
bash check-wording docs/                                 # wording check; must end rc 0
# --- second Terminal tab (Ctrl-C stops it) ---
cd ../serve && python3 -m http.server 8168 --bind 127.0.0.1
# --- back in the first tab ---
node measure.mjs http://127.0.0.1:8168/3r4l/             # phone-screenshot test; rc 1 on any red
node prove-reading.mjs http://127.0.0.1:8168/3r4l/       # audio test (prints 'decoder none' without Chrome; the decode row is skipped)
node offline-proof.mjs http://127.0.0.1:8168/3r4l/       # offline worker
bash probe-links http://127.0.0.1:8168/3r4l/             # every internal link answers 200 (see the script's header for its argument)
git add -A && git commit -m "first build" && git push    # deploy
gh api -X POST repos/<you>/3r4l/pages -f 'source[branch]=main' -f 'source[path]=/docs'   # first Pages deploy; live at https://<you>.github.io/3r4l/ in minutes
git revert HEAD && git push                              # rollback of a bad deploy; Pages re-serves in minutes
```

**Later, when you want them**

```sh
# Custom domain (after buying the .org at Cloudflare Registrar, auto-renew ON)
#   Cloudflare DNS, every row grey-cloud: A 185.199.108.153 / .109.153 / .110.153 / .111.153 ; CNAME www → <you>.github.io ; TXT _github-pages-challenge-<you> (GitHub shows the value)
gh api -X PUT repos/<you>/3r4l/pages -f cname=3r4l.org   # GitHub then commits docs/CNAME — pull it; build.mjs writes none, so keep it in docs/
gh api -X PUT repos/<you>/3r4l/pages -F https_enforced=true   # only after the certificate issues (up to 24 h); github.io is HTTPS already
#   Email Routing (hello@, privacy@, dmarc@) needs the zone on Cloudflare DNS; add SPF, the vendor's DKIM CNAMEs and _dmarc as the vendor states

# Mail list (Kit)
#   Kit: create a form, turn double opt-in on, copy its form_id and action URL into content/signup.json as {action, method:"post", fields:{email:"email_address", lang|none, honeypot|none}, lands_on, form_id, vendor:"kit"}
echo 'KIT_API_KEY=…' > ~/.secrets/3r4l-kit.env && chmod 600 ~/.secrets/3r4l-kit.env
node mail/build-mails.mjs && bash mail/check-mails      # 41 plain-text mails, fenced
(set -a; . ~/.secrets/3r4l-kit.env; set +a; node mail/load-sequence.mjs --dry-run)   # dry run first; a live load also needs KIT_LIVE=yes

# Print kit (needs INPUTS/card-of-record.pdf; skipped without it; output stays private until --publish)
.venv/bin/python kit/make_kit.py
node kit/make-forty-sheet.mjs --lang en --out docs/forty.pdf

# Audio: skip — docs/film/card.m4a is in the clone. film/run-chain.sh depends on scripts outside this repo (the KJ studio) and an ElevenLabs key; to re-record use `say` + ffmpeg or your own TTS
```

## 3. How a page is built and proven — the working loop

Every change goes through the same six steps, cheapest first; nothing is pushed that a script has not passed and you have not seen. The blind-scoring script (`panel.py`) is **not in the repo** — it lives in a private working folder — so a friend either looks with their own eye or writes ~100 lines against the Messages API (`pip install anthropic`, `ANTHROPIC_API_KEY` in `~/.secrets`, model `claude-opus-5-5`, send each screenshot with the ten questions, three reads each, labels shuffled).

1. **Build** — `node build.mjs`; `content/` → `docs/`; the byte limits fail the build if a page is over 60 KB.
2. **Wording check** — `bash check-wording docs/`; every text node is in the files of record, no scripts, images or trackers; rc 0 or stop.
3. **Phone-screenshot test** — serve `../serve` on :8168, `node measure.mjs <base> --frames frames/`; 36 rows at four sizes, light/dark, three passes; `markers/measures.json` must say red 0.
4. **The other proofs** — `prove-reading.mjs` (audio cues), `offline-proof.mjs`, `print-proof.mjs`, `bash probe-links`; each rc 0.
5. **Blind read (optional)** — Opus 5.5 on the Batch API, ≈ $1–2.3 a round; the bar we chased was 9.5/10 (best so far 8.64). Not shipped — use your own eye if you skip it.
6. **Your eye, then push** — open the local pages on your phone; if yes, `git add -A && git commit && git push`; Pages serves in minutes; `git revert HEAD && git push` undoes it.


---

# PART 2 — SUPPLEMENTARY


## 4. What we used (the stack as built, layer by layer)

**The site in one line:** 3r4l.org is a static two-language card site, about 8 pages, no backend, each page ≈ 36–59 KB with its CSS and JS inlined, served as plain files from a `docs/` folder on GitHub Pages. One Node script builds it; nothing else runs in production.

| Layer | What | Version | Why |
|---|---|---|---|
| OS | macOS on Apple silicon | 26.2 (Darwin 25.2.0) | Any Apple-silicon Mac runs this; the M3 Ultra here is not needed |
| Shell / terminal | zsh in Apple Terminal.app | zsh 5.9 | Stock; no iTerm, VS Code or Cursor installed |
| Package manager | Homebrew | 7.0.4 | Every CLI below comes from it; needs Xcode Command Line Tools |
| Editor / harness | Claude Code CLI | 2.1.296 | The editor and the pair of hands; nothing else edits the repo |
| Version control | git · GitHub CLI `gh` | 2.53.0 · 2.89.0 | `gh` login is the one deploy credential |
| Runtime | Node | 25.9.0 (needs ≥ 20) | Runs the build, the wording check, the screenshot tests, the mail scripts |
| Site build | `build.mjs`, one ESM script, zero npm deps | — | Reads `content/`, writes `docs/` for en + tl; inlines CSS/JS; writes `sw.js`, `manifest.webmanifest`, `robots.txt`, `.nojekyll` |
| CSS / JS | Hand-written `content/page.css`, `day.js`, `theme.js` | — | No framework, bundler or CSS tool; comments stripped at build to stay under the byte limits |
| Fonts | Source Serif 4, self-hosted WOFF2 400 / 400i / 500 (OFL 1.1) | font v4.327 | Three subsetted files ≈ 15 KB each; no Google Fonts request |
| Phone-screenshot tests | `@playwright/test` + bundled Chromium | 1.59.1 (Chromium rev 1217) | `measure.mjs`, `offline-proof.mjs`, `print-proof.mjs`, `frames-plate.mjs` |
| Audio-decode test | Google Chrome (optional) | 155 | `prove-reading.mjs` prefers Chrome for a real AAC decoder; without it the audio-decode row is skipped |
| Wording check | `check-wording` (bash + node, zero deps) | — | Every text node must be in the page's allowlist; no `<script src>`, `<img>`, iframes, trackers |
| PDF text | poppler `pdftotext` | 26.07.0 | Extracts the card's words once; never retyped |
| Print PDFs | Python venv: PyMuPDF (fitz) · segno · Pillow | 3.14.6 · 1.28.2 · 1.6.6 · 12.3.0 | `kit/make_kit.py` imposes the card N-up with cut marks; QR code |
| HTML → PDF | Playwright Chromium `page.pdf` | 1.59.1 | `kit/make-forty-sheet.mjs` writes `docs/forty.pdf` |
| Images | `cwebp` (webp) · macOS `sips` · Pillow | webp 1.6.0 | Card faces as lossless WebP; ImageMagick not installed |
| Media | ffmpeg · whisper.cpp · ElevenLabs TTS | 8.1.2 · — · `eleven_multilingual_v2` | One narration file `docs/film/card.m4a` (AAC, 2:27); whisper checks the spoken words against `card.txt` |
| Hosting | GitHub Pages from `docs/` on `main`, public repo | — | Deploy = `git push`; no CI, no server |
| Domain / DNS / inbound mail | Cloudflare Registrar + DNS + Email Routing (planned) | — | 3r4l.org not yet registered; hello@ / privacy@ forwarding is free |
| Mail list | Kit (ex-ConvertKit) free plan, API v4 | — | One 41-mail sequence loaded by `mail/load-sequence.mjs`; key awaited |
| AI, interactive | Claude Code on Fable 5.1 at effort xhigh | `claude-fable-5-1` | Design, build and judgement sessions |
| AI, blind scoring | Opus 5.5 on the Message Batches API | `claude-opus-5-5` | 10 lenses × 3 reads per screenshot set; $1–2.3 a round |
| Secrets | `~/.secrets/<project>.env`, gitignored, read in a subshell | — | Never in the repo |

**Twelve words, translated once**
- *wording check* — the script that refuses any page text not in the files of record
- *phone-screenshot test* — Playwright opens every page at 320×568 / 390×844, light and dark, and asserts the limits
- *byte limits* — every page ≤ 60 KB; home + any one other ≤ 120 KB
- *fold rules* — what must be visible on the first screen without scrolling
- *doors* — links and buttons (≥ 44 px tall)
- *texts of record* — `card.txt`, `sheet.json`, `sheet2.json`, `verses.json`: the only source of any word on the site
- *the owner's eye* — you look at it and say yes
- *living card* — the card page that reads itself aloud and lights each line as it is spoken
- *grey-cloud* — a Cloudflare DNS row with the proxy OFF (DNS only)
- *N-up* — several cards per sheet, with cut marks
- *WER* — word error rate of the spoken audio against the written card
- *k=3 / lenses / sealed shuffle* — each screenshot judged 3 times on 10 questions, with labels shuffled so the judge cannot tell which is which

## 5. What to skip, and what it costs

**Skip**
- Frameworks and bundlers (React, Next, Astro, Vite): one build script and inlined CSS/JS keep every page under 60 KB.
- A CMS: the texts of record are six small files in `content/`; Claude Code edits them.
- Analytics and trackers: by design none; the wording check refuses `gtag`, `fbq(`, `fetch(`, cookies and any external request.
- A form builder: sign-up is one plain `<form method=post>` to Kit; contact is links only (Messenger · Viber · Text · Email).
- A web-font service: three self-hosted WOFF2 files; no Google Fonts call.
- A canvas tool (Figma etc.): design was drawn in CSS and judged on real phone screenshots.
- Our estate machinery (spend fences, shared-tree landing scripts, sub-agent fleets, the KJ studio): governance for many parallel sessions; a friend uses `git commit && git push` and one Claude Code session.

**Running costs**
| Item | Cost |
|---|---|
| Hosting (GitHub Pages, public repo) | $0 |
| Domain, one .org at Cloudflare Registrar | ≈ $10–12/yr (three redirecting domains ≈ $34/yr; Porkbun $7.98 first year) |
| Inbound mail (Cloudflare Email Routing) | $0 |
| Mail list (Kit free, ≤ 10,000 subscribers) | $0 (Kit badge stays on the mails) |
| Claude subscription for Claude Code | monthly; tier and price not on record here |
| AI blind read, one round (Opus 5.5 Batch, 120–150 reads) | ≈ $1–2.3 |
| AI design round with three AI-drawn rivals + two judges | ≈ $50–75 (we stopped doing this; one session drawing by hand + a $1–3 blind read was as good) |
| A full build day in Claude Code with sub-agents | ≈ $67–100 measured — a friend on a subscription needs only the subscription plus $1–3 per blind round |
| Audio re-record (ElevenLabs) | price not on record; `say` is free |
| Music bed (Suno via kie.ai), optional | ≈ $0.66 a track |
