import { timingSafeEqual } from 'node:crypto';
import { SEED_PAGE } from './registry.mjs';

export const HOST = '127.0.0.1';
export const PORT = 3847;
export const FILE_KEY = 'M7GOuna2hq7jWCGTZhiP5b';
export const NODE_ID = /^\d+:\d+$/;
export const PRESETS = new Set([
  'overview-signal-field', 'claim-flow-wave', 'queue-command-atmosphere', 'selected-claim-inspector',
  'workspace-identity-field', 'decision-intelligence-mesh', 'evidence-pressure', 'processing-field'
]);

export function parseJson(value) {
  try { return JSON.parse(value); } catch { throw new Error('Request body must be valid JSON.'); }
}

export function validateNodeId(value) {
  if (typeof value !== 'string' || !NODE_ID.test(value)) throw new Error('nodeId must use the Figma numeric form, for example 100:104.');
  return value;
}

export function validateOperation(operation) {
  if (!operation || typeof operation !== 'object') throw new Error('Operation must be an object.');
  const { nodeId, preset, mode } = operation;
  validateNodeId(nodeId);
  if (typeof preset !== 'string' || !PRESETS.has(preset)) throw new Error(`Unsupported preset: ${String(preset)}.`);
  if (!['add', 'replace', 'update'].includes(mode)) throw new Error('mode must be add, replace, or update.');
  return { nodeId, preset, mode };
}

export function validateCommand(command) {
  if (!command || typeof command !== 'object') throw new Error('Command must be an object.');
  const { kind, fileKey = FILE_KEY } = command;
  if (fileKey !== FILE_KEY) throw new Error('Commands may target only the allowlisted ClaimsFlow Figma file.');
  if (kind === 'inspect') return { kind, fileKey, nodeId: validateNodeId(command.nodeId), dryRun: Boolean(command.dryRun) };
  if (kind === 'apply') return { kind, fileKey, ...validateOperation(command), dryRun: Boolean(command.dryRun) };
  if (kind === 'remove') return { kind, fileKey, nodeId: validateNodeId(command.nodeId), preset: validateOperation({ ...command, mode: 'add' }).preset, dryRun: Boolean(command.dryRun) };
  if (kind === 'batch') {
    if (!Array.isArray(command.operations) || command.operations.length === 0) throw new Error('Batch requires at least one operation.');
    return { kind, fileKey, operations: command.operations.map(validateOperation), dryRun: Boolean(command.dryRun) };
  }
  if (kind === 'compare-experimental') return { kind, fileKey, dryRun: true };
  if (kind === 'scan-seeds') {
    if (command.pageName !== SEED_PAGE) throw new Error(`scan-seeds requires the exact page name: ${SEED_PAGE}.`);
    return { kind, fileKey, pageName: SEED_PAGE, dryRun: Boolean(command.dryRun) };
  }
  if (kind === 'rollback') return { kind, fileKey, jobId: String(command.jobId ?? '') };
  throw new Error(`Unsupported command kind: ${String(kind)}.`);
}

export function tokenMatches(actual, supplied) {
  if (typeof supplied !== 'string' || supplied.length === 0 || actual.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(supplied));
}
