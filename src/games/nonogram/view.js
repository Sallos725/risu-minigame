import {
  clues, parseRows, generateRandom, isComplete, lineDone,
} from './logic.js';
import { PUZZLES } from './puzzles.js';

const SAVE_KEY = 'nonogram';
const UNDO_LIMIT = 200;
const KEY_MOVE = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1], W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
};

const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// 칠한 칸을 SVG 경로 하나로 (미리보기·목록 썸네일용)
function pathOf(cells, size) {
  let d = '';
  cells.forEach((v, i) => { if (v === 1) d += `M${i % size} ${Math.floor(i / size)}h1v1h-1z`; });
  return d;
}
const svgOf = (cells, size, cls = '') => `<svg class="${cls}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet"><path d="${pathOf(cells, size)}"/></svg>`;

function puzzleFrom(id, randomSolution) {
  if (id === 'random' && randomSolution) {
    const size = Math.round(Math.sqrt(randomSolution.length));
    return { id, name: '랜덤 퍼즐', size, solution: randomSolution };
  }
  const p = PUZZLES.find((x) => x.id === id);
  if (!p) return null;
  return { id, name: p.name, size: p.rows.length, solution: parseRows(p.rows) };
}

function fromSave(data) {
  if (!data || data.v !== 1 || !data.cur) return null;
  const sol = typeof data.cur.solution === 'string' ? [...data.cur.solution].map(Number) : null;
  const puzzle = puzzleFrom(data.cur.id, sol);
  if (!puzzle) return null;
  const n = puzzle.size * puzzle.size;
  const cells = typeof data.cur.cells === 'string' && data.cur.cells.length === n ? [...data.cur.cells].map(Number) : Array(n).fill(0);
  return {
    puzzle,
    cells,
    elapsed: data.cur.elapsed | 0,
    done: !!data.cur.done,
    cleared: data.cleared && typeof data.cleared === 'object' ? data.cleared : {},
  };
}

export default {
  id: 'nonogram',
  title: '네모로직',
  icon: '🧩',
  desc: `숫자 힌트로 그림 맞히기 · 그림 ${PUZZLES.length}개 + 랜덤`,

  async mount(root, { host, win, doc }) {
    const saved = fromSave(await host.load(SAVE_KEY));
    let cleared = saved?.cleared ?? {};
    let puzzle = saved?.puzzle ?? puzzleFrom(PUZZLES[0].id);
    let cells = saved?.cells ?? Array(puzzle.size * puzzle.size).fill(0);
    let elapsed = saved?.elapsed ?? 0;
    let done = saved?.done ?? false;
    let clue = clues(puzzle.solution, puzzle.size);
    let mode = 1; // 1 칠하기, 2 X
    let cursor = 0;
    let undo = [];
    let tick = 0;
    let cellEls = [];
    let disposed = false;

    root.innerHTML = `
      <div class="nn">
        <div class="nn-top">
          <button class="mg-btn" data-list></button>
          <span class="nn-time" data-time></span>
        </div>
        <div class="nn-wrap">
          <div class="nn-grid" data-grid></div>
          <div class="nn-overlay" data-overlay hidden></div>
        </div>
        <div class="nn-tools">
          <button class="mg-btn nn-mode" data-mode="1">■ 칠하기</button>
          <button class="mg-btn nn-mode" data-mode="2">✕ 표시</button>
          <button class="mg-btn" data-undo aria-label="되돌리기">↶</button>
          <button class="mg-btn" data-reset aria-label="처음부터">⟲</button>
        </div>
        <p class="nn-help">드래그로 한 줄 칠하기 · 우클릭 ✕ · 키보드: 방향키·WASD 이동, Space 칠하기, X 표시, Z 되돌리기</p>
      </div>`;

    const $ = (sel) => root.querySelector(sel);
    const gridEl = $('[data-grid]');
    const overlay = $('[data-overlay]');

    const persist = () => host.save(SAVE_KEY, {
      v: 1,
      cur: {
        id: puzzle.id,
        solution: puzzle.id === 'random' ? puzzle.solution.join('') : undefined,
        cells: cells.join(''),
        elapsed,
        done,
      },
      cleared,
    });

    // ---------- 판 만들기 ----------
    function build() {
      const n = puzzle.size;
      const maxRow = Math.max(1, ...clue.rows.map((c) => c.length));
      const maxCol = Math.max(1, ...clue.cols.map((c) => c.length));
      gridEl.style.setProperty('--n', n);
      gridEl.style.setProperty('--fs', n <= 5 ? '18px' : 'calc(var(--size) * .034)');
      gridEl.style.setProperty('--rc', maxRow);
      gridEl.style.setProperty('--cc', maxCol);
      const nums = (c) => (c.length ? c : [0]).map((v) => `<span>${v}</span>`).join('');
      gridEl.innerHTML = `
        <div class="nn-corner" data-preview></div>
        <div class="nn-cols">${clue.cols.map((c) => `<div class="nn-clue">${nums(c)}</div>`).join('')}</div>
        <div class="nn-rows">${clue.rows.map((c) => `<div class="nn-clue">${nums(c)}</div>`).join('')}</div>
        <div class="nn-board" data-board></div>`;
      const board = gridEl.querySelector('[data-board]');
      cellEls = Array.from({ length: n * n }, (_, i) => {
        const el = doc.createElement('div');
        el.className = 'nn-cell';
        const r = Math.floor(i / n); const c = i % n;
        if (c % 5 === 4 && c < n - 1) el.classList.add('nn-c5');
        if (r % 5 === 4 && r < n - 1) el.classList.add('nn-r5');
        board.appendChild(el);
        return el;
      });
      board.addEventListener('pointerdown', onDown);
      board.addEventListener('contextmenu', (e) => e.preventDefault());
      render();
    }

    function render() {
      const n = puzzle.size;
      const cr = Math.floor(cursor / n); const cc = cursor % n;
      cellEls.forEach((el, i) => {
        const v = cells[i];
        el.classList.toggle('nn-fill', v === 1);
        el.classList.toggle('nn-x', v === 2 && !done);
        el.classList.toggle('nn-cur', i === cursor && !done);
        el.classList.toggle('nn-line', !done && i !== cursor && (Math.floor(i / n) === cr || i % n === cc));
      });
      const rowEls = gridEl.querySelectorAll('.nn-rows .nn-clue');
      const colEls = gridEl.querySelectorAll('.nn-cols .nn-clue');
      clue.rows.forEach((c, r) => rowEls[r].classList.toggle('nn-done', lineDone(cells, n, true, r, c)));
      clue.cols.forEach((c, k) => colEls[k].classList.toggle('nn-done', lineDone(cells, n, false, k, c)));
      gridEl.querySelector('[data-preview]').innerHTML = svgOf(cells, n, 'nn-prev');
      gridEl.classList.toggle('nn-solved', done);

      const idx = PUZZLES.findIndex((p) => p.id === puzzle.id);
      $('[data-list]').textContent = `${idx >= 0 ? `#${idx + 1}` : '랜덤'} · ${n}×${n} ▾`;
      $('[data-time]').textContent = fmtTime(elapsed);
      root.querySelectorAll('.nn-mode').forEach((b) => b.classList.toggle('mg-btn-primary', Number(b.dataset.mode) === mode));
      $('[data-undo]').disabled = undo.length === 0 || done;
      $('[data-reset]').disabled = done || !cells.some(Boolean);
    }

    // ---------- 칠하기 ----------
    // 시작 칸이 이미 그 표시면 지우개, 아니면 빈 칸에만 그 표시를 한다 (X 칸을 칠하지 않게).
    function strokeAction(i, tool) {
      return cells[i] === tool ? { tool, erase: true } : { tool, erase: false };
    }
    function applyAction(base, i, act) {
      if (act.erase) { if (base[i] === act.tool) base[i] = 0; } else if (base[i] === 0) base[i] = act.tool;
    }

    function commit(before) {
      if (before.every((v, i) => v === cells[i])) return;
      undo.push(before);
      if (undo.length > UNDO_LIMIT) undo.shift();
      if (isComplete(cells, puzzle.size, clue.rows, clue.cols)) onSolved();
      render();
      persist();
    }

    function onDown(e) {
      if (done || !overlay.hidden) return;
      if (e.button !== undefined && e.button !== 0 && e.button !== 2) return;
      e.preventDefault();
      const board = e.currentTarget;
      const rect = board.getBoundingClientRect();
      const n = puzzle.size;
      const at = (ev) => {
        const c = Math.floor(((ev.clientX - rect.left) / rect.width) * n);
        const r = Math.floor(((ev.clientY - rect.top) / rect.height) * n);
        return [Math.max(0, Math.min(n - 1, r)), Math.max(0, Math.min(n - 1, c))];
      };
      const [sr, sc] = at(e);
      const start = sr * n + sc;
      const act = strokeAction(start, e.button === 2 ? 2 : mode);
      const before = cells.slice();
      let axis = null;
      const paint = (ev) => {
        let [r, c] = at(ev);
        if (!axis && (r !== sr || c !== sc)) axis = Math.abs(r - sr) >= Math.abs(c - sc) ? 'col' : 'row';
        if (axis === 'row') r = sr; else if (axis === 'col') c = sc;
        const next = before.slice();
        const [r0, r1] = [Math.min(sr, r), Math.max(sr, r)];
        const [c0, c1] = [Math.min(sc, c), Math.max(sc, c)];
        for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) applyAction(next, y * n + x, act);
        cells = next;
        cursor = r * n + c;
        render();
      };
      board.setPointerCapture?.(e.pointerId);
      paint(e);
      const onMove = (ev) => paint(ev);
      const onUp = () => {
        board.removeEventListener('pointermove', onMove);
        board.removeEventListener('pointerup', onUp);
        board.removeEventListener('pointercancel', onUp);
        commit(before);
      };
      board.addEventListener('pointermove', onMove);
      board.addEventListener('pointerup', onUp);
      board.addEventListener('pointercancel', onUp);
    }

    function keyPaint(tool) {
      if (done) return;
      const before = cells.slice();
      cells = before.slice();
      applyAction(cells, cursor, strokeAction(cursor, tool));
      commit(before);
    }

    function doUndo() {
      if (done || !undo.length) return;
      cells = undo.pop();
      render();
      persist();
    }

    function resetBoard() {
      if (done || !cells.some(Boolean)) return;
      undo.push(cells.slice());
      cells = cells.map(() => 0);
      render();
      persist();
    }

    // ---------- 완성 / 퍼즐 고르기 ----------
    function onSolved() {
      done = true;
      cells = cells.map((v) => (v === 1 ? 1 : 0));
      const prev = cleared[puzzle.id];
      if (puzzle.id !== 'random' && (prev == null || elapsed < prev)) cleared = { ...cleared, [puzzle.id]: elapsed };
      stopTimer();
      setTimeout(() => { if (!disposed && done) showSolved(); }, 450);
    }

    function nextUnsolved() {
      const idx = PUZZLES.findIndex((p) => p.id === puzzle.id);
      for (let k = 1; k <= PUZZLES.length; k++) {
        const p = PUZZLES[(Math.max(idx, -1) + k) % PUZZLES.length];
        if (!cleared[p.id]) return p.id;
      }
      return null;
    }

    function showSolved() {
      overlay.hidden = false;
      const next = nextUnsolved();
      overlay.innerHTML = `<div class="nn-ov-inner">
        ${svgOf(puzzle.solution, puzzle.size, 'nn-reveal')}
        <p class="nn-ov-title">${puzzle.name}!</p>
        <p class="nn-ov-sub">${fmtTime(elapsed)}${puzzle.id !== 'random' && cleared[puzzle.id] === elapsed ? ' · 최고 기록!' : ''}</p>
        <div class="nn-ov-btns">
          ${next ? '<button class="mg-btn mg-btn-primary" data-next>다음 그림</button>' : ''}
          <button class="mg-btn" data-random>랜덤 퍼즐</button>
          <button class="mg-btn" data-open-list>퍼즐 목록</button>
        </div></div>`;
      overlay.querySelector('[data-next]')?.addEventListener('click', () => load(next));
      overlay.querySelector('[data-random]').addEventListener('click', () => load('random'));
      overlay.querySelector('[data-open-list]').addEventListener('click', showList);
    }

    function showList() {
      overlay.hidden = false;
      const item = (p, i) => {
        const t = cleared[p.id] != null;
        const size = p.rows.length;
        return `<button class="nn-item${p.id === puzzle.id ? ' nn-item-cur' : ''}" data-pick="${p.id}">
          ${t ? svgOf(parseRows(p.rows), size, 'nn-thumb') : `<span class="nn-q">?</span>`}
          <small>${t ? p.name : `#${i + 1}`}</small></button>`;
      };
      const small = PUZZLES.map((p, i) => [p, i]).filter(([p]) => p.rows.length === 5);
      const big = PUZZLES.map((p, i) => [p, i]).filter(([p]) => p.rows.length !== 5);
      const count = Object.keys(cleared).length;
      overlay.innerHTML = `<div class="nn-ov-inner nn-list">
        <div class="nn-list-head"><b>퍼즐 고르기</b><span>${count} / ${PUZZLES.length}</span>
          <button class="mg-btn" data-close-list>닫기</button></div>
        <button class="mg-btn mg-btn-primary nn-random" data-pick="random">🎲 새 랜덤 퍼즐 (10×10)</button>
        <p class="nn-sec">5×5 연습</p><div class="nn-items">${small.map(([p, i]) => item(p, i)).join('')}</div>
        <p class="nn-sec">10×10</p><div class="nn-items">${big.map(([p, i]) => item(p, i)).join('')}</div>
      </div>`;
      overlay.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => load(b.dataset.pick)));
      overlay.querySelector('[data-close-list]').addEventListener('click', () => {
        overlay.hidden = true;
        if (done) showSolved();
      });
    }

    function load(id) {
      const p = id === 'random'
        ? puzzleFrom('random', generateRandom(10, Math.random))
        : puzzleFrom(id);
      if (!p) return;
      puzzle = p;
      clue = clues(puzzle.solution, puzzle.size);
      cells = Array(puzzle.size * puzzle.size).fill(0);
      elapsed = 0;
      done = false;
      undo = [];
      cursor = 0;
      overlay.hidden = true;
      build();
      startTimer();
      persist();
    }

    // ---------- 타이머 ----------
    function startTimer() {
      stopTimer();
      if (done) return;
      tick = setInterval(() => {
        if (doc.hidden || !overlay.hidden) return;
        elapsed++;
        $('[data-time]').textContent = fmtTime(elapsed);
        if (elapsed % 10 === 0) persist();
      }, 1000);
    }
    function stopTimer() { clearInterval(tick); tick = 0; }

    // ---------- 키보드 ----------
    const onKey = (e) => {
      if (!overlay.hidden) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); doUndo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = puzzle.size;
      const mv = KEY_MOVE[e.key];
      if (mv) {
        e.preventDefault();
        const r = (Math.floor(cursor / n) + mv[0] + n) % n;
        const c = ((cursor % n) + mv[1] + n) % n;
        cursor = r * n + c;
        render();
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); keyPaint(1); return; }
      if (e.key === 'x' || e.key === 'X') { e.preventDefault(); keyPaint(2); return; }
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); doUndo(); }
    };
    win.addEventListener('keydown', onKey);

    $('[data-list]').addEventListener('click', showList);
    root.querySelectorAll('.nn-mode').forEach((b) => b.addEventListener('click', () => { mode = Number(b.dataset.mode); render(); }));
    $('[data-undo]').addEventListener('click', doUndo);
    $('[data-reset]').addEventListener('click', resetBoard);

    build();
    if (done) showSolved();
    else startTimer();

    return {
      dispose() {
        disposed = true;
        stopTimer();
        win.removeEventListener('keydown', onKey);
        persist();
      },
    };
  },
};
