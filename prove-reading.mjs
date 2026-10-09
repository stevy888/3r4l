#!/usr/bin/env node
// prove-reading.mjs <base-url> [--frames <dir>] — THE LIVING CARD'S PROOF (owner 2026-10-09): on the home and on /card/, (1) at load not one request to film/*
// (the audio is 0 bytes before the tap); (2) the tap on the play door starts the audio (a real decoder when Chrome is installed — channel 'chrome' — else the
// cue hand window.__at(t) lights the cue without one), body.reading is set, the play door reads "Pause" (the home) or shows the bars (/card/), the cross is
// drawing; (3) at t = 8 s the title's cue (0) is lit on both pages; at t = 31 s cue 5 (the note's first span) is lit, on the home the hidden note line is
// shown (.read.on) and its words visible; at t = 100 s cue 14 (the prayer) is lit; (4) the lit cue's words are the card's words (the em's text ⊂ card.txt);
// (5) on /card/ the page follows the line (the lit cue inside the viewport after a tick); (6) ended → nothing lit, the home's paper folds (.read.on gone after 4 s)
// — proven by the hand at t = 999. Frames: reading-<page>-<t>.png. rc 1 on any red.
import { chromium } from '@playwright/test'; import fs from 'node:fs'; import path from 'node:path';
const base = process.argv[2]; if (!base) { console.error('usage: node prove-reading.mjs <base-url> [--frames <dir>]'); process.exit(2); }
const fi = process.argv.indexOf('--frames'), frames = fi > 0 ? process.argv[fi + 1] : null; if (frames) fs.mkdirSync(frames, { recursive: true });
const R = path.dirname(new URL(import.meta.url).pathname), card = fs.readFileSync(path.join(R, 'content', 'card.txt'), 'utf8');
let browser, decoder = true; try { browser = await chromium.launch({ channel: 'chrome' }); } catch { browser = await chromium.launch(); decoder = false; }
const rows = []; let red = 0; const bar = (page, name, ok, got) => { rows.push({ page, name, ok, got }); if (!ok) red++; console.log(`${ok ? 'ok ' : 'RED'} ${page} · ${name} · ${got}`); };
for (const pg of ['', 'card/']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const page = await ctx.newPage(); const reqs = []; page.on('request', r => reqs.push(r.url()));
  await page.goto(base + pg, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const name = pg || 'home';
  bar(name, 'no request to film/* at load', reqs.filter(u => /\/film\//.test(u)).length === 0, reqs.filter(u => /\/film\//.test(u)).length);
  bar(name, 'one audio, one play door', await page.evaluate(() => document.querySelectorAll('audio.card').length === 1 && document.querySelectorAll('button.play').length === 1), await page.evaluate(() => document.querySelectorAll('audio.card').length + '/' + document.querySelectorAll('button.play').length));
  bar(name, 'nothing lit before the tap', await page.evaluate(() => document.querySelectorAll('em.c.now').length === 0), 'none');
  await page.click('button.play'); if (decoder) { for (let i = 0; i < 16; i++) { if (await page.evaluate(() => document.querySelector('audio.card').currentTime > 0.5)) break; await page.waitForTimeout(500); } } else await page.waitForTimeout(500); // the first page's media pipeline warms up; poll to 8 s for the first half-second of sound
  const playing = await page.evaluate(() => { const a = document.querySelector('audio.card'), lab = document.querySelector('button.hear') || document.querySelector('button.play'); return { paused: a.paused, t: a.currentTime, reading: document.body.classList.contains('reading'), label: lab.textContent.trim(), on: document.querySelector('button.play').classList.contains('on') }; }); // the labelled hand: the hear door on the home, the round glyph on /card/
  if (decoder) { bar(name, 'the tap plays the audio (a real decoder)', !playing.paused && playing.t > 0.5, `paused ${playing.paused} t ${playing.t.toFixed(1)}`); bar(name, 'a request to film/card.m4a after the tap', reqs.some(u => /\/film\/card\.m4a/.test(u)), reqs.filter(u => /\/film\//.test(u)).length); }
  bar(name, 'body.reading + the door on', playing.reading && playing.on, `reading ${playing.reading} on ${playing.on} label "${playing.label}"`);
  if (pg === '') bar(name, 'the door reads the pause label', playing.label === 'Pause', playing.label);
  if (pg === '') bar(name, 'the cross on the hill is drawing (an animation on .sky .cross)', await page.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.target && a.effect.target.classList.contains('cross') && a.playState !== 'idle')), 'see'); // the home's hero only (/card/ has the dawn, not the hill)
  if (decoder) await page.evaluate(() => document.querySelector('audio.card').pause());
  for (const [t, cue, extra] of [[5, 0, null], [31, 5, 'note'], [100, 13, 'prayer']]) { // the cue indexes are 0-based: 0 = the title (2.4–6.8 s), 5 = "When we can't do rule 2 or 3…" (30.6–37.7), 13 = "Dear Lord Jesus, I understand…" (90.2–)
    await page.evaluate(t => window.__at(t), t); await page.waitForTimeout(700);
    const lit = await page.evaluate(() => [...document.querySelectorAll('em.c.now')].map(e => ({ c: +e.getAttribute('data-c'), text: e.textContent, inView: (r => r.top >= 0 && r.bottom <= innerHeight)(e.getBoundingClientRect()), shown: e.offsetParent !== null })));
    bar(name, `t ${t}: cue ${cue} lit`, lit.length >= 1 && lit.every(l => l.c === cue), JSON.stringify(lit.map(l => l.c)));
    bar(name, `t ${t}: the lit words are the card's words`, lit.every(l => card.includes(l.text)), lit.map(l => l.text.slice(0, 30)).join(' | '));
    bar(name, `t ${t}: the lit cue is shown and in view`, lit.every(l => l.shown && l.inView), JSON.stringify(lit.map(l => [l.shown, l.inView])));
    if (pg === '' && extra) bar(name, `t ${t}: the home's hidden ${extra} line is shown (.read.on)`, await page.evaluate(k => { const r = document.querySelector('.rules-card .read'); const p = r && r.querySelector('p.' + k + '.on'); return !!(r && r.classList.contains('on') && p && p.offsetParent !== null); }, extra), 'see');
    if (frames) await page.screenshot({ path: path.join(frames, `reading-${name.replace('/', '')}-t${t}.png`) });
  }
  await page.evaluate(() => { const a = document.querySelector('audio.card'); window.__at(999); a.dispatchEvent(new Event('ended')); }); await page.waitForTimeout(4600);
  const after = await page.evaluate(() => ({ lit: document.querySelectorAll('em.c.now').length, reading: document.body.classList.contains('reading'), readOn: document.querySelectorAll('.read.on, .read .on').length, label: (document.querySelector('button.hear') || document.querySelector('button.play')).textContent.trim() }));
  if (pg === '') bar(name, 'the hear door under the box also plays (a second tap hand)', await page.evaluate(() => { const h = document.querySelector('button.hear'); if (!h) return false; h.click(); const p = !document.querySelector('audio.card').paused; document.querySelector('audio.card').pause(); return p; }), 'see');
  bar(name, 'ended: nothing lit, not reading, the paper folded', after.lit === 0 && !after.reading && after.readOn === 0, JSON.stringify(after));
  if (frames) await page.screenshot({ path: path.join(frames, `reading-${name.replace('/', '')}-ended.png`) });
  await ctx.close();
}
await browser.close(); console.log(`${rows.length} rows, ${red} red · decoder ${decoder ? 'chrome' : 'none (the cue hand only)'}`); process.exit(red ? 1 : 0);
