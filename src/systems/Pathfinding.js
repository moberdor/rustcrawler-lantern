export function aStar(isBlocked, sx, sy, gx, gy, maxNodes) {
  if (isBlocked(gx, gy)) return null;
  if (sx === gx && sy === gy) return [{ x: sx, y: sy }];

  const start = { x: sx, y: sy, g: 0, f: heuristic(sx, sy, gx, gy), parent: null };
  const open = [start];
  const best = new Map();
  best.set(key(sx, sy), 0);

  let steps = 0;
  const limit = maxNodes || 800;

  while (open.length > 0) {
    if (++steps > limit) return null;

    let bi = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bi].f) bi = i;
    }
    const cur = open.splice(bi, 1)[0];

    if (cur.x === gx && cur.y === gy) {
      const path = [];
      let n = cur;
      while (n) {
        path.unshift({ x: n.x, y: n.y });
        n = n.parent;
      }
      return path;
    }

    const neighbors = [
      [cur.x + 1, cur.y],
      [cur.x - 1, cur.y],
      [cur.x, cur.y + 1],
      [cur.x, cur.y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (isBlocked(nx, ny)) continue;
      const ng = cur.g + 1;
      const k = key(nx, ny);
      const prev = best.get(k);
      if (prev !== undefined && prev <= ng) continue;
      best.set(k, ng);
      open.push({
        x: nx,
        y: ny,
        g: ng,
        f: ng + heuristic(nx, ny, gx, gy),
        parent: cur,
      });
    }
  }
  return null;
}

function heuristic(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function key(x, y) {
  return x + ',' + y;
}
