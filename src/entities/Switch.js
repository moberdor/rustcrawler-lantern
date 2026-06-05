export class Switch extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setVisible(false);
    this.targets = [];
    this.active = false;
    this.gfx = scene.add.graphics().setDepth(2);
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

  destroy(fromScene) {
    if (this.gfx) this.gfx.destroy();
    super.destroy(fromScene);
  }
}

export class PressurePlate extends Switch {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.body.setSize(14, 6).setOffset(1, 10);
    this.redraw();
  }

  step(overlapping) {
    if (overlapping === this.active) return;
    if (overlapping) this.scene.sound.play('sfx_pickup', { volume: 0.35, detune: 300 });
    this.fire(overlapping);
    this.redraw();
  }

  redraw() {
    this.gfx.clear();
    this.gfx.fillStyle(0xffffff, 1);
    const baseY = this.y + 8;
    if (this.active) {
      this.gfx.fillRect(this.x - 7, baseY - 2, 14, 2);
    } else {
      this.gfx.fillRect(this.x - 6, baseY - 4, 12, 1);
      this.gfx.fillRect(this.x - 7, baseY - 3, 14, 1);
      this.gfx.fillRect(this.x - 7, baseY - 2, 14, 2);
    }
  }
}

export class Lever extends Switch {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.body.setSize(10, 14).setOffset(3, 1);
    this.redraw();
  }

  toggle() {
    const next = !this.active;
    this.scene.sound.play('sfx_pickup', { volume: 0.5, detune: next ? 500 : 100 });
    this.fire(next);
    this.redraw();
  }

  redraw() {
    this.gfx.clear();
    this.gfx.fillStyle(0xffffff, 1);
    this.gfx.fillRect(this.x - 4, this.y + 4, 8, 4);
    this.gfx.fillRect(this.x - 1, this.y + 2, 2, 2);
    if (this.active) {
      this.gfx.fillRect(this.x, this.y - 4, 2, 7);
      this.gfx.fillRect(this.x + 2, this.y - 6, 2, 2);
    } else {
      this.gfx.fillRect(this.x - 2, this.y - 4, 2, 7);
      this.gfx.fillRect(this.x - 4, this.y - 6, 2, 2);
    }
  }
}
