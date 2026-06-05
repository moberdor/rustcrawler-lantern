import { emptyGrid, buildIsland, placePlatform } from './terrain.js';

const W = 50, H = 16;

function buildTerrain() {
  const g = emptyGrid(W, H);

  buildIsland(g, 0, 8, 12);
  buildIsland(g, 14, 30, 12);
  buildIsland(g, 36, 49, 12);

  placePlatform(g, 8, 3, 5);
  placePlatform(g, 6, 18, 20);
  placePlatform(g, 5, 24, 26);
  placePlatform(g, 7, 40, 42);

  return g;
}

export const driftLevel = {
  name: 'DRIFT',
  width: W,
  height: H,
  terrain: buildTerrain(),
  objectives: [
    { type: 'plate', label: 'STEP ON PLATES TO ACTIVATE' },
    { type: 'lamp_on', label: 'LAMPS LIGHT WHEN POWERED' },
    { type: 'sentinel', label: 'STAY OUT OF SENTINEL SIGHT' },
    { type: 'lantern_off', label: 'PRESS Q TO DOUSE THE LANTERN' },
    { type: 'key', label: 'GET THE KEY, REACH THE DOOR' },
  ],
  spawn: { x: 32, y: 184 },
  coins: [
    { x: 56, y: 176 }, { x: 72, y: 176 },
    { x: 64, y: 120 },
    { x: 288, y: 96 }, { x: 304, y: 96 }, { x: 320, y: 96 },
    { x: 400, y: 72 },
    { x: 600, y: 176 }, { x: 624, y: 176 },
    { x: 656, y: 104 },
  ],
  gems: [
    { x: 400, y: 72 },
  ],
  plates: [
    { x: 64, y: 184, name: 'plate1', targets: 'lamp1' },
    { x: 280, y: 184, name: 'plate2', targets: 'lamp2' },
  ],
  lamps: [
    { x: 400, y: 56, name: 'lamp1', startOn: false },
    { x: 656, y: 88, name: 'lamp2', startOn: false },
  ],
  movingPlatforms: [
    { x: 144, y: 192, w: 48, dx: 0, dy: -56, duration: 2200 },
    { x: 496, y: 192, w: 48, dx: 0, dy: -56, duration: 2400 },
  ],
  sentinels: [
    { x: 376, y: 120, facing: 90 },
  ],
  spikes: [
    { x: 320, y: 176, w: 32, h: 16 },
    { x: 432, y: 176, w: 32, h: 16 },
  ],
  pits: [
    { x: 144, y: 240, w: 80, h: 32 },
    { x: 496, y: 240, w: 80, h: 32 },
  ],
  key: { x: 656, y: 96 },
  door: { x: 720, y: 184 },
};
