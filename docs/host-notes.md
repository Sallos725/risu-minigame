# RisuAI V3 호스트 메모

PocketRisu 1.17.0(`40851fc`, :6001에서 실행 중인 버전) 소스를 기준으로 확인한 내용이에요.
업스트림 RisuAI(`4d87a70`)와 다른 부분은 따로 표시했어요.
소스 스냅샷 위치: `~/nvme/docker-data/risuhina/space/hina/.sources/{pocketrisu,risuai}`

경로는 모두 `src/ts/` 기준이에요.

## 실행 환경
- 플러그인마다 숨겨진 iframe이 하나씩 생기고, 플러그인이 켜져 있는 동안 계속 살아 있어요.
  sandbox 속성은 `allow-scripts allow-modals allow-downloads`라서 origin이 opaque예요.
  그래서 iframe 자체의 localStorage/IndexedDB는 쓸 수 없어요 (`plugins/apiV3/factory.ts:831`).
- CSP는 `connect-src 'none'`, nonce가 붙은 스크립트만 허용, `style-src * 'unsafe-inline'`이에요 (`factory.ts:478`).
  외부 스크립트는 불러올 수 없으니 단일 번들로 만들어야 해요.
- 코드는 `<script>` 안에 그대로 붙여 넣어져요 (`factory.ts:945-970`).
  번들에 `</script`가 있으면 문서가 잘리기 때문에 `scripts/build.mjs`가 빌드 단계에서 이걸 막아요.
- 호스트가 `<body>`에 `body { background-color: transparent }`를 넣는데, 우리 `<style>`보다 뒤에 들어가요.
  그래서 배경색은 `.mg-app`에 직접 지정해요.
- `risuai`는 Proxy라서 모든 메서드가 존재하는 것처럼 보여요. `risuai.x?.()` 같은 기능 감지는 의미가 없어요.

## UI
- 화면을 띄우는 방법은 `showContainer('fullscreen')` 하나뿐이에요.
  iframe이 화면 전체를 덮기 때문에, 작은 창을 띄우면 채팅 조작이 막혀요 (`plugins/apiV3/v3.svelte.ts:1108-1141`).
- 진입점은 `registerButton({location:'chat'})`로 채팅 입력칸 옆 ☰ 메뉴에 넣어요 (`v3.svelte.ts:1213`).
  메뉴에는 아이콘과 이름이 같이 나와요 (`lib/ChatScreens/DefaultChatScreen.svelte:1087-1090`).
  - 아이콘은 `PluginDefinedIcon`이 DOMPurify 기본 설정으로 정리한 뒤 20px 박스에 넣어요. 기본 설정은 SVG를 남겨요.
  - 다른 메뉴 아이콘에 맞춰 `currentColor` 선 아이콘(`src/icon.js`)을 써요.
  - `'action'`(오른쪽 위 고정 버튼)은 화면에 계속 떠 있어서 쓰지 않기로 했어요.
- PocketRisu는 알림창이 열리면 전체화면 iframe을 알림 레이어 아래로 내려요 (`v3.svelte.ts:629-634`).
  업스트림은 그렇지 않아서, 권한을 요청하기 전에 `hideContainer()`를 먼저 불러요.

## 응답 완료 감지
- `addRisuScriptHandler('output')` = `editoutput`은 **스트리밍 중 청크를 반영할 때마다** 호출돼요
  (`process/index.svelte.ts:1699`, `:1758`). 완료 신호로 쓸 수 없고, 호출마다 RPC가 생겨요.
- `addRisuChatListener('output')`는 응답이 끝난 뒤 한 번만 호출돼요 (`process/index.svelte.ts:1837`, `:1926`).
  - `replacer` 권한이 필요해요.
  - 호출마다 캐릭터·채팅 전체의 `$state.snapshot`이 iframe으로 복사돼요 (`index.svelte.ts:57-79`).
  - 그래서 사용자가 알림을 켰을 때만 등록해요.
- 권한 결정은 `스크립트 해시_권한` 키로 저장돼요 (`plugins/apiV3/pluginPermissionCache.ts`).
  - 빌드가 바뀔 때마다 다시 물어봐요.
  - PocketRisu는 허용과 거부를 모두 영구 기억하고, 서버에 저장해서 기기끼리 공유해요.
  - 업스트림은 허용을 3일마다 다시 물어봐요.

## 저장소
- `getLocalPluginStorage()`는 기기 로컬 IndexedDB를 쓰고, `getItem`/`setItem`으로 객체를 그대로 저장할 수 있어요 (`plugins/pluginSafeClass.ts:108-141`).
- 저장소는 다른 플러그인과 같은 공간을 써서 키 앞에 `minigame:`를 붙여요.
- 호출 하나하나가 RPC이고, 호스트가 RPC마다 `console.log`를 남겨요. 그래서 저장은 600ms 디바운스로 모아서 보내고,
  화면을 닫을 때와 `visibilitychange`, `pagehide`에서는 바로 flush해요.

## 아직 실기기에서 확인 못 한 것
- 버튼을 눌러 화면을 연 직후에 iframe이 키보드 포커스를 받는지
  (못 받으면 마우스 환경에서 "한 번 클릭하면 방향키" 안내가 떠요).
- 스트리밍을 켠 상태에서 응답 완료 토스트가 딱 한 번만 뜨는지.
- iOS Safari에서 스와이프할 때 페이지가 같이 스크롤되지 않는지.
