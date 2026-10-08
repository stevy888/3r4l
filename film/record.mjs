#!/usr/bin/env node
// record.mjs — THE RECORD (FILM-SPEC §5): the built film served over a LOCAL HTTP ROOT (never file://), one viewport per run (1920x1080 and
// 1080x1920 of the SAME build — the portrait recomposition is the template's own), Playwright's real-time VP8 capture of #record (render chrome,
// no timer): the recorder holds the poster HOLD ms then calls the film's __play(), and waits TOTAL + 4 s as record-film.mjs does. Why not #render's
// own 1600 ms timer: the page's timer starts before the capture's clock settles, and the first capture held 1.50 s of poster — too little to cut to
// 1600 ms (measured 2026-10-08). Writes <out>.webm and <out>.json: the poster wait, the clock the recorder saw, document.fonts.check at the first beat,
// the rects the mux and the preflight measure against, and every request the page made (acceptance (h)). The mux (film/mux.mjs) finds the real
// play frame in the webm and cuts the head so the master's poster is exactly the 1600 ms the audio is delayed by.
// Usage: node film/record.mjs <built.html> <WxH> <out-base>
import { chromium } from '@playwright/test'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const [,, builtArg, size, outBase] = process.argv; if (!builtArg || !size || !outBase) { console.error('usage: node film/record.mjs <built.html> <WxH> <out-base>'); process.exit(2); }
const built = path.resolve(builtArg), dir = path.dirname(built), file = path.basename(built), [W, H] = size.split('x').map(Number);
const beats = JSON.parse(fs.readFileSync(path.resolve(dir, '..', 'job', 'beats.json'), 'utf8')); // film/job/beats.json beside film/build
const INTRO = 1600, HOLD = 2200, TOTAL = Math.round(beats.total_s * 1000), TAIL = 4000, SLACK = 1500;
const srv = http.createServer((q, r) => { // the root is the build dir alone; the one file it holds is the film, self-contained
  const p = path.join(dir, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!p.startsWith(dir + path.sep) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(fs.readFileSync(p)); }).listen(0, '127.0.0.1');
await new Promise(r => srv.on('listening', r)); const url = `http://127.0.0.1:${srv.address().port}/${file}`;
const vdir = fs.mkdtempSync(path.join(path.dirname(path.resolve(outBase)), 'rec-')), browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference', recordVideo: { dir: vdir, size: { width: W, height: H } } });
const page = await ctx.newPage(), reqs = []; page.on('request', r => reqs.push(r.url())); const tPage = Date.now();
await page.goto(url + '#record', { waitUntil: 'networkidle' }); const tLoad = Date.now();
await page.waitForTimeout(HOLD); await page.evaluate(() => window.__play()); // the poster held by the recorder's own clock, then the film's play
await page.waitForFunction(() => document.getElementById('film').classList.contains('started'), null, { timeout: 15000 }); const tPlay = Date.now();
await page.waitForFunction(() => document.getElementById('film').classList.contains('f1'), null, { timeout: 15000 }); const tBeat1 = Date.now();
const atBeat1 = await page.evaluate(() => { const r = s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  return { fonts: document.fonts.check('1em "Source Serif 4"'), rects: { paper: r('.paper-pos'), front: r('.face.front'), title: r('.speak[data-b="1"]') }, state: window.__state() }; });
await page.waitForTimeout(Math.max(0, INTRO + TOTAL + TAIL + SLACK - (Date.now() - tLoad)));
const ended = await page.evaluate(() => window.__state()), video = page.video(); await ctx.close(); const vpath = await video.path(); await browser.close(); srv.close();
fs.renameSync(vpath, outBase + '.webm'); fs.rmSync(vdir, { recursive: true, force: true });
const rec = { built, url, viewport: { width: W, height: H }, poster_wait_ms: INTRO, recorder_hold_ms: HOLD, total_ms: TOTAL, tail_ms: TAIL, clock: { page_to_load_ms: tLoad - tPage, load_to_play_ms: tPlay - tLoad, play_to_beat1_ms: tBeat1 - tPlay, beat1_planned_ms: Math.round(beats.beats_s[0] * 1000) },
  fonts_check_at_first_beat: atBeat1.fonts, rects: atBeat1.rects, state_at_beat1: atBeat1.state, state_at_close: ended, requests: reqs, recorded_at: new Date().toISOString() };
fs.writeFileSync(outBase + '.json', JSON.stringify(rec, null, 1) + '\n');
console.log(`record: ${W}x${H} → ${outBase}.webm · fonts at beat 1 ${atBeat1.fonts} · ${reqs.length} request(s) · ended ${ended.ended} beat ${ended.beat}/${beats.beats_s.length}`);
