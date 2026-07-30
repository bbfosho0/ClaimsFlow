export type CapturedShaderSeed = {
  layerName: string;
  shaderId: string;
  entryType: 'SHADER';
  slotType: 'fill' | 'stroke' | 'effect';
  properties: Record<string, unknown>;
  visible: boolean;
  sourceNodeId: string;
};

export type CapturedShaderRegistry = {
  pageName: string;
  capturedAt: string;
  seeds: CapturedShaderSeed[];
};

export const CAPTURED_SEED_BY_KEY: Record<string, CapturedShaderSeed> = {};

export function setCapturedRegistry(registry: CapturedShaderRegistry): void {
  for (const seed of registry.seeds) CAPTURED_SEED_BY_KEY[seed.layerName] = seed;
}
