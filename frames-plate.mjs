#!/usr/bin/env node
// frames-plate.mjs — THE PLATE'S MOMENTS (plate-1009): the home's first screen photographed at the voice's moments, without a decoder.
// Usage: node frames-plate.mjs http://127.0.0.1:<port>/3r4l/ <outDir>
// The page is opened at 390×844 (light, then dark) and 320×568 (light); the play door is pressed (the <audio> has no AAC decoder in the
// bundled Chromium, so the 'play' event is DISPATCHED and the cue hand window.__at(t) lights the cue — exactly prove-reading.mjs's fallback);
// at each moment the first screen is shot after 2.6 s (the draw-on strokes done). The moments (0-based cues of content/card.vtt):
//   rest (before the tap)            → <n>-rest.png        the finished picture (the resting markup)
//   t 4    cue 0  the title          → <n>-t004-title.png
//   t 9    cue 1  rule 1 Confess     → <n>-t009-rule1.png
//   t 16   cue 2  rule 2 Surrender   → <n>-t016-rule2.png
//   t 21   cue 3  rule 3 Forgive     → <n>-t021-rule3.png
//   t 47   cue 7  "everyday"         → <n>-t047-daily.png
//   t 62   cue 10 the little prayer  → <n>-t062-prayer.png
//   t 95   cue 13 the prayer         → <n>-t095-invite.png
//   t 124  cue 17 Amen → ended + 4.6 s → <n>-ended.png   (the fold; must equal rest)
// Every frame is the FIRST SCREEN (the band, the hero, the top of the card) — the judges read these and nothing else.
import { chromium } from '@playwright/test'; import fs from 'node:fs'; import path from 'node:path';
const base = process.argv[2], out = process.argv[3]; if (!base || !out) { console.error('usage: node frames-plate.mjs <base> <outDir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const MOMENTS = [[4, 'title'], [9, 'rule1'], [16, 'rule2'], [21, 'rule3'], [47, 'daily'], [62, 'prayer'], [95, 'invite']];
const browser = await chromium.launch();
for (const [w, h, scheme] of [[390, 844, 'light'], [390, 844, 'dark'], [320, 568, 'light']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(2200);
  const n = `home-${w}x${h}-${scheme}`;
  await page.screenshot({ path: path.join(out, `${n}-rest.png`) });
  const ok = await page.evaluate(() => !!(document.querySelector('audio.card') && document.querySelector('button.play') && window.__at));
  if (!ok) { console.log(`${n}: no audio/play door/cue hand — rest only`); await ctx.close(); continue; }
  await page.evaluate(() => { const a = document.querySelector('audio.card'); a.dispatchEvent(new Event('play')); }); await page.waitForTimeout(300);
  for (const [t, k] of MOMENTS) { await page.evaluate(t => window.__at(t), t); await page.waitForTimeout(2600); await page.screenshot({ path: path.join(out, `${n}-t${String(t).padStart(3, '0')}-${k}.png`) }); }
  await page.evaluate(() => { const a = document.querySelector('audio.card'); window.__at(999); a.dispatchEvent(new Event('ended')); }); await page.waitForTimeout(4600);
  await page.screenshot({ path: path.join(out, `${n}-ended.png`) });
  console.log(`${n}: rest + ${MOMENTS.length} moments + ended`);
  await ctx.close();
}
await browser.close();
