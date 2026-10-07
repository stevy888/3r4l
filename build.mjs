#!/usr/bin/env node
// build.mjs — reads content/, writes docs/ for both languages (plan rung 2). No dependencies.
// TR-link-place B (the plan's own clause: the 2×viewport row was red at 320×568 on the first measure, 1201 > 1136): the what-next door sits directly under the card block and the page closes on the verse.
// Flags: --refresh  re-resolve the forty English verses through the staging verse door (needs CF_ACCESS_CLIENT_ID and
//                   CF_ACCESS_CLIENT_SECRET exported by a subshell that sourced ~/.config/kj/external-probe.env; never printed)
//        --canonical  OFF today; after the www GO-LIVE word the forty doors move to /bible/<book>/<chapter>/<verse>
import fs from 'node:fs'; import path from 'node:path'; import { normalise } from './normalise.mjs';
const R = path.dirname(new URL(import.meta.url).pathname), C = p => path.join(R, 'content', p), D = p => path.join(R, 'docs', p);
const J = p => JSON.parse(fs.readFileSync(p, 'utf8')), argv = process.argv.slice(2), REFRESH = argv.includes('--refresh'), CANON = argv.includes('--canonical');
const INPUTS = '/Users/aibrain/projects/3r4l-inputs', ADDRESS = 'https://3r4l.org/', KJ = 'https://www.knowing-jesus.com';
const sheet = J(C('sheet.json')), verses = J(C('verses.json')), books = J(C('books.json')).books, tr = J(C('translations.json')), journey = J(C('journey.json'));
const redirects = J('/Users/aibrain/kj-rebuild/apps/web/src/lib/generated/legacy-www-redirects.json').rows;
const css = fs.readFileSync(C('page.css'), 'utf8').trim(), dayjs = fs.readFileSync(C('day.js'), 'utf8').replace('__START__', JSON.stringify({ y: journey.y, m: journey.m, d: journey.d })).trim();
// DESIGN the-card-itself r5 — THE DRAWINGS (the hand gone, the owner's word; the dawn half-hidden behind the card's top edge, by night the same disc the lamp's pool under the pendant lamp; the small gold mark that opened the verse gone in r7, the verse panel's own gold quotation mark in its place; the leaf and the moon gone): inline SVG from the template, no text node (the fence reads every text node), aria-hidden, width-bound by CSS, print-hidden; inks as tokens so dark is its own drawing. .day / .night are shown by the theme.
const NS = 'vector-effect="non-scaling-stroke"';
const SVG_DAWN = `<svg class="dawn" viewBox="0 0 200 100" aria-hidden="true" focusable="false"><circle class="day" cx="100" cy="100" r="72" fill="var(--glow)"/><circle cx="100" cy="100" r="54" fill="var(--sun)"/><path class="day" d="M100 41V32M70.5 48.9L66 41.1M129.5 48.9L134 41.1M48.9 70.5L41.1 66M151.1 70.5L158.9 66" fill="none" stroke="var(--ray)" stroke-width="1" stroke-linecap="round" ${NS}/></svg>`; // DESIGN r6a: the glow a flat disc of --glow (no gradient), the sun r 54 half behind the card, five hairline rays
const SVG_LAMP = `<svg class="lamp night" viewBox="0 0 60 68" aria-hidden="true" focusable="false"><path d="M30 0V26" fill="none" stroke="var(--draw)" stroke-width="1.25" ${NS}/><path d="M22 26H38L46 42H14Z" fill="var(--paper)" stroke="var(--draw)" stroke-width="1.25" stroke-linejoin="round" ${NS}/><circle cx="30" cy="47" r="4" fill="var(--bulb)"/><path d="M19 54L15 60M30 55V62M41 54L45 60" fill="none" stroke="var(--ray)" stroke-width="1" stroke-linecap="round" ${NS}/></svg>`;
const SVG_DOOR = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="lite" d="M15.5 5.5L20 3V22L15.5 21.5Z" fill="var(--gold)"/><path d="M4 23V3H20V23" fill="none" stroke="var(--draw)" stroke-width="1.4" stroke-linejoin="round"/><path class="leaf" d="M4 3L15.5 5.5V21.5L4 23Z" fill="var(--paper)" stroke="var(--draw)" stroke-width="1.4" stroke-linejoin="round"/><circle cx="13" cy="13.5" r="1" fill="var(--draw)"/></svg>`;
// DESIGN r6 — THE LITANY'S FOUR LINE DRAWINGS: one gold stroke each at the door glyph's weight (1.4 in a 24 box, drawn at 24 px), fill none, no text node, aria-hidden; in dark the toned gold by the --gold pair. The sheet's order: homework (an open book) · play (a ball) · work (a hammer) · rest, and worship (a plain Latin cross; the owner on the served crescent 2026-10-07: "Looks like Islam. Should be the cross." Standing rule: no symbol another faith owns appears anywhere on the site).
const PIC = d => `<svg class="pic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_BOOK = PIC('M12 7C10 5.3 7.2 4.7 3.5 5.2V18.7C7.2 18.2 10 18.8 12 20.5C14 18.8 16.8 18.2 20.5 18.7V5.2C16.8 4.7 14 5.3 12 7ZM12 7V20.5');
const SVG_BALL = PIC('M12 3.5A8.5 8.5 0 1 1 12 20.5A8.5 8.5 0 1 1 12 3.5ZM12 3.5V20.5M3.5 12H20.5M6 6C9.3 9.3 9.3 14.7 6 18M18 6C14.7 9.3 14.7 14.7 18 18');
const SVG_HAMMER = `<svg class="pic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 7.5H19V12.5H5ZM12 12.5V21" transform="rotate(-45 12 12)" fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_CROSS = PIC('M12 3.5V20.5M6.5 9H17.5');
const PICS = [SVG_BOOK, SVG_BALL, SVG_HAMMER, SVG_CROSS];
// THE LITANY (DESIGN r6, the owner's word on round 5: "broken up or illustrated better … bullet points"): his six lines from the sheet byte for byte — the promise line; the lead line with its saying wrapped in <em> (the fence unwraps em before it reads the line, so the line is still read whole); the four "He will help you…" lines as a list, one drawing each. Nothing is retyped: the saying is split off by the sheet's own closing quotes.
function litany(S) { const [promise, lead, ...helps] = S.lines, m = /^(.*\S)\s+("[^"]+")$/.exec(lead);
  return `<p class="promise prose">${esc(promise)}</p>\n<p class="lead prose">${m ? `${esc(m[1])} <em class="saying">${esc(m[2])}</em>` : esc(lead)}</p>\n<ul class="litany" role="list">\n${helps.map((l, i) => `<li>${PICS[i] || ''}${esc(l)}</li>`).join('\n')}\n</ul>`; }
const noticeHtml = () => notice ? `<p class="notice">${esc(notice)}</p>\n` : ''; // THE ONE LEGAL STRING (TR-translation): Biblica's gratis-use notice, once at the foot of each page
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const parse = ref => { const m = /^(.+?) (\d+):(\d+)(?:-(\d+))?$/.exec(ref); if (!m) throw new Error('bad ref ' + ref); return { book: m[1], ch: +m[2], a: +m[3], b: m[4] ? +m[4] : +m[3] }; };
const slugOf = b => b.toLowerCase().replace(/ /g, '-');
const enSlug = Object.entries(tr.en).find(([, v]) => v.default)[0], enName = tr.en[enSlug].name, notice = tr.en[enSlug].notice || '', tlKey = Object.entries(tr.tl).find(([, v]) => v.default)[0], tlName = tr.tl[tlKey].name;

async function fetchEn(ref) { // every span a:b-c expanded verse by verse; the reference and the slug asserted; a non-200 fails the build
  const DOOR = process.env.KJ_VERSE_DOOR || 'https://staging.knowing-jesus.com'; // staging's PUBLIC catalog folds niv to vsb (the slug assertion refuses it); the Studio twin 127.0.0.1:3020 serves it
  const id = process.env.CF_ACCESS_CLIENT_ID, sec = process.env.CF_ACCESS_CLIENT_SECRET, headers = id && sec ? { 'CF-Access-Client-Id': id, 'CF-Access-Client-Secret': sec } : {};
  if (/knowing-jesus\.com/.test(DOOR) && !(id && sec)) throw new Error('--refresh needs CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET in the env (a subshell sourcing ~/.config/kj/external-probe.env)');
  const { book, ch, a, b } = parse(ref), parts = [];
  for (let v = a; v <= b; v++) {
    const one = `${book} ${ch}:${v}`, u = `${DOOR}/api/bible/verse?reference=${encodeURIComponent(one)}&translation=${enSlug}`;
    const r = await fetch(u, { headers }); if (r.status !== 200) throw new Error(`${one}: HTTP ${r.status}`);
    const j = await r.json(); if (j.reference !== one) throw new Error(`${one}: the door answered ${j.reference}`); if (j.translation_slug !== enSlug) throw new Error(`${one}: slug ${j.translation_slug} != ${enSlug}`);
    parts.push(j.text.trim());
  }
  if (parts.length !== b - a + 1) throw new Error(ref + ': parts'); return parts;
}
function textTl(ref) { const { book, ch, a, b } = parse(ref), f = C(`tl-cache/${books[book].nr}-${ch}.json`), j = J(f), parts = [];
  for (let v = a; v <= b; v++) { const row = j.verses.find(x => x.verse === v); if (!row) throw new Error(`tl ${ref}: verse ${v} missing in ${f}`); parts.push(row.text.trim()); } return parts.join('\n'); }
const refTl = ref => { const { book, ch, a, b } = parse(ref); return `${books[book].tl} ${ch}:${a}${b > a ? '-' + b : ''}`; };
function door(ref) { // TR-verse-link A: the legacy-safe slug when the redirect table carries it, else the legacy Bible path; --canonical moves all forty
  const { book, ch, a } = parse(ref), slug = `${slugOf(book)}-${ch}-${a}`, key = '/' + slug;
  if (CANON) return KJ + (redirects[key] || `/bible/${slugOf(book === 'Psalm' ? 'Psalms' : book)}/${ch}/${a}`);
  return key in redirects ? `${KJ}/${slug}` : `${KJ}/${book.replace(/ /g, '-')}/${ch}/${a}`;
}
for (const v of verses) { // verses.json is the cache: a rebuild needs no token
  if (REFRESH || !v.text) { if (!REFRESH) throw new Error(`day ${v.day} ${v.ref}: no text in verses.json — run with --refresh and the token`); v.parts = await fetchEn(v.ref); v.text = v.parts.join('\n'); v.translation_slug = enSlug; v.translation_name = enName; v.fetched = new Date().toISOString().slice(0, 10); }
  const { a, b } = parse(v.ref); if (!v.parts || v.parts.length !== b - a + 1) throw new Error(`day ${v.day} ${v.ref}: span not whole (${v.parts ? v.parts.length : 0} parts)`);
  v.door = door(v.ref); v.text_tl = textTl(v.ref); v.ref_tl = refTl(v.ref); v.translation_tl = tlName;
}
const d16 = verses.find(v => v.day === 16).text; if (!/Search me/.test(d16) || !/lead me in the way everlasting/.test(d16)) throw new Error('day 16 acceptance failed');
if (REFRESH) fs.writeFileSync(C('verses.json'), JSON.stringify(verses, null, 1) + '\n');

let card = null; // the ONLY source of the prayer and the rules is content/card.txt (rung 1, from Jeff's PDF); absent = the INTERIM placeholder
if (fs.existsSync(C('card.txt'))) { const t = fs.readFileSync(C('card.txt'), 'utf8'), g = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== |$)`, 'm').exec(t) || [, ''])[1].replace(/\n$/, ''); card = { title: g('title'), prayer: g('prayer'), rules: g('rules'), other: g('other') }; }
const cardBlock = (rulesOnly) => card ? `<section id="card">${rulesOnly ? '' : `<p class="title">${esc(card.title)}</p><p class="prayer">${esc(card.prayer)}</p>`}<p class="rules">${esc(card.rules)}</p>${!rulesOnly && card.other ? `<p class="other">${esc(card.other)}</p>` : ''}</section>`
  : `<section id="card" class="placeholder"><p>${esc(sheet.placeholder.card)}</p></section>`;
const cardHtml = (rulesOnly, held) => held ? `<div class="held">${cardBlock(rulesOnly)}${SVG_DAWN}${SVG_LAMP}</div>` : cardBlock(rulesOnly); // DESIGN r5: the card alone under its dawn (home only)
const title = card ? card.title : '3R4L', hasPdf = fs.existsSync(D('card.pdf')) && fs.existsSync(D('kit.pdf'));
const checked = fs.existsSync(C('sheet-tl.json')) && fs.existsSync(path.join(INPUTS, 'pastor-check.txt')); // the Tagalog pair serves only on the pastor's signed check
const L = { en: sheet, tl: checked ? J(C('sheet-tl.json')) : null };
const rows = lang => verses.map(v => lang === 'tl' ? { ...v, ref_l: v.ref_tl, text_l: v.text_tl, tr_l: v.translation_tl } : { ...v, ref_l: v.ref, text_l: v.text, tr_l: v.translation_name });

function head(lang, t, h1, root = '') { return `<!doctype html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(t)}</title>\n<meta name="description" content="${esc(h1)}">\n<meta property="og:title" content="${esc(h1)}">\n<meta property="og:description" content="${esc(h1)}">\n<meta name="color-scheme" content="light dark">\n<style>\n${css.replace(/__ROOT__/g, root)}\n</style>\n</head>\n<body>\n<main>\n`; }
const verseLi = (v, read) => `<li data-day="${v.day}"><p class="ref">${esc(v.ref_l)}</p><p class="text">${esc(v.text_l)}</p><p class="tr">${esc(v.tr_l)}</p><a class="door" href="${v.door}">${esc(read)} ›</a></li>`; // DESIGN r7: the door label carries the › the fence allows (labels + " ›"); the small mark gone, the panel's quotation mark opens the verse
function home(lang, langLink, root = '') { const S = L[lang], vs = rows(lang);
  return head(lang, title, S.h1, root) + `<header class="band lifts">${langLink || ''}<h1>${S.h1_lines.map(esc).join('<br>')}</h1></header>\n${cardHtml(false, true)}\n<p class="next under-card"><a class="door" href="what-next/">${SVG_DOOR}${esc(S.whatnext_link)}</a></p>\n<section class="taking">\n<h2 class="prose">${esc(S.h2)}</h2>\n${litany(S)}\n</section>\n<section class="verse">\n<p class="label">${esc(S.labels.todays_verse)}</p>\n<ol class="forty">\n${vs.map(v => verseLi(v, S.labels.read_on_kj)).join('\n')}\n</ol>\n</section>\n${noticeHtml()}</main>\n<script>\n${dayjs}\n</script>\n<noscript><style>.forty>li[data-day="1"]{display:contents}</style></noscript>\n</body>\n</html>\n`; }
function next(lang, langLink, pdfBase) { const S = L[lang], vs = rows(lang), v1 = vs[0], msg = `${S.h1} ${ADDRESS}`, e = encodeURIComponent, read = S.labels.read_on_kj;
  const doors = hasPdf ? `<section class="doors">\n<a class="door" href="${pdfBase}card.pdf">${esc(S.labels.print_card)}</a>\n<a class="door" href="${pdfBase}kit.pdf">${esc(S.labels.print_sheet)}</a>\n</section>\n` : '';
  return head(lang, title + S.labels.title_whatnext_suffix, S.h1, pdfBase) + `<header class="band">${langLink || ''}<h1>${esc(S.whatnext_link)}</h1>\n<p class="clause prose">${esc(S.whatnext_clause)}</p>\n</header>\n<p class="message">${esc(S.h1)}</p>\n<section class="verse">\n<p class="ref">${esc(v1.ref_l)}</p>\n<p class="text">${esc(v1.text_l)}</p>\n<p class="tr">${esc(v1.tr_l)}</p>\n<a class="door" href="${v1.door}">${esc(read)} ›</a>\n</section>\n${cardHtml(true)}\n<section id="forty">\n<h2>${esc(S.labels.forty)}</h2>\n<p class="label">${esc(S.labels.one_a_day)}</p>\n<ol class="list" role="list">\n${vs.map(v => `<li data-day="${v.day}"><span class="ref">${esc(v.ref_l)}</span><span class="today">${esc(S.labels.today)}</span><a class="door" href="${v.door}">${esc(read)}</a></li>`).join('\n')}\n</ol>\n</section>\n${doors}<section class="share">\n<p class="label">${esc(S.labels.share)}</p>\n<button id="share" hidden data-title="${esc(title)}" data-text="${esc(S.h1)}">${esc(S.labels.share)}</button>\n<div id="share-links">\n<a class="door" href="fb-messenger://share?link=${e(ADDRESS)}">${esc(S.labels.messenger)}</a>\n<a class="door" href="viber://forward?text=${e(msg)}">${esc(S.labels.viber)}</a>\n<a class="door" href="sms:?&amp;body=${e(msg)}">${esc(S.labels.text)}</a>\n<a class="door" href="https://wa.me/?text=${e(msg)}">${esc(S.labels.whatsapp)}</a>\n<a class="door" href="mailto:?subject=${e(title)}&amp;body=${e(msg)}">${esc(S.labels.email)}</a>\n</div>\n<p class="addr">${ADDRESS}</p>\n</section>\n<p class="next"><a class="door" href="../">${esc(S.labels.home)}</a></p>\n${noticeHtml()}</main>\n<script>\n${dayjs}\n</script>\n<noscript><style>.list>li[data-day="1"] .today{display:inline}.list>li[data-day="1"] .door{display:flex}</style></noscript>\n</body>\n</html>\n`; }
const link = (lang, href) => `<p class="lang"><a href="${href}" lang="${lang}">${esc(L[lang === 'en' ? 'tl' : 'en'].labels.lang_link)}</a></p>\n`; // the one word on the other page's tongue
const shortDoor = (to, label) => `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="refresh" content="0; url=${to}">\n<title>${esc(label)}</title>\n</head>\n<body>\n<a href="${to}">${esc(label)}</a>\n</body>\n</html>\n`;
const W = (p, s) => { fs.mkdirSync(path.dirname(D(p)), { recursive: true }); fs.writeFileSync(D(p), s); };
for (const f of ['index.html', 'what-next/index.html', 'en/index.html', 'en/what-next/index.html']) if (fs.existsSync(D(f))) fs.unlinkSync(D(f));
if (checked) { W('index.html', home('tl', link('tl', 'en/'))); W('what-next/index.html', next('tl', link('tl', '../en/what-next/'), '../'));
  W('en/index.html', home('en', link('en', '../'), '../')); W('en/what-next/index.html', next('en', link('en', '../../what-next/'), '../../')); }
else { W('index.html', home('en')); W('what-next/index.html', next('en', '', '../')); W('en/index.html', home('en', '', '../')); W('en/what-next/index.html', next('en', '', '../../')); } // THE INTERIM (TR-language-door A)
W('next/index.html', shortDoor('../what-next/', 'what next')); W('40/index.html', shortDoor('../what-next/#forty', 'the forty days'));
if (hasPdf) { W('card/index.html', shortDoor('../card.pdf', 'the card')); W('kit/index.html', shortDoor('../kit.pdf', 'a sheet of cards')); }
W('.nojekyll', ''); W('robots.txt', 'User-agent: *\nAllow: /\n');
if (fs.existsSync(C('fonts'))) fs.cpSync(C('fonts'), D('fonts'), { recursive: true }); // DESIGN the-card-itself: the self-hosted Source Serif 4 subsets ride beside the pages
for (const pair of [['index.html', 'what-next/index.html'], ['en/index.html', 'en/what-next/index.html']]) { const sz = pair.map(f => fs.statSync(D(f)).size), sum = sz[0] + sz[1];
  if (sz.some(s => s > 60 * 1024) || sum > 120 * 1024) throw new Error(`size: ${pair.join(' + ')} = ${sz.join(' + ')} = ${sum} B (> 60 KB a page or > 120 KB a pair)`); console.log(`${pair[0]} + ${pair[1]} = ${sum} B`); }
console.log(checked ? 'built: Tagalog at the apex, English under /en/' : 'built: THE INTERIM — the English pair at the apex and under /en/, no language link (the Tagalog pair waits on sheet-tl.json + pastor-check.txt)', card ? '· the card from card.txt' : '· the card block a greyed placeholder (no card.txt yet)', CANON ? '· --canonical' : '');
