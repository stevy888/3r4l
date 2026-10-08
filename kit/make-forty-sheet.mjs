#!/usr/bin/env node
// kit/make-forty-sheet.mjs — THE FORTY-DAY SHEET (owner 2026-10-08: "a beautiful inspirational pdf to click and print out to mark off the days, including
// verse to read"): one printable PDF, zero-model, from the texts of record ONLY — the card's title and three rules at the head (card.txt), the little
// prayer, then the forty days in order: the day, a box for the reader's own mark, the reference and the KJV text (verses.json), his clause at the foot.
// No streak, no "you missed", no "complete" — a day, a verse and a box (the doctrine law). A4 through the kit's Chromium path → docs/forty.pdf.
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), C = p => path.join(R, 'content', p), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sheet = J(C('sheet.json')), S2 = J(C('sheet2.json')), verses = J(C('verses.json')), card = fs.readFileSync(C('card.txt'), 'utf8');
const block = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== \\w+ ==\\n|(?![\\s\\S]))`, 'm').exec(card) || [, ''])[1].replace(/\n$/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const row = v => `<li><span class="box" aria-hidden="true"></span><span class="day">${v.day}</span><span class="v"><b class="ref">${esc(v.ref)}</b><span class="text">${esc((v.parts ? v.parts.join(' ') : v.text).replace(/\n/g, ' '))}</span></span></li>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(S2.challenge.h1.text)} — 3r4l.org</title><style>
@font-face{font-family:"Source Serif 4";font-weight:400;src:url(file://${R}/content/fonts/source-serif-4-400.woff2) format("woff2")}@font-face{font-family:"Source Serif 4";font-weight:500;src:url(file://${R}/content/fonts/source-serif-4-500.woff2) format("woff2")}
@page{size:A4;margin:14mm 14mm 16mm}body{margin:0;color:#1b2440;font:10.5pt/1.35 "Source Serif 4",Georgia,serif}
h1{font:500 20pt/1.15 "Source Serif 4",Georgia,serif;margin:0 0 1mm}.rule{width:14mm;height:2.2pt;background:#b9892e;border-radius:1pt;margin:2mm 0 4mm}
.title{font:500 11pt/1.3 "Source Serif 4",Georgia,serif;letter-spacing:.02em;text-transform:uppercase;margin:0 0 2mm}.rules{white-space:pre-line;font-size:12pt;line-height:1.45;margin:0 0 3mm}
.prayer{font-size:10.5pt;margin:0 0 5mm}.prayer b{font-weight:500}.clause{font-size:11pt;margin:0 0 5mm;color:#6e4e14}
ol{list-style:none;margin:0;padding:0;columns:1}li{display:flex;gap:3mm;align-items:flex-start;padding:2.2mm 0;border-bottom:.4pt solid #dccfb1;page-break-inside:avoid}
.box{flex:none;width:5mm;height:5mm;border:1pt solid #1b2440;border-radius:1pt;margin-top:.6mm}.day{flex:none;width:7mm;text-align:right;font-weight:500;color:#6e4e14;font-variant-numeric:tabular-nums}
.v{flex:1}.ref{display:block;font-weight:500;font-size:10.5pt}.text{display:block;font-size:9.6pt;line-height:1.3;color:#262626}
.foot{margin-top:5mm;font-size:9.5pt;color:#5d5d5d;border-top:.6pt solid #b9892e;padding-top:2mm}</style></head><body>
<h1>${esc(S2.challenge.h1.text)}</h1><div class="rule"></div>
<p class="title">${esc(block('title'))}</p><p class="rules">${esc(block('rules'))}</p>
<p class="prayer"><b>${esc(block('daily_prayer'))}</b></p>
<p class="clause">${esc(sheet.whatnext_clause)}</p>
<ol>${verses.map(row).join('\n')}</ol>
<p class="foot">${esc(sheet.labels.one_a_day)} · https://3r4l.org/what-next/</p>
</body></html>`;
const out = path.join(R, 'kit', 'forty-sheet.html'); fs.writeFileSync(out, html);
const { chromium } = await import('@playwright/test'); const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + out, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await p.pdf({ path: path.join(R, 'docs', 'forty.pdf'), format: 'A4', printBackground: true }); await b.close();
console.log('docs/forty.pdf written —', verses.length, 'days;', fs.statSync(path.join(R, 'docs', 'forty.pdf')).size, 'B');
