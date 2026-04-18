import * as THREE from 'three';

// Wrap a three BufferGeometry so it lives in Y-up space consistent with the
// triangle-based builders (which emit Z-up and swap via trisToGeo). three's
// primitive geometries are already Y-up, so no swap needed.

export const sphere = {
  id: 'sphere',
  label: 'Sphere',
  paramsSchema: [
    { key: 'D',    label: 'Diameter', default: 30, min: 4, step: 1, unit: 'mm' },
    { key: 'segs', label: 'Segments', default: 32, min: 8, step: 4 },
  ],
  defaults: { D: 30, segs: 32 },
  build(part) {
    const { D, segs } = { ...this.defaults, ...part.params };
    const g = new THREE.SphereGeometry(D/2, segs, Math.max(8, segs/2));
    g.translate(0, D/2, 0);
    g.computeVertexNormals();
    return { geometry: g };
  },
};

export const cone = {
  id: 'cone',
  label: 'Cone',
  paramsSchema: [
    { key: 'D',    label: 'Diameter', default: 30, min: 4, step: 1, unit: 'mm' },
    { key: 'H',    label: 'Height',   default: 40, min: 4, step: 1, unit: 'mm' },
    { key: 'segs', label: 'Segments', default: 32, min: 8, step: 4 },
  ],
  defaults: { D: 30, H: 40, segs: 32 },
  build(part) {
    const { D, H, segs } = { ...this.defaults, ...part.params };
    const g = new THREE.ConeGeometry(D/2, H, segs);
    g.translate(0, H/2, 0);
    g.computeVertexNormals();
    return { geometry: g };
  },
};

// Cylinder-shaped hole cutter (subtract-only). Meant to be parented to another
// part — the host subtracts this geometry from the parent via CSG.
export const hole = {
  id: 'hole',
  label: 'Hole',
  paramsSchema: [
    { key: 'D',    label: 'Diameter', default: 5,  min: 0.5, step: 0.1, unit: 'mm' },
    { key: 'H',    label: 'Depth',    default: 20, min: 1,   step: 0.5, unit: 'mm' },
    { key: 'segs', label: 'Segments', default: 24, min: 8,   step: 4 },
  ],
  defaults: { D: 5, H: 20, segs: 24 },
  isCutter: true,
  build(part) {
    const { D, H, segs } = { ...this.defaults, ...part.params };
    const g = new THREE.CylinderGeometry(D/2, D/2, H, segs, 1);
    g.computeVertexNormals();
    return { geometry: g };
  },
};

// Press-fit pocket for a disc magnet (standard: 6mm dia × 2mm thick).
// Subtracted from parent — creates a blind hole of `D` diameter, `depth` deep,
// opening downward along local +Y.
export const magnet = {
  id: 'magnet',
  label: 'Magnet Pocket',
  paramsSchema: [
    { key: 'D',     label: 'Magnet ⌀', default: 6,   min: 2,   step: 0.1, unit: 'mm' },
    { key: 'depth', label: 'Depth',    default: 2,   min: 0.5, step: 0.1, unit: 'mm' },
    { key: 'fit',   label: 'Clearance',default: 0.1, min: 0,   step: 0.05,unit: 'mm' },
    { key: 'segs',  label: 'Segments', default: 24,  min: 8,   step: 4 },
  ],
  defaults: { D: 6, depth: 2, fit: 0.1, segs: 24 },
  isCutter: true,
  build(part) {
    const { D, depth, fit, segs } = { ...this.defaults, ...part.params };
    const g = new THREE.CylinderGeometry((D + 2*fit)/2, (D + 2*fit)/2, depth, segs, 1);
    g.translate(0, -depth/2, 0);
    g.computeVertexNormals();
    return { geometry: g };
  },
};

// Stepped hole for a brass heat-set threaded insert. Default M3 (Ruthex-style):
// 4.0 mm dia × 4.0 mm deep, with a 3.0 mm through-hole below.
export const insert = {
  id: 'insert',
  label: 'Heat-set Insert',
  paramsSchema: [
    { key: 'size',       label: 'Thread',  default: 'M3', options: ['M2','M2.5','M3','M4','M5'] },
    { key: 'insertDia',  label: 'Pocket ⌀',default: 4.0, min: 1, step: 0.1, unit: 'mm' },
    { key: 'insertDepth',label: 'Pocket H',default: 4.0, min: 1, step: 0.1, unit: 'mm' },
    { key: 'throughDia', label: 'Clearance ⌀', default: 3.2, min: 1, step: 0.1, unit: 'mm' },
    { key: 'throughDepth',label: 'Total Depth',default: 8.0, min: 2, step: 0.1, unit: 'mm' },
    { key: 'segs',       label: 'Segments',default: 24, min: 8, step: 4 },
  ],
  defaults: { size: 'M3', insertDia: 4.0, insertDepth: 4.0, throughDia: 3.2, throughDepth: 8.0, segs: 24 },
  isCutter: true,
  build(part) {
    const p = { ...this.defaults, ...part.params };
    const { insertDia, insertDepth, throughDia, throughDepth, segs } = p;
    const topH = insertDepth;
    const botH = Math.max(0.1, throughDepth - insertDepth);
    const gTop = new THREE.CylinderGeometry(insertDia/2, insertDia/2, topH, segs, 1);
    gTop.translate(0, -topH/2, 0);
    const gBot = new THREE.CylinderGeometry(throughDia/2, throughDia/2, botH, segs, 1);
    gBot.translate(0, -topH - botH/2, 0);
    const merged = mergeGeos([gTop, gBot]);
    merged.computeVertexNormals();
    return { geometry: merged };
  },
};

// Internal dividers inside a box cavity. `rows` × `cols` compartments.
// This builds walls that, when unioned with the parent box, partition its cavity.
export const divider = {
  id: 'divider',
  label: 'Dividers',
  paramsSchema: [
    { key: 'W',    label: 'Span W',  default: 56, min: 4, step: 1, unit: 'mm' },
    { key: 'D',    label: 'Span D',  default: 36, min: 4, step: 1, unit: 'mm' },
    { key: 'H',    label: 'Height',  default: 28, min: 2, step: 1, unit: 'mm' },
    { key: 'rows', label: 'Rows',    default: 2,  min: 1, step: 1 },
    { key: 'cols', label: 'Cols',    default: 3,  min: 1, step: 1 },
    { key: 'wall', label: 'Wall',    default: 1.2,min: 0.4, step: 0.1, unit: 'mm' },
  ],
  defaults: { W: 56, D: 36, H: 28, rows: 2, cols: 3, wall: 1.2 },
  build(part) {
    const { W, D, H, rows, cols, wall } = { ...this.defaults, ...part.params };
    const pieces = [];
    for (let c = 1; c < cols; c++) {
      const x = (c / cols) * W - wall/2;
      const g = new THREE.BoxGeometry(wall, H, D);
      g.translate(x - W/2 + wall/2, H/2, 0);
      pieces.push(g);
    }
    for (let r = 1; r < rows; r++) {
      const z = (r / rows) * D - wall/2;
      const g = new THREE.BoxGeometry(W, H, wall);
      g.translate(0, H/2, z - D/2 + wall/2);
      pieces.push(g);
    }
    const merged = pieces.length ? mergeGeos(pieces) : new THREE.BufferGeometry();
    merged.computeVertexNormals();
    return { geometry: merged };
  },
};

// Simple geometry merger without the BufferGeometryUtils dependency.
function mergeGeos(geos) {
  const positions = [];
  const normals = [];
  for (const g of geos) {
    const p = g.attributes.position;
    const n = g.attributes.normal;
    const idx = g.index;
    const count = idx ? idx.count : p.count;
    for (let i = 0; i < count; i++) {
      const ix = idx ? idx.getX(i) : i;
      positions.push(p.getX(ix), p.getY(ix), p.getZ(ix));
      if (n) normals.push(n.getX(ix), n.getY(ix), n.getZ(ix));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return out;
}
