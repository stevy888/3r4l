#!/usr/bin/env node
// mail/load-sequence.mjs — the 41 mails of mail/out into ONE Kit sequence through Kit's API v4 (phase 2 rung 7, TR2-sender-key). The key is read from
// ~/.secrets/3r4l-kit.env in a subshell and never printed; the endpoint names are read from Kit's own docs page at run time (else from the rung-0 probe
// 3r4l-inputs/vendors-2026-10-08.md). Day 0 goes at the confirm (delay 0), day 1 the next 06:00 Manila and one a morning to day 40 (delay 1 day each;
// the sequence's send_hour 6 in Asia/Manila, every day of the week — Kit's own fields); `[unsubscribe]` → Kit's own tag {{ unsubscribe_url }}.
// --dry-run prints every request with the key masked and exits 0 — no call is made; a live load also needs KIT_LIVE=yes (the account exists and its
// free Sequences screen carries one, read there by the seat). Usage: node mail/load-sequence.mjs --dry-run   · live: KIT_LIVE=yes node mail/load-sequence.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), OUT = path.join(R, 'mail', 'out'), DRY = process.argv.includes('--dry-run');
const ENV = path.join(process.env.HOME || '', '.secrets', '3r4l-kit.env'), PROBE = '/Users/aibrain/projects/3r4l-inputs/vendors-2026-10-08.md';
const DOCS = 'https://developers.kit.com/api-reference/sequence-emails/create-a-sequence-email', FROM = 'forty@3r4l.org', NAME = '3r4l · the forty days';
const key = fs.existsSync(ENV) ? execFileSync('/bin/sh', ['-c', '. "$0" >/dev/null 2>&1; printf %s "$KIT_API_KEY"', ENV], { encoding: 'utf8' }).trim() : ''; // a subshell sources the file; the one value comes back, never echoed
const shown = key ? `<key masked · ${key.length} chars>` : '<no key: ~/.secrets/3r4l-kit.env absent — a masked placeholder stands in the dry run>';
if (!DRY && !key) { console.error(`refused: no KIT_API_KEY in ${ENV} (TR2-sender-key: the account sitting writes it there)`); process.exit(2); }
if (!DRY && process.env.KIT_LIVE !== 'yes') { console.error('refused: a live load needs KIT_LIVE=yes — run --dry-run first and read every body'); process.exit(2); }
async function endpoints() { let text, src = DOCS; // Kit's page as the vendor prints it today; the probe on disk when the page cannot be fetched
  try { const r = await fetch(DOCS, { signal: AbortSignal.timeout(8000) }); if (!r.ok) throw new Error(r.status); text = await r.text(); } catch { text = fs.readFileSync(PROBE, 'utf8'); src = PROBE; }
  const seq = /\/v4\/sequences(?![\w{/])/.test(text), em = /\/v4\/sequences\/\{\w+\}\/emails/.exec(text); if (!seq || !em) throw new Error('the endpoint names were not found in ' + src);
  return { base: 'https://api.kit.com', seq: '/v4/sequences', emails: em[0], src }; }
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = body => body.trim().split('\n\n').map(p => '<p>' + p.split('\n').map(l => l === '[unsubscribe]' ? '{{ unsubscribe_url }}' : esc(l).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')).join('<br>') + '</p>').join('\n'); // the plain mail as plain HTML: a paragraph a block, a line a <br>, every address a link, the one token the vendor's
const files = fs.readdirSync(OUT).filter(f => /^day-\d\d\.txt$/.test(f)).sort(); if (files.length !== 41) throw new Error(`${files.length} mails in mail/out (want 41: node mail/build-mails.mjs first)`);
const mails = files.map((f, i) => { const [s, , ...b] = fs.readFileSync(path.join(OUT, f), 'utf8').split('\n'); if (!s.startsWith('Subject: ')) throw new Error(f + ': no Subject line'); return { day: i, subject: s.slice(9), body: b.join('\n') }; });
let n = 0; async function post(url, body) { n++; if (DRY) { console.log(`--- request ${n}: POST ${url}\nX-Kit-Api-Key: ${shown}\n${JSON.stringify(body, null, 1)}\n`); return { id: '{sequence_id}' }; }
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': key }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`); return j.sequence || j.sequence_email || j; }
const E = await endpoints(); console.log(`endpoints from ${E.src}: POST ${E.seq} · POST ${E.emails}${DRY ? ' · DRY RUN — nothing is sent' : ''}`);
const seq = await post(E.base + E.seq, { name: NAME, email_address: FROM, send_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], send_hour: 6, time_zone: 'Asia/Manila', active: true, repeat: false, hold: false });
for (const m of mails) await post(E.base + E.emails.replace(/\{\w+\}/, seq.id), { subject: m.subject, content: html(m.body), delay_value: m.day === 0 ? 0 : 1, delay_unit: 'days', published: true, position: m.day + 1 });
console.log(`${DRY ? 'dry run: ' : ''}1 sequence + ${mails.length} emails (day 0 … day ${mails.length - 1}); day 0 at the confirm, day 1 the next 06:00 Asia/Manila, one a morning to day 40; [unsubscribe] → {{ unsubscribe_url }}`);
