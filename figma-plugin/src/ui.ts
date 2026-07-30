type ShaderType = 'fill' | 'effect';
type UiShader = { id: string; name: string; type: ShaderType; imported: boolean; propertyDefinitions?: Record<string, { name: string; type: string; defaultValue?: unknown; description?: string }> };
type Preset = { name: string; shaderNames: string[]; type: ShaderType; values: Record<string, unknown>; opacity?: number; blendMode?: string; visible?: boolean };

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root is missing.');
const root = app;

let shaders: UiShader[] = [];
let selected: UiShader | undefined;
let presets: Preset[] = [];
let values: Record<string, unknown> = {};
let automationSocket: WebSocket | undefined;
let automationConnected = false;
let automationEnabled = false;
let automationToken = '';

const blendModes = ['NORMAL', 'DARKEN', 'MULTIPLY', 'LINEAR_BURN', 'COLOR_BURN', 'LIGHTEN', 'SCREEN', 'LINEAR_DODGE', 'COLOR_DODGE', 'OVERLAY', 'SOFT_LIGHT', 'HARD_LIGHT', 'DIFFERENCE', 'EXCLUSION', 'HUE', 'SATURATION', 'COLOR', 'LUMINOSITY'];
const send = (message: object) => parent.postMessage({ pluginMessage: message }, '*');
const esc = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] ?? char));
const json = (value: unknown) => JSON.stringify(value ?? null);

function propertyControl(id: string, definition: NonNullable<UiShader['propertyDefinitions']>[string]): string {
  const value = values[id] ?? definition.defaultValue;
  const label = `<label><strong>${esc(definition.name)}</strong><small>${esc(definition.type)} · ${esc(id)}${definition.description ? ` · ${esc(definition.description)}` : ''}</small>`;
  if (definition.type === 'BOOLEAN') return `${label}<input data-property="${esc(id)}" type="checkbox" ${value ? 'checked' : ''}></label>`;
  if (definition.type === 'NUMBER') return `${label}<input data-property="${esc(id)}" type="number" step="any" value="${typeof value === 'number' ? value : 0}"></label>`;
  if (definition.type === 'TEXT') return `${label}<input data-property="${esc(id)}" type="text" value="${esc(typeof value === 'string' ? value : '')}"></label>`;
  if (definition.type === 'COLOR') {
    const color = value as { r?: number; g?: number; b?: number } | undefined;
    const hex = color ? `#${[color.r, color.g, color.b].map((channel) => Math.round((channel ?? 0) * 255).toString(16).padStart(2, '0')).join('')}` : '#000000';
    return `${label}<input data-property="${esc(id)}" type="color" value="${hex}"></label>`;
  }
  const hint = ['POINT', 'LINE', 'CIRCLE', 'CIRCLE_POINT', 'COLOR_POINT', 'GRADIENT'].includes(definition.type) ? 'Structured property (editable JSON)' : 'Author asset/slot property (JSON or variable alias)';
  return `${label}<textarea data-property="${esc(id)}" data-json="true" aria-label="${esc(definition.name)} JSON">${esc(json(value))}</textarea><small>${hint}</small></label>`;
}

function render(): void {
  const query = (document.querySelector<HTMLInputElement>('#search')?.value ?? '').toLowerCase();
  const visible = shaders.filter((shader) => `${shader.name} ${shader.id}`.toLowerCase().includes(query));
  const list = (type: ShaderType) => visible.filter((shader) => shader.type === type).map((shader) => `<button class="shader ${selected?.id === shader.id ? 'selected' : ''}" data-shader="${esc(shader.id)}"><span>${esc(shader.name)}</span><small>${shader.imported ? 'Imported' : 'Library'} · ${esc(shader.id)}</small></button>`).join('') || '<p class="empty">No matching shaders.</p>';
  root.innerHTML = `<header><div><h1>ClaimsFlow Shader Studio</h1><p>Native shaders only. Preview never modifies the document.</p></div><button id="refresh" class="quiet">Refresh</button></header>
    <label class="search"><span>Search shaders</span><input id="search" placeholder="Name or shader ID" value="${esc(query)}"></label>
    <section class="shader-list"><h2>Fill shaders</h2>${list('fill')}<h2>Effect shaders</h2>${list('effect')}</section>
    <section id="editor">${selected ? editor() : '<p class="empty">Choose a shader to load its author-defined properties.</p>'}</section>
    <section class="presets"><h2>ClaimsFlow presets</h2><div>${presets.map((preset, index) => `<button data-preset="${index}" class="preset">${esc(preset.name)}<small>${esc(preset.type)} · ${esc(preset.shaderNames.join(' / '))}</small></button>`).join('')}</div><label>Preset JSON<textarea id="preset-json" placeholder="Copy or paste a preset JSON object"></textarea></label><div class="row"><button id="copy-preset">Copy selected</button><button id="import-preset">Load JSON</button><button id="export-preset">Export JSON</button></div></section>
    <section class="automation"><h2>Automation Mode</h2><p>Connects only to the local bridge at 127.0.0.1:3847. Commands remain limited to this ClaimsFlow file.</p><label>Session token<input id="automation-token" type="password" autocomplete="off" placeholder="Bridge session token" value="${esc(automationToken)}"></label><div class="row"><button id="automation-connect" class="primary">${automationConnected ? 'Reconnect' : 'Enable Automation Mode'}</button><button id="automation-disconnect">Disconnect</button></div><small id="automation-state">${automationConnected ? 'Connected to local bridge.' : automationEnabled ? 'Reconnecting to local bridge…' : 'Not connected.'}</small></section><p id="status" role="status"></p>`;
  bind();
}

function editor(): string {
  const defs = Object.entries(selected?.propertyDefinitions ?? {}).map(([id, def]) => propertyControl(id, def)).join('') || '<p class="empty">This shader has no author-defined properties.</p>';
  return `<h2>${esc(selected?.name ?? '')}</h2><p class="meta">${esc(selected?.type ?? '')} shader · ${selected?.imported ? 'Imported' : 'Will import on apply'} · ${esc(selected?.id ?? '')}</p><div class="properties">${defs}</div>
  <div class="row fill-options ${selected?.type === 'fill' ? '' : 'hidden'}"><label>Opacity<input id="opacity" type="number" min="0" max="1" step="0.01" value="1"></label><label>Blend mode<select id="blend-mode">${blendModes.map((mode) => `<option>${mode}</option>`).join('')}</select></label></div>
  <label class="check"><input id="visible" type="checkbox" checked> Visible</label><label>Action<select id="operation"><option value="add">Add (preserve existing)</option><option value="replace">Replace (removes existing ${selected?.type === 'fill' ? 'fills' : 'effects'})</option><option value="update">Update matching shader</option><option value="remove">Remove matching shader</option><option value="reset">Reset to author defaults</option></select></label>
  <div class="row"><button id="preview">Preview</button><button id="apply" class="primary">Apply</button></div>`;
}

function readProperties(): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-property]').forEach((input) => {
    const id = input.dataset.property!;
    if (input instanceof HTMLInputElement && input.type === 'checkbox') next[id] = input.checked;
    else if (input instanceof HTMLInputElement && input.type === 'number') next[id] = Number(input.value);
    else if (input instanceof HTMLInputElement && input.type === 'color') { const hex = input.value.slice(1); next[id] = { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255 }; }
    else if (input.dataset.json) { try { next[id] = JSON.parse(input.value); } catch { throw new Error(`Property ${id} needs valid JSON.`); } }
    else next[id] = input.value;
  });
  return next;
}

function setStatus(message: string, kind = ''): void { const status = document.querySelector('#status'); if (status) { status.textContent = message; status.className = kind; } }

function bind(): void {
  document.querySelector('#refresh')?.addEventListener('click', () => send({ type: 'refresh' }));
  document.querySelector('#search')?.addEventListener('input', render);
  document.querySelectorAll<HTMLButtonElement>('[data-shader]').forEach((button) => button.addEventListener('click', () => send({ type: 'select-shader', shaderId: button.dataset.shader })));
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.addEventListener('click', () => send({ type: 'preset', preset: presets[Number(button.dataset.preset)] })));
  const action = (preview: boolean) => { try { if (!selected) throw new Error('Select a shader first.'); const presetName = document.querySelector<HTMLTextAreaElement>('#preset-json')?.dataset.presetName; send({ type: 'apply', shaderId: selected.id, operation: (document.querySelector<HTMLSelectElement>('#operation')?.value ?? 'add'), properties: readProperties(), opacity: Number(document.querySelector<HTMLInputElement>('#opacity')?.value ?? 1), blendMode: document.querySelector<HTMLSelectElement>('#blend-mode')?.value ?? 'NORMAL', visible: document.querySelector<HTMLInputElement>('#visible')?.checked ?? true, preview, presetName }); } catch (error) { setStatus(error instanceof Error ? error.message : String(error), 'error'); } };
  document.querySelector('#preview')?.addEventListener('click', () => action(true)); document.querySelector('#apply')?.addEventListener('click', () => action(false));
  document.querySelector('#copy-preset')?.addEventListener('click', async () => { if (!selected) return setStatus('Select a shader first.', 'error'); const preset = { name: `Custom ${selected.name}`, shaderNames: [selected.name], type: selected.type, values: readProperties(), opacity: Number(document.querySelector<HTMLInputElement>('#opacity')?.value ?? 1), blendMode: document.querySelector<HTMLSelectElement>('#blend-mode')?.value, visible: document.querySelector<HTMLInputElement>('#visible')?.checked ?? true }; await navigator.clipboard.writeText(JSON.stringify(preset, null, 2)); setStatus('Preset JSON copied.'); });
  document.querySelector('#import-preset')?.addEventListener('click', () => { try { const raw = document.querySelector<HTMLTextAreaElement>('#preset-json')?.value ?? ''; send({ type: 'preset', preset: JSON.parse(raw) }); } catch { setStatus('Preset JSON is invalid.', 'error'); } });
  document.querySelector('#export-preset')?.addEventListener('click', () => { const raw = document.querySelector<HTMLTextAreaElement>('#preset-json')?.value; if (raw) { const blob = new Blob([raw], { type: 'application/json' }); const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = 'claimsflow-shader-preset.json'; anchor.click(); URL.revokeObjectURL(anchor.href); } });
  document.querySelector('#automation-connect')?.addEventListener('click', () => {
    automationToken = document.querySelector<HTMLInputElement>('#automation-token')?.value.trim() ?? '';
    if (!automationToken) return setStatus('Enter the bridge session token first.', 'error');
    automationEnabled = true;
    connectAutomation();
  });
  document.querySelector('#automation-disconnect')?.addEventListener('click', () => { automationEnabled = false; automationSocket?.close(); automationSocket = undefined; automationConnected = false; render(); });
}

function connectAutomation(): void {
    automationSocket?.close();
    automationSocket = new WebSocket(`ws://localhost:3847/plugin?token=${encodeURIComponent(automationToken)}`);
    automationSocket.onopen = () => { automationConnected = true; render(); setStatus('Automation Mode connected.'); };
    automationSocket.onclose = () => { automationConnected = false; render(); if (automationEnabled) window.setTimeout(connectAutomation, 1000); };
    automationSocket.onerror = () => setStatus('Automation Mode could not connect. Check bridge status, token, and Figma CSP.', 'error');
    automationSocket.onmessage = (event) => {
      try { const message = JSON.parse(String(event.data)); if (message.type === 'bridge-command') send({ type: 'automation-command', jobId: message.jobId, command: message.command }); } catch { setStatus('Bridge sent an invalid message.', 'error'); }
    };
}

window.onmessage = (event: MessageEvent<{ pluginMessage: { type: string; [key: string]: unknown } }>) => {
  const message = event.data.pluginMessage; if (!message) return;
  if (message.type === 'shaders') { shaders = message.shaders as UiShader[]; render(); }
  if (message.type === 'presets') { presets = message.presets as Preset[]; render(); }
  if (message.type === 'shader-ready') { const shader = message.shader as UiShader; shaders = shaders.map((item) => item.id === shader.id ? shader : item); selected = shader; values = {}; render(); setStatus(`${shader.name} is ready.`); }
  if (message.type === 'preset-ready') { const shader = message.shader as UiShader; selected = shader; values = message.properties as Record<string, unknown>; render(); const input = document.querySelector<HTMLTextAreaElement>('#preset-json'); if (input) { input.value = JSON.stringify(message.preset, null, 2); input.dataset.presetName = (message.preset as Preset).name; } setStatus(`Preset ready: ${(message.preset as Preset).name}. Preview before applying.`); }
  if (message.type === 'error') setStatus(String(message.message), 'error');
  if (message.type === 'automation-result') {
    if (!automationSocket || automationSocket.readyState !== WebSocket.OPEN) return;
    automationSocket.send(JSON.stringify({ type: 'bridge-result', jobId: message.jobId, result: message.result }));
  }
  if (message.type === 'preview' || message.type === 'applied') setStatus(String(message.message), message.type === 'applied' ? 'success' : '');
};

send({ type: 'all-presets' });
