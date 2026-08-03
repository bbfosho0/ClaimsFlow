# Deployment-Truthful Employer MVP Final Pass

## Status

Approved design for the final employer-facing ClaimsFlow polish and functionality pass.

## Objective

Make every surface shown to a potential employer functional, truthful, reactive, visually polished, and safe to deploy later without implying capabilities the application does not provide.

The final result must preserve the existing premium ClaimsFlow visual language while replacing fixture-driven KPIs and decorative controls with backend-derived data, real interactions, explicit disabled states, or removal.

## Product principles

1. Every visible KPI is derived from backend data.
2. Every visible control performs a real action, navigates to a real surface, is disabled with a specific explanation, or is removed.
3. Motion communicates live state, change, risk, progress, or user feedback. It does not exist merely to keep the screen moving.
4. The application preserves human authority over consequential claim decisions.
5. The deployed demo exposes only complete employer-facing surfaces.
6. Deterministic fictional seed data provides rich, repeatable demonstrations without misrepresenting production integrations.

## Approved scope

### Included

- Shared reactive operational data state
- Immediate invalidation after mutations
- Quiet 45-second polling while the tab is visible
- Manual refresh and last-updated status
- Backend-derived Dashboard, Analytics, Team Operations, and Documents data
- Deterministic historical seed data for meaningful trends
- Curated high-value filters
- Restrained state-driven motion
- Functional evidence-focused Documents workspace
- Removal of Reports and Settings from deployed navigation
- Accessibility, responsive, interaction, and visual quality assurance

### Excluded

- WebSocket or server-sent-event infrastructure
- Production authentication or RBAC
- Binary object storage
- Real OCR or document extraction
- Email, SMS, payment, policy, carrier, or external workflow integrations
- Production workflow activation
- Autonomous claim approval or denial
- Full Reports and Settings implementations

## Deployed navigation

### Claims Manager

- Operations Overview
- Claim Queue
- Analytics
- AI Insights
- Team Operations

### Adjuster

- My Work
- Claim Queue
- Documents
- Contextual Claim Workspace

### Administrator

- Workflow Automation

### Claimant

The independent claimant portal remains unchanged in role separation and continues to expose only claimant-safe claim, evidence, document-category, and message information.

### Hidden from deployed navigation

- Reports
- Settings

The existing routes and code may remain for future development, but employer walkthroughs and standard navigation must not expose placeholder surfaces.

## Architecture

## 1. Shared operational data store

Create a focused frontend `OperationalDataStore` that coordinates backend snapshots for Dashboard, Queue, Analytics, Team Operations, and Documents.

The store owns:

- Cached snapshots by query and filter set
- Loading and background-refresh state
- Last successful update time
- Stale and error state
- Mutation invalidation signals
- Visibility-aware polling
- Manual refresh requests

The store does not become a general application state framework. It remains bounded to employer-facing operational snapshots.

### Refresh lifecycle

1. Fetch immediately when a supported page is opened.
2. Reuse a valid recent snapshot when revisiting a page, then refresh in the background.
3. Refresh affected snapshot families immediately after:
   - claim creation
   - evidence changes
   - assignment changes
   - status changes
   - claimant-visible messages
   - demo reset
4. Poll every 45 seconds while `document.visibilityState === 'visible'`.
5. Pause polling while the browser tab is hidden.
6. Resume with an immediate refresh when the tab becomes visible.
7. Preserve the last successful snapshot during transient failures.
8. Mark data stale after repeated refresh failures without clearing the UI.

### User-visible refresh states

Supported pages display:

- `Updated just now`
- `Updated 32 seconds ago`
- `Refresh`
- `Updating…`
- A nonblocking stale-data message when the latest refresh fails

Initial loading uses layout-matched skeletons. Background refresh never blanks existing content.

## 2. Backend operational APIs

Add typed Spring endpoints that calculate aggregates from persisted claims, assignments, evidence state, messages, and audit events.

### Dashboard snapshot

Provides:

- open claims
- high or critical claims
- evidence-incomplete claims
- unassigned claims
- SLA-risk claims
- portfolio evidence readiness
- reviewer workload and capacity
- recent operational events
- categorized operational signal counts

No dashboard meter may use a hard-coded percentage.

### Analytics snapshot

Accepts the curated filter contract and provides:

- total claims
- open and resolved counts
- claim volume over time
- average resolution time
- status distribution
- priority distribution
- evidence readiness
- SLA-risk distribution
- regional distribution
- aging bands
- historical comparison values
- deterministic cohort data derived from persisted seeded records

### Team Operations snapshot

Accepts the curated filter contract and provides:

- active workload by team and adjuster
- configured capacity
- utilization
- SLA compliance
- at-risk and overdue counts
- aging
- queue ownership
- escalations
- performance summaries
- operational integrity inputs and score
- advisory recommendations with links to relevant filtered queues

Recommendations are explanatory and navigational. They do not silently reassign or mutate claims.

### Evidence Operations snapshot

Provides:

- claims with evidence state
- evidence categories and presence state
- completeness
- status
- priority
- SLA state
- assigned adjuster and team
- claimant identity and claim context
- claimant-visible message history

The workspace does not claim binary files, OCR, extraction, storage usage, file versions, collaborative comments, or unsupported upload processing.

## 3. Deterministic historical seed data

Extend demo seeding with a fictional, deterministic operational dataset sufficient to produce meaningful charts and filters.

The dataset includes:

- claims across several dates
- claim types
- priorities
- statuses
- regions
- teams and adjusters
- evidence completeness states
- assignments
- SLA deadlines
- status transitions
- audit events
- resolved timestamps

The existing reserved golden-journey claim remains isolated and resettable.

Historical seeds must be repeatable across environments. Tests must not depend on wall-clock randomness. Relative dates are generated from a defined seed anchor or deterministic clock abstraction.

## Curated filter contract

Every visible filter changes backend queries and recalculates the affected KPI, chart, list, and table state.

Supported filters:

- Date range
- Claim type
- Priority
- Status
- Assigned team or adjuster
- Region

Unsupported controls such as decorative channel, line-of-business, export, or comparison selectors are removed unless they are implemented within this pass.

Filter state should be representable in URL query parameters where practical so employer walkthrough links are reproducible.

## Surface behavior

## Operations Overview

- All KPIs come from the Dashboard API.
- The Active Portfolio meter is calculated rather than fixed.
- Intervention counts link to matching queue filters.
- Team capacity derives from actual assignments and configured capacity.
- Recent events derive from audit history.
- The golden-journey claim remains visibly connected to Manager operations.
- Manual refresh and update age are visible but unobtrusive.

### Command field

The command field becomes fully state-aware:

- total signal count reacts to the Dashboard snapshot
- category composition reacts to SLA, evidence, ownership, priority, and advisory counts
- signal tone and distribution reflect categories
- transitions occur when signal counts change
- ambient orbit, scan, and breathing remain restrained
- reduced-motion mode freezes nonessential animation

## Claim Queue

- Curated filters are functional.
- Search is functional.
- Rows update after store invalidation or polling.
- Changed rows receive a temporary highlight.
- Existing query links from Dashboard and Team Operations resolve to the same filter model.
- Empty results explain which filters produced the state and provide a clear reset action.

## Analytics

Replace frontend fixture arrays with typed backend snapshots.

Visible content is limited to charts and metrics supported by the backend data contract. Required interaction behavior:

- date and categorical filters recalculate all dependent visuals
- KPI values transition from previous to new values
- bars, rings, chart paths, and distributions transition to new positions
- chart points expose keyboard-accessible summaries or adjacent accessible data summaries
- tooltips define the metric and show exact values
- loading and stale states preserve layout
- no export control appears unless export is genuinely implemented

Charts must remain useful without animation or color alone.

## Team Operations

Replace static arrays and fake countdowns with backend-derived data.

- capacity derives from real assignments and configured capacity
- SLA risk and overdue counts derive from deadlines
- workload, queue ownership, and escalations link to filtered Claim Queue states
- performance summaries derive from persisted historical records
- advisory recommendations link to relevant work
- no recommendation button claims to rebalance or mutate staffing automatically
- any time-sensitive countdown is calculated from a real deadline and updates from a shared time source

## Documents

Reframe the current simulated content-management experience as a focused Evidence Operations workspace.

### Retained capabilities

- select a claim or evidence record
- filter by supported fields
- inspect evidence category presence
- inspect claim completeness, status, priority, SLA, owner, and claimant context
- inspect claimant-visible messages
- navigate to the authoritative Claim Workspace

### Removed capabilities

- fake file counts
- fake storage totals
- fake OCR and extraction
- fake confidence scoring
- fake versions
- fake collaborative comments
- fake bulk actions
- fake upload behavior
- fake email and SMS streams

Evidence category updates continue through the authoritative Claim Workspace or claimant portal flows already supported by the backend.

## Workflow Automation

Workflow Automation remains a clearly bounded portfolio demonstration:

- accepts real claim input
- performs local deterministic routing simulation
- supports local draft and validation state
- does not activate production workflows
- does not approve, deny, pay, or otherwise make consequential claim decisions
- explains the production boundary at the action point

## Motion and interaction system

## Motion categories

### Ambient status motion

Allowed only for genuinely live or time-sensitive elements:

- live portfolio indicator
- SLA-at-risk indicator
- active command-field signals
- Copilot orb
- current workflow simulation state

Ambient motion uses slow opacity, glow, scan, or subtle path movement. Whole cards do not float or continually scale.

### State-transition motion

Triggered only when underlying data changes:

- KPI number interpolation
- progress bars and rings moving to new values
- chart and sparkline path updates
- changed-row highlight
- semantic risk or success glow
- content crossfade after filter changes

### Interaction feedback

- hover translation remains approximately 1–3 pixels
- standard transitions remain approximately 160–280 milliseconds
- buttons expose default, hover, pressed, loading, success, disabled, and focus states where applicable
- filters acknowledge selection before data loading completes
- dialogs identify the exact resulting system change

## Accessibility and reduced motion

- Respect `prefers-reduced-motion` globally.
- Reduced-motion mode removes number interpolation, orbiting, breathing, scanning, sweeping, animated scrolling, and chart drawing.
- Values update immediately in reduced-motion mode.
- Changed values are announced concisely through `aria-live` without repeatedly announcing every polling cycle.
- Focus order and focus visibility remain clear.
- Charts include accessible names, exact values, and nonvisual summaries.
- Status is never communicated by color alone.
- Loading, error, empty, and stale states use appropriate live-region semantics.

## Error handling

### Initial request failure

- Show an inline error state in the expected content region.
- Preserve the page shell and navigation.
- Provide a retry action.

### Background refresh failure

- Keep the last valid snapshot visible.
- Mark it stale.
- Avoid modal interruptions.
- Reset stale state after a successful refresh.

### Partial aggregate failure

Backend aggregate endpoints return a coherent snapshot or a typed error. The frontend does not combine silently inconsistent partial responses into one apparently current dashboard.

### Empty data

- Explain the active filters.
- Provide one useful reset or navigation action.
- Do not fabricate placeholder metrics.

## Testing strategy

## Backend

- Repository and service tests for each aggregate calculation
- Filter-combination tests
- SLA boundary tests
- Capacity and workload tests
- Historical comparison tests
- Deterministic seeding tests
- Golden-journey reset isolation tests
- Evidence Operations response tests
- Authorization-boundary documentation tests where applicable

## Frontend

- OperationalDataStore cache, invalidation, polling, visibility, stale-state, and retry tests
- KPI change-animation tests using deterministic timers
- Reduced-motion tests
- Filter-to-query mapping tests
- Dashboard, Analytics, Team Operations, Queue, and Documents component tests
- Control integrity tests ensuring visible controls are functional, explicitly disabled, or absent
- Accessibility tests for focus, names, live regions, and chart summaries

## End-to-end and visual QA

Capture and verify at minimum:

- Manager Dashboard initial and changed state
- Analytics default and filtered state
- Team Operations default and filtered state
- Claim Queue filtered from Dashboard intervention
- Documents evidence selection
- Adjuster claim mutation reflected in Manager data
- stale-background-refresh state
- desktop and mobile layouts
- reduced-motion rendering

Visual QA must run against the actual Spring API and deterministic database seed.

## Acceptance criteria

The final pass is complete only when:

1. No deployed navigation surface displays unlabeled fixture KPIs.
2. Every visible KPI can be traced to a backend response.
3. Every visible control is functional, explanatory-disabled, navigational, or removed.
4. Dashboard, Analytics, Team Operations, Queue, and Documents react after supported mutations without a full browser reload.
5. Background refresh runs every 45 seconds only while visible.
6. Last valid data survives transient refresh errors.
7. Curated filters alter backend queries and all dependent visuals.
8. Motion reflects state or change and respects reduced motion.
9. Reports and Settings are absent from deployed navigation.
10. Documents makes no unsupported OCR, storage, versioning, comment, or upload claims.
11. Workflow Automation remains explicitly local and nonconsequential.
12. Automated tests and rendered visual QA pass on the exact final branch head.
13. The README and employer demo script explain what is real, deterministic, local-only, and intentionally out of scope.

## Employer walkthrough outcome

A reviewer can submit or reset the reserved claim, update evidence or communication as an Adjuster, and then observe the Manager Dashboard, Queue, Analytics, Team Operations, and Evidence Operations surfaces update with polished state-driven feedback. The experience demonstrates frontend engineering, backend aggregation, reactive data architecture, accessibility, testing, product judgment, and visual craft without overstating production capability.
