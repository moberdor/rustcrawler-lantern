import { PLAYER, FRAMES } from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles', FRAMES.PLAYER_IDLE);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(10, 14).setOffset(3, 2);
    this.body.setMaxVelocity(PLAYER.MAX_SPEED * 3, 800);
    this.body.setGravityY(PLAYER.GRAVITY);
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(false);

    this.health = PLAYER.MAX_HEALTH;
    this.hasKey = false;
    this.score = 0;
    this.facing = 1;
    this.invulnUntil = 0;
    this.lastGroundedAt = -Infinity;
    this.jumpRequestedAt = -Infinity;
    this.dashing = false;
    this.dashEndsAt = 0;
    this.dashReadyAt = 0;
    this.wasGrounded = false;
    this.lanternOn = true;

    this.createDustEmitter();
    this.createJumpEmitter();
    this.createTrailEmitter();
  }

  createDustEmitter() {
    this.dust = this.scene.add.particles(0, 0, 'dust', {
      lifespan: 280,
      speedY: { min: -30, max: -5 },
      speedX: { min: -10, max: 10 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      frequency: 90,
      quantity: 1,
      emitting: false,
    });
    this.dust.setDepth(5);
  }

  createJumpEmitter() {
    this.jumpPuff = this.scene.add.particles(0, 0, 'dust', {
      lifespan: 320,
      speed: { min: 40, max: 90 },
      angle: { min: 200, max: 340 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 8,
      emitting: false,
    });
    this.jumpPuff.setDepth(5);
  }

  createTrailEmitter() {
    this.trail = this.scene.add.particles(0, 0, 'dust', {
      lifespan: 280,
      speed: { min: 5, max: 30 },
      scale: { start: 2, end: 0 },
      alpha: { start: 0.9, end: 0 },
      emitting: false,
    });
    this.trail.setDepth(5);
  }

  setInput(keys) { this.keys = keys; }

  isGrounded() { return this.body.blocked.down || this.body.touching.down; }

  takeHit(fromX) {
    const now = this.scene.time.now;
    if (now < this.invulnUntil) return false;
    this.health -= 1;
    this.invulnUntil = now + PLAYER.INVULN_MS;
    const dir = (fromX !== undefined && fromX > this.x) ? -1 : 1;
    this.body.setVelocity(dir * PLAYER.HIT_KNOCKBACK_X, PLAYER.HIT_KNOCKBACK_Y);
    this.dashing = false;
    this.body.setAllowGravity(true);
    this.scene.sound.play('sfx_hit', { volume: 0.6 });
    this.scene.cameras.main.shake(120, 0.006);
    this.scene.tweens.add({
      targets: this, alpha: { from: 0.2, to: 1 }, duration: 100, repeat: 6,
      onComplete: () => { this.alpha = 1; },
    });
    return true;
  }

  collectPickup(points) {
    this.score += points;
    this.scene.sound.play('sfx_pickup', { volume: 0.5 });
  }

  startDash() {
    const now = this.scene.time.now;
    if (this.isGrounded()) return;
    if (now < this.dashReadyAt) return;
    if (this.dashing) return;
    this.dashing = true;
    this.dashEndsAt = now + PLAYER.DASH_TIME;
    this.dashReadyAt = now + PLAYER.DASH_TIME + PLAYER.DASH_COOLDOWN;
    this.body.setAllowGravity(false);
    this.body.setVelocity(this.facing * PLAYER.DASH_SPEED, 0);
    this.trail.explode(5, this.x, this.y);
    this.scene.sound.play('sfx_dash', { volume: 0.5 });
  }

  endDash() {
    if (!this.dashing) return;
    this.dashing = false;
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.facing * PLAYER.MAX_SPEED * 0.6);
  }

  jump() {
    this.body.setVelocityY(PLAYER.JUMP_VEL);
    this.jumpPuff.emitParticleAt(this.x, this.y + 8);
    this.scene.sound.play('sfx_jump', { volume: 0.5 });
    this.lastGroundedAt = -Infinity;
    this.jumpRequestedAt = -Infinity;
  }

  update(time, delta) {
    if (!this.keys) return;
    const k = this.keys;
    const grounded = this.isGrounded();
    const dt = delta / 1000;

    if (grounded) this.lastGroundedAt = time;

    const leftDown = k.left.isDown || k.A.isDown;
    const rightDown = k.right.isDown || k.D.isDown;
    const jumpJustDown = Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(k.W) || Phaser.Input.Keyboard.JustDown(k.up);
    const jumpReleased = Phaser.Input.Keyboard.JustUp(k.space) || Phaser.Input.Keyboard.JustUp(k.W) || Phaser.Input.Keyboard.JustUp(k.up);
    const dashJustDown = Phaser.Input.Keyboard.JustDown(k.shift) || Phaser.Input.Keyboard.JustDown(k.X);
    if (Phaser.Input.Keyboard.JustDown(k.Q)) {
      this.lanternOn = !this.lanternOn;
      this.scene.sound.play('sfx_pickup', { volume: 0.4 });
    }

    if (jumpJustDown) this.jumpRequestedAt = time;

    if (this.dashing) {
      this.trail.emitParticleAt(this.x, this.y, 1);
      if (time >= this.dashEndsAt) this.endDash();
    } else {
      const accel = grounded ? PLAYER.ACCEL : PLAYER.AIR_ACCEL;
      const decel = grounded ? PLAYER.DECEL : PLAYER.AIR_DECEL;
      let vx = this.body.velocity.x;
      if (leftDown && !rightDown) {
        vx -= accel * dt;
        this.facing = -1;
      } else if (rightDown && !leftDown) {
        vx += accel * dt;
        this.facing = 1;
      } else {
        if (vx > 0) vx = Math.max(0, vx - decel * dt);
        else if (vx < 0) vx = Math.min(0, vx + decel * dt);
      }
      vx = Phaser.Math.Clamp(vx, -PLAYER.MAX_SPEED, PLAYER.MAX_SPEED);
      this.body.setVelocityX(vx);
    }

    const canCoyoteJump = (time - this.lastGroundedAt) <= PLAYER.COYOTE_MS;
    const bufferedJump = (time - this.jumpRequestedAt) <= PLAYER.JUMP_BUFFER_MS;
    if (bufferedJump && canCoyoteJump && !this.dashing) this.jump();

    if (jumpReleased && this.body.velocity.y < PLAYER.JUMP_CUT_VEL) {
      this.body.setVelocityY(PLAYER.JUMP_CUT_VEL);
    }

    if (dashJustDown) this.startDash();

    this.setFlipX(this.facing < 0);
    if (this.dashing) this.setFrame(FRAMES.PLAYER_JUMP);
    else if (!grounded) this.setFrame(FRAMES.PLAYER_JUMP);
    else if (Math.abs(this.body.velocity.x) > 10) {
      this.setFrame((Math.floor(time / 100) % 2) ? FRAMES.PLAYER_RUN_A : FRAMES.PLAYER_RUN_B);
    } else {
      this.setFrame(FRAMES.PLAYER_IDLE);
    }

    const moving = Math.abs(this.body.velocity.x) > 30;
    this.dust.emitting = grounded && moving && !this.dashing;
    if (this.dust.emitting) {
      this.dust.setPosition(this.x - this.facing * 4, this.y + 7);
    }

    if (grounded && !this.wasGrounded && this.scene.time.now > 500) {
      this.jumpPuff.emitParticleAt(this.x, this.y + 8);
    }
    this.wasGrounded = grounded;
  }
}
