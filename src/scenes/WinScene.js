import { VIEW } from '../config.js';

const FONT = '"Press Start 2P"';

export class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }

  init(data) { this.finalScore = data?.score ?? 0; }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const farBg = this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_far')
      .setOrigin(0, 0).setDepth(-20).setAlpha(0.45);
    farBg.tileScaleY = VIEW.HEIGHT / 256;
    const nearBg = this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_near')
      .setOrigin(0, 0).setDepth(-10).setAlpha(0.3);
    nearBg.tileScaleY = VIEW.HEIGHT / 256;

    this.add.text(VIEW.WIDTH / 2, 110, 'YOU ESCAPED', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    this.add.text(VIEW.WIDTH / 2, 190, 'SCORE ' + this.finalScore, {
      fontFamily: FONT, fontSize: '11px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    const prompt = this.add.text(VIEW.WIDTH / 2, 270, 'PRESS R TO PLAY AGAIN', {
      fontFamily: FONT, fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.spawnConfetti();

    this.input.keyboard.once('keydown-R', () => this.scene.start('Threshold'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Threshold'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-C', () => this.scene.start('Credits'));
  }

  spawnConfetti() {
    const p = this.add.particles(VIEW.WIDTH / 2, 0, 'spark', {
      x: { min: 0, max: VIEW.WIDTH },
      y: -8,
      lifespan: 3500,
      speedY: { min: 40, max: 90 },
      speedX: { min: -30, max: 30 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      frequency: 60,
      quantity: 2,
    });
    p.setDepth(50);
  }
}
