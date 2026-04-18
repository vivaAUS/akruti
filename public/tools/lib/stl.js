import { trisBounds } from './geom.js';

export function downloadSTL(tris, filename, { bedSize = null } = {}) {
  if (!tris || tris.length === 0) {
    console.warn('downloadSTL: empty tri list');
    return { ok: false, reason: 'empty' };
  }

  let warning = null;
  if (bedSize) {
    const b = trisBounds(tris);
    if (b) {
      const bs = typeof bedSize === 'number' ? { x: bedSize, y: bedSize, z: bedSize } : bedSize;
      const [sx, sy, sz] = b.size;
      const over = [];
      if (sx > bs.x) over.push(`X ${sx.toFixed(1)} > ${bs.x}`);
      if (sy > bs.y) over.push(`Y ${sy.toFixed(1)} > ${bs.y}`);
      if (sz > bs.z) over.push(`Z ${sz.toFixed(1)} > ${bs.z}`);
      if (over.length) {
        warning = `⚠ Exceeds build volume (${over.join(', ')} mm) — may not fit on printer bed`;
        showToast(warning);
      }
    }
  }

  const buf = new ArrayBuffer(84 + 50*tris.length);
  const dv = new DataView(buf);
  dv.setUint32(80, tris.length, true);
  let o = 84;
  for (const { n, v1, v2, v3 } of tris) {
    for (const c of n) { dv.setFloat32(o, c, true); o += 4; }
    for (const v of [v1, v2, v3]) for (const c of v) { dv.setFloat32(o, c, true); o += 4; }
    dv.setUint16(o, 0, true); o += 2;
  }
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }));
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
  return { ok: true, warning };
}

function showToast(msg, ms = 4500) {
  let host = document.getElementById('akruti-toast');
  if (!host) {
    host = document.createElement('div');
    host.id = 'akruti-toast';
    host.style.cssText = `
      position:fixed;top:20px;left:50%;transform:translateX(-50%);
      z-index:9999;pointer-events:none;display:flex;flex-direction:column;gap:6px;`;
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    background:#fef3c7;color:#92400e;border:1px solid #f59e0b;
    padding:8px 14px;border-radius:8px;font:500 0.8rem -apple-system,Segoe UI,sans-serif;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);pointer-events:auto;
    transition:opacity .25s ease;opacity:0;max-width:520px;`;
  host.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, ms);
}
