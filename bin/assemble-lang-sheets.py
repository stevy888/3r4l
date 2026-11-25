#!/usr/bin/env python3
"""assemble-lang-sheets.py <lang> <final.json>  (2026-11-25, the Tagalog + Urdu pass)
Turns the judged translation (key -> string, the keys of the English source: sheet.* and sheet2.<group>.<key>) into
content/sheet-<lang>.json and content/sheet2-<lang>.json in the English sheets' own shapes. Every sheet2 row is status
'DRAFT' (served only when the language is lit: its reader's check file, or the owner's --langs-unchecked word) and keeps
its English source under _en. Rows never translated (the sign-up, the mails, the per-language print labels) are 'absent'."""
import json, os, re, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); C = lambda p: os.path.join(R, 'content', p)
lang, src = sys.argv[1], json.load(open(sys.argv[2], encoding='utf-8'))
ADDR = ('3r4l.org', 'stevy888.github.io/3r4l')
en, en2 = json.load(open(C('sheet.json'))), json.load(open(C('sheet2.json')))
W = f'2026-11-25 two pens (Fable 5.2, Opus 5.5) + blind back-translation + Fable 5.2 judge; DRAFT until the {lang} reader\'s check'
g = lambda k: src[k]
s = {'_note': f'THE {lang.upper()} SHEET ({W}). Built by bin/assemble-lang-sheets.py from the judged file; the English of each line is sheet.json.',
     'h1_lines': [g('sheet.h1_lines.0'), g('sheet.h1_lines.1'), g('sheet.h1_lines.2')], 'h2': g('sheet.h2'),
     'lines': [g(f'sheet.lines.{i}') for i in range(len(en['lines']))], 'whatnext_link': g('sheet.whatnext_link'), 'whatnext_clause': g('sheet.whatnext_clause'), 'labels': {}}
s['h1'] = ' '.join(s['h1_lines'])
for k, v in en['labels'].items():
    if k.startswith('_'): continue
    s['labels'][k] = src.get(f'sheet.labels.{k}', v if k in ('messenger', 'viber', 'whatsapp') else '')
s['labels']['title_whatnext_suffix'] = ' — ' + s['whatnext_link']; s['labels']['lang_link'] = ''
s['placeholder'] = {'card': ''}
# the beats: the middle word of line 1 and the verb of lines 2 and 3, found in this language's own words
def beat(i, word, nth=1): return {'line': i, 'word': word, 'nth': nth}
w0 = re.findall(r'[\w؀-ۿ]+', s['h1_lines'][0]); w1 = re.findall(r'[\w؀-ۿ]+', s['h1_lines'][1]); w2 = re.findall(r'[\w؀-ۿ]+', s['h1_lines'][2])
s['h1_beats'] = []
if len(w0) >= 2 and w0.count(w0[0].lower()) + w0.count(w0[0]) >= 1: s['h1_beats'].append(beat(0, w0[1], 1 if w0[1] != w0[0] else 2))
json.dump(s, open(C(f'sheet-{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
s2 = {'_note': f'THE {lang.upper()} PHASE 2 STRINGS ({W}). Built by bin/assemble-lang-sheets.py; each row keeps its English under _en.'}
for grp, rows in en2.items():
    if grp.startswith('_') or not isinstance(rows, dict): continue
    s2[grp] = {}
    for k, r in rows.items():
        if k.startswith('_') or not isinstance(r, dict): continue
        key = f'sheet2.{grp}.{k}'
        if key in src and src[key]:
            t = src[key].replace(*ADDR) if k == 'source' else src[key]
            s2[grp][k] = {'text': t, 'status': 'DRAFT', 'written': W, '_en': r.get('text', '')}
        else: s2[grp][k] = {'text': '', 'status': 'absent', '_en': r.get('text', '')}
json.dump(s2, open(C(f'sheet2-{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'sheet-{lang}.json + sheet2-{lang}.json:', sum(1 for gr in s2.values() if isinstance(gr, dict) for r in gr.values() if r.get('status') == 'DRAFT'), 'rows; beats', s['h1_beats'])
