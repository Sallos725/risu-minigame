import {
  generate, conflicts, isSolved, parse, stringify, PEERS, DIFFICULTY,
} from './logic.js';

const SAVE_KEY = 'sudoku';
const UNDO_LIMIT = 300;

const KEY_MOVE = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
  W: [-1, 0], S: [1, 0], A: [0, -1], D: [0, 1],
};

const fmtTime = (sec) => {
  const m = Math.floor(sec / 60); const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

function fromSave(data) {
  if (!data || data.v !== 1 || !DIFFICULTY[data.difficulty]) return null;
  if (typeof data.puzzle !== 'string' || data.puzzle.length !== 81) return null;
  if (typeof data.solution !== 'string' || data.solution.length !== 81) return null;
  if (typeof data.values !== 'string' || data.values.length !== 81) return null;
  const notes = Array.isArray(data.notes) && data.notes.length === 81 ? data.notes.map((n) => n | 0) : Array(81).fill(0);
  return {
    difficulty: data.difficulty,
    puzzle: parse(data.puzzle),
    solution: parse(data.solution),
    values: parse(data.values),
    notes,
    elapsed: data.elapsed | 0,
    done: !!data.done,
  };
}

function toSave(game, best) {
  return {
    v: 1,
    difficulty: game.difficulty,
    puzzle: stringify(game.puzzle),
    solution: stringify(game.solution),
    values: stringify(game.values),
    notes: game.notes.slice(),
    elapsed: game.elapsed,
    done: game.done,
    best,
  };
}

export default {
  id: 'sudoku',
  title: '스도쿠',
  icon: '🔢',
  desc: '9×9 숫자 퍼즐 · 쉬움 / 보통 / 어려움',

  async mount(root, { host, win, doc }) {
    const saved = await host.load(SAVE_KEY);
    let best = (saved && typeof saved.best === 'object' && saved.best) || {};
    let game = fromSave(saved);
    let selected = -1;
    let noteMode = false;
    let undo = [];
    let tick = 0;
    let pendingStart = 0;
    let disposed = false;

    root.innerHTML = `
      <div class="sdk">
        <div class="sdk-top">
          <span class="sdk-diff" data-diff></span>
          <span class="sdk-time" data-time>0:00</span>
          <button class="mg-btn" data-new>새 게임</button>
        </div>
        <div class="sdk-wrap">
          <div class="sdk-board" data-board></div>
          <div class="sdk-overlay" data-overlay hidden></div>
        </div>
        <div class="sdk-tools">
          <button class="mg-btn" data-undo>↶ 되돌리기</button>
          <button class="mg-btn" data-erase>⌫ 지우기</button>
          <button class="mg-btn" data-note>✎ 메모 <b data-note-state>끔</b></button>
        </div>
        <div class="sdk-pad" data-pad></div>
        <p class="sdk-help">방향키·WASD 이동 · 1–9 입력 · Backspace 지우기 · N 메모 · Ctrl+Z 되돌리기</p>
      </div>`;

    const $ = (sel) => root.querySelector(sel);
    const board = $('[data-board]');
    const overlay = $('[data-overlay]');

    const cells = Array.from({ length: 81 }, (_, i) => {
      const el = doc.createElement('button');
      el.className = 'sdk-cell';
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); select(i); });
      board.appendChild(el);
      return el;
    });

    const padButtons = Array.from({ length: 9 }, (_, k) => {
      const d = k + 1;
      const el = doc.createElement('button');
      el.className = 'sdk-num';
      el.innerHTML = `<b>${d}</b><small></small>`;
      el.addEventListener('click', () => input(d));
      $('[data-pad]').appendChild(el);
      return el;
    });

    // ---------- 상태 변경 ----------
    function persist() {
      if (game) host.save(SAVE_KEY, toSave(game, best));
    }

    function pushUndo() {
      undo.push({ values: game.values.slice(), notes: game.notes.slice() });
      if (undo.length > UNDO_LIMIT) undo.shift();
    }

    function select(i) {
      selected = i;
      render();
    }

    function input(d) {
      if (!game || game.done || selected < 0 || game.puzzle[selected]) return;
      const i = selected;
      pushUndo();
      if (noteMode) {
        if (game.values[i]) return void undo.pop();
        game.notes[i] ^= 1 << d;
      } else {
        game.values[i] = game.values[i] === d ? 0 : d;
        if (game.values[i]) {
          game.notes[i] = 0;
          for (const p of PEERS[i]) game.notes[p] &= ~(1 << d);
        }
      }
      afterChange();
    }

    function erase() {
      if (!game || game.done || selected < 0 || game.puzzle[selected]) return;
      if (!game.values[selected] && !game.notes[selected]) return;
      pushUndo();
      game.values[selected] = 0;
      game.notes[selected] = 0;
      afterChange();
    }

    function doUndo() {
      if (!game || game.done || undo.length === 0) return;
      const prev = undo.pop();
      game.values = prev.values;
      game.notes = prev.notes;
      afterChange();
    }

    function afterChange() {
      if (isSolved(game.values)) {
        game.done = true;
        const prevBest = best[game.difficulty];
        if (!prevBest || game.elapsed < prevBest) best = { ...best, [game.difficulty]: game.elapsed };
        stopTimer();
      }
      render();
      persist();
    }

    function toggleNote() {
      noteMode = !noteMode;
      render();
    }

    // ---------- 새 게임 ----------
    function showPicker(canCancel) {
      overlay.hidden = false;
      const inProgress = game && !game.done && game.values.some((v, i) => v && !game.puzzle[i]);
      overlay.innerHTML = `
        <p class="sdk-ov-title">난이도를 골라주세요</p>
        ${inProgress ? '<p class="sdk-ov-sub">지금 판은 사라져요</p>' : ''}
        <div class="sdk-ov-btns">
          ${Object.entries(DIFFICULTY).map(([k, v]) => `
            <button class="mg-btn mg-btn-primary" data-pick="${k}">${v.label}${best[k] ? `<small>최고 ${fmtTime(best[k])}</small>` : ''}</button>`).join('')}
          ${canCancel ? '<button class="mg-btn" data-cancel>취소</button>' : ''}
        </div>`;
      overlay.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => start(b.dataset.pick)));
      overlay.querySelector('[data-cancel]')?.addEventListener('click', () => { overlay.hidden = true; render(); });
    }

    function start(difficulty) {
      overlay.innerHTML = '<p class="sdk-ov-title">퍼즐 만드는 중…</p>';
      // 문구가 먼저 그려지도록 한 프레임 넘긴 뒤 생성한다.
      // 생성 중에 화면을 닫으면 dispose가 먼저 돌기 때문에, 여기서 다시 확인하지 않으면 타이머가 새어 나간다.
      clearTimeout(pendingStart);
      pendingStart = setTimeout(() => {
        pendingStart = 0;
        if (disposed) return;
        const p = generate(difficulty);
        game = {
          difficulty,
          puzzle: p.puzzle,
          solution: p.solution,
          values: p.puzzle.slice(),
          notes: Array(81).fill(0),
          elapsed: 0,
          done: false,
        };
        undo = [];
        selected = game.puzzle.findIndex((v) => !v);
        overlay.hidden = true;
        startTimer();
        render();
        persist();
      }, 30);
    }

    // ---------- 타이머 (열려 있고 화면이 보일 때만) ----------
    function startTimer() {
      stopTimer();
      if (!game || game.done) return;
      tick = setInterval(() => {
        if (doc.hidden || !overlay.hidden) return;
        game.elapsed++;
        $('[data-time]').textContent = fmtTime(game.elapsed);
        if (game.elapsed % 10 === 0) persist();
      }, 1000);
    }
    function stopTimer() {
      clearInterval(tick);
      tick = 0;
    }

    // ---------- 그리기 ----------
    function render() {
      if (!game) return;
      const bad = conflicts(game.values);
      const sel = selected;
      const selVal = sel >= 0 ? game.values[sel] : 0;
      const peers = sel >= 0 ? new Set(PEERS[sel]) : new Set();
      const counts = Array(10).fill(0);
      game.values.forEach((v) => { if (v) counts[v]++; });

      cells.forEach((el, i) => {
        const v = game.values[i];
        const given = !!game.puzzle[i];
        el.classList.toggle('sdk-given', given);
        el.classList.toggle('sdk-user', !given && !!v);
        el.classList.toggle('sdk-sel', i === sel);
        el.classList.toggle('sdk-peer', peers.has(i));
        el.classList.toggle('sdk-same', !!selVal && v === selVal && i !== sel);
        el.classList.toggle('sdk-bad', bad.has(i) && !given);
        el.classList.toggle('sdk-bad-given', bad.has(i) && given);
        if (v) {
          el.textContent = String(v);
        } else if (game.notes[i]) {
          let html = '<span class="sdk-notes">';
          for (let d = 1; d <= 9; d++) {
            const on = game.notes[i] & (1 << d);
            html += `<i class="${on && d === selVal ? 'sdk-note-hit' : ''}">${on ? d : ''}</i>`;
          }
          el.innerHTML = `${html}</span>`;
        } else {
          el.textContent = '';
        }
      });

      padButtons.forEach((el, k) => {
        const left = 9 - counts[k + 1];
        el.querySelector('small').textContent = left > 0 ? String(left) : '';
        el.classList.toggle('sdk-num-done', left <= 0);
      });

      $('[data-diff]').textContent = DIFFICULTY[game.difficulty].label;
      $('[data-time]').textContent = fmtTime(game.elapsed);
      $('[data-note-state]').textContent = noteMode ? '켬' : '끔';
      $('[data-note]').classList.toggle('mg-btn-primary', noteMode);
      $('[data-undo]').disabled = undo.length === 0;

      if (game.done && overlay.hidden) {
        overlay.hidden = false;
        const isBest = best[game.difficulty] === game.elapsed;
        overlay.innerHTML = `
          <p class="sdk-ov-title">완성! 🎉</p>
          <p class="sdk-ov-sub">${DIFFICULTY[game.difficulty].label} · ${fmtTime(game.elapsed)}${isBest ? ' · 최고 기록!' : ''}</p>
          <div class="sdk-ov-btns"><button class="mg-btn mg-btn-primary" data-again>새 게임</button></div>`;
        overlay.querySelector('[data-again]').addEventListener('click', () => showPicker(false));
      }
    }

    // ---------- 키보드 ----------
    const onKey = (e) => {
      if (!game || !overlay.hidden) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); doUndo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const mv = KEY_MOVE[e.key];
      if (mv) {
        e.preventDefault();
        const cur = selected < 0 ? 40 : selected;
        const r = (Math.floor(cur / 9) + mv[0] + 9) % 9;
        const c = ((cur % 9) + mv[1] + 9) % 9;
        select(r * 9 + c);
        return;
      }
      if (/^[1-9]$/.test(e.key)) { e.preventDefault(); input(Number(e.key)); return; }
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { e.preventDefault(); erase(); return; }
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); toggleNote(); }
    };
    win.addEventListener('keydown', onKey);

    $('[data-new]').addEventListener('click', () => showPicker(!!game));
    $('[data-undo]').addEventListener('click', doUndo);
    $('[data-erase]').addEventListener('click', erase);
    $('[data-note]').addEventListener('click', toggleNote);

    if (game) {
      selected = game.done ? -1 : game.puzzle.findIndex((v, i) => !v && !game.values[i]);
      render();
      startTimer();
    } else {
      showPicker(false);
    }

    return {
      dispose() {
        disposed = true;
        clearTimeout(pendingStart);
        stopTimer();
        win.removeEventListener('keydown', onKey);
        persist();
      },
    };
  },
};
