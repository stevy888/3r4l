// print-proof.mjs <base-url> <out.pdf> — THE PRINT PROOF (plan 2b rung 3): /card/ under @media print must put the whole card's two faces on
// paper, navy on white, the doors and the drawings hidden. Writes the PDF and prints what the print stylesheet left visible; the page
// count comes from the PDF. Runs from the repo (node_modules).
import { chromium } from '@playwright/test';
const [base, out] = process.argv.slice(2); if (!base || !out) { console.error('usage: node print-proof.mjs <base-url> <out.pdf>'); process.exit(2); }
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base + 'card/', { waitUntil: 'load' }); await page.emulateMedia({ media: 'print' });
const seen = await page.evaluate(() => { const vis = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'; const q = sel => [...document.querySelectorAll(sel)].filter(vis).length; return { faces: q('#card .face'), doors: q('.door, a.tab, button.play'), doorList: [...document.querySelectorAll('.door, a.tab, button.play')].filter(vis).map(e => e.tagName.toLowerCase() + '.' + [...e.classList].join('.') + (e.getAttribute('href') ? '[' + e.getAttribute('href') + ']' : '')), drawings: q('svg'), imgs: q('img'), band: q('.band'), h1: q('h1') }; }); // visible = laid out (a hidden ancestor hides the box; computed display alone misses that)
await page.pdf({ path: out, format: 'A4', printBackground: false, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
console.log(JSON.stringify(seen)); await browser.close();
