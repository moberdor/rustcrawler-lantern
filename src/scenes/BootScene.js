import { VIEW } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.load.spritesheet('tiles', 'assets/tiles/monochrome_tilemap_transparent_packed.png', {
      frameWidth: VIEW.TILE, frameHeight: VIEW.TILE,
    });
    this.load.image('tilesheet', 'assets/tiles/monochrome_tilemap_packed.png');
    this.load.tilemapTiledJSON('threshold', 'assets/maps/threshold.json');
    this.load.audio('sfx_jump', 'assets/audio/jump.ogg');
    this.load.audio('sfx_dash', 'assets/audio/dash.ogg');
    this.load.audio('sfx_pickup', 'assets/audio/pickup.ogg');
    this.load.audio('sfx_hit', 'assets/audio/hit.ogg');
    this.load.audio('sfx_land', 'assets/audio/land.ogg');
  }

  create() {
    this.makeParticleTexture('dust', 0xffffff, 2);
    this.makeParticleTexture('spark', 0xffffff, 3);
    this.makeParticleTexture('trail', 0xcccccc, 4);
    this.makeCaveFar('bg_far');
    this.makeCaveNear('bg_near');
    this.makeLightMask('lightmask');
    this.waitForFont().then(() => this.scene.start('Title'));
  }

  makeLightMask(key) {
    const size = 192;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const d = Math.sqrt(dx * dx + dy * dy);
        const t = Math.min(1, d / center);
        const a = Math.pow(Math.max(0, 1 - t), 0.7);
        const i = (y * size + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 255;
        img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    this.textures.addCanvas(key, canvas);
  }

  async waitForFont() {
    if (!document.fonts || !document.fonts.load) return;
    try {
      await document.fonts.load('10px "Press Start 2P"');
      await document.fonts.ready;
    } catch (e) {}
  }

  makeParticleTexture(key, color, size) {
    const g = this.add.graphics();
    g.fillStyle(color, 1).fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeCaveFar(key) {
    const w = 256, h = 256;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 1).fillRect(0, 0, w, h);

    g.fillStyle(0x1c1c1c, 1);
    for (let i = 0; i < 6; i++) {
      const cx = (i * 53 + 11) % w;
      const len = 50 + ((i * 23) % 70);
      const half = 8 + ((i * 11) % 8);
      this.drawTriangleDown(g, cx, 0, len, half);
    }
    for (let i = 0; i < 5; i++) {
      const cx = (i * 61 + 21) % w;
      const len = 40 + ((i * 19) % 60);
      const half = 8 + ((i * 7) % 8);
      this.drawTriangleUp(g, cx, h, h - len, half);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeCaveNear(key) {
    const w = 256, h = 256;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 1).fillRect(0, 0, w, h);

    g.fillStyle(0x383838, 1);
    for (let i = 0; i < 8; i++) {
      const cx = (i * 31 + 13) % w;
      const len = 36 + ((i * 17) % 64);
      const half = 4 + ((i * 7) % 6);
      this.drawTriangleDown(g, cx, 0, len, half);
    }
    for (let i = 0; i < 6; i++) {
      const cx = (i * 41 + 7) % w;
      const len = 28 + ((i * 19) % 56);
      const half = 4 + ((i * 5) % 6);
      this.drawTriangleUp(g, cx, h, h - len, half);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  drawTriangleDown(g, cx, topY, tipY, baseHalf) {
    const height = tipY - topY;
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const offset = Math.round(baseHalf * (1 - t));
      g.fillRect(cx - offset, topY + y, 1, 1);
      g.fillRect(cx + offset, topY + y, 1, 1);
    }
  }

  drawTriangleUp(g, cx, baseY, tipY, baseHalf) {
    const height = baseY - tipY;
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const offset = Math.round(baseHalf * t);
      g.fillRect(cx - offset, baseY - y - 1, 1, 1);
      g.fillRect(cx + offset, baseY - y - 1, 1, 1);
    }
  }

}
