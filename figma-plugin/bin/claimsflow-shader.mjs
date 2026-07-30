#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FILE_KEY } from '../bridge/protocol.mjs';
import { SEED_PAGE, validateRegistry } from '../bridge/registry.mjs';

const args = process.argv.slice(2);
const take = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const has = (name) => args.includes(name);
const command = args[0];
const token = take('--token') || process.env.CLAIMSFLOW_SHADER_TOKEN;
const endpoint = 'http://127.0.0.1:3847';

async function request(path, method = 'GET', body) {
  const response = await fetch(`${endpoint}${path}`, { method, headers: { ...(token ? { 'x-claimsflow-shader-token': token } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? `Bridge request failed (${response.status}).`); return payload;
}
function requireToken() { if (!token) throw new Error('Provide --token or set CLAIMSFLOW_SHADER_TOKEN.'); }

try {
  if (command === 'status') console.log(JSON.stringify(await request('/health'), null, 2));
  else if (command === 'inspect') { requireToken(); console.log(JSON.stringify(await request('/v1/commands', 'POST', { kind: 'inspect', fileKey: FILE_KEY, nodeId: take('--node-id'), dryRun: has('--dry-run') }), null, 2)); }
  else if (command === 'apply' || command === 'remove') { requireToken(); console.log(JSON.stringify(await request('/v1/commands', 'POST', { kind: command, fileKey: FILE_KEY, nodeId: take('--node-id'), preset: take('--preset'), mode: take('--mode'), dryRun: has('--dry-run') }), null, 2)); }
  else if (command === 'apply-batch') { requireToken(); const job = JSON.parse(await readFile(take('--job'), 'utf8')); console.log(JSON.stringify(await request('/v1/commands', 'POST', { kind: 'batch', ...job, dryRun: has('--dry-run') }), null, 2)); }
  else if (command === 'screenshot-report') { requireToken(); console.log(JSON.stringify(await request(`/v1/reports/${encodeURIComponent(take('--job-id') ?? '')}`), null, 2)); }
  else if (command === 'compare-experimental') { requireToken(); console.log(JSON.stringify(await request('/v1/commands', 'POST', { kind: 'compare-experimental', fileKey: FILE_KEY }), null, 2)); }
  else if (command === 'scan-seeds') {
    requireToken();
    const pageName = take('--page') ?? SEED_PAGE;
    const response = await request('/v1/commands', 'POST', { kind: 'scan-seeds', fileKey: FILE_KEY, pageName });
    if (!response.ok || !response.result) throw new Error(response.error ?? 'Seed scan failed.');
    const registry = validateRegistry(response.result?.result ?? response.result);
    const outputPath = resolve(process.cwd(), 'presets', 'generated-shader-registry.json');
    await mkdir(resolve(process.cwd(), 'presets'), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ ...response, registryPath: outputPath }, null, 2));
  }
  else if (command === 'verify-registry') {
    const registryPath = resolve(process.cwd(), 'presets', 'generated-shader-registry.json');
    const registry = validateRegistry(JSON.parse(await readFile(registryPath, 'utf8')));
    console.log(JSON.stringify({ ok: true, registryPath, pageName: registry.pageName, seeds: registry.seeds.length }, null, 2));
  }
  else throw new Error('Usage: claimsflow-shader status | inspect | apply | apply-batch | remove | scan-seeds | verify-registry | screenshot-report | compare-experimental');
} catch (error) { console.error(`claimsflow-shader: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
