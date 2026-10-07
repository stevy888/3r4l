#!/usr/bin/env python3
"""kit/make_kit.py — the paper door, zero-model (plan rung 2). Run with the repo's venv: .venv/bin/python kit/make_kit.py [--publish] [--manual-only]
  kit.pdf      = Jeff's card (BOTH faces of /Users/aibrain/projects/3r4l-inputs/card-of-record.pdf — the card is printed on both sides, 2026-10-07)
                 imposed N-up on A4 and US Letter with cut marks: per paper size a FRONT sheet then a BACK sheet on the same centred grid, so a
                 long-edge duplex print lands each back behind its front (PyMuPDF show_pdf_page; card size = page.rect; margin 10 mm; cols/rows by
                 floor on both orientations, the larger count wins; cut marks 3 mm outside each cell).
                 ACCEPTANCE PER CELL: page.get_text(clip=cell) normalised == that face's own text normalised, every cell, both faces, both sizes;
                 and the two faces' text joined, normalised == card.txt normalised (the kit prints exactly the wording of record).
  WHERE IT LANDS: /Users/aibrain/projects/3r4l-inputs/kit/kit.pdf — PRIVATE until Jeff's yes (the repo is public: nothing of the card is committed
                 or served before his yes in his name; the doors in build.mjs appear only when docs/card.pdf AND docs/kit.pdf exist).
  --publish    = Jeff's yes recorded in INPUTS.md: copies card-of-record.pdf → docs/card.pdf and kit.pdf → docs/kit.pdf (then `node build.mjs` adds the doors).
  --stamp-back = RETIRED 2026-10-07: the card has a printed back, so there is no blank side for a QR; the QR files and the-address.txt go into the
                 card's own design on Jeff's next print run (the manual says so).
  manual.pdf   = kit/manual.html (and manual-tl.html when the pastor's check exists) rendered by ONE path: Chromium page.pdf({format:'A4'}) through @playwright/test.
  The card and the sheets are SKIPPED (not failed) while the card PDF is not on disk — the manual still renders."""
import json, os, re, shutil, subprocess, sys, unicodedata
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); INPUTS = '/Users/aibrain/projects/3r4l-inputs'
CARD = os.path.join(INPUTS, 'card-of-record.pdf'); CARD_TXT = os.path.join(R, 'content', 'card.txt'); DOCS = os.path.join(R, 'docs'); KIT = os.path.join(R, 'kit')
PRIVATE = os.path.join(INPUTS, 'kit'); KIT_PDF = os.path.join(PRIVATE, 'kit.pdf')
MM = 72 / 25.4; MARGIN = 10 * MM; MARK = 3 * MM; SIZES = {'A4': (595.276, 841.89), 'Letter': (612, 792)}

def normalise(s):  # the twin of normalise.mjs for the pdftotext side: NFKC, whitespace collapsed
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', s)).strip()

def card_text():
    t = open(CARD_TXT, encoding='utf-8').read()
    return normalise(' '.join(m.group(1) for m in re.finditer(r'^== \w+ ==\n([\s\S]*?)(?=\n== \w+ ==\n|(?![\s\S]))', t, re.M)))  # a block ends at the next header or EOF, never at a line end (the plan's `$` under re.M cut each block to its first line)

def cell_matches(page, cell, ref, dpi=100):
    """A cell is accepted when it RENDERS as the card's face: the same pixels at 100 dpi (Jeff's print file draws every word twice — a stroke layer
    under the fill, in Illustrator object order — so text extraction of a face comes doubled and split differently per layer; the wording proof is
    pdftotext == card.txt below, the imposition proof is this pixel compare). Returns the share of samples that differ by more than 24/255."""
    pix = page.get_pixmap(dpi=dpi, clip=cell)
    if (pix.width, pix.height) != (ref.width, ref.height): return 1.0
    if pix.samples == ref.samples: return 0.0
    a, b = pix.samples, ref.samples; return sum(1 for i in range(len(a)) if abs(a[i] - b[i]) > 24) / len(a)

def impose(fitz, src, out_path):
    """Per paper size: one sheet per face of the card, N-up on the same centred grid (both orientations tried, the larger count wins). Returns [(size, face, pno, n, cells, page)]."""
    doc = fitz.open(); report = []
    for name, (W, H) in SIZES.items():
        for pno in range(len(src)):
            card = src[pno].rect; cw, ch = card.width, card.height
            if pno and (round(cw) != round(src[0].rect.width) or round(ch) != round(src[0].rect.height)): raise SystemExit('the card faces differ in size')
            best = None
            for (pw, ph) in ((W, H), (H, W)):
                cols, rows = int((pw - 2 * MARGIN) // cw), int((ph - 2 * MARGIN) // ch)
                if best is None or cols * rows > best[0]: best = (cols * rows, pw, ph, cols, rows)
            n, pw, ph, cols, rows = best
            if n == 0: raise SystemExit(f'{name}: the card ({cw:.0f}x{ch:.0f} pt) does not fit inside the margins')
            page = doc.new_page(width=pw, height=ph); cells = []
            x0 = (pw - cols * cw) / 2; y0 = (ph - rows * ch) / 2
            x0, y0 = int(x0 / 0.72) * 0.72, int(y0 / 0.72) * 0.72  # the grid origin snapped to whole device pixels at 100 dpi (< 1 pt off centre) so the pixel proof compares like with like; the card is 350 × 200 px there, so every cell stays aligned
            for r in range(rows):
                for c in range(cols):
                    cell = fitz.Rect(x0 + c * cw, y0 + r * ch, x0 + (c + 1) * cw, y0 + (r + 1) * ch); cells.append(cell)
                    page.show_pdf_page(cell, src, pno)
                    for (x, y) in ((cell.x0, cell.y0), (cell.x1, cell.y0), (cell.x0, cell.y1), (cell.x1, cell.y1)):
                        page.draw_line((x - MARK - 2 * MM, y), (x - MARK, y), width=0.3) if x == cell.x0 else page.draw_line((x + MARK, y), (x + MARK + 2 * MM, y), width=0.3)
                        page.draw_line((x, y - MARK - 2 * MM), (x, y - MARK), width=0.3) if y == cell.y0 else page.draw_line((x, y + MARK), (x, y + MARK + 2 * MM), width=0.3)
            report.append((name, 'front' if pno == 0 else 'back', pno, n, cells, len(doc) - 1))  # the sheet's NUMBER: a Page handle dies at the next new_page
    doc.save(out_path); return report, doc

def main():
    import fitz
    args = sys.argv[1:]; os.makedirs(KIT, exist_ok=True)
    if '--stamp-back' in args: print('--stamp-back RETIRED: the card has a printed back; the QR files and the-address.txt go into the card\'s own design on the next run')
    if '--manual-only' not in args and os.path.exists(CARD) and os.path.exists(CARD_TXT):
        os.makedirs(PRIVATE, exist_ok=True); src = fitz.open(CARD); want = card_text()
        pdf_text = subprocess.run(['pdftotext', '-layout', CARD, '-'], capture_output=True, text=True, check=True).stdout  # THE WORDING PROOF (the plan's tool)
        if normalise(pdf_text) != want: raise SystemExit('pdftotext of the card differs from card.txt')
        report, doc = impose(fitz, src, KIT_PDF); refs = [src[p].get_pixmap(dpi=100) for p in range(len(src))]
        for name, face, pno, n, cells, sheet in report:  # ACCEPTANCE PER CELL: the pixel compare against the card's own face
            worst = 0.0; page = doc[sheet]
            for i, cell in enumerate(cells):
                d = cell_matches(page, cell, refs[pno]); worst = max(worst, d)
                if d > 0.005: raise SystemExit(f'kit.pdf {name} {face} cell {i + 1}/{n}: renders unlike the card\'s {face} ({d:.3%} of samples differ)')
            print(f'kit.pdf {name} {face}: {n} cards, every cell renders as the card\'s {face} (worst cell {worst:.3%} differing samples); the card\'s text == card.txt')
        print(f'kit.pdf: {len(doc)} sheets at {KIT_PDF} (private until Jeff\'s yes)')
        if '--publish' in args:  # Jeff's yes, recorded in INPUTS.md first
            if not re.search(r'^- jeff_yes_to_download: YES', open(os.path.join(INPUTS, 'INPUTS.md'), encoding='utf-8').read(), re.M): raise SystemExit('--publish needs the line "- jeff_yes_to_download: YES …" in INPUTS.md')
            shutil.copyfile(CARD, os.path.join(DOCS, 'card.pdf')); shutil.copyfile(KIT_PDF, os.path.join(DOCS, 'kit.pdf')); print('published: docs/card.pdf and docs/kit.pdf (now run node build.mjs for the doors)')
    else:
        print('kit.pdf SKIPPED: no card-of-record.pdf / card.txt on disk (the owner sends the card)')
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
