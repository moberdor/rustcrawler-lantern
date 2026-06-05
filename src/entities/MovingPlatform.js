import { FRAMES, VIEW } from '../config.js';

export class MovingPlatform {
  constructor(scene, x, y, width, dx, dy, duration, triggerable) {
    this.scene = scene;
    this.sprites = [];
    const tileCount = Math.max(1, Math.round(width / VIEW.TILE));
    for (let i = 0; i < tileCount; i++) {
      let frame = FRAMES.PLATFORM_MID;
      if (tileCount > 1 && i === 0) frame = FRAMES.PLATFORM_LEFT;
      else if (tileCount > 1 && i === tileCount - 1) frame = FRAMES.PLATFORM_RIGHT;
      const sx = x + i * VIEW.TILE + VIEW.TILE / 2;
      const sy = y + VIEW.TILE / 2;
      const t = scene.physics.add.sprite(sx, sy, 'tiles', frame);
      t.body.setAllowGravity(false);
      t.body.setImmovable(true);
      t.body.checkCollision.down = false;
      t.body.checkCollision.left = false;
      t.body.checkCollision.right = false;
      this.sprites.push(t);
    }
    this.dx = dx;
    this.dy = dy;
    this.duration = Math.max(1, duration);
    this.elapsed = 0;
    this.lastPx = 0;
    this.lastPy = 0;
    this.triggerable = !!triggerable;
    this.running = !this.triggerable;
  }

  onActivate() { this.running = true; }
  onDeactivate() { this.running = false; }

  update(time, delta) {
    if (!this.running) return;
    this.elapsed += delta;
    const phase = (this.elapsed % (this.duration * 2)) / this.duration;
    const tri = phase < 1 ? phase : 2 - phase;
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * tri);
    const px = this.dx * eased;
    const py = this.dy * eased;
    const ddx = px - this.lastPx;
    const ddy = py - this.lastPy;
    if (ddx !== 0 || ddy !== 0) {
      for (const s of this.sprites) {
        s.x += ddx;
        s.y += ddy;
        s.body.updateFromGameObject();
      }
      this.carryRider(ddx, ddy);
    }
    this.lastPx = px;
    this.lastPy = py;
  }

  carryRider(ddx, ddy) {
    const p = this.scene.player;
    if (!p || !p.body || !p.body.blocked.down) return;
    const pCx = p.body.x + p.body.width / 2;
    const pBot = p.body.y + p.body.height;
    for (const s of this.sprites) {
      const sb = s.body;
      if (pCx < sb.x || pCx > sb.x + sb.width) continue;
      if (Math.abs(pBot - sb.y) > 2) continue;
      p.x += ddx;
      p.y += ddy;
      p.body.position.x += ddx;
      p.body.position.y += ddy;
      return;
    }
  }

  group() { return this.sprites; }
}
