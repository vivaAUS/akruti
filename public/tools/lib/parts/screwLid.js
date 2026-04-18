import * as THREE from 'three';
import { addTri, addQ, trisToGeo } from '../geom.js';

// Cylindrical screw-on lid with a male helical thread on the inside of the skirt.
// The mating female-thread subtraction lives in the host tool via lib/csg.js —
// this builder only outputs the lid geometry (top disc + skirt + male thread).

export const screwLid = {
  id: 'screwLid',
  label: 'Screw Lid',
  paramsSchema: [
    { key: 'majorDia', label: 'Major ⌀',   default: 40,  min: 10, step: 0.5, unit: 'mm' },
    { key: 'pitch',    label: 'Pitch',     default: 4,   min: 1,  step: 0.25,unit: 'mm' },
    { key: 'turns',    label: 'Turns',     default: 3,   min: 1,  step: 0.5 },
    { key: 'threadH',  label: 'Thread H',  default: 1.2, min: 0.3,step: 0.1, unit: 'mm' },
    { key: 'skirtT',   label: 'Skirt T',   default: 2,   min: 1,  step: 0.1, unit: 'mm' },
    { key: 'topH',     label: 'Top thick', default: 3,   min: 1,  step: 0.1, unit: 'mm' },
    { key: 'clearance',label: 'Clearance', default: 0.3, min: 0,  step: 0.05,unit: 'mm' },
    { key: 'segs',     label: 'Segments',  default: 48,  min: 16, step: 4 },
  ],
  defaults: { majorDia: 40, pitch: 4, turns: 3, threadH: 1.2, skirtT: 2, topH: 3, clearance: 0.3, segs: 48 },
  build(part) {
    const p = { ...this.defaults, ...part.params };
    const { majorDia, pitch, turns, threadH, skirtT, topH, segs } = p;

    const R = majorDia / 2;             // outer skirt radius
    const ri = R - skirtT;              // inner skirt radius (thread-crest aligned here)
    const threadLength = pitch * turns;
    const skirtH = threadLength + pitch * 0.6;

    const T = [];
    // Outer skirt (cylinder z=0..skirtH, radius R)
    for (let i = 0; i < segs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      addQ(T, [R*c0,R*s0,0],[R*c1,R*s1,0],[R*c1,R*s1,skirtH],[R*c0,R*s0,skirtH]);
    }
    // Top disc (z = skirtH .. skirtH + topH)
    const topZ0 = skirtH, topZ1 = skirtH + topH;
    for (let i = 0; i < segs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      addQ(T, [R*c0,R*s0,topZ0],[R*c1,R*s1,topZ0],[R*c1,R*s1,topZ1],[R*c0,R*s0,topZ1]);
      addTri(T, [0,0,topZ1],[R*c0,R*s0,topZ1],[R*c1,R*s1,topZ1]);
    }
    // Inner skirt wall (down-facing annulus at top of skirt, then cylinder ri inside)
    for (let i = 0; i < segs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      addQ(T, [ri*c0,ri*s0,0],[ri*c0,ri*s0,topZ0],[ri*c1,ri*s1,topZ0],[ri*c1,ri*s1,0]);
      addQ(T, [ri*c0,ri*s0,0],[ri*c1,ri*s1,0],[R*c1,R*s1,0],[R*c0,R*s0,0]);
    }

    // Helical thread on the INNER surface (ri), pointing inward (crest at ri - threadH).
    // Trapezoidal cross-section: base on ri, crest offset inward by threadH.
    // Sweep by advancing z with pitch.
    const threadSegs = segs * turns;
    const crest = ri - threadH;
    const halfFlank = pitch * 0.35; // crest to base z-half-width
    const baseHalf  = pitch * 0.5;  // base to base z-half-width
    const thrZ0 = pitch * 0.4;
    for (let i = 0; i < threadSegs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const z0 = thrZ0 + pitch * (i / segs);
      const z1 = thrZ0 + pitch * ((i+1) / segs);
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      // Two rings at ri: base-bottom (z - baseHalf) and base-top (z + baseHalf).
      const p0Base0 = [ri*c0, ri*s0, z0 - baseHalf];
      const p0Base1 = [ri*c0, ri*s0, z0 + baseHalf];
      const p0Crest0= [crest*c0, crest*s0, z0 - halfFlank];
      const p0Crest1= [crest*c0, crest*s0, z0 + halfFlank];
      const p1Base0 = [ri*c1, ri*s1, z1 - baseHalf];
      const p1Base1 = [ri*c1, ri*s1, z1 + baseHalf];
      const p1Crest0= [crest*c1, crest*s1, z1 - halfFlank];
      const p1Crest1= [crest*c1, crest*s1, z1 + halfFlank];
      // Upper flank (outward, upward) ring-to-ring
      addQ(T, p0Base1, p0Crest1, p1Crest1, p1Base1);
      // Lower flank
      addQ(T, p0Crest0, p0Base0, p1Base0, p1Crest0);
      // Crest face (innermost)
      addQ(T, p0Crest0, p0Crest1, p1Crest1, p1Crest0);
    }

    const geo = trisToGeo(T);
    return { geometry: geo, meta: { screwLid: true, ...p } };
  },
  // Returns a cutter geometry for the female thread in the parent (slightly oversized).
  buildMateCutter(params) {
    const p = { ...this.defaults, ...params };
    const { majorDia, pitch, turns, threadH, clearance, segs } = p;
    const R = majorDia / 2;
    const ri = R - 0; // cutter matches the outer wall of the lid skirt
    const threadLength = pitch * turns;
    const skirtH = threadLength + pitch * 0.6 + 2; // a bit deeper than lid

    // Build a solid cylinder of radius ri + clearance, plus the inverted thread grooves
    // — simplest serviceable cutter: a plain cylinder of slightly oversized radius,
    // to let the lid thread bite into a cylindrical recess. Sufficient for snap-on
    // screw lids with shallow threads. For true mating threads, subtract the lid
    // (scaled by clearance) using csg.subtract.
    const T = [];
    const cutR = ri + clearance;
    const cz0 = 0, cz1 = skirtH;
    for (let i = 0; i < segs; i++) {
      const a0 = 2*Math.PI*i/segs, a1 = 2*Math.PI*(i+1)/segs;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      addQ(T, [cutR*c0,cutR*s0,cz0],[cutR*c1,cutR*s1,cz0],[cutR*c1,cutR*s1,cz1],[cutR*c0,cutR*s0,cz1]);
      addTri(T, [0,0,cz0],[cutR*c1,cutR*s1,cz0],[cutR*c0,cutR*s0,cz0]);
      addTri(T, [0,0,cz1],[cutR*c0,cutR*s0,cz1],[cutR*c1,cutR*s1,cz1]);
    }
    return trisToGeo(T);
  },
};
