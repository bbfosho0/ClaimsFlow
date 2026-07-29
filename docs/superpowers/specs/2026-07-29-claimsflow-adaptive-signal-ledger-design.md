# ClaimsFlow Adaptive Signal Ledger Redesign

**Status:** Proposed for written-spec review  
**Date:** 2026-07-29  
**Repository:** `bbfosho0/ClaimsFlow`  
**Specification branch:** `design/adaptive-signal-ledger-spec`  
**Figma file:** https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b  
**Selected structure:** Direction C, Adaptive Ledger  
**Selected palette:** Direction A, Signal Grid  

## 1. Purpose

Rebuild the ClaimsFlow Angular frontend into a distinctive, production-quality insurance operations product without changing the existing claims workflow, API contracts, or backend authority.

The approved direction is named **Adaptive Signal Ledger**. It combines:

- Direction C's navigation, contextual hierarchy, modular composition, and enterprise usability.
- Direction A's near-black teal shell, teal and cyan operational accents, stronger contrast, live-signal energy, and connected KPI treatment.
- A mixed surface strategy, with light working surfaces for reading and data entry, plus selected dark command surfaces for urgent, analytical, or decision-heavy work.

The result must feel like a credible operational product, not a generic administration template, consumer finance interface, decorative concept board, or cyberpunk monitoring console.

## 2. Design source of truth

Implementation must follow this specification and these approved Figma references:

- Direction C, structural reference: https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b?node-id=35-381
- Direction A, palette and signal reference: https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b?node-id=35-48

Neither frame is copied unchanged. Direction C controls layout and hierarchy. Direction A controls the shell palette, contrast, signal treatment, and operational energy.

The earlier Figma Attempt 2 associated with draft PR 4 is rejected and excluded from implementation. Its overlapping modules, malformed visualizations, placeholder iconography, uniform card treatment, and incomplete claim-workspace treatment must not be propagated.

## 3. Goals

1. Make the frontend strong enough to function as a high-quality portfolio centerpiece.
2. Improve triage speed, hierarchy, and scanability for adjusters and team leads.
3. Make the Claim Workspace the strongest and most complete surface.
4. Present decision support as useful, traceable, advisory, and human-governed.
5. Establish one reusable visual system across every route.
6. Preserve existing backend behavior and typed Angular service boundaries.
7. Maintain strong keyboard, focus, contrast, responsive, loading, empty, and error behavior.
8. Avoid the repeated-card-grid appearance common to generic dashboard templates.
9. Keep implementation practical within the existing Angular codebase.

## 4. Non-goals

The redesign will not:

- Replace Angular or introduce a parallel frontend.
- Change backend endpoints, request models, response models, persistence, or business rules.
- Add authentication, production user management, or unsupported permissions.
- Add unsupported filtering, saved searches, notifications, uploads, or external integrations.
- Fabricate historical trends, percentage changes, recommendation counts, or provider status.
- Present deterministic fallback recommendations as OpenAI-generated.
- Allow decision support to approve, deny, assign, or transition a claim automatically.
- Add a global state library without demonstrated need.
- Add a large UI framework solely for appearance.
- Ship continuous decorative motion, excessive glow, or readability-reducing effects.
- Turn the desktop claims table into a card grid.

## 5. Existing application boundaries

The current routes remain:

- `/dashboard`
- `/claims`
- `/claims/new`
- `/claims/:id`

The redesign preserves:

- Angular standalone components and OnPush change detection.
- Existing lazy route loading.
- Existing typed HTTP services and models.
- Signals and RxJS data-loading patterns.
- Reactive Forms and current validation constraints.
- URL-backed queue filters using `q`, `status`, `priority`, and `assignment`.
- Existing assignment, status-transition, recommendation-review, and audit behavior.
- Existing loading, error, empty, success, and disabled-state semantics.

The backend remains authoritative for:

- Priority.
- Evidence completeness.
- Assignment validity.
- Valid status transitions.
- Recommendation generation and review state.
- Audit events.

The frontend may derive presentation-only values such as readable SLA countdowns, form-completion progress, display grouping, icon selection, and visual urgency categories.

## 6. Product character

ClaimsFlow should feel precise, calm under pressure, operational, technically modern, data-aware, trustworthy, human-governed, and visually intentional.

It should not feel generic, empty, consumer-oriented, game-like, cyberpunk, overly glossy, or decorated with unsupported data.

## 7. Visual architecture

### 7.1 Surface strategy

Use three visual layers:

1. **Dark application shell** for navigation, global context, identity, and selected command controls.
2. **Light working canvas** for tables, forms, evidence reading, audit history, and information-dense work.
3. **Dark command surfaces** used selectively for operational signal summaries, urgent exceptions, and decision support.

Dark surfaces must have a functional reason. The product must not become uniformly dark.

### 7.2 Color tokens

#### Foundation

| Token | Value | Use |
| --- | --- | --- |
| `--cf-ink-950` | `#061516` | Sidebar and deepest command surfaces |
| `--cf-ink-900` | `#0B2021` | Elevated dark panels |
| `--cf-ink-800` | `#123234` | Dark borders and secondary dark controls |
| `--cf-canvas` | `#F3F6F6` | Main workspace background |
| `--cf-surface` | `#FFFFFF` | Primary working surfaces |
| `--cf-surface-muted` | `#E9EEEE` | Secondary light regions |
| `--cf-border` | `#D5DEDE` | Light-surface structural border |
| `--cf-text` | `#102223` | Primary light-surface text |
| `--cf-text-muted` | `#647778` | Supporting text |
| `--cf-dark-text` | `#EAF7F4` | Primary text on dark surfaces |
| `--cf-dark-muted` | `#91AAA6` | Supporting text on dark surfaces |

#### Operational accents

| Token | Value | Use |
| --- | --- | --- |
| `--cf-teal` | `#2EDDB5` | Primary action, active operation, positive live signal |
| `--cf-cyan` | `#55C8E8` | Focus, selection, assignment, connected signal |
| `--cf-amber` | `#F4B45F` | High priority and emerging risk |
| `--cf-red` | `#F46B73` | SLA breach and critical urgency |
| `--cf-blue` | `#62A6FF` | Informational metadata and assignment context |
| `--cf-violet` | `#A78BFA` | Recommendation and intelligence context only |

Accent colors are reserved for meaning. Neutral surfaces dominate so operational signals remain legible.

### 7.3 Typography

Use Inter where available, with the existing system-compatible sans-serif stack as fallback. Do not add a blocking font dependency.

| Role | Specification |
| --- | --- |
| Page title | 30px, 700, 38px line height |
| Major metric | 36px to 44px, 700 |
| Section title | 18px, 700, 26px line height |
| Panel title | 15px, 650, 22px line height |
| Body | 14px, 400, 22px line height |
| Dense table text | 13px, 400 to 600 |
| Operational label | 11px, 700, uppercase, restrained tracking |
| Metadata | 12px, 400, 18px line height |
| Control text | 13px to 14px, 600 |

Large typography is reserved for page identity and high-value metrics. Toolbars, tables, navigation, inputs, and inspectors require explicit typography and must not use browser-default control sizing.

### 7.4 Geometry and spacing

- Base unit: 4px.
- Primary spacing: 8px, 12px, 16px, 24px, 32px, 40px.
- Small control radius: 8px.
- Standard workspace-panel radius: 14px.
- Major command-surface radius: 18px.
- Badge and chip radius: fully rounded.
- Desktop layout gaps: 20px to 24px.
- Dense table row target: approximately 56px.
- Mobile interactive target minimum: 44px.

Borders and tonal separation provide most structure. Shadows communicate elevation only and remain restrained.

### 7.5 Icon system

Use one consistent outlined icon family with approximately 1.75px stroke weight and rounded line caps. Existing compatible icons may be retained. New icons should use production-quality inline SVG or the repository's established icon approach without adding a large dependency solely for icons.

Icons must match meaning and optical weight across navigation, controls, badges, tables, status indicators, empty states, and mobile actions.

## 8. Application shell

### 8.1 Desktop

Use a persistent left navigation containing:

- ClaimsFlow brand identity.
- Operations Intelligence workspace label.
- Overview, Claims, and New Claim destinations.
- The existing generic `System healthy` and `Decision support available` treatment, without provider provenance.
- The existing demo-operator treatment, clearly presented as demonstration context rather than authentication.

The active route uses a high-contrast dark-surface state with teal or cyan edge emphasis. Hover, focus, selected, and disabled states must be distinct.

### 8.2 Global claim search

Add one global claim-search field to the desktop workspace header. Submitting it navigates to `/claims` using the existing `q` query parameter. It does not introduce a new API, command palette, fuzzy search service, or unsupported result overlay.

The current route's primary action remains visible beside the search field where space permits.

### 8.3 Mobile

Below 768px:

- Replace the persistent sidebar with a compact top application bar.
- Keep Overview, Claims, and New Claim directly accessible.
- Preserve the current route's primary action.
- Avoid hover-dependent behavior.
- Prevent horizontal page overflow.

## 9. Operations Overview

The dashboard becomes a decision surface rather than a row of equal cards.

### 9.1 Header and context ribbon

The top region contains:

- Page title and concise operational summary.
- Primary `Create claim` action.
- A dark context ribbon generated only from the existing dashboard snapshot.

The ribbon may summarize SLA risk, high-priority volume, unassigned volume, or incomplete volume. It must not imply historical movement or provider status.

### 9.2 KPI instruments

Display the existing metrics:

- Open claims.
- High priority.
- SLA risk.
- Unassigned.
- Incomplete.

They must not be five identical rectangles.

- Open claims is the leading inventory instrument.
- SLA risk and high priority receive stronger semantic treatment.
- Unassigned and incomplete remain actionable but quieter.
- Thin connectors, aligned baselines, and shared signal strokes create Direction A's connected operational feeling.
- Every metric includes a label, exact value, semantic icon, and a short phrase derived only from that metric.
- No percentage changes, trend arrows, historical graphs, or time axes are shown.

### 9.3 Current-state signal panel

Use a dark command surface to compare the five current aggregate counts. The visualization has no time axis and makes no trend claim. Because these counts are not mutually exclusive, it must not be labeled as a distribution or total composition.

### 9.4 Action context

Create action rows from the existing aggregate counts:

- High priority.
- SLA risk.
- Unassigned.
- Incomplete.

Each row shows the exact aggregate count and navigates to the Claims Queue. Existing supported filters may be applied when the mapping is exact. Unsupported SLA-risk or completeness filters must not be invented. Those rows navigate to the unfiltered queue with clear copy, rather than pretending the queue is filtered.

### 9.5 Workload and activity

- **Adjuster workload:** light working surface with active claims, capacity, and exact values.
- **Recent activity:** compact chronological feed using actor, action type, summary, and timestamp.

## 10. Claims Queue

The queue becomes a dense triage workspace.

### 10.1 Composition

Order:

1. Page header and result count.
2. Command toolbar.
3. Applied-filter strip.
4. Semantic desktop table.
5. Contextual inspector at viewport widths of 1440px and above.

### 10.2 Command toolbar

Use only the existing controls:

- Search.
- Status.
- Priority.
- Assignment.
- Apply.
- Reset.

Search receives the most width. Applied filters appear as removable chips tied to the URL-backed filter state.

### 10.3 Desktop table

The desktop queue remains a semantic HTML table.

Required hierarchy:

- Claim number as the strongest row entry point.
- Claimant as supporting identity.
- Claim type.
- Priority.
- Status.
- Assignment.
- SLA deadline or readable urgency.
- Completeness.

Behavior:

- Sticky table header within the table region.
- Clear row hover.
- Explicit keyboard focus on the claim link.
- Status and priority shown with text, icon or marker, and semantic color.
- SLA shown as readable urgency plus accessible exact time.
- Completeness shown as bar or ring plus percentage and accessible text.
- The row itself must not become an inaccessible pseudo-link.

### 10.4 Contextual inspector

At 1440px and above, selecting a row opens a narrow preview rail with existing claim data only:

- Claimant.
- Claim type.
- Status.
- Priority.
- SLA.
- Completeness.
- Assignment.
- `Open workspace` action.

The inspector does not duplicate the complete Claim Workspace or add unsupported actions. From 768px to 1439px, the same preview opens as a drawer. Below 768px, it is omitted and each card links directly to the workspace.

### 10.5 Mobile queue

Below 768px, transform rows into structured claim cards while preserving every critical field and a clear route to the Claim Workspace.

## 11. Claim Workspace

The Claim Workspace is the primary product showcase.

### 11.1 Header band

Display:

- Back navigation.
- Claim number.
- Claimant name.
- Claim type and incident date.
- Priority and status.
- SLA and completeness.
- Assigned adjuster when present.

The header must answer:

1. What claim is this?
2. What is its operational state?
3. What requires attention?

### 11.2 Desktop composition

Use three coordinated zones:

1. **Primary evidence ledger** for claim facts, incident narrative, evidence state, and priority factors.
2. **Operational timeline** for audit history, actors, timestamps, summaries, and value transitions.
3. **Sticky command rail** for assignment, valid status transitions, contextual feedback, and review actions.

The zones remain visually connected without becoming nested card stacks.

### 11.3 Evidence ledger

Present evidence as a clear matrix:

- Present.
- Missing.
- Not applicable or unavailable only when supported by existing data.

Missing evidence receives warning emphasis. Present evidence remains quieter. Priority factors explain current backend output without implying editable scoring.

### 11.4 Decision support

Use a distinct dark command surface containing:

- Recommended action.
- Explanation.
- Confidence.
- Missing-information list.
- Review state.
- Reviewer when available.
- Approve and reject actions when pending.
- Explicit statement that the recommendation is advisory and requires human review.

Rules:

- Never label a recommendation as OpenAI-generated unless reliable provenance is added to the response model.
- Confidence uses a numeric value plus a visual indicator.
- Approve and reject differ through label, icon, shape, and semantic treatment, not color alone.
- Decision support cannot automatically change claim status, assignment, or outcome.

### 11.5 Audit timeline

Display all audit events by default. Each event shows available actor, timestamp, summary, event type, and value transition.

Differentiate claim creation, assignment, status transition, recommendation generation, and recommendation review.

## 12. New Claim Intake

The intake remains one Angular Reactive Form and one submit operation.

### 12.1 Visual stages

1. Claimant.
2. Incident.
3. Evidence.
4. Review and submit.

These are visible sections in one page, not separate routes or a multi-request wizard.

### 12.2 Desktop composition

Use:

- Main form column.
- Sticky progress and summary rail.
- Numbered section markers.
- Section descriptions.
- Grouped fields and helper text.
- Compact final review surface before submission.

### 12.3 Interaction treatment

- Claim types become selectable visual cards backed by the existing `claimType` control.
- Evidence items become accessible selection cards backed by real form controls.
- Progress reflects frontend form completion only.
- The frontend does not predict backend priority or authoritative completeness.

### 12.4 Validation

Preserve:

- Error-summary focus behavior.
- Required-field validation.
- Email validation.
- Future-date rejection.
- Estimated-loss minimum.
- Description length rules.
- Disabled submitting state.
- Server error feedback.

Inline errors supplement, but do not replace, the error summary.

## 13. Shared component architecture

### Application shell

- `app-shell`
- `primary-navigation`
- `workspace-header`
- `global-claim-search`
- `system-status`
- `mobile-navigation`

### Shared presentation

- `metric-instrument`
- `command-panel`
- `workspace-panel`
- `status-badge`
- `priority-badge`
- `progress-indicator`
- `sla-indicator`
- `filter-chip`
- `context-inspector`
- `context-drawer`
- `empty-state`
- `loading-skeleton`
- `inline-alert`
- `timeline-item`

Route components coordinate data and actions. Shared components receive typed inputs and emit user intent without owning backend rules.

Do not extract abstractions solely to reduce a few lines. Extract where a repeated visual or interaction contract exists.

## 14. Angular state and data flow

Use the existing Angular architecture:

- Signals for local display and interaction state.
- Computed signals for derived presentation state.
- RxJS and typed services for asynchronous API workflows.
- Reactive Forms for intake and queue controls.
- Router query parameters as the queue filter source of truth.
- Existing services and backend responses as authoritative data.

A new global state library is not justified for this scope.

Angular 20 implementation should continue using standalone, focused components and explicit loading, loaded, empty, and error rendering. Queue query-parameter behavior remains testable through Angular router testing utilities.

## 15. Loading, empty, success, and error behavior

Every route explicitly supports:

1. Initial loading.
2. Loaded state.
3. Empty state.
4. Recoverable route error.
5. Action in progress.
6. Action success.
7. Action failure.

Guidelines:

- Skeletons approximate final geometry to reduce layout shift.
- Route failures use a prominent alert with retry where retry is safe.
- Action failures remain near the action that caused them.
- Success feedback is perceivable without relying on color.
- Disabled controls explain their state where needed.
- Asynchronous action outcomes use accessible status announcements.

## 16. Controls and interaction states

### Buttons

- **Primary:** teal fill, dark text, reserved for the route's main action.
- **Secondary:** neutral or outlined.
- **Command:** dark fill on light surfaces.
- **Destructive:** red-accented and distinct from primary.
- **Approve and reject:** distinct icon, wording, and shape treatment.

### Inputs

- Default height: 40px to 44px.
- Persistent visible labels.
- Cyan focus ring plus neutral outline.
- Validation shown through message, icon, border, and semantic text.
- Search remains an accessible standard input.

### Badges and signals

Semantic states combine text, icon or marker, color, and accessible description where necessary.

## 17. Motion

Motion is functional and restrained:

- Hover and focus response: 100ms to 140ms.
- Panel entry: 160ms to 220ms.
- Inspector or drawer: approximately 220ms.
- Progress changes: 250ms to 350ms.
- Skeletons may use restrained opacity animation.
- Signal paths may animate once on initial load.
- No continuous decorative loops.
- `prefers-reduced-motion` disables nonessential movement.

## 18. Responsive behavior

### Desktop, 1280px and above

- Persistent sidebar.
- Multi-column dashboard.
- Semantic queue table.
- Claim Workspace with sticky command rail.
- Queue inspector appears at 1440px and above.

### Tablet, 768px to 1279px

- Compact sidebar or top navigation based on available width.
- Dashboard reduces to two columns.
- Queue preview uses a drawer.
- Sticky command rail becomes an inline or sticky-bottom action region.
- No horizontal page overflow.

### Mobile, below 768px

- Compact top application bar.
- Primary destinations remain directly accessible.
- Queue table becomes structured cards.
- Claim Workspace zones become a clear vertical sequence.
- Primary actions remain visible.
- Minimum 44px touch targets.
- No hidden hover-only content.

## 19. Accessibility

Preserve or improve:

- Skip-link behavior.
- Semantic landmarks and heading order.
- Form labels and descriptions.
- Error-summary focus behavior.
- Semantic desktop table markup.
- Visible keyboard focus.
- Non-color status communication.
- Accessible exact SLA and completeness values.
- Screen-reader announcements for asynchronous results.
- Reduced-motion support.
- WCAG AA contrast for normal text and controls.
- Logical focus movement when drawers or inspectors open and close.

## 20. Testing strategy

### Unit and presentation tests

Cover:

- SLA formatting.
- Status and priority presentation.
- Filter-chip removal.
- Form-completion progress.
- Validation-summary behavior.
- Recommendation action states.
- Loading, empty, success, and error rendering.
- Inspector and drawer state.

### Router and component tests

Verify:

- Queue filters remain URL-backed.
- Removing a filter updates the URL correctly.
- Global search navigates to `/claims?q=...`.
- Claim links navigate correctly.
- Desktop table and mobile cards expose equivalent critical data.
- Keyboard focus is visible and follows expected interaction.
- Form submission preserves the existing payload.
- Assignment and status actions use existing services.
- Recommendation approval and rejection preserve existing semantics.

Use Angular router testing utilities for route and query-parameter behavior.

### Verification commands

Frontend:

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

Backend policy verification:

```bash
cd backend
mvn verify
```

## 21. Visual fidelity workflow

Implementation proceeds against the approved Figma source, not memory.

For each major route:

1. Build the route shell and first viewport.
2. Run the application in a browser.
3. Capture desktop and mobile renders.
4. Compare the browser render directly with Figma and this specification.
5. Record and fix mismatches in layout, typography, color, spacing, iconography, density, responsive behavior, and interaction state.
6. Continue until no fixable design-review comments remain.

Required checks:

- Color lock against Direction A.
- Structural lock against Direction C.
- No invented visible data or controls.
- No generic repeated-card substitution.
- No icon-family drift.
- No browser-default control typography.
- No mobile overflow or clipped primary content.
- No static screenshot used as interactive UI.

## 22. Delivery sequence

### Phase 1, foundations

- Finalize the four-route Figma synthesis.
- Establish tokens, typography, icon rules, surfaces, spacing, and responsive behavior.
- Rebuild the application shell.
- Implement focused shared primitives.

### Phase 2, core routes

- Operations Overview.
- Claims Queue.
- Claim Workspace.
- New Claim.

The Claim Workspace receives the highest design and testing priority.

### Phase 3, states and polish

- Loading and empty states.
- Error and success states.
- Responsive layouts.
- Motion.
- Accessibility audit.
- Cross-route copy and visual consistency.

### Phase 4, verification

- Angular tests.
- Angular production build.
- Backend verification.
- Desktop, tablet, and mobile browser review.
- Direct concept-to-render fidelity review.
- Exact branch and pull-request head verification.

## 23. Acceptance criteria

The redesign is complete only when:

1. All four existing routes use the Adaptive Signal Ledger system.
2. Direction C's layout and hierarchy are recognizably preserved.
3. Direction A's near-black teal, teal, and cyan language is consistently applied.
4. Light working surfaces and dark command surfaces are used purposefully.
5. The dashboard is not a uniform card grid.
6. The desktop queue remains a semantic table.
7. The Claim Workspace is the most complete and visually sophisticated surface.
8. Decision support is clearly advisory and human-reviewed.
9. Existing API contracts and workflow behavior remain unchanged.
10. Loading, empty, error, success, and disabled states are intentional.
11. Keyboard, focus, contrast, reduced-motion, and mobile behavior pass review.
12. Frontend tests and production build pass.
13. Backend verification passes or any unrelated blocker is explicitly documented.
14. Browser renders are directly compared with Figma and no material, fixable mismatch remains.

## 24. Explicit decisions

- Canonical structure: Direction C.
- Canonical palette and signal energy: Direction A.
- Workspace strategy: mixed light and dark.
- Primary identity colors: near-black teal, teal, and cyan.
- Violet: recommendation context only.
- Claim Workspace: primary showcase surface.
- Desktop queue: semantic table, not cards.
- Queue inspector: required at 1440px and above, drawer from 768px to 1439px, omitted below 768px.
- Global search: existing `q` query parameter only.
- Dashboard current-state visuals: no trend or time-axis semantics.
- State management: existing signals, RxJS, Reactive Forms, and Router patterns.
- Global state library: not added.
- Backend behavior: unchanged.
- Rejected Figma Attempt 2: excluded from implementation.

There are no unresolved design decisions required before implementation planning.