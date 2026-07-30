import { randomBytes } from 'node:crypto';
import { FILE_KEY, validateCommand } from './protocol.mjs';

/** In-memory bridge for tests and command-protocol development; it never contacts Figma. */
export class MockBridge {
  constructor(token = randomBytes(32).toString('base64url')) { this.token = token; this.connected = false; this.nodes = new Map(); this.log = []; }
  connect(token) { if (token !== this.token) throw new Error('Invalid or missing session token.'); this.connected = true; }
  disconnect() { this.connected = false; }
  async command(token, input) {
    if (token !== this.token) throw new Error('Invalid or missing session token.');
    if (!this.connected) throw new Error('No authenticated Figma Automation Mode connection.');
    const command = validateCommand(input);
    if (command.nodeId === '999:999') throw new Error('Mock node not found.');
    if (command.kind === 'batch') {
      const snapshot = new Map(this.nodes);
      const results = [];
      try { for (const operation of command.operations) results.push(await this.command(token, { kind: 'apply', fileKey: FILE_KEY, ...operation })); }
      catch (error) { this.nodes = snapshot; throw new Error(`Batch stopped and rolled back after failure: ${error.message}`); }
      return { dryRun: false, results };
    }
    if (command.kind === 'inspect') return { nodeId: command.nodeId, state: this.nodes.get(command.nodeId) ?? null, dryRun: true };
    if (command.kind === 'compare-experimental') return { dryRun: true, experimentalLayers: [] };
    const previous = this.nodes.get(command.nodeId);
    if (command.dryRun) return { dryRun: true, nodeId: command.nodeId, preset: command.preset, mode: command.mode ?? 'remove' };
    if (command.kind === 'remove') this.nodes.delete(command.nodeId);
    else this.nodes.set(command.nodeId, { preset: command.preset, mode: command.mode });
    const result = { nodeId: command.nodeId, preset: command.preset, mode: command.mode ?? 'remove', previous, modifiedNodeIds: [command.nodeId] };
    this.log.push({ timestamp: new Date().toISOString(), result });
    return result;
  }
}

if (process.argv.includes('--demo')) {
  const bridge = new MockBridge(); bridge.connect(bridge.token);
  console.log(`Mock bridge token: ${bridge.token}`);
  console.log(await bridge.command(bridge.token, { kind: 'apply', fileKey: FILE_KEY, nodeId: '100:104', preset: 'overview-signal-field', mode: 'update' }));
}
