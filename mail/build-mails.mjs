#!/usr/bin/env node
// mail/build-mails.mjs — THE 41 MAILS OF THE FORTY, zero-model, from the texts of record ONLY (phase 2 rung 7): verses.json (the KJV text and
// the door), card.txt (the three rules, sliced), sheet.json (his clause, the labels) and sheet2.json's mail frames (DRAFT until his line).
// One plain-text file a day under mail/out/: day-00 (the welcome, the morning after the confirm), day-01 … day-40 (the reference as the
// subject's reference · the KJV text · "Read it on Knowing Jesus ›" · the three rules byte for byte · his clause · one door to the reader's
// own row /what-next/#day-N · the stop line · the sender and the privacy pointer), day-40 carrying the forty's end line. NO devotional line,
// no picture, no pixel, no notice. `[unsubscribe]` is the one token: mail/load-sequence.mjs maps it to the vendor's unsubscribe tag.
// Per-subscriber day 1 = the morning after the confirm at 06:00 Manila (TR2-mail-day A); the sequence ends at day 40; the row is deleted by day 47.
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), C = p => path.join(R, 'content', p), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sheet = J(C('sheet.json')), S2 = J(C('sheet2.json')), verses = J(C('verses.json')), card = fs.readFileSync(C('card.txt'), 'utf8');
const block = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== \\w+ ==\\n|(?![\\s\\S]))`, 'm').exec(card) || [, ''])[1].replace(/\n$/, '');
const rules = block('rules'), ADDRESS = 'https://3r4l.org/', FROM = 'forty@3r4l.org', OUT = path.join(R, 'mail', 'out');
const T = (g, k) => S2[g][k].text, L = sheet.labels, pad = n => String(n).padStart(2, '0');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const foot = n => [`${T('mails', 'page_link')} › ${ADDRESS}what-next/#day-${n}`, '', T('signup', 'stop'), '[unsubscribe]', `${FROM} · ${ADDRESS}privacy/`].join('\n');
const write = (n, subject, body) => fs.writeFileSync(path.join(OUT, `day-${pad(n)}.txt`), `Subject: ${subject}\n\n${body}\n`);
write(0, T('mails', 'day0_subject'), [T('mails', 'day0'), '', T('signup', 'stop'), '[unsubscribe]', `${FROM} · ${ADDRESS}privacy/`].join('\n'));
for (const v of verses) { const text = v.parts ? v.parts.join(' ') : v.text.replace(/\n/g, ' '); // a span's verses on ONE line, as the fence reads a verse
  const body = [v.ref, text, `${L.read_on_kj} › ${v.door}`, '', rules, '', sheet.whatnext_clause, ...(v.day === 40 ? ['', T('mails', 'day40')] : []), '', foot(v.day)].join('\n');
  write(v.day, T('mails', 'subject').replace('{n}', v.day).replace('{ref}', v.ref), body); }
const sizes = fs.readdirSync(OUT).map(f => fs.statSync(path.join(OUT, f)).size);
console.log(`mail/out: ${sizes.length} mails (day 0 … day 40), ${Math.min(...sizes)}–${Math.max(...sizes)} chars; From ${FROM}; every verse the ${verses[0].translation_name}`);
