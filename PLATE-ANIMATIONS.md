# THE PLATE ANIMATIONS — the technical handoff (what was done, and everything another agent needs to make one)

_2026-10-10 · from the 3r4l build (repo `/Users/aibrain/projects/3r4l`, served at https://stevy888.github.io/3r4l/; the living code is `build.mjs`, `content/page.css`, `content/day.js`). Animation technique only; nothing else about the site._

## 1. What was done (five plates, one technique)
| page | the plate | what moves, and when |
|---|---|---|
| home | the dawn — a road, four gold rays, a large cream cross on the summit beside the sun | draws itself ONCE as the page opens (road → rays → cross), 1.6 s, then still |
| /what-next/ | the climb — a hillside stair with milestones, one walker, the cross on the summit against the sun | once at open |
| /contact/ | the open door — a door onto the hill, sun and cross; the light across the floor to a bowed figure | once at open |
| /story/ | the sower — cards as seed in four furrows toward the cross | once at open (serves when the page serves) |
| /watch/ | the story — six scenes along a road to the cross | once at open, AND again TO THE VOICE: each scene draws as its line of the card is read (a 2:27 audio with cues), the card's lines light in place |

All five are the same technique: an inline SVG whose strokes draw themselves with CSS; no image file, no video, no library, no JavaScript for the arrival (JavaScript only for the voice-synced version).

## 2. The drawing (SVG)
```html
<svg class="sky" viewBox="0 150 1000 450" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
  <g class="disc"><circle class="halo" cx="778" cy="450" r="220"/><circle class="halo" cx="778" cy="450" r="200"/><circle class="sun" cx="778" cy="450" r="180"/></g>
  <path class="hill" d="…" fill="var(--hill)"/>                                   <!-- the ground: the same navy as the band, so it only cuts the sun -->
  <path class="d road" d="M30 594C…600 505" pathLength="100"/>                    <!-- every drawn stroke: class "d" + pathLength="100" -->
  <g class="k1" transform="translate(11 397) scale(1.3)">                        <!-- a scene: a group of "d" strokes; local 150-unit space, placed by transform -->
    <path class="d" d="M34 108C40 90 48 72 58 56" pathLength="100"/>
    <circle class="d" cx="74" cy="48" r="12" pathLength="100" style="--d:.4s"/>  <!-- per-stroke delay/duration as custom properties -->
    …
  </g>
  … k2 k3 k4 k5 k6 …
  <path class="cross" d="M590 372V250M548 290H632" pathLength="1" fill="none" stroke="var(--plate)" stroke-width="18" stroke-linecap="round"/>
</svg>
```
- **`pathLength="100"`** on every drawn stroke normalises its length so one keyframe (`stroke-dashoffset` 100 → 0) draws any path in one time. Use 100, never 1, for scenes: Chromium shows a start sliver at 1.
- One line: `stroke-width` 7.5 on the 1000-wide canvas (≈ 2.6 px at 390), round caps and joins, `fill:none`, one ink (`--plate`: cream by day `#e8d9b8`, pale by night `#cfc6b3`). The cross heavier (18) and drawn last.
- Figures by posture: a circle head (r 11–12), two or three strokes for the body; no faces. Keep every head under the hill's ridge — a cream figure on the cream sun disappears.
- No text node inside the SVG, `aria-hidden="true" focusable="false"`; every child inside x 0–1000.
- Height: the band is `.45` of the column (`--hero-h: calc((100vw - 2*var(--pad))*.45)`): ≈ 126 px at 320, 154 at 390. The SVG sits absolute at the band's bottom, `width:100%; height:auto; overflow:visible`.

## 3. The arrival (CSS only)
```css
.sky .d{fill:none;stroke:var(--plate);stroke-width:7.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100}
@keyframes kpd{0%{stroke-dashoffset:100;opacity:0}6%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
.sky .road{stroke-dashoffset:100;animation:kpd 1.3s cubic-bezier(.3,.4,.2,1) .2s both}
.sky .k1 .d{animation:kpd .45s ease-out .55s both}  .sky .k2 .d{animation:kpd .45s ease-out .7s both}
.sky .k3 .d{animation:kpd .45s ease-out .85s both}  .sky .k5 .d{animation:kpd .45s ease-out 1s both}
.sky .k6 .d{animation:kpd .5s ease-out 1.05s both}  .sky .k4 .d{animation:kpd .4s ease-out 1.15s both}
.sky .cross{stroke-dasharray:1 1;animation:drawon .7s ease-out .9s both}
@keyframes drawon{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
/* the sun rises as the page opens */
.sky .disc{animation:rise 1.4s cubic-bezier(.2,.7,.2,1) both}  @keyframes rise{from{transform:translateY(26px)}}
/* REDUCED MOTION — LAST IN THE SHEET, every animated selector named (`.sky .k1 .d` outweighs `.sky .d`) */
@media (prefers-reduced-motion:reduce){.sky .road,.sky .cross,.sky .k1 .d,.sky .k2 .d,.sky .k3 .d,.sky .k4 .d,.sky .k5 .d,.sky .k6 .d,.sky .disc{animation:none;stroke-dashoffset:0;opacity:1;transform:none}}
```
Rules: everything ends by 1.6 s; `both` fill so the finished state holds; the order tells the story (ground → figures left to right → the path up → the cross last); nothing that holds words ever animates.

## 4. The voice-synced version (/watch/): CSS + a small hand in JavaScript
The page carries ONE `<audio class="card" preload="none">` and a labelled button (`button.hear`). The audio's cues come from a VTT file baked into the page at build as `[[start,end],…]`. The script (`content/day.js`, ≈ 40 lines of the reading hand):
- on `play`: `body.reading`, the plate's container gains `.on` (and clears `.s1…s6` if the audio restarted), the button's label becomes "Pause";
- on `timeupdate`: the cue index `i` at the current time lights every `em.c[data-c="i"]` (the card's lines, wrapped at build) and adds `.sN` to the container when `i ≥ SC[N-1]` with `SC = [1,2,3,7,10,11]` (cue index → scene); the page scrolls the lit line into view (`block:'nearest'`);
- on `ended`: everything folds 4 s later (classes removed).
```css
/* the press drops the arrival's fill (an animation's `both` fill beats a later plain declaration) and hides the scenes */
.hero.on .sky .d{stroke-dasharray:100;stroke-dashoffset:100;opacity:0;animation:none}
.hero.on .sky .road{animation:kpd 1.8s cubic-bezier(.3,.4,.2,1) var(--d,.1s) both}
.hero.on.s1 .k1 .d,.hero.on.s2 .k2 .d,.hero.on.s3 .k3 .d,.hero.on.s4 .k4 .d,.hero.on.s5 .k5 .d,.hero.on.s6 .k6 .d{animation:kpd var(--u,.5s) cubic-bezier(.3,.4,.2,1) var(--d,0s) both}
/* the sun sinks at the press and rises again at scene 4 ("every day") */
.hero.on .sky .disc>circle{transform:translateY(48px);transition:transform .8s ease-out}
.hero.on.s4 .sky .disc>circle{transform:none;transition:transform 2.2s cubic-bezier(.2,.7,.2,1)}
body.reading .sky .cross{animation:drawon 1.8s ease-out both}
```
Each stroke's own `style="--d:.4s;--u:.7s"` orders the strokes inside a scene. A proof without a decoder: dispatch `new Event('play')` on the audio and call the page's `window.__at(t)` with the cue time — the page animates exactly as to the voice.

## 5. Night
Tokens only, never a second drawing: `--plate` pale `#cfc6b3`; the sun a dim warm dome (`#5a564e / #3a3d4a / #2c3040`); rays in `--ray`'s night tone; the hill the band's navy. Declare the night values under BOTH `@media (prefers-color-scheme:dark){:root:not([data-theme="light"])…}` and `:root[data-theme="dark"]` or the switch and the system disagree.

## 6. Limits the instruments hold
- Page weight: a plate costs 3–6 KB inlined; the pages here are capped at 60 KB, so each page's plate CSS sits inside `/* === PLATE:<page> === */ … /* === end PLATE:<page> === */` and the build strips the other pages' blocks (`cssFor(kind)` in build.mjs).
- No request at load but the fonts; no `<img>`; no text in the SVG; no JavaScript needed for the arrival.
- Motion: once, ≤ 1.6 s, strokes only (dashoffset/opacity on drawings; transform on the sun); no loop; reduced motion = the finished picture; the first screen keeps its words still and visible at t=0.
- Instruments: `measure.mjs` (frames at t0 with animations paused and at settled; three passes incl. reduced motion); a MID frame at 700 ms (Playwright: load, wait 700, screenshot) shows the drawing half-drawn; `frames-plate.mjs` (the first screen at seven moments of the voice, driving `__at`); `prove-reading.mjs` on channel chrome (the real decoder).

## 7. Rendering a plate to video (the explainer files)
`~/film-pipeline-lanes/3r4l-card-film/explainer/record-watch.mjs` + `mux.sh`: headless Chromium with `recordVideo` at the viewport's own size (the screencast frame IS the viewport in CSS px — a larger `size` only pads with grey; device scale is ignored), the page driven by its own cue hand on the recording's clock (`play` dispatched, `__at(t)` every 100 ms, `ended` at the audio's length), then ffmpeg muxes the master's AAC at the measured press offset and upscales 1.5× (720 → 1080). ≈ 10 min for 9:16 and 16:9.

## 8. Traps (each cost a round)
- An animation's `both` fill beats a later plain declaration → set `animation:none` before hiding strokes for a second choreography.
- The reduced-motion rule must out-specify every animated selector and sit last in the sheet.
- A cream stroke on the cream sun vanishes → heads under the ridge; the cross on navy.
- `pathLength="1"` on scene strokes shows a start sliver in Chromium → 100.
- Several plates on one shared sheet collide on the shared `.plate` root and the byte bar → fence per page.
- A headed Chrome window is clipped by the screen and the first AAC decode sits 6 s after the press → record headless, drive the page by the cue hand.
- Judges' returns folded literally lowered three of five drawings — fold with your own eye.

## 9. Where to read the living code
`/Users/aibrain/projects/3r4l/build.mjs` — `skyOf(full)`, `K1`…`K6`, `hero()`, the plate hooks of each page · `content/page.css` — `/* === PLATE === */`, the DESIGN RETURNS and `/* === PLATE:<page> === */` blocks · `content/day.js` — the reading hand · `frames-plate.mjs`, `prove-reading.mjs`, `measure.mjs` · the rival copies with their DESIGN.md: `~/.conductor-runs/Prog-ThreeRulesSite2/seat-r0/fleet-1010/` · the longer handoff with the design-round method: `handoffs/2026-10-10-pencil-plate-animations-HANDOFF.md`.
