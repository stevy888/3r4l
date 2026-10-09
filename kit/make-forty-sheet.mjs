#!/usr/bin/env node
// kit/make-forty-sheet.mjs — THE FORTY-DAY SHEET, "the path to the cross" (owner 2026-10-08: "a beautiful inspirational pdf to click and print out to
// mark off the days, including verse to read"; 2026-10-09: "Design the 40 day challenge pdf instead they can download ... design it"). One printable
// PDF, zero-model, from the texts of record ONLY. Four pages = two sheets, both sides: the WALL SHEET and the READING SHEET.
//   p1 THE POSTER (to pin on a wall): the family's drawing in line — the hill's crest, the small thin cross on it, the sun behind as three flat
//      steps — and ONE drawn path (the site's hairline) walking from day 1 at the foot of the page up to the cross at day 40; a 7.2 mm ring on the
//      path for every day, which the pen fills (the ring IS the box), the day numeral and the reference beside it in navy. The rings sit alternately
//      either side of the path so each side carries twenty at a readable pitch; every tenth ring is drawn in gold so today is found in a second.
//      The card's title and three rules in the sky above, the little prayer under them (card.txt), the first morning's line ("I began on") under
//      the head; his clause at the foot where the path begins (sheet.json). By day 40 the hand has drawn its own way to the cross.
//   p2 THE CARD itself — its exact two faces (docs/card-front.webp, card-back.webp) at true size 89 x 51 mm on the card's cream field, so whoever
//      was handed the sheet holds the card; the giver's line, the one person, and room for the reader's own words.
//   p3, p4 THE READING SHEET: the forty verses by day and reference (verses.json), twenty a side, the translation's name, the address; after the
//      fortieth the day-40 line of record and his clause close the forty.
// Why four and not two: at the 9.5 pt floor the forty KJV texts need ~590 mm of column; one A4 side inside the safe box gives 442. Twenty a side
// read at 10.5 pt with air, and the second sheet's spare side carries the card the stranger was never handed.
// Nothing here is "complete", a streak, a score or a badge: a day, a verse, a ring (the doctrine law). A4, the SAFE BOX 182 x 250 mm centred, so the
// same PDF prints at 100 % on A4, short bond 8.5 x 11 and long bond 8.5 x 13. Through the kit's Chromium path -> docs/forty.pdf.
import fs from 'node:fs'; import path from 'node:path';

// DRAFT STRINGS — the only words on the sheet not read from a file of record; each is for the owner to keep or strike (listed in NOTES.md).
const DRAFT = {
  began: 'I began on',                                        // the first morning: a writing rule under the head, the date in the reader's own hand
  giver: 'Given to me by',                                    // the giver: a writing rule under the card; the sheet remembers whose hand it came from
  person: 'One person I am praying for',                      // the one person: the prayer is "upon everyone I see"; one named face makes it a practice
  notes: 'Notes',                                             // the one-word head of the ruled space for the reader's own words
  fromCard: 'The card this challenge comes from.',            // the one plain line on the card page: what this sheet is and where it comes from
  again: 'Any morning is a good morning to begin again.',    // the begin-again line (no "you missed")
  friend: 'Print one for a friend.',                         // the share line: the sheet travels the way the card travels; nothing sells
};
const ADDRESS = 'https://3r4l.org/', SITE = '3r4l.org'; // THE ADDRESS OF RECORD (the apex alone, as the card and the QR print it — a route can move, the apex outlives every deploy; seat 2026-10-09 on the refuter's catch)

const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), C = p => path.join(R, 'content', p), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sheet = J(C('sheet.json')), S2 = J(C('sheet2.json')), verses = J(C('verses.json')), card = fs.readFileSync(C('card.txt'), 'utf8');
const block = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== \\w+ ==\\n|(?![\\s\\S]))`, 'm').exec(card) || [, ''])[1].replace(/\n$/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const F = w => `file://${R}/content/fonts/source-serif-4-${w}.woff2`;
const FACE = f => `file://${R}/docs/card-${f}.webp`; // the exact faces of the card of record (1050 x 600 = 300 dpi at 89 x 51 mm)
const translation = verses[0].translation_name, title = S2.challenge.h1.text, day40 = S2.mails.day40.text;

// ---- THE DRAWING (mm; the safe box is 182 x 250) ----------------------------------------------------------------------------------------------
const W = 182, H = 250; // the safe box: 182 × 244 so a top-left-anchored 100 % print on 8.5 × 11 short bond keeps the foot inside 12 mm (the refuter's Letter caveat, 2026-10-09)
const CREST = { x: 91, y: 76 };  // 4 mm more sky than the fleet's final: the 'I began on' writing rule clears the sun's crown and the cross's top (the refuter's p1 catch)                                   // the hill's crest, left of centre, as the home's hero
const SUN = { x: 80, y: 86, r: [26, 20, 15] };  // one thin line of a rising sun, its crown under the 'I began on' rule                  // three flat steps rising behind the hill; no rays, no gradient
const RING = 3.25, Y1 = 234, Y40 = 92, XL = 62, XR = 120;          // ROUND 2 (the two blind judges, 2026-10-09): rings 7 mm across in TWO STRAIGHT COLUMNS flanking the road (never touching — a column's rings 7.95 mm apart), day 1 at the foot, day 40 under the crest
const PITCH = (Y1 - Y40) / 39;                                    // 3.97 mm; a column's rings every 7.95 mm — a breath between 7 mm rings
// ONE path: a cubic from the foot straight up, one leaning bend, then straight to the crest where the cross stands
const P = [[91, 238], [113, 190], [69, 132], [CREST.x, CREST.y + 0.6]];  // the road: one winding climb inside the corridor between the two columns (x 69–113), to the crest
const bez = t => { const u = 1 - t; return [0, 1].map(i => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]); };
const xAt = y => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (bez(m)[1] > y) lo = m; else hi = m; } return bez((lo + hi) / 2)[0]; };
const rings = verses.map((v, i) => { const y = Y1 - i * PITCH, right = v.day % 2 === 1; return { v, y, right, x: right ? XR : XL, tenth: v.day % 10 === 0 }; }); // odd days the right column, even the left — the eye climbs the road between them
const f = n => (Math.round(n * 100) / 100).toString();
const hill = `M12 ${CREST.y + 10}C40 ${CREST.y + 7} 70 ${CREST.y} ${CREST.x} ${CREST.y}C112 ${CREST.y} 142 ${CREST.y + 7} 170 ${CREST.y + 10}`; // the horizon: gentle, the crest left of centre
const svg = `<svg class="draw" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" aria-hidden="true" focusable="false">
<path d="${hill}" fill="none" stroke="#1b2440" stroke-width=".5" stroke-linecap="round"/>
<path d="M${P[0][0]} ${P[0][1]}C${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}" fill="none" stroke="#1b2440" stroke-width=".3" stroke-linecap="round"/>
<path d="M${CREST.x} ${CREST.y}V${CREST.y - 13}M${CREST.x - 4.2} ${CREST.y - 8.6}H${CREST.x + 4.2}" fill="none" stroke="#1b2440" stroke-width="1.3" stroke-linecap="round"/>
${rings.map(r => r.tenth || r.v.day === 1
  ? `<circle cx="${f(r.x)}" cy="${f(r.y)}" r="${RING}" fill="#fff" stroke="#1b2440" stroke-width="1"/>`
  : `<circle cx="${f(r.x)}" cy="${f(r.y)}" r="${RING}" fill="#fff" stroke="#1b2440" stroke-width=".6"/>`).join('\n')}
</svg>`;
const label = r => r.right
  ? `<p class="lab r${r.tenth || r.v.day === 1 ? ' t' : ''}" style="left:${f(r.x + RING + 1.2)}mm;top:${f(r.y - 2.15)}mm"><b class="dn">${r.v.day}</b><span class="ref">${esc(r.v.ref)}</span></p>`
  : `<p class="lab l${r.tenth || r.v.day === 1 ? ' t' : ''}" style="right:${f(W - (r.x - RING - 1.2))}mm;top:${f(r.y - 2.15)}mm"><span class="ref">${esc(r.v.ref)}</span><b class="dn">${r.v.day}</b></p>`; // the day HARD AGAINST its ring on the reference's side (the tick never covers it), the reference beyond it in a straight column // the day INSIDE its ring (a light navy the tick covers), the reference in a straight column outside

// ---- THE CARD, its exact faces (docs/card-front.webp, docs/card-back.webp) at true size ---------------------------------------------------------
const cardEl = `<div class="card"><img src="${FACE('front')}" alt=""><img src="${FACE('back')}" alt=""></div>`; // the exhibit: the exact faces, small, side by side, no shadow (his 'exact layout' word)
const KEYS = ['title', 'rules', 'note', 'daily_prayer', 'turn', 'invite', 'prayer', 'turn_back'];
const wordsEl = `<div class="words">${KEYS.filter(k => block(k) && k !== 'turn' && k !== 'turn_back').map(k => block(k).split('\n').map(l => `<p class="${k}">${esc(l)}</p>`).join('')).join('')}</div>`; // D3 (the two judges): the card's words reset in the sheet's own serif at 10 pt, byte for byte from card.txt — readable to an older eye on a photocopy, and in the text layer
const writeRule = (label, cls = 'wr') => `<div class="${cls}"><span>${esc(label)}</span><span class="line"></span></div>`;

// ---- THE READING SHEET -----------------------------------------------------------------------------------------------------------------------
const verse = v => `<p class="verse"><b class="d">${v.day}</b><b class="ref">${esc(v.ref)}</b> <span class="t">${esc((v.parts ? v.parts.join(' ') : v.text).replace(/\n/g, ' '))}</span></p>`;
const head = right => `<div class="head2"><p class="kicker">${esc(title)}</p><p class="tr">${right}</p></div>`;
const footRow = (left, right = SITE) => `<p class="row"><span>${left}</span><span>${right}</span></p>`;
const closeEl = `<div class="close"><p class="day40">${esc(day40)}</p></div>`; // the coda one line (his clause stands on p1's foot) // after the fortieth row, before his clause (§6 item 10)
const readingSide = (vs, last) => `<section class="side read">${head(esc(translation))}<div class="cols">${vs.map(verse).join('\n')}</div>${last ? closeEl : ''}
<div class="foot2">${footRow(esc(DRAFT.again))}</div></section>`; // the little prayer once a leaf (p1's head, p2's words) — not at every foot (restraint, round 2)

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)} — ${SITE}</title><style>
@font-face{font-family:"Source Serif 4";font-weight:400;font-style:normal;src:url(${F('400')}) format("woff2")}
@font-face{font-family:"Source Serif 4";font-weight:500;font-style:normal;src:url(${F('500')}) format("woff2")}
@font-face{font-family:"Source Serif 4";font-weight:400;font-style:italic;src:url(${F('400i')}) format("woff2")}
@page{size:A4;margin:20mm 14mm 27mm}
html,body{margin:0;padding:0}body{color:#1b2440;font:10pt/1.3 "Source Serif 4";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.side{position:relative;width:${W}mm;height:${H}mm;overflow:hidden;page-break-after:always;break-after:page}
.side:last-child{page-break-after:auto;break-after:auto}
p{margin:0}
.kicker{font:500 9pt/1.2 "Source Serif 4";letter-spacing:.05em;word-spacing:.12em;color:#1b2440}
.gold{width:14mm;height:.6mm;background:#b9892e;margin:2.6mm auto 2.8mm}
.row{display:flex;justify-content:space-between;font:400 8.5pt/1.3 "Source Serif 4";color:#5d5d5d}
/* p1 the poster */
.draw{position:absolute;left:0;top:0;width:${W}mm;height:${H}mm}
.head{position:absolute;left:0;right:0;top:0;text-align:center}
.ttl{font:500 9.5pt/1.3 "Source Serif 4";letter-spacing:.06em;margin:0 0 2mm}
.rules{white-space:pre-line;font:500 14pt/1.34 "Source Serif 4"}
.rules .num{font-style:normal;font-weight:600;color:#1b2440}
.head .prayer{font:italic 400 10.5pt/1.3 "Source Serif 4";color:#262626;margin:2.2mm auto 0;max-width:118mm}
.began{display:flex;justify-content:center;align-items:flex-end;gap:2.2mm;margin-top:2.4mm;font:italic 400 9.5pt/4.2mm "Source Serif 4";color:#5d5d5d}
.began .line{display:inline-block;width:46mm;height:0;border-bottom:.3mm solid #8a7c57;margin-bottom:.7mm}
.lab{position:absolute;white-space:nowrap;font:500 10.5pt/4.3mm "Source Serif 4";color:#1b2440}
.lab.t{font-weight:600}
.lab .dn{display:inline-block;min-width:5mm;font:600 9.5pt/4.3mm "Source Serif 4";color:#1b2440;font-variant-numeric:tabular-nums}
.lab.r .dn{margin-right:1.8mm}.lab.l .dn{margin-left:1.8mm;text-align:right}
.foot1{position:absolute;left:0;right:0;bottom:0}
.foot1 .row{font-size:9.5pt;color:#1b2440}
.clause{text-align:center;font:600 11pt/1.3 "Source Serif 4";color:#1b2440;margin-bottom:1.6mm}
/* p2 the card */
.head2{display:flex;justify-content:space-between;align-items:baseline;border-bottom:.3mm solid #b9892e;padding-bottom:1.6mm;margin-bottom:5mm}
.head2 .tr{font:italic 400 9pt/1.2 "Source Serif 4";color:#5d5d5d}
.from{text-align:center;font:italic 400 10.5pt/1.3 "Source Serif 4";color:#262626;margin:0 0 4mm}
.card{width:152mm;margin:0 auto;display:flex;justify-content:center;gap:5mm}
.card img{display:block;width:72mm;height:41.14mm;border:.25mm solid #1b2440}
.words{width:152mm;margin:3.5mm auto 0;font:400 10pt/1.33 "Source Serif 4";color:#1b2440}
.words p{margin:0 0 1.4mm}
.words .title{font-weight:500;font-size:9.5pt;letter-spacing:.04em;text-transform:uppercase}
.words .rules{white-space:pre-line;font-weight:500;font-size:12.5pt;line-height:1.35}
.words .daily_prayer,.words .prayer{font-weight:500}
.words .turn,.words .turn_back{font-style:italic;color:#5d5d5d}
.wr{display:flex;align-items:flex-end;gap:3mm;width:152mm;margin:4mm auto 0;font:italic 400 10.5pt/1.3 "Source Serif 4";color:#5d5d5d}
.wr .line{flex:1;border-bottom:.3mm solid #8a7c57;margin-bottom:1mm}
.wr+.wr{margin-top:4.5mm}
.notes{width:152mm;margin:4mm auto 0}
.notes .h{font:500 9.5pt/1.3 "Source Serif 4";letter-spacing:.05em;color:#6e4e14;margin-bottom:2mm}
.notes .line{height:8mm;border-bottom:.3mm solid #b9a981}
.footc{position:absolute;left:0;right:0;bottom:0}
/* p3 p4 the reading sheet */
.cols{columns:2;column-gap:7mm;column-fill:balance}
.verse{font:400 10.5pt/1.3 "Source Serif 4";color:#262626;padding-left:7.2mm;text-indent:-7.2mm;margin:0 0 2.3mm;break-inside:avoid;page-break-inside:avoid}
.verse .d{display:inline-block;width:7.2mm;text-indent:0;font-weight:500;color:#1b2440;font-variant-numeric:tabular-nums}
.verse .ref{font-weight:500;color:#1b2440}
.close{text-align:center;margin-top:4.5mm}
.close .day40{font:italic 400 10.5pt/1.35 "Source Serif 4";color:#1b2440}
.close .clause{font-size:12.5pt;margin:1.5mm 0 0}
.foot2{position:absolute;left:0;right:0;bottom:0;border-top:.3mm solid #b9892e;padding-top:1.8mm}
.foot2 .pr{font:italic 400 9.5pt/1.3 "Source Serif 4";color:#262626;text-align:center;margin-bottom:1.4mm}
</style></head><body>
<section class="side s1">${svg}
<div class="head">
<p class="kicker">${esc(title)}</p>
<div class="gold"></div>
<p class="ttl">${esc(block('title'))}</p>
<p class="rules">${esc(block('rules')).replace(/^(\d\.)/gm, '<em class="num">$1</em>')}</p>
<p class="prayer">${esc(block('daily_prayer'))}</p>
${writeRule(DRAFT.began, 'began')}
</div>
${rings.map(label).join('\n')}
<div class="foot1"><p class="clause">${esc(sheet.whatnext_clause)}</p>${footRow(esc(sheet.labels.one_a_day))}</div>
</section>
<section class="side s2">${head('')}
<p class="from">${esc(DRAFT.fromCard)}</p>
${cardEl}
${wordsEl}
${writeRule(DRAFT.giver)}
${writeRule(DRAFT.person)}
<div class="notes"><p class="h">${esc(DRAFT.notes)}</p>${'<div class="line"></div>'.repeat(6)}</div>
<div class="footc">${footRow(esc(DRAFT.friend))}</div>
</section>
${readingSide(verses.slice(0, 20), false)}
${readingSide(verses.slice(20), true)}
</body></html>`;
const out = path.join(R, 'kit', 'forty-sheet.html'); fs.writeFileSync(out, html);
const { chromium } = await import('@playwright/test'); const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + out, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
// SELF-CHECK: every block inside its side; no column overflow (an overflow column would run off the page); where each page's content ends
const check = await p.evaluate(() => { const px = mm => mm * 96 / 25.4, out = [];
  document.querySelectorAll('.side').forEach((s, i) => { const S = s.getBoundingClientRect(); let maxB = 0;
    for (const el of s.querySelectorAll('.lab, .began, .head, .foot1, .from, .card, .wr, .notes, .verse, .close, .foot2, .head2')) { const r = el.getBoundingClientRect(); if (r.left < S.left - 0.5 || r.right > S.right + 0.5 || r.top < S.top - 0.5 || r.bottom > S.bottom + 0.5) out.push(`OUT p${i + 1} ${el.className} ${(r.right - S.left) / px(1) | 0},${(r.bottom - S.top) / px(1) | 0}mm`); if (!/foot/.test(el.className)) maxB = Math.max(maxB, r.bottom); }
    const foot = s.querySelector('.foot1, .footc, .foot2'); const footTop = foot ? (foot.getBoundingClientRect().top - S.top) / px(1) : 250;
    out.push(`p${i + 1} content ends ${((maxB - S.top) / px(1)).toFixed(1)}mm of 244 (foot begins ${footTop.toFixed(1)}mm)${maxB - S.top > footTop * px(1) ? ' OVERLAP' : ''}`); });
  return out; });
console.log(check.join('\n'));
await p.pdf({ path: path.join(R, 'docs', 'forty.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true }); await b.close();
console.log('docs/forty.pdf written —', verses.length, 'days;', fs.statSync(path.join(R, 'docs', 'forty.pdf')).size, 'B');
