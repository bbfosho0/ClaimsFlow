# ClaimsFlow Final MVP Figma Handoff

**Status:** `READY_FOR_REPOSITORY_INTEGRATION`  
**Version:** `2026-08-02-final-mvp`  
**Figma file:** `M7GOuna2hq7jWCGTZhiP5b`  
**Prototype start:** `223:139`  
**Repository branch:** `design/claimsflow-final-mvp-handoff`

This document freezes the approved ClaimsFlow MVP design, native-shader usage, motion grammar, prototype graph, route contract, component mapping, and Claims Intelligence authority boundary before Angular and Spring Boot implementation.

Application code is intentionally unchanged on this branch. The branch is the design-to-code source package.

## Source of truth

| Contract | Figma node | Link |
|---|---:|---|
| Foundations | `242:22` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=242-22&p=f |
| Components | `243:2` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=243-2&p=f |
| Patterns | `246:14` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=246-14&p=f |
| Visualizations and motion | `260:2` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=260-2&p=f |
| Production handoff | `261:2` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=261-2&p=f |
| Full prototype | `221:2` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=221-2&p=f |
| Shader registry | `325:3` | https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2?node-id=325-3&p=f |

The complete DTCG-compatible token payload remains embedded under the `claimsflow` namespace on node `261:2`, key `dtcgTokens`. It includes primitive, semantic, density, and motion groups with CSS code syntax. Local Codex must extract that payload through Figma MCP before generating production CSS. Do not resample colors or spacing from screenshots.

## Canonical MVP pages

1. `FINAL / 00 Cover & System`
2. `FINAL / 01 Operations Overview`
3. `FINAL / 02 Claims Queue`
4. `FINAL / 03 Claim Workspace`
5. `FINAL / 04 New Claim`
6. `FINAL / 05 Claims Intelligence`
7. `FINAL / 06 Responsive`
8. `FINAL / 07 States & Handoff`
9. `FINAL / 08 FX Library & Production Map`
10. `FINAL / 09 Prototype Reference`

Claims Intelligence is part of the MVP. It is not a future-module placeholder.

## Production route contract

```text
/                       Cinematic portfolio showcase
/tour                   Guided tour entry
/app/dashboard          Operations Overview
/app/claims             Claims Queue
/app/claims/:id         Claim Workspace
/app/claims/new         New Claim
/app/intelligence       Claims Intelligence
```

Preserve compatibility redirects:

```text
/dashboard      -> /app/dashboard
/claims         -> /app/claims
/claims/new     -> /app/claims/new
/claims/:id     -> /app/claims/:id
/showcase       -> /
```

The showcase must not render inside the operational application shell.

## Prototype graph

The primary flow starts at `P00 / Showcase / Initial`, node `223:139`.

### Showcase sequence

```text
223:139  P00 / Initial
   ↓  after 0.65 s, Smart Animate 0.55 s
333:1898 P00A / Signal Lock
   ↓  after 0.18 s, Smart Animate 0.75 s
223:2    P01 / Ready
```

The staged transition interpolates:

- Scan-line vertical position
- Command Field position and opacity
- Grid opacity
- Glowing Wave shader offset
- Bloom intensity
- Chromatic Metal evolution
- Secondary actions and proof-rail opacity

### Core MVP destinations

| Product area | Prototype node |
|---|---:|
| Operations Overview | `225:2` |
| Claims Queue | `225:296` |
| Claim Workspace | `227:2` |
| New Claim | `229:2` |
| Claims Intelligence | `322:1202` |

Thirty-six explicit route hotspots connect the operational prototype states. Do not reproduce route navigation with brittle text selectors.

### Claims Intelligence states

| State | Node |
|---|---:|
| Review Center | `322:1202` |
| Investigation | `322:1398` |
| Action confirmed | `322:1597` |
| Action-preview overlay | `322:1795` |

### Mobile contracts

| State | Node |
|---|---:|
| Showcase | `230:2` |
| Tour controller | `230:33` |
| Claims Intelligence | `287:4` |
| Intelligence action preview | `296:721` |
| Intelligence confirmed | `297:721` |

### Technical and accessibility references

- Engineering proof: `229:839`
- Reduced-motion contract: `230:63`

The verified prototype contains 132 reactions with zero broken destinations.

## Motion implementation contract

Figma contains prototype-native Smart Animate and dissolve transitions. It does not contain authored Figma timeline tracks. Do not claim or attempt to export an MP4 from nonexistent timeline data.

Production implementation rules:

- Use CSS and Angular enter/leave behavior for ordinary application transitions.
- Use GSAP only for coordinated showcase storytelling where native behavior is insufficient.
- Keep operational route transitions near 350 ms.
- Keep overlays near 200 ms.
- Keep motion interruptible and never delay user input.
- Animate transforms and opacity instead of layout-changing properties.
- Do not use generic repeated upward fades, constant card floating, or scroll hijacking.
- Pause nonessential animation when offscreen or when the document is hidden.
- In reduced-motion mode, bypass the Initial and Signal Lock showcase states and render Ready immediately.

## Native shader registry

The six validated native Figma shaders are synchronized to:

`figma-plugin/presets/generated-shader-registry.json`

| Shader | Slot | Intended usage |
|---|---|---|
| Glowing Wave | Fill | Command fields, queue command bar, identity header, guided intake |
| Mesh Gradient | Fill | Bounded intelligence and decision-support surfaces |
| Water Caustic | Fill | Selected context, provenance, and review focus |
| Pattern Grid | Fill | Engineering-proof background only |
| Bloom | Effect | Radar focus and signal-lock emphasis only |
| Chromatic Metal | Effect | Portfolio identity monogram only |

### Runtime boundary

Native Figma shaders are design references, not Angular runtime assets.

Production must recreate equivalent bounded effects using this preference order:

1. CSS gradients, `color-mix()`, masking, and compositing
2. SVG
3. Canvas 2D
4. A lazy-loaded WebGL renderer only when it provides a measurable visual benefit and passes the performance budget

Shader implementation requirements:

- No shaders behind dense tables, forms, evidence ledgers, or long-form copy.
- One active WebGL canvas maximum.
- Cap device pixel ratio.
- Pause offscreen and on hidden tabs.
- Dispose resources on route destruction.
- Provide static and reduced-motion fallbacks.
- Do not load showcase-only shader dependencies on ordinary `/app/*` entry.

## Claims Intelligence authority contract

The assistant may:

- Explain recommendations
- Identify missing evidence
- Detect contradictions
- Draft communications
- Prepare reversible workflow actions

The assistant may not:

- Silently approve or deny a claim
- Pay or close a claim autonomously
- Reassign work without confirmation
- Present unsourced material claims as verified facts

Every consequential action requires:

1. Exact state-change preview
2. Operator reason
3. Explicit confirmation
4. Immutable audit event

Implement statement labels such as Verified, Missing, Inferred, Policy rule, Operator-provided, and Uncertain. Material claims must link to evidence or policy provenance.

## Angular component mapping

The authoritative component map is:

`design/figma/claimsflow-component-map.json`

Primary mappings include:

- `ApplicationShell/NavigationRail` -> `CfNavigationRailComponent`
- `ApplicationShell/Header` -> `CfApplicationHeaderComponent`
- `Visualization/PriorityCommandField` -> `CfPriorityCommandFieldComponent`
- `Table/ClaimsQueue` -> `ClaimsQueueTableComponent`
- `Inspector/SelectedClaim` -> `SelectedClaimInspectorComponent`
- `Table/EvidenceLedger` -> `EvidenceLedgerComponent`
- `Rail/DecisionAndCommunications` -> `ClaimDecisionRailComponent`
- `Tour/Controller` -> `TourControllerComponent`
- `Assistant/ContextualPanel` -> `ClaimAssistantComponent`
- `Visualization/EvidenceReasoningGraph` -> `EvidenceReasoningGraphComponent`
- `Intelligence/ActionPreviewDialog` -> `IntelligenceActionPreviewDialogComponent`

Do not translate Figma frames into a single monolithic Angular component or thousands of absolute-positioned elements.

## Repository artifact index

```text
design/figma/
├── README.md
├── claimsflow-component-map.json
├── claimsflow-motion-map.json
├── claimsflow-node-map.json
├── claimsflow-production-freeze.json
├── claimsflow-prototype-map.json
├── claimsflow-routes.json
└── claimsflow-shader-map.json

figma-plugin/presets/
└── generated-shader-registry.json
```

## Required implementation order

1. Extract `dtcgTokens` from Figma handoff node `261:2`.
2. Generate checked-in CSS variables and validate aliases.
3. Refactor routing and shell boundaries.
4. Implement shared navigation, headers, controls, status, focus, loading, and error surfaces.
5. Implement the five canonical operational surfaces with real APIs.
6. Implement the cinematic showcase and staged opening.
7. Implement the guided-tour orchestrator with stable target attributes.
8. Implement Claims Intelligence and its human-authority boundary.
9. Implement bounded visualizations and shader fallbacks.
10. Add deterministic demo data, end-to-end coverage, visual regression, accessibility, and performance verification.

## Acceptance criteria

Implementation is not complete until all of the following are true:

- Root showcase loads outside the application shell.
- All legacy routes redirect correctly.
- Five operational MVP routes work without tour mode.
- Claims Intelligence is functional and evidence-grounded.
- Both approve and reject paths require reasons and append audit events.
- The main guided path uses real backend transitions.
- Native shader references have performant, static, and reduced-motion equivalents.
- Showcase-only dependencies are lazy-loaded.
- Reduced-motion users receive all information without spatial choreography.
- Keyboard focus, dialog focus restoration, landmarks, headings, and live status announcements are verified.
- Desktop and mobile screenshots closely match canonical Figma frames.
- LCP is at or below 2.5 seconds, INP at or below 200 ms, and CLS at or below 0.1 where measurable.
- Repeated navigation leaks no timelines, observers, canvases, or WebGL resources.
- Browser console contains no errors caused by the implementation.

## Freeze rule

This branch records the final design contract. Product implementation should occur on a separate feature branch or worktree. Do not mutate these handoff files casually during implementation. Any intentional design deviation must be documented with the affected Figma node, reason, accessibility or performance impact, and approval status.
