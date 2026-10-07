#!/usr/bin/env node
// measure.mjs <base-url> [--frames <dir>] — the served page's regions by getBoundingClientRect at the plan's widths, light and dark,
// two face passes (the second with the first serif face of the stack removed — the Android fallback), against every bar of §3 DoD 3.
// Writes markers/measures.json; rc 1 on any red row. Usage: node measure.mjs http://127.0.0.1:8077/3r4l/ [--frames /path]
import { chromium } from '@playwright/test'; import fs from 'node:fs'; import path from 'node:path';
const base = process.argv[2]; if (!base) { console.error('usage: node measure.mjs <base-url> [--frames <dir>]'); process.exit(2); }
const fi = process.argv.indexOf('--frames'), frames = fi > 0 ? process.argv[fi + 1] : null; if (frames) fs.mkdirSync(frames, { recursive: true });
const R = path.dirname(new URL(import.meta.url).pathname), pages = ['', 'what-next/', 'en/', 'en/what-next/'];
const views = [[320, 568], [393, 660], [390, 844], [300, 600]], schemes = ['light', 'dark'], passes = ['stack', 'fallback'];
const FALLBACK = ':root{--serif:Palatino,"Palatino Linotype",Georgia,"Noto Serif",serif !important}';
const bar = (name, ok, got, want) => ({ name, ok, got, want });
const browser = await chromium.launch(); const rows = []; let red = 0;
for (const pg of pages) for (const [w, h] of views) for (const scheme of schemes) for (const pass of passes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const reqs = []; page.on('request', r => { if (!r.url().startsWith(base.replace(/\/[^/]*$/, ''))) reqs.push(r.url()); });
  const res = await page.goto(base + pg, { waitUntil: 'load' }); if (pass === 'fallback') await page.addStyleTag({ content: FALLBACK });
  const m = await page.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) }; };
    const fonts = [...document.querySelectorAll('body *')].filter(e => e.offsetParent !== null && e.innerText && e.innerText.trim()).map(e => parseFloat(getComputedStyle(e).fontSize));
    const doors = [...document.querySelectorAll('.door, .share button')].filter(e => e.offsetParent !== null).map(e => Math.round(e.getBoundingClientRect().height));
    const widths = [...document.querySelectorAll('body *')].map(e => Math.round(e.getBoundingClientRect().right));
    return { h1: r('h1'), lang: r('.lang'), card: r('#card'), next: r('.next .door'), scrollW: document.documentElement.scrollWidth, maxRight: Math.max(...widths), minFont: Math.min(...fonts), body: parseFloat(getComputedStyle(document.body).fontSize), doors, lang: r('.lang'), lis: document.querySelectorAll('li.is-today').length, cookies: document.cookie.length }; });
  const lang = pg.startsWith('en/') || !fs.existsSync(path.join(R, 'content', 'sheet-tl.json')) ? 'en' : 'tl', home = !pg.endsWith('what-next/');
  const bars = [bar('status 200', res.status() === 200, res.status(), 200), bar('no external request', reqs.length === 0, reqs.length, 0), bar('no cookie', m.cookies === 0, m.cookies, 0),
    bar('nothing above the h1 but the language link (≤ 20 px)', !m.lang || (m.lang.h <= 20 && m.lang.bottom <= m.h1.top), m.lang ? m.lang.h : 0, '≤ 20'),
    bar('no box wider than the device', m.scrollW <= w && m.maxRight <= w, Math.max(m.scrollW, m.maxRight), '≤ ' + w), bar('nothing under 13 px', m.minFont >= 13, m.minFont, '≥ 13'), bar('body ≥ 18 px', m.body >= 18, m.body, '≥ 18'),
    bar('every door ≥ 44 px', m.doors.every(d => d >= 44), Math.min(...m.doors), '≥ 44'), bar('one day row revealed', m.lis === 1, m.lis, 1)];
  if (home) { if (w === 320 && h === 568) { bars.push(bar(`${lang} h1 whole by y ≤ ${lang === 'en' ? 165 : 200} at 320×568`, m.h1.bottom <= (lang === 'en' ? 165 : 200), m.h1.bottom, '≤ ' + (lang === 'en' ? 165 : 200))); if (lang === 'en') bars.push(bar("the card's title by y ≤ 210 at 320", m.card.top <= 210, m.card.top, '≤ 210')); }
    if (w === 393 && h === 660) bars.push(bar(`${lang} h1 whole by y ≤ ${lang === 'en' ? 145 : 175} at 393×660`, m.h1.bottom <= (lang === 'en' ? 145 : 175), m.h1.bottom, '≤ ' + (lang === 'en' ? 145 : 175)), bar('h1 and the card visible at 393×660', m.card.top < 660 - 120, m.card.top, '< 540'));
    // TR-link-place B (owner/3r4l-link-place-B-2026-10-07): the door sits DIRECTLY UNDER the card, so the row of record is that gap, not A's "≤ 2 × viewport" (void once the card is the real two-face card: its own height passes 2 × 568 at 320).
    if ((w === 390 && h === 844) || (w === 320 && h === 568)) bars.push(bar('the what-next door directly under the card (door top − card bottom ≤ 56)', m.next.top - m.card.bottom <= 56, m.next.top - m.card.bottom, '≤ 56')); }
  const fail = bars.filter(b => !b.ok); red += fail.length; rows.push({ page: pg || '/', lang, view: `${w}x${h}`, scheme, pass, h1: m.h1, card: m.card, next: m.next, bars, fail: fail.map(b => `${b.name}: ${b.got} (want ${b.want})`) });
  if (frames && pass === 'stack' && ((w === 390 && h === 844) || (w === 320 && h === 568))) { const n = `${(pg || 'home').replace(/\/$/, '').replace(/\//g, '-')}-${w}x${h}-${scheme}`; await page.screenshot({ path: path.join(frames, n + '.png') }); await page.screenshot({ path: path.join(frames, n + '-full.png'), fullPage: true }); }
  if (frames && pass === 'fallback' && pg === '' && w === 390 && h === 844 && scheme === 'light') await page.screenshot({ path: path.join(frames, 'home-390x844-light-fallback-serif.png') });
  await ctx.close(); }
await browser.close(); fs.mkdirSync(path.join(R, 'markers'), { recursive: true }); fs.writeFileSync(path.join(R, 'markers', 'measures.json'), JSON.stringify({ base, measured: new Date().toISOString(), red, rows }, null, 1));
for (const r of rows) if (r.fail.length) console.log(`RED ${r.page} ${r.view} ${r.scheme} ${r.pass}: ${r.fail.join(' · ')}`);
console.log(`${rows.length} rows, ${red} red → markers/measures.json`); process.exit(red ? 1 : 0);
