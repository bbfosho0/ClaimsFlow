export interface ShaderPreset {
  slug?: string;
  name: string;
  shaderNames: string[];
  /** Exact layer name captured by `scan-seeds`; runtime resolution uses its shader ID. */
  registryLayer: string;
  type: 'fill' | 'effect';
  /** Optional values keyed by author property name; resolved to definition IDs at runtime. */
  values: Record<string, unknown>;
  opacity?: number;
  blendMode?: BlendMode;
  visible?: boolean;
}

export const CLAIMSFLOW_PRESETS: readonly ShaderPreset[] = [
  { slug: 'overview-signal-field', name: 'Overview Signal Field', shaderNames: ['Mesh gradient'], registryLayer: 'Seed / Mesh Gradient', type: 'fill', values: {}, opacity: 0.94, blendMode: 'NORMAL', visible: true },
  { slug: 'claim-flow-wave', name: 'Claim Flow Wave', shaderNames: ['Glowing wave'], registryLayer: 'Seed / Glowing Wave', type: 'fill', values: {}, opacity: 0.9, blendMode: 'SCREEN', visible: true },
  { slug: 'queue-command-atmosphere', name: 'Queue Command Atmosphere', shaderNames: ['Bloom'], registryLayer: 'Seed / Bloom', type: 'effect', values: {}, visible: true },
  { slug: 'selected-claim-inspector', name: 'Selected Claim Inspector', shaderNames: ['Chromatic metal'], registryLayer: 'Seed / Chromatic Metal', type: 'effect', values: {}, visible: true },
  { slug: 'workspace-identity-field', name: 'Workspace Identity Field', shaderNames: ['Pattern grid'], registryLayer: 'Seed / Pattern Grid', type: 'fill', values: {}, opacity: 0.85, blendMode: 'NORMAL', visible: true },
  { slug: 'decision-intelligence-mesh', name: 'Decision Intelligence Mesh', shaderNames: ['Mesh gradient'], registryLayer: 'Seed / Mesh Gradient', type: 'fill', values: {}, opacity: 0.92, blendMode: 'NORMAL', visible: true },
  { slug: 'evidence-pressure', name: 'Evidence Pressure', shaderNames: ['Bloom'], registryLayer: 'Seed / Bloom', type: 'effect', values: {}, visible: true },
  { slug: 'processing-field', name: 'Processing Field', shaderNames: ['Chromatic metal'], registryLayer: 'Seed / Chromatic Metal', type: 'effect', values: {}, visible: true }
];
