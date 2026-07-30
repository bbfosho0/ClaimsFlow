import { build, context } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const watch = process.argv.includes('--watch');
const shared = { bundle: true, target: 'es2022', logLevel: 'info' };

async function buildUi() {
  await mkdir('dist', { recursive: true });
  await build({ ...shared, entryPoints: ['src/ui.ts'], outfile: 'dist/ui.js', platform: 'browser' });
  const script = await readFile('dist/ui.js', 'utf8');
  await writeFile('dist/ui.html', `<!doctype html><html><head><meta charset="utf-8"><title>ClaimsFlow Shader Studio</title><style>${await readFile('src/ui.css', 'utf8')}</style></head><body><main id="app"></main><script>${script}</script></body></html>`);
}

if (watch) {
  const code = await context({ ...shared, entryPoints: ['src/code.ts'], outfile: 'dist/code.js', platform: 'browser' });
  await code.watch();
  await buildUi();
  console.log('Watching plugin source files.');
} else {
  await build({ ...shared, entryPoints: ['src/code.ts'], outfile: 'dist/code.js', platform: 'browser' });
  await buildUi();
}
