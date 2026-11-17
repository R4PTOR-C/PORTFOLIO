/* How the saucer looks, shared by the game layer (ufoShips3d.js) and the
   workbench in the About section (ufoWorkbench.js). Keys are the Blender
   material names from tools/ufo/build_ufo.py. */
/* Same split as the sprite palettes: the player is silver and blue, foes are
   the same ship read through reds. Keys are Blender material names. */
export const PALETTES = {
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
export const EMISSIVE = { Core: 1.2, Lamp: 1.6, Lens: 2.4, Neon: 2.4 };
export const AO_MATS = ['Hull', 'Panel', 'Rim', 'Belly'];
