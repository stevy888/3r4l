#!/usr/bin/env node
// prove-card.mjs — THE WORDING PROOF (plan rung 1): normalise(pdftotext -layout card-of-record.pdf) == normalise(content/card.txt, its blocks joined).
// Usage: pdftotext -layout /Users/aibrain/projects/3r4l-inputs/card-of-record.pdf - | node prove-card.mjs   → EQUAL (rc 0) or DIFF with both strings (rc 1).
// Banked from seat build-3r4l-1007g (2026-10-07): this proof caught the block-regex defect (a block cut to its first line) before anything served.
import fs from 'node:fs'; import path from 'node:path';
const R = path.dirname(new URL(import.meta.url).pathname), { normalise, normalisePdf } = await import(path.join(R, 'normalise.mjs'));
const pdf = normalisePdf(fs.readFileSync(0, 'utf8')), t = fs.readFileSync(path.join(R, 'content', 'card.txt'), 'utf8');
const txt = normalise([...t.matchAll(/^== \w+ ==\n([\s\S]*?)(?=\n== \w+ ==\n|(?![\s\S]))/gm)].map(m => m[1]).join(' '));
console.log(pdf === txt ? `EQUAL (${txt.length} chars, ${txt.split(' ').length} words)` : 'DIFF'); if (pdf !== txt) { console.log('PDF:', pdf); console.log('TXT:', txt); process.exit(1); }
