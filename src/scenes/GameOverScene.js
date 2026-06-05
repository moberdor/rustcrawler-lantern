import { VIEW } from '../config.js';

const FONT = '"Press Start 2P"';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.finalScore = data?.score ?? 0;
    this.fromLevel = data?.levelKey ?? 'Drift';
    this.resumeScore = data?.resumeScore ?? 0;
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const farBg = this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_far')
      .setOrigin(0, 0).setDepth(-20).setAlpha(0.4);
    farBg.tileScaleY = VIEW.HEIGHT / 256;
    const nearBg = this.add.tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'bg_near')
      .setOrigin(0, 0).setDepth(-10).setAlpha(0.25);
    nearBg.tileScaleY = VIEW.HEIGHT / 256;

    this.add.text(VIEW.WIDTH / 2, 110, 'YOU DIED', {
      fontFamily: FONT, fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(VIEW.WIDTH / 2, 160, 'SCORE ' + this.finalScore, {
      fontFamily: FONT, fontSize: '10px', color: '#cccccc',
    }).setOrigin(0.5);
    const prompt = this.add.text(VIEW.WIDTH / 2, 240, 'PRESS R TO RETRY', {
      fontFamily: FONT, fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown-R', () => this.scene.start(this.fromLevel, { score: this.resumeScore }));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start(this.fromLevel, { score: this.resumeScore }));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Title'));
  }
}
