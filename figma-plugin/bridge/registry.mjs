export const SEED_PAGE = 'INTERNAL / Native Shader Seeds';
export const SEED_NAMES = [
  'Seed / Mesh Gradient',
  'Seed / Glowing Wave',
  'Seed / Pattern Grid',
  'Seed / Water Caustic',
  'Seed / Bloom',
  'Seed / Chromatic Metal'
];

export function validateRegistry(registry) {
  if (!registry || typeof registry !== 'object' || !Array.isArray(registry.seeds)) throw new Error('Registry must contain a seeds array.');
  if (registry.pageName !== SEED_PAGE) throw new Error(`Registry page must be exactly ${SEED_PAGE}.`);
  const seen = new Set();
  for (const seed of registry.seeds) {
    if (!seed || typeof seed !== 'object' || !SEED_NAMES.includes(seed.layerName)) throw new Error(`Unknown shader seed layer: ${String(seed?.layerName)}.`);
    if (seen.has(seed.layerName)) throw new Error(`Duplicate shader seed layer: ${seed.layerName}.`);
    seen.add(seed.layerName);
    if (typeof seed.shaderId !== 'string' || seed.shaderId.length === 0) throw new Error(`Seed ${seed.layerName} is missing a shader ID.`);
    if (seed.entryType !== 'SHADER' || !['fill', 'stroke', 'effect'].includes(seed.slotType)) throw new Error(`Seed ${seed.layerName} is not a real SHADER paint/effect.`);
    if (typeof seed.sourceNodeId !== 'string' || !/^\d+:\d+$/.test(seed.sourceNodeId)) throw new Error(`Seed ${seed.layerName} has an invalid source node ID.`);
    if (typeof seed.visible !== 'boolean' || !seed.properties || typeof seed.properties !== 'object') throw new Error(`Seed ${seed.layerName} is missing properties or visibility.`);
  }
  for (const name of SEED_NAMES) if (!seen.has(name)) throw new Error(`Registry is missing required shader seed: ${name}.`);
  return registry;
}
