import * as THREE from 'three';

// Low-level triangle-list builders. All builders emit Z-up triangles.
// trisToGeo swaps to Y-up for three.js consumption.

export function cross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

export function normV(v) {
  const l = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  return l ? [v[0]/l, v[1]/l, v[2]/l] : [0, 0, 1];
}

export function addTri(T, v1, v2, v3) {
  const a = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
  const b = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
  T.push({ n: normV(cross(a, b)), v1, v2, v3 });
}

export function addQ(T, v1, v2, v3, v4) {
  addTri(T, v1, v2, v3);
  addTri(T, v1, v3, v4);
}

export function addSolidBox(T, x0, y0, z0, x1, y1, z1) {
  addQ(T, [x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0]);
  addQ(T, [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);
  addQ(T, [x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]);
  addQ(T, [x1,y1,z0],[x0,y1,z0],[x0,y1,z1],[x1,y1,z1]);
  addQ(T, [x0,y1,z0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1]);
  addQ(T, [x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]);
}

export function buildBox(W, D, H, t) {
  const T = [];
  addQ(T,[0,0,0],[0,D,0],[W,D,0],[W,0,0]);
  addQ(T,[0,0,0],[W,0,0],[W,0,H],[0,0,H]);
  addQ(T,[W,D,0],[0,D,0],[0,D,H],[W,D,H]);
  addQ(T,[0,D,0],[0,0,0],[0,0,H],[0,D,H]);
  addQ(T,[W,0,0],[W,D,0],[W,D,H],[W,0,H]);
  addQ(T,[t,t,t],[W-t,t,t],[W-t,D-t,t],[t,D-t,t]);
  addQ(T,[W-t,t,t],[t,t,t],[t,t,H],[W-t,t,H]);
  addQ(T,[t,D-t,t],[W-t,D-t,t],[W-t,D-t,H],[t,D-t,H]);
  addQ(T,[t,t,t],[t,D-t,t],[t,D-t,H],[t,t,H]);
  addQ(T,[W-t,D-t,t],[W-t,t,t],[W-t,t,H],[W-t,D-t,H]);
  addQ(T,[0,0,H],[W,0,H],[W,t,H],[0,t,H]);
  addQ(T,[0,D-t,H],[W,D-t,H],[W,D,H],[0,D,H]);
  addQ(T,[0,t,H],[t,t,H],[t,D-t,H],[0,D-t,H]);
  addQ(T,[W-t,t,H],[W,t,H],[W,D-t,H],[W-t,D-t,H]);
  return T;
}

export function buildRidge(W, D, H, t, c, rH, rW) {
  const T = [], ox = t+c, oy = t+c, rw = W-2*t-2*c, rd = D-2*t-2*c, z0 = H, z1 = H+rH;
  if (rw <= 2*rW || rd <= 2*rW) return T;
  addQ(T,[ox,oy,z0],[ox+rw,oy,z0],[ox+rw,oy,z1],[ox,oy,z1]);
  addQ(T,[ox+rw,oy+rd,z0],[ox,oy+rd,z0],[ox,oy+rd,z1],[ox+rw,oy+rd,z1]);
  addQ(T,[ox,oy+rd,z0],[ox,oy,z0],[ox,oy,z1],[ox,oy+rd,z1]);
  addQ(T,[ox+rw,oy,z0],[ox+rw,oy+rd,z0],[ox+rw,oy+rd,z1],[ox+rw,oy,z1]);
  addQ(T,[ox+rW,oy+rW,z0],[ox+rW,oy+rW,z1],[ox+rw-rW,oy+rW,z1],[ox+rw-rW,oy+rW,z0]);
  addQ(T,[ox+rw-rW,oy+rd-rW,z0],[ox+rw-rW,oy+rd-rW,z1],[ox+rW,oy+rd-rW,z1],[ox+rW,oy+rd-rW,z0]);
  addQ(T,[ox+rW,oy+rW,z0],[ox+rW,oy+rd-rW,z0],[ox+rW,oy+rd-rW,z1],[ox+rW,oy+rW,z1]);
  addQ(T,[ox+rw-rW,oy+rd-rW,z0],[ox+rw-rW,oy+rW,z0],[ox+rw-rW,oy+rW,z1],[ox+rw-rW,oy+rd-rW,z1]);
  addQ(T,[ox,oy,z1],[ox+rw,oy,z1],[ox+rw,oy+rW,z1],[ox,oy+rW,z1]);
  addQ(T,[ox,oy+rd-rW,z1],[ox+rw,oy+rd-rW,z1],[ox+rw,oy+rd,z1],[ox,oy+rd,z1]);
  addQ(T,[ox,oy+rW,z1],[ox+rW,oy+rW,z1],[ox+rW,oy+rd-rW,z1],[ox,oy+rd-rW,z1]);
  addQ(T,[ox+rw-rW,oy+rW,z1],[ox+rw,oy+rW,z1],[ox+rw,oy+rd-rW,z1],[ox+rw-rW,oy+rd-rW,z1]);
  addQ(T,[ox,oy,z0],[ox,oy+rW,z0],[ox+rw,oy+rW,z0],[ox+rw,oy,z0]);
  addQ(T,[ox,oy+rd-rW,z0],[ox,oy+rd,z0],[ox+rw,oy+rd,z0],[ox+rw,oy+rd-rW,z0]);
  addQ(T,[ox,oy+rW,z0],[ox,oy+rd-rW,z0],[ox+rW,oy+rd-rW,z0],[ox+rW,oy+rW,z0]);
  addQ(T,[ox+rw-rW,oy+rW,z0],[ox+rw-rW,oy+rd-rW,z0],[ox+rw,oy+rd-rW,z0],[ox+rw,oy+rW,z0]);
  return T;
}

export function buildCylinder(D, H, t, N = 64) {
  const T = [], R = D/2, r = R-t;
  for (let i = 0; i < N; i++) {
    const a0 = 2*Math.PI*i/N, a1 = 2*Math.PI*(i+1)/N;
    const [c0,s0,c1,s1] = [Math.cos(a0), Math.sin(a0), Math.cos(a1), Math.sin(a1)];
    addTri(T,[0,0,0],[R*c1,R*s1,0],[R*c0,R*s0,0]);
    addQ(T,[R*c0,R*s0,0],[R*c1,R*s1,0],[R*c1,R*s1,H],[R*c0,R*s0,H]);
    addTri(T,[0,0,t],[r*c0,r*s0,t],[r*c1,r*s1,t]);
    addQ(T,[r*c0,r*s0,t],[r*c0,r*s0,H],[r*c1,r*s1,H],[r*c1,r*s1,t]);
    addQ(T,[r*c0,r*s0,H],[R*c0,R*s0,H],[R*c1,R*s1,H],[r*c1,r*s1,H]);
  }
  return T;
}

export function buildCircleRidge(D, H, t, c, rH, rW, N = 64) {
  const T = [], R = (D/2)-t-c, z0 = H, z1 = H+rH, ri = R-rW;
  if (ri <= 0) return T;
  for (let i = 0; i < N; i++) {
    const a0 = 2*Math.PI*i/N, a1 = 2*Math.PI*(i+1)/N;
    const [c0,s0,c1,s1] = [Math.cos(a0), Math.sin(a0), Math.cos(a1), Math.sin(a1)];
    addQ(T,[R*c0,R*s0,z0],[R*c1,R*s1,z0],[R*c1,R*s1,z1],[R*c0,R*s0,z1]);
    addQ(T,[ri*c0,ri*s0,z0],[ri*c0,ri*s0,z1],[ri*c1,ri*s1,z1],[ri*c1,ri*s1,z0]);
    addQ(T,[ri*c0,ri*s0,z1],[R*c0,R*s0,z1],[R*c1,R*s1,z1],[ri*c1,ri*s1,z1]);
    addQ(T,[ri*c0,ri*s0,z0],[ri*c1,ri*s1,z0],[R*c1,R*s1,z0],[R*c0,R*s0,z0]);
  }
  return T;
}

export function buildLedges(W, D, H, t, lH, lD, lT) {
  const T = [];
  if (lH+lT > H-t || lD <= 0 || lT <= 0 || lD >= (W-2*t)/2 || lD >= (D-2*t)/2) return T;
  addSolidBox(T, t,      t,      lH, W-t,   t+lD,   lH+lT);
  addSolidBox(T, t,      D-t-lD, lH, W-t,   D-t,    lH+lT);
  addSolidBox(T, t,      t+lD,   lH, t+lD,  D-t-lD, lH+lT);
  addSolidBox(T, W-t-lD, t+lD,   lH, W-t,   D-t-lD, lH+lT);
  return T;
}

export function buildCircleLedge(D, H, t, lH, lD, lT, N = 64) {
  const T = [], R = D/2-t, r = R-lD, z0 = lH, z1 = lH+lT;
  if (r <= 0 || z1 > H-t) return T;
  for (let i = 0; i < N; i++) {
    const a0 = 2*Math.PI*i/N, a1 = 2*Math.PI*(i+1)/N;
    const [c0,s0,c1,s1] = [Math.cos(a0), Math.sin(a0), Math.cos(a1), Math.sin(a1)];
    addQ(T,[r*c0,r*s0,z0],[r*c0,r*s0,z1],[r*c1,r*s1,z1],[r*c1,r*s1,z0]);
    addQ(T,[r*c0,r*s0,z1],[R*c0,R*s0,z1],[R*c1,R*s1,z1],[r*c1,r*s1,z1]);
    addQ(T,[r*c0,r*s0,z0],[r*c1,r*s1,z0],[R*c1,R*s1,z0],[R*c0,R*s0,z0]);
  }
  return T;
}

export function buildStackTabs(W, D, boxH, t, c, rgH, tW, tH, tD) {
  const T = [], ox = t+c, oy = t+c, rw = W-2*t-2*c, rd = D-2*t-2*c, z0 = boxH+rgH, z1 = z0+tH;
  if (rw <= 0 || rd <= 0 || tH <= 0 || tW <= 0 || tD <= 0) return T;
  const hw = tW/2;
  addSolidBox(T, ox+rw/2-hw, oy,        z0, ox+rw/2+hw, oy+tD,     z1);
  addSolidBox(T, ox+rw/2-hw, oy+rd-tD,  z0, ox+rw/2+hw, oy+rd,     z1);
  addSolidBox(T, ox,         oy+rd/2-hw,z0, ox+tD,      oy+rd/2+hw,z1);
  addSolidBox(T, ox+rw-tD,   oy+rd/2-hw,z0, ox+rw,      oy+rd/2+hw,z1);
  return T;
}

export function buildCircleStackTabs(D, boxH, t, c, rgH, tW, tH, tD) {
  const T = [], R = (D/2)-t-c, z0 = boxH+rgH, z1 = z0+tH, hw = tW/2, hd = tD/2;
  if (R <= 0 || tH <= 0) return T;
  addSolidBox(T, -hw,  R-hd, z0,  hw,  R+hd, z1);
  addSolidBox(T, -hw, -R-hd, z0,  hw, -R+hd, z1);
  addSolidBox(T,  R-hd, -hw, z0,  R+hd,  hw, z1);
  addSolidBox(T, -R-hd, -hw, z0, -R+hd,  hw, z1);
  return T;
}

export function buildTrayTabs(tOW, tOD, trayH, tabZ, tW, tH, tD) {
  const T = [], hw = tW/2, z0 = tabZ, z1 = tabZ+tH;
  if (z1 > trayH || tW <= 0 || tH <= 0 || tD <= 0) return T;
  addSolidBox(T, tOW/2-hw, -tD,       z0, tOW/2+hw, 0,         z1);
  addSolidBox(T, tOW/2-hw,  tOD,      z0, tOW/2+hw, tOD+tD,    z1);
  addSolidBox(T, -tD,       tOD/2-hw, z0, 0,        tOD/2+hw,  z1);
  addSolidBox(T,  tOW,      tOD/2-hw, z0, tOW+tD,   tOD/2+hw,  z1);
  return T;
}

export function buildCircleTrayTabs(tOD, trayH, tabZ, tW, tH, tD) {
  const T = [], R = tOD/2, hw = tW/2, z0 = tabZ, z1 = tabZ+tH;
  if (z1 > trayH) return T;
  addSolidBox(T, -hw,  R,   z0,  hw,  R+tD, z1);
  addSolidBox(T, -hw, -R-tD,z0,  hw, -R,    z1);
  addSolidBox(T,  R,  -hw,  z0,  R+tD, hw,  z1);
  addSolidBox(T, -R-tD,-hw, z0, -R,   hw,   z1);
  return T;
}

export function trisToGeo(tris) {
  if (!tris || tris.length === 0) return new THREE.BufferGeometry();
  const pos = new Float32Array(tris.length*9);
  const nor = new Float32Array(tris.length*9);
  tris.forEach(({ n, v1, v2, v3 }, i) => {
    const b = i*9; let j = 0;
    for (const [x, y, z] of [v1, v2, v3]) {
      pos[b+j*3] = x; pos[b+j*3+1] = z; pos[b+j*3+2] = y; j++;
    }
    for (let k = 0; k < 3; k++) {
      nor[b+k*3] = n[0]; nor[b+k*3+1] = n[2]; nor[b+k*3+2] = n[1];
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return g;
}

export function trisBounds(tris) {
  if (!tris?.length) return null;
  let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  for (const { v1, v2, v3 } of tris) {
    for (const [x,y,z] of [v1,v2,v3]) {
      if (x<minX) minX=x; if (x>maxX) maxX=x;
      if (y<minY) minY=y; if (y>maxY) maxY=y;
      if (z<minZ) minZ=z; if (z>maxZ) maxZ=z;
    }
  }
  return { min:[minX,minY,minZ], max:[maxX,maxY,maxZ],
           size:[maxX-minX,maxY-minY,maxZ-minZ] };
}
