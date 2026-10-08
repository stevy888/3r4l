#!/usr/bin/env node
// make-narration.mjs — THE JOB, GENERATED FROM card.txt (FILM-SPEC.md §"The job"): no seat types a card word. Reads content/card.txt (the
// eight blocks in the card's order) and writes film/job/: plan.json (every key the studio reads — assemble.py, film-compile.mjs, tts_segments.py),
// narration.json (the spoken lines: card.txt WHOLE, the title and both turn lines SPOKEN, sentence-split inside the note and the prayer, the aloud
// normalisation HERE, the directed pre-gaps), lines.json (beat → the exact card line, for make-vtt and preflight), card.template.html (the two faces
// TYPESET from card.txt into film/card.src.html — a sibling of Believe's), fonts.css (the site's three woff2 as data URIs) and prayer-pass/ (the same
// job with the voice's speed knob at 0.90 for the two prayers — tts_segments.py keeps every clean segment it finds, so the pass re-cuts only the
// prayer segments deleted before it runs). Usage: node film/make-narration.mjs [--bed <file>]   (the bed defaults to pad B, the silent bed file)
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), F = p => path.join(R, 'film', p), J = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const argv = process.argv.slice(2), bedArg = argv.includes('--bed') ? argv[argv.indexOf('--bed') + 1] : null;
const LOUDNORM = argv.includes('--loudnorm') ? argv[argv.indexOf('--loudnorm') + 1] : 'I=-17.4:TP=-2.2:LRA=11'; // the studio's I=-14 lands ≈ −17.8 on a music bed; on speech + a silent bed the single-pass normaliser lands under its I and the AAC overshoots TP — measured 2026-10-08: I=-14 → −15.6 LUFS/−1.0 dBTP, I=-16.2 → −16.8/−1.6, I=-17.4 → −17.7/−1.9 (the string of record); the plan's string is the knob and the ledger carries the measured result
const INPUTS = '/Users/aibrain/projects/3r4l-inputs/film', WORK = INPUTS + '/work', SEGS = INPUTS + '/segments';
const card = fs.readFileSync(path.join(R, 'content', 'card.txt'), 'utf8');
const block = k => (new RegExp(`^== ${k} ==\\n([\\s\\S]*?)(?=\\n== \\w+ ==\\n|(?![\\s\\S]))`, 'm').exec(card) || [, ''])[1].replace(/\n$/, '');
const B = Object.fromEntries(['title', 'rules', 'note', 'daily_prayer', 'turn', 'invite', 'prayer', 'turn_back'].map(k => [k, block(k)]));
for (const k in B) if (!B[k]) throw new Error(`card.txt: block ${k} is empty`);
const credit = J(path.join(R, 'content', 'sheet2.json')).film.credit.text; // the credit string of record (its name RULED: brother Daniel)
// THE ALOUD NORMALISATION (the Audio Bible's rule: LORD → Lord, numerals in words, nothing spoken that is not on the card, "..." a breath)
const NUM = { 1: 'one', 2: 'two', 3: 'three' }, PROPER = ['god', 'lord', 'jesus', 'heaven', 'father', 'prayer'];
function aloud(s, { title = false } = {}) {
  let t = s;
  if (title && t === t.toUpperCase()) { t = t.toLowerCase().replace(/^./, c => c.toUpperCase()); for (const p of PROPER) t = t.replace(new RegExp(`\\b${p}\\b`, 'g'), p[0].toUpperCase() + p.slice(1)); } // the card's capitals read as words, not letters
  t = t.replace(/\bLORD'S\b/g, "Lord's").replace(/\bLORD\b/g, 'Lord');
  t = t.replace(/\brule (\d) or (\d)\b/g, (m, a, b) => `rule ${NUM[a]} or ${NUM[b]}`).replace(/\brule (\d)\b/g, (m, d) => `rule ${NUM[d]}`);
  t = t.replace(/^(\d)\.\s+/, (m, d) => NUM[d][0].toUpperCase() + NUM[d].slice(1) + '. '); // a list numeral spoken as its word
  return t;
}
const sentences = s => s.split(/(?<=[.!?])\s+(?=[A-Z])/); // the sentence split; "..." followed by a capital splits too — the breath is the gap
// THE LINES, in the card's order: block · the exact card text · the aloud text · the pre-gap (composed silence before) · the visual lead
const L = [];
const add = (name, block, cardText, pre, lead, extra = {}) => L.push({ name, block, card: cardText, text: aloud(cardText, { title: block === 'title' }), pre_s: pre, lead_s: lead, ...extra });
add('title', 'title', B.title, 0.8, 0.0);
B.rules.split('\n').forEach((r, i) => add(`r${i + 1}`, 'rules', r, 0.8, 0.25));
const noteLines = B.note.split('\n'); sentences(noteLines[0]).forEach((s, i, a) => add(`n${i + 1}`, 'note', s, i === 0 ? 1.2 : /\.\.\.$/.test(a[i - 1]) ? 0.45 : 0.6, 0.25));
add('also', 'note', noteLines[1], 1.0, 0.25);
add('dp', 'daily_prayer', B.daily_prayer, 0.9, 0.25, { slow: true });
add('turn', 'turn', B.turn, 1.4, 0.25);
L.push({ name: 'flip', silence: true, anchor: 'inv', hold_s: 1.8, direction: 'THE TURN: the card turns (one transform) after the turn line, before the invite' });
add('inv', 'invite', B.invite, 2.4, 0.25);
sentences(B.prayer).forEach((s, i) => add(s === 'Amen.' ? 'amen' : `p${i + 1}`, 'prayer', s, i === 0 ? 1.2 : s === 'Amen.' ? 0.9 : 0.6, 0.25, { slow: true }));
add('back', 'turn_back', B.turn_back, 1.8, 0.25);
L.push({ name: 'end', silence: true, anchor: 'credit', hold_s: 1.2, direction: 'THE END CARD: the card turns back to its front and rests; 3r4l.org and the credit arrive before the credit is spoken' });
L.push({ name: 'credit', block: 'credit', card: credit, text: credit.split(' · ').slice(0, 2).map(p => p[0].toUpperCase() + p.slice(1)).join('. ') + '. 3 R 4 L dot org.', pre_s: 2.6, lead_s: 0.0 }); // spoken at the end card; not a card line, never in the VTT's cues
L.forEach((l, i) => { l.beat = `b${i + 1}`; });
const voiced = L.filter(l => !l.silence); voiced.forEach((l, i) => { l.seg = `seg-${String(i).padStart(2, '0')}-${l.beat}`; });
const beatOf = Object.fromEntries(L.map(l => [l.name, l.beat.slice(1)]));
const VOICE = { voice_id: 'BuzrlCKSqvkbAqccvkin', model: 'eleven_multilingual_v2', settings: { stability: 0.72, similarity_boost: 0.85, style: 0.08, use_speaker_boost: true } };
const plan = { slug: '3r4l-card', template: '../projects/3r4l/film/job/card.template.html', built: '../projects/3r4l/film/build/card.html', mix_out: '../projects/3r4l-inputs/film/work/card-mix.m4a',
  segments_dir: '~/projects/3r4l-inputs/film/segments/trimmed', workdir: '~/projects/3r4l-inputs/film/work', bed: bedArg || '~/projects/3r4l-inputs/film/work/bed-silent.wav', intro_ms: 1600,
  mix: { bed_vol: 0.17, fade_in_s: 3, outro_alone_s: 1.5, fade_out_s: 6, apad_s: 3.5, loudnorm: LOUDNORM, target_lufs: -17.8 }, voice: VOICE,
  assembly: { beat_count: L.length, tail_s: 4.0, segments: voiced.map(l => ({ seg: l.seg, pre_s: l.pre_s, lead_s: l.lead_s })), extra_beats: L.filter(l => l.silence).map(l => ({ beat: l.beat, anchor: L.find(x => x.name === l.anchor).beat, hold_s: l.hold_s })) },
  takes: 'tts_segments.py writes the raw takes with --out ~/projects/3r4l-inputs/film/segments (both passes); film/trim-tails.mjs cuts their trailing silence into segments/trimmed = segments_dir, the dir assemble.py reads',
  meditate_rule: 'INVERTED for this film by the owner\'s word of 2026-10-08 (the card\'s exact words, animated): the paper IS the meditation and the words ARE the video — never cure it back to the ask films\' rule',
  pace: { default_speed: 1.0, prayer_speed: 0.9, prayer_beats: voiced.filter(l => l.slow).map(l => l.beat) } };
const narration = { format: 'kj-film-narration/1', slug: '3r4l-card', source: 'content/card.txt (every spoken word is a card word under the aloud normalisation) + sheet2.json film.credit',
  lines: L.map(l => l.silence ? { beat: l.beat, silence: true, direction: l.direction } : { beat: l.beat, text: l.text, card: l.card, block: l.block }) };
fs.mkdirSync(F('job/prayer-pass'), { recursive: true }); fs.mkdirSync(F('build'), { recursive: true });
fs.writeFileSync(F('job/plan.json'), JSON.stringify(plan, null, 1) + '\n'); fs.writeFileSync(F('job/narration.json'), JSON.stringify(narration, null, 1) + '\n');
fs.writeFileSync(F('job/lines.json'), JSON.stringify(voiced.map(l => ({ beat: l.beat, seg: l.seg, name: l.name, block: l.block, card: l.card, text: l.text, pre_s: l.pre_s, lead_s: l.lead_s, slow: !!l.slow })), null, 1) + '\n');
const slow = JSON.parse(JSON.stringify(plan)); slow.voice.settings.speed = plan.pace.prayer_speed; slow.pass = 'the prayer pass: speed 0.90 on the prayer beats only (run after deleting their segments)';
fs.writeFileSync(F('job/prayer-pass/plan.json'), JSON.stringify(slow, null, 1) + '\n'); fs.copyFileSync(F('job/narration.json'), F('job/prayer-pass/narration.json'));
// fonts.css — the site's own Source Serif 4 subsets (content/fonts) as data URIs: the built film makes no request
const FONTS = [['400', 'normal', 'source-serif-4-400.woff2'], ['400', 'italic', 'source-serif-4-400i.woff2'], ['500', 'normal', 'source-serif-4-500.woff2']];
fs.writeFileSync(F('job/fonts.css'), FONTS.map(([w, st, f]) => `@font-face{font-family:"Source Serif 4";font-style:${st};font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(R, 'content', 'fonts', f)).toString('base64')}) format("woff2");}`).join('\n') + '\n');
// THE TEMPLATE — the faces typeset from card.txt at the card's own line breaks; each spoken line a .speak span lit at its beat; the beat numbers folded into the src's @{name} tokens
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), span = l => `<span class="speak" data-b="${l.beat.slice(1)}">${esc(l.card)}</span>`, byName = n => L.find(l => l.name === n);
const front = `<p class="title">${span(byName('title'))}</p><p class="rules">${['r1', 'r2', 'r3'].map(n => span(byName(n))).join('<br>')}</p><p class="note">${L.filter(l => /^n\d$/.test(l.name)).map(span).join(' ')}</p><p class="note">${span(byName('also'))}</p><p class="daily_prayer">${span(byName('dp'))}</p><p class="turn">${span(byName('turn'))}</p>`;
const back = `<p class="invite">${span(byName('inv'))}</p><p class="prayer">${[...L.filter(l => /^p\d$/.test(l.name)), byName('amen')].map(span).join(' ')}</p><p class="turn_back">${span(byName('back'))}</p>`;
const [c1, c2, c3] = credit.split(' · ');
let tpl = fs.readFileSync(F('card.src.html'), 'utf8').replace(/@\{(\w+)\}/g, (m, n) => { if (!(n in beatOf)) throw new Error(`card.src.html: unknown beat token ${n}`); return beatOf[n]; });
tpl = tpl.replaceAll('__TITLE__', esc(B.title)).replace('__FRONT__', front).replace('__BACK__', back).replace('__CREDIT1__', esc(c1)).replace('__CREDIT2__', esc(c2)).replace('__WORDMARK__', esc(c3)).replace('__BEAT_COUNT__', String(L.length));
fs.writeFileSync(F('job/card.template.html'), tpl);
console.log(`job: ${voiced.length} spoken lines + ${L.length - voiced.length} composed beats = ${L.length} beats · ${voiced.reduce((n, l) => n + l.text.length, 0)} TTS characters · prayer beats ${plan.pace.prayer_beats.join(' ')} · bed ${plan.bed}`);
