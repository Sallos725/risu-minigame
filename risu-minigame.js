//@name risu_minigame
//@version 0.4.0
//@update-url https://raw.githubusercontent.com/Sallos725/risu-minigame/release/risu-minigame.js
//@display-name 미니게임
//@api 3.0
(()=>{var Ke="minigame:";async function Je(e){let t=await e.getLocalPluginStorage(),n=new Map,o=0;async function a(){clearTimeout(o),o=0;let r=[...n];n.clear();for(let[s,f]of r)try{await t.setItem(Ke+s,f)}catch(c){console.error("[minigame] save failed",s,c)}}return{api:e,async load(r){if(n.has(r))return n.get(r);try{return await t.getItem(Ke+r)??null}catch(s){return console.error("[minigame] load failed",r,s),null}},save(r,s){n.set(r,s),clearTimeout(o),o=setTimeout(a,600)},flush:a}}var Me=`
:root {
  --mg-bg: #faf8ef; --mg-fg: #3c3a32; --mg-sub: #8a8577; --mg-card: #ffffff;
  --mg-line: #e3ddcd; --mg-accent: #8f7a66; --mg-accent-fg: #f9f6f2;
  --mg-board: #bbada0; --mg-cell: #cdc1b4; --mg-toast: #2f6f4f; --mg-toast-fg: #fff;
  --mg-veil: rgba(250,248,239,.78);
  --sdk-line: #3c3a32; --sdk-thin: #d6cfbf; --sdk-cell: #ffffff; --sdk-given: #3c3a32; --sdk-user: #2f62c9;
  --sdk-peer: #f3eee2; --sdk-same: #fde7b0; --sdk-sel: #f7c873; --sdk-bad: #d93a2b; --sdk-bad-bg: #fbe0dc;
  --rh-bg: #e9e2d3; --rh-frame: #8f7a66; --rh-line: rgba(0,0,0,.06);
  --nn-cell: #ffffff; --nn-line: #d6cfbf; --nn-strong: #3c3a32; --nn-fill: #3c3a32; --nn-hl: #f3eee2; --nn-cur: #fde7b0;
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
    --nn-cell: #24231f; --nn-line: #45423c; --nn-strong: #cfc8ba; --nn-fill: #e6e0d2; --nn-hl: #2f2d29; --nn-cur: #5a4a22;
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

.nn {
  --size: min(94vw, calc(100dvh - 230px), 460px);
  width: var(--size); padding: 12px 0 16px; display: flex; flex-direction: column; gap: 10px;
}
.nn-top { display: flex; align-items: center; gap: 10px; }
.nn-time { color: var(--mg-sub); font-variant-numeric: tabular-nums; }
.nn-wrap { position: relative; }
.nn-grid { display: grid; grid-template-columns: auto 1fr; width: var(--size); font-size: var(--fs); line-height: 1.15; }
.nn-corner { display: grid; place-items: center; padding: 4px 6px 4px 0; }
.nn-prev { width: 100%; max-width: 64px; aspect-ratio: 1; shape-rendering: crispEdges; }
.nn-prev path, .nn-thumb path { fill: var(--mg-fg); }
.nn-cols { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 1px; padding: 0 2px 4px; align-items: end; }
.nn-cols .nn-clue { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
.nn-rows { display: grid; grid-template-rows: repeat(var(--n), 1fr); gap: 1px; padding: 2px 6px 2px 0; }
.nn-rows .nn-clue { display: flex; align-items: center; justify-content: flex-end; gap: .4em; }
.nn-clue span { font-weight: 700; font-variant-numeric: tabular-nums; }
.nn-clue.nn-done { opacity: .35; }
.nn-board {
  aspect-ratio: 1; display: grid; grid-template-columns: repeat(var(--n), 1fr); grid-template-rows: repeat(var(--n), 1fr);
  gap: 1px; background: var(--nn-line); border: 2px solid var(--nn-strong); touch-action: none; cursor: crosshair;
}
.nn-cell { position: relative; min-width: 0; min-height: 0; background: var(--nn-cell); }
.nn-c5 { box-shadow: inset -1px 0 0 var(--nn-strong); }
.nn-r5 { box-shadow: inset 0 -1px 0 var(--nn-strong); }
.nn-c5.nn-r5 { box-shadow: inset -1px 0 0 var(--nn-strong), inset 0 -1px 0 var(--nn-strong); }
.nn-line { background: var(--nn-hl); }
.nn-cur { background: var(--nn-cur); }
.nn-fill { background: var(--nn-fill); }
.nn-cur.nn-fill { box-shadow: inset 0 0 0 2px var(--nn-cur); }
.nn-x::after {
  content: '✕'; position: absolute; inset: 0; display: grid; place-items: center;
  color: var(--mg-sub); font-size: calc(var(--size) / var(--n) * .5);
}
.nn-solved .nn-fill { background: var(--mg-accent); transition: background .4s; }
.nn-tools { display: flex; gap: 6px; }
.nn-tools .mg-btn { flex: 1; padding: 0 6px; font-size: 14px; }
.nn-tools .nn-mode { flex: 1.6; }
.nn-tools .mg-btn:disabled { opacity: .45; cursor: default; }
.nn-overlay {
  position: absolute; inset: 0; z-index: 3; border-radius: 8px; background: var(--mg-bg); opacity: .97;
  display: flex; flex-direction: column; overflow: auto; padding: 12px;
}
.nn-ov-inner { margin: auto; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.nn-reveal { width: 30%; max-width: 120px; aspect-ratio: 1; shape-rendering: crispEdges; }
.nn-reveal path { fill: var(--mg-accent); }
.nn-ov-title { margin: 0; font-size: 22px; font-weight: 800; }
.nn-ov-sub { margin: 0; color: var(--mg-sub); }
.nn-ov-btns { display: flex; flex-direction: column; gap: 6px; width: min(240px, 80%); }
.nn-list { align-items: stretch; text-align: left; }
.nn-list-head { display: flex; align-items: center; gap: 8px; }
.nn-list-head b { font-size: 17px; }
.nn-list-head span { flex: 1; font-size: 13px; color: var(--mg-sub); }
.nn-sec { margin: 4px 0 0; font-size: 13px; font-weight: 700; color: var(--mg-sub); }
.nn-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }
.nn-item {
  min-height: 74px; padding: 6px 2px; border: 0; border-radius: 10px; background: var(--mg-card);
  box-shadow: inset 0 0 0 1px var(--mg-line); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
}
.nn-item-cur { box-shadow: inset 0 0 0 2px var(--mg-accent); }
.nn-thumb { width: 36px; height: 36px; shape-rendering: crispEdges; }
.nn-q { font-size: 22px; font-weight: 800; color: var(--mg-sub); line-height: 36px; }
.nn-item small { font-size: 11px; color: var(--mg-sub); }
.nn-help { margin: 0; text-align: center; font-size: 11px; color: var(--mg-sub); }
@media (pointer: coarse) { .nn-help { display: none; } }
`;function ze({host:e,games:t,notify:n}){let o=window,a=document,r=null,s=null,f=[],c=0;function d(y){return r.querySelector(y)}async function m(){if(r)return;if(await e.api.showContainer("fullscreen"),!a.getElementById("mg-style")){let k=a.createElement("style");k.id="mg-style",k.textContent=Me,a.head.appendChild(k)}r=a.createElement("div"),r.className="mg-app",r.innerHTML=`
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
      </div>`,a.body.appendChild(r),u(d("[data-close]"),"click",g),u(d("[data-back]"),"click",()=>C()),u(d("[data-toast-go]"),"click",g),u(o,"keydown",k=>{k.key==="Escape"&&g()}),u(a,"visibilitychange",()=>{a.hidden&&e.flush()}),u(o,"pagehide",()=>e.flush()),h();let y=await e.load("last"),D=t.find(k=>k.id===y);D?await I(D):await C()}async function g(){if(r){await M();for(let y of f)y();f=[],clearTimeout(c),r.remove(),r=null,await e.flush(),await e.api.hideContainer()}}function u(y,D,k,K){y.addEventListener(D,k,K),f.push(()=>y.removeEventListener(D,k,K))}function h(){try{o.focus()}catch{}let y=d("[data-hint]"),D=o.matchMedia?.("(pointer: fine)").matches,k=()=>{r&&(y.hidden=!D||a.hasFocus())};u(o,"focus",k),u(o,"blur",k),u(o,"pointerdown",()=>setTimeout(k,0)),setTimeout(k,50)}async function C(){await M(),e.save("last",null),d("[data-title]").textContent="미니게임",d("[data-back]").hidden=!0;let y=d("[data-stage]");y.innerHTML='<div class="mg-menu" data-menu></div>';let D=d("[data-menu]"),k=await n.state();if(k==null){let K=a.createElement("div");K.className="mg-card",K.innerHTML=`
        <p><b>🔔 응답 도착 알림</b><br>게임 중에 AI 응답이 오면 알려드려요. 켜면 RisuAI가 권한을 한 번 물어봐요.</p>
        <div class="mg-card-btns">
          <button class="mg-btn" data-no>괜찮아요</button>
          <button class="mg-btn mg-btn-primary" data-yes>켜기</button>
        </div>`,K.querySelector("[data-no]").addEventListener("click",()=>{n.decline(),C()}),K.querySelector("[data-yes]").addEventListener("click",async()=>{await n.enable(),r&&C()}),D.appendChild(K)}for(let K of t){let F=a.createElement("button");F.className="mg-game",F.innerHTML='<span class="mg-game-icon"></span><div><b></b><span></span></div>',F.querySelector(".mg-game-icon").textContent=K.icon,F.querySelector("b").textContent=K.title,F.querySelector("div span").textContent=K.desc,F.addEventListener("click",()=>I(K)),D.appendChild(F)}if(k!=null){let K=k==="on",F=a.createElement("div");F.className="mg-setting",F.innerHTML='<span></span><button class="mg-btn" data-toggle></button>',F.querySelector("span").textContent=K?"🔔 응답 도착 알림 켜짐":"🔕 응답 도착 알림 꺼짐",F.querySelector("[data-toggle]").textContent=K?"끄기":"켜기",F.querySelector("[data-toggle]").addEventListener("click",async()=>{K?await n.disable():await n.enable(),r&&C()}),D.appendChild(F)}}async function I(y){await M(),e.save("last",y.id),d("[data-title]").textContent=y.title,d("[data-back]").hidden=!1;let D=d("[data-stage]");D.replaceChildren();let k=await y.mount(D,{host:e,win:o,doc:a});s={game:y,handle:k}}async function M(){s&&(s.handle?.dispose?.(),s=null,r&&d("[data-stage]").replaceChildren())}function z(){if(!r)return;let y=d("[data-toast]");y.hidden=!1;try{navigator.vibrate?.(80)}catch{}clearTimeout(c),c=setTimeout(()=>{r&&(y.hidden=!0)},15e3)}return{open:m,close:g,showResponseToast:z,isOpen:()=>!!r}}function mt(e){let t=e.filter(a=>a!==0),n=[],o=0;for(let a=0;a<t.length;a++)t[a]===t[a+1]?(n.push(t[a]*2),o+=t[a]*2,a++):n.push(t[a]);for(;n.length<e.length;)n.push(0);return{line:n,gained:o}}function ht(e){let t=[];for(let n=0;n<4;n++){let o=[];for(let a=0;a<4;a++)e==="left"?o.push(n*4+a):e==="right"?o.push(n*4+(3-a)):e==="up"?o.push(a*4+n):o.push((3-a)*4+n);t.push(o)}return t}function vt(e,t){let n=e.slice(),o=0,a=!1;for(let r of ht(t)){let s=mt(r.map(f=>e[f]));o+=s.gained,r.forEach((f,c)=>{n[f]!==s.line[c]&&(a=!0),n[f]=s.line[c]})}return{grid:n,gained:o,moved:a}}function be(e,t){let n=[];if(e.forEach((a,r)=>{a===0&&n.push(r)}),n.length===0)return e;let o=e.slice();return o[n[Math.floor(t()*n.length)]]=t()<.9?2:4,o}function bt(e){for(let t=0;t<e.length;t++)if(e[t]===0||t%4<3&&e[t]===e[t+1]||t+4<e.length&&e[t]===e[t+4])return!0;return!1}function xe(e,t=0){return{v:1,grid:be(be(Array(16).fill(0),e),e),score:0,best:t,over:!1,won:!1,keepGoing:!1}}function Se(e,t,n){if(e.over)return e;let o=vt(e.grid,t);if(!o.moved)return e;let a=be(o.grid,n),r=e.score+o.gained,s=e.won||a.some(f=>f>=2048);return{...e,grid:a,score:r,best:Math.max(e.best,r),won:s,over:!bt(a)}}function Ne(e){return{...e,grid:e.grid.slice()}}function $e(e){return!e||e.v!==1||!Array.isArray(e.grid)||e.grid.length!==4*4||!e.grid.every(t=>Number.isInteger(t)&&t>=0)?null:{v:1,grid:e.grid.slice(),score:Number(e.score)||0,best:Number(e.best)||0,over:!!e.over,won:!!e.won,keepGoing:!!e.keepGoing}}var xt={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right",W:"up",S:"down",A:"left",D:"right"},Et=30;function Te(e,t,n){let o=c=>{if(c.ctrlKey||c.metaKey||c.altKey)return;let d=xt[c.key];d&&(c.preventDefault(),n(d))},a=null,r=c=>{c.button!==void 0&&c.button!==0||(a={x:c.clientX,y:c.clientY,id:c.pointerId},t.setPointerCapture?.(c.pointerId))},s=c=>{if(!a||c.pointerId!==a.id)return;let d=c.clientX-a.x,m=c.clientY-a.y;a=null,!(Math.max(Math.abs(d),Math.abs(m))<Et)&&(Math.abs(d)>Math.abs(m)?n(d>0?"right":"left"):n(m>0?"down":"up"))},f=()=>{a=null};return e.addEventListener("keydown",o),t.addEventListener("pointerdown",r),t.addEventListener("pointerup",s),t.addEventListener("pointercancel",f),()=>{e.removeEventListener("keydown",o),t.removeEventListener("pointerdown",r),t.removeEventListener("pointerup",s),t.removeEventListener("pointercancel",f)}}var qe="g2048",je={id:"g2048",title:"2048",icon:"🟨",desc:"같은 숫자를 합쳐 2048 만들기",async mount(e,{host:t,win:n,doc:o}){let a=$e(await t.load(qe))??xe(Math.random);e.innerHTML=`
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
      </div>`;let r=u=>e.querySelector(u),s=r("[data-board]"),f=Array.from({length:16},()=>{let u=o.createElement("div");return u.className="g2048-cell",s.appendChild(u),u});function c(u){a.grid.forEach((C,I)=>{let M=f[I];M.textContent=C?String(C):"",M.dataset.v=C>2048?"big":String(C),M.classList.remove("g2048-pop"),u&&C&&C!==u[I]&&(M.offsetWidth,M.classList.add("g2048-pop"))}),r("[data-score]").textContent=a.score,r("[data-best]").textContent=a.best;let h=a.won&&!a.keepGoing&&!a.over;r("[data-overlay]").hidden=!(a.over||h),r("[data-msg]").textContent=a.over?"더 이상 움직일 수 없어요!":"2048 달성!",r("[data-continue]").hidden=!h}function d(u,h){u!==a&&(a=u,c(h),t.save(qe,Ne(a)))}function m(){d(xe(Math.random,a.best))}let g=Te(n,s,u=>{if(!r("[data-overlay]").hidden)return;let h=a.grid;d(Se(a,u,Math.random),h)});return r("[data-new]").addEventListener("click",()=>{a.score>0&&!a.over&&!n.confirm("지금 판을 버리고 새로 시작할까요?")||m()}),r("[data-retry]").addEventListener("click",m),r("[data-continue]").addEventListener("click",()=>d({...a,keepGoing:!0})),c(),{dispose(){g()}}}};var yt=1022,re=(()=>{let e=[];for(let t=0;t<9;t++)e.push(Array.from({length:9},(n,o)=>t*9+o));for(let t=0;t<9;t++)e.push(Array.from({length:9},(n,o)=>o*9+t));for(let t=0;t<9;t++){let n=Math.floor(t/3)*3,o=t%3*3;e.push(Array.from({length:9},(a,r)=>(n+Math.floor(r/3))*9+o+r%3))}return e})(),ee=Array.from({length:81},(e,t)=>{let n=new Set;for(let o of re)o.includes(t)&&o.forEach(a=>{a!==t&&n.add(a)});return[...n]}),Ee=e=>{let t=0;for(;e;)e&=e-1,t++;return t},le=e=>{let t=[];for(let n=1;n<=9;n++)e&1<<n&&t.push(n);return t};function _e(e,t){for(let n=e.length-1;n>0;n--){let o=Math.floor(t()*(n+1));[e[n],e[o]]=[e[o],e[n]]}return e}var ce=e=>[...e].map(t=>t>="1"&&t<="9"?Number(t):0),de=e=>e.map(t=>t||0).join("");function Ze(e,t){let n=yt;for(let o of ee[t])e[o]&&(n&=~(1<<e[o]));return n}function At(e){return e.every((t,n)=>!t||ee[n].every(o=>e[o]!==t))}function Oe(e){let t=-1,n=0,o=10;for(let a=0;a<81;a++){if(e[a])continue;let r=Ze(e,a),s=Ee(r);if(s<o&&(t=a,n=r,o=s,s<=1))break}return{i:t,mask:n}}function Ct(e,t=2){let n=e.slice();if(!At(n))return 0;let o=0;return function a(){let{i:r,mask:s}=Oe(n);if(r===-1){o++;return}for(let f of le(s))if(n[r]=f,a(),o>=t)break;n[r]=0}(),o}function It(e){let t=Array(81).fill(0);return function n(){let{i:o,mask:a}=Oe(t);if(o===-1)return!0;for(let r of _e(le(a),e))if(t[o]=r,n())return!0;return t[o]=0,!1}(),t}function Dt(e){let t=e.slice(),n=t.map((c,d)=>c?0:Ze(t,d)),o=1,a=(c,d)=>{t[c]=d,n[c]=0;for(let m of ee[c])n[m]&=~(1<<d)};function r(){let c=!1;for(let d=0;d<81;d++)!t[d]&&Ee(n[d])===1&&(a(d,le(n[d])[0]),c=!0);for(let d of re)for(let m=1;m<=9;m++){let g=1<<m,u=-1,h=0;for(let C of d)n[C]&g&&(u=C,h++);h===1&&!t[u]&&(a(u,m),c=!0)}return c}function s(c,d,m){let g=!1;for(let u of c)!m.includes(u)&&n[u]&d&&(n[u]&=~d,g=!0);return g}function f(){let c=!1;for(let d of re)for(let m=1;m<=9;m++){let g=1<<m,u=d.filter(h=>n[h]&g);if(!(u.length<2))for(let h of re)h===d||!u.every(C=>h.includes(C))||s(h,g,u)&&(c=!0)}for(let d of re){let m=d.filter(g=>Ee(n[g])===2);for(let g=0;g<m.length;g++)for(let u=g+1;u<m.length;u++)if(n[m[g]]===n[m[u]])for(let h of le(n[m[g]]))s(d,1<<h,[m[g],m[u]])&&(c=!0)}return c}for(;;)if(!r()){if(t.every(Boolean))break;if(f()){o=2;continue}o=3;break}return{level:o,grid:t}}var Q={easy:{label:"쉬움",target:40,minLevel:1,maxLevel:1},medium:{label:"보통",target:31,minLevel:1,maxLevel:1},hard:{label:"어려움",target:24,minLevel:2,maxLevel:2}};function wt(e,t,n){let o=e.slice(),a=_e(Array.from({length:41},(s,f)=>f),n),r=81;for(let s of a){if(r<=t)break;let f=80-s,c=o[s],d=o[f];if(o[s]=0,o[f]=0,Ct(o)!==1){o[s]=c,o[f]=d;continue}r-=s===f?1:2}return o}function ye(e,t=Math.random,n=60){let o=Q[e]??Q.easy,a=null;for(let r=0;r<n;r++){let s=It(t),f=wt(s,o.target,t),{level:c}=Dt(f),d={puzzle:f,solution:s,difficulty:e,level:c};if(c>=o.minLevel&&c<=o.maxLevel)return d;c<=o.maxLevel&&!a&&(a=d)}return a??ye("easy",t)}function Ae(e){let t=new Set;return e.forEach((n,o)=>{if(n)for(let a of ee[o])e[a]===n&&(t.add(o),t.add(a))}),t}function Re(e){return e.every(Boolean)&&Ae(e).size===0}var Pe="sudoku",Lt=300,kt={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]},fe=e=>{let t=Math.floor(e/60),n=e%60;return`${t}:${String(n).padStart(2,"0")}`};function Ht(e){if(!e||e.v!==1||!Q[e.difficulty]||typeof e.puzzle!="string"||e.puzzle.length!==81||typeof e.solution!="string"||e.solution.length!==81||typeof e.values!="string"||e.values.length!==81)return null;let t=Array.isArray(e.notes)&&e.notes.length===81?e.notes.map(n=>n|0):Array(81).fill(0);return{difficulty:e.difficulty,puzzle:ce(e.puzzle),solution:ce(e.solution),values:ce(e.values),notes:t,elapsed:e.elapsed|0,done:!!e.done}}function Gt(e,t){return{v:1,difficulty:e.difficulty,puzzle:de(e.puzzle),solution:de(e.solution),values:de(e.values),notes:e.notes.slice(),elapsed:e.elapsed,done:e.done,best:t}}var Ue={id:"sudoku",title:"스도쿠",icon:"🔢",desc:"9×9 숫자 퍼즐 · 쉬움 / 보통 / 어려움",async mount(e,{host:t,win:n,doc:o}){let a=await t.load(Pe),r=a&&typeof a.best=="object"&&a.best||{},s=Ht(a),f=-1,c=!1,d=[],m=0,g=0,u=!1;e.innerHTML=`
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
      </div>`;let h=x=>e.querySelector(x),C=h("[data-board]"),I=h("[data-overlay]"),M=Array.from({length:81},(x,i)=>{let p=o.createElement("button");return p.className="sdk-cell",p.addEventListener("pointerdown",E=>{E.preventDefault(),k(i)}),C.appendChild(p),p}),z=Array.from({length:9},(x,i)=>{let p=i+1,E=o.createElement("button");return E.className="sdk-num",E.innerHTML=`<b>${p}</b><small></small>`,E.addEventListener("click",()=>K(p)),h("[data-pad]").appendChild(E),E});function y(){s&&t.save(Pe,Gt(s,r))}function D(){d.push({values:s.values.slice(),notes:s.notes.slice()}),d.length>Lt&&d.shift()}function k(x){f=x,T()}function K(x){if(!s||s.done||f<0||s.puzzle[f])return;let i=f;if(D(),c){if(s.values[i])return void d.pop();s.notes[i]^=1<<x}else if(s.values[i]=s.values[i]===x?0:x,s.values[i]){s.notes[i]=0;for(let p of ee[i])s.notes[p]&=~(1<<x)}_()}function F(){!s||s.done||f<0||s.puzzle[f]||!s.values[f]&&!s.notes[f]||(D(),s.values[f]=0,s.notes[f]=0,_())}function O(){if(!s||s.done||d.length===0)return;let x=d.pop();s.values=x.values,s.notes=x.notes,_()}function _(){if(Re(s.values)){s.done=!0;let x=r[s.difficulty];(x==null||s.elapsed<x)&&(r={...r,[s.difficulty]:s.elapsed}),N()}T(),y()}function V(){c=!c,T()}function X(x){I.hidden=!1;let i=s&&!s.done&&s.values.some((p,E)=>p&&!s.puzzle[E]);I.innerHTML=`
        <p class="sdk-ov-title">난이도를 골라주세요</p>
        ${i?'<p class="sdk-ov-sub">지금 판은 사라져요</p>':""}
        <div class="sdk-ov-btns">
          ${Object.entries(Q).map(([p,E])=>`
            <button class="mg-btn mg-btn-primary" data-pick="${p}">${E.label}${r[p]!=null?`<small>최고 ${fe(r[p])}</small>`:""}</button>`).join("")}
          ${x?'<button class="mg-btn" data-cancel>취소</button>':""}
        </div>`,I.querySelectorAll("[data-pick]").forEach(p=>p.addEventListener("click",()=>te(p.dataset.pick))),I.querySelector("[data-cancel]")?.addEventListener("click",()=>{I.hidden=!0,T()})}function te(x){I.innerHTML='<p class="sdk-ov-title">퍼즐 만드는 중…</p>',clearTimeout(g),g=setTimeout(()=>{if(g=0,u)return;let i=ye(x);s={difficulty:x,puzzle:i.puzzle,solution:i.solution,values:i.puzzle.slice(),notes:Array(81).fill(0),elapsed:0,done:!1},d=[],f=s.puzzle.findIndex(p=>!p),I.hidden=!0,R(),T(),y()},30)}function R(){N(),!(!s||s.done)&&(m=setInterval(()=>{o.hidden||!I.hidden||(s.elapsed++,h("[data-time]").textContent=fe(s.elapsed),s.elapsed%10===0&&y())},1e3))}function N(){clearInterval(m),m=0}function T(){if(!s)return;let x=Ae(s.values),i=f,p=i>=0?s.values[i]:0,E=i>=0?new Set(ee[i]):new Set,H=Array(10).fill(0);if(s.values.forEach(G=>{G&&H[G]++}),M.forEach((G,l)=>{let v=s.values[l],w=!!s.puzzle[l];if(G.classList.toggle("sdk-given",w),G.classList.toggle("sdk-user",!w&&!!v),G.classList.toggle("sdk-sel",l===i),G.classList.toggle("sdk-peer",E.has(l)),G.classList.toggle("sdk-same",!!p&&v===p&&l!==i),G.classList.toggle("sdk-bad",x.has(l)&&!w),G.classList.toggle("sdk-bad-given",x.has(l)&&w),v)G.textContent=String(v);else if(s.notes[l]){let J='<span class="sdk-notes">';for(let b=1;b<=9;b++){let A=s.notes[l]&1<<b;J+=`<i class="${A&&b===p?"sdk-note-hit":""}">${A?b:""}</i>`}G.innerHTML=`${J}</span>`}else G.textContent=""}),z.forEach((G,l)=>{let v=9-H[l+1];G.querySelector("small").textContent=v>0?String(v):"",G.classList.toggle("sdk-num-done",v<=0)}),h("[data-diff]").textContent=Q[s.difficulty].label,h("[data-time]").textContent=fe(s.elapsed),h("[data-note-state]").textContent=c?"켬":"끔",h("[data-note]").classList.toggle("mg-btn-primary",c),h("[data-undo]").disabled=d.length===0,s.done&&I.hidden){I.hidden=!1;let G=r[s.difficulty]===s.elapsed;I.innerHTML=`
          <p class="sdk-ov-title">완성! 🎉</p>
          <p class="sdk-ov-sub">${Q[s.difficulty].label} · ${fe(s.elapsed)}${G?" · 최고 기록!":""}</p>
          <div class="sdk-ov-btns"><button class="mg-btn mg-btn-primary" data-again>새 게임</button></div>`,I.querySelector("[data-again]").addEventListener("click",()=>X(!1))}}let U=x=>{if(!s||!I.hidden)return;if((x.ctrlKey||x.metaKey)&&(x.key==="z"||x.key==="Z")){x.preventDefault(),O();return}if(x.ctrlKey||x.metaKey||x.altKey)return;let i=kt[x.key];if(i){x.preventDefault();let p=f<0?40:f,E=(Math.floor(p/9)+i[0]+9)%9,H=(p%9+i[1]+9)%9;k(E*9+H);return}if(/^[1-9]$/.test(x.key)){x.preventDefault(),K(Number(x.key));return}if(x.key==="Backspace"||x.key==="Delete"||x.key==="0"){x.preventDefault(),F();return}(x.key==="n"||x.key==="N")&&(x.preventDefault(),V())};return n.addEventListener("keydown",U),h("[data-new]").addEventListener("click",()=>X(!!s)),h("[data-undo]").addEventListener("click",O),h("[data-erase]").addEventListener("click",F),h("[data-note]").addEventListener("click",V),s?(f=s.done?-1:s.puzzle.findIndex((x,i)=>!x&&!s.values[i]),T(),R()):X(!1),{dispose(){u=!0,clearTimeout(g),N(),n.removeEventListener("keydown",U),y()}}}};function j(e){let t=new Map;for(let n=0;n<36;n++){let o=e[n];o!=="."&&(t.has(o)||t.set(o,[]),t.get(o).push(n))}return[...t].map(([n,o])=>{let a=o[0],r=o.length===1||o[1]-a===1;return{id:n,row:Math.floor(a/6),col:a%6,len:o.length,horiz:r}})}var Ye=(e,t)=>e.horiz?e.row*6+e.col+t:(e.row+t)*6+e.col;function Ie(e,t){let n=0,o=0;if(t.horiz){for(;t.col+n-1>=0&&e[t.row*6+t.col+n-1]===".";)n--;for(;t.col+t.len+o<6&&e[t.row*6+t.col+t.len+o]===".";)o++}else{for(;t.row+n-1>=0&&e[(t.row+n-1)*6+t.col]===".";)n--;for(;t.row+t.len+o<6&&e[(t.row+t.len+o)*6+t.col]===".";)o++}return{min:n,max:o}}function Bt(e,t,n){let o=e.split("");for(let r=0;r<t.len;r++)o[Ye(t,r)]=".";let a=t.horiz?{...t,col:t.col+n}:{...t,row:t.row+n};for(let r=0;r<t.len;r++)o[Ye(a,r)]=t.id;return o.join("")}function We(e,t,n){let o=j(e).find(a=>a.id===t);return o?Bt(e,o,n):e}var S=e=>e[2*6+6-1]==="A";function Ft(e){let t=j(e).sort((n,o)=>n.id==="A"?-1:o.id==="A"?1:n.id<o.id?-1:1);return{pieces:t.map(n=>({id:n.id,horiz:n.horiz,fixed:n.horiz?n.row:n.col,len:n.len})),start:t.map(n=>n.horiz?n.col:n.row)}}var Ce=e=>String.fromCharCode(...e),Ve=e=>Array.from(e,t=>t.charCodeAt(0));function Kt(e,t){let n=new Uint8Array(36);return e.forEach((o,a)=>{for(let r=0;r<o.len;r++)n[o.horiz?o.fixed*6+t[a]+r:(t[a]+r)*6+o.fixed]=1}),n}function Jt(e,t){let n=Ve(t),o=Kt(e,n),a=[];return e.forEach((r,s)=>{let f=c=>r.horiz?r.fixed*6+c:c*6+r.fixed;for(let c=n[s]-1;c>=0&&!o[f(c)];c--){let d=n.slice();d[s]=c,a.push(Ce(d))}for(let c=n[s]+r.len;c<6&&!o[f(c)];c++){let d=n.slice();d[s]=c-r.len+1,a.push(Ce(d))}}),a}var Mt=e=>e.charCodeAt(0)===4;function zt(e,t){let n=Array(36).fill("."),o=Ve(t);return e.forEach((a,r)=>{for(let s=0;s<a.len;s++)n[a.horiz?a.fixed*6+o[r]+s:(o[r]+s)*6+a.fixed]=a.id}),n.join("")}function Xe(e,t=3e5){if(S(e))return{moves:0,next:null};let{pieces:n,start:o}=Ft(e),a=Ce(o),r=new Map([[a,null]]),s=[a],f=0;for(;s.length&&r.size<t;){f++;let c=[];for(let d of s)for(let m of Jt(n,d))if(!r.has(m)){if(r.set(m,d),Mt(m)){let g=m;for(;r.get(g)!==a;)g=r.get(g);return{moves:f,next:zt(n,g)}}c.push(m)}s=c}return null}function Qe(e,t){if(e===t)return null;let n=j(e);for(let o of j(t)){let a=n.find(r=>r.id===o.id);if(a&&(a.row!==o.row||a.col!==o.col))return{id:o.id,delta:a.horiz?o.col-a.col:o.row-a.row}}return null}function et(e,t){return e<=t?3:e<=Math.floor(t*1.5)?2:1}var P=[[".BBCC.DEEEFFD..AAGHIII.GHJK.LLHJKMM.",3],[".B..CC.BDDDE...AAEFFGGHHII.JKK.LLJ..",3],["BC..DDBCEEEF.G.AAFHG.II.H..JJJKK..LL",3],["BBCC....DD..AAE...F.E...F.GGG.HH..II",3],["BB.CCC...DDE...AAEFG....FG.HHH.G..II",3],["BB....CCDDEE..AAFGHHH.FGI.....I..JJ.",3],[".BBC...D.CEFGDAAEFGDHIIJ.KHL.J.K.LMM",3],["BC..DDBC...EF..AAEFGGHH.IIIJJJ..KK..",3],["......BBB.CC...AADEE.FFD.G..HH.G....",3],["..BBCCDDDEEFG..AAFGH..IIJH.KKKJLLMMM",4],["B.....B.CDDEAAC.FEG.HHF.G.....GII.JJ",4],["BCCC..BDD.EFGAAHEFGI.H..GI.....I.JJJ",4],["......B...CCB.AADEBFFFDE...GG..HHH..",4],["B.....BCC.DE.AAFDE...FGG......HH.II.",4],[".BB....CC...AAD....ED....EFFGG.HH.II",4],[".B..CC.BDD..AAEF.GHIEF.GHI....H.....",4],[".......BBBCC.DAAEFGD..EFG..HH.......",4],["BB.CC.DDDEE..AAF..GHHFIIGJJJKKGLLMMM",4],["....BB..CC.DAAE..DFFEGGGHIJJJ.HIKK..",5],[".BBCC....DD...AAE.....E.FFGGG...HH..",5],["B.CCDDB...EEF..AAGFHHIIGJKKLLLJ..MMM",5],["..BBC..DD.C.E.AAC.EF.GG.EF.HH....II.",5],[".BBB..CC.D.E.AADFE....F...GG..HH....",5],["...B....CB.DAACEFD...EF.GH..F.GH....",5],[".BCCDD.BEFFGH.EAAGHIII.J..KKKJLL...J",5],["BBCCC..DDEEEAAFG...HFGIIJHKLL.JHK...",6],["...BB..CCDDDAA.E.FG..E.FGHHH........",6],["...BB...C..DAACEFDG..EF.G...F....HH.",6],["BCCC.DBEEEFDG.AAFDG..HIIJ..H..J.KK..",6],["B.....BCCDEF.AADEF...D....GG....HH..",6],["..BBCC....DDAAE..F..EG.F...GHHIII...",6],["B.C.DDBEC.FG.EAAFG.EHIJJ.KHI...K....",6],["..BB..CCDEE.AADFG.H.IFG.HJIF..HJKKLL",7],["B.CCDDB.EEFF..AAGHIIJJGHKKKLGMNN.L.M",7],["BC.DD.BCEEEFGAA.HFG.I.HJKKI.LJ....L.",7],["BB..CDEEFFCDAA..GHIJJJGHIKK.GHILLMM.",7],["..BCCC..B..D.AAE.D...E...FGG...F.HH.",7],[".BBCC....DD..AA.EF....EF..GHHF..GIII",8],["....B...CCBDE.AABDE..FGGH..F..H.III.",8],[".BB..C..DD.CAA...EFFGG.EHIIJJJHKK...",8],["BCDDEEBCFFG.BCAAG.HIJJKKHI.LL..MM...",8],["...BC....BCDE.AAFDE.GGFD...HII...H..",8],[".BCCDD.BEEF.AAG.F...GHH.IIGJJ...KK..",8],["..BCCC..B...AABDEFG..DEFG..H.FGIIH..",9],["..BB...CDDEF.CAAEF...GEF...GHH..III.",9],["..BB..CCDD..AAEFGH..EFGHIJ..G.IJKKLL",9],["..B.CC.DB.EEFDAAGHFD.IGHJKKIGLJMMNNL",9],["...BCCDDDBEF.GAAEF.GHHHI.JJJ.I..KKKI",9],["..BBCC.DD..E.AAFGE..HFGI..HJJI.....I",10],["BBCCDDEEEFG.AA.FG.HIIJJ.H.K...LLKMM.",10],[".BCCDD.BEEFFAAG..HI.GJJHI.KK.LMMMNNL",10],["....B....CBD.AACBD...EFF.GHE.I.GHJJI",10],["BCCCDDBEFFGG.EAAHI.JJ.HI...KKL.MMNNL",11],["....BCD..EBCDAAEFGHHI.FGJKILLLJKMMNN",11],[".BBCC.DDEEFGHIAAFGHI..FGJKL...JKLMMM",11],["...BBB.CCDEE.AAD.F..GHHF..GIIJKKLLLJ",11],[".BB...CCDDE.FAA.EGF.H.EG..HIIG..JJJ.",11],[".B.CC..BDDEEAAFGHI..FGHI.JJGK...LLK.",12],["BBCCDE..FFDEGAAH.EG..H..I..JKKI..JLL",12],["BCDDD.BCEFFFAAE.GHIJKKGHIJ.LLM...NNM",12],[".BBCCC..D...AADE....DEFF.GGHHIJJKKKI",12],["........BCD.AABCD.EF.CG.EFHHG.E.....",13],["BBCDEEF.CDGGF.CAAHI...JHIKK.JL..MM.L",13],["..BBCCDEEFGGDAAF..HI.FJJHI.KKLHMM..L",13],[".BCCCD.BEEFDGAA.FDGHHIIIJ.KKLLJ.MMNN",13],["..BCCDEEBF.DGAAF.HGIJJ.HKI.L..KI.L..",13],[".BCCD..BE.DFAAE..FGGHH..I.JJKKILL.MM",14],[".BBBCCDDEEFGH.AAFGH.IIIGJ..KLLJ..KMM",14],["BCC...BDDEEFGAA.HFGIJJH.GI.KLLMMMK..",14],[".BCCDDEBFF.GEHAA.GIHJJJGI.K.LLI.KMMM",14],["...BB..CCDDE..FAAEGGFH.E.I.HJJ.IKKLL",15],["B...CCBDDEFFAA.EG.HHHEGI.JKLLI.JKMM.",15],["BC.DD.BCEEFFAAGHI.JJGHI..KKLL..MMNN.",15],["BCCC..BDDEFFBAAE..G..EHHG.IJJKLLI..K",15],[".BCDDDEBC...EAAF...G.FHHIGJJKLI.MMKL",16],["BCDDEEBCFGHHAAFG...III.J.KKLLJ..MMNN",16],["BBBCD.EE.CD.FAAC.GF.H..GI.HJJGIKKK..",16],[".B.....BCCDE.BAADEFFG.D...GHII.JJH..",17],["BCDDEFBC.GEFBAAG..HHIJKK..IJLL...MM.",17],[".BB..CDEE..CDFAAGCHF.IG.HJJIKK..LLMM",17],["..BCCC..BDEE.AADF.GGHHF..IIJJ.......",17],[".B.CCC.BD.EEAAD..F..DGHFIJJGHKILLMMK",18],["BBC...D.CEEFDAAG.FHH.GIIJJ.K..LLLK..",18],["BB....CCDDEFAA.GEFHIIG..H.JKLLMMJK..",18],[".B....CBDDEFCBAAEFGGH.E...HIJJ.KKI..",18],["BCDDEEBC.FFG.AA.HGIII.HG..JKKKLLJ.MM",19],["BB.CC.DDEEFGAA.HFGIJJH..I.KLMMNNKL..",19],[".BBCDDEEEC.F..GAAFHHG..IJ.KK.IJ.LLMM",19],["BCCDD.B...E.FAA.EGFHHHEG.IJJKK.ILLL.",20],["BCDDEEBCFFFGAAH..GI.H.JJI.KKL.MM..L.",20],["BCCDD.B...EFGAA.EFGHHHE..IJJKK.ILLL.",20],["BC.DDEBCF.GEAAFHGI...H.I..JK.I..JKLL",20],["BCDDEEBCFFFGAAH..GI.HJJKI.LLMKNN..M.",21],["BCDDEEBCFFFGAAH..GI.H.JJI.KKLMNN..LM",21],["BCCDD.BEE.FGHAA.FGHIIIF..JKKLL.JMMM.",21],[".BCDDE.BC.FEAAGHFEI.GHJJI.KKK.I...LL",22],["B..CDDBEEC.FAAGH.F.IGH.J.IK..J..KLLJ",22],["BCDDEEBCFFFGAAH..GIJH.KKIJLLMN.OO.MN",22],["B..CDDBEEC.FAAGH.F.IGH.J.IK..JLLKMMJ",22],["B..CDDBEEC.FAAGHIF.JGHIK.JL..K..LMMK",23],["BCDEEEBCDFGGAADF.H....IHJ.KKILJMMNNL",23],["B..CDDBEEC.FAAGHIF.JGHIK.JL..KMMLNNK",23],["BCDEE.BCDF..AAGF.H..G.IH.JJJIH..KKLL",23],["BBCCD...E.DFAAEGHFIIIGHFJ.....J.KKK.",24],["BCDDEEBC.FGGHAAF.IH.JJJI..K.LLMMK.NN",24],[".BCCDDEB.FGGEAAF.HI.JJJHI.K.LLMMK.NN",24],[".B....CBDDEFCBAAEFGGHIE...HIJJ.KKLL.",24],[".BC.DD.BC.EFAAG.EF..GHHFIIIJ.....JKK",25],[".BC.DD.BC.EFAAG.EF..GHHFIIIJ...KKJLL",25],[".BC.DD.BC.EFAAG.EF..GHHFIIIJ..KK.JLL",25],["BCCCDEB.FFDEG.HAAEG.HIJJ...I..KKKI..",25],["BCCCDEB...DEAAFG.EH.FGIIHJJG....KKK.",25],["BCD.EEBCD.FGAAH.FG..HIIGJJJK.....K..",25],["BBC..D..C..DAAE..FGHEIIFGH.JKKGLLJ..",25],["BCD.EEBCD.FGAAH.FG..HIIGJJJK...LLKMM",26],["BCD.EEBCD.FGAAH.FG..HIIGJJJK.....KLL",26],["BCD.EEBCD.FGAAH.FG..HIIGJJJK..LL.KMM",26],["..BCCCD.BEEFDAAG.FHI.GJJHIKKL..MMML.",27],["BCCC.DB.EFFDAAEG.DH..GIIHJJG....KKK.",28],["BCCCDEB.FFDEAAGH.EI.GHJJIKKH....LLL.",29]];var tt="rushhour",St=3,nt=["#5b8def","#f2b13a","#7cc4a4","#b38df0","#f08a5d","#4fb3c8","#c9a27e","#8fbf4d","#e57aa8","#6f7fd6","#d9b44a","#5fa88f"],Nt={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]},oe=e=>`${e*100/6}%`,$t=e=>e==="A"?"#e5484d":nt[(e.charCodeAt(0)-66)%nt.length];function Tt(e){if(!e||e.v!==1)return null;let t=e.level|0;return!P[t]||typeof e.board!="string"||!/^[.A-Z]{36}$/.test(e.board)?null:{level:t,board:e.board,history:Array.isArray(e.history)?e.history.filter(n=>typeof n=="string"&&n.length===36):[],lastId:typeof e.lastId=="string"?e.lastId:null,hints:e.hints|0,progress:e.progress&&typeof e.progress=="object"?e.progress:{}}}var ot={id:"rushhour",title:"러시아워",icon:"🚗",desc:`빨간 차를 출구로 · ${P.length}레벨`,async mount(e,{host:t,win:n,doc:o}){let r=Tt(await t.load(tt))??{level:0,board:P[0][0],history:[],lastId:null,hints:0,progress:{}},s="A",f=new Map,c=0,d=!1;e.innerHTML=`
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
      </div>`;let m=i=>e.querySelector(i),g=m("[data-board]"),u=m("[data-overlay]"),h=()=>P[r.level][1],C=()=>Math.max(-1,...Object.keys(r.progress).map(Number)),I=i=>i<=C()+St,M=()=>t.save(tt,{v:1,...r});function z(){for(let i of f.values())i.remove();f=new Map;for(let i of j(r.board)){let p=o.createElement("div");p.className=`rh-piece ${i.horiz?"rh-h":"rh-v"}${i.id==="A"?" rh-red":""}`,p.dataset.id=i.id,p.style.setProperty("--c",$t(i.id)),p.innerHTML="<i></i>",p.addEventListener("pointerdown",E=>V(E,i.id)),g.appendChild(p),f.set(i.id,p)}y()}function y(){for(let i of j(r.board)){let p=f.get(i.id);p&&(p.style.left=oe(i.col),p.style.top=oe(i.row),p.style.width=oe(i.horiz?i.len:1),p.style.height=oe(i.horiz?1:i.len),p.classList.toggle("rh-sel",i.id===s&&!S(r.board)))}}function D(){let i=r.history.length;m("[data-levels]").textContent=`레벨 ${r.level+1} ▾`,m("[data-moves]").textContent=`이동 ${i} · 최소 ${h()}`,m("[data-undo]").disabled=i===0||S(r.board),m("[data-reset]").disabled=i===0&&!S(r.board)}function k(i,p){if(p===0||S(r.board))return;let E=We(r.board,i,p);r.lastId===i&&r.history.length?E===r.history[r.history.length-1]&&(r.history.pop(),r.lastId=null):(r.history.push(r.board),r.lastId=i),r.board=E,s=i,N(),K()}function K(){y(),D(),M(),S(r.board)&&U()}function F(){!r.history.length||S(r.board)||(r.board=r.history.pop(),r.lastId=null,N(),K())}function O(){_(r.level)}function _(i){r={...r,level:i,board:P[i][0],history:[],lastId:null,hints:0},s="A",u.hidden=!0,N(),z(),D(),M()}function V(i,p){if(i.button!==void 0&&i.button!==0||S(r.board)||!u.hidden)return;i.preventDefault();let E=j(r.board).find(B=>B.id===p),H=f.get(p),{min:G,max:l}=Ie(r.board,E),v=g.clientWidth/6,w=i.clientX,J=i.clientY;s=p,y(),H.classList.add("rh-drag"),H.setPointerCapture?.(i.pointerId);let b=0,A=B=>{let q=(E.horiz?B.clientX-w:B.clientY-J)/v;b=Math.max(G,Math.min(l,q));let Z=oe(E.horiz?E.col:E.row);H.style[E.horiz?"left":"top"]=`calc(${Z} + ${b*v}px)`},L=()=>{H.removeEventListener("pointermove",A),H.removeEventListener("pointerup",L),H.removeEventListener("pointercancel",L),H.classList.remove("rh-drag");let B=Math.round(b);B!==0?k(p,B):y()};H.addEventListener("pointermove",A),H.addEventListener("pointerup",L),H.addEventListener("pointercancel",L)}function X(i,p){let E=j(r.board),H=E.find(b=>b.id===s)??E[0],G=b=>[b.row+(b.horiz?0:(b.len-1)/2),b.col+(b.horiz?(b.len-1)/2:0)],[l,v]=G(H),w=null,J=1/0;for(let b of E){if(b.id===H.id)continue;let[A,L]=G(b),B=i?(A-l)*i:(L-v)*p;if(B<=0)continue;let q=Math.abs(i?L-v:A-l),Z=B+q*2;Z<J&&(J=Z,w=b.id)}w&&(s=w,y())}function te(i){let p=j(r.board).map(H=>H.id).sort(),E=p.indexOf(s);s=p[(E+i+p.length)%p.length],y()}let R=i=>{if(!u.hidden)return;if((i.ctrlKey||i.metaKey)&&(i.key==="z"||i.key==="Z")){i.preventDefault(),F();return}if(i.ctrlKey||i.metaKey||i.altKey)return;if(i.key==="Tab"){i.preventDefault(),te(i.shiftKey?-1:1);return}if(i.key==="z"||i.key==="Z"){i.preventDefault(),F();return}if(i.key==="r"||i.key==="R"){i.preventDefault(),O();return}if(i.key==="h"||i.key==="H"){i.preventDefault(),T();return}let p=Nt[i.key];if(!p||S(r.board))return;i.preventDefault();let E=j(r.board).find(J=>J.id===s);if(!E)return;let[H,G]=p,l=E.horiz?G:H;if(l===0){X(H,G);return}let{min:v,max:w}=Ie(r.board,E);(l<0&&v<0||l>0&&w>0)&&k(E.id,l)};n.addEventListener("keydown",R);function N(){clearTimeout(c);for(let i of f.values())i.classList.remove("rh-hint","rh-hint-fwd","rh-hint-back")}function T(){if(S(r.board)||!u.hidden)return;let i=m("[data-hint-btn]");i.disabled=!0,i.textContent="💡 생각 중…",setTimeout(()=>{if(d)return;i.disabled=!1,i.textContent="💡 힌트";let p=Xe(r.board);if(!p||!p.next)return;let E=Qe(r.board,p.next);if(!E)return;r.hints++,M(),N(),s=E.id,y(),f.get(E.id).classList.add("rh-hint",E.delta>0?"rh-hint-fwd":"rh-hint-back"),c=setTimeout(N,2500)},30)}function U(){let i=et(r.history.length,h()),p=r.progress[r.level]|0;i>p&&(r.progress={...r.progress,[r.level]:i}),M(),f.get("A")?.classList.add("rh-exit-anim"),setTimeout(()=>{if(d||!S(r.board))return;let E=r.level+1<P.length;u.hidden=!1,u.innerHTML=`<div class="rh-ov-inner">
          <p class="rh-ov-title">클리어! <span class="rh-stars">${"★".repeat(i)}${"☆".repeat(3-i)}</span></p>
          <p class="rh-ov-sub">이동 ${r.history.length} · 최소 ${h()}${r.hints?` · 힌트 ${r.hints}번`:""}</p>
          <div class="rh-ov-btns">
            ${E?'<button class="mg-btn mg-btn-primary" data-next>다음 레벨</button>':'<p class="rh-ov-sub">마지막 레벨까지 깼어요! 🎉</p>'}
            <button class="mg-btn" data-retry>다시 하기</button>
            <button class="mg-btn" data-list>레벨 목록</button>
          </div></div>`,u.querySelector("[data-next]")?.addEventListener("click",()=>_(r.level+1)),u.querySelector("[data-retry]").addEventListener("click",O),u.querySelector("[data-list]").addEventListener("click",x)},380)}function x(){N(),u.hidden=!1;let i=P.map(([,E],H)=>{let G=r.progress[H]|0,l=I(H);return`<button class="rh-lv${H===r.level?" rh-lv-cur":""}${G?" rh-lv-done":""}" data-lv="${H}" ${l?"":"disabled"}>
          <b>${l?H+1:"🔒"}</b><small>${G?"★".repeat(G):l?`${E}수`:""}</small></button>`}).join(""),p=Object.keys(r.progress).length;u.innerHTML=`<div class="rh-ov-inner">
        <div class="rh-lv-head"><b>레벨 선택</b><span>${p} / ${P.length} 클리어</span>
          <button class="mg-btn" data-close-list>닫기</button></div>
        <div class="rh-lv-grid">${i}</div></div>`,u.querySelectorAll("[data-lv]").forEach(E=>E.addEventListener("click",()=>_(Number(E.dataset.lv)))),u.querySelector("[data-close-list]").addEventListener("click",()=>{S(r.board)&&U(),u.hidden=!0}),u.querySelector(".rh-lv-cur")?.scrollIntoView({block:"nearest"})}return m("[data-levels]").addEventListener("click",x),m("[data-undo]").addEventListener("click",F),m("[data-reset]").addEventListener("click",O),m("[data-hint-btn]").addEventListener("click",T),z(),D(),S(r.board)&&U(),{dispose(){d=!0,N(),n.removeEventListener("keydown",R),M()}}}};function se(e){let t=[],n=0;for(let o of e)o===1?n++:n&&(t.push(n),n=0);return n&&t.push(n),t}var ue=(e,t,n)=>e.slice(n*t,n*t+t),pe=(e,t,n)=>Array.from({length:t},(o,a)=>e[a*t+n]);function ge(e,t){return{rows:Array.from({length:t},(n,o)=>se(ue(e,t,o))),cols:Array.from({length:t},(n,o)=>se(pe(e,t,o)))}}var we=e=>e.join("").split("").map(t=>t==="#"?1:0);function st(e,t){let n=t.length,o=e.length,a=new Map;function r(g,u){let h=g*64+u;if(a.has(h))return a.get(h);let C=!1;if(u===o){C=!0;for(let I=g;I<n;I++)if(t[I]===1){C=!1;break}}else g<n&&(t[g]!==1&&r(g+1,u)&&(C=!0),!C&&s(g,u)&&(C=r(Math.min(n,g+e[u]+1),u+1)));return a.set(h,C),C}function s(g,u){let h=e[u];if(g+h>n)return!1;for(let C=g;C<g+h;C++)if(t[C]===0)return!1;return!(g+h<n&&t[g+h]===1)}if(!r(0,0))return null;let f=new Uint8Array(n),c=new Uint8Array(n),d=new Set;(function g(u,h){let C=u*64+h;if(!d.has(C)){if(d.add(C),h===o){for(let I=u;I<n;I++)c[I]=1;return}if(!(u>=n)&&(t[u]!==1&&r(u+1,h)&&(c[u]=1,g(u+1,h)),s(u,h))){let I=u+e[h],M=Math.min(n,I+1);if(r(M,h+1)){for(let z=u;z<I;z++)f[z]=1;I<n&&(c[I]=1),g(M,h+1)}}}})(0,0);let m=t.slice();for(let g=0;g<n;g++){if(!f[g]&&!c[g])return null;f[g]&&!c[g]?m[g]=1:!f[g]&&c[g]&&(m[g]=0)}return m}function qt(e,t){let n=e.length,o=Array(n*n).fill(-1),a=0,r=!0;for(;r;){r=!1,a++;for(let s=0;s<n;s++){let f=st(e[s],ue(o,n,s));if(!f)return{solved:!1,grid:o,passes:a};f.forEach((c,d)=>{o[s*n+d]!==c&&(o[s*n+d]=c,r=!0)})}for(let s=0;s<n;s++){let f=st(t[s],pe(o,n,s));if(!f)return{solved:!1,grid:o,passes:a};f.forEach((c,d)=>{o[d*n+s]!==c&&(o[d*n+s]=c,r=!0)})}}return{solved:o.every(s=>s!==-1),grid:o,passes:a}}function at(e,t,n=.58,o=400){for(let a=0;a<o;a++){let r=Array.from({length:e*e},()=>t()<n?1:0),{rows:s,cols:f}=ge(r,e);if(!(s.some(c=>c.length===0)||f.some(c=>c.length===0))&&qt(s,f).solved)return r}return null}function it(e,t,n,o){let a=e.map(r=>r===1?1:0);for(let r=0;r<t;r++)if(!De(se(ue(a,t,r)),n[r]))return!1;for(let r=0;r<t;r++)if(!De(se(pe(a,t,r)),o[r]))return!1;return!0}function De(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function Le(e,t,n,o,a){let r=n?ue(e,t,o):pe(e,t,o);return De(se(r.map(s=>s===1?1:0)),a)}var $=[{id:"heart5",name:"하트",rows:[".#.#.","#####","#####",".###.","..#.."]},{id:"tree5",name:"나무",rows:["..#..",".###.","#####","..#..","..#.."]},{id:"arrow5",name:"화살표",rows:["..#..",".###.","#.#.#","..#..","..#.."]},{id:"mush5",name:"버섯",rows:[".###.","#####","#.#.#","..#..",".###."]},{id:"cat5",name:"고양이",rows:["#...#","##.##","#####","#.#.#",".###."]},{id:"house5",name:"집",rows:["..#..",".###.","#####",".#.#.",".###."]},{id:"heart",name:"하트",rows:[".##....##.","####..####","##########","##########","##########",".########.","..######..","...####...","....##....",".........."]},{id:"tree",name:"크리스마스 트리",rows:["....##....","...####...","..######..","...####...","..######..",".########.","##########","....##....","....##....","...####..."]},{id:"cat",name:"고양이",rows:["#........#","##......##","##########","##########","#..####..#","##########","####..####",".########.","..######..","...####..."]},{id:"mushroom",name:"버섯",rows:["...####...",".##.##.##.","##..##..##","##########",".########.","...#..#...","...#..#...","...#..#...","...####...",".........."]},{id:"star",name:"별",rows:["....##....","....##....","...####...","##########",".########.","..######..","..######..",".###..###.",".##....##.","##......##"]},{id:"smile",name:"스마일",rows:["..######..",".########.","##.####.##","##.####.##","##########","#.######.#","##.####.##","###....###",".########.","..######.."]},{id:"fish",name:"물고기",rows:["..........","..........","...####..#",".#######.#","##.#######","##########",".#######.#","...####..#","..........",".........."]},{id:"note",name:"음표",rows:["....######","....######","....#....#","....#....#","....#....#","....#....#","..###..###",".####.####",".####.####","..##...##."]},{id:"umbrella",name:"우산",rows:["....##....","..######..",".########.","##########","#.#.##.#.#","....#.....","....#.....","....#.....","..#.#.....","..###....."]},{id:"rabbit",name:"토끼",rows:[".##....##.",".##....##.",".##....##.",".########.","##########","##.####.##","##########","###.##.###",".###..###.","..######.."]},{id:"boat",name:"돛단배",rows:["....#.....","....##....","....###...","....####..","....#####.","....#.....","##########",".########.","..######..",".........."]},{id:"apple",name:"사과",rows:[".....#....","....#.....","..##.###..",".########.","##########","##########","##########",".########.",".########.","..##..##.."]},{id:"rocket",name:"로켓",rows:["....##....","...####...","...####...","...#..#...","...####...","..######..","..######..",".##.##.##.",".#..##..#.","....##...."]},{id:"ghost",name:"유령",rows:["...####...","..######..",".########.",".#..##..#.",".########.",".########.",".########.",".########.",".##.##.##.",".#..#..#.."]},{id:"crown",name:"왕관",rows:["..........","#...##...#","##.####.##","##########","##########","#.#.##.#.#","##########","##########","..........",".........."]},{id:"key",name:"열쇠",rows:["..####....",".######...",".##..##...",".######...","..####....","...##.....","...####...","...##.....","...###....","...##....."]},{id:"sun",name:"해",rows:["....##....",".#..##..#.","..######..",".########.","##########","##########",".########.","..######..",".#..##..#.","....##...."]},{id:"moon",name:"달",rows:["...####...","..###.....",".###......",".##.......","###.......","###.......",".##.......",".###......","..###.....","...####..."]},{id:"bolt",name:"번개",rows:["....####..","...####...","..####....",".#######..","....####..","...####...","..####....",".###......",".##.......","#........."]},{id:"robot",name:"로봇",rows:["....##....","..######..","..#.##.#..","..######..","...#..#...","##########","#.######.#","#.######.#","..##..##..","..##..##.."]},{id:"cup",name:"커피",rows:["..#..#....","...#..#...","..#..#....","..........","#########.","########.#","########.#","#########.",".#######..","..#####..."]}];var lt="nonogram",jt=200,_t={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]},ke=e=>`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`;function Zt(e,t){let n="";return e.forEach((o,a)=>{o===1&&(n+=`M${a%t} ${Math.floor(a/t)}h1v1h-1z`)}),n}var He=(e,t,n="")=>`<svg class="${n}" viewBox="0 0 ${t} ${t}" preserveAspectRatio="xMidYMid meet"><path d="${Zt(e,t)}"/></svg>`;function me(e,t){if(e==="random"&&t){let o=Math.round(Math.sqrt(t.length));return{id:e,name:"랜덤 퍼즐",size:o,solution:t}}let n=$.find(o=>o.id===e);return n?{id:e,name:n.name,size:n.rows.length,solution:we(n.rows)}:null}function Ot(e){if(!e||e.v!==1||!e.cur)return null;let t=typeof e.cur.solution=="string"?[...e.cur.solution].map(Number):null,n=me(e.cur.id,t);if(!n)return null;let o=n.size*n.size,a=typeof e.cur.cells=="string"&&e.cur.cells.length===o?[...e.cur.cells].map(Number):Array(o).fill(0);return{puzzle:n,cells:a,elapsed:e.cur.elapsed|0,done:!!e.cur.done,cleared:e.cleared&&typeof e.cleared=="object"?e.cleared:{}}}var ct={id:"nonogram",title:"네모로직",icon:"🧩",desc:`숫자 힌트로 그림 맞히기 · 그림 ${$.length}개 + 랜덤`,async mount(e,{host:t,win:n,doc:o}){let a=Ot(await t.load(lt)),r=a?.cleared??{},s=a?.puzzle??me($[0].id),f=a?.cells??Array(s.size*s.size).fill(0),c=a?.elapsed??0,d=a?.done??!1,m=ge(s.solution,s.size),g=1,u=0,h=[],C=0,I=[],M=!1;e.innerHTML=`
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
      </div>`;let z=l=>e.querySelector(l),y=z("[data-grid]"),D=z("[data-overlay]"),k=()=>t.save(lt,{v:1,cur:{id:s.id,solution:s.id==="random"?s.solution.join(""):void 0,cells:f.join(""),elapsed:c,done:d},cleared:r});function K(){let l=s.size,v=Math.max(1,...m.rows.map(A=>A.length)),w=Math.max(1,...m.cols.map(A=>A.length));y.style.setProperty("--n",l),y.style.setProperty("--fs",l<=5?"18px":"calc(var(--size) * .034)"),y.style.setProperty("--rc",v),y.style.setProperty("--cc",w);let J=A=>(A.length?A:[0]).map(L=>`<span>${L}</span>`).join("");y.innerHTML=`
        <div class="nn-corner" data-preview></div>
        <div class="nn-cols">${m.cols.map(A=>`<div class="nn-clue">${J(A)}</div>`).join("")}</div>
        <div class="nn-rows">${m.rows.map(A=>`<div class="nn-clue">${J(A)}</div>`).join("")}</div>
        <div class="nn-board" data-board></div>`;let b=y.querySelector("[data-board]");I=Array.from({length:l*l},(A,L)=>{let B=o.createElement("div");B.className="nn-cell";let q=Math.floor(L/l),Z=L%l;return Z%5===4&&Z<l-1&&B.classList.add("nn-c5"),q%5===4&&q<l-1&&B.classList.add("nn-r5"),b.appendChild(B),B}),b.addEventListener("pointerdown",X),b.addEventListener("contextmenu",A=>A.preventDefault()),F()}function F(){let l=s.size,v=Math.floor(u/l),w=u%l;I.forEach((L,B)=>{let q=f[B];L.classList.toggle("nn-fill",q===1),L.classList.toggle("nn-x",q===2&&!d),L.classList.toggle("nn-cur",B===u&&!d),L.classList.toggle("nn-line",!d&&B!==u&&(Math.floor(B/l)===v||B%l===w))});let J=y.querySelectorAll(".nn-rows .nn-clue"),b=y.querySelectorAll(".nn-cols .nn-clue");m.rows.forEach((L,B)=>J[B].classList.toggle("nn-done",Le(f,l,!0,B,L))),m.cols.forEach((L,B)=>b[B].classList.toggle("nn-done",Le(f,l,!1,B,L))),y.querySelector("[data-preview]").innerHTML=He(f,l,"nn-prev"),y.classList.toggle("nn-solved",d);let A=$.findIndex(L=>L.id===s.id);z("[data-list]").textContent=`${A>=0?`#${A+1}`:"랜덤"} · ${l}×${l} ▾`,z("[data-time]").textContent=ke(c),e.querySelectorAll(".nn-mode").forEach(L=>L.classList.toggle("mg-btn-primary",Number(L.dataset.mode)===g)),z("[data-undo]").disabled=h.length===0||d,z("[data-reset]").disabled=d||!f.some(Boolean)}function O(l,v){return f[l]===v?{tool:v,erase:!0}:{tool:v,erase:!1}}function _(l,v,w){w.erase?l[v]===w.tool&&(l[v]=0):l[v]===0&&(l[v]=w.tool)}function V(l){l.every((v,w)=>v===f[w])||(h.push(l),h.length>jt&&h.shift(),it(f,s.size,m.rows,m.cols)&&T(),F(),k())}function X(l){if(d||!D.hidden||l.button!==void 0&&l.button!==0&&l.button!==2)return;l.preventDefault();let v=l.currentTarget,w=v.getBoundingClientRect(),J=s.size,b=ne=>{let Y=Math.floor((ne.clientX-w.left)/w.width*J),W=Math.floor((ne.clientY-w.top)/w.height*J);return[Math.max(0,Math.min(J-1,W)),Math.max(0,Math.min(J-1,Y))]},[A,L]=b(l),B=A*J+L,q=O(B,l.button===2?2:g),Z=f.slice(),ae=null,Ge=ne=>{let[Y,W]=b(ne);!ae&&(Y!==A||W!==L)&&(ae=Math.abs(Y-A)>=Math.abs(W-L)?"col":"row"),ae==="row"?Y=A:ae==="col"&&(W=L);let Fe=Z.slice(),[ft,ut]=[Math.min(A,Y),Math.max(A,Y)],[pt,gt]=[Math.min(L,W),Math.max(L,W)];for(let he=ft;he<=ut;he++)for(let ve=pt;ve<=gt;ve++)_(Fe,he*J+ve,q);f=Fe,u=Y*J+W,F()};v.setPointerCapture?.(l.pointerId),Ge(l);let Be=ne=>Ge(ne),ie=()=>{v.removeEventListener("pointermove",Be),v.removeEventListener("pointerup",ie),v.removeEventListener("pointercancel",ie),V(Z)};v.addEventListener("pointermove",Be),v.addEventListener("pointerup",ie),v.addEventListener("pointercancel",ie)}function te(l){if(d)return;let v=f.slice();f=v.slice(),_(f,u,O(u,l)),V(v)}function R(){d||!h.length||(f=h.pop(),F(),k())}function N(){d||!f.some(Boolean)||(h.push(f.slice()),f=f.map(()=>0),F(),k())}function T(){d=!0,f=f.map(v=>v===1?1:0);let l=r[s.id];s.id!=="random"&&(l==null||c<l)&&(r={...r,[s.id]:c}),H(),setTimeout(()=>{!M&&d&&x()},450)}function U(){let l=$.findIndex(v=>v.id===s.id);for(let v=1;v<=$.length;v++){let w=$[(Math.max(l,-1)+v)%$.length];if(!r[w.id])return w.id}return null}function x(){D.hidden=!1;let l=U();D.innerHTML=`<div class="nn-ov-inner">
        ${He(s.solution,s.size,"nn-reveal")}
        <p class="nn-ov-title">${s.name}!</p>
        <p class="nn-ov-sub">${ke(c)}${s.id!=="random"&&r[s.id]===c?" · 최고 기록!":""}</p>
        <div class="nn-ov-btns">
          ${l?'<button class="mg-btn mg-btn-primary" data-next>다음 그림</button>':""}
          <button class="mg-btn" data-random>랜덤 퍼즐</button>
          <button class="mg-btn" data-open-list>퍼즐 목록</button>
        </div></div>`,D.querySelector("[data-next]")?.addEventListener("click",()=>p(l)),D.querySelector("[data-random]").addEventListener("click",()=>p("random")),D.querySelector("[data-open-list]").addEventListener("click",i)}function i(){D.hidden=!1;let l=(b,A)=>{let L=r[b.id]!=null,B=b.rows.length;return`<button class="nn-item${b.id===s.id?" nn-item-cur":""}" data-pick="${b.id}">
          ${L?He(we(b.rows),B,"nn-thumb"):'<span class="nn-q">?</span>'}
          <small>${L?b.name:`#${A+1}`}</small></button>`},v=$.map((b,A)=>[b,A]).filter(([b])=>b.rows.length===5),w=$.map((b,A)=>[b,A]).filter(([b])=>b.rows.length!==5),J=Object.keys(r).length;D.innerHTML=`<div class="nn-ov-inner nn-list">
        <div class="nn-list-head"><b>퍼즐 고르기</b><span>${J} / ${$.length}</span>
          <button class="mg-btn" data-close-list>닫기</button></div>
        <button class="mg-btn mg-btn-primary nn-random" data-pick="random">🎲 새 랜덤 퍼즐 (10×10)</button>
        <p class="nn-sec">5×5 연습</p><div class="nn-items">${v.map(([b,A])=>l(b,A)).join("")}</div>
        <p class="nn-sec">10×10</p><div class="nn-items">${w.map(([b,A])=>l(b,A)).join("")}</div>
      </div>`,D.querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>p(b.dataset.pick))),D.querySelector("[data-close-list]").addEventListener("click",()=>{D.hidden=!0,d&&x()})}function p(l){let v=l==="random"?me("random",at(10,Math.random)):me(l);v&&(s=v,m=ge(s.solution,s.size),f=Array(s.size*s.size).fill(0),c=0,d=!1,h=[],u=0,D.hidden=!0,K(),E(),k())}function E(){H(),!d&&(C=setInterval(()=>{o.hidden||!D.hidden||(c++,z("[data-time]").textContent=ke(c),c%10===0&&k())},1e3))}function H(){clearInterval(C),C=0}let G=l=>{if(!D.hidden)return;if((l.ctrlKey||l.metaKey)&&(l.key==="z"||l.key==="Z")){l.preventDefault(),R();return}if(l.ctrlKey||l.metaKey||l.altKey)return;let v=s.size,w=_t[l.key];if(w){l.preventDefault();let J=(Math.floor(u/v)+w[0]+v)%v,b=(u%v+w[1]+v)%v;u=J*v+b,F();return}if(l.key===" "||l.key==="Enter"){l.preventDefault(),te(1);return}if(l.key==="x"||l.key==="X"){l.preventDefault(),te(2);return}(l.key==="z"||l.key==="Z")&&(l.preventDefault(),R())};return n.addEventListener("keydown",G),z("[data-list]").addEventListener("click",i),e.querySelectorAll(".nn-mode").forEach(l=>l.addEventListener("click",()=>{g=Number(l.dataset.mode),F()})),z("[data-undo]").addEventListener("click",R),z("[data-reset]").addEventListener("click",N),K(),d?x():E(),{dispose(){M=!0,H(),n.removeEventListener("keydown",G),k()}}}};var dt='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><rect x="7.5" y="7.5" width="9" height="6" rx="1"/><path d="M12 7.5v6M7.5 10.5h9"/></svg>';var Rt=[je,Ue,ot,ct];function Pt(e,t){let n=()=>{t()},o=!1;async function a(){o||(await e.api.addRisuChatListener("output",n),o=!0)}return{async restore(){await e.load("notify")==="on"&&(await e.api.requestPluginPermission("replacer")?await a():e.save("notify","off"))},async state(){return e.load("notify")},decline(){e.save("notify","off")},async disable(){o&&await e.api.removeRisuChatListener("output",n),o=!1,e.save("notify","off")},async enable(){await e.api.hideContainer();let r=!1;try{r=await e.api.requestPluginPermission("replacer")}finally{await e.api.showContainer("fullscreen")}return e.save("notify",r?"on":"off"),r&&await a(),r}}}async function Ut(e){let t=await Je(e),n=null,o=Pt(t,()=>n?.showResponseToast());n=ze({host:t,games:Rt,notify:o});let{id:a}=await e.registerButton({name:"미니게임",icon:dt,iconType:"html",location:"chat",id:"risu-minigame-open"},()=>{n.open()});await e.onUnload(async()=>{await n.close(),await e.unregisterUIPart(a)}),await o.restore()}Ut(risuai).catch(e=>console.error("[minigame] init failed",e));})();
