// normalise.mjs — THE ONE normaliser (plan §2): entities decoded, NFC, whitespace collapsed; NFKC on the pdftotext side.
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', mdash: '—', ndash: '–' };
export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return e.toLowerCase() in ENT ? ENT[e.toLowerCase()] : m;
  });
}
export function normalise(s, form = 'NFC') {
  return decodeEntities(s).normalize(form).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();
}
export function normalisePdf(s) { return normalise(s, 'NFKC'); }
export default normalise;
