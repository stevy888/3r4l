// make-share-pictures.mjs <base-url>  (2026-11-26, the link previews; owner "if pasting a link somewhere .. can we have a beautiful image show ?")
// For every kind × tongue in content/share.json: photographs the page's OWN drawing as the site draws it (transparent, 2x), then sets it
// beside the verse on the night-sky ground (navy, gold, cream, Source Serif / Noto Nastaliq — the family's look) at 1200×630 and writes
// docs/share/<kind>[-tl|-ur].jpg. Serve docs/ first:  cd docs && python3 -m http.server 8765 ; node kit/make-share-pictures.mjs http://127.0.0.1:8765/
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const R = path.dirname(path.dirname(new URL(import.meta.url).pathname)), BASE = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/\/?$/, '/');
const share = JSON.parse(fs.readFileSync(path.join(R, 'content/share.json'), 'utf8'));
const OUT = path.join(R, 'docs/share'); fs.mkdirSync(OUT, { recursive: true });
const font = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(R, 'docs/fonts', f)).toString('base64');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const stars = Array.from({ length: 70 }, () => { const x = rnd() * 1200, y = rnd() * 330, r = 0.6 + rnd() * 1.5, o = 0.25 + rnd() * 0.6; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f7f2e7" opacity="${o.toFixed(2)}"/>`; }).join('');
const sparkle = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-12L2.6-2.6L12 0L2.6 2.6L0 12L-2.6 2.6L-12 0L-2.6-2.6Z" fill="#f3e3bd" opacity=".9"/>`;
const b = await chromium.launch();
const shot = await b.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2, reducedMotion: 'reduce', colorScheme: 'dark' });
const card = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const [kind, k] of Object.entries(share.kinds)) for (const lang of ['en', 'tl', 'ur']) {
  const t = k[lang]; if (!t) continue;
  const url = BASE + (lang === 'en' ? '' : lang + '/') + ((k.page || kind) === 'home' ? '' : (k.page || kind) + '/'); // k.page: a kind may borrow another page's drawing
  await shot.goto(url, { waitUntil: 'load' }); await shot.waitForTimeout(1200);
  await shot.addStyleTag({ content: `html,body,main,header,.band,.plate,.hero,${k.svg}{background:transparent!important;box-shadow:none!important}h1,p,.lang,nav,a,button,.byline{visibility:hidden!important}` }); // the site's own night colours (the drawings' ink turns cream), the page's words hidden over the drawing
  const el = shot.locator(k.svg).first(); if (!(await el.count())) throw new Error(`${url}: no ${k.svg}`);
  const art = 'data:image/png;base64,' + (await el.screenshot({ omitBackground: true })).toString('base64');
  const rtl = lang === 'ur', len = t.text.length;
  const size = rtl ? 84 : 104; // the start size; the page shrinks it until the words fit (a phone shows the picture at about a third: 104 px reads as ~34 px)
  const html = `<!doctype html><html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:S;font-weight:400;src:url(${font('source-serif-4-400.woff2')})}
@font-face{font-family:S;font-weight:400;font-style:italic;src:url(${font('source-serif-4-400i.woff2')})}
@font-face{font-family:S;font-weight:500;src:url(${font('source-serif-4-500.woff2')})}
@font-face{font-family:N;src:url(${font('noto-nastaliq-urdu-400.woff2')})}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
.og{position:relative;width:1200px;height:630px;overflow:hidden;background:radial-gradient(ellipse 620px 420px at ${rtl ? '24%' : '76%'} 74%,rgba(240,214,160,.30),rgba(240,214,160,0) 70%),linear-gradient(180deg,#111830 0%,#1a233f 60%,#1d2645 100%);font-family:S,serif;color:#f7f2e7}
.sky{position:absolute;inset:0}
.horizon{position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(180deg,rgba(184,136,45,0),rgba(184,136,45,.16))}
.art{position:absolute;bottom:18px;${rtl ? 'left:8px;transform:scaleX(-1)' : 'right:8px'};width:430px;height:330px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 0 18px rgba(243,227,189,.35));-webkit-mask-image:linear-gradient(to right,transparent 0,#000 22%);mask-image:linear-gradient(to right,transparent 0,#000 22%)}
.words{position:absolute;top:0;bottom:0;${rtl ? 'right:76px' : 'left:76px'};width:680px;display:flex;flex-direction:column;justify-content:center;padding-bottom:40px;box-sizing:border-box}
.label{font:italic 400 27px/1.3 S,serif;color:#d9b35e;margin:0 0 22px}
.q{font:500 ${size}px/1.18 S,serif;margin:0;letter-spacing:-.01em;text-wrap:balance;text-shadow:0 2px 18px rgba(10,14,30,.55)}
.rule{width:88px;height:4px;background:#c99a3c;border-radius:2px;margin:34px 0 18px}
.ref{font:400 34px/1.3 S,serif;color:#e0bd6c;margin:0}
.mark{position:absolute;bottom:40px;margin:0;${rtl ? 'right:76px' : 'left:76px'};font:500 27px/1 S,serif;letter-spacing:.05em;color:rgba(247,242,231,.78);direction:ltr}
[dir=rtl] .label,[dir=rtl] .q,[dir=rtl] .ref{font-family:N,serif;font-style:normal}
[dir=rtl] .q{line-height:1.85;font-weight:400}[dir=rtl] .label{line-height:2;font-size:25px}[dir=rtl] .ref{line-height:1.9}
</style></head><body><div class="og">
<svg class="sky" viewBox="0 0 1200 630" aria-hidden="true">${stars}${sparkle(rtl ? 1120 : 80, 54, 1.1)}${sparkle(rtl ? 610 : 590, 88, .55)}</svg>
<div class="horizon"></div><img class="art" src="${art}" alt="">
<div class="words"><p class="q">${esc(t.text)}</p>${t.ref ? `<div class="rule"></div><p class="ref">${esc(t.ref)}</p>` : ''}</div>
<p class="mark">3r4l.club</p></div></body></html>`;
  await card.setContent(html, { waitUntil: 'load' }); await card.evaluate(() => document.fonts.ready); await card.waitForTimeout(200);
  await card.evaluate(() => { const q = document.querySelector('.q'), w = document.querySelector('.words'); let px = parseFloat(getComputedStyle(q).fontSize); const fits = () => { const c = w.children, top = c[0].getBoundingClientRect().top, bot = c[c.length - 1].getBoundingClientRect().bottom; return top >= 60 && bot <= 505 && q.scrollWidth <= q.clientWidth + 1; }; while (!fits() && px > 40) { px -= 2; q.style.fontSize = px + 'px'; } document.body.dataset.px = px; }); // fill the picture: the largest type that fits
  const over = await card.evaluate(() => { const c = document.querySelector('.words').children, top = c[0].getBoundingClientRect().top, bot = c[c.length - 1].getBoundingClientRect().bottom; return top < 30 || bot > 570; }); if (over) throw new Error(`${kind} ${lang}: the words overflow the picture`);
  const f = path.join(OUT, `${kind}${lang === 'en' ? '' : '-' + lang}.jpg`); await card.screenshot({ path: f, type: 'jpeg', quality: 86 });
  console.log(path.relative(R, f), fs.statSync(f).size, 'B', 'type', await card.evaluate(() => document.body.dataset.px) + 'px');
}
await b.close();
