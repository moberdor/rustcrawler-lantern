export class Lamp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, startOn) {
    super(scene, x, y, 'tiles', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setVisible(false);
    this.on = !!startOn;
    this.gfx = scene.add.graphics().setDepth(2);
    this.redraw();
  }

  onActivate() {
    if (this.on) return;
    this.on = true;
    this.redraw();
  }

  onDeactivate() {
    if (!this.on) return;
    this.on = false;
    this.redraw();
  }

  redraw() {
    this.gfx.clear();
    if (this.on) {
      this.gfx.fillStyle(0xffffff, 0.25);
      this.gfx.fillCircle(this.x, this.y, 7);
      this.gfx.fillStyle(0xffffff, 1);
      this.gfx.fillCircle(this.x, this.y, 3);
    } else {
      this.gfx.lineStyle(1, 0xffffff, 0.55);
      this.gfx.strokeCircle(this.x, this.y, 3);
    }
  }

  destroy(fromScene) {
    if (this.gfx) this.gfx.destroy();
    super.destroy(fromScene);
  }
}
