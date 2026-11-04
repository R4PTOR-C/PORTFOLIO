/* ═══════════════════════════════════════════════════════════════════════════
   Atlanteon phone, procedural
   ───────────────────────────────────────────────────────────────────────────
   A rounded slab, the real app screen on the front, the trident icon on the
   back, a thin ring orbiting. It spins in on first view, leans toward the
   pointer, and can be flicked around (drag) with inertia.
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 0.8, H = 1.66, D = 0.09, R = 0.11;

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 12);
  /* ShapeGeometry's UVs are raw positions: remap to 0..1 for the texture */
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  return g;
}

export async function createPhoneScene(canvas, { screenUrl, iconUrl }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x050b14, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00e5a0, 2.2);
  rim.position.set(3, 1, -3);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xff2bd6, 1.2);
  rim2.position.set(-3, -2, -2);
  scene.add(rim2);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.6);

  const loader = new THREE.TextureLoader();
  const [screenTex, iconTex] = await Promise.all([loader.loadAsync(screenUrl), loader.loadAsync(iconUrl)]);
  for (const tx of [screenTex, iconTex]) {
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  const phone = new THREE.Group();
  scene.add(phone);

  const body = new THREE.Mesh(
    new RoundedBoxGeometry(W, H, D, 6, R),
    new THREE.MeshPhysicalMaterial({ color: '#16233a', metalness: 0.75, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 }),
  );
  phone.add(body);

  const screen = new THREE.Mesh(
    roundedRect(W - 0.06, H - 0.06, R - 0.03),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
  );
  screen.position.z = D / 2 + 0.001;
  phone.add(screen);

  const island = new THREE.Mesh(roundedRect(0.2, 0.05, 0.025), new THREE.MeshBasicMaterial({ color: '#000000' }));
  island.position.set(0, H / 2 - 0.09, D / 2 + 0.002);
  phone.add(island);

  const back = new THREE.Mesh(roundedRect(0.34, 0.34, 0.08), new THREE.MeshBasicMaterial({ map: iconTex, toneMapped: false }));
  back.position.z = -D / 2 - 0.001;
  back.rotation.y = Math.PI;
  phone.add(back);

  const btnMat = new THREE.MeshStandardMaterial({ color: '#2a3a55', metalness: 0.8, roughness: 0.3 });
  for (const [y, h] of [[0.42, 0.22], [0.12, 0.14], [-0.06, 0.14]]) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.02, h, 0.03, 2, 0.008), btnMat);
    b.position.set(y === 0.42 ? W / 2 + 0.004 : -W / 2 - 0.004, y, 0);
    phone.add(b);
  }

  /* orbit: a thin neon ring and three little moons */
  const orbit = new THREE.Group();
  orbit.rotation.set(1.15, 0.2, 0);
  scene.add(orbit);
  orbit.add(new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.004, 8, 160),
    new THREE.MeshBasicMaterial({ color: '#00e5a0', transparent: true, opacity: 0.6 }),
  ));
  const moons = [];
  for (const [c, r] of [['#00e5a0', 0.035], ['#6ba6fb', 0.025], ['#ff2bd6', 0.02]]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: c }));
    orbit.add(m);
    moons.push(m);
  }

  /* ── interaction ── */
  const st = { px: 0, py: 0, spin: -Math.PI * 2, spinV: 0, dragging: false, lastX: 0, intro: 0, t: 0 };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    st.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    st.py = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (st.dragging) {
      st.spinV = (e.clientX - st.lastX) * 0.012;
      st.spin += st.spinV;
      st.lastX = e.clientX;
    }
  };
  const onDown = (e) => { st.dragging = true; st.lastX = e.clientX; canvas.setPointerCapture?.(e.pointerId); };
  const onUp = () => { st.dragging = false; };
  const onLeave = () => { st.px = 0; st.py = 0; };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  let w = 1, h = 1;
  const resize = (width, height, dpr) => {
    w = width; h = height;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const tick = (dt, reduced) => {
    st.t += dt;
    /* spin-in, then settle; flicks decay back toward facing front */
    if (!st.dragging) {
      st.spinV *= Math.exp(-2.5 * dt);
      st.spin += st.spinV;
      const nearest = Math.round(st.spin / (Math.PI * 2)) * Math.PI * 2;
      st.spin += (nearest - st.spin) * (1 - Math.exp(-(reduced ? 20 : 2.2) * dt));
    }
    const sway = reduced ? 0 : Math.sin(st.t * 0.7) * 0.18;
    phone.rotation.y += ((st.spin + sway + st.px * 0.45) - phone.rotation.y) * (1 - Math.exp(-8 * dt));
    phone.rotation.x += ((st.py * 0.25 - 0.05) - phone.rotation.x) * (1 - Math.exp(-6 * dt));
    phone.position.y = reduced ? 0 : Math.sin(st.t * 1.1) * 0.05;
    phone.rotation.z = reduced ? 0 : Math.sin(st.t * 0.8) * 0.03;

    orbit.rotation.z += dt * 0.25;
    moons.forEach((m, i) => {
      const a = st.t * (0.5 + i * 0.22) + i * 2.1;
      m.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0);
    });
    renderer.render(scene, camera);
  };

  return {
    resize,
    tick,
    spinIn() { st.spin = -Math.PI * 2; st.spinV = 0; },
    dispose() {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      renderer.dispose();
      screenTex.dispose(); iconTex.dispose();
    },
  };
}
