import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { WebSocket, WebSocketServer } from 'ws';
import { FILE_KEY, HOST, PORT, parseJson, tokenMatches, validateCommand } from './protocol.mjs';

const token = process.env.CLAIMSFLOW_SHADER_TOKEN || randomBytes(32).toString('base64url');
const logPath = resolve(process.cwd(), 'logs', 'operations.jsonl');
const clients = new Set();
const pending = new Map();
const reports = new Map();

async function log(event) { await mkdir(dirname(logPath), { recursive: true }); await appendFile(logPath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...event })}\n`); }
function reply(response, status, value) { response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify(value)); }
function auth(request) { return tokenMatches(token, request.headers['x-claimsflow-shader-token']); }
function pluginClient() { return [...clients].find((client) => client.readyState === WebSocket.OPEN); }

async function forward(command) {
  const client = pluginClient();
  if (!client) throw new Error('No authenticated Figma Automation Mode connection. Open the plugin and enable Automation Mode.');
  const jobId = randomUUID();
  const payload = { type: 'bridge-command', jobId, command };
  const result = new Promise((resolveResult, rejectResult) => {
    const timeout = setTimeout(() => { pending.delete(jobId); rejectResult(new Error('Timed out waiting for the Figma plugin.')); }, 30000);
    pending.set(jobId, { resolve: (value) => { clearTimeout(timeout); resolveResult(value); }, reject: rejectResult });
  });
  client.send(JSON.stringify(payload));
  await log({ direction: 'bridge->plugin', jobId, command });
  const output = await result;
  reports.set(jobId, output);
  await log({ direction: 'plugin->bridge', jobId, output });
  return { jobId, ...output };
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/health') return reply(response, 200, { host: HOST, port: PORT, tokenRequired: true, pluginConnected: Boolean(pluginClient()) });
    if (request.method === 'GET' && request.url?.startsWith('/v1/reports/')) {
      if (!auth(request)) return reply(response, 401, { error: 'Invalid or missing session token.' });
      const report = reports.get(request.url.split('/').pop()); return reply(response, report ? 200 : 404, report ?? { error: 'Report not found.' });
    }
    if (request.method !== 'POST' || request.url !== '/v1/commands') return reply(response, 404, { error: 'Not found.' });
    if (!auth(request)) return reply(response, 401, { error: 'Invalid or missing session token.' });
    let body = ''; for await (const chunk of request) body += chunk;
    const command = validateCommand(parseJson(body));
    const result = await forward(command);
    return reply(response, 200, result);
  } catch (error) { await log({ direction: 'bridge', error: error instanceof Error ? error.message : String(error) }); return reply(response, 400, { error: error instanceof Error ? error.message : String(error) }); }
});

const websocket = new WebSocketServer({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url ?? '/', `http://${HOST}:${PORT}`);
  if (url.pathname !== '/plugin' || !tokenMatches(token, url.searchParams.get('token'))) { socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); socket.destroy(); return; }
  websocket.handleUpgrade(request, socket, head, (client) => websocket.emit('connection', client));
});
websocket.on('connection', (client) => {
  clients.add(client); client.send(JSON.stringify({ type: 'bridge-ready', fileKey: FILE_KEY }));
  client.on('message', async (raw) => {
    try { const message = parseJson(raw.toString()); if (message.type !== 'bridge-result' || typeof message.jobId !== 'string') throw new Error('Malformed plugin result.'); const waiter = pending.get(message.jobId); if (!waiter) return; pending.delete(message.jobId); waiter.resolve(message.result); } catch (error) { await log({ direction: 'plugin', error: error instanceof Error ? error.message : String(error) }); }
  });
  client.on('close', () => clients.delete(client));
});

server.listen(PORT, HOST, () => {
  console.log(`ClaimsFlow Shader Studio bridge listening at http://${HOST}:${PORT}`);
  console.log(`Session token: ${token}`);
  console.log('Keep this terminal private. The token authorizes native shader changes in the allowlisted ClaimsFlow file.');
});
