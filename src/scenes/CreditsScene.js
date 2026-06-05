import { VIEW } from '../config.js';

const FONT = '"Press Start 2P"';

export class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.add.text(VIEW.WIDTH / 2, 50, 'CREDITS', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    const blocks = [
      { label: 'DESIGN AND CODE', values: ['MARCUS OBERDORFER'] },
      { label: 'COURSE', values: ['CMPM 120, UC SANTA CRUZ'] },
      { label: 'ASSETS', values: [
        'KENNEY.NL/ASSETS/1-BIT-PLATFORMER-PACK',
        'KENNEY.NL/ASSETS/DIGITAL-AUDIO',
      ] },
    ];

    let y = 100;
    for (const block of blocks) {
      this.add.text(VIEW.WIDTH / 2, y, block.label, {
        fontFamily: FONT, fontSize: '6px', color: '#888888',
      }).setOrigin(0.5);
      let valY = y + 12;
      for (const val of block.values) {
        this.add.text(VIEW.WIDTH / 2, valY, val, {
          fontFamily: FONT, fontSize: '8px', color: '#ffffff',
        }).setOrigin(0.5);
        valY += 12;
      }
      y = valY + 14;
    }

    const prompt = this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT - 30, 'PRESS SPACE TO RETURN', {
      fontFamily: FONT, fontSize: '7px', color: '#cccccc',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Title'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Title'));
  }
}
