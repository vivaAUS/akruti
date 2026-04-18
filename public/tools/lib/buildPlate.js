import * as THREE from 'three';

export function createBuildPlate(scene, { x = 180, y = 180, z = 180, cell = 10 } = {}) {
  const group = new THREE.Group();
  group.name = 'BuildPlate';
  group.visible = false;

  const box = new THREE.BoxGeometry(x, y, z);
  const edges = new THREE.EdgesGeometry(box);
  const wire = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.55 })
  );
  wire.position.y = y / 2;
  group.add(wire);

  const divisions = Math.max(1, Math.round(x / cell));
  const grid = new THREE.GridHelper(x, divisions, 0x3b82f6, 0x93c5fd);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.y = 0.05;
  group.add(grid);

  const label = makeLabel(`A1 mini · ${x}×${y}×${z}mm`);
  if (label) {
    label.position.set(-x / 2 + 4, y + 4, -z / 2 + 4);
    group.add(label);
  }

  scene.add(group);

  return {
    group,
    setVisible(v) { group.visible = !!v; },
    isVisible() { return group.visible; },
    dispose() {
      scene.remove(group);
      group.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose?.();
      });
    },
  };
}

function makeLabel(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const pad = 8, fontPx = 28;
  ctx.font = `600 ${fontPx}px -apple-system, Segoe UI, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fontPx + pad * 2;
  canvas.width = w; canvas.height = h;
  ctx.font = `600 ${fontPx}px -apple-system, Segoe UI, sans-serif`;
  ctx.fillStyle = 'rgba(59,130,246,0.92)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.28;
  sprite.scale.set(w * scale, h * scale, 1);
  return sprite;
}
