#!/usr/bin/env node
// kit/make-pastor-sheet.mjs — THE PASTOR'S ONE SHEET (phase 2 rung 10; printed the day the owner's eye lands, rung 6): every string of the site
// that is not the card's own words, numbered, English beside its Tagalog DRAFT, a line for the pastor's correction — sheet.json (phase 1's twins
// from sheet-tl.DRAFT.json + the additions), sheet2.json (sheet2-tl.DRAFT.json), the mails' frames, the privacy notice, the film's credit; the
// interview questions live on kit/interview.pdf (bilingual already) and the manual's Tagalog on kit/manual-tl.DRAFT.html, printed beside this.
// Writes kit/pastor-sheet.DRAFT.html and kit/pastor-sheet.DRAFT.pdf (gitignored: a DRAFT never lands in the repo). Zero-model. Usage: node kit/make-pastor-sheet.mjs
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), C = p => path.join(R, 'content', p), J = p => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
const sheet = J(C('sheet.json')), S2 = J(C('sheet2.json')), tl1 = J(C('sheet-tl.DRAFT.json')) || {}, add = J(C('sheet-tl-additions.DRAFT.json')) || {}, tl2 = J(C('sheet2-tl.DRAFT.json')) || {};
const drafts = new Map(); const walk = o => { if (!o || typeof o !== 'object') return; if (typeof o.en === 'string' && typeof o.tl_draft === 'string') drafts.set(o.en, o.tl_draft); if (Array.isArray(o.en) && Array.isArray(o.tl_draft)) o.en.forEach((e, i) => drafts.set(e, o.tl_draft[i])); Object.values(o).forEach(walk); }; walk(tl1); // phase 1's pairs, by their English
Object.entries(add).forEach(([en, tl]) => { if (en[0] !== '_') drafts.set(en, tl); });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rows = []; const row = (where, en, tl) => { if (en && String(en).trim()) rows.push({ n: rows.length + 1, where, en, tl: tl || '' }); };
// A. the home and the pages (sheet.json)
row('the headline', sheet.h1, drafts.get(sheet.h1)); sheet.h1_lines.forEach(l => row('the headline, line', l, drafts.get(l))); row('the home, the question', sheet.h2, drafts.get(sheet.h2)); sheet.lines.forEach(l => row('the home, his lines', l, drafts.get(l)));
row('the what-next door', sheet.whatnext_link, drafts.get(sheet.whatnext_link)); row('his clause', sheet.whatnext_clause, drafts.get(sheet.whatnext_clause));
Object.entries(sheet.labels).forEach(([k, v]) => { if (k[0] !== '_') row(`label · ${k}`, v, drafts.get(v)); });
// B. phase 2 (sheet2.json, DRAFT or his, with its twin by key)
for (const [g, group] of Object.entries(S2)) { if (g[0] === '_') continue; for (const [k, r] of Object.entries(group)) { if (k[0] === '_' || !r || typeof r !== 'object' || !r.text || r.status === 'absent') continue; const t = tl2[g] && tl2[g][k] ? tl2[g][k].text : ''; row(`${g} · ${k}${r.status === 'owner' ? ' (his)' : ''}`, r.text, t); } }
const tr = r => `<tr><td class="n">${r.n}</td><td class="w">${esc(r.where)}</td><td class="en">${esc(r.en)}</td><td class="tl">${esc(r.tl) || '<i>(walang draft)</i>'}</td><td class="fix"></td></tr>`;
const html = `<!doctype html><html lang="tl"><head><meta charset="utf-8"><title>3r4l.org — ang sheet ng pastor</title><style>
@page{size:A4;margin:14mm 12mm}body{font:9.5pt/1.3 -apple-system,"Segoe UI",Roboto,"Noto Sans",Arial,sans-serif;color:#1b2440;margin:0}
h1{font:600 15pt/1.2 Palatino,Georgia,serif;margin:0 0 2mm}p.lead{margin:0 0 3mm;color:#444}table{width:100%;border-collapse:collapse;table-layout:fixed}
th{font-weight:600;text-align:left;font-size:8.5pt;border-bottom:1.5px solid #b9892e;padding:1mm 1.5mm}td{vertical-align:top;border-bottom:.5px solid #cfc8b8;padding:1.2mm 1.5mm;page-break-inside:avoid}
td.n{width:6mm;color:#6e4e14;font-weight:600}td.w{width:24mm;color:#666;font-size:8pt}td.en{width:52mm}td.tl{width:52mm}td.fix{border-bottom:.5px dotted #999}
.foot{margin-top:5mm;border-top:2px solid #b9892e;padding-top:3mm}.sig{display:inline-block;width:60mm;border-bottom:1px solid #1b2440;margin:0 4mm 0 2mm}small{color:#666}</style></head><body>
<h1>3r4l.org — ang sheet ng pastor · the pastor's one sheet</h1>
<p class="lead">Bawat salita ng site na HINDI mga salita ng card (ang card ay inilalathala gaya ng pagkalimbag nito, walang sumusuri). Kaliwa ang Ingles, kanan ang DRAFT na Tagalog ng isang makina — maaaring mali ang bawat linya. Pakiwasto sa huling kolum; ang hindi mo wawastuhin ay ituturing na tama. <small>Every string of the site that is not the card's own words; a machine's DRAFT Tagalog on the right, every line may be wrong; correct in the last column; a line left alone is taken as kept. 'Confess' = 1 John 1:9 confession to God, never the sacrament — your one pick runs through every line.</small></p>
<table><thead><tr><th>#</th><th>saan · where</th><th>English</th><th>Tagalog (draft)</th><th>Pagwawasto · correction</th></tr></thead><tbody>
${rows.map(tr).join('\n')}
</tbody></table>
<div class="foot"><p>Sinuri ko ang mga linyang ito. · I have checked these lines.</p><p>Pangalan · Name <span class="sig"></span> Petsa · Date <span class="sig" style="width:32mm"></span> Lagda · Signature <span class="sig" style="width:40mm"></span></p>
<p><small>Kasama ng sheet na ito: ang mga tanong ng panayam (kit/interview.pdf) at ang Tagalog ng manwal (kit/manual-tl.DRAFT.html). Ang mga wasto ay ilalagay ng owner sa 3r4l-inputs/pastor-check-2.txt kasama ang iyong pangalan at petsa.</small></p></div>
</body></html>`;
const out = path.join(R, 'kit', 'pastor-sheet.DRAFT.html'); fs.writeFileSync(out, html);
const { chromium } = await import('@playwright/test'); const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + out, { waitUntil: 'load' }); await p.pdf({ path: out.replace(/\.html$/, '.pdf'), format: 'A4', printBackground: true }); await b.close();
console.log(`pastor sheet: ${rows.length} rows (${rows.filter(r => !r.tl).length} without a draft) → ${out.replace(/\.html$/, '.pdf')}`);
