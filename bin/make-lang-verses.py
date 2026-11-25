#!/usr/bin/env python3
"""make-lang-verses.py <urdoucv-usfm-dir>  (2026-11-25, the Tagalog + Urdu pass)
Writes, from texts of record only (no verse is ever translated by us):
  content/help.json      - the six verses of /contact/ ('How are you doing?'): KJV (getbible kjv) + Tagalog (getbible tagalog, ADB 1905)
  content/tl-cache/      - any missing Tagalog chapter, the raw getbible v2 json (same shape as the forty's cache)
  content/ur-verses.json - every forty + help verse in Biblica Open Urdu Contemporary Version (CC BY-SA 4.0), cut from its USFM
                           (\\v text only: \\d titles, \\s heads, notes and cross-refs dropped), its reference in Urdu digits.
Run: python3 -I bin/make-lang-verses.py /path/to/urdoucv_usfm_dir"""
import json, os, re, sys, urllib.request
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); C = lambda p: os.path.join(R, 'content', p)
CODES = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split()
HELP = {'low': ['Psalm 34:18', 'Isaiah 41:10', '1 Peter 5:7'], 'well': ['1 Thessalonians 5:18', 'Psalm 103:2', 'Psalm 118:24']}
LORD = {'Psalm 34:18', 'Psalm 103:2', 'Psalm 118:24'}  # each verse's Lord is YHWH in the Hebrew: the KJV prints LORD
UD = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
books = json.load(open(C('books.json')))
def parse(ref):
    m = re.match(r'^(.+?) (\d+):(\d+)(?:-(\d+))?$', ref); b, ch, a = m.group(1), int(m.group(2)), int(m.group(3)); return b, ch, a, int(m.group(4) or a)
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'verse-cache/1'}), timeout=60) as r: return json.load(r)
def chapter(tr, nr, ch, cache=None):
    if cache and os.path.exists(cache): return json.load(open(cache, encoding='utf-8'))
    j = get(f'https://api.getbible.net/v2/{tr}/{nr}/{ch}.json')
    if cache: open(cache, 'w', encoding='utf-8').write(json.dumps(j, ensure_ascii=False, indent=4) + '\n')
    return j
def pick(j, a, b, ref):
    out = []
    for v in range(a, b + 1):
        row = next((x for x in j['verses'] if x['verse'] == v), None)
        if not row: raise SystemExit(f'{ref}: verse {v} missing')
        out.append(re.sub(r'\s+', ' ', row['text']).strip())
    return out
# 1. help.json: English + Tagalog
help_rows = []
for door, refs in HELP.items():
    for ref in refs:
        b, ch, a, z = parse(ref); nr = books['books'][b]['nr']
        en = pick(chapter('kjv', nr, ch), a, z, ref)
        if ref in LORD: en = [re.sub(r'\bLord\b', 'LORD', x) for x in en]  # getbible's kjv drops the KJV's small-capital LORD (YHWH); the forty's KJ rows keep it
        tlj = chapter('tagalog', nr, ch, C(f'tl-cache/{nr}-{ch}.json')); tl = pick(tlj, a, z, ref)
        if not books['books'][b].get('tl'): raise SystemExit(f'books.json: no Tagalog name for {b}')
        help_rows.append({'door': door, 'ref': ref, 'parts': en, 'text': ' '.join(en), 'translation_name': 'King James Version', 'source': 'api.getbible.net v2 kjv',
                          'ref_tl': f"{books['books'][b]['tl']} {ch}:{a}{'-' + str(z) if z > a else ''}", 'text_tl': '\n'.join(tl), 'translation_tl': 'Ang Dating Biblia (1905)'})
json.dump({'_note': "THE SIX VERSES OF 'How are you doing?' (/contact/, 2026-11-25, brother Daniel's two questions). Texts of record only: KJV and Ang Dating Biblia 1905 through api.getbible.net v2 (public domain); Urdu in ur-verses.json. Made by bin/make-lang-verses.py.", 'rows': help_rows},
          open(C('help.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# 2. ur-verses.json from the Urdu USFM
U = sys.argv[1]; files = {f[3:6]: os.path.join(U, f) for f in os.listdir(U) if f.endswith('.usfm')}
def usfm_verses(code):
    t = open(files[code], encoding='utf-8').read()
    t = re.sub(r'\\f .*?\\f\*', '', t, flags=re.S); t = re.sub(r'\\x .*?\\x\*', '', t, flags=re.S)
    t = re.sub(r'\\w ([^|\\]*)(\|[^\\]*)?\\w\*', r'\1', t)
    ch, v, out, name = 0, None, {}, None
    for line in t.split('\n'):
        m = re.match(r'\\(\w+\d?)\s?(.*)$', line.strip())
        if not m: 
            if v and line.strip(): out[(ch, v)] += ' ' + line.strip()
            continue
        tag, rest = m.group(1), m.group(2)
        if tag == 'toc2': name = rest.strip()
        elif tag == 'c': ch, v = int(rest.split()[0]), None
        elif tag == 'v':
            mm = re.match(r'(\d+)(?:-(\d+))?\s*(.*)$', rest); v = (int(mm.group(1)), int(mm.group(2) or mm.group(1))); out[(ch, v)] = mm.group(3)
        elif tag in ('d', 's', 's1', 's2', 'ms', 'mr', 'r', 'sp', 'cl', 'h', 'toc1', 'toc3', 'mt', 'mt1', 'mt2', 'id', 'ide', 'rem', 'sr', 'qa'): 
            if tag in ('d', 's', 's1', 's2', 'ms', 'r', 'sp', 'qa'): v = v if tag not in ('d',) else v
            if tag in ('s', 's1', 's2', 'ms', 'r', 'sp', 'd', 'qa'): pass
            continue
        else:
            if v: out[(ch, v)] += ' ' + rest
    clean = {k: re.sub(r'\\[a-z]+\d?\*?', '', re.sub(r'\s+', ' ', s)).strip() for k, s in out.items()}
    return name, clean
cache = {}
ur = {}
for ref in [x['ref'] for x in json.load(open(C('verses.json')))] + [r for rs in HELP.values() for r in rs]:
    b, ch, a, z = parse(ref); code = CODES[books['books'][b]['nr'] - 1]
    if code not in cache: cache[code] = usfm_verses(code)
    name, vs = cache[code]; parts = []
    for n in range(a, z + 1):
        k = next((k for k in vs if k[0] == ch and k[1][0] <= n <= k[1][1]), None)
        if not k: raise SystemExit(f'ur {ref}: verse {n} missing')
        if not parts or parts[-1] != vs[k]: parts.append(vs[k])
    ur[ref] = {'ref_ur': f"{name} {ch}:{a}{'-' + str(z) if z > a else ''}".translate(UD), 'text_ur': '\n'.join(parts)}
json.dump({'_note': "Every verse of the forty and the help panel in Biblica Open Urdu Contemporary Version (Biblica® آزادانہ اردو ہم عصر ترجمہ™), CC BY-SA 4.0, copyright 1999, 2005, 2022, 2024 Biblica, Inc.; cut unchanged from ebible.org's urdoucv USFM by bin/make-lang-verses.py (2026-11-25). Chosen over the Urdu Geo Version because it says خدا and یسوع as brother Daniel's Urdu card does.",
           'translation_ur': 'آزادانہ اردو ہم عصر ترجمہ', 'notice_ur': 'Biblica® Open Urdu Contemporary Version™ · Copyright © 1999, 2005, 2022, 2024 by Biblica, Inc. · CC BY-SA 4.0 · open.bible', 'verses': ur},
          open(C('ur-verses.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('help.json', len(help_rows), 'rows · ur-verses.json', len(ur), 'verses')
