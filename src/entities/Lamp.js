import { FRAMES } from '../config.js';

export class Lamp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, startOn) {
    super(scene, x, y, 'tiles', startOn ? FRAMES.LAMP_ON : FRAMES.LAMP_OFF);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.on = !!startOn;
  }

  onActivate() {
    if (this.on) return;
    this.on = true;
    this.setFrame(FRAMES.LAMP_ON);
  }

  onDeactivate() {
    if (!this.on) return;
    this.on = false;
    this.setFrame(FRAMES.LAMP_OFF);
  }
}
