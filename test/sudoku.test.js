import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mulberry32, generateSolution, countSolutions, grade, generate,
  conflicts, isSolved, parse, PEERS, DIFFICULTY,
} from '../src/games/sudoku/logic.js';

// 싱글(naked/hidden)만으로 풀리는 잘 알려진 쉬운 퍼즐
const EASY = parse('530070000600195000098000060800060003400803001700020006060000280000419005000080079');
const EASY_SOLUTION = parse('534678912672195348198342567859761423426853791713924856961537284287419635345286179');

function validComplete(grid) {
  if (grid.some((v) => v < 1 || v > 9)) return false;
  return grid.every((v, i) => PEERS[i].every((p) => grid[p] !== v));
}

test('PEERS: 칸마다 서로 다른 20개 이웃', () => {
  assert.equal(PEERS.length, 81);
  for (const peers of PEERS) assert.equal(new Set(peers).size, 20);
  assert.ok(PEERS[0].includes(8) && PEERS[0].includes(72) && PEERS[0].includes(20));
  assert.ok(!PEERS[0].includes(30));
});

test('mulberry32: 같은 시드면 같은 수열', () => {
  const a = mulberry32(42); const b = mulberry32(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('generateSolution: 규칙에 맞는 완성판, 시드가 같으면 같은 판', () => {
  const s = generateSolution(mulberry32(1));
  assert.ok(validComplete(s));
  assert.deepEqual(generateSolution(mulberry32(1)), s);
  assert.notDeepEqual(generateSolution(mulberry32(2)), s);
});

test('countSolutions: 유일해 / 해 여러 개 / 해 없음', () => {
  assert.equal(countSolutions(EASY), 1);
  assert.equal(countSolutions(Array(81).fill(0)), 2); // limit 2에서 멈춘다
  const broken = EASY.slice(); broken[2] = 5; // 같은 행에 5가 두 개
  assert.equal(countSolutions(broken), 0);
});

test('grade: 쉬운 퍼즐은 1단계로 풀리고 정답과 일치', () => {
  const r = grade(EASY);
  assert.equal(r.level, 1);
  assert.deepEqual(r.grid, EASY_SOLUTION);
});

for (const diff of Object.keys(DIFFICULTY)) {
  test(`generate(${diff}): 유일해, 정답과 일치, 난이도 조건 충족`, () => {
    const p = generate(diff, mulberry32(7));
    assert.equal(countSolutions(p.puzzle), 1);
    assert.ok(validComplete(p.solution));
    p.puzzle.forEach((v, i) => { if (v) assert.equal(v, p.solution[i]); });
    const givens = p.puzzle.filter(Boolean).length;
    const lv = grade(p.puzzle).level;
    const { maxLevel, minLevel } = DIFFICULTY[diff];
    assert.ok(lv <= maxLevel && lv >= minLevel, `level ${lv}, givens ${givens}`);
    // 180° 대칭
    p.puzzle.forEach((v, i) => assert.equal(!!v, !!p.puzzle[80 - i]));
  });
}

test('conflicts: 같은 행·열·박스의 중복 숫자 칸을 모두 표시', () => {
  const g = Array(81).fill(0);
  g[0] = 5; g[8] = 5; g[40] = 3;
  const c = conflicts(g);
  assert.ok(c.has(0) && c.has(8));
  assert.ok(!c.has(40));
});

test('isSolved: 정답이면 true, 빈 칸이나 오류가 있으면 false', () => {
  assert.equal(isSolved(EASY_SOLUTION), true);
  assert.equal(isSolved(EASY), false);
  const wrong = EASY_SOLUTION.slice(); [wrong[0], wrong[1]] = [wrong[1], wrong[0]];
  assert.equal(isSolved(wrong), false);
});
