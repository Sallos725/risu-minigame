import { newGame, step, deserialize, serialize } from './logic.js';
import { bindDirections } from '../../core/input.js';

const SAVE_KEY = 'g2048';

export default {
  id: 'g2048',
  title: '2048',
  icon: '🟨',
  desc: '같은 숫자를 합쳐 2048 만들기',

  async mount(root, { host, win, doc }) {
    let state = deserialize(await host.load(SAVE_KEY)) ?? newGame(Math.random);

    root.innerHTML = `
      <div class="g2048">
        <div class="g2048-top">
          <div class="g2048-score"><span>점수</span><b data-score>0</b></div>
          <div class="g2048-score"><span>최고</span><b data-best>0</b></div>
          <button class="mg-btn" data-new>새 게임</button>
        </div>
        <div class="g2048-wrap">
          <div class="g2048-board" data-board></div>
          <div class="g2048-overlay" data-overlay hidden>
            <p data-msg></p>
            <div class="g2048-overlay-btns">
              <button class="mg-btn" data-continue>계속하기</button>
              <button class="mg-btn mg-btn-primary" data-retry>새 게임</button>
            </div>
          </div>
        </div>
        <p class="g2048-help">방향키 · WASD · 스와이프</p>
      </div>`;

    const $ = (sel) => root.querySelector(sel);
    const board = $('[data-board]');
    const cells = Array.from({ length: 16 }, () => {
      const el = doc.createElement('div');
      el.className = 'g2048-cell';
      board.appendChild(el);
      return el;
    });

    function render(prevGrid) {
      state.grid.forEach((v, i) => {
        const el = cells[i];
        el.textContent = v ? String(v) : '';
        el.dataset.v = v > 2048 ? 'big' : String(v);
        el.classList.remove('g2048-pop');
        if (prevGrid && v && v !== prevGrid[i]) {
          void el.offsetWidth; // 애니메이션 재시작
          el.classList.add('g2048-pop');
        }
      });
      $('[data-score]').textContent = state.score;
      $('[data-best]').textContent = state.best;

      const showWin = state.won && !state.keepGoing && !state.over;
      $('[data-overlay]').hidden = !(state.over || showWin);
      $('[data-msg]').textContent = state.over ? '더 이상 움직일 수 없어요!' : '2048 달성!';
      $('[data-continue]').hidden = !showWin;
    }

    function commit(next, prevGrid) {
      if (next === state) return;
      state = next;
      render(prevGrid);
      host.save(SAVE_KEY, serialize(state));
    }

    function restart() {
      commit(newGame(Math.random, state.best));
    }

    const disposeInput = bindDirections(win, board, (dir) => {
      if (!$('[data-overlay]').hidden) return;
      const prev = state.grid;
      commit(step(state, dir, Math.random), prev);
    });

    $('[data-new]').addEventListener('click', () => {
      if (state.score > 0 && !state.over && !win.confirm('지금 판을 버리고 새로 시작할까요?')) return;
      restart();
    });
    $('[data-retry]').addEventListener('click', restart);
    $('[data-continue]').addEventListener('click', () => commit({ ...state, keepGoing: true }));

    render();

    return {
      dispose() {
        disposeInput();
      },
    };
  },
};
