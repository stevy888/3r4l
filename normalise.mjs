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
export function destLine(contact, labels) { // THE DESTINATION UNDER THE DOORS (owner 2026-10-14 'Do all recommendations'; the trust lens ×14): where each door goes, from his doors.txt — the handle, the number as E.164 spaced, the address; one quiet line; built here so the fence allowlists the very same text
  if (!contact || !contact.doors) return ''; const d = contact.doors, parts = [];
  const num = h => { const m = /(\+\d+)/.exec(decodeURIComponent(h)); if (!m) return ''; const n = m[1]; return n.length === 13 && n.startsWith('+63') ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}` : n; };
  if (d.messenger && d.messenger.href) parts.push(`${labels.messenger} @${d.messenger.href.replace(/^https:\/\/m\.me\//, '')}`);
  const nums = [['viber', labels.viber], ['text', labels.text], ['whatsapp', labels.whatsapp]].filter(([k]) => d[k] && d[k].href).map(([k, l]) => [l, num(d[k].href)]);
  const byNum = new Map(); for (const [l, n] of nums) { if (!n) continue; byNum.set(n, [...(byNum.get(n) || []), l]); } for (const [n, ls] of byNum) parts.push(`${ls.join(', ')} ${n}`);
  if (d.email && d.email.address) parts.push(`${labels.email} ${d.email.address}`);
  return parts.join(' · '); }
export default normalise;
