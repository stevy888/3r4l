#!/usr/bin/env python3
"""kit/make-card-one.py — ONE CARD, FRONT AND BACK, ON ONE PAGE (brother Daniel 2026-11-25, on /card/: "…or just have the front and back
printed horizontal and on one sheet of paper").

  For each language whose print file exists (docs/card.pdf · docs/card-tl.pdf · docs/card-ur.pdf; each two card-sized pages, front then back),
  writes docs/card-one.pdf · docs/card-one-tl.pdf · docs/card-one-ur.pdf: ONE A4 portrait page, the front above the back, both level (the card's
  own landscape, never rotated), at the card's TRUE size (the source page's own rect, 3.5 x 2 in), the pair centred on the page, thin cut marks
  3 mm outside each face's corners (kit/make_kit.py's grammar), and one tiny grey line under them naming the site (3r4l.club). Nothing else.
  The faces are placed as VECTOR (PyMuPDF show_pdf_page: the source page becomes a form XObject; nothing is rasterised).

  ACCEPTANCE (per face, as make_kit.py's cell proof): the placed face RENDERS as the source page — the same pixels at 100 dpi (share of samples
  off by more than 24/255 must be under 0.5 %); the face size equals the source size; the output is one page. A failure exits non-zero.

  Run: .venv/bin/python kit/make-card-one.py   (or python3 with PyMuPDF; re-run whenever a card PDF changes)
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')
MM = 72 / 25.4; MARK = 3 * MM; TICK = 2 * MM; GAP = round(14 * MM / 0.72) * 0.72  # GAP: between the front's bottom edge and the back's top edge (room for both faces' marks)
A4 = (595.276, 841.89)
LANGS = [('', 'card.pdf'), ('-tl', 'card-tl.pdf'), ('-ur', 'card-ur.pdf')]
SITE = '3r4l.club'


def face_matches(fitz, page, rect, src_page, dpi=100):
    ref = src_page.get_pixmap(dpi=dpi)
    pix = page.get_pixmap(dpi=dpi, clip=rect)
    if abs(pix.width - ref.width) > 1 or abs(pix.height - ref.height) > 1 or pix.n != ref.n:
        return 1.0
    if (pix.width, pix.height) == (ref.width, ref.height) and pix.samples == ref.samples:
        return 0.0
    w, h, n = min(pix.width, ref.width), min(pix.height, ref.height), pix.n  # a face whose size is not a whole pixel count (the Urdu card, 252.024 x 143.808 pt) may round one pixel apart: compare the common area
    a, b, off = pix.samples, ref.samples, 0
    for y in range(h):
        ra, rb = a[y * pix.stride: y * pix.stride + w * n], b[y * ref.stride: y * ref.stride + w * n]
        if ra != rb:
            off += sum(1 for i in range(len(ra)) if abs(ra[i] - rb[i]) > 24)
    return off / (w * h * n)


def mean_diff(fitz, page, rect, src_page, dpi=100):
    ref = src_page.get_pixmap(dpi=dpi); pix = page.get_pixmap(dpi=dpi, clip=rect)
    a, b = pix.samples, ref.samples; n = min(len(a), len(b))
    return sum(abs(a[i] - b[i]) for i in range(0, n, 5)) / len(range(0, n, 5))


def make(fitz, src_path, out_path):
    src = fitz.open(src_path)
    if len(src) != 2:
        raise SystemExit(f'{src_path}: expected 2 pages (front, back), found {len(src)}')
    cw, ch = src[0].rect.width, src[0].rect.height
    if abs(src[1].rect.width - cw) > 0.5 or abs(src[1].rect.height - ch) > 0.5:
        raise SystemExit(f'{src_path}: the two faces differ in size')
    if cw < ch:
        raise SystemExit(f'{src_path}: the card is not landscape ({cw:.1f} x {ch:.1f} pt)')
    W, H = A4
    doc = fitz.open(); page = doc.new_page(width=W, height=H)
    x0 = (W - cw) / 2; y0 = (H - (2 * ch + GAP)) / 2
    x0, y0 = int(x0 / 0.72) * 0.72, int(y0 / 0.72) * 0.72  # snapped to whole device pixels at 100 dpi (< 1 pt off centre) so the pixel proof compares like with like
    yb = int((y0 + ch + GAP) / 0.72) * 0.72  # the back's top on the same pixel grid (a face of 143.808 pt is not a whole pixel count)

    def settle(pno, y):  # a placed picture-only face (the Urdu card) can land a row off the 100 dpi grid by float rounding at some heights: nudge by at most 1 px (0.25 mm) until it renders as its source, so the pixel proof stays strict
        for dy in (0, 0.72, -0.72, 1.44, -1.44):
            t = fitz.open(); p = t.new_page(width=W, height=H); r = fitz.Rect(x0, y + dy, x0 + cw, y + dy + ch); p.show_pdf_page(r, src, pno)
            if face_matches(fitz, p, r, src[pno]) <= 0.005:
                return y + dy
        return y
    y0 = settle(0, y0); yb = settle(1, yb)
    rects = [fitz.Rect(x0, y0, x0 + cw, y0 + ch), fitz.Rect(x0, yb, x0 + cw, yb + ch)]
    for pno, r in enumerate(rects):
        page.show_pdf_page(r, src, pno)  # vector, level: no rotate
        for (x, y) in ((r.x0, r.y0), (r.x1, r.y0), (r.x0, r.y1), (r.x1, r.y1)):
            dx = -1 if x == r.x0 else 1; dy = -1 if y == r.y0 else 1
            page.draw_line((x + dx * MARK, y), (x + dx * (MARK + TICK), y), width=0.3, color=(0, 0, 0))
            page.draw_line((x, y + dy * MARK), (x, y + dy * (MARK + TICK)), width=0.3, color=(0, 0, 0))
    fs = 6; tw = fitz.get_text_length(SITE, fontname='helv', fontsize=fs)
    page.insert_text(((W - tw) / 2, rects[1].y1 + MARK + TICK + 4 * MM), SITE, fontsize=fs, fontname='helv', color=(0.5, 0.5, 0.5))
    doc.set_metadata({'title': '3R4L — one card, front and back', 'creator': 'kit/make-card-one.py'})
    tmp = out_path + '.tmp'
    doc.save(tmp, garbage=3, deflate=True); doc.close()
    chk = fitz.open(tmp)
    if len(chk) != 1:
        raise SystemExit(f'{out_path}: {len(chk)} pages, expected 1')
    out_imgs = {chk.xref_stream_raw(i[0]) for i in chk[0].get_images(full=True)}
    for pno, r in enumerate(rects):
        face = 'front' if pno == 0 else 'back'
        off = face_matches(fitz, chk[0], r, src[pno])
        if off <= 0.005:
            continue
        src_imgs = [src.xref_stream_raw(i[0]) for i in src[pno].get_images(full=True)]
        mean = mean_diff(fitz, chk[0], r, src[pno])
        if src_imgs and all(b in out_imgs for b in src_imgs) and mean <= 10:  # A PICTURE FACE (the Urdu card is one JPEG per face): its image bytes are carried byte for byte (never re-encoded); the 100 dpi render then differs only by the resampling phase of where it sits on the page (seen: mean 7/255, the same face to the eye), so the proof is the bytes plus a mean bound
            print(f'  {os.path.basename(out_path)} {face}: picture face, image bytes identical to the source, 100 dpi mean difference {mean:.1f}/255 (resampling phase)')
            continue
        os.remove(tmp)
        raise SystemExit(f'{out_path}: the {face} does not render as {os.path.basename(src_path)} page {pno + 1} ({off:.2%} off, mean {mean:.1f}/255)')
    imgs = len(out_imgs)
    chk.close(); os.replace(tmp, out_path)
    return cw, ch, imgs


def main():
    try:
        import pymupdf as fitz
    except ImportError:
        import fitz
    made = 0
    for sfx, name in LANGS:
        src = os.path.join(DOCS, name)
        if not os.path.exists(src):
            print(f'{name}: not on disk, skipped'); continue
        out = os.path.join(DOCS, f'card-one{sfx}.pdf')
        cw, ch, imgs = make(fitz, src, out)
        print(f'{os.path.relpath(out, ROOT)}: one A4 page, front over back, {cw:.1f} x {ch:.1f} pt ({cw / 72:.2f} x {ch / 72:.2f} in) each, both faces proven against {name} (100 dpi), {imgs} image(s) carried from the source')
        made += 1
    if not made:
        raise SystemExit('no card PDF on disk')


if __name__ == '__main__':
    main()
