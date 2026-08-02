# ClaimsFlow Final MVP Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frozen ClaimsFlow Figma MVP in the existing Angular 20 and Spring Boot application, including the cinematic showcase, guided tour, five operational routes, Claims Intelligence, responsive states, motion, and shader-equivalent rendering.

**Architecture:** Keep the Spring backend as the authoritative workflow engine and preserve its deterministic recommendation and audit boundaries. Replace the frontend shell and visual layer with token-driven standalone Angular components, lazy-loaded routes, CSS/SVG/Canvas signature visuals, and route-scoped motion. Claims Intelligence composes existing claims, recommendation, and audit APIs; it never performs autonomous claim mutations.

**Tech Stack:** Angular 20.3 standalone components, Angular Router View Transitions, signals, RxJS, Reactive Forms, semantic CSS, SVG/Canvas 2D, Spring Boot 3.5, Java 21, PostgreSQL, Jasmine/Karma, JUnit/MockMvc.

## Global Constraints

- Preserve strict TypeScript, standalone components, typed services, lazy routes, Reactive Forms, semantic HTML, visible focus, skip links, loading/empty/error/success states, and reduced-motion support.
- Do not install Tailwind or a large component library.
- Do not move backend domain logic into Angular.
- Claims Intelligence may explain, investigate, draft, and prepare reversible actions; every consequential action requires an operator reason, exact result preview, explicit confirmation, and audit event.
- Native Figma shaders are design references. Product routes use CSS, SVG, or Canvas 2D equivalents. Only the showcase Command Field may use a bounded lazy-loaded WebGL implementation after measured validation.
- Preserve old route compatibility while making `/` the showcase and `/app/*` the production application.
- Run `mvn verify`, `npm run test:ci`, and `npm run build` before completion.

---

### Task 1: Routing, tokens, and application shell

**Files:**
- Modify: `frontend/src/app/app.component.ts`
- Modify: `frontend/src/app/app.config.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.html`
- Modify: `frontend/src/app/core/layout/app-shell.component.css`
- Modify: `frontend/src/styles.css`
- Create: `frontend/src/app/core/layout/app-shell-state.service.ts`
- Create: `frontend/src/app/shared/ui/icon/claimsflow-icon.component.ts`
- Test: `frontend/src/app/core/layout/app-shell.component.spec.ts`

**Interfaces:**
- Produces `AppShellStateService` with `readonly isApplicationRoute`, `readonly routeTitle`, and `readonly reducedMotion` signals.
- Produces canonical routes `/`, `/tour`, `/app/dashboard`, `/app/claims`, `/app/claims/new`, `/app/claims/:id`, and `/app/intelligence` plus legacy redirects.

- [ ] Write shell and route tests asserting the showcase renders without the application rail, application routes render the rail, and legacy routes redirect.
- [ ] Run the focused Karma tests and confirm the new expectations fail.
- [ ] Replace the global light theme with the Figma token contract: canvas `#02070D`, surface `#071A22`, elevated `#0A222C`, border `#173B46`, text `#F2FCFD`, secondary `#A6C3C5`, teal `#2BE3B7`, cyan `#42CDEC`, violet `#9A7CFF`, amber `#F7B75B`, coral `#FF6570`.
- [ ] Add router View Transitions with `skipInitialTransition: true`; disable or simplify transitions when reduced motion is requested.
- [ ] Rebuild the shell as a 176px command rail with Overview, Claims, New Claim, and Intelligence routes, system state, operator identity, responsive bottom navigation, and accessible skip link.
- [ ] Run focused tests, then `npm run build`.
- [ ] Commit `feat: establish ClaimsFlow command system`.

### Task 2: Cinematic showcase and signature visualization

**Files:**
- Create: `frontend/src/app/showcase/showcase-page.component.ts`
- Create: `frontend/src/app/showcase/showcase-page.component.html`
- Create: `frontend/src/app/showcase/showcase-page.component.css`
- Create: `frontend/src/app/shared/visualizations/command-field.component.ts`
- Create: `frontend/src/app/shared/visualizations/command-field.component.html`
- Create: `frontend/src/app/shared/visualizations/command-field.component.css`
- Create: `frontend/src/app/shared/visualizations/signal-field.ts`
- Test: `frontend/src/app/showcase/showcase-page.component.spec.ts`
- Test: `frontend/src/app/shared/visualizations/command-field.component.spec.ts`

**Interfaces:**
- `CommandFieldComponent` accepts `signals`, `activeCount`, `reducedMotion`, and `variant` inputs.
- `ShowcasePageComponent` exposes interruptible `initial -> signalLock -> ready` states.

- [ ] Write tests for initial state, automatic progression, user skip, reduced-motion direct ready state, and semantic visualization summary.
- [ ] Implement the SVG Command Field with teal/cyan/violet/amber/coral signals, pressure rings, scan line, and static text alternative.
- [ ] Implement the showcase chapters: product thesis, operational problem, lifecycle, architecture, human authority, reliability, and actions into tour/live app/GitHub.
- [ ] Recreate Glowing Wave, Bloom, Chromatic Metal, Pattern Grid, and Mesh Gradient as bounded CSS/SVG materials using semantic variables.
- [ ] Add staged motion matching Figma: 650ms initial delay, 550ms signal lock, 180ms dwell, 750ms ready resolution; make it immediately skippable.
- [ ] Run focused tests and production build.
- [ ] Commit `feat: add cinematic ClaimsFlow showcase`.

### Task 3: Operations Overview

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.html`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.css`
- Modify: `frontend/src/app/shared/ui/metric-card/metric-card.component.ts`
- Modify: `frontend/src/app/shared/ui/metric-card/metric-card.component.html`
- Modify: `frontend/src/app/shared/ui/metric-card/metric-card.component.css`
- Test: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`

**Interfaces:**
- Consumes the existing `DashboardService.load()` API.
- Produces `data-tour-target="priority-command"` and intervention links into the claims queue.

- [ ] Update tests to assert the Command Field, four-cell instrument band, intervention queue, flow intelligence, team capacity, and event feed.
- [ ] Build the Portfolio Command header and live status strip.
- [ ] Map dashboard metrics into the canonical instrument band without fabricating backend totals.
- [ ] Build a deterministic visual priority field from dashboard totals and recent events.
- [ ] Preserve loading, empty, and RFC 9457 error presentation.
- [ ] Run dashboard tests and build.
- [ ] Commit `feat: redesign operations overview`.

### Task 4: Claims Queue

**Files:**
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.ts`
- Test: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`

**Interfaces:**
- Preserves `ClaimsApiService.list(filters)` and query-parameter filter state.
- Produces explicit selected-row state and `data-tour-target="urgent-claim"`.

- [ ] Write failing tests for command filters, comfortable/compact density, selected inspector, responsive card mode, and query-state preservation.
- [ ] Rebuild queue header, filter command surface, density controls, prioritized table, selected-row material, and context inspector.
- [ ] Keep a real semantic table on desktop and accessible claim cards below 768px.
- [ ] Preserve pagination, search, assignment/status/priority filters, loading, empty, and error states.
- [ ] Run focused tests and build.
- [ ] Commit `feat: redesign claims queue terminal`.

### Task 5: Claim Workspace and New Claim

**Files:**
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- Modify: `frontend/src/app/shared/ui/status-badge/status-badge.component.css`
- Modify: `frontend/src/app/shared/ui/progress-indicator/progress-indicator.component.css`
- Test: existing detail and create page specs

**Interfaces:**
- Preserves claim get/assign/status/recommendation/review/audit APIs.
- Produces `data-tour-target="evidence-ledger"`, `data-tour-target="decision-support"`, and `data-tour-target="new-claim-submit"`.

- [ ] Add tests for workspace tabs, evidence ledger, explicit human authority, required decision reason, audit refresh, progressive intake gates, upload recovery copy, and created-claim state.
- [ ] Rebuild the workspace identity band, dossier, evidence ledger, priority rationale, decision/communications rail, and immutable audit timeline.
- [ ] Replace direct approve/reject buttons with accessible confirmation dialogs requiring a reason; do not call the API until confirmed.
- [ ] Rebuild New Claim as a four-gate progressive dossier while preserving the existing typed Reactive Form and backend-authoritative result.
- [ ] Preserve drafts after simulated file-selection errors and provide explicit retry language without claiming file upload exists in the backend.
- [ ] Run focused tests and build.
- [ ] Commit `feat: redesign claim workspace and intake`.

### Task 6: Claims Intelligence MVP

**Files:**
- Create: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Create: `frontend/src/app/intelligence/claims-intelligence-page.component.html`
- Create: `frontend/src/app/intelligence/claims-intelligence-page.component.css`
- Create: `frontend/src/app/intelligence/intelligence.models.ts`
- Create: `frontend/src/app/intelligence/intelligence-facade.service.ts`
- Create: `frontend/src/app/intelligence/evidence-reasoning-graph.component.ts`
- Create: `frontend/src/app/intelligence/evidence-reasoning-graph.component.html`
- Create: `frontend/src/app/intelligence/evidence-reasoning-graph.component.css`
- Test: `frontend/src/app/intelligence/claims-intelligence-page.component.spec.ts`
- Test: `frontend/src/app/intelligence/intelligence-facade.service.spec.ts`

**Interfaces:**
- `IntelligenceFacadeService.loadReviewQueue()` composes `ClaimsApiService.list()` and selected claim detail.
- `prepareAction()` returns a reversible preview and never mutates backend state.
- Confirmed recommendation review delegates to existing backend review endpoints and refreshes audit history.

- [ ] Write tests for review queue ranking, source classifications, review/investigation/action modes, no autonomous mutation, required reason, and audit refresh.
- [ ] Build the review queue, selected recommendation dossier, confidence composition, Evidence Reasoning Graph, contextual assistant, and action preview.
- [ ] Label every statement as verified, missing, inferred, policy, operator-provided, or uncertain.
- [ ] Provide deterministic assistant responses derived from claim/recommendation data; use the existing backend OpenAI recommendation only through the established advisory endpoint.
- [ ] Implement responsive mobile bottom-sheet patterns.
- [ ] Run focused tests and build.
- [ ] Commit `feat: add Claims Intelligence MVP`.

### Task 7: Guided tour

**Files:**
- Create: `frontend/src/app/tour/tour-page.component.ts`
- Create: `frontend/src/app/tour/tour-page.component.html`
- Create: `frontend/src/app/tour/tour-page.component.css`
- Create: `frontend/src/app/tour/tour-controller.component.ts`
- Create: `frontend/src/app/tour/tour-controller.component.html`
- Create: `frontend/src/app/tour/tour-controller.component.css`
- Create: `frontend/src/app/tour/tour-orchestrator.service.ts`
- Create: `frontend/src/app/tour/tour-step-registry.ts`
- Create: `frontend/src/app/tour/tour.models.ts`
- Test: `frontend/src/app/tour/tour-orchestrator.service.spec.ts`
- Test: `frontend/src/app/tour/tour-controller.component.spec.ts`

**Interfaces:**
- Six stable step IDs route through real application screens using `step` query parameters.
- Session storage key `claimsflow-tour-progress` stores progress only; no domain state is stored there.

- [ ] Write tests for six steps, previous/next/skip/exit, query deep links, keyboard navigation, mobile controller, and progress restoration.
- [ ] Implement a real route-aware tour controller that highlights explicit `data-tour-target` attributes.
- [ ] Add technical-details expansion and approximately 90-second primary copy.
- [ ] Ensure the application remains usable without tour state and the tour never owns business logic.
- [ ] Run focused tests and build.
- [ ] Commit `feat: add guided product tour`.

### Task 8: Verification, documentation, and delivery

**Files:**
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Create: `docs/design/claimsflow-implementation-notes.md`
- Modify/add frontend specs as required by failures

- [ ] Run `cd backend && mvn verify` and record the full result.
- [ ] Run `cd frontend && npm install && npm run test:ci && npm run build` and record the full result.
- [ ] Run the application and inspect `/`, `/tour`, all `/app/*` routes, legacy redirects, both recommendation decisions, audit refresh, responsive layouts, and reduced motion.
- [ ] Confirm showcase-only visual code is not loaded on direct application routes unless shared intentionally.
- [ ] Review the complete diff for generated files, secrets, inaccessible controls, and accidental backend behavior changes.
- [ ] Update documentation with route map, demo path, motion/shader fallbacks, and known limitations.
- [ ] Commit `docs: document final ClaimsFlow experience`.
- [ ] Open a pull request without merging automatically.
