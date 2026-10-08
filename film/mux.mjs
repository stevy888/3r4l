#!/usr/bin/env node
// mux.mjs — THE MASTERS from the records (FILM-SPEC §5 and §"The masters"): for each record (<base>.webm + <base>.json) the real play frame is found
// in the capture (the paper's arrival: the first frame whose paper-rect mean brightness rises off the pre-dawn navy), the head is cut so the master's
// poster is EXACTLY the template's 1600 ms, and the mix is muxed with adelay == that poster wait (the adelay trap, film-compile.mjs:64–67: the intro
// offset belongs to the cinema mux alone). H.264 crf 18 preset slow 30 fps + AAC 192k + faststart; ffmpeg chapters on both (the three rules · the
// turn · the prayer); the 720 forwards (CRF 24 preset slow); the two chapter cuts from the 9:16 720 (-ss/-t, re-encoded at the chapter bounds).
// Usage: node film/mux.mjs <landscape-base> <portrait-base> <mix.m4a> <out-dir>   → card-1080.mp4 card-720.mp4 card-9x16-1080.mp4 card-9x16-720.mp4 cuts/ mux.json
import { execFileSync, spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const FF = '/opt/homebrew/bin/ffmpeg', FP = '/opt/homebrew/bin/ffprobe', R = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const J = p => JSON.parse(fs.readFileSync(p, 'utf8')), ff = a => execFileSync(FF, ['-y', '-hide_banner', '-loglevel', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const dur = f => parseFloat(execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
// the frame means of a rect through the capture: showinfo prints pts_time and mean per frame (the capture's own timestamps, VFR-safe)
export function frameMeans(video, r, extra = []) { const e = spawnSync(FF, ['-hide_banner', ...extra, '-i', video, '-vf', `crop=${r.w}:${r.h}:${r.x}:${r.y},scale=1:1,format=gray,showinfo`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/pts_time:\s*([\d.]+).*?mean:\[(\d+)/g)].map(m => ({ t: +m[1], mean: +m[2] })); }
export function playFrame(video, rect) { // the paper's arrival (a .2 s linear fade, ≥ 15 % on its first frame): base = the first frames' navy; play = the first frame risen ≥ 6 above it, less half a frame
  const f = frameMeans(video, rect), base = f.slice(0, 5).reduce((s, x) => s + x.mean, 0) / Math.min(5, f.length), i = f.findIndex(x => x.mean - base >= 6);
  if (i < 1) throw new Error(`mux: no arrival found in ${video} (base ${base})`); const step = f[i].t - f[i - 1].t; return { t_play: +(f[i].t - step / 2).toFixed(3), base: +base.toFixed(1), frame: i, fps: +(1 / step).toFixed(2) }; }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { // the masters: only when run as the command (preflight.mjs imports frameMeans from here)
const [,, landBase, portBase, mix, outDir] = process.argv; if (!landBase || !portBase || !mix || !outDir) { console.error('usage: node film/mux.mjs <landscape-base> <portrait-base> <mix.m4a> <out-dir>'); process.exit(2); }
const beats = J(path.join(R, 'job', 'beats.json')), plan = J(path.join(R, 'job', 'plan.json')), lines = J(path.join(R, 'job', 'lines.json')), INTRO = plan.intro_ms / 1000;
const beatT = name => beats.beats_s[+lines.find(x => x.name === name).beat.slice(1) - 1];
const flipBeat = plan.assembly.extra_beats[0].beat, chapters = [['The three rules', 0], ['The turn', beats.beats_s[+flipBeat.slice(1) - 1] + INTRO], ['The prayer', beatT('p1') + lines.find(x => x.name === 'p1').lead_s + INTRO]];
const ffmeta = end => ';FFMETADATA1\n' + chapters.map(([title, s], i) => `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(s * 1000)}\nEND=${Math.round((i + 1 < chapters.length ? chapters[i + 1][1] : end) * 1000)}\ntitle=${title}\n`).join('');
fs.mkdirSync(path.join(outDir, 'cuts'), { recursive: true }); const report = { intro_s: INTRO, mix: path.resolve(mix), chapters: {}, records: {} };
function master(base, name) {
  const rec = J(base + '.json'), webm = base + '.webm', pf = playFrame(webm, rec.rects.paper), head = +(pf.t_play - INTRO).toFixed(3);
  if (head < 0) throw new Error(`mux: the capture's play frame (${pf.t_play}) sits before the poster wait — cannot cut the head`);
  const out = path.join(outDir, name), meta = path.join(outDir, name.replace(/\.mp4$/, '.ffmeta')), audioLen = INTRO + beats.total_s + plan.mix.apad_s + 0.5;
  fs.writeFileSync(meta, ffmeta(audioLen));
  ff(['-ss', String(head), '-i', webm, '-i', mix, '-i', meta, '-map_metadata', '2', '-filter_complex', `[1:a]adelay=${plan.intro_ms}:all=1[a]`, '-map', '0:v:0', '-map', '[a]', '-shortest',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  report.records[name] = { source: webm, play_frame: pf, head_cut_s: head, poster_wait_ms: plan.intro_ms, adelay_ms: plan.intro_ms, duration_s: +dur(out).toFixed(3), bytes: fs.statSync(out).size }; console.log(`${name}: play at ${pf.t_play}s in the capture (${pf.fps} fps) → head cut ${head}s · adelay ${plan.intro_ms} ms · ${report.records[name].duration_s}s`);
  return out;
}
const forward = (src, name, w, h) => { const out = path.join(outDir, name); ff(['-i', src, '-vf', `scale=${w}:${h}:flags=lanczos`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-map_metadata', '0', '-map_chapters', '0', out]);
  report.records[name] = { source: src, crf: 24, preset: 'slow', duration_s: +dur(out).toFixed(3), bytes: fs.statSync(out).size }; console.log(`${name}: ${(fs.statSync(out).size / 1e6).toFixed(2)} MB`); return out; };
const land = master(landBase, 'card-1080.mp4'), port = master(portBase, 'card-9x16-1080.mp4');
forward(land, 'card-720.mp4', 1280, 720); const p720 = forward(port, 'card-9x16-720.mp4', 720, 1280);
const end = dur(p720); chapters.forEach(([title, s], i) => { report.chapters[title] = { start_s: +s.toFixed(3), end_s: +((i + 1 < chapters.length ? chapters[i + 1][1] : end)).toFixed(3) }; });
for (const [title, slug] of [['The three rules', 'rules'], ['The prayer', 'prayer']]) { const c = report.chapters[title], out = path.join(outDir, 'cuts', `card-9x16-720-${slug}.mp4`);
  ff(['-ss', String(c.start_s), '-t', String(+(c.end_s - c.start_s).toFixed(3)), '-i', p720, '-map_chapters', '-1', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
  report.records[`cuts/${path.basename(out)}`] = { chapter: title, ...c, duration_s: +dur(out).toFixed(3), bytes: fs.statSync(out).size }; console.log(`cut ${slug}: ${c.start_s}–${c.end_s}s`); }
fs.writeFileSync(path.join(outDir, 'mux.json'), JSON.stringify(report, null, 1) + '\n'); console.log(`mux: masters → ${outDir}`);
}
