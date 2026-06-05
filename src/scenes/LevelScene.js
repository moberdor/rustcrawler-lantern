import { VIEW, PLAYER, FRAMES, TILES } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { FlyingEnemy } from '../entities/FlyingEnemy.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { PressurePlate, Lever } from '../entities/Switch.js';
import { Lamp } from '../entities/Lamp.js';
import { Sentinel } from '../entities/Sentinel.js';
import { Lighting } from '../systems/Lighting.js';

const FONT = '"Press Start 2P"';

export class LevelScene extends Phaser.Scene {
  constructor(key, source, nextScene, levelName) {
    super(key);
    this.source = source;
    this.nextScene = nextScene;
    this.levelName = levelName;
  }

  init(data) {
    this._dying = false;
    this._exiting = false;
    this.platformSprites = [];
    this.movingPlatforms = [];
    this.plates = [];
    this.levers = [];
    this.lamps = [];
    this._byName = new Map();
    this._wiring = [];
    this.startingScore = (data && data.score) ? data.score : 0;
  }

  create() {
    let map;
    let mapW, mapH;
    if (this.source.tiledKey) {
      map = this.make.tilemap({ key: this.source.tiledKey });
      const tileset = map.addTilesetImage('tiles', 'tilesheet', VIEW.TILE, VIEW.TILE, 0, 0);
      this.groundLayer = map.createLayer('Ground', tileset, 0, 0);
      this.groundLayer.setCollisionByExclusion([-1]);
      mapW = map.widthInPixels;
      mapH = map.heightInPixels;
    } else {
      const def = this.source.data;
      map = this.make.tilemap({ data: def.terrain, tileWidth: VIEW.TILE, tileHeight: VIEW.TILE });
      const tileset = map.addTilesetImage('tiles', 'tilesheet', VIEW.TILE, VIEW.TILE, 0, 0, 1);
      this.groundLayer = map.createLayer(0, tileset, 0, 0);
      this.groundLayer.setCollisionByExclusion([-1, 0]);
      mapW = def.terrain[0].length * VIEW.TILE;
      mapH = def.terrain.length * VIEW.TILE;
    }

    this.bgFar = this.add.tileSprite(0, 0, mapW, mapH, 'bg_far')
      .setOrigin(0, 0).setScrollFactor(0.15).setDepth(-20);
    this.bgNear = this.add.tileSprite(0, 0, mapW, mapH, 'bg_near')
      .setOrigin(0, 0).setScrollFactor(0.4).setDepth(-10);

    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    this.gems = this.physics.add.group({ allowGravity: false, immovable: true });
    this.spikes = this.physics.add.staticGroup();
    this.pits = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.flyers = this.physics.add.group();
    this.sentinels = this.physics.add.group();
    this.keyGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.doorGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    let spawnX = 32, spawnY = 32;

    if (this.source.tiledKey) {
      const result = this.populateFromTiled(map);
      spawnX = result.spawnX;
      spawnY = result.spawnY;
    } else {
      const result = this.populateFromData(this.source.data);
      spawnX = result.spawnX;
      spawnY = result.spawnY;
    }

    for (const w of this._wiring) {
      for (const n of w.names.split(',').map(s => s.trim()).filter(Boolean)) {
        w.src.link(this._byName.get(n));
      }
    }

    this.player = new Player(this, spawnX, spawnY);
    this.player.score = this.startingScore;
    for (const s of this.sentinels.getChildren()) s.setTarget(this.player);
    this.input.keyboard.addCapture('SPACE,UP,DOWN,LEFT,RIGHT,W,A,S,D,SHIFT,X,R,E,Q');
    const keys = this.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN',
      W: 'W', A: 'A', S: 'S', D: 'D',
      space: 'SPACE', shift: 'SHIFT', X: 'X', R: 'R', E: 'E', Q: 'Q',
    });
    this.keys = keys;
    this.player.setInput(keys);

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.enemies, this.groundLayer);
    this.physics.add.collider(this.sentinels, this.groundLayer);
    if (this.platformSprites.length) {
      this.physics.add.collider(this.player, this.platformSprites);
      this.physics.add.collider(this.enemies, this.platformSprites);
      this.physics.add.collider(this.sentinels, this.platformSprites);
    }
    this.physics.add.overlap(this.player, this.coins, (_p, c) => this.collect(c, 10));
    this.physics.add.overlap(this.player, this.gems, (_p, g) => this.collect(g, 100));
    this.physics.add.overlap(this.player, this.spikes, () => this.hurtFromHazard());
    this.physics.add.overlap(this.player, this.pits, () => this.kill());
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.hurtFromEnemy(e));
    this.physics.add.overlap(this.player, this.flyers, (_p, e) => this.hurtFromEnemy(e));
    this.physics.add.overlap(this.player, this.sentinels, (_p, e) => this.hurtFromEnemy(e));
    this.physics.add.overlap(this.player, this.keyGroup, (_p, k) => this.pickupKey(k));
    this.physics.add.overlap(this.player, this.doorGroup, (_p, d) => this.tryExit(d));

    this.physics.world.setBounds(0, 0, mapW, mapH);
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 90);

    this.lighting = new Lighting(this, mapW, mapH);
    this.lighting.add(() => ({
      x: this.player.x, y: this.player.y,
      on: this.player.lanternOn, flicker: true, scale: 1.1,
    }));
    for (const lp of this.lamps) {
      this.lighting.add(() => ({ x: lp.x, y: lp.y, on: lp.on, flicker: false, scale: 0.7 }));
    }

    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    this.hearts = [];
    for (let i = 0; i < PLAYER.MAX_HEALTH; i++) {
      const h = this.add.image(12 + i * 18, 12, 'tiles', FRAMES.HEART_FULL).setScrollFactor(0);
      this.hud.add(h);
      this.hearts.push(h);
    }
    this.scoreText = this.add.text(VIEW.WIDTH - 8, 6, 'SCORE ' + this.player.score, {
      fontFamily: FONT, fontSize: '8px', color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setResolution(2);
    this.keyIcon = this.add.image(VIEW.WIDTH - 8, 22, 'tiles', FRAMES.KEY)
      .setOrigin(1, 0.5).setScrollFactor(0).setVisible(false);
    this.hud.add([this.scoreText, this.keyIcon]);

    this.showBriefing();
  }

  showBriefing() {
    const objectives = this.source.objectives
      || (this.source.data && this.source.data.objectives);
    if (!objectives || objectives.length === 0) {
      if (this.levelName) this.showLevelTitle();
      return;
    }

    this.physics.pause();
    this.briefingActive = true;

    const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(150);

    const bg = this.add.rectangle(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 0x000000, 0.88).setOrigin(0, 0);
    overlay.add(bg);

    const name = this.add.text(VIEW.WIDTH / 2, 44, this.levelName || 'LEVEL', {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    overlay.add(name);

    const header = this.add.text(VIEW.WIDTH / 2, 78, 'OBJECTIVES', {
      fontFamily: FONT, fontSize: '8px', color: '#888888',
    }).setOrigin(0.5).setResolution(2);
    overlay.add(header);

    const startY = 110;
    const rowHeight = 22;
    const iconX = VIEW.WIDTH / 2 - 90;
    const labelX = iconX + 18;
    for (let i = 0; i < objectives.length; i++) {
      const obj = objectives[i];
      const y = startY + i * rowHeight;
      const icon = this.makeObjectiveIcon(iconX, y, obj.type);
      const label = this.add.text(labelX, y, obj.label, {
        fontFamily: FONT, fontSize: '7px', color: '#cccccc',
      }).setOrigin(0, 0.5).setResolution(2);
      overlay.add([icon, label]);
    }

    const prompt = this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT - 30, 'PRESS SPACE TO BEGIN', {
      fontFamily: FONT, fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setResolution(2);
    const promptTween = this.tweens.add({ targets: prompt, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
    overlay.add(prompt);

    const dismiss = () => {
      this.tweens.remove(promptTween);
      overlay.destroy();
      this.briefingActive = false;
      this.physics.resume();
    };
    this.input.keyboard.once('keydown-SPACE', dismiss);
    this.input.keyboard.once('keydown-ENTER', dismiss);
  }

  makeObjectiveIcon(x, y, type) {
    if (type === 'key') return this.add.image(x, y, 'tiles', FRAMES.KEY).setOrigin(0.5);
    if (type === 'door') return this.add.image(x, y, 'tiles', FRAMES.DOOR_LOCKED).setOrigin(0.5);
    if (type === 'coin') return this.add.image(x, y, 'tiles', FRAMES.COIN).setOrigin(0.5);
    if (type === 'gem') return this.add.image(x, y, 'tiles', FRAMES.GEM).setOrigin(0.5);
    if (type === 'heart') return this.add.image(x, y, 'tiles', FRAMES.HEART_FULL).setOrigin(0.5);
    const g = this.add.graphics();
    if (type === 'plate') {
      g.fillStyle(0xffffff, 1);
      g.fillRect(x - 6, y + 1, 12, 1);
      g.fillRect(x - 7, y + 2, 14, 1);
      g.fillRect(x - 7, y + 3, 14, 2);
    } else if (type === 'lever') {
      g.fillStyle(0xffffff, 1);
      g.fillRect(x - 4, y + 3, 8, 3);
      g.fillRect(x - 1, y + 1, 2, 2);
      g.fillRect(x - 2, y - 4, 2, 6);
      g.fillRect(x - 4, y - 5, 2, 2);
    } else if (type === 'lamp') {
      g.lineStyle(1, 0xffffff, 0.7);
      g.strokeCircle(x, y, 4);
    } else if (type === 'lamp_on') {
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(x, y, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x, y, 3);
    } else if (type === 'sentinel') {
      g.fillStyle(0xffffff, 0.18);
      g.lineStyle(1, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(x + 5, y);
      g.lineTo(x - 6, y - 6);
      g.lineTo(x - 6, y + 6);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0xffffff, 1);
      g.fillRect(x + 4, y - 1, 3, 3);
    } else if (type === 'lantern_off') {
      g.lineStyle(1, 0xffffff, 0.7);
      g.strokeCircle(x, y, 5);
      g.lineBetween(x - 4, y - 4, x + 4, y + 4);
    } else if (type === 'lantern_on') {
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(x, y, 8);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x, y, 3);
    }
    return g;
  }

  showLevelTitle() {
    const label = this.add.text(VIEW.WIDTH / 2, VIEW.HEIGHT / 2, this.levelName, {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(120).setResolution(2).setAlpha(0);
    this.tweens.add({
      targets: label,
      alpha: { from: 0, to: 1 },
      duration: 350,
      yoyo: true,
      hold: 700,
      onComplete: () => label.destroy(),
    });
  }

  populateFromTiled(map) {
    let spawnX = 32, spawnY = 32;
    const objects = map.objects || [];
    for (const layer of objects) {
      for (const obj of layer.objects) {
        const ow = obj.width || VIEW.TILE;
        const oh = obj.height || VIEW.TILE;
        const cx = obj.x + ow / 2;
        const cy = obj.gid ? obj.y - oh / 2 : obj.y + oh / 2;
        this.spawnFromLayer(layer.name, obj, cx, cy);
        if (layer.name === 'Spawn') { spawnX = cx; spawnY = cy; }
      }
    }
    if (this.source.extraSentinels) {
      for (const s of this.source.extraSentinels) {
        const facing = Phaser.Math.DegToRad(s.facing || 0);
        this.sentinels.add(new Sentinel(this, s.x, s.y, facing));
      }
    }
    return { spawnX, spawnY };
  }

  spawnFromLayer(layerName, obj, cx, cy) {
    if (layerName === 'Coins') this.spawnCollectible(this.coins, cx, cy, FRAMES.COIN, 10, 'coin');
    else if (layerName === 'Gems') this.spawnCollectible(this.gems, cx, cy, FRAMES.GEM, 100, 'gem');
    else if (layerName === 'Spikes') this.spawnSpikeRect(obj);
    else if (layerName === 'Pits') this.spawnPitRect(obj);
    else if (layerName === 'Enemies') {
      const patrol = this.prop(obj, 'patrolDist', 64);
      this.enemies.add(new Enemy(this, cx, cy, patrol));
    }
    else if (layerName === 'FlyingEnemies') {
      const patrol = this.prop(obj, 'patrolDist', 48);
      this.flyers.add(new FlyingEnemy(this, cx, cy, patrol));
    }
    else if (layerName === 'Sentinels') {
      const f = this.prop(obj, 'facing', 0);
      this.sentinels.add(new Sentinel(this, cx, cy, Phaser.Math.DegToRad(f)));
    }
    else if (layerName === 'MovingPlatforms') {
      const dx = this.prop(obj, 'dx', 0);
      const dy = this.prop(obj, 'dy', 0);
      const dur = this.prop(obj, 'duration', 2000);
      const trig = this.prop(obj, 'triggerable', false);
      const w = obj.width || VIEW.TILE * 3;
      const mp = new MovingPlatform(this, obj.x, obj.y, w, dx, dy, dur, trig);
      this.movingPlatforms.push(mp);
      if (obj.name) this._byName.set(obj.name, mp);
      for (const s of mp.group()) this.platformSprites.push(s);
    }
    else if (layerName === 'PressurePlates') {
      const p = new PressurePlate(this, cx, cy);
      this.plates.push(p);
      if (obj.name) this._byName.set(obj.name, p);
      const t = this.prop(obj, 'targets', '');
      if (t) this._wiring.push({ src: p, names: t });
    }
    else if (layerName === 'Levers') {
      const lv = new Lever(this, cx, cy);
      this.levers.push(lv);
      if (obj.name) this._byName.set(obj.name, lv);
      const t = this.prop(obj, 'targets', '');
      if (t) this._wiring.push({ src: lv, names: t });
    }
    else if (layerName === 'Lamps') {
      const startOn = this.prop(obj, 'startOn', false);
      const lp = new Lamp(this, cx, cy, startOn);
      this.lamps.push(lp);
      if (obj.name) this._byName.set(obj.name, lp);
    }
    else if (layerName === 'Key') {
      const k = this.physics.add.sprite(cx, cy, 'tiles', FRAMES.KEY);
      k.body.setAllowGravity(false); k.body.setImmovable(true);
      this.tweens.add({ targets: k, y: cy - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.keyGroup.add(k);
    }
    else if (layerName === 'Door') {
      const d = this.physics.add.sprite(cx, cy, 'tiles', FRAMES.DOOR_LOCKED);
      d.body.setAllowGravity(false); d.body.setImmovable(true);
      d.setData('open', false);
      this.doorGroup.add(d);
    }
  }

  populateFromData(def) {
    const spawn = def.spawn || { x: 32, y: 32 };
    for (const c of def.coins || []) {
      this.spawnCollectible(this.coins, c.x, c.y, FRAMES.COIN, 10, 'coin');
    }
    for (const g of def.gems || []) {
      this.spawnCollectible(this.gems, g.x, g.y, FRAMES.GEM, 100, 'gem');
    }
    for (const s of def.spikes || []) {
      this.spawnSpikeRect({ x: s.x, y: s.y, width: s.w || VIEW.TILE, height: s.h || VIEW.TILE });
    }
    for (const p of def.pits || []) {
      this.spawnPitRect({ x: p.x, y: p.y, width: p.w, height: p.h });
    }
    for (const e of def.enemies || []) {
      this.enemies.add(new Enemy(this, e.x, e.y, e.patrolDist || 48));
    }
    for (const f of def.flyers || []) {
      this.flyers.add(new FlyingEnemy(this, f.x, f.y, f.patrolDist || 48));
    }
    for (const s of def.sentinels || []) {
      const facing = Phaser.Math.DegToRad(s.facing || 0);
      this.sentinels.add(new Sentinel(this, s.x, s.y, facing));
    }
    for (const mp of def.movingPlatforms || []) {
      const platform = new MovingPlatform(this, mp.x, mp.y, mp.w, mp.dx || 0, mp.dy || 0, mp.duration || 2000, !!mp.triggerable);
      this.movingPlatforms.push(platform);
      if (mp.name) this._byName.set(mp.name, platform);
      for (const sp of platform.group()) this.platformSprites.push(sp);
    }
    for (const p of def.plates || []) {
      const plate = new PressurePlate(this, p.x, p.y);
      this.plates.push(plate);
      if (p.name) this._byName.set(p.name, plate);
      if (p.targets) this._wiring.push({ src: plate, names: p.targets });
    }
    for (const lv of def.levers || []) {
      const lever = new Lever(this, lv.x, lv.y);
      this.levers.push(lever);
      if (lv.name) this._byName.set(lv.name, lever);
      if (lv.targets) this._wiring.push({ src: lever, names: lv.targets });
    }
    for (const lp of def.lamps || []) {
      const lamp = new Lamp(this, lp.x, lp.y, !!lp.startOn);
      this.lamps.push(lamp);
      if (lp.name) this._byName.set(lp.name, lamp);
    }
    if (def.key) {
      const k = this.physics.add.sprite(def.key.x, def.key.y, 'tiles', FRAMES.KEY);
      k.body.setAllowGravity(false); k.body.setImmovable(true);
      this.tweens.add({ targets: k, y: def.key.y - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.keyGroup.add(k);
    }
    if (def.door) {
      const d = this.physics.add.sprite(def.door.x, def.door.y, 'tiles', FRAMES.DOOR_LOCKED);
      d.body.setAllowGravity(false); d.body.setImmovable(true);
      d.setData('open', false);
      this.doorGroup.add(d);
    }
    return { spawnX: spawn.x, spawnY: spawn.y };
  }

  spawnCollectible(group, x, y, frame, points, kind) {
    const s = this.physics.add.sprite(x, y, 'tiles', frame);
    s.body.setAllowGravity(false); s.body.setImmovable(true);
    s.setData('points', points);
    s.setData('kind', kind);
    group.add(s);
  }

  spawnSpikeRect(obj) {
    const w = obj.width || VIEW.TILE;
    const h = obj.height || VIEW.TILE;
    const cols = Math.max(1, Math.round(w / VIEW.TILE));
    for (let i = 0; i < cols; i++) {
      const x = obj.x + i * VIEW.TILE + VIEW.TILE / 2;
      const y = obj.y + h - VIEW.TILE / 2;
      const s = this.add.image(x, y, 'tiles', FRAMES.SPIKE);
      this.physics.add.existing(s, true);
      s.body.setSize(12, 8).setOffset(2, 6);
      this.spikes.add(s);
    }
  }

  spawnPitRect(obj) {
    const s = this.add.rectangle(obj.x + (obj.width || VIEW.TILE) / 2, obj.y + (obj.height || VIEW.TILE) / 2,
      obj.width || VIEW.TILE, obj.height || VIEW.TILE, 0x000000, 0);
    this.physics.add.existing(s, true);
    this.pits.add(s);
  }

  prop(obj, name, fallback) {
    if (!obj.properties) return fallback;
    const p = obj.properties.find(p => p.name === name);
    return p ? p.value : fallback;
  }

  collect(sprite, points) {
    this.player.collectPickup(points);
    this.spawnSparkle(sprite.x, sprite.y);
    sprite.destroy();
    this.scoreText.setText('SCORE ' + this.player.score);
  }

  spawnSparkle(x, y) {
    const p = this.add.particles(x, y, 'spark', {
      lifespan: 380,
      speed: { min: 30, max: 100 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 10,
      emitting: false,
    });
    p.explode(10, x, y);
    this.time.delayedCall(500, () => p.destroy());
  }

  pickupKey(k) {
    this.player.hasKey = true;
    this.player.collectPickup(0);
    this.spawnSparkle(k.x, k.y);
    this.keyIcon.setVisible(true);
    k.destroy();
    for (const d of this.doorGroup.getChildren()) {
      d.setFrame(FRAMES.DOOR_OPEN);
      d.setData('open', true);
    }
  }

  tryExit(d) {
    if (!this.player.hasKey) return;
    if (this._exiting) return;
    this._exiting = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this.nextScene, { score: this.player.score });
    });
  }

  hurtFromHazard() {
    if (this.player.takeHit(this.player.x)) this.afterHit();
  }

  hurtFromEnemy(e) {
    if (this.player.takeHit(e.x)) this.afterHit();
  }

  afterHit() {
    this.refreshHearts();
    if (this.player.health <= 0) this.kill();
  }

  refreshHearts() {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setVisible(i < this.player.health);
    }
  }

  kill() {
    if (this._dying) return;
    this._dying = true;
    this.player.health = 0;
    this.refreshHearts();
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameOver', { score: this.player.score }));
  }

  update(time, delta) {
    if (this._dying || this._exiting || this.briefingActive) return;
    this.player.update(time, delta);
    for (const e of this.enemies.getChildren()) e.update(time, delta);
    for (const f of this.flyers.getChildren()) f.update(time, delta);
    for (const s of this.sentinels.getChildren()) s.update(time, delta);
    for (const mp of this.movingPlatforms) mp.update(time, delta);
    for (const p of this.plates) p.step(this.physics.overlap(this.player, p));
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      for (const lv of this.levers) {
        if (this.physics.overlap(this.player, lv)) lv.toggle();
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      this.scene.restart();
    }
    const facing = this.player.facing;
    const speed = Math.abs(this.player.body.velocity.x);
    const lead = Phaser.Math.Clamp(speed / PLAYER.MAX_SPEED, 0, 1) * 40 * facing;
    this.cameras.main.setFollowOffset(-lead, 0);

    this.lighting.update(time);

    if (this.player.y > this.physics.world.bounds.height + 32) this.kill();
  }
}
