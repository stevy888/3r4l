#!/usr/bin/env node
// make-vtt.mjs — the caption track (FILM-SPEC §6): beats.json + lines.json → card.vtt, ONE CUE PER LINE carrying the EXACT card.txt text (never the
// aloud form, never burned in). Cue start = the line's speech onset in the master (its beat + its visual lead + the 1600 ms intro); cue end = the
// next line's onset − 0.25 s, or the take's own end for the last. The spoken credit is not a card line: it rides as a VTT NOTE, never a cue, so
// acceptance (a) — the cues joined == card.txt whole — holds. Usage: node film/make-vtt.mjs <out.vtt>
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname)), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const out = process.argv[2]; if (!out) { console.error('usage: node film/make-vtt.mjs <out.vtt>'); process.exit(2); }
const beats = J(path.join(R, 'job', 'beats.json')), plan = J(path.join(R, 'job', 'plan.json')), lines = J(path.join(R, 'job', 'lines.json')), INTRO = plan.intro_ms / 1000;
const segDir = plan.segments_dir.replace(/^~\//, process.env.HOME + '/'), dur = f => parseFloat(execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
const ts = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x}`; };
const onset = l => beats.beats_s[+l.beat.slice(1) - 1] + l.lead_s + INTRO; // the speech onset: assemble.py set the beat = onset − lead
const card = lines.filter(l => l.block !== 'credit'), credit = lines.find(l => l.block === 'credit');
const cues = card.map((l, i) => { const start = onset(l), end = i + 1 < card.length ? onset(card[i + 1]) - 0.25 : start + dur(path.join(segDir, l.seg + '.mp3')); return { start, end: Math.max(end, start + 0.6), text: l.card, block: l.block }; });
const vtt = ['WEBVTT', '', 'NOTE The card\'s words, one cue per spoken line, byte for byte from content/card.txt. The paper on screen carries the words; this track is the accessibility track, never burned in.', '',
  ...cues.flatMap((c, i) => [`${i + 1}`, `${ts(c.start)} --> ${ts(c.end)}`, c.text, '']),
  credit ? `NOTE The spoken credit (not a card line, not a cue): ${credit.card} — ${ts(onset(credit))}` : ''].join('\n') + '\n';
fs.writeFileSync(out, vtt); console.log(`vtt: ${cues.length} cues ${ts(cues[0].start)} → ${ts(cues[cues.length - 1].end)} → ${out}`);
