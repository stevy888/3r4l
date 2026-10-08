#!/usr/bin/env node
// trim-tails.mjs — the takes' trailing silence, cut (FILM-SPEC acceptance (c) and (d)): every ElevenLabs take ends in 1.0–1.5 s of its own silence,
// which summed with the composed pre-gaps turns every planned pause into an unplanned gap > 1.4 s and pushes the film past the 2:30 window. The cut
// lands at the last −38 dB silence onset + the keep, so the studio's tail-RMS gate (< 0.015 linear over the last 0.30 s) still reads silence; a take
// whose final silence is shorter than the keep is copied whole. The cut DECODES and RE-ENCODES (libmp3lame, one generation on speech): a stream-copied
// cut leaves a header 12 ms longer than its decoded audio, and assemble.py's timeline (ffprobe) then drifts 12 ms a take against the narration it
// concatenates — 180 ms by the last line (measured 2026-10-08). Every output is asserted container == decoded within 5 ms. Head silence is never cut
// (the line's onset IS the beat). Reads segments/seg-*.mp3, writes segments/trimmed/ (the plan's segments_dir) and trimmed/trim-report.json.
import { execFileSync, spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const FF = '/opt/homebrew/bin/ffmpeg', FP = '/opt/homebrew/bin/ffprobe', KEEP = 0.32, FLOOR = '-38dB';
const src = process.argv[2] || '/Users/aibrain/projects/3r4l-inputs/film/segments', out = path.join(src, 'trimmed'); fs.mkdirSync(out, { recursive: true });
const dur = f => parseFloat(execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
const ffErr = a => spawnSync(FF, ['-hide_banner', ...a, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr; // ffmpeg speaks on stderr
const silences = f => { const e = ffErr(['-i', f, '-af', `silencedetect=noise=${FLOOR}:d=0.25`]);
  const starts = [...e.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]), ends = [...e.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]); return starts.map((s, i) => [s, ends[i] ?? null]); };
const tailRms = f => { const d = dur(f), e = ffErr(['-i', f, '-af', `atrim=start=${Math.max(0, d - 0.30)},astats=metadata=1`]);
  const m = [...e.matchAll(/RMS level dB:\s*(-?[\d.]+|-inf)/g)]; if (!m.length) return 0; const db = m[m.length - 1][1]; return db === '-inf' ? 0 : 10 ** (parseFloat(db) / 20); };
const report = {};
for (const f of fs.readdirSync(src).filter(n => /^seg-.*\.mp3$/.test(n)).sort()) {
  const inp = path.join(src, f), o = path.join(out, f), d = dur(inp), sil = silences(inp), last = sil.length && (sil[sil.length - 1][1] === null || sil[sil.length - 1][1] >= d - 0.05) ? sil[sil.length - 1][0] : null;
  const cut = last !== null && d - last > KEEP ? +(last + KEEP).toFixed(3) : null;
  if (cut) execFileSync(FF, ['-y', '-loglevel', 'error', '-i', inp, '-t', String(cut), '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', o]); else fs.copyFileSync(inp, o);
  const tmp = path.join(out, 'decoded.tmp.wav'); execFileSync(FF, ['-y', '-loglevel', 'error', '-i', o, '-ar', '44100', '-ac', '1', tmp]); const decoded = dur(tmp); fs.unlinkSync(tmp);
  const nd = dur(o), rms = tailRms(o); report[f] = { in_s: +d.toFixed(3), out_s: +nd.toFixed(3), decoded_s: +decoded.toFixed(3), container_minus_decoded_ms: Math.round((nd - decoded) * 1000), cut_at_s: cut, trailing_silence_s: last === null ? 0 : +(d - last).toFixed(3), tail_rms: +rms.toFixed(5), tail_ok: rms < 0.015 };
  console.log(`${f}: ${d.toFixed(2)}s → ${nd.toFixed(2)}s${cut ? ` (cut at ${cut})` : ' (whole)'} decoded ${decoded.toFixed(3)} tail_rms ${rms.toFixed(4)}${rms < 0.015 ? '' : ' ✗ ABRUPT'}`);
}
fs.writeFileSync(path.join(out, 'trim-report.json'), JSON.stringify({ keep_s: KEEP, floor: FLOOR, segments: report }, null, 1) + '\n');
const bad = Object.entries(report).filter(([, r]) => !r.tail_ok); if (bad.length) { console.error(`trim-tails: ${bad.length} take(s) abrupt after the cut — STOP`); process.exit(1); }
const drift = Object.entries(report).filter(([, r]) => Math.abs(r.container_minus_decoded_ms) > 5); if (drift.length) { console.error(`trim-tails: ${drift.length} take(s) whose container length differs from the decoded audio by > 5 ms (${drift.map(([f, r]) => `${f} ${r.container_minus_decoded_ms} ms`).join(', ')}) — the timeline would drift; STOP`); process.exit(1); }
console.log(`trim-tails: ${Object.keys(report).length} takes → ${out} · ${Object.values(report).reduce((s, r) => s + r.in_s - r.out_s, 0).toFixed(1)} s of trailing silence removed`);
