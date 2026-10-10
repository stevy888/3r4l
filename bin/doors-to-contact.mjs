#!/usr/bin/env node
// bin/doors-to-contact.mjs — doors.txt (the owner's hand file in 3r4l-inputs: one `key: value` line a door) → content/contact.json, the literals build.mjs
// and check-wording consume (phase 2 rung 4, TR2-contact A). Keys: answerer · reply_time · messenger (a handle → https://m.me/<handle>) · viber (a
// Philippine number → viber://chat?number=%2B63…) · text (a number → sms:+63…) · email (an address; the door itself renders only under dns-rows.txt
// hasMail). A missing key renders no door; nothing is invented here — an empty file writes doors:{} and /contact/ keeps its Email door alone.
// Usage: node bin/doors-to-contact.mjs [path/to/doors.txt]
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), SRC = process.argv[2] || '/Users/aibrain/projects/3r4l-inputs/doors.txt', OUT = path.join(R, 'content', 'contact.json');
if (!fs.existsSync(SRC)) { console.error(`no ${SRC} — /contact/ keeps its Email door alone (under hasMail) and no who-reads name`); process.exit(1); }
const kv = Object.fromEntries(fs.readFileSync(SRC, 'utf8').split('\n').map(l => /^(\w+):\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m => [m[1].toLowerCase(), m[2]]));
const num = s => { const d = s.replace(/[^\d+]/g, ''); return d.startsWith('+') ? d : d.startsWith('0') ? '+63' + d.slice(1) : '+' + d; }; // a Philippine number as written (0917 … or +63 917 …) → E.164
const doors = {};
if (kv.messenger) doors.messenger = { href: `https://m.me/${kv.messenger.replace(/^@|^https?:\/\/m\.me\//, '')}` };
if (kv.viber) doors.viber = { href: `viber://chat?number=${encodeURIComponent(num(kv.viber))}` };
if (kv.text) doors.text = { href: `sms:${num(kv.text)}` };
if (kv.email) doors.email = { address: kv.email };
const out = { _note: `written by bin/doors-to-contact.mjs from ${path.basename(SRC)} — the literals of TR2-contact A (the Philippines' order: Messenger · Viber · Text · Email); the Email door renders only under dns-rows.txt hasMail; answerer fills [name], reply_time is his figure`, answerer: kv.answerer || '', reply_time: kv.reply_time || '', doors };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`content/contact.json: ${Object.keys(doors).length} door(s) [${Object.keys(doors).join(' · ')}]${out.answerer ? ' · answerer: ' + out.answerer : ' · no answerer'}${out.reply_time ? ' · reply time: ' + out.reply_time : ' · no reply time'}`);
