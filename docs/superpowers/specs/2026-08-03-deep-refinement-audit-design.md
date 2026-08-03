# ClaimsFlow Deep Refinement Audit Design

## Status

Approved through the user's standing instruction to choose the recommended option and proceed.

## Objective

Perform a comprehensive final audit of ClaimsFlow without reopening the approved product architecture or replacing the Midnight Command visual identity.

The pass must improve code boundaries, product truthfulness, operational reliability, test depth, visual consistency, accessibility, CI evidence, and pull-request clarity. It must not add speculative product scope or merge the pull request.

## Selected approach

### Chosen: layered deep refinement

The audit will preserve working behavior and refine the implementation in bounded layers.

This approach is preferred over:

- **Surgical fixes only**, which would leave known structural weaknesses and shallow verification in place.
- **A broad rewrite**, which would create unnecessary regression risk after the product architecture and employer journey have already been approved.

## Non-negotiable constraints

1. Preserve the role-aware claimant, adjuster, manager, and administrator journey.
2. Preserve the Midnight Command design language.
3. Keep consequential claim decisions under explicit human authority.
4. Do not introduce unsupported production claims.
5. Do not add WebSockets, authentication, object storage, OCR, messaging providers, payments, or external carrier integrations.
6. Do not merge PR #8.
7. Every completion claim must be backed by exact-head automated verification and rendered inspection.

## Audit findings that define the work

### Pull-request hygiene

- PR #8 contains a large change surface and extensive incremental history.
- Its description references an older verification head and older artifact metadata.
- There are currently no review submissions, inline review threads, or discussion comments.
- The final PR description must explain the actual implemented architecture, exact final head, verification runs, limitations, and remaining deployment work.

### Frontend boundaries

- Operational filter parsing and serialization are defined in the Analytics page and imported by Team Operations and Evidence Operations.
- Empty filter option fixtures are duplicated across workspace pages.
- OperationalDataStore owns cache state, polling, visibility handling, invalidation, request cancellation, filtering, highlights, and resource switching in one class.
- Resource updates use repeated family switch statements and an `any`-typed internal updater.
- Filter equality relies on `JSON.stringify` rather than a canonical codec.
- Team Operations runs its own one-second interval even though the visible countdown has minute-level precision.
- Source-only Reports and Settings remain directly routable even though they are excluded from the deployed product.

### Backend boundaries

- AnalyticsService and TeamOperationsService contain repeated open/closed, percentage, completeness, SLA, and time-window calculations.
- Aggregate services use broad wildcard imports and combine data access, classification, calculation, formatting, and response construction.
- Filter options may be queried separately from the claims used for the same snapshot.
- Percentage comparison behavior reports `100%` when the prior value is zero, which can communicate a mathematically misleading change.
- New operational aggregate services require deeper direct test coverage than the current suite provides.

### Verification boundaries

- CI verifies backend tests, frontend tests, and production compilation but has no dedicated source-quality or contract-integrity gate.
- Visual QA verifies screenshot count and nonempty files but does not fail on route-level console errors, unexpected API failures, missing key content, blank screenshots, or wrong dimensions.
- The custom CDP harness retains event-listener machinery no longer required by its navigation strategy.
- Headless Chrome currently disables GPU rendering, so the workflow should explicitly define whether it validates the static fallback or a software WebGL path.

## Design principles

1. **Refactor toward named responsibilities, not abstractions for their own sake.**
2. **Keep page components declarative.** URL codecs, clocks, and resource lifecycle belong outside presentation components.
3. **Centralize operational semantics.** SLA, completeness, open-state, percentages, and comparisons must be calculated consistently.
4. **Prefer truthful labels over impressive but ambiguous metrics.**
5. **Use motion only for state, change, risk, or interaction feedback.**
6. **Make CI evidence inspect behavior, not merely file existence.**
7. **Remove dead code before adding new code.**

## Workstream 1: product truthfulness and route integrity

### Reports and Settings

Remove Reports and Settings from the deployable route graph rather than merely hiding their navigation items.

The underlying preview components may remain only when they are referenced by design documentation or future-work notes. Direct `/app/reports` and `/app/settings` navigation must resolve to the appropriate role landing route or the application fallback, not render a placeholder workspace.

Tests must prove that:

- no role rail exposes either destination;
- neither route resolves to a placeholder page;
- role guards still route each persona to its valid landing surface.

### Comparison semantics

Replace the ambiguous `100%` result used when a prior-period value is zero.

The API comparison contract must distinguish:

- ordinary percentage change;
- unchanged zero values;
- a newly present value with no prior-period denominator;
- a value that has fallen to zero.

The UI must render clear labels such as `New vs prior period`, `No change`, or an actual finite percentage. It must never display infinity, NaN, or a fabricated `+100%` as a substitute for an undefined comparison.

### Metric labels

Review every employer-facing KPI for denominator clarity and filter context.

Examples:

- Capacity metrics must state whether they describe the selected workload or the entire team.
- SLA compliance must state that it is based on resolved claims in the selected period.
- Evidence readiness must state whether it is an average completeness percentage or a fully complete claim rate.

## Workstream 2: frontend operational architecture

### Shared operational filter codec

Create a dedicated operational filter codec under the operational-data boundary.

It owns:

- parsing route query parameters;
- validating enum values;
- canonical serialization;
- stable equality keys;
- selected-claim preservation where applicable;
- default date-range handling.

Analytics, Team Operations, Evidence Operations, Dashboard links, and queue links must use the same contract. No workspace component may import utility functions from another page component.

### Shared constants

Move empty options and immutable defaults into the operational-data model boundary. Remove duplicated page-level constants.

### Store decomposition

Keep OperationalDataStore as the public facade, but separate responsibilities into focused units:

- a visibility-aware poll coordinator;
- a typed resource lifecycle helper for loading, refreshing, success, failure, and last-valid retention;
- canonical filter keys;
- changed-claim highlight scheduling.

The public page-facing API should remain simple:

- activate resource;
- release resource;
- refresh resource;
- invalidate affected families;
- read typed resource signals.

The refactor must remove internal `any` usage and repeated unsafe state casts.

### Shared operational clock

Replace page-owned one-second timers with one visibility-aware clock signal.

The clock should update no more frequently than the UI requires. Minute-level countdowns may refresh every 30 or 60 seconds and immediately when the tab becomes visible.

### Subscription and lifecycle cleanup

Prefer Angular lifecycle primitives and focused route-to-filter bindings over manually repeated `Subscription` and release patterns where doing so reduces complexity without broad framework churn.

## Workstream 3: backend aggregate architecture

### Operational metrics boundary

Extract shared calculations into focused, stateless classes or package-private collaborators:

- open and closed classification;
- SLA state and compliance;
- evidence completeness averages;
- safe percentage calculation;
- capacity and utilization;
- period comparison semantics;
- aging bands and deadline risk.

These collaborators must have direct unit tests for boundary values.

### Aggregate service responsibilities

Refactor AnalyticsService and TeamOperationsService so each service primarily orchestrates:

1. validated filters;
2. persisted records;
3. shared operational calculations;
4. response assembly.

Avoid unrelated repository calls inside response-formatting helpers. Remove wildcard imports and use explicit dependencies.

### Query and option efficiency

Review snapshot execution for redundant adjuster and claim queries.

Use one clearly owned filter-options provider. Cache only data that is immutable for the duration of a request or demonstrably safe across requests. Do not introduce a distributed cache or speculative persistence layer.

### Deterministic time

All operational time calculations must continue to use the injected Clock. No aggregate service or seed path may use wall-clock static calls directly.

## Workstream 4: visual and interaction refinement

### Preserve identity

Retain:

- dark Midnight Command surfaces;
- restrained cyan, blue, amber, and critical semantic accents;
- command-field visualization;
- bounded Copilot orb;
- role-aware shell and claimant shell separation.

Do not introduce a new visual theme or large navigation redesign.

### Refine hierarchy

Audit every employer-facing route for:

- heading scale and line length;
- card hierarchy;
- spacing rhythm;
- table density;
- control alignment;
- chart label readability;
- responsive stacking;
- empty and error state placement;
- visible update-age and stale-state treatment.

### Chart integrity

Charts must include:

- visible axis or scale context where needed;
- exact values in accessible summaries;
- labels that remain legible at mobile widths;
- no zero-height or misleading bars;
- stable rendering for one-point and empty datasets;
- no reliance on color alone.

### Motion discipline

Standardize durations and easing through shared tokens.

- data-change emphasis: brief and semantic;
- hover translation: 1–3 pixels;
- ordinary transitions: approximately 160–280 ms;
- background breathing: only on live or at-risk indicators;
- no perpetual card movement;
- reduced-motion behavior: immediate state changes and no decorative animation.

### Interaction truthfulness

Every visible control must be functional, navigational, explanatory-disabled, or removed. Tooltips and disabled explanations must describe the exact limitation rather than use generic `Coming soon` language.

## Workstream 5: automated verification

### Backend tests

Add direct tests for:

- AnalyticsService current and previous period calculations;
- zero-denominator comparison semantics;
- time-series boundaries;
- aging bands;
- cohort calculations;
- TeamOperationsService capacity and utilization;
- SLA at-risk and overdue boundaries;
- assignment coverage;
- integrity score composition;
- advisory link filters;
- EvidenceOperationsService selection and claimant-visible message projection;
- operational filter combinations and invalid values;
- deterministic seeded portfolio repeatability.

### Frontend tests

Add or strengthen tests for:

- canonical operational filter parsing, serialization, and equality;
- store request cancellation and stale response protection;
- polling pause and resume;
- exact invalidation families after each mutation;
- shared clock visibility behavior;
- comparison labels for undefined and finite changes;
- route removal for Reports and Settings;
- empty, error, stale, and reduced-motion states;
- responsive control integrity where feasible in component tests.

### Source-quality gate

Add a lightweight deterministic audit script rather than introducing a large lint migration during this pass.

The gate should fail on agreed high-risk patterns in deployed source, including:

- placeholder route labels or unsupported product claims;
- page-to-page utility imports for operational filters;
- newly introduced `TODO`, `FIXME`, or `HACK` markers;
- console debugging in deployed frontend source;
- accidental direct wall-clock calls in backend operational packages;
- Reports or Settings in role navigation contracts.

The script must use an explicit allowlist for legitimate tooling and documentation paths.

### Visual QA hardening

Refactor the CDP harness into small helpers and remove unused listener machinery.

Before each screenshot, verify route-specific content and absence of fatal error states. During the run, collect:

- browser console errors;
- uncaught exceptions;
- failed API requests not deliberately induced by the stale-state scenario;
- final URL and expected role surface;
- screenshot dimensions;
- basic nonblank-image sanity.

The stale-data scenario must explicitly allow only the intentionally blocked dashboard request.

Define WebGL behavior explicitly:

- use software WebGL where supported to exercise the orb path; or
- capture and label the static fallback as the CI contract while unit tests validate WebGL lifecycle behavior.

The workflow must upload screenshots, a machine-readable manifest, and logs on failure.

## Workstream 6: documentation and PR hygiene

### README and demo script

Ensure both documents match the final route graph, aggregate semantics, visual QA behavior, and explicit limitations.

Remove stale exact-head references from permanent documentation. Exact run metadata belongs in the PR description or a generated verification report.

### Final audit report

Create a concise audit report that records:

- findings;
- severity;
- resolution;
- verification evidence;
- intentionally deferred items;
- deployment prerequisites still outside the repository.

### PR description

Update PR #8 only after final exact-head verification.

The final body must include:

- product summary;
- major architecture changes;
- truthfulness boundaries;
- audit refinements;
- exact final head;
- CI and Visual QA run IDs;
- artifact ID and digest;
- test counts when available;
- known limitations;
- explicit statement that the PR is open and unmerged.

Do not claim there are no defects merely because checks pass. State what was inspected and what remains outside scope.

## Execution sequence

1. Record a clean exact-head baseline.
2. Add characterization tests around current aggregate and store behavior.
3. Extract frontend filter, clock, and resource lifecycle boundaries.
4. Extract backend operational metric boundaries.
5. Correct comparison and route truthfulness issues.
6. Refine employer-facing visual hierarchy and interaction states.
7. Harden source-quality and visual QA automation.
8. Run backend, frontend, build, source audit, and reactive visual QA.
9. Inspect the rendered artifact manually.
10. Fix all blocking findings and rerun exact-head verification.
11. Write the final audit report and update the PR body.
12. Leave PR #8 open and unmerged.

## Acceptance criteria

The pass is complete only when:

1. Reports and Settings cannot render as deployed placeholder routes.
2. Operational filter utilities live outside page components and are shared by all relevant surfaces.
3. The operational store has typed internal resource handling and no internal `any` updater.
4. Team countdown timing uses a shared visibility-aware clock at an appropriate cadence.
5. Shared backend operational calculations have direct boundary tests.
6. Prior-period zero denominators are represented truthfully.
7. Aggregate services have direct tests for their principal calculations and filters.
8. No employer-facing KPI or control overstates implemented capability.
9. Visual hierarchy, responsive density, focus behavior, empty states, stale states, and reduced motion are consistent across deployed surfaces.
10. Visual QA detects route errors, browser errors, unexpected API failures, missing key content, invalid dimensions, and blank captures.
11. CI passes backend verification, frontend tests, production build, source audit, and visual QA on the exact final branch head.
12. The final screenshots are manually inspected.
13. README, demo script, audit report, and PR description agree with the implemented product.
14. PR #8 remains open and unmerged.
