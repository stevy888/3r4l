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
// fill(s, vars) — THE ONE PLACEHOLDER FILL (phase 2 rung 1): a sheet2.json string shows its bracket placeholder on the preview until its input lands, then
// the same string filled: [controller] ← controller.txt · [the list vendor] ← signup.json vendor · [name] ← contact.json answerer · [m:ss] and [N] MB ← film.json.
// build.mjs fills with the inputs on disk; check-wording allowlists the raw string AND its filled form from the same inputs, so the two never disagree.
export function fill(s, v = {}) {
  return String(s).replace(/\[controller\]/g, m => v.controller || m).replace(/\[the (?:list )?vendor\]/g, m => v.vendor || m).replace(/\[name\]/g, m => v.name || m)
    .replace(/\[m:ss\]/g, m => v.length || m).replace(/\[N\] MB/g, m => (v.size_mb ? `${v.size_mb} MB` : m));
}
export default normalise;
