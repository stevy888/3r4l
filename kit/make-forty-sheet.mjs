#!/usr/bin/env node
// kit/make-forty-sheet.mjs — THE FORTY-DAY SHEET, "the road to the cross" (owner 2026-10-08: "a beautiful inspirational pdf to click and print out to
// mark off the days, including verse to read"; 2026-10-09: "Design the 40 day challenge pdf instead they can download ... design it"; 2026-10-10:
// "improve to over 9.5"). One printable PDF, zero-model, from the texts of record ONLY. THREE PAGES = ONE LEAF + ONE READING SHEET (fleet-1010b, rival A,
// cured on both blind judges' returns — a hill to climb, the road drawn as a road):
//   p1 THE LEAF (the thing in hand, on a wall or a fridge door): the card's title and its three rules at the head, the little prayer under them,
//      "I began on" in the reader's own hand; then the family's drawing on paper — A HILL (one closed mass, a faint cream inside, its two flanks falling
//      to the frame's sides), the far horizon behind it with the sun's half-disc rising on it behind the right shoulder, the cross on the summit as the
//      heaviest mark — and ONE ROAD, a band of the paper's white between two navy edges, climbing the hill's face in three gently bowed traverses, two
//      hairpins and a last climb from day 1 at the foot to the cross; the FORTY RINGS SIT ON THE ROAD AS MILESTONES, the ring IS the box the pen fills
//      (7.2 mm; every fifth drawn heavier so today is found in a second; the fortieth under the cross's foot), the day numeral in navy on the road's
//      downhill side, one rule for all forty. His clause and the one-a-day line at the foot; the address once.
//   p2, p3 THE READING SHEET in the same hand: the forty verses by day and reference (verses.json), twenty a side, the day numeral the lead of each
//      row, the hill-and-cross mark at the head, the translation's name; after the fortieth the day-40 line of record closes the forty.
// Why three and not one: at the 9.5 pt floor the forty KJV texts need ~590 mm of column; one A4 side inside the safe box gives 442. The texts stay
// WHOLE (the law), so the leaf carries the forty as rings and numerals and the reading sheet carries them as words — the leaf alone is the challenge
// in hand, the reading sheet is the Bible's companion. The card itself is not reproduced here: its words are on the leaf where the card puts them
// (the title, the three rules, the little prayer, byte for byte from card.txt), the whole card is at the address.
// Nothing here is "complete", a streak, a score or a badge: a day, a verse, a ring (the doctrine law). A4, the SAFE BOX 182 x 250 mm centred, so the
// same PDF prints at 100 % on A4, short bond 8.5 x 11 and long bond 8.5 x 13. Through the kit's Chromium path -> docs/forty.pdf.
import fs from 'node:fs'; import path from 'node:path';

const ADDRESS = 'https://3r4l.org/', SITE = '3r4l.org'; // THE ADDRESS OF RECORD (the apex alone, as the card and the QR print it — a route can move, the apex outlives every deploy; seat 2026-10-09 on the refuter's catch)

const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), C = p => path.join(R, 'content', p), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; }, LANG = arg('--lang') || 'en', OUTPDF = arg('--out'); // --lang tl (rung 2): the sheet's labels from the Tagalog sheets of record (content/sheet-tl.json + sheet2-tl.json — the pastor's check); the verses stay the KJV with their references and the card's words stay brother Daniel's — no Tagalog Bible text is written here and nothing is machine-translated (the DRAFT writing rules stay English until a pastor's line); --out <file.pdf>: the PDF (its HTML beside it) there instead of docs/forty.pdf
if (LANG !== 'en' && LANG !== 'tl') throw new Error('--lang en|tl'); if (LANG === 'tl' && !(fs.existsSync(C('sheet-tl.json')) && fs.existsSync(C('sheet2-tl.json')))) throw new Error("--lang tl needs content/sheet-tl.json and content/sheet2-tl.json (the pastor's check)");
const sheet = J(C(LANG === 'tl' ? 'sheet-tl.json' : 'sheet.json')), S2EN = J(C('sheet2.json')), S2 = LANG === 'tl' ? J(C('sheet2-tl.json')) : S2EN, verses = J(C('verses.json')), card = fs.readFileSync(C('card.txt'), 'utf8');
const L = k => ((S2.challenge || {})[k] || S2EN.challenge[k]).text; // THE SHEET'S LABELS are rows of sheet2.json's challenge group (status DRAFT until his line): began · again · friend · reading_sheet · source — a Tagalog sheet without the row falls back to the English DRAFT
const block = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== \\w+ ==\\n|(?![\\s\\S]))`, 'm').exec(card) || [, ''])[1].replace(/\n$/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const F = w => `file://${R}/content/fonts/source-serif-4-${w}.woff2`;
const translation = LANG === 'tl' && verses[0].translation_tl ? verses[0].translation_tl : verses[0].translation_name, /* --lang tl takes the Tagalog Bible on disk (verses.json text_tl / ref_tl / translation_tl, ADB 1905 — owner 'do all six' 2026-10-10: the sheet on the day the pastor's check lands) */ title = S2.challenge.h1.text, day40 = S2.mails.day40.text;

// ---- THE DRAWING (mm; the safe box is 182 x 250) ----------------------------------------------------------------------------------------------
// THE CURE OF RIVAL A (fleet-1010b, both blind judges): the ridge closed into A HILL the road has to climb — its two flanks fall from the summit to the
// frame's sides low on the page, a faint cream inside it and nothing else (never a rectangle); a far horizon behind it with the sun's half-disc rising on
// it behind the right shoulder (the rim is the horizon); THE ROAD DRAWN AS A ROAD — one continuous band of the paper's white between two navy edges, climbing
// the hill's face in three gently bowed traverses, two round hairpins and a last climb to the cross's foot; the forty rings SIT ON THE ROAD as milestones;
// every numeral on the road's downhill (outer) side, found by one rule for all forty; the cross on the summit the heaviest mark.
const W = 182, H = 250; // the safe box: a top-left-anchored 100 % print on 8.5 × 11 short bond keeps the foot inside 12 mm (the refuter's Letter caveat, 2026-10-09)
const NAVY = '#1b2440', GOLD = '#b9892e', SUNFILL = '#f7efdc', HILLFILL = '#fbf7ec';
const RING = 3.6;                                                   // 7.2 mm across: the ring the pen fills without care (≥ 6 mm, the law; round 2's 7.2)
const HW = 4.8, MARGIN = 1.6;                                       // the road's half-width (a 9.6 mm band: 1.2 mm of road shows each side of a ring) and the least air between the band's edge and the hill's flank
const f = n => (Math.round(n * 100) / 100).toString();
// Catmull-Rom through points -> one smooth path of cubics; sampled for arc length so the forty sit at one even pitch along the road
const crom = pts => { const seg = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
  seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]); } return seg; };
const dOf = seg => `M${f(seg[0][0][0])} ${f(seg[0][0][1])}` + seg.map(s => `C${f(s[1][0])} ${f(s[1][1])} ${f(s[2][0])} ${f(s[2][1])} ${f(s[3][0])} ${f(s[3][1])}`).join('');
const at = (s, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * s[0][i] + 3 * u * u * t * s[1][i] + 3 * u * t * t * s[2][i] + t * t * t * s[3][i]); };
const sample = seg => { const out = []; let len = 0, prev = null; for (const s of seg) for (let k = 0; k <= 200; k++) { const p = at(s, k / 200); if (prev) { const d = Math.hypot(p[0] - prev[0], p[1] - prev[1]); if (d === 0) continue; len += d; } out.push({ p, len }); prev = p; } return out; };
const along = (S, s) => { let i = 1; while (i < S.length - 1 && S[i].len < s) i++; const a = S[i - 1], b = S[i], t = (s - a.len) / ((b.len - a.len) || 1); const p = [a.p[0] + (b.p[0] - a.p[0]) * t, a.p[1] + (b.p[1] - a.p[1]) * t]; const j = Math.min(i + 3, S.length - 1), h = Math.max(i - 4, 0), tx = S[j].p[0] - S[h].p[0], ty = S[j].p[1] - S[h].p[1], n = Math.hypot(tx, ty) || 1; return { p, t: [tx / n, ty / n] }; };

// THE HILL: one closed mass — the left flank rising from the frame's edge at 200 to the summit a little right of centre, the right flank falling away faster under the sun to the frame's edge at 200 (the home's stage, on paper); the foot of the box closes it
const SUMMIT = [108, 100], FOOT = 236;                                // the hill's mass ends at 235, above the foot's clause (the clause and the foot row stay on white paper)
const hillPts = [[0, 200], [10, 190], [21, 179], [33, 166], [45, 153], [57, 140], [69, 127], [81, 115], [93, 106], [101, 101.5], SUMMIT, [116, 101.5], [126, 106], [137, 114], [147, 126], [156, 141], [164, 157], [171, 174], [177, 188], [W, 200]];
const hill = crom(hillPts), hillD = dOf(hill), HS = sample(hill);
const HORIZON = 136, SUN = { x: 159, y: HORIZON, r: 21 };          // the far horizon behind the hill; the sun's disc centred ON it so its rim is the horizon — it rises behind the right shoulder
const CROSS = { x: SUMMIT[0], foot: SUMMIT[1], h: 22, arm: 7, y: SUMMIT[1] - 15 }; // the cross on the summit: 22 tall, 14 wide, stroke 1.4 — the heaviest mark on the page, its crown above the sun's
// THE ROAD: in from beyond the frame's left edge at the hill's foot (the reader's own road), three gently bowed traverses across the face joined by two round hairpins (half-ellipses 12 x 11, as cubics), then the last climb under the summit to the cross's foot
const K = 0.5523, HX = 12, HY = 11;
const hairpin = (x, y0, dir) => [[[x, y0], [x + dir * K * HX, y0], [x + dir * HX, y0 - HY + K * HY], [x + dir * HX, y0 - HY]], [[x + dir * HX, y0 - HY], [x + dir * HX, y0 - HY - K * HY], [x + dir * K * HX, y0 - 2 * HY], [x, y0 - 2 * HY]]]; // a half-ellipse turning up: dir +1 bulges right, -1 left
const T1 = [[-6, 224], [40, 224], [100, 219.5], [152, 212]], T2 = [[152, 190], [115, 187], [80, 182], [57, 178]], T3 = [[57, 156], [80, 153], [105, 150], [126, 147]], CLIMB = [[126, 125], [118, 117], [111.5, 110.5], [SUMMIT[0], SUMMIT[1] + RING + 1.6]];
const road = [...crom(T1), ...hairpin(152, 212, 1), ...crom(T2), ...hairpin(57, 178, -1), ...crom(T3), ...hairpin(126, 147, 1), ...crom(CLIMB)];
const roadD = dOf(road), RS = sample(road), ROADLEN = RS[RS.length - 1].len;
const S1 = 27, PITCH = (ROADLEN - S1) / 39;                         // day 1 just inside the frame (the road enters from beyond it), day 40 at the road's end under the cross
const distHill = p => { let m = 1e9; for (const s of HS) { const d = Math.hypot(s.p[0] - p[0], s.p[1] - p[1]); if (d < m) m = d; } return m; };
const insideHill = p => { let c = false; const poly = HS.map(s => s.p).concat([[W, H + 50], [0, H + 50]]); for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const LBW = 2.9, LBH = 2.3;                                         // the numeral's box, half-widths (5.8 x 4.6 mm at 10.5 / 11.5 pt)
const nearBand = (x, y) => { for (const s of RS) { const dx = Math.max(Math.abs(s.p[0] - x) - LBW, 0), dy = Math.max(Math.abs(s.p[1] - y) - LBH, 0); if (Math.hypot(dx, dy) < HW + 0.3) return true; } return false; };
const rings = verses.map((v, i) => { const { p, t } = along(RS, S1 + i * PITCH); return { v, x: p[0], y: p[1], t, fifth: v.day % 5 === 0 }; });
const nearRing = (x, y, r) => { const dx = Math.max(Math.abs(r.x - x) - LBW, 0), dy = Math.max(Math.abs(r.y - y) - LBH, 0); return Math.hypot(dx, dy) < RING + 0.3; };
const geo = [];
// THE NUMERALS, one rule for all forty: on the road's OUTER side — below a traverse, outside a bend — just clear of the band; where that spot is taken (the band turning under a ring, a neighbour's numeral, the flank) it swings by steps around the ring toward the outside, and at a hairpin's very apex it may sit inside the bend
const placed = [];
const nearLabel = (x, y) => placed.some(l => Math.abs(l[0] - x) < 2 * LBW + 0.8 && Math.abs(l[1] - y) < 2 * LBH + 0.6);
for (const r of rings) { const out = Math.sign(r.x - 91) || 1, n1 = [-r.t[1], r.t[0]], n2 = [r.t[1], -r.t[0]], pref = [0.6 * out, 1], dn = (n1[0] * pref[0] + n1[1] * pref[1]) >= (n2[0] * pref[0] + n2[1] * pref[1]) ? n1 : n2; // the outer normal: the one that points down, and outward where the road turns
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)], sgn = Math.sign(dn[0] * out) || out; // the first swing goes toward the outside
  const cands = [0, 30, -30, 50, -50, 70, -70, 90, -90].map(a => { const v = rot(dn, sgn * a * Math.PI / 180); return [v[0], v[1], [HW + 2.8, HW + 3.6, HW + 4.4]]; }).concat([[-dn[0], -dn[1], [11, 11.8]]]);
  let ok = null; for (const [nx, ny, offs] of cands) { if (ok) break; for (const off of offs) { const x = r.x + nx * off, y = r.y + ny * off; if (nearBand(x, y) || nearLabel(x, y) || rings.some(q => nearRing(x, y, q)) || !insideHill([x - LBW, y - LBH]) || !insideHill([x + LBW, y - LBH]) || !insideHill([x, y + LBH]) || x - LBW < 0 || x + LBW > W) continue; ok = [x, y]; break; } }
  if (!ok) { geo.push(`no clear spot for numeral ${r.v.day}`); ok = [r.x, r.y + HW + 2.8]; } r.lab = ok; placed.push(ok); }
const sunClip = `<clipPath id="sky"><rect x="0" y="0" width="${W}" height="${HORIZON}"/></clipPath>`;
const svg = `<svg class="draw" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" aria-hidden="true" focusable="false">
<defs>${sunClip}</defs>
<path d="M0 ${HORIZON}H${W}" fill="none" stroke="${NAVY}" stroke-width=".35" stroke-linecap="round"/>
<g clip-path="url(#sky)"><circle cx="${SUN.x}" cy="${SUN.y}" r="${SUN.r}" fill="${SUNFILL}" stroke="${GOLD}" stroke-width=".45"/></g>
<path d="${hillD}V${FOOT}H0Z" fill="${HILLFILL}" stroke="none"/>
<path d="${hillD}" fill="none" stroke="${NAVY}" stroke-width=".5" stroke-linecap="round"/>
<path d="${roadD}" fill="none" stroke="${NAVY}" stroke-width="${f(2 * HW)}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${roadD}" fill="none" stroke="#fff" stroke-width="${f(2 * HW - 0.8)}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M${CROSS.x} ${CROSS.foot}V${f(CROSS.foot - CROSS.h)}M${f(CROSS.x - CROSS.arm)} ${CROSS.y}H${f(CROSS.x + CROSS.arm)}" fill="none" stroke="${NAVY}" stroke-width="1.4" stroke-linecap="round"/>
${rings.map(r => `<circle cx="${f(r.x)}" cy="${f(r.y)}" r="${RING}" fill="#fff" stroke="${NAVY}" stroke-width="${r.fifth ? 1.1 : 0.5}"/>`).join('\n')}
</svg>`;
const label = r => `<p class="lab${r.fifth ? ' t' : ''}" style="left:${f(r.lab[0])}mm;top:${f(r.lab[1])}mm">${r.v.day}</p>`;
const writeRule = (label, cls = 'wr') => `<div class="${cls}"><span>${esc(label)}</span><span class="line"></span></div>`;
// GEOMETRY CHECK (before the render): the band and every ring inside the hill with air to the flank, no two rings touching, no numeral on a ring or on the road, day 40 under the cross
{ const nearSummit = p => Math.hypot(p[0] - SUMMIT[0], p[1] - SUMMIT[1]) < 12; // the road ends ON the summit under the cross — there the band is meant to meet the crest
  for (const s of RS) if (s.p[0] >= 0 && !nearSummit(s.p) && (!insideHill(s.p) || distHill(s.p) < HW + MARGIN)) { geo.push(`the road breaks the flank at ${f(s.p[0])},${f(s.p[1])}`); break; }
  for (const r of rings) { if (r.x - RING < 0 || r.x + RING > W || r.y + RING > H) geo.push(`ring ${r.v.day} outside the box`); if (!nearSummit([r.x, r.y]) && (!insideHill([r.x, r.y]) || distHill([r.x, r.y]) < RING + MARGIN)) geo.push(`ring ${r.v.day} breaks the flank`);
    for (const q of rings) if (q !== r && Math.hypot(q.x - r.x, q.y - r.y) < 2 * RING + 1.2) geo.push(`rings ${r.v.day} and ${q.v.day} touch`);
    for (const q of rings) if (nearRing(r.lab[0], r.lab[1], q)) geo.push(`numeral ${r.v.day} on ring ${q.v.day}`); if (nearBand(r.lab[0], r.lab[1])) geo.push(`numeral ${r.v.day} on the road`); for (const q of rings) if (q !== r && Math.abs(q.lab[0] - r.lab[0]) < 2 * LBW + 0.8 && Math.abs(q.lab[1] - r.lab[1]) < 2 * LBH + 0.6) geo.push(`numerals ${r.v.day} and ${q.v.day} touch`); }
  const last = rings[39]; if (Math.abs(last.x - CROSS.x) > 0.5 || last.y - RING < CROSS.foot + 1) geo.push('day 40 not under the cross'); }
console.log(`road ${ROADLEN.toFixed(0)} mm, the forty at ${PITCH.toFixed(1)} mm (${(PITCH - 2 * RING).toFixed(1)} mm between rings)` + (geo.length ? '\nGEOMETRY ' + [...new Set(geo)].join('; ') : ' — geometry clean'));

// ---- THE READING SHEET -----------------------------------------------------------------------------------------------------------------------
const MARK = `<svg class="mark" viewBox="0 0 40 16" aria-hidden="true" focusable="false"><path d="M0 14C8 13 16 10 21 7C22.5 6.3 24 6 25 6.6C29 9 34 12 40 13.6" fill="none" stroke="${NAVY}" stroke-width=".7" stroke-linecap="round"/><path d="M24 6.2V1M21.5 2.6H26.5" fill="none" stroke="${NAVY}" stroke-width="1.2" stroke-linecap="round"/></svg>`; // the leaf's drawing small: the ridge, the cross on the summit — the one hand on every page
const verse = v => { const tl = LANG === 'tl' && v.text_tl; return `<p class="verse"><b class="d">${v.day}</b><b class="ref">${esc(tl ? (v.ref_tl || v.ref) : v.ref)}</b> <span class="t">${esc((tl ? v.text_tl : (v.parts ? v.parts.join(' ') : v.text)).replace(/\n/g, ' '))}</span></p>`; };
const head = right => `<div class="head2"><p class="kicker">${esc(title)}</p>${MARK}<p class="tr">${right}</p></div>`;
const footRow = (left, right = '') => `<p class="row"><span>${left}</span><span>${right}</span></p>`;
const closeEl = `<div class="close"><p class="day40">${esc(day40)}</p><p class="addr">${SITE}</p></div>`; // after the fortieth row: the day-40 line of record, and the address once more so a reading sheet that travels on its own still says where it comes from
const readingSide = (vs, last) => `<section class="side read">${head(esc(translation))}<div class="cols">${vs.map(verse).join('\n')}</div>${last ? closeEl : ''}
<div class="foot2">${footRow(esc(last ? L('friend') : L('again')))}</div></section>`;

const html = `<!doctype html><html lang="${LANG}"><head><meta charset="utf-8"><title>${esc(title)} — ${SITE}</title><style>
@font-face{font-family:"Source Serif 4";font-weight:400;font-style:normal;src:url(${F('400')}) format("woff2")}
@font-face{font-family:"Source Serif 4";font-weight:500;font-style:normal;src:url(${F('500')}) format("woff2")}
@font-face{font-family:"Source Serif 4";font-weight:400;font-style:italic;src:url(${F('400i')}) format("woff2")}
@page{size:A4;margin:20mm 14mm 27mm}
html,body{margin:0;padding:0}body{color:${NAVY};font:10pt/1.3 "Source Serif 4";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.side{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;page-break-after:always;break-after:page}
.side:last-child{page-break-after:auto;break-after:auto}
p{margin:0}
.kicker{font:500 9pt/1.2 "Source Serif 4";letter-spacing:.05em;word-spacing:.12em;color:${NAVY}}
.gold{width:14mm;height:.6mm;background:${GOLD};margin:2.6mm auto 3mm}
.row{display:flex;justify-content:space-between;font:400 9.5pt/1.3 "Source Serif 4";color:#4a4a4a}
/* p1 the leaf */
.draw{position:absolute;left:0;top:0;width:${W}mm;height:${H}mm}
.head{position:absolute;left:0;right:0;top:0;text-align:center}
.ttl{font:500 9.5pt/1.3 "Source Serif 4";letter-spacing:.06em;margin:0 0 2.2mm}
.rules{white-space:pre-line;font:500 14.5pt/1.36 "Source Serif 4"}
.rules .num{font-style:normal;font-weight:600;color:${GOLD}}
.head .prayer{font:italic 400 11pt/1.32 "Source Serif 4";color:#262626;margin:2.8mm auto 0;max-width:124mm}
.began{display:flex;justify-content:center;align-items:flex-end;gap:2.2mm;margin-top:3mm;font:italic 400 10pt/4.4mm "Source Serif 4";color:#4a4a4a}
.began .line{display:inline-block;width:48mm;height:0;border-bottom:.3mm solid #8a7c57;margin-bottom:.8mm}
.lab{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;font:500 10.5pt/4.4mm "Source Serif 4";color:${NAVY};font-variant-numeric:tabular-nums}
.lab.t{font-weight:600;font-size:11.5pt}
.foot1{position:absolute;left:0;right:0;bottom:0}
.clause{text-align:center;font:600 11.5pt/1.3 "Source Serif 4";color:${NAVY};margin-bottom:1.8mm}
.foot1 .row{color:${NAVY}}
/* p2 p3 the reading sheet */
.head2{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.3mm solid ${GOLD};padding-bottom:1.6mm;margin-bottom:5mm}
.head2 .tr{font:italic 400 9pt/1.2 "Source Serif 4";color:#5d5d5d}
.mark{width:12mm;height:4.8mm;display:block;margin-bottom:.2mm}
.cols{columns:2;column-gap:7mm;column-fill:balance}
.verse{font:400 10.5pt/1.32 "Source Serif 4";color:#262626;padding-left:7.5mm;text-indent:-7.5mm;margin:0 0 2.4mm;break-inside:avoid;page-break-inside:avoid}
.verse .d{display:inline-block;width:7.5mm;text-indent:0;font-weight:600;color:${NAVY};font-variant-numeric:tabular-nums}
.verse .ref{font-weight:500;color:${NAVY}}
.close{text-align:center;margin-top:6mm}
.close .day40{font:italic 400 11pt/1.35 "Source Serif 4";color:${NAVY}}
.close .addr{font:500 9.5pt/1.4 "Source Serif 4";letter-spacing:.04em;color:${NAVY};margin-top:1.6mm}
.foot2{position:absolute;left:0;right:0;bottom:0;border-top:.3mm solid ${GOLD};padding-top:1.8mm}
.foot2 .row{color:#5d5d5d}
</style></head><body>
<section class="side s1">${svg}
<div class="head">
<p class="kicker">${esc(title)}</p>
<div class="gold"></div>
<p class="ttl">${esc(block('title'))}</p>
<p class="rules">${esc(block('rules')).replace(/^(\d\.)/gm, '<em class="num">$1</em>')}</p>
<p class="prayer">${esc(block('daily_prayer'))}</p>
${writeRule(L('began'), 'began')}
</div>
${rings.map(label).join('\n')}
<div class="foot1"><p class="clause">${esc(sheet.whatnext_clause)}</p>${footRow(esc(sheet.labels.one_a_day) + ' ' + esc(L('reading_sheet')), esc(L('source')))}</div>
</section>
${readingSide(verses.slice(0, 20), false)}
${readingSide(verses.slice(20), true)}
</body></html>`;
const out = OUTPDF ? OUTPDF.replace(/\.pdf$/i, '') + '.html' : path.join(R, 'kit', 'forty-sheet.html'); fs.writeFileSync(out, html);
const { chromium } = await import('@playwright/test'); const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + out, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
// SELF-CHECK: every block inside its side; the head clear of the cross; no column overflow (an overflow column would run off the page); where each page's content ends
const check = await p.evaluate((crossTop) => { const px = mm => mm * 96 / 25.4, out = [];
  document.querySelectorAll('.side').forEach((s, i) => { const S = s.getBoundingClientRect(); let maxB = 0;
    for (const el of s.querySelectorAll('.lab, .began, .head, .foot1, .verse, .close, .foot2, .head2')) { const r = el.getBoundingClientRect(); if (r.left < S.left - 0.5 || r.right > S.right + 0.5 || r.top < S.top - 0.5 || r.bottom > S.bottom + 0.5) out.push(`OUT p${i + 1} ${el.className} ${(r.right - S.left) / px(1) | 0},${(r.bottom - S.top) / px(1) | 0}mm`); if (!/foot/.test(el.className)) maxB = Math.max(maxB, r.bottom); }
    const head = s.querySelector('.head'); if (head) { const hb = (head.getBoundingClientRect().bottom - S.top) / px(1); out.push(`p1 head ends ${hb.toFixed(1)}mm, the cross's top at ${crossTop}mm${hb > crossTop - 3 ? ' — TOO CLOSE' : ''}`); }
    const foot = s.querySelector('.foot1, .foot2'); const footTop = foot ? (foot.getBoundingClientRect().top - S.top) / px(1) : 250;
    out.push(`p${i + 1} content ends ${((maxB - S.top) / px(1)).toFixed(1)}mm of 250 (foot begins ${footTop.toFixed(1)}mm)${maxB - S.top > footTop * px(1) ? ' OVERLAP' : ''}`); });
  return out; }, CROSS.foot - CROSS.h);
console.log(check.join('\n'));
const pdf = OUTPDF || path.join(R, 'docs', 'forty.pdf'); await p.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true }); await b.close();
console.log((OUTPDF ? pdf : 'docs/forty.pdf') + ' written —', verses.length, 'days;', fs.statSync(pdf).size, 'B', LANG === 'tl' ? '· --lang tl: the labels from the Tagalog sheets, the verses the KJV' : '');
