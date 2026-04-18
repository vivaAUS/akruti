import * as THREE from 'three';

// Generic cross-section helpers.
// Host provides a `getConfig()` returning:
//   { on, axis:'x'|'y'|'z', pos: 0..100, W, totalD, totalH }
// and a `getMeshes()` returning an array of meshes to clip.

export function createXSection({ scene, getConfig, getMeshes }) {
  let capMesh = null;

  function buildPlane() {
    const { on, axis, pos, W, totalD, totalH } = getConfig();
    if (!on) return null;
    const p = pos / 100;
    if (axis === 'x') return new THREE.Plane(new THREE.Vector3(-1, 0, 0), -W/2 + p*W);
    if (axis === 'y') return new THREE.Plane(new THREE.Vector3(0, 0, -1), -totalD/2 + p*totalD);
    return new THREE.Plane(new THREE.Vector3(0, -1, 0), p*totalH);
  }

  function clearCap() {
    if (!capMesh) return;
    scene.remove(capMesh);
    capMesh.geometry.dispose();
    capMesh.material.dispose();
    capMesh = null;
  }

  function updateCap() {
    clearCap();
    const cfg = getConfig();
    if (!cfg.on) return;
    const { axis, pos, W, totalD, totalH } = cfg;
    const size = Math.max(W, totalD, totalH) * 1.6;
    const p = pos / 100;
    capMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6, transparent: true, opacity: 0.08,
        side: THREE.DoubleSide, depthWrite: false,
      })
    );
    if (axis === 'x') {
      capMesh.rotation.y = -Math.PI/2;
      capMesh.position.set(-W/2 + p*W, totalH/2, 0);
    } else if (axis === 'y') {
      capMesh.position.set(0, totalH/2, -totalD/2 + p*totalD);
    } else {
      capMesh.rotation.x = Math.PI/2;
      capMesh.position.set(0, p*totalH, 0);
    }
    scene.add(capMesh);
  }

  function updateClip() {
    const plane = buildPlane();
    const planes = plane ? [plane] : [];
    for (const m of getMeshes()) {
      if (!m) continue;
      if (m.material) m.material.clippingPlanes = planes;
      if (m.userData?.edges?.material) m.userData.edges.material.clippingPlanes = planes;
    }
  }

  function update() {
    updateClip();
    updateCap();
  }

  return { buildPlane, updateClip, updateCap, update, clearCap };
}
