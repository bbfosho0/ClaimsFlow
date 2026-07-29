# ClaimsFlow Adaptive Signal Ledger Redesign

**Status:** Proposed for written-spec review  
**Date:** 2026-07-29  
**Repository:** `bbfosho0/ClaimsFlow`  
**Specification branch:** `design/adaptive-signal-ledger-spec`  
**Figma file:** https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b  
**Selected structural direction:** Direction C, Adaptive Ledger  
**Selected color direction:** Direction A, Signal Grid  

## 1. Purpose

Rebuild the ClaimsFlow Angular frontend into a distinctive, production-quality insurance operations product without changing the existing claims workflow, API contracts, or backend authority.

The approved direction is named **Adaptive Signal Ledger**. It combines:

- Direction C's application structure, navigation, contextual hierarchy, modular composition, and enterprise usability.
- Direction A's near-black teal shell, cyan and teal operational accents, stronger contrast, live-signal energy, and connected KPI treatment.
- A mixed surface strategy, with light working surfaces for reading and data entry, plus selected dark command surfaces for urgent, analytical, or decision-heavy work.

The redesign must make ClaimsFlow feel like a credible operational product, not a generic administration template, decorative concept board, consumer finance interface, or cyberpunk monitoring console.

## 2. Design source of truth

The implementation source of truth is this specification plus the approved Figma direction study:

- Direction C, structural reference: https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b?node-id=35-381
- Direction A, palette and signal reference: https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b?node-id=35-48

The implementation must not reproduce either frame unchanged. It must use Direction C's composition and Direction A's color and signal language as defined in this specification.

The earlier Figma Attempt 2 associated with draft PR 4 is rejected and is not an implementation reference. Its overlapping modules, malformed visualizations, placeholder iconography, uniform card treatment, and incomplete claim-workspace treatment must not be propagated.

## 3. Product goals

1. Make the frontend visually distinctive enough to function as a high-quality portfolio centerpiece.
2. Improve triage speed, hierarchy, and scanability for adjusters and team leads.
3. Make the Claim Workspace the strongest and most complete product surface.
4. Present decision support as useful, traceable, and explicitly human-governed.
5. Establish a reusable visual system shared across all routes.
6. Preserve the existing backend workflow and typed Angular service boundaries.
7. Maintain strong keyboard, focus, contrast, responsive, loading, empty, and error behavior.
8. Avoid the repeated-card-grid appearance common to generic dashboard templates.
9. Keep implementation practical within the current Angular codebase.

## 4. Non-goals

The redesign will not:

- Replace Angular or introduce a parallel frontend.
- Change backend endpoints, request models, response models, persistence, or business rules.
- Add authentication, production user management, or unsupported permissions.
- Add unsupported filters, sorting, saved searches, notifications, uploads, or external integrations.
- Fabricate trend percentages, historical analytics, recommendation counts, or provider status.
- Present deterministic fallback recommendations as OpenAI-generated.
- Allow decision support to approve, deny, assign, or transition a claim automatically.
- Add a global state library without a demonstrated need.
- Add a large UI framework solely for appearance.
- ship decorative animation, continuous ambient motion, excessive glow, or readability-reducing effects.
- Turn semantic tables into desktop card grids.

## 5. Existing application boundaries

The current routes remain:

- `/dashboard`
- `/claims`
- `/claims/new`
- `/claims/:id`

The redesign preserves:

- Angular standalone components.
- Existing lazy route loading.
- Existing typed HTTP services and models.
- Signals and RxJS data loading patterns.
- Reactive Forms and current validation constraints.
- URL-backed claims queue filters.
- Existing assignment, status-transition, recommendation-review, and audit behavior.
- Existing loading, error, empty, success, and disabled-state semantics.

The backend remains authoritative for:

- Priority.
- Evidence completeness.
- Assignment validity.
- Valid status transitions.
- Recommendation generation and review state.
- Audit events.

The frontend may derive presentation-only values such as readable SLA countdowns, form-completion progress, icon selection, display grouping, and visual urgency categories.

## 6. Product character

ClaimsFlow should feel:

- Precise.
- Calm under pressure.
- Operational.
- Technically modern.
- Data-aware.
- Trustworthy.
- Human-governed.
- Visually intentional.

It should not feel:

- Generic.
- Empty or sterile.
- Consumer-oriented.
- Game-like.
- Cyberpunk.
- Overly glossy.
- Decorated with unsupported data.

## 7. Visual architecture

### 7.1 Mixed surface strategy

The interface uses three primary visual layers:

1. **Dark application shell**  
   Used for navigation, global context, system identity, and selected command controls.

2. **Light working canvas**  
   Used for tables, forms, evidence reading, audit history, and information-dense tasks.

3. **Dark command surfaces**  
   Used selectively for operational pulse, urgent exceptions, decision support, and high-attention analytical modules.

Dark surfaces must be purposeful. The product must not become a uniformly dark dashboard.

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

Accent colors are reserved for meaning. Neutral surfaces must dominate so operational signals remain legible.

### 7.3 Typography

Use Inter where available, with the existing system-compatible sans-serif stack as fallback. Do not introduce a blocking font dependency.

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

Large type is reserved for page identity and high-value metrics. Toolbars, tables, navigation, inputs, and inspectors require deliberately specified typography and must not inherit browser-default control sizing.

### 7.4 Geometry and spacing

- Base unit: 4px.
- Primary spacing values: 8px, 12px, 16px, 24px, 32px, 40px.
- Small control radius: 8px.
- Standard workspace-panel radius: 14px.
- Major command-surface radius: 18px.
- Badge and chip radius: fully rounded.
- Desktop layout gaps: 20px to 24px.
- Dense table row target: approximately 56px.
- Interactive target minimum: 44px where practical, mandatory on mobile.

Borders and tonal separation provide most structure. Shadows communicate elevation only and remain restrained.

### 7.5 Icon system

Use one consistent outlined icon family with approximately 1.75px stroke weight and rounded line caps. Existing compatible icons may be retained. New icons should use production-quality inline SVG or the repository's established icon approach without adding a large dependency solely for icons.

Icons must match meaning and optical weight across navigation, controls, badges, tables, status indicators, empty states, and mobile actions.

## 8. Application shell

### 8.1 Desktop shell

Use a persistent left navigation region with:

- ClaimsFlow brand identity.
- Operations workspace label.
- Overview navigation.
- Claims navigation.
- New Claim navigation.
- Lower utility area.
- Generic system-health treatment where supported.
- Demo operator treatment only if already present and not presented as production authentication.

The active route uses a high-contrast dark-surface state with teal or cyan edge emphasis. Hover, focus, selected, and disabled states must be distinct.

### 8.2 Global workspace header

The main workspace header may include:

- Page identity.
- Current operational context.
- A global claim search or command entry point, limited to behavior the existing application can support.
- The current route's main action.

The header must not become crowded with decorative controls or unsupported status widgets.

### 8.3 Mobile shell

Below 768px:

- Replace the persistent sidebar with a compact top application bar.
- Keep the three primary destinations directly accessible where space permits.
- Avoid hover-dependent interaction.
- Preserve the main route action.
- Prevent horizontal page overflow.

## 9. Operations Overview

The dashboard becomes a decision surface rather than a row of equal cards.

### 9.1 Header and context ribbon

The top region includes:

- Page title.
- Concise operational summary.
- Primary `Create claim` action.
- A dark context ribbon for the most important supported operational condition.

The context ribbon may communicate existing SLA risk or queue conditions. It must not invent provider status, trend percentages, or unsupported historical comparisons.

### 9.2 KPI instruments

Display the existing five metrics:

- Open claims.
- High priority.
- SLA risk.
- Unassigned.
- Incomplete.

They must not be five identical rectangles.

- Open claims is the leading inventory instrument.
- SLA risk and high priority receive stronger semantic treatment.
- Unassigned and incomplete remain actionable but quieter.
- Thin connectors, aligned baselines, and shared signal strokes create Direction A's networked operational feeling.
- Every metric includes a label, exact value, semantic icon, and a short phrase derived only from the metric itself.
- No percentage changes, trend arrows, or historical graphs are shown unless the backend supplies the necessary data.

### 9.3 Dashboard modules

Use existing supported data for:

- Adjuster workload.
- Recent activity.
- Current operational conditions.

Approved composition:

1. **Operational pulse**  
   A dark command surface showing supported current-state distribution or activity. It must not display fabricated historical trend data.

2. **Action context**  
   A prioritized list of supported SLA or queue exceptions with direct navigation to the relevant queue or claim.

3. **Adjuster workload**  
   A light working surface with horizontal capacity indicators and exact values.

4. **Recent activity**  
   A compact chronological feed with differentiated event markers.

## 10. Claims Queue

The queue becomes a dense triage workspace.

### 10.1 Composition

Order:

1. Page header and result count.
2. Command toolbar.
3. Applied-filter strip.
4. Semantic desktop table.
5. Optional contextual inspector on sufficiently wide screens.

### 10.2 Command toolbar

The toolbar contains only supported controls:

- Search.
- Status.
- Priority.
- Assignment.
- Apply.
- Reset.

Search receives the most width. Applied filters appear as removable chips tied to the URL-backed filter state.

### 10.3 Desktop table

The desktop queue remains a semantic HTML table.

Required columns and hierarchy:

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

At wide desktop widths, selecting a row may open a narrow preview rail containing only existing claim data:

- Claimant.
- Claim type.
- Status.
- Priority.
- SLA.
- Completeness.
- Assignment.
- Direct `Open workspace` action.

The inspector must not duplicate the complete Claim Workspace or introduce unsupported actions.

### 10.5 Mobile queue

Below 768px, transform table rows into structured claim cards while preserving all important fields and a clear route to the Claim Workspace.

## 11. Claim Workspace

The Claim Workspace is the primary product showcase.

### 11.1 Header band

Display:

- Back navigation.
- Claim number.
- Claimant name.
- Claim type.
- Incident date.
- Priority.
- Status.
- SLA.
- Completeness.
- Assigned adjuster when present.

The header must answer:

1. What claim is this?
2. What is its operational state?
3. What requires attention?

### 11.2 Desktop composition

Use three coordinated zones:

1. **Primary evidence ledger**  
   Claim facts, incident narrative, evidence state, and priority factors.

2. **Operational timeline**  
   Audit history, actors, timestamps, summaries, and value transitions.

3. **Sticky command rail**  
   Assignment, valid status transitions, contextual feedback, and review actions.

The zones must remain visually connected without becoming nested card stacks.

### 11.3 Evidence ledger

Present evidence as a clear matrix:

- Present.
- Missing.
- Not applicable or unavailable only where the existing data supports that state.

Missing evidence receives warning emphasis. Present evidence remains quieter. Priority factors explain current backend output without implying editable scoring.

### 11.4 Decision support

Decision support uses a visually distinct dark command surface containing:

- Recommended action.
- Explanation.
- Confidence.
- Missing-information list.
- Review state.
- Reviewer when available.
- Approve and reject actions when pending.
- Explicit statement that the recommendation is advisory and requires human review.

Rules:

- Never label a recommendation as OpenAI-generated unless reliable provider provenance is added to the response model.
- Confidence uses a numeric value plus a visual indicator.
- Approve and reject actions must differ through label, icon, shape, and semantic treatment, not color alone.
- Decision support cannot automatically change claim status, assignment, or outcome.

### 11.5 Audit timeline

Display all audit events by default. Each event shows available actor, timestamp, summary, event type, and value transition.

Differentiate:

- Claim creation.
- Assignment.
- Status transition.
- Recommendation generation.
- Recommendation review.

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
- Grouped fields.
- Clear helper text.
- Compact final review surface before submission.

### 12.3 Interaction treatment

- Claim types become selectable visual cards backed by the existing `claimType` control.
- Evidence items become accessible selection cards backed by real form controls.
- Progress reflects frontend form completion only.
- The frontend must not predict backend priority or authoritative completeness.

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

Inline field errors may supplement, but not replace, the error summary.

## 13. Shared component architecture

### 13.1 Application shell components

- `app-shell`
- `primary-navigation`
- `workspace-header`
- `global-command-search`
- `system-status`
- `mobile-navigation`

### 13.2 Shared presentation components

- `metric-instrument`
- `command-panel`
- `workspace-panel`
- `status-badge`
- `priority-badge`
- `progress-indicator`
- `sla-indicator`
- `filter-chip`
- `context-drawer`
- `empty-state`
- `loading-skeleton`
- `inline-alert`
- `timeline-item`

Components must have focused ownership. Route components coordinate data and actions. Shared presentation components receive typed inputs and emit user intent without owning backend rules.

Do not create abstraction solely to reduce a few lines. Extract components where they establish a repeated visual or interaction contract.

## 14. Angular state and data flow

Use the existing Angular architecture:

- Signals for local display and interaction state.
- Computed signals for derived presentation state.
- RxJS and typed services for asynchronous API workflows.
- Reactive Forms for intake and queue controls.
- Router query parameters as the queue filter source of truth.
- Existing services and backend responses as the authoritative data source.

A new global state library is not justified for this scope.

Angular 20 implementation should favor standalone, focused components and explicit loading, loaded, empty, and error rendering. Queue query-parameter behavior should remain testable through Angular router testing utilities.

## 15. Loading, empty, success, and error behavior

Every route must explicitly support:

1. Initial loading.
2. Loaded state.
3. Empty state.
4. Recoverable route error.
5. Action in progress.
6. Action success.
7. Action failure.

Guidelines:

- Skeletons approximate final geometry to reduce layout shift.
- Route failures use a prominent alert with retry where the existing service can retry safely.
- Action failures remain near the action that caused them.
- Success feedback must be perceivable without relying on color.
- Disabled controls explain their state where needed.
- Live updates and action outcomes use appropriate accessible status announcements.

## 16. Controls and interaction states

### 16.1 Buttons

- **Primary:** teal fill, dark text, reserved for the route's main action.
- **Secondary:** neutral or outlined.
- **Command:** dark fill on light surfaces.
- **Destructive:** red-accented, visually distinct from primary.
- **Approve and reject:** distinct icon, wording, and shape treatment.

### 16.2 Inputs

- Default height: 40px to 44px.
- Persistent visible labels.
- Cyan focus ring plus neutral outline.
- Validation shown through message, icon, border, and semantic text.
- Search may use command styling but remains an accessible standard input.

### 16.3 Badges and signals

Semantic states combine:

- Text label.
- Icon or marker.
- Color.
- Accessible description where necessary.

## 17. Motion

Motion is functional and restrained:

- Hover and focus response: 100ms to 140ms.
- Panel entry: 160ms to 220ms.
- Inspector or drawer: approximately 220ms.
- Progress changes: 250ms to 350ms.
- Skeletons may use restrained opacity animation.
- Charts or signal paths may animate once on initial load when the data supports the visualization.
- No continuous decorative loops.
- `prefers-reduced-motion` disables nonessential movement.

## 18. Responsive behavior

### 18.1 Desktop, 1280px and above

- Persistent sidebar.
- Multi-column dashboard.
- Semantic queue table.
- Optional queue inspector.
- Claim Workspace with sticky command rail.

### 18.2 Tablet, 768px to 1279px

- Compact sidebar or top navigation according to available width.
- Dashboard reduces to two columns.
- Queue inspector becomes a drawer.
- Sticky command rail becomes an inline or sticky-bottom action region.
- No horizontal page overflow.

### 18.3 Mobile, below 768px

- Compact top application bar.
- Primary destinations remain directly accessible where practical.
- Queue table becomes structured cards.
- Claim Workspace zones become a clear vertical sequence.
- Primary actions remain visible.
- Minimum 44px touch targets.
- No hidden hover-only content.

## 19. Accessibility

The implementation must preserve or improve:

- Skip-link behavior.
- Semantic landmarks and heading order.
- Form labels and descriptions.
- Error-summary focus behavior.
- Semantic desktop table markup.
- Visible keyboard focus.
- Non-color status communication.
- Accessible exact SLA and completeness values.
- Screen-reader announcements for asynchronous action results.
- Reduced-motion support.
- Contrast appropriate to WCAG AA for normal text and controls.
- Logical focus movement when drawers or inspectors open and close.

## 20. Testing strategy

### 20.1 Unit and presentation tests

Cover:

- SLA formatting.
- Status and priority presentation.
- Filter-chip removal.
- Form-completion progress.
- Validation summary behavior.
- Recommendation action states.
- Loading, empty, success, and error rendering.
- Inspector or drawer state.

### 20.2 Router and component tests

Verify:

- Queue filters remain URL-backed.
- Removing a filter updates the URL correctly.
- Claim links navigate correctly.
- Desktop table and mobile cards expose equivalent critical data.
- Keyboard focus is visible and follows expected interaction.
- Form submission preserves the existing payload.
- Assignment and status actions use existing services.
- Recommendation approval and rejection preserve existing semantics.

Use Angular router testing utilities for route and query-parameter behavior.

### 20.3 Verification commands

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

Implementation must proceed against the approved Figma source rather than memory.

For each major route:

1. Build the route shell and first viewport.
2. Run the application in a browser.
3. Capture desktop and mobile renders.
4. Compare the browser render directly with the approved concept and this specification.
5. Record and fix mismatches in layout, typography, color, spacing, iconography, density, responsive behavior, and interaction state.
6. Continue until no fixable design-review comments remain.

Required fidelity checks include:

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

- Finalize Figma synthesis for the four existing routes.
- Establish tokens, typography, icon rules, surfaces, spacing, and responsive behavior.
- Rebuild the application shell.
- Implement focused shared primitives.

### Phase 2, core routes

- Operations Overview.
- Claims Queue.
- Claim Workspace.
- New Claim.

The Claim Workspace receives the highest design and testing priority.

### Phase 3, state and polish

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
3. Direction A's near-black teal, teal, and cyan operational language is consistently applied.
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
14. Browser renders are directly compared with Figma and no material, fixable visual mismatch remains.

## 24. Explicit decisions

- Canonical structure: Direction C.
- Canonical palette and signal energy: Direction A.
- Workspace strategy: mixed light and dark.
- Primary identity colors: near-black teal, teal, and cyan.
- Violet: recommendation context only.
- Claim Workspace: primary showcase surface.
- Desktop queue: semantic table, not cards.
- State management: existing signals, RxJS, Reactive Forms, and Router patterns.
- Global state library: not added.
- Backend behavior: unchanged.
- Rejected Figma Attempt 2: excluded from implementation.

There are no unresolved design decisions required before implementation planning.