import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lineClue, clues, parseRows, solveLine, lineSolve, generateRandom, isComplete, lineDone,
} from '../src/games/nonogram/logic.js';
import { PUZZLES } from '../src/games/nonogram/puzzles.js';
import { mulberry32 } from '../src/core/rng.js';

test('lineClue: 연속으로 칠한 칸 묶음', () => {
  assert.deepEqual(lineClue([1, 1, 0, 1, 0, 0, 1, 1, 1]), [2, 1, 3]);
  assert.deepEqual(lineClue([0, 0, 0]), []);
});

test('solveLine: 겹치는 칸은 반드시 칠해진다', () => {
  // 길이 10에 8 → 가운데 6칸 확정
  assert.deepEqual(solveLine([8], Array(10).fill(-1)), [-1, -1, 1, 1, 1, 1, 1, 1, -1, -1]);
  // 길이 5에 [2,2] → 1,1,0,1,1 확정
  assert.deepEqual(solveLine([2, 2], Array(5).fill(-1)), [1, 1, 0, 1, 1]);
  // 단서가 없으면 전부 빈칸
  assert.deepEqual(solveLine([], Array(3).fill(-1)), [0, 0, 0]);
});

test('solveLine: 이미 아는 칸을 이용하고, 모순이면 null', () => {
  assert.deepEqual(solveLine([1], [-1, -1, 1, -1]), [0, 0, 1, 0]);
  assert.equal(solveLine([1], [1, -1, 1, -1]), null);
});

test('lineSolve: 줄 논리로 풀리는 판과 안 풀리는 판', () => {
  const sol = parseRows(['.#.#.', '#####', '#####', '.###.', '..#..']);
  const c = clues(sol, 5);
  const r = lineSolve(c.rows, c.cols);
  assert.equal(r.solved, true);
  assert.deepEqual(r.grid, sol);
  // 대각선 두 칸은 해가 두 개 (줄 논리로 확정 못 함)
  const amb = clues(parseRows(['#.', '.#']), 2);
  assert.equal(lineSolve(amb.rows, amb.cols).solved, false);
});

test('PUZZLES: 정사각형, 아이디 중복 없음, 줄 논리만으로 그림 그대로 풀림', () => {
  const ids = new Set();
  for (const p of PUZZLES) {
    const size = p.rows.length;
    assert.ok(p.rows.every((r) => r.length === size && /^[#.]+$/.test(r)), `${p.id} 형식`);
    assert.ok(!ids.has(p.id), `${p.id} 중복`);
    ids.add(p.id);
    const sol = parseRows(p.rows);
    const c = clues(sol, size);
    const r = lineSolve(c.rows, c.cols);
    assert.ok(r.solved, `${p.id} 줄 논리로 풀림`);
    assert.deepEqual(r.grid, sol, `${p.id} 정답 일치`);
  }
});

test('generateRandom: 시드 고정, 줄 논리로 풀림, 빈 줄 없음', () => {
  const a = generateRandom(10, mulberry32(5));
  assert.deepEqual(generateRandom(10, mulberry32(5)), a);
  const c = clues(a, 10);
  assert.ok(c.rows.every((x) => x.length) && c.cols.every((x) => x.length));
  const r = lineSolve(c.rows, c.cols);
  assert.ok(r.solved);
  assert.deepEqual(r.grid, a);
});

test('isComplete / lineDone: X 표시는 빈칸으로 본다', () => {
  const sol = parseRows(['#.', '##']);
  const c = clues(sol, 2);
  assert.equal(isComplete([1, 2, 1, 1], 2, c.rows, c.cols), true);
  assert.equal(isComplete([1, 0, 1, 0], 2, c.rows, c.cols), false);
  assert.equal(lineDone([1, 2, 0, 0], 2, true, 0, c.rows[0]), true);
  assert.equal(lineDone([1, 1, 0, 0], 2, true, 0, c.rows[0]), false);
});
