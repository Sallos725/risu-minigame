import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  slideLine, move, spawn, canMove, newGame, step, serialize, deserialize,
} from '../src/games/g2048/logic.js';

// 항상 같은 값을 돌려주는 RNG 시퀀스
const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test('slideLine: 한 번 이동에 타일은 한 번만 합쳐진다', () => {
  assert.deepEqual(slideLine([2, 2, 2, 2]).line, [4, 4, 0, 0]);
  assert.deepEqual(slideLine([4, 4, 8, 0]).line, [8, 8, 0, 0]);
  assert.deepEqual(slideLine([2, 0, 2, 4]).line, [4, 4, 0, 0]);
  assert.deepEqual(slideLine([0, 0, 0, 2]).line, [2, 0, 0, 0]);
});

test('slideLine: 합쳐진 값만큼 점수가 오른다', () => {
  assert.equal(slideLine([2, 2, 4, 4]).gained, 12);
  assert.equal(slideLine([2, 4, 8, 16]).gained, 0);
});

test('move: 방향별로 올바르게 민다', () => {
  const grid = [
    2, 0, 0, 2,
    0, 0, 0, 0,
    0, 0, 0, 0,
    2, 0, 0, 0,
  ];
  assert.deepEqual(move(grid, 'left').grid.slice(0, 4), [4, 0, 0, 0]);
  assert.deepEqual(move(grid, 'right').grid.slice(0, 4), [0, 0, 0, 4]);
  const up = move(grid, 'up').grid;
  assert.equal(up[0], 4);
  assert.equal(up[12], 0);
  const down = move(grid, 'down').grid;
  assert.equal(down[12], 4);
  assert.equal(down[15], 2);
});

test('move: 아무것도 안 움직이면 moved=false', () => {
  const grid = [
    2, 4, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];
  assert.equal(move(grid, 'left').moved, false);
  assert.equal(move(grid, 'right').moved, true);
});

test('spawn: 빈 칸에만 2 또는 4를 놓는다', () => {
  const grid = Array(16).fill(2);
  grid[5] = 0;
  const out = spawn(grid, seq(0.0, 0.95));
  assert.equal(out[5], 4);
  assert.equal(out.filter((v) => v === 0).length, 0);
  const out2 = spawn(grid, seq(0.0, 0.1));
  assert.equal(out2[5], 2);
});

test('canMove: 꽉 차도 합칠 수 있으면 true, 아니면 false', () => {
  const stuck = [
    2, 4, 2, 4,
    4, 2, 4, 2,
    2, 4, 2, 4,
    4, 2, 4, 2,
  ];
  assert.equal(canMove(stuck), false);
  const mergeable = stuck.slice();
  mergeable[1] = 2;
  assert.equal(canMove(mergeable), true);
});

test('newGame: 타일 두 개로 시작한다', () => {
  const s = newGame(Math.random, 128);
  assert.equal(s.grid.filter((v) => v !== 0).length, 2);
  assert.equal(s.score, 0);
  assert.equal(s.best, 128);
});

test('serialize/deserialize 왕복, 깨진 데이터는 null', () => {
  const s = newGame(Math.random, 0);
  assert.deepEqual(deserialize(serialize(s)), s);
  assert.equal(deserialize(null), null);
  assert.equal(deserialize({ v: 1, grid: [1, 2] }), null);
  assert.equal(deserialize({ v: 99 }), null);
});

test('step: 2048을 만들면 won, 막히면 over', () => {
  const base = { v: 1, score: 0, best: 0, over: false, won: false, keepGoing: false };
  const win = step({ ...base, grid: [1024, 1024, 0, 0, ...Array(12).fill(0)] }, 'left', () => 0);
  assert.equal(win.won, true);
  assert.equal(win.score, 2048);
  assert.equal(win.best, 2048);

  const almost = [
    2, 4, 2, 4,
    4, 2, 4, 2,
    2, 4, 2, 4,
    8, 16, 0, 2,
  ];
  // 오른쪽으로 밀면 [0,8,16,2], 빈 칸에 4가 들어가면 더 이상 못 움직인다
  const over = step({ ...base, grid: almost }, 'right', seq(0, 0.95));
  assert.deepEqual(over.grid.slice(12), [4, 8, 16, 2]);
  assert.equal(over.over, true);
});

test('step: 안 움직이는 방향이면 같은 상태 객체를 돌려준다', () => {
  const s = { v: 1, grid: [2, 0, 0, 0, ...Array(12).fill(0)], score: 0, best: 0, over: false, won: false, keepGoing: false };
  assert.equal(step(s, 'left', Math.random), s);
});
