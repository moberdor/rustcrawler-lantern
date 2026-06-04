import { VIEW, FRAMES } from '../config.js';
import { aStar } from '../systems/Pathfinding.js';

export class Sentinel extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles', FRAMES.SENTINEL);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(12, 12).setOffset(2, 2);
    this.body.setAllowGravity(false);
    this.target = null;
    this.path = [];
    this.step = 0;
    this.nextPlanAt = 0;
    this.planInterval = 400;
    this.speed = 55;
  }

  setTarget(t) { this.target = t; }

  plan() {
    if (!this.target) return;
    const tile = VIEW.TILE;
    const sx = Math.floor(this.x / tile);
    const sy = Math.floor(this.y / tile);
    const gx = Math.floor(this.target.x / tile);
    const gy = Math.floor(this.target.y / tile);
    const layer = this.scene.groundLayer;
    const blocked = (x, y) => layer.getTileAt(x, y) !== null;
    const p = aStar(blocked, sx, sy, gx, gy, 600);
    if (p && p.length > 1) {
      this.path = p;
      this.step = 1;
    } else {
      this.path = [];
      this.step = 0;
    }
  }

  update(time, delta) {
    if (!this.target) return;
    if (time >= this.nextPlanAt) {
      this.plan();
      this.nextPlanAt = time + this.planInterval;
    }
    if (this.step >= this.path.length) {
      this.body.setVelocity(0, 0);
      return;
    }
    const tile = VIEW.TILE;
    const wp = this.path[this.step];
    const wx = wp.x * tile + tile / 2;
    const wy = wp.y * tile + tile / 2;
    const dx = wx - this.x;
    const dy = wy - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) {
      this.step++;
      return;
    }
    this.body.setVelocity((dx / d) * this.speed, (dy / d) * this.speed);
    this.setFlipX(dx < 0);
  }
}
