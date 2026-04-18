import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(mount, {
  bg = 0xf9f9f9,
  fog = { near: 700, far: 1500 },
  cameraPos = [250, 180, 260],
  cameraTarget = [0, 30, 0],
  gridSize = 700,
  gridDivs = 28,
  floor = true,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setClearColor(bg);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  if (fog) scene.fog = new THREE.Fog(bg, fog.near, fog.far);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 6000);
  camera.position.set(...cameraPos);

  scene.add(new THREE.AmbientLight(0xffffff, 0.80));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(200, 380, 150); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -250;
  sun.shadow.camera.right = sun.shadow.camera.top = 250;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 900;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xffd080, 0.20);
  fill.position.set(-120, 60, -100); scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, 0.12);
  back.position.set(0, -200, 0); scene.add(back);

  const gridHelper = new THREE.GridHelper(gridSize, gridDivs, 0xcccccc, 0xe0e0e0);
  scene.add(gridHelper);

  let floorMesh = null;
  if (floor) {
    floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.ShadowMaterial({ opacity: 0.08 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.065;
  controls.minDistance = 30; controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI * 0.82;
  controls.target.set(...cameraTarget); controls.update();

  const ro = new ResizeObserver(() => {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(mount);

  let running = true;
  (function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();

  return {
    scene, camera, renderer, controls, gridHelper, floorMesh, sun,
    stop() { running = false; ro.disconnect(); },
  };
}
