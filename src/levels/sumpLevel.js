import { emptyGrid, buildIsland, placePlatform } from './terrain.js';

const W = 50, H = 16;

function buildTerrain() {
  const g = emptyGrid(W, H);

  buildIsland(g, 0, 7, 12);
  buildIsland(g, 14, 26, 12);
  buildIsland(g, 33, 49, 12);

  placePlatform(g, 7, 16, 18);
  placePlatform(g, 6, 22, 24);
  placePlatform(g, 8, 37, 39);

  return g;
}

export const sumpLevel = {
  name: 'THE SUMP',
  width: W,
  height: H,
  terrain: buildTerrain(),
  spawn: { x: 40, y: 184 },
  coins: [
    { x: 72, y: 176 }, { x: 96, y: 176 },
    { x: 248, y: 176 }, { x: 296, y: 176 },
    { x: 280, y: 104 }, { x: 296, y: 104 },
    { x: 376, y: 80 },
    { x: 560, y: 176 }, { x: 576, y: 176 },
    { x: 616, y: 120 },
  ],
  gems: [
    { x: 632, y: 120 },
  ],
  levers: [
    { x: 104, y: 184, name: 'lev1', targets: 'plat1,lamp1,lamp2' },
  ],
  lamps: [
    { x: 376, y: 64, name: 'lamp1', startOn: false },
    { x: 632, y: 88, name: 'lamp2', startOn: false },
  ],
  movingPlatforms: [
    { x: 144, y: 192, w: 48, dx: 0, dy: -56, duration: 2400, triggerable: true, name: 'plat1' },
    { x: 432, y: 192, w: 64, dx: 0, dy: -56, duration: 2200 },
  ],
  sentinels: [
    { x: 312, y: 152, facing: 0 },
    { x: 600, y: 136, facing: 180 },
  ],
  pits: [
    { x: 128, y: 240, w: 96, h: 32 },
    { x: 432, y: 240, w: 96, h: 32 },
  ],
  key: { x: 376, y: 184 },
  door: { x: 760, y: 184 },
};
