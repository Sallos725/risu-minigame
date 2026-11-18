import {
  parse, range, slide, isSolved, solve, diffMove, stars, N,
} from './logic.js';
import { LEVELS } from './levels.js';

const SAVE_KEY = 'rushhour';
const UNLOCK_AHEAD = 3; // 못 깬 레벨이 있어도 몇 개 앞까지는 열어 둔다
const COLORS = ['#5b8def', '#f2b13a', '#7cc4a4', '#b38df0', '#f08a5d', '#4fb3c8', '#c9a27e', '#8fbf4d', '#e57aa8', '#6f7fd6', '#d9b44a', '#5fa88f'];
const KEY_DIR = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1], W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
};
const pct = (n) => `${(n * 100) / N}%`;
const colorOf = (id) => (id === 'A' ? '#e5484d' : COLORS[(id.charCodeAt(0) - 66) % COLORS.length]);

function fromSave(data) {
  if (!data || data.v !== 1) return null;
  const level = data.level | 0;
  if (!LEVELS[level] || typeof data.board !== 'string' || !/^[.A-Z]{36}$/.test(data.board)) return null;
  return {
    level,
    board: data.board,
    history: Array.isArray(data.history) ? data.history.filter((b) => typeof b === 'string' && b.length === 36) : [],
    lastId: typeof data.lastId === 'string' ? data.lastId : null,
    hints: data.hints | 0,
    progress: data.progress && typeof data.progress === 'object' ? data.progress : {},
  };
}

export default {
  id: 'rushhour',
  title: '러시아워',
  icon: '🚗',
  desc: `빨간 차를 출구로 · ${LEVELS.length}레벨`,

  async mount(root, { host, win, doc }) {
    const saved = fromSave(await host.load(SAVE_KEY));
    let st = saved ?? { level: 0, board: LEVELS[0][0], history: [], lastId: null, hints: 0, progress: {} };
    let selected = 'A';
    let pieceEls = new Map();
    let hintTimer = 0;
    let disposed = false;

    root.innerHTML = `
      <div class="rh">
        <div class="rh-top">
          <button class="mg-btn" data-levels></button>
          <span class="rh-moves" data-moves></span>
        </div>
        <div class="rh-wrap">
          <div class="rh-board" data-board><div class="rh-exit" aria-hidden="true"></div></div>
          <div class="rh-overlay" data-overlay hidden></div>
        </div>
        <div class="rh-tools">
          <button class="mg-btn" data-undo>↶ 되돌리기</button>
          <button class="mg-btn" data-reset>⟲ 처음부터</button>
          <button class="mg-btn" data-hint-btn>💡 힌트</button>
        </div>
        <p class="rh-help">차를 끌어서 옮겨요 · 키보드: 방향키·WASD 이동/선택, Tab 선택, Z 되돌리기, R 처음부터, H 힌트</p>
      </div>`;

    const $ = (sel) => root.querySelector(sel);
    const boardEl = $('[data-board]');
    const overlay = $('[data-overlay]');
    const best = () => LEVELS[st.level][1];
    const maxCleared = () => Math.max(-1, ...Object.keys(st.progress).map(Number));
    const unlocked = (i) => i <= maxCleared() + UNLOCK_AHEAD;

    const persist = () => host.save(SAVE_KEY, { v: 1, ...st });

    // ---------- 조각 그리기 ----------
    function buildPieces() {
      for (const el of pieceEls.values()) el.remove();
      pieceEls = new Map();
      for (const p of parse(st.board)) {
        const el = doc.createElement('div');
        el.className = `rh-piece ${p.horiz ? 'rh-h' : 'rh-v'}${p.id === 'A' ? ' rh-red' : ''}`;
        el.dataset.id = p.id;
        el.style.setProperty('--c', colorOf(p.id));
        el.innerHTML = '<i></i>';
        el.addEventListener('pointerdown', (e) => startDrag(e, p.id));
        boardEl.appendChild(el);
        pieceEls.set(p.id, el);
      }
      placeAll();
    }

    function placeAll() {
      for (const p of parse(st.board)) {
        const el = pieceEls.get(p.id);
        if (!el) continue;
        el.style.left = pct(p.col);
        el.style.top = pct(p.row);
        el.style.width = pct(p.horiz ? p.len : 1);
        el.style.height = pct(p.horiz ? 1 : p.len);
        el.classList.toggle('rh-sel', p.id === selected && !isSolved(st.board));
      }
    }

    function renderInfo() {
      const n = st.history.length;
      $('[data-levels]').textContent = `레벨 ${st.level + 1} ▾`;
      $('[data-moves]').textContent = `이동 ${n} · 최소 ${best()}`;
      $('[data-undo]').disabled = n === 0 || isSolved(st.board);
      $('[data-reset]').disabled = n === 0 && !isSolved(st.board);
    }

    // ---------- 이동 ----------
    // 같은 조각을 연달아 움직이면 한 번으로 센다. 원래 자리로 돌아오면 그 이동은 취소된다.
    function doMove(id, delta) {
      if (delta === 0 || isSolved(st.board)) return;
      const next = slide(st.board, id, delta);
      if (st.lastId === id && st.history.length) {
        if (next === st.history[st.history.length - 1]) { st.history.pop(); st.lastId = null; }
      } else {
        st.history.push(st.board);
        st.lastId = id;
      }
      st.board = next;
      selected = id;
      clearHint();
      afterChange();
    }

    function afterChange() {
      placeAll();
      renderInfo();
      persist();
      if (isSolved(st.board)) onSolved();
    }

    function undo() {
      if (!st.history.length || isSolved(st.board)) return;
      st.board = st.history.pop();
      st.lastId = null;
      clearHint();
      afterChange();
    }

    function resetLevel() {
      loadLevel(st.level);
    }

    function loadLevel(i) {
      st = { ...st, level: i, board: LEVELS[i][0], history: [], lastId: null, hints: 0 };
      selected = 'A';
      overlay.hidden = true;
      clearHint();
      buildPieces();
      renderInfo();
      persist();
    }

    // ---------- 드래그 ----------
    function startDrag(e, id) {
      if (e.button !== undefined && e.button !== 0) return;
      if (isSolved(st.board) || !overlay.hidden) return;
      e.preventDefault();
      const p = parse(st.board).find((x) => x.id === id);
      const el = pieceEls.get(id);
      const { min, max } = range(st.board, p);
      const cell = boardEl.clientWidth / N;
      const sx = e.clientX; const sy = e.clientY;
      selected = id;
      placeAll();
      el.classList.add('rh-drag');
      el.setPointerCapture?.(e.pointerId);
      let off = 0;
      const onMove = (ev) => {
        const raw = (p.horiz ? ev.clientX - sx : ev.clientY - sy) / cell;
        off = Math.max(min, Math.min(max, raw));
        const base = pct(p.horiz ? p.col : p.row);
        el.style[p.horiz ? 'left' : 'top'] = `calc(${base} + ${off * cell}px)`;
      };
      const onUp = () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.classList.remove('rh-drag');
        const d = Math.round(off);
        if (d !== 0) doMove(id, d);
        else placeAll();
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    }

    // ---------- 키보드 ----------
    function selectToward(dr, dc) {
      const ps = parse(st.board);
      const cur = ps.find((p) => p.id === selected) ?? ps[0];
      const center = (p) => [p.row + (p.horiz ? 0 : (p.len - 1) / 2), p.col + (p.horiz ? (p.len - 1) / 2 : 0)];
      const [cr, cc] = center(cur);
      let bestId = null; let bestScore = Infinity;
      for (const p of ps) {
        if (p.id === cur.id) continue;
        const [r, c] = center(p);
        const along = dr ? (r - cr) * dr : (c - cc) * dc;
        if (along <= 0) continue;
        const side = dr ? Math.abs(c - cc) : Math.abs(r - cr);
        const score = along + side * 2;
        if (score < bestScore) { bestScore = score; bestId = p.id; }
      }
      if (bestId) { selected = bestId; placeAll(); }
    }

    function cycle(step) {
      const ids = parse(st.board).map((p) => p.id).sort();
      const i = ids.indexOf(selected);
      selected = ids[(i + step + ids.length) % ids.length];
      placeAll();
    }

    const onKey = (e) => {
      if (!overlay.hidden) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Tab') { e.preventDefault(); cycle(e.shiftKey ? -1 : 1); return; }
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undo(); return; }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); resetLevel(); return; }
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); hint(); return; }
      const dir = KEY_DIR[e.key];
      if (!dir || isSolved(st.board)) return;
      e.preventDefault();
      const p = parse(st.board).find((x) => x.id === selected);
      if (!p) return;
      const [dr, dc] = dir;
      const along = p.horiz ? dc : dr;
      if (along === 0) { selectToward(dr, dc); return; }
      const { min, max } = range(st.board, p);
      if ((along < 0 && min < 0) || (along > 0 && max > 0)) doMove(p.id, along);
    };
    win.addEventListener('keydown', onKey);

    // ---------- 힌트 ----------
    function clearHint() {
      clearTimeout(hintTimer);
      for (const el of pieceEls.values()) el.classList.remove('rh-hint', 'rh-hint-fwd', 'rh-hint-back');
    }

    function hint() {
      if (isSolved(st.board) || !overlay.hidden) return;
      const btn = $('[data-hint-btn]');
      btn.disabled = true;
      btn.textContent = '💡 생각 중…';
      setTimeout(() => {
        if (disposed) return;
        btn.disabled = false;
        btn.textContent = '💡 힌트';
        const r = solve(st.board);
        if (!r || !r.next) return;
        const mv = diffMove(st.board, r.next);
        if (!mv) return;
        st.hints++;
        persist();
        clearHint();
        selected = mv.id;
        placeAll();
        const el = pieceEls.get(mv.id);
        el.classList.add('rh-hint', mv.delta > 0 ? 'rh-hint-fwd' : 'rh-hint-back');
        hintTimer = setTimeout(clearHint, 2500);
      }, 30);
    }

    // ---------- 클리어 / 레벨 목록 ----------
    function onSolved() {
      const got = stars(st.history.length, best());
      const prev = st.progress[st.level] | 0;
      if (got > prev) st.progress = { ...st.progress, [st.level]: got };
      persist();
      pieceEls.get('A')?.classList.add('rh-exit-anim');
      setTimeout(() => {
        if (disposed || !isSolved(st.board)) return;
        const hasNext = st.level + 1 < LEVELS.length;
        overlay.hidden = false;
        overlay.innerHTML = `<div class="rh-ov-inner">
          <p class="rh-ov-title">클리어! <span class="rh-stars">${'★'.repeat(got)}${'☆'.repeat(3 - got)}</span></p>
          <p class="rh-ov-sub">이동 ${st.history.length} · 최소 ${best()}${st.hints ? ` · 힌트 ${st.hints}번` : ''}</p>
          <div class="rh-ov-btns">
            ${hasNext ? '<button class="mg-btn mg-btn-primary" data-next>다음 레벨</button>' : '<p class="rh-ov-sub">마지막 레벨까지 깼어요! 🎉</p>'}
            <button class="mg-btn" data-retry>다시 하기</button>
            <button class="mg-btn" data-list>레벨 목록</button>
          </div></div>`;
        overlay.querySelector('[data-next]')?.addEventListener('click', () => loadLevel(st.level + 1));
        overlay.querySelector('[data-retry]').addEventListener('click', resetLevel);
        overlay.querySelector('[data-list]').addEventListener('click', showLevels);
      }, 380);
    }

    function showLevels() {
      clearHint();
      overlay.hidden = false;
      const cells = LEVELS.map(([, m], i) => {
        const s = st.progress[i] | 0;
        const open = unlocked(i);
        return `<button class="rh-lv${i === st.level ? ' rh-lv-cur' : ''}${s ? ' rh-lv-done' : ''}" data-lv="${i}" ${open ? '' : 'disabled'}>
          <b>${open ? i + 1 : '🔒'}</b><small>${s ? '★'.repeat(s) : open ? `${m}수` : ''}</small></button>`;
      }).join('');
      const cleared = Object.keys(st.progress).length;
      overlay.innerHTML = `<div class="rh-ov-inner">
        <div class="rh-lv-head"><b>레벨 선택</b><span>${cleared} / ${LEVELS.length} 클리어</span>
          <button class="mg-btn" data-close-list>닫기</button></div>
        <div class="rh-lv-grid">${cells}</div></div>`;
      overlay.querySelectorAll('[data-lv]').forEach((b) => b.addEventListener('click', () => loadLevel(Number(b.dataset.lv))));
      overlay.querySelector('[data-close-list]').addEventListener('click', () => {
        if (isSolved(st.board)) onSolved();
        overlay.hidden = true;
      });
      overlay.querySelector('.rh-lv-cur')?.scrollIntoView({ block: 'nearest' });
    }

    $('[data-levels]').addEventListener('click', showLevels);
    $('[data-undo]').addEventListener('click', undo);
    $('[data-reset]').addEventListener('click', resetLevel);
    $('[data-hint-btn]').addEventListener('click', hint);

    buildPieces();
    renderInfo();
    if (isSolved(st.board)) onSolved();

    return {
      dispose() {
        disposed = true;
        clearHint();
        win.removeEventListener('keydown', onKey);
        persist();
      },
    };
  },
};
