# ClaimsFlow Shader Studio

Private local Figma plugin for safely discovering, configuring, previewing, and applying **native Figma shaders** to selected ClaimsFlow layers. It never creates visual approximations, raster images, SVGs, gradients, blur stacks, or extra child layers.

## What it does

- Calls `figma.listAvailableShaders()` immediately on open and groups the account/file shader library into fill and effect shaders.
- Imports a library shader with `figma.importShaderById()` before configuration or application.
- Builds controls from the imported shader's `propertyDefinitions`, using definition IDs as property-map keys.
- Adds, replaces, updates, removes, or resets a native `ShaderPaint` / `ShaderEffect` on the current selection.
- Preserves existing fills and effects by default. **Replace** is explicit and removes the target collection.
- Rejects text layers and nodes that do not support the requested collection. It only touches the current selection; effects are never applied recursively.
- Preview is a dry-run message only. The document changes only after **Apply**.
- Includes the readable local preset definitions in [`src/presets.ts`](src/presets.ts), plus copy/paste and JSON export/import.

## Setup

From this directory:

```bash
npm install
npm run build
```

For development rebuilds:

```bash
npm run watch
```

The plugin pins the current official Figma plugin typings through `@figma/plugin-typings` and enables strict TypeScript checks:

```bash
npm run typecheck
```

## Local Automation Bridge

Automation Mode is deliberately local and narrow: the bridge binds only to `127.0.0.1:3847`, creates a fresh random token each time it starts, accepts no JavaScript, and only forwards allowlisted typed commands for the ClaimsFlow Figma file key `M7GOuna2hq7jWCGTZhiP5b`. Figma's manifest validator accepts the development hostname as `localhost`; the bridge itself remains bound to the loopback IP.

Start it in a private terminal:

```bash
npm run bridge
```

Copy the printed session token. It is never written to the repository. In the open plugin, expand **Automation Mode**, paste the token, and choose **Enable Automation Mode**. The UI opens `ws://127.0.0.1:3847/plugin`; the bridge verifies the token before it forwards any message to the plugin main thread.

The bridge saves timestamped JSONL operation records in `logs/operations.jsonl` (ignored by Git). Commands are sequential; a failed batch stops and rolls back its completed changes. No command deletes a node. The experimental `FX3/`, `FX4/`, and `FX5/` layers are only discovered by `compare-experimental`; they are never changed.

### CLI

Use the token printed by the bridge, or set it for the current shell:

```powershell
$env:CLAIMSFLOW_SHADER_TOKEN = 'token-from-bridge'
```

For the exact `claimsflow-shader` command name during local development, run `npm link` once from this directory. You can also use `node bin/claimsflow-shader.mjs` without linking.

```bash
claimsflow-shader status
claimsflow-shader inspect --node-id 100:104 --token TOKEN
claimsflow-shader apply --node-id 100:104 --preset overview-signal-field --mode replace --token TOKEN --dry-run
claimsflow-shader apply-batch --job jobs/claimsflow-masterpass.json --token TOKEN --dry-run
claimsflow-shader remove --node-id 100:104 --preset overview-signal-field --token TOKEN
claimsflow-shader screenshot-report --job-id JOB_ID --token TOKEN
claimsflow-shader compare-experimental --token TOKEN
claimsflow-shader scan-seeds --page "INTERNAL / Native Shader Seeds" --token TOKEN
claimsflow-shader verify-registry
```

`status` reports bridge health only and does not inspect or change Figma. Every command that reaches Figma requires a token. Start with `--dry-run`; it validates the file key, node ID, preset, and native shader availability without modifying the document.

### Native Shader Seed Capture

Keep the seed page separate from production screens. After opening the plugin with Automation Mode enabled, run:

```powershell
claimsflow-shader scan-seeds --page "INTERNAL / Native Shader Seeds" --token TOKEN
claimsflow-shader verify-registry
```

`scan-seeds` requires the exact page name, recursively inspects only the six allowlisted `Seed / …` layers, and writes [`presets/generated-shader-registry.json`](presets/generated-shader-registry.json). Each entry must be a genuine `SHADER` paint/effect and records its shader ID, slot type, current properties, visibility, layer name, and source node ID. A missing, duplicate, or non-SHADER seed is rejected. Preset resolution uses the captured shader IDs; it does not search `listAvailableShaders()` by display name. The seed page is read-only and is never included in exports.

### ClaimsFlow batch job

The requested master-pass job is stored at [`jobs/claimsflow-masterpass.json`](jobs/claimsflow-masterpass.json). After reviewing its dry run:

```bash
claimsflow-shader apply-batch --job jobs/claimsflow-masterpass.json --token TOKEN --dry-run
claimsflow-shader apply-batch --job jobs/claimsflow-masterpass.json --token TOKEN
```

The plugin resolves every target using `figma.getNodeByIdAsync`. It applies native `SHADER` paints/effects to those selected target nodes only, retains child text and controls, respects each node's clipping, and never traverses descendants to apply effects. A successful operation records the preset and native shader configuration in plugin data so Update replaces the existing preset rather than duplicating it.

### Mock bridge and tests

No Figma session is needed for the protocol test double:

```bash
node bridge/mock.mjs --demo
npm test
```

Tests cover command validation, bad tokens, wrong file keys, invalid node IDs, reconnect, duplicate updates, and mock batch rollback.

### WebSocket / CSP troubleshooting

- Rebuild after changing the manifest: `npm run build`, then re-import the local `manifest.json` in Figma.
- The manifest permits only the validator-compatible localhost development endpoints. If Figma reports a CSP failure, confirm the plugin was re-imported from this folder and the bridge runs on port `3847`.
- Confirm the bridge uses `127.0.0.1`, not `localhost` on another interface: `claimsflow-shader status`.
- A `401` means the session token is missing, stale, or belongs to a previous bridge process. Restart the bridge and reconnect Automation Mode with the new token.
- “No authenticated Figma Automation Mode connection” means the plugin UI is not open, Automation Mode is disconnected, or Figma was restarted.

## Load locally in Figma

1. Build the plugin with `npm run build`.
2. In the Figma desktop app, open **Plugins → Development → Import plugin from manifest…**.
3. Select [`manifest.json`](manifest.json) from this folder.
4. Open a Figma design file, select a non-text design layer, then run **Plugins → Development → ClaimsFlow Shader Studio**.
5. Choose a shader, inspect the author-defined property controls, use **Preview**, then choose **Apply** only when ready.

## Presets

The built-in presets use an available target shader, in their declared order. The shader remains native and editable in Figma. Presets target Mesh gradient, Glowing wave, Fractal noise, Pattern grid, Water caustic, Bloom, Dither, Warp, and Chromatic metal when those account shaders are available.

## Troubleshooting: `listAvailableShaders()` returns zero

- Confirm the plugin is running in a **Figma design file** and Figma is up to date enough to support the Shader Plugin API.
- Confirm the signed-in account owns, is subscribed to, or has access to native shaders. This API lists shaders available to the current file, including imported, subscribed-library, and owned shaders.
- Open the target file directly in Figma (not a prototype-only or unsupported editor context), then rerun the plugin.
- If access was just granted or a shader was newly published, restart the plugin or reopen the file to refresh the file context.
- Verify the build is current: `npm run typecheck` then `npm run build`, and re-import the local manifest if Figma points at another development plugin directory.
- The plugin reports the host error in its UI. It intentionally does not substitute a fake gradient or other approximation when no native shader is available.
