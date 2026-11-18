// 2048 순수 로직. 판은 길이 16의 1차원 배열(행 우선), 0은 빈 칸.

export const SIZE = 4;
export const WIN_TILE = 2048;

// 한 줄을 앞쪽(index 0)으로 민다. 타일은 이동 한 번에 한 번만 합쳐진다.
export function slideLine(line) {
  const tiles = line.filter((v) => v !== 0);
  const out = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2);
      gained += tiles[i] * 2;
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < line.length) out.push(0);
  return { line: out, gained };
}

// 방향별로 "앞쪽부터" 읽을 칸 인덱스 줄 목록
function lines(dir) {
  const result = [];
  for (let a = 0; a < SIZE; a++) {
    const idx = [];
    for (let b = 0; b < SIZE; b++) {
      if (dir === 'left') idx.push(a * SIZE + b);
      else if (dir === 'right') idx.push(a * SIZE + (SIZE - 1 - b));
      else if (dir === 'up') idx.push(b * SIZE + a);
      else idx.push((SIZE - 1 - b) * SIZE + a);
    }
    result.push(idx);
  }
  return result;
}

export function move(grid, dir) {
  const next = grid.slice();
  let gained = 0;
  let moved = false;
  for (const idx of lines(dir)) {
    const res = slideLine(idx.map((i) => grid[i]));
    gained += res.gained;
    idx.forEach((cell, k) => {
      if (next[cell] !== res.line[k]) moved = true;
      next[cell] = res.line[k];
    });
  }
  return { grid: next, gained, moved };
}

// 빈 칸 하나에 2(90%) 또는 4(10%)를 놓는다. rng는 [0,1) 값을 돌려주는 함수.
export function spawn(grid, rng) {
  const empty = [];
  grid.forEach((v, i) => { if (v === 0) empty.push(i); });
  if (empty.length === 0) return grid;
  const next = grid.slice();
  next[empty[Math.floor(rng() * empty.length)]] = rng() < 0.9 ? 2 : 4;
  return next;
}

export function canMove(grid) {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0) return true;
    const col = i % SIZE;
    if (col < SIZE - 1 && grid[i] === grid[i + 1]) return true;
    if (i + SIZE < grid.length && grid[i] === grid[i + SIZE]) return true;
  }
  return false;
}

export function newGame(rng, best = 0) {
  const grid = spawn(spawn(Array(SIZE * SIZE).fill(0), rng), rng);
  return { v: 1, grid, score: 0, best, over: false, won: false, keepGoing: false };
}

// 한 수 진행. 안 움직이면 같은 state 객체를 그대로 돌려준다.
export function step(state, dir, rng) {
  if (state.over) return state;
  const res = move(state.grid, dir);
  if (!res.moved) return state;
  const grid = spawn(res.grid, rng);
  const score = state.score + res.gained;
  const won = state.won || grid.some((v) => v >= WIN_TILE);
  return {
    ...state,
    grid,
    score,
    best: Math.max(state.best, score),
    won,
    over: !canMove(grid),
  };
}

export function serialize(state) {
  return { ...state, grid: state.grid.slice() };
}

export function deserialize(data) {
  if (!data || data.v !== 1) return null;
  if (!Array.isArray(data.grid) || data.grid.length !== SIZE * SIZE) return null;
  if (!data.grid.every((v) => Number.isInteger(v) && v >= 0)) return null;
  return {
    v: 1,
    grid: data.grid.slice(),
    score: Number(data.score) || 0,
    best: Number(data.best) || 0,
    over: !!data.over,
    won: !!data.won,
    keepGoing: !!data.keepGoing,
  };
}
