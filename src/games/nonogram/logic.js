// 네모로직 순수 로직. 판은 길이 size*size 배열(행 우선).
// 정답: 1 칠함 / 0 빈칸. 플레이 상태: 0 모름, 1 칠함, 2 X 표시.

export function lineClue(line) {
  const out = [];
  let run = 0;
  for (const v of line) {
    if (v === 1) run++;
    else if (run) { out.push(run); run = 0; }
  }
  if (run) out.push(run);
  return out;
}

const rowOf = (grid, size, r) => grid.slice(r * size, r * size + size);
const colOf = (grid, size, c) => Array.from({ length: size }, (_, r) => grid[r * size + c]);

export function clues(solution, size) {
  return {
    rows: Array.from({ length: size }, (_, r) => lineClue(rowOf(solution, size, r))),
    cols: Array.from({ length: size }, (_, c) => lineClue(colOf(solution, size, c))),
  };
}

export const parseRows = (rows) => rows.join('').split('').map((ch) => (ch === '#' ? 1 : 0));

// 한 줄 풀기. cells: -1 모름 / 1 칠함 / 0 빈칸.
// 단서와 맞는 모든 배치를 고려해서 반드시 칠해지는 칸·반드시 비는 칸을 찾는다.
// 반환: 새 cells 배열, 모순이면 null.
export function solveLine(clue, cells) {
  const n = cells.length;
  const m = clue.length;
  const fitsMemo = new Map();
  // i번 칸부터 k번째 단서부터 배치 가능한가
  function fits(i, k) {
    const key = i * 64 + k;
    if (fitsMemo.has(key)) return fitsMemo.get(key);
    let ok = false;
    if (k === m) {
      ok = true;
      for (let j = i; j < n; j++) if (cells[j] === 1) { ok = false; break; }
    } else if (i < n) {
      if (cells[i] !== 1 && fits(i + 1, k)) ok = true;
      if (!ok && canBlock(i, k)) ok = fits(Math.min(n, i + clue[k] + 1), k + 1);
    }
    fitsMemo.set(key, ok);
    return ok;
  }
  function canBlock(i, k) {
    const len = clue[k];
    if (i + len > n) return false;
    for (let j = i; j < i + len; j++) if (cells[j] === 0) return false;
    return !(i + len < n && cells[i + len] === 1);
  }

  if (!fits(0, 0)) return null;
  const canFill = new Uint8Array(n);
  const canEmpty = new Uint8Array(n);
  const seen = new Set();
  (function mark(i, k) {
    const key = i * 64 + k;
    if (seen.has(key)) return;
    seen.add(key);
    if (k === m) { for (let j = i; j < n; j++) canEmpty[j] = 1; return; }
    if (i >= n) return;
    if (cells[i] !== 1 && fits(i + 1, k)) { canEmpty[i] = 1; mark(i + 1, k); }
    if (canBlock(i, k)) {
      const end = i + clue[k];
      const next = Math.min(n, end + 1);
      if (fits(next, k + 1)) {
        for (let j = i; j < end; j++) canFill[j] = 1;
        if (end < n) canEmpty[end] = 1;
        mark(next, k + 1);
      }
    }
  })(0, 0);

  const out = cells.slice();
  for (let j = 0; j < n; j++) {
    if (!canFill[j] && !canEmpty[j]) return null;
    if (canFill[j] && !canEmpty[j]) out[j] = 1;
    else if (!canFill[j] && canEmpty[j]) out[j] = 0;
  }
  return out;
}

// 줄 단위 논리만으로 풀어 본다. solved면 찍기 없이 풀리고 해가 하나뿐이다.
export function lineSolve(rowClues, colClues) {
  const size = rowClues.length;
  const grid = Array(size * size).fill(-1);
  let passes = 0;
  let changed = true;
  while (changed) {
    changed = false;
    passes++;
    for (let r = 0; r < size; r++) {
      const next = solveLine(rowClues[r], rowOf(grid, size, r));
      if (!next) return { solved: false, grid, passes };
      next.forEach((v, c) => { if (grid[r * size + c] !== v) { grid[r * size + c] = v; changed = true; } });
    }
    for (let c = 0; c < size; c++) {
      const next = solveLine(colClues[c], colOf(grid, size, c));
      if (!next) return { solved: false, grid, passes };
      next.forEach((v, r) => { if (grid[r * size + c] !== v) { grid[r * size + c] = v; changed = true; } });
    }
  }
  return { solved: grid.every((v) => v !== -1), grid, passes };
}

// 랜덤 퍼즐: 줄 논리로 풀리는 판이 나올 때까지 만든다
export function generateRandom(size, rng, density = 0.58, maxTries = 400) {
  for (let t = 0; t < maxTries; t++) {
    const solution = Array.from({ length: size * size }, () => (rng() < density ? 1 : 0));
    const { rows, cols } = clues(solution, size);
    if (rows.some((x) => x.length === 0) || cols.some((x) => x.length === 0)) continue;
    if (lineSolve(rows, cols).solved) return solution;
  }
  return null;
}

// 플레이 상태가 모든 단서를 만족하면 완성 (줄 논리로 풀리는 퍼즐은 해가 하나라 정답과 같다)
export function isComplete(cells, size, rowClues, colClues) {
  const filled = cells.map((v) => (v === 1 ? 1 : 0));
  for (let r = 0; r < size; r++) if (!sameClue(lineClue(rowOf(filled, size, r)), rowClues[r])) return false;
  for (let c = 0; c < size; c++) if (!sameClue(lineClue(colOf(filled, size, c)), colClues[c])) return false;
  return true;
}

export function sameClue(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// 줄 단서가 지금 칠한 상태와 맞는지 (단서 숫자를 흐리게 보여주는 용도)
export function lineDone(cells, size, isRow, idx, clue) {
  const line = isRow ? rowOf(cells, size, idx) : colOf(cells, size, idx);
  return sameClue(lineClue(line.map((v) => (v === 1 ? 1 : 0))), clue);
}
