#!/usr/bin/env python3
"""make-lang-kit.py <front.webp|png> <back.webp|png> <out.pdf>  (2026-11-25, the Tagalog + Urdu pass; run with .venv/bin/python)
The sheet of cards for a language whose card exists as printed faces: the kit.pdf page map of record —
A4 pages 1-2 (10 a sheet) · Letter / short bond 3-4 (10) · long bond 8.5 x 13 in 5-6 (12) — each a FRONT then a BACK
on the same centred grid (a long-edge duplex lands each back behind its front), 3.5 x 2 in cells, cut marks 3 mm
outside each cell. Each face is embedded ONCE and placed N times (PyMuPDF xref reuse) so the file stays small."""
import sys, pymupdf
fp, bp, out = sys.argv[1:4]
PT = 72; CW, CH = 3.5 * PT, 2 * PT; MM = PT / 25.4; MARK, LEN = 3 * MM, 5 * MM
PAPERS = [(595.276, 841.89, 2, 5), (612, 792, 2, 5), (612, 936, 2, 6)]
doc = pymupdf.open(); xref = {}
for W, H, cols, rows in PAPERS:
    x0, y0 = (W - cols * CW) / 2, (H - rows * CH) / 2
    for face, src in (('front', fp), ('back', bp)):
        pg = doc.new_page(width=W, height=H)
        for r in range(rows):
            for c in range(cols):
                rect = pymupdf.Rect(x0 + c * CW, y0 + r * CH, x0 + (c + 1) * CW, y0 + (r + 1) * CH)
                if face in xref: pg.insert_image(rect, xref=xref[face])
                else: xref[face] = pg.insert_image(rect, filename=src)
        xs = [x0 + c * CW for c in range(cols + 1)]; ys = [y0 + r * CH for r in range(rows + 1)]
        for x in xs:
            pg.draw_line((x, y0 - MARK - LEN), (x, y0 - MARK), width=0.5); pg.draw_line((x, ys[-1] + MARK), (x, ys[-1] + MARK + LEN), width=0.5)
        for y in ys:
            pg.draw_line((x0 - MARK - LEN, y), (x0 - MARK, y), width=0.5); pg.draw_line((xs[-1] + MARK, y), (xs[-1] + MARK + LEN, y), width=0.5)
doc.save(out, garbage=4, deflate=True); print(out, len(doc), 'pages')
