import { CLAIMSFLOW_PRESETS, type ShaderPreset } from './presets';
import { CAPTURED_SEED_BY_KEY, setCapturedRegistry, type CapturedShaderRegistry } from './shader-registry';

figma.showUI(__html__, { width: 480, height: 720, title: 'ClaimsFlow Shader Studio', themeColors: true });

type Operation = 'add' | 'replace' | 'update' | 'remove' | 'reset';
type SerializedShader = Pick<Shader, 'id' | 'name' | 'type' | 'imported' | 'propertyDefinitions'>;
type PropertyMap = Record<string, ShaderPropertyValue>;

let shaders: Shader[] = [];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isTextLayer(node: SceneNode): boolean {
  return node.type === 'TEXT' || node.type === 'TEXT_PATH';
}

function supportsFills(node: SceneNode): node is SceneNode & MinimalFillsMixin {
  return !isTextLayer(node) && 'fills' in node;
}

function supportsEffects(node: SceneNode): node is SceneNode & BlendMixin {
  return !isTextLayer(node) && 'effects' in node;
}

function selectedNodes(type: Shader['type']): Array<(SceneNode & (MinimalFillsMixin | BlendMixin))> {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) throw new Error('Select one or more supported non-text layers before applying a shader.');
  const unsupported = selection.filter((node) => type === 'fill' ? !supportsFills(node) : !supportsEffects(node));
  if (unsupported.length) throw new Error(`Unsupported selection: ${unsupported.map((n) => `${n.name} (${n.type})`).join(', ')}. Text layers and nodes without ${type === 'fill' ? 'fills' : 'effects'} are not supported.`);
  return selection as Array<(SceneNode & (MinimalFillsMixin | BlendMixin))>;
}

function send(type: string, payload: object = {}): void { figma.ui.postMessage({ type, ...payload }); }

async function refreshShaders(): Promise<void> {
  shaders = await figma.listAvailableShaders();
  send('shaders', { shaders: shaders.map((shader): SerializedShader => ({ id: shader.id, name: shader.name, type: shader.type, imported: shader.imported, propertyDefinitions: shader.propertyDefinitions })) });
}

async function requireShader(id: string): Promise<Shader> {
  const shader = shaders.find((candidate) => candidate.id === id);
  const ready = shader ? (shader.imported ? shader : await figma.importShaderById(shader.id)) : await figma.importShaderById(id);
  shaders = shaders.map((candidate) => candidate.id === ready.id ? ready : candidate);
  send('shader-ready', { shader: ready });
  return ready;
}

function defaults(shader: Shader): PropertyMap {
  return Object.fromEntries(Object.entries(shader.propertyDefinitions ?? {}).flatMap(([id, definition]) => definition.defaultValue === undefined ? [] : [[id, definition.defaultValue]])) as PropertyMap;
}

function nameLayer(node: SceneNode, presetName?: string): void {
  if (presetName) node.name = `FX/NativeShader/${presetName}`;
}

function applyFill(node: SceneNode & MinimalFillsMixin, shader: Shader, properties: PropertyMap, operation: Operation, opacity: number, visible: boolean, blendMode: BlendMode, presetName?: string): void {
  const existing = node.fills === figma.mixed ? [] : [...node.fills];
  const index = existing.findIndex((paint) => paint.type === 'SHADER' && paint.id === shader.id);
  if (operation === 'remove') { node.fills = existing.filter((paint) => !(paint.type === 'SHADER' && paint.id === shader.id)); return; }
  const paint: ShaderPaint = { type: 'SHADER', id: shader.id, properties: operation === 'reset' ? defaults(shader) : properties, opacity, visible, blendMode };
  if (operation === 'replace') node.fills = [paint];
  else if (index >= 0) { existing[index] = paint; node.fills = existing; }
  else node.fills = [...existing, paint];
  nameLayer(node, presetName);
}

function applyEffect(node: SceneNode & BlendMixin, shader: Shader, properties: PropertyMap, operation: Operation, visible: boolean, presetName?: string): void {
  const existing = [...node.effects];
  const index = existing.findIndex((effect) => effect.type === 'SHADER' && effect.id === shader.id);
  if (operation === 'remove') { node.effects = existing.filter((effect) => !(effect.type === 'SHADER' && effect.id === shader.id)); return; }
  const effect: ShaderEffect = { type: 'SHADER', id: shader.id, visible, properties: operation === 'reset' ? defaults(shader) : properties };
  if (operation === 'replace') node.effects = [effect];
  else if (index >= 0) { existing[index] = effect; node.effects = existing; }
  else node.effects = [...existing, effect];
  nameLayer(node, presetName);
}

function parsePreset(value: unknown): ShaderPreset {
  if (!value || typeof value !== 'object') throw new Error('Preset JSON must be an object.');
  const preset = value as ShaderPreset;
  if (!preset.name || !Array.isArray(preset.shaderNames) || !preset.registryLayer || (preset.type !== 'fill' && preset.type !== 'effect')) throw new Error('Preset JSON requires name, shaderNames, registryLayer, and type.');
  return preset;
}

function jsonSafe(value: unknown): unknown {
  try { return JSON.parse(JSON.stringify(value)); } catch { return {}; }
}

async function scanSeedPage(pageName: string): Promise<CapturedShaderRegistry> {
  if (pageName !== 'INTERNAL / Native Shader Seeds') throw new Error('Seed scans are restricted to the exact INTERNAL / Native Shader Seeds page.');
  const page = figma.root.children.find((candidate) => candidate.name === pageName);
  if (!page) throw new Error(`Page not found: ${pageName}.`);
  const wanted = new Set(['Seed / Mesh Gradient', 'Seed / Glowing Wave', 'Seed / Pattern Grid', 'Seed / Water Caustic', 'Seed / Bloom', 'Seed / Chromatic Metal']);
  const seeds: CapturedShaderRegistry['seeds'] = [];
  for (const node of page.findAll((candidate) => wanted.has(candidate.name))) {
    const entries: Array<{ slotType: 'fill' | 'stroke' | 'effect'; entry: Paint | Effect }> = [];
    if ('fills' in node && node.fills !== figma.mixed) for (const entry of node.fills) entries.push({ slotType: 'fill', entry });
    if ('strokes' in node) for (const entry of node.strokes) entries.push({ slotType: 'stroke', entry });
    if ('effects' in node) for (const entry of node.effects) entries.push({ slotType: 'effect', entry });
    const shaderEntries = entries.filter(({ entry }) => entry.type === 'SHADER') as Array<{ slotType: 'fill' | 'stroke' | 'effect'; entry: ShaderPaint | ShaderEffect }>;
    if (shaderEntries.length === 0) throw new Error(`Seed ${node.name} (${node.id}) does not contain a real SHADER paint or effect.`);
    for (const { slotType, entry } of shaderEntries) seeds.push({ layerName: node.name, shaderId: entry.id, entryType: 'SHADER', slotType, properties: jsonSafe(entry.properties) as Record<string, unknown>, visible: entry.visible ?? true, sourceNodeId: node.id });
  }
  for (const name of wanted) if (!seeds.some((seed) => seed.layerName === name)) throw new Error(`Required shader seed layer is missing or has no real SHADER entry: ${name}.`);
  const registry: CapturedShaderRegistry = { pageName, capturedAt: new Date().toISOString(), seeds };
  setCapturedRegistry(registry);
  await figma.clientStorage.setAsync('claimsflow-native-shader-registry', registry);
  return registry;
}

async function loadCapturedRegistry(): Promise<void> {
  const stored = await figma.clientStorage.getAsync('claimsflow-native-shader-registry') as CapturedShaderRegistry | undefined;
  if (stored?.pageName === 'INTERNAL / Native Shader Seeds' && Array.isArray(stored.seeds)) setCapturedRegistry(stored);
}

type AutomationCommand =
  | { kind: 'inspect'; fileKey: string; nodeId: string; dryRun?: boolean }
  | { kind: 'apply'; fileKey: string; nodeId: string; preset: string; mode: 'add' | 'replace' | 'update'; dryRun?: boolean }
  | { kind: 'remove'; fileKey: string; nodeId: string; preset: string; dryRun?: boolean }
  | { kind: 'batch'; fileKey: string; operations: Array<{ nodeId: string; preset: string; mode: 'add' | 'replace' | 'update' }>; dryRun?: boolean }
  | { kind: 'compare-experimental'; fileKey: string }
  | { kind: 'scan-seeds'; fileKey: string; pageName: string; dryRun?: boolean };

const CLAIMSFLOW_FILE_KEY = 'M7GOuna2hq7jWCGTZhiP5b';
const nodeIdPattern = /^\d+:\d+$/;

function assertAutomationFile(fileKey: string): void {
  // Development plugins may expose `undefined` for fileKey. The bridge still
  // authenticates and allowlists the command; when Figma exposes its key, we
  // enforce the second independent check as well.
  if (fileKey !== CLAIMSFLOW_FILE_KEY || (figma.fileKey !== undefined && figma.fileKey !== CLAIMSFLOW_FILE_KEY)) throw new Error('Automation is limited to the allowlisted ClaimsFlow Figma file.');
}

async function automationNode(nodeId: string): Promise<SceneNode> {
  if (!nodeIdPattern.test(nodeId)) throw new Error('Invalid Figma node ID.');
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE' || isTextLayer(node as SceneNode)) throw new Error(`Node ${nodeId} is missing, unsupported, or a text layer.`);
  return node as SceneNode;
}

async function presetShader(slug: string): Promise<{ preset: ShaderPreset; shader: Shader; properties: PropertyMap }> {
  const preset = CLAIMSFLOW_PRESETS.find((candidate) => candidate.slug === slug);
  if (!preset) throw new Error(`Unknown ClaimsFlow preset: ${slug}.`);
  const captured = CAPTURED_SEED_BY_KEY[preset.registryLayer];
  if (!captured || captured.entryType !== 'SHADER' || (captured.slotType !== preset.type && !(preset.type === 'fill' && captured.slotType === 'stroke'))) throw new Error(`No verified native shader seed is registered for ${preset.registryLayer}. Run scan-seeds first.`);
  const shader = await requireShader(captured.shaderId);
  const properties = Object.fromEntries(Object.entries(shader.propertyDefinitions ?? {}).flatMap(([id, definition]) => Object.prototype.hasOwnProperty.call(preset.values, definition.name) ? [[id, preset.values[definition.name] as ShaderPropertyValue]] : definition.defaultValue === undefined ? [] : [[id, definition.defaultValue]])) as PropertyMap;
  return { preset, shader, properties };
}

function snapshot(node: SceneNode): { fills?: Paint[]; effects?: Effect[]; preset: string; config: string } {
  return {
    ...(supportsFills(node) && node.fills !== figma.mixed ? { fills: [...node.fills] } : {}),
    ...(supportsEffects(node) ? { effects: [...node.effects] } : {}),
    preset: node.getPluginData('claimsflow-native-shader-preset'),
    config: node.getPluginData('claimsflow-native-shader-config')
  };
}

function restore(node: SceneNode, state: ReturnType<typeof snapshot>): void {
  if (state.fills && supportsFills(node)) node.fills = state.fills;
  if (state.effects && supportsEffects(node)) node.effects = state.effects;
  node.setPluginData('claimsflow-native-shader-preset', state.preset);
  node.setPluginData('claimsflow-native-shader-config', state.config);
}

async function executeAutomation(command: AutomationCommand): Promise<object> {
  assertAutomationFile(command.fileKey);
  if (command.kind === 'scan-seeds') return scanSeedPage(command.pageName);
  if (command.kind === 'inspect') {
    const node = await automationNode(command.nodeId);
    return { dryRun: true, nodeId: node.id, name: node.name, type: node.type, fills: supportsFills(node) && node.fills !== figma.mixed ? node.fills.filter((paint) => paint.type === 'SHADER') : [], effects: supportsEffects(node) ? node.effects.filter((effect) => effect.type === 'SHADER') : [], preset: node.getPluginData('claimsflow-native-shader-preset') };
  }
  if (command.kind === 'compare-experimental') {
    const matches = figma.currentPage.findAll((node) => /^(FX3|FX4|FX5)\//.test(node.name)).map((node) => ({ id: node.id, name: node.name, type: node.type }));
    return { dryRun: true, message: 'Comparison only. No experimental layers were changed.', experimentalLayers: matches };
  }
  if (command.kind === 'batch') {
    const completed: Array<{ nodeId: string; snapshot: ReturnType<typeof snapshot> }> = [];
    const results: object[] = [];
    try {
      for (const operation of command.operations) {
        const node = await automationNode(operation.nodeId);
        if (!command.dryRun) completed.push({ nodeId: node.id, snapshot: snapshot(node) });
        results.push(await executeAutomation({ kind: 'apply', fileKey: command.fileKey, ...operation, dryRun: command.dryRun }));
      }
      return { dryRun: Boolean(command.dryRun), results };
    } catch (error) {
      for (const item of completed.reverse()) restore(await automationNode(item.nodeId), item.snapshot);
      throw new Error(`Batch stopped and rolled back after failure: ${errorMessage(error)}`);
    }
  }
  const node = await automationNode(command.nodeId);
  const { preset, shader, properties } = await presetShader(command.preset);
  const mode: Operation = command.kind === 'remove' ? 'remove' : command.mode;
  if (command.dryRun) return { dryRun: true, nodeId: node.id, preset: preset.slug, shaderId: shader.id, shaderType: shader.type, properties, mode };
  const before = snapshot(node);
  if (shader.type === 'fill') {
    if (!supportsFills(node)) throw new Error(`Node ${node.id} does not support fills.`);
    applyFill(node, shader, properties, mode, preset.opacity ?? 1, preset.visible ?? true, preset.blendMode ?? 'NORMAL', preset.name);
  } else {
    if (!supportsEffects(node)) throw new Error(`Node ${node.id} does not support effects.`);
    applyEffect(node, shader, properties, mode, preset.visible ?? true, preset.name);
  }
  node.setPluginData('claimsflow-native-shader-preset', command.preset);
  node.setPluginData('claimsflow-native-shader-config', JSON.stringify({ shaderId: shader.id, shaderType: shader.type, properties, mode }));
  figma.commitUndo();
  return { dryRun: false, nodeId: node.id, modifiedNodeIds: [node.id], shaderId: shader.id, shaderType: shader.type, properties, mode, previous: before };
}

figma.ui.onmessage = async (message: { type: string; [key: string]: unknown }) => {
  try {
    if (message.type === 'refresh') await refreshShaders();
    if (message.type === 'select-shader') await requireShader(String(message.shaderId));
    if (message.type === 'selection') send('selection', { count: figma.currentPage.selection.length, names: figma.currentPage.selection.map((node) => `${node.name} (${node.type})`) });
    if (message.type === 'apply') {
      const shader = await requireShader(String(message.shaderId));
      const operation = message.operation as Operation;
      const properties = (message.properties ?? {}) as PropertyMap;
      const nodes = selectedNodes(shader.type);
      if (message.preview === true) { send('preview', { message: `Preview ready: ${shader.name} will ${operation} on ${nodes.length} selected layer(s). No document changes were made.` }); return; }
      for (const node of nodes) {
        if (shader.type === 'fill') applyFill(node as SceneNode & MinimalFillsMixin, shader, properties, operation, Number(message.opacity ?? 1), Boolean(message.visible ?? true), (message.blendMode ?? 'NORMAL') as BlendMode, message.presetName as string | undefined);
        else applyEffect(node as SceneNode & BlendMixin, shader, properties, operation, Boolean(message.visible ?? true), message.presetName as string | undefined);
      }
      figma.commitUndo();
      send('applied', { message: `${shader.name} ${operation} completed on ${nodes.length} layer(s).` });
    }
    if (message.type === 'preset') {
      const preset = parsePreset(message.preset);
      const resolved = await presetShader(preset.slug ?? '');
      send('preset-ready', { preset, shader: resolved.shader, properties: resolved.properties });
    }
    if (message.type === 'all-presets') send('presets', { presets: CLAIMSFLOW_PRESETS });
    if (message.type === 'automation-command') {
      const result = await executeAutomation(message.command as AutomationCommand);
      send('automation-result', { jobId: message.jobId, result: { ok: true, result } });
    }
  } catch (error) {
    if (message.type === 'automation-command') send('automation-result', { jobId: message.jobId, result: { ok: false, error: errorMessage(error) } });
    else send('error', { message: errorMessage(error) });
  }
};

loadCapturedRegistry().catch((error) => send('error', { message: `Could not load captured shader registry: ${errorMessage(error)}` }));
refreshShaders().catch((error) => send('error', { message: `Could not list native shaders: ${errorMessage(error)}` }));
