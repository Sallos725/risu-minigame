import { CSS } from './styles.js';

// 플러그인 iframe 안의 전체화면 UI.
// 닫혀 있을 때는 DOM·리스너·타이머를 하나도 남기지 않는다 (iOS 메모리 대책).

export function createApp({ host, games, notify }) {
  const win = window;
  const doc = document;
  let el = null;          // 열려 있을 때만 존재
  let current = null;     // { game, handle }
  let disposers = [];
  let toastTimer = 0;

  function q(sel) { return el.querySelector(sel); }

  async function open() {
    if (el) return;
    await host.api.showContainer('fullscreen');

    if (!doc.getElementById('mg-style')) {
      const style = doc.createElement('style');
      style.id = 'mg-style';
      style.textContent = CSS;
      doc.head.appendChild(style);
    }
    el = doc.createElement('div');
    el.className = 'mg-app';
    el.innerHTML = `
      <header class="mg-bar">
        <button class="mg-icon" data-back aria-label="게임 목록" hidden>◀</button>
        <h1 data-title>미니게임</h1>
        <button class="mg-icon" data-close aria-label="닫기">✕</button>
      </header>
      <main class="mg-stage" data-stage></main>
      <div class="mg-hint" data-hint hidden>화면을 한 번 클릭하면 방향키를 쓸 수 있어요</div>
      <div class="mg-toast" data-toast hidden>
        <span>💬 응답이 도착했어요!</span>
        <button class="mg-btn" data-toast-go>채팅 보기</button>
      </div>`;
    doc.body.appendChild(el);

    listen(q('[data-close]'), 'click', close);
    listen(q('[data-back]'), 'click', () => showMenu());
    listen(q('[data-toast-go]'), 'click', close);
    listen(win, 'keydown', (e) => { if (e.key === 'Escape') close(); });
    listen(doc, 'visibilitychange', () => { if (doc.hidden) host.flush(); });
    listen(win, 'pagehide', () => host.flush());
    setupFocusHint();

    const last = await host.load('last');
    const game = games.find((g) => g.id === last);
    if (game) await startGame(game);
    else await showMenu();
  }

  async function close() {
    if (!el) return;
    await stopGame();
    for (const off of disposers) off();
    disposers = [];
    clearTimeout(toastTimer);
    el.remove();
    el = null;
    await host.flush();
    await host.api.hideContainer();
  }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    disposers.push(() => target.removeEventListener(type, fn, opts));
  }

  // 사용자가 누른 버튼은 바깥 문서에 있어서 iframe이 키보드 포커스를 못 받을 수 있다.
  // 마우스 환경에서만, 포커스가 없을 때 안내를 띄운다.
  function setupFocusHint() {
    try { win.focus(); } catch { /* 무시 */ }
    const hint = q('[data-hint]');
    const fine = win.matchMedia?.('(pointer: fine)').matches;
    const update = () => { if (el) hint.hidden = !fine || doc.hasFocus(); };
    listen(win, 'focus', update);
    listen(win, 'blur', update);
    listen(win, 'pointerdown', () => setTimeout(update, 0));
    setTimeout(update, 50);
  }

  async function showMenu() {
    await stopGame();
    host.save('last', null);
    q('[data-title]').textContent = '미니게임';
    q('[data-back]').hidden = true;
    const stage = q('[data-stage]');
    stage.innerHTML = '<div class="mg-menu" data-menu></div>';
    const menu = q('[data-menu]');

    const notifyState = await notify.state();
    if (notifyState == null) {
      const card = doc.createElement('div');
      card.className = 'mg-card';
      card.innerHTML = `
        <p><b>🔔 응답 도착 알림</b><br>게임 중에 AI 응답이 오면 알려드려요. 켜면 RisuAI가 권한을 한 번 물어봐요.</p>
        <div class="mg-card-btns">
          <button class="mg-btn" data-no>괜찮아요</button>
          <button class="mg-btn mg-btn-primary" data-yes>켜기</button>
        </div>`;
      card.querySelector('[data-no]').addEventListener('click', () => { notify.decline(); showMenu(); });
      card.querySelector('[data-yes]').addEventListener('click', async () => {
        await notify.enable();
        if (el) showMenu();
      });
      menu.appendChild(card);
    }

    for (const game of games) {
      const btn = doc.createElement('button');
      btn.className = 'mg-game';
      btn.innerHTML = `<span class="mg-game-icon"></span><div><b></b><span></span></div>`;
      btn.querySelector('.mg-game-icon').textContent = game.icon;
      btn.querySelector('b').textContent = game.title;
      btn.querySelector('div span').textContent = game.desc;
      btn.addEventListener('click', () => startGame(game));
      menu.appendChild(btn);
    }

    if (notifyState != null) {
      const on = notifyState === 'on';
      const row = doc.createElement('div');
      row.className = 'mg-setting';
      row.innerHTML = `<span></span><button class="mg-btn" data-toggle></button>`;
      row.querySelector('span').textContent = on ? '🔔 응답 도착 알림 켜짐' : '🔕 응답 도착 알림 꺼짐';
      row.querySelector('[data-toggle]').textContent = on ? '끄기' : '켜기';
      row.querySelector('[data-toggle]').addEventListener('click', async () => {
        if (on) await notify.disable();
        else await notify.enable();
        if (el) showMenu();
      });
      menu.appendChild(row);
    }
  }

  async function startGame(game) {
    await stopGame();
    host.save('last', game.id);
    q('[data-title]').textContent = game.title;
    q('[data-back]').hidden = false;
    const stage = q('[data-stage]');
    stage.replaceChildren();
    const handle = await game.mount(stage, { host, win, doc });
    current = { game, handle };
  }

  async function stopGame() {
    if (!current) return;
    current.handle?.dispose?.();
    current = null;
    if (el) q('[data-stage]').replaceChildren();
  }

  function showResponseToast() {
    if (!el) return;
    const toast = q('[data-toast]');
    toast.hidden = false;
    try { navigator.vibrate?.(80); } catch { /* 샌드박스에서 막힐 수 있음 */ }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { if (el) toast.hidden = true; }, 15000);
  }

  return { open, close, showResponseToast, isOpen: () => !!el };
}
