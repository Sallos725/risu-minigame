// 방향 입력: 키보드(방향키, WASD)와 포인터 스와이프(마우스·터치 공통)를 하나의 콜백으로.
// 반환된 dispose()를 반드시 호출할 것. iframe은 열고 닫기를 반복해도 계속 살아 있어서
// 정리 안 한 리스너는 그대로 쌓인다.

const KEY_DIR = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
};
const SWIPE_MIN = 30;

export function bindDirections(win, surface, onDir) {
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const dir = KEY_DIR[e.key];
    if (!dir) return;
    e.preventDefault();
    onDir(dir);
  };

  let start = null;
  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    surface.setPointerCapture?.(e.pointerId);
  };
  const onUp = (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
    if (Math.abs(dx) > Math.abs(dy)) onDir(dx > 0 ? 'right' : 'left');
    else onDir(dy > 0 ? 'down' : 'up');
  };
  const onCancel = () => { start = null; };

  win.addEventListener('keydown', onKey);
  surface.addEventListener('pointerdown', onDown);
  surface.addEventListener('pointerup', onUp);
  surface.addEventListener('pointercancel', onCancel);

  return () => {
    win.removeEventListener('keydown', onKey);
    surface.removeEventListener('pointerdown', onDown);
    surface.removeEventListener('pointerup', onUp);
    surface.removeEventListener('pointercancel', onCancel);
  };
}
