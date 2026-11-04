/* ═══════════════════════════════════════════════════════════════════════════
   3D ship layer for the UFO game
   ───────────────────────────────────────────────────────────────────────────
   A WebGL canvas under the 2D game canvas. The game keeps its own state and
   physics in screen pixels; this module only mirrors that state as meshes.
   An orthographic camera maps one world unit to one CSS pixel, so a ship at
   (x, y) on screen is simply at (x, -y) here.

   The view angle is the point of the whole thing: while idle the saucer is
   seen from the side, floating over the page; when the arcade boots it
   pitches over to a top-down view, and back again on exit.

   Model and baked AO come from tools/ufo/build_ufo.py (Blender + Cycles).
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const PITCH_IDLE = 0.2;    // a little of the top shows, like the sprite did
const PITCH_PLAY = 1.08;   // ~62°: dome and rim ring read from above
const HALF_WIDTH = 40;     // the game's body half-width in local units

/* Same split as the sprite palettes: the player is silver and blue, foes are
   the same ship read through reds. Keys are Blender material names. */
const PALETTES = {
  ship: {
    Hull: '#c3c9cf', Panel: '#7e858d', Rim: '#4d545c', Belly: '#24282e',
    Dome: '#2b9ada', Core: '#7cc8f0', Lamp: '#ff9d2e', Lens: '#7cc8f0', Neon: '#00e5a0',
  },
  foe: {
    Hull: '#b44a4a', Panel: '#7a2222', Rim: '#4a1010', Belly: '#220707',
    Dome: '#c02828', Core: '#ff6b6b', Lamp: '#ff9d2e', Lens: '#ff6b6b', Neon: '#ff4545',
  },
};
const EMISSIVE = { Core: 1.2, Lamp: 1.6, Lens: 2.4, Neon: 2.4 };
const AO_MATS = ['Hull', 'Panel', 'Rim', 'Belly'];

export async function createShipLayer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  /* key from the upper left, as the sprite was lit; cool rim from behind */
  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x0a1220, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-1, 1.4, 1.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6ba6fb, 1.4);
  rim.position.set(1.2, 0.6, -1.4);
  scene.add(rim);

  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  camera.position.z = 1000;

  const base = '/models/';
  const [gltf, ao] = await Promise.all([
    new GLTFLoader().loadAsync(`${base}ufo.glb`),
    new THREE.TextureLoader().loadAsync(`${base}ufo-ao.jpg`),
  ]);
  ao.flipY = false;                   // glTF UV convention
  ao.colorSpace = THREE.NoColorSpace;

  /* one material set per palette, restyled by name from the glTF originals */
  const source = {};
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) source[m.name] = m;
  });

  const buildSet = (pal) => {
    const set = {};
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
        } else {
          mat.emissive = new THREE.Color('#ffffff');
          mat.emissiveIntensity = 0;   // driven by the damage flash
        }
      }
      if (AO_MATS.includes(name)) { mat.aoMap = ao; mat.aoMapIntensity = 1; }
      set[name] = mat;
    }
    return set;
  };

  const makeShip = (kind) => {
    const mats = buildSet(PALETTES[kind]);
    const root = new THREE.Group();
    const body = gltf.scene.clone(true);
    body.traverse((o) => {
      if (!o.isMesh) return;
      o.material = Array.isArray(o.material) ? o.material.map((m) => mats[m.name]) : mats[o.material.name];
    });
    const fins = body.getObjectByName('Fins');
    if (fins) fins.visible = false;
    root.add(body);
    root.rotation.order = 'ZXY';       // yaw about the ship's own axis, then pitch, then bank
    scene.add(root);
    return { root, body, fins, mats, kind };
  };

  const player = makeShip('ship');
  const foes = new Map();              // game enemy object → ship
  const pool = [];

  let view = 0;                        // 0 = side (idle), 1 = top-down (arcade)
  let w = 1, h = 1;

  const pose = (s, { x, y, scale, roll, yaw, flash, t, visible }) => {
    s.root.visible = visible;
    if (!visible) return;
    s.root.position.set(x, -y, 0);
    s.root.scale.setScalar(HALF_WIDTH * scale);
    s.root.rotation.set(lerp(PITCH_IDLE, PITCH_PLAY, ease(view)), yaw, -roll);
    const m = s.mats;
    const pulse = 0.6 + Math.sin(t * 4.2) * 0.4;
    m.Lamp.emissiveIntensity = EMISSIVE.Lamp * (0.55 + pulse * 0.6) + flash * 4;
    m.Neon.emissiveIntensity = EMISSIVE.Neon * clamp(0.45 + Math.sin(t * 3.4) * 0.55, 0.15, 1);
    for (const n of AO_MATS) m[n].emissiveIntensity = flash * 1.6;
  };

  return {
    resize(width, height, dpr) {
      w = width; h = height;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h;
      camera.updateProjectionMatrix();
    },

    /* g is the game state from UFO.jsx; ox/oy is this frame's screen shake */
    render(g, dt, ox, oy) {
      const target = g.mode === 'idle' ? 0 : 1;
      view += (target - view) * (1 - Math.exp(-(g.reduced ? 30 : 3.2) * dt));
      camera.position.x = -ox;
      camera.position.y = oy;

      const p = g.p;
      const blink = p.invuln > 0 && Math.floor(g.t * 14) % 2 === 0;
      pose(player, {
        x: p.x, y: p.y, scale: p.scale * g.ui * (1 + g.hover * 0.12),
        roll: p.roll + p.spin, yaw: g.t * 0.6, flash: p.flash, t: g.t,
        visible: g.mode !== 'over' && !blink,
      });

      const alive = new Set(g.enemies);
      for (const [e, s] of foes) {
        if (alive.has(e)) continue;
        s.root.visible = false;
        foes.delete(e);
        pool.push(s);
      }
      for (const e of g.enemies) {
        let s = foes.get(e);
        if (!s) {
          s = pool.pop() || makeShip('foe');
          foes.set(e, s);
        }
        if (s.fins) s.fins.visible = e.big;
        pose(s, {
          x: e.x, y: e.y, scale: e.scale, roll: e.roll,
          yaw: e.big ? e.spin : g.t * 0.9 + e.phase, flash: e.flash, t: g.t + e.phase,
          visible: true,
        });
      }

      renderer.render(scene, camera);
    },

    dispose() {
      renderer.dispose();
      for (const s of [player, ...foes.values(), ...pool]) for (const m of Object.values(s.mats)) m.dispose();
      ao.dispose();
    },
  };
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
