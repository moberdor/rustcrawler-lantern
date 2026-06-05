import { VIEW } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { LevelScene } from './scenes/LevelScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { WinScene } from './scenes/WinScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';
import { driftLevel } from './levels/driftLevel.js';
import { sumpLevel } from './levels/sumpLevel.js';

const thresholdObjectives = [
  { type: 'coin', label: 'COLLECT COINS FOR SCORE' },
  { type: 'key', label: 'FIND THE KEY' },
  { type: 'door', label: 'REACH THE DOOR' },
];
const threshold = new LevelScene('Threshold', { tiledKey: 'threshold', objectives: thresholdObjectives }, 'Drift', 'THRESHOLD');
const drift = new LevelScene('Drift', { data: driftLevel }, 'Sump', 'DRIFT');
const sump = new LevelScene('Sump', { data: sumpLevel }, 'Win', 'THE SUMP');

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.WIDTH,
  height: VIEW.HEIGHT,
  zoom: VIEW.ZOOM,
  backgroundColor: '#000000',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, threshold, drift, sump, GameOverScene, WinScene, CreditsScene],
};

new Phaser.Game(config);
