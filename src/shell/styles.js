export const CSS = `
:root {
  --mg-bg: #faf8ef; --mg-fg: #3c3a32; --mg-sub: #8a8577; --mg-card: #ffffff;
  --mg-line: #e3ddcd; --mg-accent: #8f7a66; --mg-accent-fg: #f9f6f2;
  --mg-board: #bbada0; --mg-cell: #cdc1b4; --mg-toast: #2f6f4f; --mg-toast-fg: #fff;
  --mg-veil: rgba(250,248,239,.78);
}
@media (prefers-color-scheme: dark) {
  :root {
    --mg-bg: #1d1c1a; --mg-fg: #eeeae0; --mg-sub: #9d978a; --mg-card: #2a2926;
    --mg-line: #3a3833; --mg-accent: #b39d84; --mg-accent-fg: #1d1c1a;
    --mg-board: #4a443d; --mg-cell: #5d564d; --mg-toast: #3f8f68;
    --mg-veil: rgba(29,28,26,.8);
  }
}
* { box-sizing: border-box; }
html, body {
  margin: 0; height: 100%; overflow: hidden; overscroll-behavior: none;
  background: var(--mg-bg); color: var(--mg-fg);
  font: 16px/1.4 system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;
}
button { font: inherit; color: inherit; touch-action: manipulation; cursor: pointer; }
.mg-app {
  position: fixed; inset: 0; display: flex; flex-direction: column; background: var(--mg-bg);
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
.mg-bar {
  display: flex; align-items: center; gap: 4px; padding: 6px 8px;
  border-bottom: 1px solid var(--mg-line); flex: none;
}
.mg-bar h1 { flex: 1; margin: 0; font-size: 17px; text-align: center; }
.mg-icon {
  width: 44px; height: 44px; border: 0; border-radius: 10px; background: transparent;
  font-size: 20px; display: grid; place-items: center;
}
.mg-icon:hover { background: var(--mg-line); }
.mg-icon[hidden] { visibility: hidden; display: grid; }
.mg-stage { flex: 1; min-height: 0; overflow: auto; display: flex; justify-content: center; }
.mg-btn {
  min-height: 44px; padding: 0 16px; border: 0; border-radius: 10px;
  background: var(--mg-line); font-weight: 600;
}
.mg-btn-primary { background: var(--mg-accent); color: var(--mg-accent-fg); }
.mg-menu { width: 100%; max-width: 480px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.mg-game {
  display: flex; align-items: center; gap: 14px; padding: 14px; min-height: 64px;
  border: 1px solid var(--mg-line); border-radius: 14px; background: var(--mg-card); text-align: left;
}
.mg-game-icon { font-size: 28px; }
.mg-game b { display: block; }
.mg-game span { font-size: 13px; color: var(--mg-sub); }
.mg-card {
  padding: 14px; border-radius: 14px; background: var(--mg-card); border: 1px solid var(--mg-line);
  display: flex; flex-direction: column; gap: 10px;
}
.mg-card p { margin: 0; font-size: 14px; }
.mg-card-btns { display: flex; gap: 8px; justify-content: flex-end; }
.mg-setting {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 4px 4px 4px 14px; font-size: 14px; color: var(--mg-sub);
}
.mg-setting .mg-btn { color: var(--mg-fg);
}
.mg-toast {
  position: absolute; left: 50%; bottom: calc(16px + env(safe-area-inset-bottom));
  transform: translateX(-50%); display: flex; align-items: center; gap: 10px;
  padding: 8px 8px 8px 16px; border-radius: 999px; background: var(--mg-toast); color: var(--mg-toast-fg);
  box-shadow: 0 6px 20px rgba(0,0,0,.25); white-space: nowrap; z-index: 10;
}
.mg-toast .mg-btn { min-height: 36px; background: rgba(255,255,255,.2); }
.mg-hint {
  position: absolute; left: 50%; bottom: calc(80px + env(safe-area-inset-bottom)); transform: translateX(-50%);
  padding: 6px 14px; border-radius: 999px; background: var(--mg-fg); color: var(--mg-bg);
  font-size: 13px; opacity: .85; pointer-events: none; white-space: nowrap;
}
[hidden] { display: none !important; }

.g2048 {
  --size: min(92vw, calc(100dvh - 220px), 440px);
  width: var(--size); padding: 16px 0; display: flex; flex-direction: column; gap: 12px;
}
.g2048-wrap { position: relative; }
.g2048-top { display: flex; gap: 8px; align-items: stretch; }
.g2048-score {
  flex: 1; border-radius: 10px; background: var(--mg-board); color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px;
}
.g2048-score span { font-size: 11px; opacity: .85; }
.g2048-score b { font-size: 18px; }
.g2048-board {
  width: var(--size); height: var(--size); padding: calc(var(--size) * .025);
  display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr);
  gap: calc(var(--size) * .025);
  background: var(--mg-board); border-radius: 12px; touch-action: none;
}
.g2048-cell {
  min-width: 0; min-height: 0; border-radius: 8px; background: var(--mg-cell); display: grid; place-items: center;
  font-weight: 800; font-size: calc(var(--size) * .1); color: #776e65;
}
.g2048-cell[data-v="2"] { background: #eee4da; }
.g2048-cell[data-v="4"] { background: #ede0c8; }
.g2048-cell[data-v="8"] { background: #f2b179; color: #f9f6f2; }
.g2048-cell[data-v="16"] { background: #f59563; color: #f9f6f2; }
.g2048-cell[data-v="32"] { background: #f67c5f; color: #f9f6f2; }
.g2048-cell[data-v="64"] { background: #f65e3b; color: #f9f6f2; }
.g2048-cell[data-v="128"] { background: #edcf72; color: #f9f6f2; font-size: calc(var(--size) * .085); }
.g2048-cell[data-v="256"] { background: #edcc61; color: #f9f6f2; font-size: calc(var(--size) * .085); }
.g2048-cell[data-v="512"] { background: #edc850; color: #f9f6f2; font-size: calc(var(--size) * .085); }
.g2048-cell[data-v="1024"] { background: #edc53f; color: #f9f6f2; font-size: calc(var(--size) * .07); }
.g2048-cell[data-v="2048"] { background: #edc22e; color: #f9f6f2; font-size: calc(var(--size) * .07); }
.g2048-cell[data-v="big"] { background: #3c3a32; color: #f9f6f2; font-size: calc(var(--size) * .06); }
.g2048-pop { animation: g2048-pop .14s ease-out; }
@keyframes g2048-pop { from { transform: scale(.8); } to { transform: scale(1); } }
.g2048-overlay {
  position: absolute; inset: 0; border-radius: 12px;
  background: var(--mg-veil);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
}
.g2048-overlay p { margin: 0; font-size: 22px; font-weight: 800; }
.g2048-overlay-btns { display: flex; gap: 8px; }
.g2048-help { margin: 0; text-align: center; font-size: 12px; color: var(--mg-sub); }
@media (prefers-reduced-motion: reduce) { .g2048-pop { animation: none; } }
`;
