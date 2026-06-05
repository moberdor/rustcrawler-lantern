import { VIEW } from '../config.js';

const FONT = '"Press Start 2P"';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_far')
      .setOrigin(0, 0).setDepth(-20).setAlpha(0.6);
    this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_near')
      .setOrigin(0, 0).setDepth(-10).setAlpha(0.45);

    const embers = this.add.particles(0, 0, 'spark', {
      x: { min: 0, max: VIEW.WIDTH },
      y: VIEW.HEIGHT + 4,
      lifespan: 4200,
      speedY: { min: -28, max: -14 },
      speedX: { min: -8, max: 8 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 220,
      quantity: 1,
    }).setDepth(-5);

    this.add.text(VIEW.WIDTH / 2, 70, 'RUSTCRAWLER', {
      fontFamily: FONT, fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    this.add.text(VIEW.WIDTH / 2, 110, 'THRESHOLD', {
      fontFamily: FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(0.5).setResolution(2);

    const lines = [
      'MOVE   ARROWS / A D',
      'JUMP   SPACE / W / UP',
      'DASH   SHIFT / X (MID-AIR)',
      'LANTERN   Q     RESTART   R',
      '',
      'FIND THE KEY, REACH THE DOOR',
    ];
    let y = 170;
    for (const line of lines) {
      this.add.text(VIEW.WIDTH / 2, y, line, {
        fontFamily: FONT, fontSize: '7px', color: '#cccccc',
      }).setOrigin(0.5).setResolution(2);
      y += 14;
    }

    const prompt = this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT - 40, 'PRESS SPACE TO START', {
      fontFamily: FONT, fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT - 16, 'C   CREDITS', {
      fontFamily: FONT, fontSize: '6px', color: '#888888',
    }).setOrigin(0.5).setResolution(2);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Threshold'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Threshold'));
    this.input.keyboard.once('keydown-C', () => this.scene.start('Credits'));
  }
}
