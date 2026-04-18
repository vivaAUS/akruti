import * as THREE from 'three';
import { addQ, addSolidBox, trisToGeo } from '../geom.js';

// Flat lid with a downward lip sized to press-fit into a parent box cavity.
// Default clearance 0.3 mm/side (PLA, slicer default 0.2 mm layers).
export const snapLid = {
  id: 'snapLid',
  label: 'Snap Lid',
  paramsSchema: [
    { key: 'W',         label: 'Width',      default: 60,  min: 4,   step: 1,   unit: 'mm' },
    { key: 'D',         label: 'Depth',      default: 40,  min: 4,   step: 1,   unit: 'mm' },
    { key: 'topH',      label: 'Top thick',  default: 2,   min: 0.8, step: 0.1, unit: 'mm' },
    { key: 'lipH',      label: 'Lip height', default: 4,   min: 1,   step: 0.5, unit: 'mm' },
    { key: 'lipT',      label: 'Lip thick',  default: 1.6, min: 0.8, step: 0.1, unit: 'mm' },
    { key: 'clearance', label: 'Clearance',  default: 0.3, min: 0,   step: 0.05,unit: 'mm' },
  ],
  defaults: { W: 60, D: 40, topH: 2, lipH: 4, lipT: 1.6, clearance: 0.3 },
  build(part) {
    const { W, D, topH, lipH, lipT, clearance } = { ...this.defaults, ...part.params };
    const T = [];
    // Top plate (W × D × topH) sitting on plane z = 0 .. topH, bottom of lip extends below.
    const tz1 = 0, tz0 = -topH;
    addQ(T, [0,0,tz1],[W,0,tz1],[W,D,tz1],[0,D,tz1]);
    addQ(T, [0,0,tz0],[0,D,tz0],[W,D,tz0],[W,0,tz0]);
    addQ(T, [0,0,tz0],[W,0,tz0],[W,0,tz1],[0,0,tz1]);
    addQ(T, [0,D,tz0],[0,D,tz1],[W,D,tz1],[W,D,tz0]);
    addQ(T, [0,0,tz0],[0,0,tz1],[0,D,tz1],[0,D,tz0]);
    addQ(T, [W,0,tz0],[W,D,tz0],[W,D,tz1],[W,0,tz1]);
    // Lip — hollow rectangular skirt inside the plate footprint with clearance.
    const li = clearance;
    const ox = li, oy = li, W2 = W-2*li, D2 = D-2*li;
    const lz0 = -topH - lipH, lz1 = -topH;
    if (W2 > 2*lipT && D2 > 2*lipT) {
      // Four walls of the lip skirt
      addSolidBox(T, ox,           oy,           lz0, ox+W2,       oy+lipT,     lz1);
      addSolidBox(T, ox,           oy+D2-lipT,   lz0, ox+W2,       oy+D2,       lz1);
      addSolidBox(T, ox,           oy+lipT,      lz0, ox+lipT,     oy+D2-lipT,  lz1);
      addSolidBox(T, ox+W2-lipT,   oy+lipT,      lz0, ox+W2,       oy+D2-lipT,  lz1);
    }
    const geo = trisToGeo(T);
    geo.translate(-W/2, 0, -D/2);
    return { geometry: geo };
  },
};
