import * as THREE from 'three';
import { addTri, addQ, addSolidBox, trisToGeo } from '../geom.js';

// Face-texture attachment: produces a set of raised/cut bumps tiled on a rectangle.
// The host applies these via csg.union (emboss) or csg.subtract (deboss) to the parent.

export const textureKinds = {
  knurl: {
    label: 'Knurl (diamond)',
    build({ W, D, pitch = 2.5, depth = 0.6 }) {
      const T = [];
      const cols = Math.max(1, Math.floor(W / pitch));
      const rows = Math.max(1, Math.floor(D / pitch));
      const dx = W / cols, dy = D / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c*dx + dx/2, cy = r*dy + dy/2;
          const h = dx * 0.42, v = dy * 0.42;
          const z0 = 0, z1 = depth;
          // Square pyramid with 4 triangular faces meeting at apex
          const apex = [cx, cy, z1];
          const p0 = [cx-h, cy-v, z0];
          const p1 = [cx+h, cy-v, z0];
          const p2 = [cx+h, cy+v, z0];
          const p3 = [cx-h, cy+v, z0];
          addQ(T, p0, p3, p2, p1); // base
          addTri(T, p0, p1, apex);
          addTri(T, p1, p2, apex);
          addTri(T, p2, p3, apex);
          addTri(T, p3, p0, apex);
        }
      }
      return T;
    },
  },
  hex: {
    label: 'Hex grid',
    build({ W, D, pitch = 6, depth = 0.8 }) {
      const T = [];
      const hex = pitch * 0.45;
      const stepX = pitch, stepY = pitch * 0.866;
      const cols = Math.max(1, Math.floor(W / stepX));
      const rows = Math.max(1, Math.floor(D / stepY));
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2 === 0) ? 0 : stepX/2;
        for (let c = 0; c < cols; c++) {
          const cx = c*stepX + offset + stepX/2;
          const cy = r*stepY + stepY/2;
          if (cx - hex < 0 || cx + hex > W || cy - hex < 0 || cy + hex > D) continue;
          // Hexagonal prism
          const pts = [];
          for (let i = 0; i < 6; i++) {
            const a = Math.PI/6 + i * Math.PI/3;
            pts.push([cx + hex*Math.cos(a), cy + hex*Math.sin(a)]);
          }
          const z0 = 0, z1 = depth;
          // Top + bottom (fan from center)
          for (let i = 0; i < 6; i++) {
            const a = pts[i], b = pts[(i+1)%6];
            addTri(T, [cx,cy,z1],[a[0],a[1],z1],[b[0],b[1],z1]);
            addTri(T, [cx,cy,z0],[b[0],b[1],z0],[a[0],a[1],z0]);
            addQ(T, [a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]);
          }
        }
      }
      return T;
    },
  },
  ridges: {
    label: 'Ridges',
    build({ W, D, pitch = 2, depth = 0.5 }) {
      const T = [];
      const n = Math.max(1, Math.floor(W / pitch));
      const dx = W / n, w = dx * 0.55;
      for (let i = 0; i < n; i++) {
        const cx = i*dx + dx/2;
        addSolidBox(T, cx - w/2, 0, 0, cx + w/2, D, depth);
      }
      return T;
    },
  },
};

export function buildTextureTile({ kind = 'knurl', W = 30, D = 30, pitch, depth }) {
  const entry = textureKinds[kind];
  if (!entry) throw new Error(`Unknown texture kind: ${kind}`);
  const opts = { W, D };
  if (pitch !== undefined) opts.pitch = pitch;
  if (depth !== undefined) opts.depth = depth;
  const tris = entry.build(opts);
  const geo = trisToGeo(tris);
  geo.translate(-W/2, 0, -D/2);
  return geo;
}

export const texture = {
  id: 'texture',
  label: 'Face Texture',
  kinds: Object.keys(textureKinds),
  paramsSchema: [
    { key: 'kind',  label: 'Pattern', default: 'knurl', options: Object.keys(textureKinds) },
    { key: 'W',     label: 'Width',   default: 30, min: 4, step: 1, unit: 'mm' },
    { key: 'D',     label: 'Depth',   default: 30, min: 4, step: 1, unit: 'mm' },
    { key: 'pitch', label: 'Pitch',   default: 2.5,min: 0.5, step: 0.1, unit: 'mm' },
    { key: 'depth', label: 'Depth',   default: 0.6,min: 0.1, step: 0.1, unit: 'mm' },
    { key: 'mode',  label: 'Mode',    default: 'emboss', options: ['emboss', 'deboss'] },
  ],
  defaults: { kind: 'knurl', W: 30, D: 30, pitch: 2.5, depth: 0.6, mode: 'emboss' },
  build(part) {
    const p = { ...this.defaults, ...part.params };
    return { geometry: buildTextureTile(p), meta: p };
  },
};
