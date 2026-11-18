import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const outfile = path.join(root, 'dist/risu-minigame.js');
const dev = process.argv.includes('--dev');

// //@version은 파일 앞쪽 약 500바이트 안에 있어야 호스트가 읽는다.
const banner = [
  '//@name risu_minigame',
  `//@version ${pkg.version}`,
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
