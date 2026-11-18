// 러시아워 순수 로직. 판은 36글자 문자열(6×6, 행 우선).
// '.' 빈 칸, 'A' 빨간 차(2행 가로), 'B'~'Z' 다른 차(길이 2)·트럭(길이 3).
// 출구는 2행 오른쪽 끝. 한 번 움직임 = 한 조각을 원하는 만큼 미끄러뜨리기.

export const N = 6;
export const EXIT_ROW = 2;

export function parse(board) {
  const map = new Map();
  for (let i = 0; i < 36; i++) {
    const ch = board[i];
    if (ch === '.') continue;
    if (!map.has(ch)) map.set(ch, []);
    map.get(ch).push(i);
  }
  return [...map].map(([id, cells]) => {
    const first = cells[0];
    const horiz = cells.length === 1 || cells[1] - first === 1;
    return { id, row: Math.floor(first / N), col: first % N, len: cells.length, horiz };
  });
}

const cellAt = (p, k) => (p.horiz ? p.row * N + p.col + k : (p.row + k) * N + p.col);

// 현재 위치 기준으로 뒤로(min, 음수) / 앞으로(max) 갈 수 있는 칸 수
export function range(board, p) {
  let min = 0; let max = 0;
  if (p.horiz) {
    while (p.col + min - 1 >= 0 && board[p.row * N + p.col + min - 1] === '.') min--;
    while (p.col + p.len + max < N && board[p.row * N + p.col + p.len + max] === '.') max++;
  } else {
    while (p.row + min - 1 >= 0 && board[(p.row + min - 1) * N + p.col] === '.') min--;
    while (p.row + p.len + max < N && board[(p.row + p.len + max) * N + p.col] === '.') max++;
  }
  return { min, max };
}

function slidePiece(board, p, delta) {
  const arr = board.split('');
  for (let k = 0; k < p.len; k++) arr[cellAt(p, k)] = '.';
  const moved = p.horiz ? { ...p, col: p.col + delta } : { ...p, row: p.row + delta };
  for (let k = 0; k < p.len; k++) arr[cellAt(moved, k)] = p.id;
  return arr.join('');
}

export function slide(board, id, delta) {
  const p = parse(board).find((x) => x.id === id);
  return p ? slidePiece(board, p, delta) : board;
}

export const isSolved = (board) => board[EXIT_ROW * N + N - 1] === 'A';

export function neighbors(board) {
  const out = [];
  for (const p of parse(board)) {
    const { min, max } = range(board, p);
    for (let d = min; d <= max; d++) if (d !== 0) out.push(slidePiece(board, p, d));
  }
  return out;
}

// ---------- 빠른 탐색 엔진 ----------
// 한 판 안에서 조각의 고정 줄·길이·방향은 그대로고 위치만 바뀌므로,
// 상태를 "조각별 위치" 숫자 배열로 다룬다. 0번 조각이 빨간 차.
export function compile(board) {
  const ps = parse(board).sort((a, b) => (a.id === 'A' ? -1 : b.id === 'A' ? 1 : a.id < b.id ? -1 : 1));
  return {
    pieces: ps.map((p) => ({ id: p.id, horiz: p.horiz, fixed: p.horiz ? p.row : p.col, len: p.len })),
    start: ps.map((p) => (p.horiz ? p.col : p.row)),
  };
}

const keyOf = (pos) => String.fromCharCode(...pos);
const posOf = (key) => Array.from(key, (ch) => ch.charCodeAt(0));

function occupancy(pieces, pos) {
  const g = new Uint8Array(36);
  pieces.forEach((p, i) => {
    for (let k = 0; k < p.len; k++) g[p.horiz ? p.fixed * N + pos[i] + k : (pos[i] + k) * N + p.fixed] = 1;
  });
  return g;
}

// 한 상태에서 갈 수 있는 다음 상태들의 키
export function nextKeys(pieces, key) {
  const pos = posOf(key);
  const g = occupancy(pieces, pos);
  const out = [];
  pieces.forEach((p, i) => {
    const at = (x) => (p.horiz ? p.fixed * N + x : x * N + p.fixed);
    for (let x = pos[i] - 1; x >= 0 && !g[at(x)]; x--) {
      const q = pos.slice(); q[i] = x; out.push(keyOf(q));
    }
    for (let x = pos[i] + p.len; x < N && !g[at(x)]; x++) {
      const q = pos.slice(); q[i] = x - p.len + 1; out.push(keyOf(q));
    }
  });
  return out;
}

export const solvedKey = (key) => key.charCodeAt(0) === N - 2;
export const startKey = (c) => keyOf(c.start);

export function render(pieces, key) {
  const arr = Array(36).fill('.');
  const pos = posOf(key);
  pieces.forEach((p, i) => {
    for (let k = 0; k < p.len; k++) arr[p.horiz ? p.fixed * N + pos[i] + k : (pos[i] + k) * N + p.fixed] = p.id;
  });
  return arr.join('');
}

// BFS로 최소 이동 수와 그 경로의 첫 수(다음 판)를 구한다. 못 풀면 null.
export function solve(board, limit = 300000) {
  if (isSolved(board)) return { moves: 0, next: null };
  const { pieces, start } = compile(board);
  const root = keyOf(start);
  const parent = new Map([[root, null]]);
  let frontier = [root];
  let depth = 0;
  while (frontier.length && parent.size < limit) {
    depth++;
    const nextFrontier = [];
    for (const k of frontier) {
      for (const n of nextKeys(pieces, k)) {
        if (parent.has(n)) continue;
        parent.set(n, k);
        if (solvedKey(n)) {
          let cur = n;
          while (parent.get(cur) !== root) cur = parent.get(cur);
          return { moves: depth, next: render(pieces, cur) };
        }
        nextFrontier.push(n);
      }
    }
    frontier = nextFrontier;
  }
  return null;
}

// 두 판 사이에서 움직인 조각과 거리 (안 움직였으면 null)
export function diffMove(from, to) {
  if (from === to) return null;
  const before = parse(from);
  for (const q of parse(to)) {
    const p = before.find((x) => x.id === q.id);
    if (p && (p.row !== q.row || p.col !== q.col)) {
      return { id: q.id, delta: p.horiz ? q.col - p.col : q.row - p.row };
    }
  }
  return null;
}

// 빨간 차는 A로 두고, 나머지 조각 이름을 처음 나오는 순서대로 B, C…로 바꾼다 (중복 판정용)
export function normalize(board) {
  const names = new Map([['A', 'A'], ['.', '.']]);
  let next = 66;
  let out = '';
  for (const ch of board) {
    if (!names.has(ch)) names.set(ch, String.fromCharCode(next++));
    out += names.get(ch);
  }
  return out;
}

export function stars(moves, best) {
  if (moves <= best) return 3;
  if (moves <= Math.floor(best * 1.5)) return 2;
  return 1;
}
