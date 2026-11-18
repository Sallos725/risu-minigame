export const CSS = `
:root {
  --mg-bg: #faf8ef; --mg-fg: #3c3a32; --mg-sub: #8a8577; --mg-card: #ffffff;
  --mg-line: #e3ddcd; --mg-accent: #8f7a66; --mg-accent-fg: #f9f6f2;
  --mg-board: #bbada0; --mg-cell: #cdc1b4; --mg-toast: #2f6f4f; --mg-toast-fg: #fff;
  --mg-veil: rgba(250,248,239,.78);
  --sdk-line: #3c3a32; --sdk-thin: #d6cfbf; --sdk-cell: #ffffff; --sdk-given: #3c3a32; --sdk-user: #2f62c9;
  --sdk-peer: #f3eee2; --sdk-same: #fde7b0; --sdk-sel: #f7c873; --sdk-bad: #d93a2b; --sdk-bad-bg: #fbe0dc;
  --rh-bg: #e9e2d3; --rh-frame: #8f7a66; --rh-line: rgba(0,0,0,.06);
}
@media (prefers-color-scheme: dark) {
  :root {
    --mg-bg: #1d1c1a; --mg-fg: #eeeae0; --mg-sub: #9d978a; --mg-card: #2a2926;
    --mg-line: #3a3833; --mg-accent: #b39d84; --mg-accent-fg: #1d1c1a;
    --mg-board: #4a443d; --mg-cell: #5d564d; --mg-toast: #3f8f68;
    --mg-veil: rgba(29,28,26,.8);
    --sdk-line: #cfc8ba; --sdk-thin: #45423c; --sdk-cell: #24231f; --sdk-given: #eeeae0; --sdk-user: #8db4ff;
    --sdk-peer: #2f2d29; --sdk-same: #5a4a22; --sdk-sel: #7a5d22; --sdk-bad: #ff7a6b; --sdk-bad-bg: #4a2420;
    --rh-bg: #2c2a26; --rh-frame: #5d564d; --rh-line: rgba(255,255,255,.05);
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

.sdk {
  --size: min(94vw, calc(100dvh - 300px), 460px);
  width: var(--size); padding: 12px 0 16px; display: flex; flex-direction: column; gap: 10px;
}
.sdk-top { display: flex; align-items: center; gap: 10px; }
.sdk-diff { font-weight: 700; }
.sdk-time { flex: 1; color: var(--mg-sub); font-variant-numeric: tabular-nums; }
.sdk-wrap { position: relative; }
.sdk-board {
  width: var(--size); height: var(--size); display: grid;
  grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr);
  border: 2px solid var(--sdk-line); border-radius: 6px; overflow: hidden; background: var(--sdk-thin); gap: 1px;
}
.sdk-cell {
  min-width: 0; min-height: 0; padding: 0; border: 0; border-radius: 0;
  background: var(--sdk-cell); color: var(--sdk-given); display: grid; place-items: center;
  font-size: calc(var(--size) * .062); font-weight: 600; touch-action: manipulation;
}
.sdk-wrap::after {
  content: ''; position: absolute; inset: 2px; pointer-events: none;
  background:
    linear-gradient(var(--sdk-line), var(--sdk-line)) calc(100% / 3) 0 / 2px 100% no-repeat,
    linear-gradient(var(--sdk-line), var(--sdk-line)) calc(200% / 3) 0 / 2px 100% no-repeat,
    linear-gradient(var(--sdk-line), var(--sdk-line)) 0 calc(100% / 3) / 100% 2px no-repeat,
    linear-gradient(var(--sdk-line), var(--sdk-line)) 0 calc(200% / 3) / 100% 2px no-repeat;
}
.sdk-given { font-weight: 800; }
.sdk-user { color: var(--sdk-user); }
.sdk-peer { background: var(--sdk-peer); }
.sdk-same { background: var(--sdk-same); }
.sdk-sel { background: var(--sdk-sel); }
.sdk-bad { color: var(--sdk-bad); background: var(--sdk-bad-bg); }
.sdk-bad-given { color: var(--sdk-bad); }
.sdk-notes {
  width: 100%; height: 100%; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
  font-size: calc(var(--size) * .027); font-weight: 600; color: var(--mg-sub); line-height: 1;
}
.sdk-notes i { font-style: normal; display: grid; place-items: center; }
.sdk-notes .sdk-note-hit { color: var(--sdk-user); font-weight: 800; }
.sdk-tools { display: flex; gap: 6px; }
.sdk-tools .mg-btn { flex: 1; padding: 0 6px; font-size: 14px; }
.sdk-tools .mg-btn:disabled { opacity: .45; cursor: default; }
.sdk-pad { display: grid; grid-template-columns: repeat(9, 1fr); gap: 4px; }
.sdk-num {
  min-height: 52px; padding: 2px 0; border: 0; border-radius: 10px; background: var(--mg-card);
  box-shadow: inset 0 0 0 1px var(--mg-line); display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.sdk-num b { font-size: 22px; color: var(--sdk-user); line-height: 1.1; }
.sdk-num small { font-size: 10px; color: var(--mg-sub); min-height: 12px; }
.sdk-num-done { opacity: .35; }
.sdk-overlay {
  position: absolute; inset: 0; z-index: 1; border-radius: 6px; background: var(--mg-bg); opacity: .96;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 16px; text-align: center;
}
.sdk-ov-title { margin: 0; font-size: 22px; font-weight: 800; }
.sdk-ov-sub { margin: 0; color: var(--mg-sub); }
.sdk-ov-btns { display: flex; flex-direction: column; gap: 8px; width: min(240px, 80%); }
.sdk-ov-btns .mg-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.sdk-ov-btns small { font-size: 11px; font-weight: 500; opacity: .85; }
.sdk-help { margin: 0; text-align: center; font-size: 11px; color: var(--mg-sub); }
@media (pointer: coarse) { .sdk-help { display: none; } }

.rh {
  --size: min(92vw, calc(100dvh - 250px), 440px);
  width: var(--size); padding: 12px 0 16px; display: flex; flex-direction: column; gap: 10px;
}
.rh-top { display: flex; align-items: center; gap: 10px; }
.rh-moves { color: var(--mg-sub); font-variant-numeric: tabular-nums; }
.rh-wrap { position: relative; }
.rh-board {
  position: relative; width: var(--size); height: var(--size); border: 6px solid var(--rh-frame); border-radius: 14px;
  background-color: var(--rh-bg);
  background-image: linear-gradient(var(--rh-line) 1px, transparent 1px), linear-gradient(90deg, var(--rh-line) 1px, transparent 1px);
  background-size: calc(100% / 6) calc(100% / 6); touch-action: none;
}
.rh-exit {
  position: absolute; right: -6px; top: calc(100% / 6 * 2); width: 6px; height: calc(100% / 6); background: var(--rh-bg);
}
.rh-exit::after {
  content: '▶'; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #e5484d;
}
.rh-piece { position: absolute; padding: 3px; transition: left .14s ease, top .14s ease; touch-action: none; cursor: grab; }
.rh-piece i {
  display: block; width: 100%; height: 100%; border-radius: 9px; background: var(--c);
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.35);
}
.rh-red i { display: grid; place-items: center; color: rgba(255,255,255,.9); font-style: normal; font-size: calc(var(--size) * .05); }
.rh-red i::after { content: '▶'; }
.rh-drag { transition: none; z-index: 2; cursor: grabbing; }
.rh-sel i { box-shadow: inset 0 -4px 0 rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.35), 0 0 0 3px var(--mg-fg); }
.rh-hint i { animation: rh-pulse .5s ease-in-out infinite alternate; }
@keyframes rh-pulse { to { filter: brightness(1.25); transform: scale(1.04); } }
.rh-hint::before {
  position: absolute; inset: 0; display: grid; place-items: center; z-index: 1;
  font-size: calc(var(--size) * .07); font-weight: 900; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6);
}
.rh-h.rh-hint-fwd::before { content: '→'; } .rh-h.rh-hint-back::before { content: '←'; }
.rh-v.rh-hint-fwd::before { content: '↓'; } .rh-v.rh-hint-back::before { content: '↑'; }
.rh-exit-anim { left: 115% !important; transition: left .35s ease-in; }
.rh-tools { display: flex; gap: 6px; }
.rh-tools .mg-btn { flex: 1; padding: 0 6px; font-size: 14px; }
.rh-tools .mg-btn:disabled { opacity: .45; cursor: default; }
.rh-overlay {
  position: absolute; inset: 0; z-index: 3; border-radius: 14px; background: var(--mg-bg); opacity: .97;
  display: flex; flex-direction: column; overflow: auto; padding: 14px;
}
.rh-ov-inner { margin: auto; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.rh-ov-title { margin: 0; font-size: 22px; font-weight: 800; }
.rh-stars { color: #e8a317; letter-spacing: 2px; }
.rh-ov-sub { margin: 0; color: var(--mg-sub); }
.rh-ov-btns { display: flex; flex-direction: column; gap: 8px; width: min(240px, 80%); }
.rh-lv-head { width: 100%; display: flex; align-items: center; gap: 8px; }
.rh-lv-head b { font-size: 17px; }
.rh-lv-head span { flex: 1; text-align: left; font-size: 13px; color: var(--mg-sub); }
.rh-lv-grid { width: 100%; display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.rh-lv {
  min-height: 48px; padding: 2px 0; border: 0; border-radius: 10px; background: var(--mg-card);
  box-shadow: inset 0 0 0 1px var(--mg-line); display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.rh-lv b { font-size: 15px; }
.rh-lv small { font-size: 10px; color: var(--mg-sub); min-height: 12px; }
.rh-lv-done small { color: #e8a317; }
.rh-lv-cur { box-shadow: inset 0 0 0 2px var(--mg-accent); }
.rh-lv:disabled { opacity: .4; cursor: default; }
.rh-help { margin: 0; text-align: center; font-size: 11px; color: var(--mg-sub); }
@media (pointer: coarse) { .rh-help { display: none; } }
@media (prefers-reduced-motion: reduce) { .rh-piece, .rh-exit-anim { transition: none; } .rh-hint i { animation: none; } }
`;
