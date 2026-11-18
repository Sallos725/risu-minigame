// 스도쿠 순수 로직. 판은 길이 81의 배열(행 우선), 0은 빈 칸.
// 후보는 비트마스크(1<<d, d=1..9)로 다룬다.

const ALL = 0x3fe;

export const UNITS = (() => {
  const units = [];
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let b = 0; b < 9; b++) {
    const r0 = Math.floor(b / 3) * 3; const c0 = (b % 3) * 3;
    units.push(Array.from({ length: 9 }, (_, k) => (r0 + Math.floor(k / 3)) * 9 + c0 + (k % 3)));
  }
  return units;
})();

export const PEERS = Array.from({ length: 81 }, (_, i) => {
  const set = new Set();
  for (const u of UNITS) if (u.includes(i)) u.forEach((j) => { if (j !== i) set.add(j); });
  return [...set];
});

const bitCount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
const digitsOf = (m) => { const out = []; for (let d = 1; d <= 9; d++) if (m & (1 << d)) out.push(d); return out; };

export { mulberry32 } from '../../core/rng.js';

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const parse = (s) => [...s].map((ch) => (ch >= '1' && ch <= '9' ? Number(ch) : 0));
export const stringify = (g) => g.map((v) => v || 0).join('');

function candidates(grid, i) {
  let m = ALL;
  for (const p of PEERS[i]) if (grid[p]) m &= ~(1 << grid[p]);
  return m;
}

function consistent(grid) {
  return grid.every((v, i) => !v || PEERS[i].every((p) => grid[p] !== v));
}

// 후보가 가장 적은 빈 칸 (없으면 -1, 막힌 칸이 있으면 mask 0)
function pickCell(grid) {
  let best = -1; let bestMask = 0; let bestCount = 10;
  for (let i = 0; i < 81; i++) {
    if (grid[i]) continue;
    const m = candidates(grid, i);
    const n = bitCount(m);
    if (n < bestCount) { best = i; bestMask = m; bestCount = n; if (n <= 1) break; }
  }
  return { i: best, mask: bestMask };
}

// 해의 개수를 limit까지만 센다
export function countSolutions(input, limit = 2) {
  const grid = input.slice();
  if (!consistent(grid)) return 0;
  let count = 0;
  (function solve() {
    const { i, mask } = pickCell(grid);
    if (i === -1) { count++; return; }
    for (const d of digitsOf(mask)) {
      grid[i] = d;
      solve();
      if (count >= limit) break;
    }
    grid[i] = 0;
  })();
  return count;
}

export function generateSolution(rng) {
  const grid = Array(81).fill(0);
  (function fill() {
    const { i, mask } = pickCell(grid);
    if (i === -1) return true;
    for (const d of shuffle(digitsOf(mask), rng)) {
      grid[i] = d;
      if (fill()) return true;
    }
    grid[i] = 0;
    return false;
  })();
  return grid;
}

// 사람이 쓰는 기법으로 풀어서 난이도를 매긴다.
// level 1: naked/hidden single만으로 풀림
// level 2: locked candidates(pointing·claiming), naked pair까지 필요
// level 3: 그것으로도 안 풀림
export function grade(puzzle) {
  const grid = puzzle.slice();
  const cand = grid.map((v, i) => (v ? 0 : candidates(grid, i)));
  let level = 1;

  const place = (i, d) => {
    grid[i] = d; cand[i] = 0;
    for (const p of PEERS[i]) cand[p] &= ~(1 << d);
  };

  function singles() {
    let progress = false;
    for (let i = 0; i < 81; i++) {
      if (!grid[i] && bitCount(cand[i]) === 1) { place(i, digitsOf(cand[i])[0]); progress = true; }
    }
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const bit = 1 << d;
        let spot = -1; let n = 0;
        for (const i of u) if (cand[i] & bit) { spot = i; n++; }
        if (n === 1 && !grid[spot]) { place(spot, d); progress = true; }
      }
    }
    return progress;
  }

  function eliminate(cells, bit, keep) {
    let changed = false;
    for (const i of cells) {
      if (!keep.includes(i) && (cand[i] & bit)) { cand[i] &= ~bit; changed = true; }
    }
    return changed;
  }

  function advanced() {
    let changed = false;
    // locked candidates: 한 유닛 안에서 숫자 d의 후보가 다른 유닛과의 교집합에만 있으면
    // 그 다른 유닛의 나머지 칸에서 d를 지운다.
    for (const a of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const bit = 1 << d;
        const spots = a.filter((i) => cand[i] & bit);
        if (spots.length < 2) continue;
        for (const b of UNITS) {
          if (b === a || !spots.every((i) => b.includes(i))) continue;
          if (eliminate(b, bit, spots)) changed = true;
        }
      }
    }
    // naked pair
    for (const u of UNITS) {
      const pairs = u.filter((i) => bitCount(cand[i]) === 2);
      for (let x = 0; x < pairs.length; x++) {
        for (let y = x + 1; y < pairs.length; y++) {
          if (cand[pairs[x]] !== cand[pairs[y]]) continue;
          for (const d of digitsOf(cand[pairs[x]])) {
            if (eliminate(u, 1 << d, [pairs[x], pairs[y]])) changed = true;
          }
        }
      }
    }
    return changed;
  }

  for (;;) {
    if (singles()) continue;
    if (grid.every(Boolean)) break;
    if (advanced()) { level = 2; continue; }
    level = 3;
    break;
  }
  return { level, grid };
}

export const DIFFICULTY = {
  easy: { label: '쉬움', target: 40, minLevel: 1, maxLevel: 1 },
  medium: { label: '보통', target: 31, minLevel: 1, maxLevel: 1 },
  hard: { label: '어려움', target: 24, minLevel: 2, maxLevel: 2 },
};

// 180° 대칭으로 칸을 지우면서 유일해를 유지한다. 목표 개수까지 내려가거나 더 못 지우면 멈춘다.
function carve(solution, target, rng) {
  const puzzle = solution.slice();
  const order = shuffle(Array.from({ length: 41 }, (_, i) => i), rng);
  let givens = 81;
  for (const i of order) {
    if (givens <= target) break;
    const j = 80 - i;
    const a = puzzle[i]; const b = puzzle[j];
    puzzle[i] = 0; puzzle[j] = 0;
    if (countSolutions(puzzle) !== 1) { puzzle[i] = a; puzzle[j] = b; continue; }
    givens -= i === j ? 1 : 2;
  }
  return puzzle;
}

export function generate(difficulty, rng = Math.random, maxTries = 60) {
  const conf = DIFFICULTY[difficulty] ?? DIFFICULTY.easy;
  let fallback = null;
  for (let t = 0; t < maxTries; t++) {
    const solution = generateSolution(rng);
    const puzzle = carve(solution, conf.target, rng);
    const { level } = grade(puzzle);
    const result = { puzzle, solution, difficulty, level };
    if (level >= conf.minLevel && level <= conf.maxLevel) return result;
    if (level <= conf.maxLevel && !fallback) fallback = result;
  }
  // 조건에 딱 맞는 판을 못 찾으면, 너무 어렵지 않은 쪽을 쓴다
  return fallback ?? generate('easy', rng);
}

export function conflicts(grid) {
  const out = new Set();
  grid.forEach((v, i) => {
    if (!v) return;
    for (const p of PEERS[i]) if (grid[p] === v) { out.add(i); out.add(p); }
  });
  return out;
}

export function isSolved(grid) {
  return grid.every(Boolean) && conflicts(grid).size === 0;
}
