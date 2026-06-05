import { emptyGrid, buildIsland, placePlatform } from './terrain.js';

const W = 60, H = 16;

function buildTerrain() {
  const g = emptyGrid(W, H);

  buildIsland(g, 0, 7, 12);
  buildIsland(g, 13, 22, 12);
  buildIsland(g, 28, 38, 12);
  buildIsland(g, 44, 59, 12);

  placePlatform(g, 7, 16, 18);
  placePlatform(g, 5, 31, 33);
  placePlatform(g, 7, 48, 50);
  placePlatform(g, 4, 53, 55);

  return g;
}

export const sumpLevel = {
  name: 'THE SUMP',
  width: W,
  height: H,
  terrain: buildTerrain(),
  objectives: [
    { type: 'lever', label: 'PULL LEVERS WITH E' },
    { type: 'sentinel', label: 'THREE SENTINELS PATROL' },
    { type: 'lantern_off', label: 'DOUSE LANTERN TO HIDE' },
    { type: 'lamp_on', label: 'LIGHT LAMPS TO REVEAL THE PATH' },
    { type: 'key', label: 'KEY AND DOOR ARE GUARDED' },
  ],
  spawn: { x: 32, y: 184 },
  coins: [
    { x: 56, y: 176 }, { x: 80, y: 176 },
    { x: 248, y: 176 }, { x: 280, y: 176 }, { x: 312, y: 176 },
    { x: 504, y: 80 }, { x: 520, y: 80 },
    { x: 720, y: 176 }, { x: 760, y: 176 },
    { x: 872, y: 56 },
  ],
  gems: [
    { x: 528, y: 64 },
    { x: 528, y: 176 },
  ],
  levers: [
    { x: 96, y: 184, name: 'lev1', targets: 'plat1,lamp1' },
    { x: 552, y: 184, name: 'lev2', targets: 'plat2,lamp2' },
  ],
  lamps: [
    { x: 280, y: 80, name: 'lamp1', startOn: false },
    { x: 720, y: 80, name: 'lamp2', startOn: false },
  ],
  movingPlatforms: [
    { x: 128, y: 192, w: 64, dx: 0, dy: -48, duration: 2300, triggerable: true, name: 'plat1' },
    { x: 368, y: 192, w: 64, dx: 0, dy: -56, duration: 2100 },
    { x: 608, y: 192, w: 64, dx: 0, dy: -48, duration: 2400, triggerable: true, name: 'plat2' },
  ],
  sentinels: [
    { x: 280, y: 96, facing: 90 },
    { x: 528, y: 152, facing: 180 },
    { x: 776, y: 96, facing: 90 },
  ],
  spikes: [
    { x: 240, y: 176, w: 32, h: 16 },
    { x: 488, y: 176, w: 32, h: 16 },
    { x: 736, y: 176, w: 32, h: 16 },
  ],
  pits: [
    { x: 128, y: 240, w: 96, h: 32 },
    { x: 368, y: 240, w: 96, h: 32 },
    { x: 608, y: 240, w: 96, h: 32 },
  ],
  key: { x: 528, y: 176 },
  door: { x: 920, y: 184 },
};
