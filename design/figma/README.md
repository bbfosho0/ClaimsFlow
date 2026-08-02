# ClaimsFlow Figma Handoff Artifacts

This directory mirrors the frozen machine-readable contracts embedded in the ClaimsFlow Figma file.

**Figma file key:** `M7GOuna2hq7jWCGTZhiP5b`  
**Handoff node:** `261:2`  
**Prototype section:** `221:2`  
**Prototype start:** `223:139`  
**Freeze version:** `2026-08-02-final-mvp`

## Files

| File | Purpose |
|---|---|
| `claimsflow-component-map.json` | Figma component to Angular component targets |
| `claimsflow-node-map.json` | Canonical Figma node IDs |
| `claimsflow-routes.json` | Showcase, tour, operational route, redirect, and intelligence authority contract |
| `claimsflow-motion-map.json` | Staged showcase, route, overlay, and reduced-motion behavior |
| `claimsflow-prototype-map.json` | Primary prototype destinations, mobile states, and Claims Intelligence states |
| `claimsflow-shader-map.json` | Six-shader inventory, usage boundaries, and runtime fallback rule |
| `claimsflow-production-freeze.json` | Final readiness record |
| `claimsflow-token-source.json` | Deterministic pointer to the embedded DTCG token payload |

The full native shader property registry is stored at:

`figma-plugin/presets/generated-shader-registry.json`

The full integration guide is stored at:

`docs/design/claimsflow-final-mvp-handoff.md`

## Token extraction

The complete token payload remains embedded in Figma because it is the authoritative variable export.

Use Figma MCP against node `261:2`, read shared plugin data under namespace `claimsflow`, key `dtcgTokens`, parse the JSON, and generate production CSS variables from its code-syntax entries.

Do not sample token values from screenshots and do not invent replacement names.

## Implementation boundary

This branch contains no Angular, Spring Boot, database, or test implementation changes. Build the product on a separate implementation branch using these contracts as immutable input.
