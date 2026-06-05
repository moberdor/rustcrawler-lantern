// Line of sight check between 2 points
// Checks along the ray every half tile, samples tilemap each step
// If any sample lands on a tile that collides, sight is blocked
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
    const tile = layer.getTileAt(tx, ty);
    if (tile && tile.collides) return false;
  }
  return true;
}
