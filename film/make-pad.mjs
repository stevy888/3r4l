#!/usr/bin/env node
// make-pad.mjs — PAD A: one quiet nylon-guitar pad from Suno via the estate's kie.ai path (the KJ runbook's recipe, RUNBOOK_film_studio.md
// §Music: POST /api/v1/generate customMode + instrumental, model V5_5, poll record-info, download with a browser User-Agent), two takes per task,
// 0.17 under the voice by the plan's mix, the outro law by film-compile. The key is read from ~/music-pipeline/.env HERE and never printed; the
// credit balance before and after is the spend (kie credits; ≈ $0.005 a credit by the music-pipeline's own ledger: 132 credits ≈ $0.66).
// Usage: node film/make-pad.mjs <out-dir>   → <out-dir>/pad-take-1.mp3, pad-take-2.mp3, pad.json (the brief, the task id, the credits, the durations)
import fs from 'node:fs'; import path from 'node:path';
const out = process.argv[2]; if (!out) { console.error('usage: node film/make-pad.mjs <out-dir>'); process.exit(2); } fs.mkdirSync(out, { recursive: true });
const env = Object.fromEntries(fs.readFileSync(path.join(process.env.HOME, 'music-pipeline', '.env'), 'utf8').split('\n').filter(l => /^[A-Z_]+=/.test(l)).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).trim()]; }));
const KEY = env.SUNO_API_KEY, URL_ = (env.SUNO_API_URL || 'https://api.kie.ai').replace(/\/$/, ''), MODEL = env.SUNO_MODEL || 'V5_5'; if (!KEY) { console.error('make-pad: no SUNO_API_KEY in ~/music-pipeline/.env'); process.exit(1); }
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const credit = async () => (await (await fetch(`${URL_}/api/v1/chat/credit`, { headers: H })).json()).data;
// THE BRIEF (findings-film.md §6 Music): the family's brief with ONE colour — nylon guitar, not used by Held or Believe — and the arc
const style = 'Gentle sacred instrumental for solo nylon-string guitar alone, a quiet pad under a spoken reading: a tender, memorable melody, hopeful from the first note, rising to quiet joy — a card pressed into a hand at dawn, the quiet of a confession, the open hand of forgiveness. Very slow, luminous, reverent background music, soft fingerpicking, long held notes, lots of air. No percussion, no drums, no vocals, no piano, no strings, no synth.';
const before = await credit(); console.log(`credits before: ${before}`);
const body = { customMode: true, instrumental: true, prompt: '', style, title: '3r4l-card-pad', model: MODEL, negativeTags: 'drums, percussion, vocals, piano, strings, synth, choir' };
if (env.SUNO_CALLBACK_URL) body.callBackUrl = env.SUNO_CALLBACK_URL;
const gen = await (await fetch(`${URL_}/api/v1/generate`, { method: 'POST', headers: H, body: JSON.stringify(body) })).json();
const taskId = gen?.data?.taskId; if (!taskId) { console.error('make-pad: no taskId', JSON.stringify(gen).slice(0, 300)); process.exit(1); } console.log(`task ${taskId} — polling`);
let rec; for (let i = 0; i < 90; i++) { await new Promise(r => setTimeout(r, 10000)); rec = await (await fetch(`${URL_}/api/v1/generate/record-info?taskId=${taskId}`, { headers: H })).json();
  const st = rec?.data?.status; process.stdout.write(`${st} `); if (st === 'SUCCESS') break; if (/FAIL|ERROR|SENSITIVE/.test(st || '')) { console.error('\nmake-pad: task failed', JSON.stringify(rec).slice(0, 400)); process.exit(1); } }
const takes = rec?.data?.response?.sunoData || []; if (!takes.length) { console.error('\nmake-pad: no takes in the record', JSON.stringify(rec).slice(0, 400)); process.exit(1); }
const report = { task_id: taskId, model: MODEL, brief: style, negative_tags: body.negativeTags, credits_before: before, takes: [] };
for (const [i, t] of takes.slice(0, 2).entries()) { const url = t.audioUrl || t.sourceAudioUrl, f = path.join(out, `pad-take-${i + 1}.mp3`); const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) { console.error(`\nmake-pad: download ${r.status} for take ${i + 1}`); process.exit(1); }
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); report.takes.push({ file: f, id: t.id, title: t.title, duration_s: t.duration, tags: t.tags, bytes: fs.statSync(f).size }); console.log(`\ntake ${i + 1}: ${t.duration} s → ${f}`); }
report.credits_after = await credit(); report.credits_spent = +(before - report.credits_after).toFixed(2); report.spend_usd_est = +(report.credits_spent * 0.005).toFixed(3);
fs.writeFileSync(path.join(out, 'pad.json'), JSON.stringify(report, null, 1) + '\n'); console.log(`credits after: ${report.credits_after} (spent ${report.credits_spent} ≈ $${report.spend_usd_est})`);
