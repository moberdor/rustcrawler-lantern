import { emptyGrid, buildIsland, placePlatform } from './terrain.js';

const W = 40, H = 16;

function buildTerrain() {
  const g = emptyGrid(W, H);

  buildIsland(g, 0, 9, 12);
  buildIsland(g, 24, 39, 12);

  placePlatform(g, 9, 33, 35);
  placePlatform(g, 5, 12, 15);

  return g;
}

export const driftLevel = {
  name: 'DRIFT',
  width: W,
  height: H,
  terrain: buildTerrain(),
  spawn: { x: 40, y: 184 },
  coins: [
    { x: 72, y: 176 }, { x: 120, y: 176 },
    { x: 216, y: 72 }, { x: 248, y: 72 },
    { x: 408, y: 176 }, { x: 432, y: 176 },
  ],
  gems: [
    { x: 232, y: 56 },
  ],
  plates: [
    { x: 88, y: 184, name: 'plate1', targets: 'lamp1' },
  ],
  lamps: [
    { x: 160, y: 96, name: 'lamp1', startOn: false },
  ],
  movingPlatforms: [
    { x: 176, y: 192, w: 48, dx: 0, dy: -48, duration: 2400 },
    { x: 272, y: 192, w: 48, dx: 0, dy: -48, duration: 2400 },
  ],
  sentinels: [
    { x: 460, y: 152, facing: 180 },
  ],
  key: { x: 552, y: 136 },
  door: { x: 600, y: 184 },
  pits: [
    { x: 160, y: 240, w: 224, h: 32 },
  ],
};
