/*
 * RUSTCRAWLER - CMPM 120 Final Project
 * Marcus Oberdorfer (moberdor)
 *
 *  - Lantern lighting: 
 *    - A RenderTexture is drawn each frame with a radial gradient brush at the player and every light source.
 *    - The RenderTexture is used as an inverted BitmapMask over a black overlay covering the entire level so everything is dark outside of the lights.
 *    - Pressing Q disables the player's lamp so they can hide from the sentinel AI enemies.
 *
 *  - Sentinel AI:
 *    - Self made A* over the tilemap drives chase paths towards the player. (Pathfinding.js, no library from elsewhere)
 *    - Tile sampling raycast (Vision.js) is the visibility check that the Sentinel AIs use.
 *    - Sentinels have three patrol state, alert state, chase state.
 *    - Alert state holds for ~1.5 seconds so sentinels dont instantly lose the player when line of sight is lost.
 *
 *  - Switch system: 
 *    - PressurePlate and Lever both extend a Switch base class. 
 *    - Switches store target names, and the scene associates them with triggerable objects (Lamps and MovingPlatforms) from name lookup.
 *    - Set up from the level, not hardcoded.
 *
 *  - Black and white 1-bit pixel art style from Kenney 1-bit platformer pack
 * 
 *  - Procedural cave parallax background generated in BootScene, not from an image
 * 
 *  - Briefing screens with sprite previews and objective before each level
 */
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
