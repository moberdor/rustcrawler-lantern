import { FRAMES } from '../config.js';

export class Switch extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frame) {
    super(scene, x, y, 'tiles', frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.targets = [];
    this.active = false;
  }

  link(target) {
    if (target && !this.targets.includes(target)) this.targets.push(target);
  }

  fire(on) {
    if (on === this.active) return;
    this.active = on;
    for (const t of this.targets) {
      if (on && t.onActivate) t.onActivate();
      else if (!on && t.onDeactivate) t.onDeactivate();
    }
  }
}

export class PressurePlate extends Switch {
  constructor(scene, x, y) {
    super(scene, x, y, FRAMES.PLATE_UP);
    this.body.setSize(14, 6).setOffset(1, 10);
  }

  step(overlapping) {
    if (overlapping === this.active) return;
    this.setFrame(overlapping ? FRAMES.PLATE_DOWN : FRAMES.PLATE_UP);
    if (overlapping) this.scene.sound.play('sfx_pickup', { volume: 0.35 });
    this.fire(overlapping);
  }
}

export class Lever extends Switch {
  constructor(scene, x, y) {
    super(scene, x, y, FRAMES.LEVER_LEFT);
    this.body.setSize(10, 14).setOffset(3, 1);
  }

  toggle() {
    const next = !this.active;
    this.setFrame(next ? FRAMES.LEVER_RIGHT : FRAMES.LEVER_LEFT);
    this.scene.sound.play('sfx_pickup', { volume: 0.5 });
    this.fire(next);
  }
}
