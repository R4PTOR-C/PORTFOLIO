/* ═══════════════════════════════════════════════════════════════════════════
   Saucer workbench
   ───────────────────────────────────────────────────────────────────────────
   The same ufo.glb the game flies, on a slow turntable, in three passes:
     wire  – the real topology, hidden-line (a dark fill hides the back edges)
     clay  – one matte material plus the AO that Cycles baked
     final – the game's own materials and palette
   The numbers shown next to it are counted here from the loaded geometry,
   not typed in by hand.
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PALETTES, EMISSIVE, AO_MATS } from './ufoLook';

export const MODES = ['wire', 'clay', 'final'];
const FADE = 0.45;            // seconds for a pass to cross-fade

export async function createWorkbench(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x0a1220, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-2, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6ba6fb, 1.3);
  rim.position.set(2.5, 1, -2.5);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 1.25, 4.4);
  camera.lookAt(0, 0.05, 0);

  const [gltf, ao] = await Promise.all([
    new GLTFLoader().loadAsync('/models/ufo.glb'),
    new THREE.TextureLoader().loadAsync('/models/ufo-ao.jpg'),
  ]);
  ao.flipY = false;
  ao.colorSpace = THREE.NoColorSpace;

  const model = gltf.scene;
  const fins = model.getObjectByName('Fins');
  if (fins) fins.removeFromParent();          // mothership-only part, not this ship

  /* centre the saucer and fit it to ~2 units wide */
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  model.position.sub(centre);
  const fit = 2.1 / Math.max(size.x, size.z);
  const turntable = new THREE.Group();
  turntable.scale.setScalar(fit);
  turntable.add(model);
  scene.add(turntable);

  /* ── materials for each pass ─────────────────────────────────────────── */
  const meshes = [];
  const source = {};
  model.traverse((o) => {
    if (!o.isMesh) return;
    meshes.push(o);
    for (const m of [].concat(o.material)) source[m.name] = m;
  });

  const finalSet = {};
  const pal = PALETTES.ship;
  for (const [name, m] of Object.entries(source)) {
    let mat;
    if (name === 'Dome') {
      mat = new THREE.MeshPhysicalMaterial({
        color: pal.Dome, roughness: 0.05, metalness: 0, clearcoat: 1,
        transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 1.3,
      });
    } else {
      mat = m.clone();
      mat.color = new THREE.Color(pal[name] || '#ffffff');
      if (EMISSIVE[name]) {
        mat.emissive = new THREE.Color(pal[name]);
        mat.emissiveIntensity = EMISSIVE[name];
      }
    }
    if (AO_MATS.includes(name)) { mat.aoMap = ao; mat.aoMapIntensity = 1; }
    mat.transparent = true;
    finalSet[name] = mat;
  }

  const clay = new THREE.MeshStandardMaterial({
    color: '#a29d95', roughness: 0.9, metalness: 0, aoMap: ao, aoMapIntensity: 1.15, transparent: true,
  });

  /* hidden-line wireframe: a fill in the page colour pushed slightly back,
     and the triangle edges drawn over it */
  const fill = new THREE.MeshBasicMaterial({
    color: '#050b14', transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  const lineMat = new THREE.LineBasicMaterial({ color: '#00e5a0', transparent: true, opacity: 0.55 });

  let triangles = 0, vertices = 0;
  const passes = { wire: [], clay: [], final: [] };
  for (const mesh of meshes) {
    const geo = mesh.geometry;
    vertices += geo.attributes.position.count;
    triangles += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;

    const mats = [].concat(mesh.material);
    const finalMats = mats.map((m) => finalSet[m.name]);
    const finalMesh = mesh;
    finalMesh.material = Array.isArray(mesh.material) ? finalMats : finalMats[0];
    passes.final.push(finalMesh);

    const clayMesh = new THREE.Mesh(geo, clay);
    const fillMesh = new THREE.Mesh(geo, fill);
    const lines = new THREE.LineSegments(new THREE.WireframeGeometry(geo), lineMat);
    for (const o of [clayMesh, fillMesh, lines]) {
      o.position.copy(mesh.position);
      o.quaternion.copy(mesh.quaternion);
      o.scale.copy(mesh.scale);
      mesh.parent.add(o);
    }
    passes.clay.push(clayMesh);
    passes.wire.push(fillMesh, lines);
  }

  const stats = {
    triangles: Math.round(triangles),
    vertices,
    materials: Object.keys(source).length,
    aoSize: ao.image ? `${ao.image.width}×${ao.image.height}` : null,
  };

  /* every material that belongs to a pass, with its resting opacity */
  const passMats = {
    wire: [[fill, 1], [lineMat, 0.55]],
    clay: [[clay, 1]],
    final: Object.values(finalSet).map((m) => [m, m.name === 'Dome' ? 0.55 : 1]),
  };
  const weight = { wire: 0, clay: 0, final: 1 };
  let mode = 'final';

  const applyWeights = () => {
    for (const k of MODES) {
      const w = weight[k];
      for (const o of passes[k]) o.visible = w > 0.001;
      for (const [m, base] of passMats[k]) {
        m.opacity = base * w;
        /* opaque again once fully in, so depth sorting stays correct */
        if (base === 1) {
          m.transparent = w < 0.999;
          m.depthWrite = w > 0.5;
        }
      }
    }
  };
  applyWeights();

  let spin = 0.6;
  let w = 1, h = 1;

  return {
    stats,
    setMode(next, instant = false) {
      if (!MODES.includes(next)) return;
      mode = next;
      if (instant) {
        for (const k of MODES) weight[k] = k === mode ? 1 : 0;
        applyWeights();
      }
    },
    resize(width, height, dpr) {
      w = Math.max(1, width); h = Math.max(1, height);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    tick(dt, still) {
      let moving = false;
      for (const k of MODES) {
        const target = k === mode ? 1 : 0;
        const d = target - weight[k];
        if (Math.abs(d) > 0.001) {
          weight[k] += Math.sign(d) * Math.min(Math.abs(d), dt / FADE);
          moving = true;
        } else weight[k] = target;
      }
      if (moving) applyWeights();
      if (!still) spin += dt * 0.35;
      turntable.rotation.y = spin;
      renderer.render(scene, camera);
    },
    dispose() {
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      for (const m of [clay, fill, lineMat, ...Object.values(finalSet)]) m.dispose();
      ao.dispose();
      renderer.dispose();
    },
  };
}
