import { VIEW } from '../config.js';

const FONT = '"Press Start 2P"';

export class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.add.text(VIEW.WIDTH / 2, 50, 'CREDITS', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);

    const blocks = [
      ['DESIGN AND CODE', 'MARCUS OBERDORFER'],
      ['COURSE', 'CMPM 120, UC SANTA CRUZ'],
      ['ENGINE', 'PHASER 3.80'],
      ['TILESET', 'KENNEY MONOCHROME (CC0)'],
      ['SOUND', 'SFXR + FREESOUND (CC0)'],
    ];

    let y = 100;
    for (const [label, value] of blocks) {
      this.add.text(VIEW.WIDTH / 2, y, label, {
        fontFamily: FONT, fontSize: '6px', color: '#888888',
      }).setOrigin(0.5).setResolution(2);
      this.add.text(VIEW.WIDTH / 2, y + 12, value, {
        fontFamily: FONT, fontSize: '8px', color: '#ffffff',
      }).setOrigin(0.5).setResolution(2);
      y += 36;
    }

    const prompt = this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT - 30, 'PRESS SPACE TO RETURN', {
      fontFamily: FONT, fontSize: '7px', color: '#cccccc',
    }).setOrigin(0.5).setResolution(2);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Title'));
  }
}
