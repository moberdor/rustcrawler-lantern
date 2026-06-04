import { VIEW, FRAMES } from '../config.js';
import { aStar } from '../systems/Pathfinding.js';
import { hasLineOfSight } from '../systems/Vision.js';

export class Sentinel extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, facing) {
    super(scene, x, y, 'tiles', FRAMES.SENTINEL);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(12, 12).setOffset(2, 2);
    this.body.setAllowGravity(false);

    this.target = null;
    this.facing = facing || 0;
    this.viewRange = 96;
    this.viewHalf = Math.PI / 4;

    this.state = 'patrol';
    this.lastSeen = null;
    this.alertUntil = 0;
    this.alertHold = 1500;

    this.path = [];
    this.step = 0;
    this.nextPlanAt = 0;
    this.planInterval = 350;
    this.speed = 55;

    this.cone = scene.add.graphics().setDepth(3);
  }

  setTarget(t) { this.target = t; }

  destroy(fromScene) {
    if (this.cone) this.cone.destroy();
    super.destroy(fromScene);
  }

  scan(time) {
    if (!this.target) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    let visible = false;
    if (dist <= this.viewRange) {
      const a = Math.atan2(dy, dx);
      const diff = Math.abs(Phaser.Math.Angle.Wrap(a - this.facing));
      if (diff <= this.viewHalf) {
        visible = hasLineOfSight(this.scene.groundLayer, this.x, this.y, this.target.x, this.target.y);
      }
    }
    if (visible) {
      this.state = 'chase';
      this.lastSeen = { x: this.target.x, y: this.target.y };
      this.alertUntil = time + this.alertHold;
    } else if (this.state === 'chase') {
      this.state = 'alert';
    } else if (this.state === 'alert' && time > this.alertUntil) {
      this.state = 'patrol';
      this.lastSeen = null;
      this.path = [];
      this.step = 0;
    }
  }

  plan() {
    if (!this.lastSeen) return;
    const tile = VIEW.TILE;
    const sx = Math.floor(this.x / tile);
    const sy = Math.floor(this.y / tile);
    const gx = Math.floor(this.lastSeen.x / tile);
    const gy = Math.floor(this.lastSeen.y / tile);
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

  follow() {
    if (this.state === 'patrol' || this.step >= this.path.length) {
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
    const vx = (dx / d) * this.speed;
    const vy = (dy / d) * this.speed;
    this.body.setVelocity(vx, vy);
    if (vx * vx + vy * vy > 1) {
      this.facing = Math.atan2(vy, vx);
    }
    this.setFlipX(vx < 0);
  }

  drawCone() {
    this.cone.clear();
    let color = 0x88ff88;
    if (this.state === 'chase') color = 0xff4444;
    else if (this.state === 'alert') color = 0xffaa44;
    this.cone.fillStyle(color, 0.18);
    this.cone.lineStyle(1, color, 0.6);
    this.cone.beginPath();
    this.cone.moveTo(this.x, this.y);
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const a = this.facing - this.viewHalf + (this.viewHalf * 2) * (i / steps);
      const px = this.x + Math.cos(a) * this.viewRange;
      const py = this.y + Math.sin(a) * this.viewRange;
      this.cone.lineTo(px, py);
    }
    this.cone.closePath();
    this.cone.fillPath();
    this.cone.strokePath();
  }

  update(time, delta) {
    this.scan(time);
    if (this.lastSeen && time >= this.nextPlanAt) {
      this.plan();
      this.nextPlanAt = time + this.planInterval;
    }
    this.follow();
    this.drawCone();
  }
}
