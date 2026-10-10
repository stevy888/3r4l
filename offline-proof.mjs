// offline-proof.mjs <base-url> — THE OFFLINE PROOF (plan 2b rung 3, TR2B-offline A): a reader opens the home, then /card/ (an internal
// referrer — the worker registers there), the worker installs and caches the site's own files; the network is then cut and the five pages
// and the forty sheet must still answer from the cache. Prints one line per page; rc 1 on any miss. Runs from the repo (node_modules).
import { chromium } from '@playwright/test';
const base = process.argv[2]; if (!base) { console.error('usage: node offline-proof.mjs <base-url>'); process.exit(2); }
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage(); let bad = 0;
const reqs = []; page.on('request', r => reqs.push(r.url()));
await page.goto(base, { waitUntil: 'load' }); const firstLoad = reqs.filter(u => /sw\.js|manifest\.webmanifest|favicon\.svg/.test(u)).length;
console.log(`${firstLoad === 0 ? 'ok ' : 'RED'} the first load asks for no worker, manifest or icon (${firstLoad})`); if (firstLoad) bad++;
await page.click('a.door[href="card/"]'); await page.waitForURL(/card\/$/); // the second page: the worker registers (document.referrer is the site)
const ready = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; for (let i = 0; i < 60; i++) { const ks = await caches.keys(); if (ks.length) { const c = await caches.open(ks[0]); const n = (await c.keys()).length; if (n >= 8) return { scope: r.scope, cache: ks[0], n }; } await new Promise(f => setTimeout(f, 250)); } return null; });
console.log(`${ready ? 'ok ' : 'RED'} the worker installed and cached the site's own files · ${JSON.stringify(ready)}`); if (!ready) bad++;
await ctx.setOffline(true);
for (const p of ['', 'card/', 'what-next/', 'contact/', 'privacy/', 'en/']) { try { const res = await page.goto(base + p, { waitUntil: 'load', timeout: 15000 }); const ok = res && res.status() === 200 && (await page.evaluate(() => document.querySelectorAll('h1').length)) >= 1; console.log(`${ok ? 'ok ' : 'RED'} offline ${'/' + p} → ${res ? res.status() : 'no response'}`); if (!ok) bad++; } catch (e) { console.log(`RED offline /${p} → ${e.message.split('\n')[0]}`); bad++; } }
for (const f of ['forty.pdf', 'card.pdf', 'kit.pdf']) { const r = await page.evaluate(async u => { try { const x = await fetch(u); return { status: x.status, bytes: (await x.arrayBuffer()).byteLength }; } catch (e) { return { status: 0, bytes: 0 }; } }, base + f); const ok = r.status === 200 && r.bytes > 10000; console.log(`${ok ? 'ok ' : 'RED'} offline /${f} → ${r.status} · ${r.bytes} B (fetched from inside the page: a PDF navigation is a download, not a page)`); if (!ok) bad++; }
await browser.close(); console.log(`${bad ? 'RED' : 'OK'} offline proof · ${bad} red`); process.exit(bad ? 1 : 0);
