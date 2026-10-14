#!/usr/bin/env node
// bin/doors-to-contact.mjs — doors.txt (the owner's hand file in 3r4l-inputs: one `key: value` line a door) → content/contact.json, the literals build.mjs
// and check-wording consume (phase 2 rung 4, TR2-contact A; re-shaped 2026-10-14, the contact page plan R2). Keys: answerer · reply_time · messenger (a handle →
// https://m.me/<handle>) · viber (a Philippine number → viber://chat?number=%2B63…) · text (a number → sms:+63…) · whatsapp (a number → https://wa.me/63…) ·
// email (an address; the door lights by this address or under dns-rows.txt hasMail). THE ORDER ON THE PAGE IS THE ORDER OF HIS LINES — the first app line he
// writes is the gold door. A missing key renders no door; nothing is invented here — an empty file writes doors:{} and /contact/ keeps its Email door alone (hasMail).
// Usage: node bin/doors-to-contact.mjs [path/to/doors.txt]
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), SRC = process.argv[2] || '/Users/aibrain/projects/3r4l-inputs/doors.txt', OUT = path.join(R, 'content', 'contact.json');
if (!fs.existsSync(SRC)) { console.error(`no ${SRC} — /contact/ keeps its Email door alone (under hasMail) and no who-reads name`); process.exit(1); }
const kv = Object.fromEntries(fs.readFileSync(SRC, 'utf8').split('\n').map(l => /^(\w+):\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m => [m[1].toLowerCase(), m[2]]));
const num = s => { const d = s.replace(/[^\d+]/g, ''); return d.startsWith('+') ? d : d.startsWith('0') ? '+63' + d.slice(1) : '+' + d; }; // a Philippine number as written (0917 … or +63 917 …) → E.164
const KEYS = ['messenger', 'viber', 'text', 'whatsapp', 'email'], doors = {}; // HIS FILE'S ORDER (the contact page plan R2, 2026-10-14): the doors are built in the order his lines are read — the FIRST app line he writes is the gold door on the page; no "Philippines' order" is the fleet's guess any more
for (const k of Object.keys(kv).filter(k => KEYS.includes(k))) {
  if (k === 'messenger') doors.messenger = { href: `https://m.me/${kv.messenger.replace(/^@|^https?:\/\/m\.me\//, '')}` };
  else if (k === 'viber') doors.viber = { href: `viber://chat?number=${encodeURIComponent(num(kv.viber))}` };
  else if (k === 'text') doors.text = { href: `sms:${num(kv.text)}` };
  else if (k === 'whatsapp') doors.whatsapp = { href: `https://wa.me/${num(kv.whatsapp).slice(1)}` }; // digits, no + (wa.me's grammar; the fence's wa.me/ clause admits it)
  else if (k === 'email') doors.email = { address: kv.email };
}
const out = { _note: `written by bin/doors-to-contact.mjs from ${path.basename(SRC)} — the literals of TR2-contact A in HIS FILE'S ORDER (the first app line = the gold door; keys messenger · viber · text · whatsapp · email); the Email door renders under hasMail or this address; answerer fills [name], reply_time is his figure`, answerer: kv.answerer || '', reply_time: kv.reply_time || '', doors };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`content/contact.json: ${Object.keys(doors).length} door(s) [${Object.keys(doors).join(' · ')}]${out.answerer ? ' · answerer: ' + out.answerer : ' · no answerer'}${out.reply_time ? ' · reply time: ' + out.reply_time : ' · no reply time'}`);
