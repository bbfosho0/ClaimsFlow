# ClaimsFlow Midnight Command v2 Full Figma Parity Design

**Status:** Approved design specification  
**Date:** 2026-08-02  
**Repository:** `bbfosho0/ClaimsFlow`  
**Figma source:** `M7GOuna2hq7jWCGTZhiP5b`  
**Target:** Full parity with the approved Midnight Command v2 system and production screens

## 1. Objective

Transform the existing ClaimsFlow Angular application so the running repository matches the approved Figma system in visual quality, structure, route coverage, and interaction behavior.

The implementation must preserve the current Spring Boot claims domain, API contracts, deterministic decision rules, explicit human authority, audit history, accessibility, responsive behavior, and test coverage. This is a frontend system migration and route expansion, not a backend rewrite.

The finished application must look like one coherent premium enterprise product rather than a collection of separately styled pages. Every operational route must use the same navigation rail, top bar, spacing contract, typography hierarchy, panel language, data visualization treatment, state patterns, and responsive behavior.

## 2. Approved scope

### 2.1 Production routes

| Route | Product screen | Data source |
| --- | --- | --- |
| `/app/dashboard` | Executive Overview | Existing dashboard API |
| `/app/claims` | Claim Queue | Existing claims API |
| `/app/claims/:id` | Claim Detail / Command Dossier | Existing claims, evidence, recommendation, and audit APIs |
| `/app/claims/new` | New Claim Intake | Existing reactive form and claims API |
| `/app/intelligence` | AI Risk and Fraud Insights | Existing recommendation and intelligence APIs |
| `/app/analytics` | Analytics and Reporting | Typed deterministic frontend service |
| `/app/documents` | Documents and Communications | Typed deterministic frontend service |
| `/app/team-ops` | Team Operations and SLA Management | Typed deterministic frontend service |
| `/app/workflows` | Workflow Automation and Rules Builder | Typed deterministic frontend service |

### 2.2 Secondary navigation destinations

The universal navigation also includes My Work, Reports, and Settings. These destinations must not be dead links. They will render premium route-aware placeholder workspaces that clearly state their planned capability and use the same shell, loading, empty, and responsive patterns.

### 2.3 Public experience

The existing public showcase and guided tour remain. Their visuals, route references, and product narrative will be updated to represent the new production application rather than the previous 176 px shell and five-route system.

## 3. Architecture

The existing Angular 20 standalone architecture remains authoritative.

```text
AppShellComponent
├── UniversalSidebarComponent
├── UniversalTopbarComponent
├── RouteWorkspace
│   └── lazy-loaded routed page
├── CopilotCardComponent
└── MobileNavigationComponent
```

Backend behavior remains within the existing Spring Boot modular monolith.

```text
Angular route page
    |
    | typed service boundary
    v
Existing Spring REST API or deterministic frontend workspace service
```

### 3.1 Existing API-backed pages

The current dashboard, claims queue, claim detail, new claim, and intelligence services remain in place. Their presentation components may be reorganized, but domain behavior must not move into visual components.

The following rules remain unchanged:

- Claim completeness, priority, SLA, transitions, and claim numbers remain backend authoritative.
- Recommendation generation remains advisory.
- Approval or rejection requires an explicit human review action and reason.
- Recommendation review does not silently mutate claim status.
- Audit events retain operator intent and remain immutable.

### 3.2 New workspace services

The four new routes use typed services instead of importing fixture objects directly into page components.

```text
AnalyticsDataService
DocumentsWorkspaceService
TeamOperationsService
WorkflowDesignerService
```

Each service exposes stable signals or observables and a contract that can later be replaced by an HTTP implementation without redesigning page components.

The initial datasets are deterministic so tests, screenshots, and demonstrations remain repeatable.

## 4. Midnight Command v2 visual system

### 4.1 Core palette

| Role | Value |
| --- | --- |
| Canvas | `#02050B` |
| Canvas raised | `#040912` |
| Navigation | `#07101A` |
| Surface default | `#09141F` |
| Surface elevated | `#0C1925` |
| Surface strong | `#10212E` |
| Border subtle | `#1B3342` |
| Border strong | `#2A4B5D` |
| Text primary | `#F4F8FB` |
| Text secondary | `#9FB0BB` |
| Text muted | `#667A88` |
| Cyan activity | `#24D6F3` |
| Teal action | `#17D6B0` |
| Violet intelligence | `#746BFF` |
| Amber warning | `#F5B642` |
| Coral critical | `#FF5B67` |
| Blue information | `#4E86FF` |
| Emerald success | `#22D48A` |
| Magenta chart | `#B16BFF` |

Compatibility aliases may remain temporarily while existing consumers migrate, but all final route styling must resolve to the Midnight Command semantic tokens.

### 4.2 Geometry contract

| Element | Contract |
| --- | --- |
| Desktop navigation rail | 216 px |
| Shell gutter | 16 px |
| Desktop top bar | 1176 x 84 px |
| Main content region | 804 px reference width |
| Inspector region | 320 px reference width |
| Desktop viewport reference | 1440 x 1180 px |
| Intelligence cockpit reference | 1920 x 1180 px |
| Standard control height | 42 px |
| Compact control height | 34 px |
| Standard table row | 64 px |
| Compact table row | 52 px |

### 4.3 Radius and surface hierarchy

- Controls: 8 px
- Cards: 12 px
- Panels: 14 px
- Large containers: 18 px
- Hero surfaces: 24 px
- Pills: 999 px

Surface effects use restrained depth:

- Default panel shadow
- Elevated inspector shadow
- Cyan focus glow
- Teal live-state glow
- Violet intelligence glow
- Coral critical glow
- Optional glass blur for overlays and Copilot surfaces

Glows must remain bounded. They may reinforce focus, intelligence, live state, or critical state, but they must not create unreadable neon haze.

### 4.4 Typography

Inter remains the production typeface. The implementation will align to the Figma hierarchy:

- Page: 30/36 bold
- Section: 22/28 bold
- Panel: 18/24 bold
- Card: 16/22 semibold
- Body default: 12/18 regular
- Body compact: 11/16 regular
- Control: 12/16 semibold
- Labels: 9 to 10 px bold uppercase with controlled tracking
- Metrics: 20, 26, 32, and 72 px bold tiers

Page titles and metrics must be visibly stronger than dense operational labels. Tiny text must not become the dominant visual language.

## 5. Universal application shell

### 5.1 Navigation order

1. Overview
2. Claim Queue
3. New Claim
4. My Work
5. Analytics
6. AI Insights
7. Documents
8. Team Ops
9. Workflows
10. Reports
11. Settings

The rail ends with:

- AI Copilot card
- Alex Morgan profile block
- Claims Manager role label

All routes use identical rail geometry. Only the active destination changes.

### 5.2 Top bar

Every operational route uses the same top bar structure:

- Route title
- Route subtitle
- 340 px global search control
- Keyboard shortcut hint
- Notifications control
- Help control
- Alex Morgan profile control

Route title and subtitle come from route metadata rather than being duplicated in page templates.

### 5.3 Responsive behavior

#### Desktop

- Fixed 216 px rail
- Full 1176 x 84 top bar
- Content uses the shared shell grid

#### Tablet

- Collapsed icon rail
- Expandable navigation labels
- Top bar retains search and primary controls with reduced width

#### Mobile

- Compact header
- Five-item bottom navigation for primary tasks
- Secondary destinations in an accessible drawer
- No desktop rail squeezed into the viewport

Reduced-motion mode disables atmospheric drift, scanning highlights, nonessential scale transforms, and decorative animated glows.

## 6. Shared components

The implementation will create or consolidate the following component families.

```text
frontend/src/app/shared/ui/
├── app-panel/
├── metric-card/
├── status-chip/
├── icon-button/
├── segmented-tabs/
├── filter-control/
├── progress-meter/
├── data-table/
├── chart-card/
├── empty-state/
├── skeleton-state/
└── copilot-card/

frontend/src/app/core/layout/
├── app-shell/
├── app-sidebar/
├── app-topbar/
└── mobile-navigation/
```

Existing metric card, status badge, progress indicator, and visualization components will be migrated rather than duplicated where their responsibilities match.

Shared components must expose semantic inputs, not route-specific presentation assumptions. For example, a status chip accepts a tone and label rather than knowing about a specific claim status enum.

## 7. Route designs and behavior

### 7.1 Executive Overview

- Six high-priority operational metrics
- Portfolio pressure and intervention queue
- Trend and flow visualizations
- Capacity and SLA intelligence
- Audit and recent activity
- Route-level filters

Data remains API-backed. Existing dashboard actions and refresh behavior remain functional.

### 7.2 Claim Queue

- Shared filters and density controls
- Premium table hierarchy
- Claim risk, SLA, status, and assignee semantics
- Selected-claim context inspector
- Loading, empty, error, and populated states
- Keyboard-accessible selection and actions

Existing queue filters and claim navigation remain functional.

### 7.3 Claim Detail / Command Dossier

- Claim identity and status band
- Evidence ledger
- Workflow and assignment actions
- Recommendation reasoning
- Human authority controls
- Audit timeline
- Fixed shell over a vertically scrollable dossier

Existing status transitions, recommendation review, evidence interpretation, and audit behavior remain intact.

### 7.4 New Claim Intake

- Guided stepper
- Structured claim intake dossier
- Validation summary
- Submission rail
- Backend-derived claim state after creation
- Accessible reactive form behavior

### 7.5 AI Risk and Fraud Insights

- Review queue
- Claim intelligence dossier
- Evidence reasoning graph
- Confidence composition
- Contextual assistant
- Explicit action preview and confirmation

The existing three-state Intelligence prototype behavior remains represented in the running application. Human confirmation remains mandatory for consequential actions.

### 7.6 Analytics and Reporting

- Date, comparison, line-of-business, type, region, and channel filters
- Six KPI cards
- Payout and resolution trends
- Regional distribution
- Approval funnel
- Severity mix
- Cohort analysis
- Operational benchmarks
- Fraud detection impact

Interactions include filter changes, comparison state, chart tooltips, and export feedback. Initial data is deterministic and frontend-owned.

### 7.7 Documents and Communications

- Folder navigation
- Document list and selection
- Document preview
- OCR and extracted entity tags
- Version metadata
- Communication timeline
- AI summary
- Collaborative comments
- Document integrity score

Interactions include folder filters, selected document, preview tabs, communication filters, and comment composition state. Unsupported persistence is not simulated as successful.

### 7.8 Team Operations and SLA Management

- Portfolio KPIs
- Team workload and capacity
- SLA countdowns
- Queue ownership
- Adjuster availability
- Recommendations
- Shift planning
- Priority heatmap
- Escalations
- Performance scorecard
- Operational integrity score

Interactions include date filters, team selection, capacity views, escalation inspection, and local recommendation application previews.

### 7.9 Workflow Automation and Rules Builder

- Component library
- Workflow canvas
- Typed workflow nodes
- Condition inspector
- Validation state
- Test controls
- Simulation results
- Versions and audit controls

The first release supports deterministic local editing and simulation. It does not claim server persistence, activation, or execution unless a backend contract is implemented.

## 8. State and error handling

Every data-driven route includes:

- Loading skeleton
- Empty state
- Recoverable error state
- Populated state
- Responsive state
- Reduced-motion state

Existing HTTP routes preserve typed errors and stale-request cancellation.

New deterministic workspace services expose explicit loading and error simulation hooks for tests. Page components must not swallow failures or present unsupported operations as completed.

## 9. Accessibility

The redesign must preserve or improve:

- Skip navigation
- Semantic headings
- Visible keyboard focus
- Accessible names for icon-only controls
- Form labels and descriptions
- Table semantics
- Non-color status indicators
- Minimum contrast for text and essential controls
- Reduced-motion behavior
- Logical mobile focus order
- Announced loading, error, and success feedback where appropriate

Decorative atmospheric layers must be excluded from the accessibility tree and must not interfere with pointer interaction.

## 10. Migration sequence

1. Update global tokens and compatibility aliases.
2. Build the universal sidebar, top bar, Copilot card, and mobile navigation.
3. Migrate shared panels, metrics, chips, controls, tables, charts, and state components.
4. Rebuild Executive Overview.
5. Rebuild Claim Queue.
6. Rebuild Claim Detail.
7. Rebuild New Claim Intake.
8. Rebuild AI Risk and Fraud Insights.
9. Add Analytics and Reporting.
10. Add Documents and Communications.
11. Add Team Operations and SLA Management.
12. Add Workflow Automation and Rules Builder.
13. Add My Work, Reports, and Settings placeholders.
14. Refresh the public showcase and guided tour.
15. Remove obsolete shell and token styling after all consumers migrate.
16. Complete route, responsive, accessibility, visual, test, and production build verification.

## 11. Testing strategy

### 11.1 Existing tests

Existing Angular tests must be updated rather than deleted. Backend tests remain unchanged unless the frontend exposes a genuine contract defect.

### 11.2 New frontend coverage

- Shell navigation and active route metadata
- Responsive navigation behavior
- Global search and top-bar controls
- Shared component state variants
- Analytics filters and comparison state
- Document selection and preview tabs
- Communication filters and comments state
- Team capacity and escalation interactions
- Workflow node selection, validation, and simulation
- Loading, empty, error, and populated states
- Reduced-motion behavior where testable

### 11.3 Required verification

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

```bash
cd backend
mvn verify
```

Completion claims require command output or successful CI results.

## 12. Visual validation

The implementation must be reviewed at these reference sizes:

- 1440 x 1180 desktop routes
- 1920 x 1180 Intelligence cockpit
- Representative tablet width
- Representative mobile width

Visual review must verify:

- Identical sidebar geometry and menu order across routes
- Identical top-bar geometry across routes
- Correct active states
- Correct hierarchy, spacing, radii, and panel depth
- No residual 176 px shell styling
- No route-specific shell drift
- No clipped content or horizontal overflow
- No unreadably small labels
- No excessive glow or blur
- No placeholder components that appear accidentally unfinished

## 13. Acceptance criteria

The feature is complete only when:

1. All nine production routes exist and use the Midnight Command v2 shell.
2. The first five routes preserve their existing API-backed business behavior.
3. The four new workspaces are typed, interactive, deterministic, and clearly separated from future API integration.
4. My Work, Reports, and Settings are valid premium route placeholders, not dead links.
5. Every route uses the same navigation order, active-state treatment, top bar, Copilot card, and profile block.
6. Desktop layouts closely match the approved Figma screens.
7. Tablet and mobile layouts are intentionally redesigned, not scaled-down desktop layouts.
8. Loading, empty, error, and populated states are present.
9. Keyboard navigation, focus visibility, semantic structure, contrast, and reduced motion remain functional.
10. The public showcase and tour describe the new system accurately.
11. No unsupported backend action is represented as persisted or successful.
12. Frontend tests, frontend production build, and backend verification pass.
13. The pull request includes route-by-route screenshots, verification results, migration notes, and known backend limitations.

## 14. Non-goals

This project does not include:

- Rewriting the Spring Boot domain architecture
- Production authentication or single sign-on
- Object-storage persistence for evidence files
- Real outbound email or SMS delivery
- Real carrier or policy-administration integrations
- Server persistence for workflow designer changes
- Cloud deployment infrastructure
- A WebGL dependency for operational routes

Shader-like visuals must use maintainable CSS, SVG, or bounded Canvas-compatible techniques unless a measured WebGL enhancement is separately approved.

## 15. Delivery strategy

Implementation will occur on a dedicated feature branch after an implementation plan is approved. Delivery will use a pull request containing:

- Design-system migration summary
- Route-by-route implementation summary
- Screenshots at reference viewports
- Test and build results
- Accessibility and responsive notes
- Known limitations for frontend-only routes
- Follow-up API integration boundaries

The implementation must remain reviewable. Large route work should be divided into coherent commits aligned with the migration sequence rather than delivered as one opaque change.
