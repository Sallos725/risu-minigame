// 러시아워 레벨 묶음 생성기. 결과는 src/games/rushhour/levels.js (커밋해서 번들에 들어간다).
// 1) 랜덤 배치 하나를 만들고, 거기서 갈 수 있는 모든 상태(연결 성분)를 탐색한다.
// 2) 성분 안의 "풀린 상태"들에서 거꾸로 BFS 해서, 출구에서 가장 먼 상태를 그 성분의 대표 퍼즐로 고른다.
// 3) 대표 퍼즐들을 최소 이동 수별로 모아 쉬운 것부터 어려운 순서로 레벨을 뽑는다.
// 4) 어려운 후보를 조금씩 바꿔 보며(조각 추가·제거·이동) 더 어려워지면 채택하는 언덕 오르기로 고난도 퍼즐을 늘린다.
// 사용: node scripts/gen-rushhour.mjs [샘플 수] [시드] [언덕 오르기 횟수]
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mulberry32 } from '../src/core/rng.js';
import {
  compile, nextKeys, solvedKey, startKey, render, normalize, solve, parse, slide, range,
} from '../src/games/rushhour/logic.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SAMPLES = Number(process.argv[2] || 1500);
const CLIMB_STEPS = Number(process.argv[4] || 4000);
const SEED = Number(process.argv[3] || 20261118);
const LEVEL_COUNT = 120;
const MAX_COMPONENT = 60000;
const rng = mulberry32(SEED);
const ri = (n) => Math.floor(rng() * n);

function randomBoard() {
  const arr = Array(36).fill('.');
  const redCol = ri(4);
  arr[12 + redCol] = 'A'; arr[13 + redCol] = 'A';
  const target = 7 + ri(7);
  let id = 66;
  for (let tries = 0; tries < 200 && id - 66 < target; tries++) {
    const len = rng() < 0.75 ? 2 : 3;
    const horiz = rng() < 0.5;
    const r = ri(horiz ? 6 : 7 - len);
    const c = ri(horiz ? 7 - len : 6);
    if (horiz && r === 2) continue; // 출구 줄의 가로 차는 영영 못 비킨다
    const cells = Array.from({ length: len }, (_, k) => (horiz ? r * 6 + c + k : (r + k) * 6 + c));
    if (cells.some((i) => arr[i] !== '.')) continue;
    const ch = String.fromCharCode(id++);
    cells.forEach((i) => { arr[i] = ch; });
  }
  return arr.join('');
}

// 연결 성분 전체를 탐색 (너무 크면 포기)
function component(pieces, start) {
  const seen = new Set([start]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    for (const n of nextKeys(pieces, queue[i])) {
      if (seen.has(n)) continue;
      seen.add(n);
      queue.push(n);
      if (seen.size > MAX_COMPONENT) return null;
    }
  }
  return queue;
}

// 풀린 상태들에서 동시에 BFS → 가장 먼 상태와 거리
function hardest(pieces, states) {
  const seen = new Set();
  let frontier = states.filter(solvedKey);
  if (frontier.length === 0) return null;
  frontier.forEach((k) => seen.add(k));
  let d = 0; let last = frontier;
  for (;;) {
    const next = [];
    for (const k of frontier) {
      for (const n of nextKeys(pieces, k)) {
        if (seen.has(n)) continue;
        seen.add(n);
        next.push(n);
      }
    }
    if (next.length === 0) break;
    last = next;
    frontier = next;
    d++;
  }
  return { board: render(pieces, last[0]), moves: d };
}

function evaluate(board) {
  const { pieces, start } = compile(board);
  const states = component(pieces, startKey({ start }));
  if (!states) return null;
  return hardest(pieces, states);
}

const t0 = Date.now();
const pool = new Map();
function addToPool(h) {
  if (!h || h.moves < 3) return;
  const key = normalize(h.board);
  if (!pool.has(key)) pool.set(key, { board: key, moves: h.moves });
}

for (let s = 0; s < SAMPLES; s++) {
  addToPool(evaluate(randomBoard()));
  if ((s + 1) % 500 === 0) console.log(`${s + 1}/${SAMPLES} 샘플, 후보 ${pool.size}개, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

// 언덕 오르기: 조각 하나를 빼거나, 새로 넣거나, 미끄러뜨린 변형을 평가한다
function mutate(board) {
  const ps = parse(board).filter((p) => p.id !== 'A');
  const op = rng();
  if (op < 0.3 && ps.length > 4) {
    const victim = ps[ri(ps.length)].id;
    return board.replaceAll(victim, '.');
  }
  if (op < 0.75) {
    const used = new Set(board);
    let ch = 66; while (used.has(String.fromCharCode(ch)) && ch < 91) ch++;
    if (ch >= 91) return null;
    const len = rng() < 0.75 ? 2 : 3;
    const horiz = rng() < 0.5;
    const r = ri(horiz ? 6 : 7 - len); const c = ri(horiz ? 7 - len : 6);
    if (horiz && r === 2) return null;
    const cells = Array.from({ length: len }, (_, k) => (horiz ? r * 6 + c + k : (r + k) * 6 + c));
    if (cells.some((i) => board[i] !== '.')) return null;
    const arr = board.split('');
    cells.forEach((i) => { arr[i] = String.fromCharCode(ch); });
    return arr.join('');
  }
  const p = ps[ri(ps.length)];
  if (!p) return null;
  const { min, max } = range(board, p);
  if (min === max) return null;
  let d = 0; while (d === 0) d = min + ri(max - min + 1);
  return slide(board, p.id, d);
}

let climbers = [...pool.values()].sort((a, b) => b.moves - a.moves).slice(0, 24);
for (let step = 0; step < CLIMB_STEPS; step++) {
  const i = step % climbers.length;
  const cur = climbers[i];
  const cand = mutate(cur.board);
  if (!cand) continue;
  const h = evaluate(cand);
  addToPool(h);
  if (h && h.moves >= cur.moves) climbers[i] = { board: normalize(h.board), moves: h.moves };
  if ((step + 1) % 500 === 0) {
    const top = Math.max(...climbers.map((c) => c.moves));
    console.log(`언덕 오르기 ${step + 1}/${CLIMB_STEPS}, 최고 ${top}수, 후보 ${pool.size}개, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}

// 최소 이동 수별로 묶고, 레벨 번호에 따라 완만하게 어려워지는 목표 곡선에 맞춰 뽑는다
const byMoves = new Map();
for (const c of pool.values()) {
  if (!byMoves.has(c.moves)) byMoves.set(c.moves, []);
  byMoves.get(c.moves).push(c);
}
const movesList = [...byMoves.keys()].sort((a, b) => a - b);
const minM = movesList[0];
const maxM = movesList.at(-1);
const used = new Map(movesList.map((m) => [m, 0]));
const levels = [];
for (let i = 0; i < LEVEL_COUNT; i++) {
  const target = Math.round(minM + (maxM - minM) * Math.pow(i / (LEVEL_COUNT - 1), 1.5));
  // 목표에 가장 가까운, 아직 남은 후보가 있는 이동 수
  const m = movesList
    .filter((x) => used.get(x) < byMoves.get(x).length)
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
  if (m === undefined) break;
  levels.push(byMoves.get(m)[used.get(m)]);
  used.set(m, used.get(m) + 1);
}
levels.sort((a, b) => a.moves - b.moves);

// 최종 확인: 기록한 최소 이동 수가 실제 풀이와 같은지 (언덕 오르기 결과는 시작 판이 대표 상태라 다시 확인)
for (const l of levels) {
  const r = solve(l.board);
  if (!r || r.moves !== l.moves) throw new Error(`검증 실패: ${l.board} ${l.moves} vs ${r?.moves}`);
}

const body = levels.map((l) => `  ['${l.board}', ${l.moves}],`).join('\n');
const out = `// scripts/gen-rushhour.mjs가 만든 파일이에요. 직접 고치지 마세요.
// 샘플 ${SAMPLES}개, 시드 ${SEED}. [판, 최소 이동 수]
export const LEVELS = [
${body}
];
`;
writeFileSync(path.join(root, 'src/games/rushhour/levels.js'), out);
console.log(`레벨 ${levels.length}개 (최소 이동 ${levels[0].moves}~${levels.at(-1).moves}), ${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log('이동 수 분포:', JSON.stringify(Object.fromEntries(movesList.map((m) => [m, byMoves.get(m).length]))));
