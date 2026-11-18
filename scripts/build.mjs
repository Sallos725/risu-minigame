import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const outfile = path.join(root, 'dist/risu-minigame.js');
const dev = process.argv.includes('--dev');

// //@version은 파일 앞쪽 512바이트 안에 있어야 업데이트 확인이 읽는다.
// //@update-url은 RisuAI가 브라우저에서 직접 fetch하므로 공개·CORS 허용 주소여야 한다.
// release 브랜치는 Release 워크플로가 정식 태그마다 갱신한다. (호스트가 공백 하나로 split하니 공백은 한 칸만)
const UPDATE_URL = 'https://raw.githubusercontent.com/Sallos725/risu-minigame/release/risu-minigame.js';
const banner = [
  '//@name risu_minigame',
  `//@version ${pkg.version}`,
  `//@update-url ${UPDATE_URL}`,
  '//@display-name 미니게임',
  '//@api 3.0',
].join('\n');

const result = await esbuild.build({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020', 'safari15'],
  minify: !dev,
  legalComments: 'none',
  charset: 'utf8',
  write: false,
});

const code = `${banner}\n${result.outputFiles[0].text}`;

// 호스트가 코드를 <script> 안에 그대로 넣기 때문에 이 문자열이 있으면 문서가 잘린다.
if (/<\/script/i.test(code)) {
  console.error('빌드 실패: 번들에 "</script" 문자열이 있어요.');
  process.exit(1);
}

mkdirSync(path.dirname(outfile), { recursive: true });
writeFileSync(outfile, code);
const kb = (Buffer.byteLength(code) / 1024).toFixed(1);
console.log(`dist/risu-minigame.js  ${kb} KB${dev ? ' (dev)' : ''}`);
