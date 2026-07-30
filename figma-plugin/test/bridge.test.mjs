import test from 'node:test';
import assert from 'node:assert/strict';
import { FILE_KEY, validateCommand } from '../bridge/protocol.mjs';
import { MockBridge } from '../bridge/mock.mjs';
import { SEED_PAGE, validateRegistry } from '../bridge/registry.mjs';

test('rejects wrong file keys and invalid node IDs', () => {
  assert.throws(() => validateCommand({ kind: 'inspect', fileKey: 'wrong', nodeId: '100:104' }), /allowlisted/);
  assert.throws(() => validateCommand({ kind: 'inspect', fileKey: FILE_KEY, nodeId: 'not-a-node' }), /nodeId/);
});

test('rejects unsupported presets and bad tokens', async () => {
  const bridge = new MockBridge('test-token');
  await assert.rejects(bridge.command('wrong', { kind: 'inspect', fileKey: FILE_KEY, nodeId: '100:104' }), /Invalid/);
  bridge.connect('test-token');
  await assert.rejects(bridge.command('test-token', { kind: 'apply', fileKey: FILE_KEY, nodeId: '100:104', preset: 'unknown', mode: 'add' }), /Unsupported preset/);
});

test('supports reconnect and updates a duplicate preset without duplicating state', async () => {
  const bridge = new MockBridge('test-token'); bridge.connect('test-token');
  await bridge.command('test-token', { kind: 'apply', fileKey: FILE_KEY, nodeId: '100:104', preset: 'overview-signal-field', mode: 'add' });
  bridge.disconnect(); bridge.connect('test-token');
  await bridge.command('test-token', { kind: 'apply', fileKey: FILE_KEY, nodeId: '100:104', preset: 'overview-signal-field', mode: 'update' });
  assert.equal(bridge.nodes.size, 1);
  assert.equal(bridge.nodes.get('100:104').mode, 'update');
});

test('rolls back a batch when one operation fails', async () => {
  const bridge = new MockBridge('test-token'); bridge.connect('test-token');
  await bridge.command('test-token', { kind: 'apply', fileKey: FILE_KEY, nodeId: '100:104', preset: 'overview-signal-field', mode: 'add' });
  await assert.rejects(bridge.command('test-token', { kind: 'batch', fileKey: FILE_KEY, operations: [{ nodeId: '100:168', preset: 'claim-flow-wave', mode: 'add' }, { nodeId: '999:999', preset: 'claim-flow-wave', mode: 'add' }] }), /rolled back/);
  assert.deepEqual([...bridge.nodes.keys()], ['100:104']);
});

test('accepts only the exact native shader seed page', () => {
  assert.deepEqual(validateCommand({ kind: 'scan-seeds', fileKey: FILE_KEY, pageName: SEED_PAGE }), { kind: 'scan-seeds', fileKey: FILE_KEY, pageName: SEED_PAGE, dryRun: false });
  assert.throws(() => validateCommand({ kind: 'scan-seeds', fileKey: FILE_KEY, pageName: 'FINAL / 01 Operations Overview' }), /exact page name/);
});

test('rejects registry entries that are not real SHADER entries', () => {
  assert.throws(() => validateRegistry({ pageName: SEED_PAGE, seeds: [{ layerName: 'Seed / Bloom', shaderId: 'bloom', entryType: 'DROP_SHADOW', slotType: 'effect', properties: {}, visible: true, sourceNodeId: '1:2' }] }), /real SHADER/);
});
