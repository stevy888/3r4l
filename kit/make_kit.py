#!/usr/bin/env python3
"""kit/make_kit.py — the paper door, zero-model (plan rung 2). Run with the repo's venv: .venv/bin/python kit/make_kit.py [--stamp-back] [--manual-only]
  kit.pdf      = Jeff's card (page 1 of /Users/aibrain/projects/3r4l-inputs/card-of-record.pdf) imposed N-up on A4 and US Letter with cut marks
                 (PyMuPDF show_pdf_page; card size = page.rect; margin 10 mm; cols/rows by floor on both orientations, the larger count wins;
                 cut marks 3 mm outside each cell). ACCEPTANCE PER CELL: page.get_text(clip=cell) normalised == card.txt normalised, every cell, both sizes.
  --stamp-back = kit/kit-stamped.pdf: a second sheet mirrored across the LONG edge so the QR and the string 3r4l.org land behind each front (offered, never required).
  manual.pdf   = kit/manual.html (and manual-tl.html when the pastor's check exists) rendered by ONE path: Chromium page.pdf({format:'A4'}) through @playwright/test.
  The card and the sheets are SKIPPED (not failed) while the card PDF is not on disk — the manual still renders."""
import json, os, re, subprocess, sys, unicodedata
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); INPUTS = '/Users/aibrain/projects/3r4l-inputs'
CARD = os.path.join(INPUTS, 'card-of-record.pdf'); CARD_TXT = os.path.join(R, 'content', 'card.txt'); DOCS = os.path.join(R, 'docs'); KIT = os.path.join(R, 'kit')
MM = 72 / 25.4; MARGIN = 10 * MM; MARK = 3 * MM; SIZES = {'A4': (595.276, 841.89), 'Letter': (612, 792)}

def normalise(s):  # the twin of normalise.mjs for the pdftotext side: NFKC, whitespace collapsed
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', s)).strip()

def card_text():
    t = open(CARD_TXT, encoding='utf-8').read()
    return normalise(' '.join(m.group(1) for m in re.finditer(r'^== \w+ ==\n([\s\S]*?)(?=\n== |$)', t, re.M)))

def impose(fitz, src, out_path, stamp=None):
    """N-up on A4 and Letter (one page per size; both orientations tried, the larger count wins). Returns [(size, n, cells)]."""
    card = src[0].rect; cw, ch = card.width, card.height; doc = fitz.open(); report = []
    for name, (W, H) in SIZES.items():
        best = None
        for (pw, ph) in ((W, H), (H, W)):
            cols, rows = int((pw - 2 * MARGIN) // cw), int((ph - 2 * MARGIN) // ch)
            if best is None or cols * rows > best[0]: best = (cols * rows, pw, ph, cols, rows)
        n, pw, ph, cols, rows = best
        if n == 0: raise SystemExit(f'{name}: the card ({cw:.0f}x{ch:.0f} pt) does not fit inside the margins')
        page = doc.new_page(width=pw, height=ph); cells = []
        x0 = (pw - cols * cw) / 2; y0 = (ph - rows * ch) / 2
        for r in range(rows):
            for c in range(cols):
                cell = fitz.Rect(x0 + c * cw, y0 + r * ch, x0 + (c + 1) * cw, y0 + (r + 1) * ch); cells.append(cell)
                page.show_pdf_page(cell, src, 0)
                for (x, y) in ((cell.x0, cell.y0), (cell.x1, cell.y0), (cell.x0, cell.y1), (cell.x1, cell.y1)):
                    page.draw_line((x - MARK - 2 * MM, y), (x - MARK, y), width=0.3) if x == cell.x0 else page.draw_line((x + MARK, y), (x + MARK + 2 * MM, y), width=0.3)
                    page.draw_line((x, y - MARK - 2 * MM), (x, y - MARK), width=0.3) if y == cell.y0 else page.draw_line((x, y + MARK), (x, y + MARK + 2 * MM), width=0.3)
        if stamp is not None:  # the back: mirrored across the LONG edge (duplex, long-edge flip) → mirror the columns when portrait, the rows when landscape
            back = doc.new_page(width=pw, height=ph); qr = fitz.open(stamp)
            for cell in cells:
                m = fitz.Rect(pw - cell.x1, cell.y0, pw - cell.x0, cell.y1) if ph >= pw else fitz.Rect(cell.x0, ph - cell.y1, cell.x1, ph - cell.y0)
                side = min(m.width, m.height) * 0.45; q = fitz.Rect(m.x0 + (m.width - side) / 2, m.y0 + (m.height - side) / 2 - 4 * MM, 0, 0); q.x1 = q.x0 + side; q.y1 = q.y0 + side
                back.show_pdf_page(q, qr, 0); back.insert_text((q.x0, q.y1 + 5 * MM), '3r4l.org', fontsize=10, fontname='helv')
        report.append((name, n, cells, page))
    doc.save(out_path); return report, doc

def main():
    import fitz
    args = sys.argv[1:]; os.makedirs(KIT, exist_ok=True)
    if '--manual-only' not in args and os.path.exists(CARD) and os.path.exists(CARD_TXT):
        src = fitz.open(CARD); want = card_text()
        report, doc = impose(fitz, src, os.path.join(DOCS, 'kit.pdf'))
        for name, n, cells, page in report:  # ACCEPTANCE PER CELL
            for i, cell in enumerate(cells):
                got = normalise(page.get_text('text', clip=cell))
                if got != want: raise SystemExit(f'kit.pdf {name} cell {i + 1}/{n}: text differs from card.txt')
            print(f'kit.pdf {name}: {n} cards, every cell == card.txt')
        if '--stamp-back' in args:
            qr_pdf = os.path.join(KIT, 'qr-3r4l-org.pdf'); fitz.open(os.path.join(KIT, 'qr-3r4l-org.svg')).convert_to_pdf() if False else None
            q = fitz.open(os.path.join(KIT, 'qr-3r4l-org.svg')); pdfbytes = q.convert_to_pdf(); open(qr_pdf, 'wb').write(pdfbytes)
            impose(fitz, src, os.path.join(KIT, 'kit-stamped.pdf'), stamp=qr_pdf); print('kit-stamped.pdf: the QR and 3r4l.org behind each front (long-edge duplex)')
    else:
        print('kit.pdf and card.pdf SKIPPED: no card-of-record.pdf / card.txt on disk (the owner sends the card)')
    # the manual: ONE path, Chromium page.pdf through @playwright/test (one page per language; the Tagalog only on the pastor's check)
    files = [os.path.join(KIT, 'manual.html')]
    if os.path.exists(os.path.join(KIT, 'manual-tl.html')) and os.path.exists(os.path.join(INPUTS, 'pastor-check.txt')): files.append(os.path.join(KIT, 'manual-tl.html'))
    js = ("import { chromium } from '@playwright/test'; import fs from 'node:fs'; const files = JSON.parse(process.argv[1]); const b = await chromium.launch(); const bufs = [];"
          "for (const f of files) { const p = await b.newPage(); await p.goto('file://' + f, { waitUntil: 'load' }); bufs.push(await p.pdf({ format: 'A4', printBackground: true })); await p.close(); }"
          "await b.close(); fs.writeFileSync(process.argv[2], bufs[0]); if (bufs.length > 1) fs.writeFileSync(process.argv[2].replace(/\\.pdf$/, '-tl.pdf'), bufs[1]); console.log('manual rendered: ' + files.length + ' page(s)');")
    out = os.path.join(KIT, 'manual.pdf')
    subprocess.run(['node', '--input-type=module', '-e', js, json.dumps(files), out], cwd=R, check=True)
    if len(files) > 1:  # merge into one manual.pdf, one page per language
        m = fitz.open(out); m.insert_pdf(fitz.open(out.replace('.pdf', '-tl.pdf'))); m.save(out + '.tmp'); os.replace(out + '.tmp', out); os.remove(out.replace('.pdf', '-tl.pdf'))
    d = fitz.open(out); print(f'manual.pdf: {len(d)} page(s)'); assert len(d) == len(files), 'the manual must be one page per language'

if __name__ == '__main__': main()
