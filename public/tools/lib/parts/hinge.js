import * as THREE from 'three';
import { addTri, addQ, addSolidBox, trisToGeo } from '../geom.js';

// Piano-hinge style: 3 knuckles (2 outer + 1 middle) around a pin axis.
// Geometry is built in local coordinates with the hinge axis along +X at origin,
// base plates in the XY plane. The host tool transforms it to a picked edge.

export const hinge = {
  id: 'hinge',
  label: 'Hinge',
  paramsSchema: [
    { key: 'length',    label: 'Length',     default: 40, min: 10, step: 1,   unit: 'mm' },
    { key: 'plateW',    label: 'Plate W',    default: 10, min: 3,  step: 0.5, unit: 'mm' },
    { key: 'plateT',    label: 'Plate T',    default: 2,  min: 1,  step: 0.1, unit: 'mm' },
    { key: 'pinDia',    label: 'Pin ⌀',      default: 3,  min: 1,  step: 0.1, unit: 'mm' },
    { key: 'knuckleOD', label: 'Knuckle ⌀',  default: 6,  min: 2,  step: 0.1, unit: 'mm' },
    { key: 'clearance', label: 'Clearance',  default: 0.2,min: 0,  step: 0.05,unit: 'mm' },
    { key: 'segs',      label: 'Segments',   default: 24, min: 12, step: 4 },
  ],
  defaults: { length: 40, plateW: 10, plateT: 2, pinDia: 3, knuckleOD: 6, clearance: 0.2, segs: 24 },
  build(part) {
    const p = { ...this.defaults, ...part.params };
    const { length, plateW, plateT, pinDia, knuckleOD, clearance, segs } = p;
    const R = knuckleOD / 2;
    const rPin = pinDia / 2;

    // Split the hinge into 3 knuckle zones along the length.
    const z0 = -length/2, z1 = length/2;
    const thirdLen = length/3;
    const outerZones = [[z0, z0+thirdLen], [z1-thirdLen, z1]];
    const midZone    = [z0+thirdLen + clearance, z1-thirdLen - clearance];

    const T = [];

    // Base plate LEFT side (y = +R .. +R+plateW, z = full length, x thin = plateT thick)
    addSolidBox(T,
      -plateT,  R,          z0,
       0,       R + plateW, z1);
    // Base plate RIGHT side (mirror)
    addSolidBox(T,
       0,       R,          z0,
       plateT,  R + plateW, z1);

    // Knuckle cylinders — LEFT plate owns the two outer knuckles; RIGHT plate owns mid.
    // Simplification: model as solid knuckles (ring around a pin hole would require CSG).
    const addKnuckle = (zA, zB) => {
      for (let i = 0; i < segs; i++) {
        const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
        const c0 = Math.cos(a0), s0 = Math.sin(a0);
        const c1 = Math.cos(a1), s1 = Math.sin(a1);
        // Outer cyl
        addQ(T, [R*c0, R*s0, zA],[R*c1, R*s1, zA],[R*c1, R*s1, zB],[R*c0, R*s0, zB]);
        // End caps as rings to pin hole
        addQ(T,
          [rPin*c0, rPin*s0, zA],[R*c0, R*s0, zA],
          [R*c1, R*s1, zA],[rPin*c1, rPin*s1, zA]);
        addQ(T,
          [R*c0, R*s0, zB],[rPin*c0, rPin*s0, zB],
          [rPin*c1, rPin*s1, zB],[R*c1, R*s1, zB]);
        // Inner cyl (pin hole wall)
        addQ(T,
          [rPin*c0, rPin*s0, zA],[rPin*c1, rPin*s1, zA],
          [rPin*c1, rPin*s1, zB],[rPin*c0, rPin*s0, zB]);
      }
    };
    outerZones.forEach(([a, b]) => addKnuckle(a, b));
    addKnuckle(midZone[0], midZone[1]);

    // Pin — solid cylinder of rPin - small tolerance running the full length.
    const rp = rPin - 0.05;
    for (let i = 0; i < segs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      addQ(T, [rp*c0, rp*s0, z0],[rp*c1, rp*s1, z0],[rp*c1, rp*s1, z1],[rp*c0, rp*s0, z1]);
      addTri(T, [0,0,z0],[rp*c1, rp*s1, z0],[rp*c0, rp*s0, z0]);
      addTri(T, [0,0,z1],[rp*c0, rp*s0, z1],[rp*c1, rp*s1, z1]);
    }

    const geo = trisToGeo(T);
    return { geometry: geo, meta: p };
  },
};
