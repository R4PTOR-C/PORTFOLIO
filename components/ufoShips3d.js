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

   In the arcade the player's saucer also carries its loadout as hardware:
   a turret that tracks the target and changes with the gun and its level,
   armour plates, capacitor coils, bombs on the hull, the tractor ring, a
   shield bubble while invulnerable, and mini-saucer drones. Every shot is
   drawn here too, as lit instanced meshes with an additive glow.

   Model and baked AO come from tools/ufo/build_ufo.py (Blender + Cycles).
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

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
  drone: {
    Hull: '#c3c9cf', Panel: '#7e858d', Rim: '#4d545c', Belly: '#24282e',
    Dome: '#8b5cf6', Core: '#c4b5fd', Lamp: '#a78bfa', Lens: '#c4b5fd', Neon: '#a78bfa',
  },
  /* the other foe types, so each reads at a glance */
  dart: {
    Hull: '#a83c8f', Panel: '#6a1d5a', Rim: '#3d0f35', Belly: '#1c0619',
    Dome: '#ff2bd6', Core: '#ff8ae8', Lamp: '#ff2bd6', Lens: '#ff8ae8', Neon: '#ff2bd6',
  },
  gunner: {
    Hull: '#b9823a', Panel: '#7a4f1c', Rim: '#43290c', Belly: '#1f1306',
    Dome: '#ff9d2e', Core: '#ffc27a', Lamp: '#ff4545', Lens: '#ffc27a', Neon: '#ff9d2e',
  },
  tank: {
    Hull: '#6f6a93', Panel: '#46406b', Rim: '#28233f', Belly: '#120f1f',
    Dome: '#8b5cf6', Core: '#c4b5fd', Lamp: '#ff4545', Lens: '#c4b5fd', Neon: '#a78bfa',
  },
  boss: {
    Hull: '#8e2a2a', Panel: '#4e1212', Rim: '#2a0808', Belly: '#140303',
    Dome: '#ff4545', Core: '#ffd166', Lamp: '#ffd166', Lens: '#ffd166', Neon: '#ff4545',
  },
};
const EMISSIVE = { Core: 1.2, Lamp: 1.6, Lens: 2.4, Neon: 2.4 };
const WEAPON_COLOR = { twin: '#00e5a0', spread: '#ff9d2e', laser: '#4cc9ff', homing: '#ff2bd6' };
const MAX_SHOTS = 700;
const BULLET_Z = 80;                 // in front of every hull
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
  const pools = {};                    // palette → idle ships

  let view = 0;                        // 0 = side (idle), 1 = top-down (arcade)
  let w = 1, h = 1;

  const pose = (s, { x, y, scale, roll, yaw, flash, t, visible }) => {
    s.root.visible = visible;
    if (!visible) return;
    s.root.position.set(x, -y, 0);
    s.root.scale.setScalar(HALF_WIDTH * scale);
    s.root.rotation.set(lerp(PITCH_IDLE, PITCH_PLAY, ease(view)), 0, -roll);
    s.body.rotation.y = yaw;           // the hull spins; the rig on the root holds its heading
    const m = s.mats;
    const pulse = 0.6 + Math.sin(t * 4.2) * 0.4;
    m.Lamp.emissiveIntensity = EMISSIVE.Lamp * (0.55 + pulse * 0.6) + flash * 4;
    m.Neon.emissiveIntensity = EMISSIVE.Neon * clamp(0.45 + Math.sin(t * 3.4) * 0.55, 0.15, 1);
    for (const n of AO_MATS) m[n].emissiveIntensity = flash * (s.kind === 'boss' ? 0.5 : 1.6);
  };


  /* ── player hardware ──────────────────────────────────────────────────
     Built in the model's own units (rim radius 1, Y up). Looking down in
     the arcade, local +X is screen right and local +Z is screen down, so a
     part modelled along +X and turned by -aim points at the target. */
  const gunMetal = new THREE.MeshStandardMaterial({ color: '#3b434d', metalness: 0.85, roughness: 0.3 });
  const plateMetal = new THREE.MeshStandardMaterial({ color: '#8d969f', metalness: 0.75, roughness: 0.35 });
  const glowMats = new Map();
  const glowMat = (hex, k = 2.2) => {
    const key = hex + k;
    if (!glowMats.has(key)) {
      glowMats.set(key, new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: k, roughness: 0.4 }));
    }
    return glowMats.get(key);
  };
  const box = (sx, sy, sz, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    m.position.set(x, y, z);
    return m;
  };
  /* cylinder lying along +X; rTip is the radius at the +X end */
  const tube = (rBase, rTip, len, mat, x = 0, y = 0, z = 0, segs = 14) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTip, rBase, len, segs), mat);
    m.rotation.z = -Math.PI / 2;
    m.position.set(x, y, z);
    return m;
  };
  const ringX = (R, r, mat, x, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, 24), mat);
    m.rotation.y = Math.PI / 2;      // ring around the X axis
    m.position.set(x, y, z);
    return m;
  };
  const disposeTree = (o) => o.traverse((c) => { if (c.isMesh) c.geometry.dispose(); });

  const rig = new THREE.Group();
  player.root.add(rig);
  const turret = new THREE.Group();
  rig.add(turret);
  let gun = null, gunKey = '', tips = [];

  const Y = 0.24;                      // gun deck height, just above the hull
  const buildGun = (type, lvl) => {
    const c = WEAPON_COLOR[type];
    const glow = glowMat(c);
    const gr = new THREE.Group();
    const tipList = [];
    /* turret ring round the dome collar, shared by every gun */
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.035, 8, 40), gunMetal);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.22;
    gr.add(ring);
    gr.add(box(0.16, 0.05, 0.16, glow, 0.45, 0.26, 0));
    if (type === 'twin') {
      const offs = [[-0.16, 0.16], [-0.2, 0, 0.2], [-0.27, -0.09, 0.09, 0.27]][lvl - 1];
      gr.add(box(0.42, 0.13, Math.abs(offs[0]) * 2 + 0.18, gunMetal, 0.52, 0.22, 0));
      for (const z of offs) {
        gr.add(tube(0.05, 0.042, 0.74, gunMetal, 0.98, Y, z));
        gr.add(box(0.5, 0.014, 0.022, glow, 0.96, Y + 0.045, z));
        gr.add(tube(0.065, 0.065, 0.07, glow, 1.36, Y, z));
        tipList.push(new THREE.Vector3(1.42, Y, z));
      }
    } else if (type === 'spread') {
      const n = [3, 5, 7][lvl - 1];
      gr.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.12, 24), gunMetal).translateX(0.42).translateY(0.22));
      for (let i = 0; i < n; i++) {
        const piv = new THREE.Group();
        piv.position.set(0.42, Y, 0);
        piv.rotation.y = -(i - (n - 1) / 2) * 0.26;
        piv.add(tube(0.035, 0.08, 0.56, gunMetal, 0.46, 0, 0));
        piv.add(tube(0.085, 0.085, 0.05, glow, 0.75, 0, 0));
        gr.add(piv);
        const a = piv.rotation.y;
        tipList.push(new THREE.Vector3(0.42 + Math.cos(a) * 0.8, Y, -Math.sin(a) * 0.8));
      }
    } else if (type === 'laser') {
      const offs = [[0], [-0.13, 0.13], [-0.22, 0, 0.22]][lvl - 1];
      gr.add(box(0.36, 0.12, Math.abs(offs[0]) * 2 + 0.2, gunMetal, 0.5, 0.22, 0));
      for (const z of offs) {
        gr.add(box(1.0, 0.05, 0.055, gunMetal, 0.9, Y, z));
        gr.add(box(0.9, 0.016, 0.03, glow, 0.92, Y + 0.033, z));
        for (const x of [0.62, 0.82, 1.02]) gr.add(ringX(0.07, 0.014, glow, x, Y, z));
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 10), glowMat(c, 3.2));
        tip.position.set(1.42, Y, z);
        gr.add(tip);
        tipList.push(new THREE.Vector3(1.45, Y, z));
      }
    } else {
      /* homing: a missile pod on each side, more warheads per level */
      const per = [2, 3, 4][lvl - 1];
      for (const side of [-1, 1]) {
        const z0 = side * 0.56;
        gr.add(box(0.62, 0.17, 0.28, gunMetal, 0.5, 0.2, z0));
        gr.add(box(0.5, 0.02, 0.3, glow, 0.48, 0.29, z0));
        for (let k = 0; k < per; k++) {
          const z = z0 + (k - (per - 1) / 2) * (0.22 / Math.max(1, per - 1)) * (per > 1 ? 1 : 0);
          const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 10), glowMat(c, 1.6));
          nose.rotation.z = -Math.PI / 2;
          nose.position.set(0.88, 0.22, z);
          gr.add(nose);
          tipList.push(new THREE.Vector3(0.96, 0.22, z));
        }
      }
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10), glowMat(c, 2.6));
      eye.position.set(0.62, 0.3, 0);
      gr.add(eye);
    }
    return { gr, tipList };
  };

  /* armour plates (hull upgrade) ride on the spinning body */
  const armour = new THREE.Group();
  player.body.add(armour);
  let armourLv = -1;
  const buildArmour = (lv) => {
    for (const c of [...armour.children]) { armour.remove(c); disposeTree(c); }
    for (let row = 0; row < Math.min(lv, 2); row++) {
      const n = 12, R = row ? 0.9 : 1.05, y = row ? 0.075 : 0.0;
      for (let i = 0; i < n; i++) {
        const a = ((i + row * 0.5) / n) * Math.PI * 2;
        const pl = box(0.34, 0.075, 0.08, plateMetal);
        pl.position.set(Math.cos(a) * R, y, Math.sin(a) * R);
        pl.rotation.y = -a + Math.PI / 2;
        if (lv >= 3) pl.add(box(0.26, 0.02, 0.03, glowMat('#ffd166', 1.8), 0, 0.045, 0));
        armour.add(pl);
      }
    }
  };

  /* bombs carried as red domes on the hull: you can count them */
  const bombs = new THREE.Group();
  player.body.add(bombs);
  const bombGeo = new THREE.SphereGeometry(0.09, 16, 10);
  const bombLit = glowMat('#ff4545', 2.4);
  const bombOff = new THREE.MeshStandardMaterial({ color: '#2a1416', metalness: 0.5, roughness: 0.5 });
  const bombMeshes = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(bombGeo, bombOff);
    bombs.add(m);
    bombMeshes.push(m);
  }

  /* capacitor coils (fire-rate upgrade): stacked rings that spin faster */
  const coils = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i * 0.07, 0.014, 6, 48, Math.PI * 1.45), glowMat('#ffb547', 2.4));
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.27 + i * 0.035;
    m.visible = false;
    rig.add(m);
    coils.push(m);
  }

  /* tractor ring (magnet upgrade): three arcs circling under the rim */
  const tractor = new THREE.Group();
  const tractorMat = new THREE.MeshBasicMaterial({ color: '#a78bfa', transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1, 0.016, 6, 40, 1.5), tractorMat);
    arc.rotation.set(Math.PI / 2, 0, (i / 3) * Math.PI * 2);
    tractor.add(arc);
  }
  tractor.position.y = -0.02;
  tractor.visible = false;
  rig.add(tractor);

  /* shield bubble while invulnerable: a fresnel shell */
  const shieldMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#00e5a0') }, uAlpha: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(normalMatrix * normal); vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAlpha; uniform float uTime; varying vec3 vN; varying vec3 vP;
      void main(){
        float f = pow(1.0 - abs(vN.z), 3.0);
        float grid = smoothstep(0.85, 1.0, abs(sin(vP.x * 18.0 + uTime * 1.5))) + smoothstep(0.85, 1.0, abs(sin(vP.z * 18.0 - uTime)));
        gl_FragColor = vec4(uColor * (0.025 + f * 1.9 + grid * 0.12) * uAlpha, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.3, 40, 20), shieldMat);
  shield.scale.set(1, 0.62, 1);
  shield.visible = false;
  rig.add(shield);

  /* escort drones: the player's saucer in miniature, in violet */
  const drones = [makeShip('drone'), makeShip('drone')];

  let turretA = -Math.PI / 2, coreLv = -1, neonHex = '';
  const updateRig = (g, dt) => {
    const p = g.p;
    const up = g.up || {};
    const arcade = g.mode !== 'idle';
    const k = arcade ? ease(clamp((view - 0.25) / 0.75, 0, 1)) : 0;
    rig.visible = k > 0.01;
    armour.visible = bombs.visible = rig.visible;
    if (!rig.visible) return;
    rig.scale.setScalar(k);
    armour.scale.setScalar(k);
    bombs.scale.setScalar(k);

    /* gun: rebuild when the weapon or its level changes */
    const key = `${p.weapon}${p.wlvl}`;
    if (key !== gunKey) {
      if (gun) { turret.remove(gun); disposeTree(gun); }
      const b = buildGun(p.weapon, p.wlvl);
      gun = b.gr; tips = b.tipList; gunKey = key;
      turret.add(gun);
      gun.scale.setScalar(0.6);       // pops in
    }
    gun.scale.setScalar(Math.min(1, gun.scale.x + dt * 3));
    let dA = Math.atan2(Math.sin((p.aim ?? -Math.PI / 2) - turretA), Math.cos((p.aim ?? -Math.PI / 2) - turretA));
    turretA += dA * (1 - Math.exp(-14 * dt));
    turret.rotation.y = -turretA;
    turret.position.x = -Math.cos(turretA) * 0.06 * (p.muzzle || 0);   // recoil
    turret.position.z = -Math.sin(turretA) * 0.06 * (p.muzzle || 0);

    /* trim lights take the gun's colour; the core heats up with damage */
    const hex = WEAPON_COLOR[p.weapon] || WEAPON_COLOR.twin;
    if (hex !== neonHex) {
      neonHex = hex;
      player.mats.Neon.color.set(hex);
      player.mats.Neon.emissive.set(hex);
    }
    const dl = up.dmg || 0;
    if (dl !== coreLv) {
      coreLv = dl;
      const hot = new THREE.Color('#7cc8f0').lerp(new THREE.Color('#ff6a3d'), dl / 3);
      player.mats.Core.color.copy(hot); player.mats.Core.emissive.copy(hot);
      player.mats.Core.emissiveIntensity = EMISSIVE.Core * (1 + dl * 0.7);
      player.mats.Lens.color.copy(hot); player.mats.Lens.emissive.copy(hot);
      player.mats.Dome.color.set('#2b9ada').lerp(new THREE.Color('#ff7a3d'), dl / 3);
    }

    if ((up.hull || 0) !== armourLv) { armourLv = up.hull || 0; buildArmour(armourLv); }

    const nb = p.maxBombs || 0;
    bombMeshes.forEach((m, i) => {
      m.visible = i < nb;
      if (!m.visible) return;
      const a = (i / nb) * Math.PI * 2 + 0.4;
      m.position.set(Math.cos(a) * 0.74, 0.11, Math.sin(a) * 0.74);
      m.material = i < p.bombs ? bombLit : bombOff;
    });

    coils.forEach((m, i) => {
      m.visible = i < (up.rate || 0);
      m.rotation.z += dt * (4 + i * 2.5) * (i % 2 ? -1 : 1);
    });

    const ml = up.magnet || 0;
    tractor.visible = ml > 0;
    if (ml) {
      tractor.scale.setScalar(1.35 + ml * 0.25);
      tractor.rotation.y += dt * 1.6;
      tractorMat.opacity = 0.45 + Math.sin(g.t * 5) * 0.25;
    }

    const sh = p.invuln > 0 && g.mode !== 'over' ? clamp(p.invuln / 0.4, 0, 1) : 0;
    shield.visible = sh > 0.01;
    shieldMat.uniforms.uAlpha.value = sh * (p.invuln < 0.6 ? 0.55 + Math.sin(g.t * 40) * 0.45 : 1);
    shieldMat.uniforms.uTime.value = g.t;
    shield.rotation.y += dt * 0.8;

    const nd = arcade && g.mode !== 'over' ? up.drone || 0 : 0;
    drones.forEach((d, i) => {
      const a = (p.droneA || 0) + i * Math.PI;
      pose(d, {
        x: p.x + Math.cos(a) * 58 * g.ui, y: p.y + Math.sin(a) * 26 * g.ui,
        scale: 0.36 * g.ui * k, roll: 0, yaw: g.t * 3, flash: 0, t: g.t + i, visible: i < nd,
      });
    });
  };

  /* ── shots ────────────────────────────────────────────────────────────
     One instanced mesh per shape, lit like the ships, tinted per instance
     (the tint also drives the emissive so each bolt glows its own colour),
     plus one additive billboard pass for the glow around every shot. */
  const tinted = (mat) => {
    mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n  totalEmissiveRadiance *= vColor.rgb;\n#endif',
      );
    };
    return mat;
  };
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const WHITE = new THREE.Color('#ffffff');
  const inst = (geo, mat, order, max = MAX_SHOTS) => {
    const m = new THREE.InstancedMesh(geo, mat, max);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.setColorAt(0, WHITE);          // allocates instanceColor so the shader gets USE_COLOR
    m.count = 0;
    m.frustumCulled = false;
    m.renderOrder = order;
    scene.add(m);
    return m;
  };
  const energy = () => tinted(new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 1.5, metalness: 0.1, roughness: 0.25 }));

  const missileGeo = (() => {
    const body = new THREE.LatheGeometry(
      [[0, -7], [2.1, -6.4], [2.6, -3], [2.6, 3], [1.9, 6.2], [0.9, 8.2], [0, 9]].map(([r, y]) => new THREE.Vector2(r, y)), 12);
    const fins = [0, 1, 2, 3].map((i) => {
      const f = new THREE.BoxGeometry(0.6, 4, 3.4).translate(0, -5, 2.4);
      f.rotateY((i * Math.PI) / 2);
      return f;
    });
    return mergeGeometries([body.toNonIndexed(), ...fins.map((f) => f.toNonIndexed())]).rotateZ(-Math.PI / 2);
  })();

  const shots = {
    bolt: inst(new THREE.CapsuleGeometry(2.3, 12, 4, 10).rotateZ(Math.PI / 2), energy(), 5),
    laser: inst(new THREE.CylinderGeometry(2, 2, 66, 10, 1).rotateZ(Math.PI / 2).translate(-24, 0, 0), energy(), 5),
    missile: inst(missileGeo, new THREE.MeshStandardMaterial({ color: '#e4e8ee', metalness: 0.7, roughness: 0.25 }), 5),
    orb: inst(new THREE.SphereGeometry(1, 16, 12), energy(), 5),
    dart: inst(new THREE.OctahedronGeometry(1), energy(), 5),
  };
  const glows = inst(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: glowTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), 9, MAX_SHOTS * 2);

  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(0, 0, 0, 'ZYX');
  const P = new THREE.Vector3(), S = new THREE.Vector3(), T = new THREE.Vector3();
  const colors = new Map();
  const col = (hex) => {
    if (!colors.has(hex)) colors.set(hex, new THREE.Color(hex));
    return colors.get(hex);
  };
  const tmpC = new THREE.Color();
  let gi = 0;
  const glowAt = (x, y, sx, sy, rot, hex, power) => {
    if (gi >= MAX_SHOTS * 2) return;
    E.set(0, 0, rot);
    Q.setFromEuler(E);
    M4.compose(P.set(x, y, BULLET_Z + 20), Q, S.set(sx, sy, 1));
    glows.setMatrixAt(gi, M4);
    glows.setColorAt(gi, tmpC.copy(col(hex)).multiplyScalar(power));
    gi++;
  };
  const put = (mesh, i, x, y, rot, spin, sx, sy, sz, hex) => {
    E.set(spin, 0, rot);
    Q.setFromEuler(E);
    M4.compose(P.set(x, y, BULLET_Z), Q, S.set(sx, sy, sz));
    mesh.setMatrixAt(i, M4);
    if (hex) mesh.setColorAt(i, col(hex));
  };

  const renderShots = (g) => {
    const n = { bolt: 0, laser: 0, missile: 0, orb: 0, dart: 0 };
    gi = 0;
    for (const b of g.bullets) {
      const x = b.x, y = -b.y;
      const rot = -Math.atan2(b.vy, b.vx);
      const hex = b.color || (b.friendly ? WEAPON_COLOR.twin : '#ff4545');
      if (b.style === 'laser') {
        if (n.laser < MAX_SHOTS) put(shots.laser, n.laser++, x, y, rot, 0, 1, 1, 1, hex);
        glowAt(x - Math.cos(rot) * 24, y - Math.sin(rot) * 24, 96, 16, rot, hex, 0.9);
      } else if (b.style === 'missile') {
        if (n.missile < MAX_SHOTS) put(shots.missile, n.missile++, x, y, rot, g.t * 9, 1, 1, 1, null);
        glowAt(x - Math.cos(rot) * 9, y - Math.sin(rot) * 9, 22, 22, 0, hex, 1.4);
      } else if (b.style === 'orb') {
        const r = b.r || 6;
        if (n.orb < MAX_SHOTS) put(shots.orb, n.orb++, x, y, 0, 0, r, r, r, hex);
        glowAt(x, y, r * 5, r * 5, 0, hex, 0.8);
      } else if (!b.friendly) {
        if (n.dart < MAX_SHOTS) put(shots.dart, n.dart++, x, y, rot, g.t * 10, 10, 3.8, 3.8, hex);
        glowAt(x, y, 38, 22, rot, hex, 0.8);
      } else {
        if (n.bolt < MAX_SHOTS) put(shots.bolt, n.bolt++, x, y, rot, 0, 1, 1, 1, hex);
        glowAt(x - Math.cos(rot) * 6, y - Math.sin(rot) * 6, 42, 16, rot, hex, 0.75);
      }
    }
    /* muzzle flashes at the turret tips */
    const mz = g.p.muzzle || 0;
    if (rig.visible && mz > 0.05) {
      player.root.updateMatrixWorld(true);
      const hex = WEAPON_COLOR[g.p.weapon] || WEAPON_COLOR.twin;
      for (const tp of tips) {
        T.copy(tp).applyMatrix4(turret.matrixWorld);
        const sz = (18 + mz * 26) * g.ui;
        glowAt(T.x, T.y, sz, sz, 0, hex, mz * 1.4);
      }
    }
    for (const [k, m] of Object.entries(shots)) {
      m.count = n[k];
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    glows.count = gi;
    glows.instanceMatrix.needsUpdate = true;
    if (glows.instanceColor) glows.instanceColor.needsUpdate = true;
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
      pose(player, {
        x: p.x, y: p.y, scale: p.scale * g.ui * (1 + g.hover * 0.12),
        roll: p.roll + p.spin, yaw: g.t * 0.6, flash: p.flash, t: g.t,
        visible: g.mode !== 'over',
      });
      updateRig(g, dt);

      const alive = new Set(g.enemies);
      for (const [e, s] of foes) {
        if (alive.has(e)) continue;
        s.root.visible = false;
        foes.delete(e);
        (pools[s.kind] ||= []).push(s);
      }
      for (const e of g.enemies) {
        let s = foes.get(e);
        if (!s) {
          const kind = PALETTES[e.pal] ? e.pal : 'foe';
          s = (pools[kind] && pools[kind].pop()) || makeShip(kind);
          foes.set(e, s);
        }
        if (s.fins) s.fins.visible = e.big;
        pose(s, {
          x: e.x, y: e.y, scale: e.scale, roll: e.roll,
          yaw: e.big ? e.spin : g.t * 0.9 + e.phase, flash: e.flash, t: g.t + e.phase,
          visible: true,
        });
      }

      renderShots(g);
      renderer.render(scene, camera);
    },

    dispose() {
      renderer.dispose();
      for (const s of [player, ...drones, ...foes.values(), ...Object.values(pools).flat()]) for (const m of Object.values(s.mats)) m.dispose();
      scene.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
      for (const m of [gunMetal, plateMetal, bombOff, tractorMat, shieldMat, glows.material, ...glowMats.values(), ...Object.values(shots).map((x) => x.material)]) m.dispose();
      glowTex.dispose();
      ao.dispose();
    },
  };
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
