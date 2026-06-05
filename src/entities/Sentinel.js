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

    this.homeX = x;
    this.homeY = y;
    this.patrolRange = 40;
    this.patrolPhase = Math.random() * Math.PI * 2;
    this.patrolSpeed = 22;

    this.cone = scene.add.graphics().setDepth(3);
    this.alertText = scene.add.text(x, y - 12, '!', {
      fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5, 1).setDepth(4).setVisible(false).setResolution(2);
  }

  setTarget(t) { this.target = t; }

  destroy(fromScene) {
    if (this.cone) this.cone.destroy();
    if (this.alertText) this.alertText.destroy();
    super.destroy(fromScene);
  }
// Sentinel states are patrol, alert, and chase
// Player must be in range + inside the view cone + line of sight check + lantern enabled to be seen
// Seeing the player sets chase state and saves last known player position
// Losing line of sight changes state from chase to alert for ~1.5 seconds before going to patrol state
// Lantern off disables detection
  scan(time) {
    if (!this.target) return;
    const lit = this.target.lanternOn !== false;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    let visible = false;
    if (lit && dist <= this.viewRange) {
      const a = Math.atan2(dy, dx);
      const diff = Math.abs(Phaser.Math.Angle.Wrap(a - this.facing));
      if (diff <= this.viewHalf) {
        visible = hasLineOfSight(this.scene.groundLayer, this.x, this.y, this.target.x, this.target.y);
      }
    }
    if (visible) {
      if (this.state !== 'chase') {
        this.scene.sound.play('sfx_hit', { volume: 0.25, detune: 700 });
        this.scene.cameras.main.flash(60, 255, 255, 255);
      }
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
    const blocked = (x, y) => {
      const t = layer.getTileAt(x, y);
      return !!(t && t.collides);
    };
    const p = aStar(blocked, sx, sy, gx, gy, 600);
    if (p && p.length > 1) {
      this.path = p;
      this.step = 1;
    } else {
      this.path = [];
      this.step = 0;
    }
  }

  follow(time) {
    if (this.state === 'patrol') {
      const sweep = Math.sin(time / 1400 + this.patrolPhase);
      const targetX = this.homeX + sweep * this.patrolRange;
      const dx = targetX - this.x;
      const dy = this.homeY - this.y;
      const vx = Phaser.Math.Clamp(dx * 4, -this.patrolSpeed, this.patrolSpeed);
      const vy = Phaser.Math.Clamp(dy * 4, -this.patrolSpeed, this.patrolSpeed);
      this.body.setVelocity(vx, vy);
      this.setFlipX(Math.cos(this.facing) < 0);
      return;
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
    let fillA = 0.06, strokeA = 0.25;
    if (this.state === 'chase') { fillA = 0.22; strokeA = 0.85; }
    else if (this.state === 'alert') { fillA = 0.13; strokeA = 0.5; }
    this.cone.fillStyle(0xffffff, fillA);
    this.cone.lineStyle(1, 0xffffff, strokeA);
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

    if (this.state === 'chase') {
      const reach = this.viewRange * 0.9;
      const tipX = this.x + Math.cos(this.facing) * reach;
      const tipY = this.y + Math.sin(this.facing) * reach;
      this.cone.lineStyle(1, 0xffffff, 0.7);
      this.cone.lineBetween(this.x, this.y, tipX, tipY);
    }
  }

  update(time, delta) {
    this.scan(time);
    if (this.lastSeen && time >= this.nextPlanAt) {
      this.plan();
      this.nextPlanAt = time + this.planInterval;
    }
    this.follow(time);
    this.drawCone();
    this.alertText.setPosition(this.x, this.y - 6);
    this.alertText.setVisible(this.state !== 'patrol');
  }
}
