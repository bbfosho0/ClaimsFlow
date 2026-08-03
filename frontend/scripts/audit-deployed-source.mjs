import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_REPOSITORY_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SOURCE_ROOTS = [
  'frontend/src/app',
  'backend/src/main/java/com/claimsflow/operations',
  'backend/src/main/java/com/claimsflow/analytics',
  'backend/src/main/java/com/claimsflow/team',
  'backend/src/main/java/com/claimsflow/evidence',
  'backend/src/main/java/com/claimsflow/dashboard',
];
const SOURCE_EXTENSIONS = new Set(['.ts', '.html', '.java']);
const TEST_FILE_PATTERN = /(?:\.spec\.ts|Test\.java)$/;

export async function scanRepository(repositoryRoot = DEFAULT_REPOSITORY_ROOT) {
  const findings = [];
  for (const sourceRoot of SOURCE_ROOTS) {
    const absoluteRoot = resolve(repositoryRoot, sourceRoot);
    for (const file of await walk(absoluteRoot)) {
      const repositoryPath = normalize(relative(repositoryRoot, file));
      if (!SOURCE_EXTENSIONS.has(extname(file)) || TEST_FILE_PATTERN.test(file)) continue;
      const content = await readFile(file, 'utf8');
      findings.push(...auditText(repositoryPath, content));
    }
  }
  return findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.rule.localeCompare(right.rule));
}

export function auditText(file, content) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  const report = (rule, line, message) => findings.push({ file, line, rule, message });

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const number = index + 1;

    if (/\b(?:TODO|FIXME|HACK)\b/.test(line)) report('unfinished-marker', number, 'Remove unfinished implementation markers from deployed source.');
    if (file.startsWith('frontend/src/app/') && /\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(line)) report('console-debugging', number, 'Use application error handling instead of browser console output.');
    if (file === 'frontend/src/app/app.routes.ts' && /path\s*:\s*['"](?:reports|settings)['"]/.test(line)) report('placeholder-route', number, 'Reports and Settings are not deployable application routes.');
    if (file === 'frontend/src/app/core/demo-role/demo-role.model.ts' && /\/app\/(?:reports|settings)\b/.test(line)) report('placeholder-navigation', number, 'Reports and Settings are not role navigation destinations.');
    if (file.startsWith('frontend/src/app/workspaces/') && basename(file) !== 'workspace-pages.component.ts' && /from\s+['"]\.\/(?:analytics|documents|team-operations)-page\.component['"]/.test(line)) report('page-coupled-utility', number, 'Workspace pages must consume shared operational utilities, not another page component.');
    if (file.endsWith('.html') && /\b(?:Upload Documents|OCR extraction|Storage used|Bulk Actions|Version history|Send SMS)\b/i.test(line)) report('unsupported-product-claim', number, 'Remove unsupported document-management or messaging capability copy.');
    if (file.endsWith('.html') && /Policy alignment|width:88%/i.test(line)) report('fabricated-metric', number, 'Calculated-looking policy alignment must come from a backend contract or be removed.');

    const usesUninjectedJavaClock = /\b(?:Instant\.now|LocalDate\.now)\s*\(\s*\)/.test(line) || /\bSystem\.currentTimeMillis\s*\(/.test(line);
    if (file.startsWith('backend/src/main/java/com/claimsflow/') && usesUninjectedJavaClock) report('direct-wall-clock', number, 'Operational backend code must use the injected Clock.');
  }

  return findings;
}

async function walk(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error?.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function normalize(path) { return path.replaceAll('\\', '/'); }

async function main() {
  const repositoryRoot = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_REPOSITORY_ROOT;
  const findings = await scanRepository(repositoryRoot);
  if (!findings.length) { console.log('Deployed source audit passed with zero findings.'); return; }
  for (const finding of findings) console.error(`${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);
  console.error(`Deployed source audit failed with ${findings.length} finding(s).`);
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
