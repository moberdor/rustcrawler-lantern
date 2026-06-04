import { VIEW } from '../config.js';

export function hasLineOfSight(layer, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return true;
  const stepSize = VIEW.TILE / 2;
  const steps = Math.max(1, Math.ceil(dist / stepSize));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    const tx = Math.floor(x / VIEW.TILE);
    const ty = Math.floor(y / VIEW.TILE);
    if (layer.getTileAt(tx, ty) !== null) return false;
  }
  return true;
}
