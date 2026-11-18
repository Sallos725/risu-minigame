// RisuAI V3 호스트 API 래퍼.
// 모든 risuai 호출은 iframe 브리지를 건너는 RPC라서, 저장은 디바운스해서 모아 보낸다.
// iframe은 opaque origin이라 자체 localStorage/IndexedDB는 쓸 수 없다.

const PREFIX = 'minigame:';
const SAVE_DELAY = 600;

export async function createHost(api) {
  const store = await api.getLocalPluginStorage();
  const pending = new Map();
  let timer = 0;

  async function flush() {
    clearTimeout(timer);
    timer = 0;
    const entries = [...pending];
    pending.clear();
    for (const [key, value] of entries) {
      try {
        await store.setItem(PREFIX + key, value);
      } catch (e) {
        console.error('[minigame] save failed', key, e);
      }
    }
  }

  return {
    api,
    async load(key) {
      if (pending.has(key)) return pending.get(key);
      try {
        return (await store.getItem(PREFIX + key)) ?? null;
      } catch (e) {
        console.error('[minigame] load failed', key, e);
        return null;
      }
    },
    save(key, value) {
      pending.set(key, value);
      clearTimeout(timer);
      timer = setTimeout(flush, SAVE_DELAY);
    },
    flush,
  };
}
