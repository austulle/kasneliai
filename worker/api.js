// Kąsneliai site worker: static files (FILES, generated) + waitlist API on D1 (binding DB).
const STAGES = new Set(['started', '1m', '2-3m', 'later']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v, n = 120) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/^[=+\-@]+/, '').slice(0, n);
const COLS = ['id', 'created_at', 'email', 'stage', 'tester', 'form', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'country'];
const bin = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

async function subscribe(request, env) {
  let d; try { d = await request.json(); } catch { return json({ ok: false }, 400); }
  if (d && d.website) return json({ ok: true });
  const email = String(d?.email ?? '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return json({ ok: false, error: 'email' }, 422);
  const u = (d.utm && typeof d.utm === 'object') ? d.utm : {};
  await env.DB.prepare(`INSERT INTO signups (created_at,email,stage,tester,form,utm_source,utm_medium,utm_campaign,utm_content,utm_term,fbclid,gclid,country)
    VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`).bind(
    new Date().toISOString(), email, STAGES.has(d.stage) ? d.stage : '', d.tester ? 1 : 0, clean(d.form, 20),
    clean(u.utm_source), clean(u.utm_medium), clean(u.utm_campaign), clean(u.utm_content), clean(u.utm_term),
    clean(u.fbclid, 200), clean(u.gclid, 200), clean(request.cf?.country, 4)).run();
  return json({ ok: true });
}

async function exportCsv(url, env) {
  if (!env.EXPORT_KEY || url.searchParams.get('key') !== env.EXPORT_KEY) return new Response('Not found', { status: 404 });
  const { results } = await env.DB.prepare('SELECT * FROM signups ORDER BY id').all();
  const esc = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = '﻿' + [COLS.join(','), ...results.map(r => COLS.map(c => esc(r[c])).join(','))].join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="kasneliai-laukiantieji.csv"', 'cache-control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/api/subscribe') return request.method === 'POST' ? subscribe(request, env) : json({ ok: false }, 405);
    if (url.pathname === '/api/export') return exportCsv(url, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    const f = FILES[path];
    if (!f) return new Response('Puslapis nerastas', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    const isImg = path.startsWith('/img/');
    return new Response(request.method === 'HEAD' ? null : bin(f[1]), { headers: {
      'content-type': f[0], 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin',
      'cache-control': isImg ? 'public, max-age=2592000' : 'public, max-age=300' } });
  }
};
