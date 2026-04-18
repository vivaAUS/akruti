import * as THREE from 'three';
import { buildBox, buildCylinder, trisToGeo } from '../geom.js';

// Rectangular open-top box.
export const rectBox = {
  id: 'box',
  label: 'Box',
  paramsSchema: [
    { key: 'W',      label: 'Width (X)',   default: 60, min: 4,  step: 1, unit: 'mm' },
    { key: 'D',      label: 'Depth (Y)',   default: 40, min: 4,  step: 1, unit: 'mm' },
    { key: 'H',      label: 'Height (Z)',  default: 30, min: 4,  step: 1, unit: 'mm' },
    { key: 'wall',   label: 'Wall',        default: 2,  min: 0.8,step: 0.1, unit: 'mm' },
  ],
  defaults: { W: 60, D: 40, H: 30, wall: 2 },
  build(part) {
    const { W, D, H, wall } = { ...this.defaults, ...part.params };
    const tris = buildBox(W, D, H, wall);
    const geo = trisToGeo(tris);
    geo.translate(-W/2, 0, -D/2);
    return { geometry: geo, innerCavity: { W: W-2*wall, D: D-2*wall, H: H-wall } };
  },
};

// Cylindrical open-top box.
export const cylBox = {
  id: 'cyl',
  label: 'Cylinder',
  paramsSchema: [
    { key: 'D',    label: 'Diameter',  default: 50, min: 4,  step: 1, unit: 'mm' },
    { key: 'H',    label: 'Height',    default: 30, min: 4,  step: 1, unit: 'mm' },
    { key: 'wall', label: 'Wall',      default: 2,  min: 0.8,step: 0.1, unit: 'mm' },
  ],
  defaults: { D: 50, H: 30, wall: 2 },
  build(part) {
    const { D, H, wall } = { ...this.defaults, ...part.params };
    const tris = buildCylinder(D, H, wall);
    const geo = trisToGeo(tris);
    return { geometry: geo, innerCavity: { D: D-2*wall, H: H-wall } };
  },
};
