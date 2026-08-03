import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { auditText, scanRepository } from './audit-deployed-source.mjs';

test('reports each high-risk deployed source pattern with a precise rule', () => {
  const cases = [
    ['frontend/src/app/app.routes.ts', "{ path: 'reports', component: ReportsPreview }", 'placeholder-route'],
    ['frontend/src/app/core/demo-role/demo-role.model.ts', "route: '/app/settings'", 'placeholder-navigation'],
    ['frontend/src/app/workspaces/team-operations-page.component.ts', "import { parseOperationalFilters } from './analytics-page.component';", 'page-coupled-utility'],
    ['frontend/src/app/dashboard/dashboard-page.component.ts', 'console.log(snapshot);', 'console-debugging'],
    ['frontend/src/app/workspaces/documents-page.component.html', '<button>Upload Documents</button>', 'unsupported-product-claim'],
    ['backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java', 'Instant now = Instant.now();', 'direct-wall-clock'],
    ['frontend/src/app/dashboard/dashboard-page.component.ts', '// FIXME: reconnect this later', 'unfinished-marker'],
  ];

  for (const [file, source, expectedRule] of cases) {
    const findings = auditText(file, source);
    assert.equal(findings.length, 1, `${file} should have one finding`);
    assert.equal(findings[0].rule, expectedRule);
    assert.equal(findings[0].line, 1);
  }
});

test('does not report approved production patterns', () => {
  assert.deepEqual(auditText(
    'frontend/src/app/workspaces/team-operations-page.component.ts',
    "import { parseOperationalFilters } from '../core/operational-data/operational-filter-codec';",
  ), []);
  assert.deepEqual(auditText(
    'backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java',
    'Instant now = clock.instant();',
  ), []);
  assert.deepEqual(auditText(
    'frontend/src/app/workspaces/documents-page.component.html',
    '<strong>Evidence categories</strong>',
  ), []);
});

test('scans deployed roots while ignoring tests and documentation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'claimsflow-source-audit-'));
  try {
    await write(root, 'frontend/src/app/app.routes.ts', "{ path: 'settings' }");
    await write(root, 'frontend/src/app/app.routes.spec.ts', "{ path: 'reports' }");
    await write(root, 'docs/audit.md', 'TODO and Upload Documents are historical discussion terms.');
    await write(root, 'backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java', 'Instant now = clock.instant();');

    const findings = await scanRepository(root);
    assert.deepEqual(findings.map(finding => finding.rule), ['placeholder-route']);
    assert.equal(findings[0].file, 'frontend/src/app/app.routes.ts');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function write(root, path, content) {
  const absolute = join(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}
