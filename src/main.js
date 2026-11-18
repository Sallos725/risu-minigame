import { createHost } from './core/host.js';
import { createApp } from './shell/app.js';
import g2048 from './games/g2048/view.js';
import sudoku from './games/sudoku/view.js';
import { ICON_SVG } from './icon.js';

const GAMES = [g2048, sudoku];

// 응답 도착 알림.
// addRisuScriptHandler('output')는 스트리밍 청크마다 불려서 "완료" 신호로 못 쓴다.
// addRisuChatListener('output')는 응답이 끝난 뒤 한 번만 불리지만 replacer 권한이 필요하고,
// 호출마다 캐릭터·채팅 전체 스냅샷이 iframe으로 복사된다. 그래서 사용자가 켤 때만 등록한다.
function createNotify(host, onResponse) {
  const listener = () => { onResponse(); };
  let registered = false;

  async function register() {
    if (registered) return;
    await host.api.addRisuChatListener('output', listener);
    registered = true;
  }

  return {
    // 빌드가 바뀌면 권한을 다시 물어본다. 거부되면 저장 상태도 'off'로 맞춘다.
    async restore() {
      if ((await host.load('notify')) !== 'on') return;
      if (await host.api.requestPluginPermission('replacer')) await register();
      else host.save('notify', 'off');
    },
    // null = 아직 안 물어봄, 'on' / 'off'
    async state() {
      return host.load('notify');
    },
    decline() {
      host.save('notify', 'off');
    },
    async disable() {
      if (registered) await host.api.removeRisuChatListener('output', listener);
      registered = false;
      host.save('notify', 'off');
    },
    async enable() {
      // 권한 창은 전체화면 iframe 아래에 깔릴 수 있어서 잠깐 숨겼다가 다시 띄운다.
      await host.api.hideContainer();
      let granted = false;
      try {
        granted = await host.api.requestPluginPermission('replacer');
      } finally {
        await host.api.showContainer('fullscreen');
      }
      host.save('notify', granted ? 'on' : 'off');
      if (granted) await register();
      return granted;
    },
  };
}

async function main(api) {
  const host = await createHost(api);
  let app = null;
  const notify = createNotify(host, () => app?.showResponseToast());
  app = createApp({ host, games: GAMES, notify });

  const { id: buttonId } = await api.registerButton({
    name: '미니게임',
    icon: ICON_SVG,
    iconType: 'html',
    location: 'chat',
    id: 'risu-minigame-open',
  }, () => { app.open(); });

  await api.onUnload(async () => {
    await app.close();
    await api.unregisterUIPart(buttonId);
  });

  await notify.restore();
}

main(risuai).catch((e) => console.error('[minigame] init failed', e));
