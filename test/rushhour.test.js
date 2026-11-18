import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parse, range, slide, isSolved, solve, neighbors, normalize, diffMove, stars,
} from '../src/games/rushhour/logic.js';
import { LEVELS } from '../src/games/rushhour/levels.js';

// 6×6, 행 우선. A = 빨간 차(2행, 가로), 나머지는 B~Z. 출구는 2행 오른쪽.
const row = (s) => s.replace(/ /g, '');
const EASY = row(
  '...B..'
  + '...B..'
  + 'AA.B..'
  + '......'
  + '......'
  + '......',
);

test('parse: 위치·길이·방향', () => {
  const ps = parse(EASY);
  const a = ps.find((p) => p.id === 'A');
  const b = ps.find((p) => p.id === 'B');
  assert.deepEqual([a.row, a.col, a.len, a.horiz], [2, 0, 2, true]);
  assert.deepEqual([b.row, b.col, b.len, b.horiz], [0, 3, 3, false]);
});

test('range: 막힐 때까지 움직일 수 있는 칸 수', () => {
  const ps = parse(EASY);
  assert.deepEqual(range(EASY, ps.find((p) => p.id === 'A')), { min: 0, max: 1 });
  assert.deepEqual(range(EASY, ps.find((p) => p.id === 'B')), { min: 0, max: 3 });
});

test('slide: 조각을 옮긴 새 판을 돌려준다', () => {
  const moved = slide(EASY, 'B', 3);
  assert.equal(moved.slice(12, 18), 'AA....');
  assert.equal(moved.slice(30, 36), '...B..');
});

test('isSolved: 빨간 차가 출구 칸(2행 5열)에 닿으면 끝', () => {
  assert.equal(isSolved(EASY), false);
  assert.equal(isSolved(row('......' + '......' + '....AA' + '......' + '......' + '......')), true);
});

test('neighbors: 한 번 움직임 = 한 조각을 원하는 만큼 미끄러뜨리기', () => {
  // A는 오른쪽 1칸, B는 아래로 1·2·3칸 → 4개
  assert.equal(neighbors(EASY).length, 4);
});

test('solve: 최소 이동 수와 첫 수', () => {
  const r = solve(EASY);
  assert.equal(r.moves, 2);
  assert.equal(diffMove(EASY, r.next).id, 'B');
  assert.equal(solve(row('......' + '......' + '....AA' + '......' + '......' + '......')).moves, 0);
  // 출구가 가로 차에 막혀 절대 못 푸는 판
  assert.equal(solve(row('......' + '......' + 'AA..BB' + '......' + '......' + '......')), null);
});

test('diffMove: 두 판 사이 움직인 조각과 거리', () => {
  assert.deepEqual(diffMove(EASY, slide(EASY, 'B', 2)), { id: 'B', delta: 2 });
  assert.equal(diffMove(EASY, EASY), null);
});

test('normalize: 글자 이름만 다른 판은 같은 문자열', () => {
  const a = row('CC.B..' + '...B..' + 'AA.B..' + '......' + '......' + '......');
  const b = row('BB.C..' + '...C..' + 'AA.C..' + '......' + '......' + '......');
  assert.equal(normalize(a), normalize(b));
});

test('stars: 최소 이동이면 3개, 1.5배 이내 2개, 그 외 1개', () => {
  assert.equal(stars(10, 10), 3);
  assert.equal(stars(15, 10), 2);
  assert.equal(stars(16, 10), 1);
});

test('LEVELS: 형식이 맞고, 적힌 최소 이동 수가 실제 풀이와 같고, 대체로 점점 어려워진다', () => {
  assert.ok(LEVELS.length >= 60, `레벨 ${LEVELS.length}개`);
  const seen = new Set();
  LEVELS.forEach(([board, moves], i) => {
    assert.match(board, /^[.A-Z]{36}$/, `레벨 ${i + 1} 형식`);
    assert.equal(solve(board)?.moves, moves, `레벨 ${i + 1} 최소 이동`);
    assert.ok(!seen.has(board), `레벨 ${i + 1} 중복`);
    seen.add(board);
    if (i > 0) assert.ok(moves >= LEVELS[i - 1][1], `레벨 ${i + 1} 난이도 순서`);
  });
});
