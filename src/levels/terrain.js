export function emptyGrid(w, h) {
  const grid = [];
  for (let r = 0; r < h; r++) grid.push(new Array(w).fill(0));
  return grid;
}

export function buildIsland(grid, c0, c1, topRow) {
  const H = grid.length;
  for (let c = c0; c <= c1; c++) {
    let topGid = 112;
    let midGid = 132;
    if (c === c0 && c === c1) {
      topGid = 112;
      midGid = 132;
    } else if (c === c0) {
      topGid = 111;
      midGid = 131;
    } else if (c === c1) {
      topGid = 113;
      midGid = 133;
    }
    grid[topRow][c] = topGid;
    for (let r = topRow + 1; r < H; r++) grid[r][c] = midGid;
  }
}

export function placePlatform(grid, row, c0, c1) {
  const span = c1 - c0;
  if (span === 0) {
    grid[row][c0] = 332;
    return;
  }
  grid[row][c0] = 331;
  for (let c = c0 + 1; c < c1; c++) grid[row][c] = 332;
  grid[row][c1] = 333;
}
