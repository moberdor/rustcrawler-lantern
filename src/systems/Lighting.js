export class Lighting {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.darkAlpha = 0.96;

    this.dark = scene.add.image(0, 0, '__WHITE')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setTint(0x000000)
      .setAlpha(this.darkAlpha)
      .setDepth(50);

    this.maskRT = scene.add.renderTexture(0, 0, width, height)
      .setOrigin(0, 0)
      .setVisible(false);

    const mask = this.maskRT.createBitmapMask();
    mask.invertAlpha = true;
    this.dark.setMask(mask);

    this.brush = scene.add.image(-1000, -1000, 'lightmask').setOrigin(0.5, 0.5);

    this.lights = [];
  }

  add(getter) {
    this.lights.push(getter);
  }
  // Re renders lighting per frame
  // Clears the mask RenderTexture then places gradient brush at each light source
  // Dark overlay uses this RenderTexture as an inverted BitmapMask
  update(time) {
    const a = this.darkAlpha + Math.sin(time / 700) * 0.015;
    this.dark.setAlpha(a);

    this.maskRT.clear();
    for (const get of this.lights) {
      const l = get();
      if (!l.on) continue;
      let s = l.scale || 1;
      if (l.flicker) s *= 1 + Math.sin(time / 90) * 0.05 + Math.sin(time / 37) * 0.02;
      this.brush.setScale(s).setPosition(l.x, l.y);
      this.maskRT.draw(this.brush);
    }
    this.brush.setPosition(-1000, -1000);
  }
}
