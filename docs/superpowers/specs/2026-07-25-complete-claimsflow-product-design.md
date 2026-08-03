# ClaimsFlow Complete Product Design Specification

**Status:** Approved design specification  
**Date:** 2026-07-25  
**Repository:** `bbfosho0/ClaimsFlow`  
**Design branch:** `design/complete-claimsflow-product-spec`  
**Primary surfaces:** Desktop web application, tablet review mode, limited mobile support  
**Implementation target:** Angular 20 standalone components with lazy-loaded routes  

## 1. Purpose

ClaimsFlow is an insurance claims operations platform for adjusters, team leads, operations managers, reviewers, and administrators. It must help users triage incoming claims, identify urgency and missing evidence, assign work, progress claims through valid states, review automated recommendations, manage communications and payments, inspect audit history, and understand operational performance.

This document defines the complete product design, including the current MVP and approved future expansion. It replaces any prior light or white dashboard direction as the visual source of truth.

The application must look and feel like a precise insurance operations command center. It must not look like a generic admin template, a basic white dashboard, a consumer fintech product, or an ornamental cyberpunk interface.

## 2. Product principles

1. **Operational truth first.** Confirmed facts, deadlines, assignments, evidence status, and human decisions receive stronger hierarchy than decorative analytics.
2. **Risk must be scannable.** SLA pressure, missing evidence, critical priority, unassigned work, and exceptions must be identifiable in seconds.
3. **Human control is explicit.** Automated guidance remains advisory and cannot approve, deny, pay, close, or transition claims without an authorized human action.
4. **One stable system.** Navigation, tokens, component patterns, page headers, inspector behavior, and density remain consistent throughout the product.
5. **High density without visual noise.** ClaimsFlow supports expert operational work through compact layouts, progressive disclosure, structured hierarchy, and inspectors.
6. **Every signal is explainable.** Risk, confidence, recommendations, and automation outcomes show their source, reason, or supporting evidence.
7. **No unsupported claims.** Product designs must distinguish implemented capabilities, planned capabilities, and future concepts.

## 3. User roles and jobs

### 3.1 Claims adjuster

Needs to:

- find urgent assigned work quickly
- understand claim facts and missing evidence
- contact claimants, vendors, and internal teams
- move claims through valid status transitions
- review and act on recommendations
- document decisions and actions
- manage claim-level payments, reserves, and recovery

### 3.2 Team lead

Needs to:

- understand volume, priority, SLA risk, unassigned claims, and incomplete work
- balance adjuster workload
- review exceptions and escalations
- monitor recommendation quality and automation outcomes
- inspect claim and team audit activity

### 3.3 Operations manager

Needs to:

- understand performance trends and bottlenecks
- compare periods, teams, claim types, and locations
- configure operational policies and automations
- monitor financial exposure, recovery, and settlement progress
- export trusted reports

### 3.4 Reviewer or supervisor

Needs to:

- review AI and deterministic recommendations
- inspect supporting evidence and rationale
- accept, reject, or modify recommendations
- maintain a clear review trail

### 3.5 Administrator

Needs to:

- manage users, roles, teams, claim configuration, SLA policies, integrations, notifications, AI governance, retention, accessibility, and appearance

## 4. Scope model

ClaimsFlow is designed as a complete product with two implementation layers.

### 4.1 Current MVP routes

The current repository exposes:

```text
/dashboard
/claims
/claims/new
/claims/:id
```

These routes remain valid and are progressively expanded rather than discarded.

### 4.2 Approved complete product routes

```text
/dashboard

/claims
/claims/new
/claims/:claimId/overview
/claims/:claimId/evidence
/claims/:claimId/notes
/claims/:claimId/communications
/claims/:claimId/payments
/claims/:claimId/related
/claims/:claimId/audit

/communications
/communications/:threadId

/payments
/payments/:claimId

/analytics
/analytics/claims-volume
/analytics/severity-payments
/analytics/operations
/analytics/sla
/analytics/fraud-compliance
/analytics/payers
/analytics/geography

/automation
/automation/assignment
/automation/sla
/automation/fraud
/automation/documents
/automation/notifications
/automation/ai-controls
/automation/audit
/automation/rules/:ruleId

/ai-recommendations
/ai-recommendations/:recommendationId

/documents
/documents/:documentId

/settings
/settings/organization
/settings/users
/settings/roles
/settings/claims
/settings/slas
/settings/integrations
/settings/notifications
/settings/ai-governance
/settings/audit-retention
/settings/accessibility
```

Angular should implement major sections as lazy-loaded route groups and use nested child routes for the persistent Claim Workspace and Settings shells.

## 5. Canonical information architecture

### 5.1 Global sidebar

The global sidebar is identical on every page.

```text
OPERATIONS
Overview
Claims
New Claim
Communications
Payments & Recovery

INTELLIGENCE
Analytics & Reports
Automation & Rules
AI Recommendations
Documents

ADMINISTRATION
Settings
```

### 5.2 Sidebar rules

- Expanded width: `232px`
- Collapsed width: `72px`
- The order, labels, icons, profile block, and system-status block never change by page.
- Expanded mode displays section headings.
- Collapsed mode displays icons and accessible tooltips.
- Active navigation uses a cyan edge, brighter icon, subtle cyan-blue gradient, and readable text.
- Claim-level routes highlight `Claims` globally.
- Global Communications highlights `Communications`, while claim-scoped communications still highlights `Claims`.
- Global Payments highlights `Payments & Recovery`, while claim-scoped payments still highlights `Claims`.
- The sidebar supports keyboard navigation and clear focus states.

### 5.3 Relationship between global and claim-scoped features

- Global Communications shows conversations across claims. Claim Communications filters to one claim.
- Global Payments & Recovery shows organization-wide financial operations. Claim Payments filters to one claim.
- Global Documents manages all documents. Claim Evidence manages evidence attached to one claim.
- AI Recommendations is the organization-wide review queue. Claim Decision Support is embedded in a claim.
- Automation configures reusable policies. Claim actions show the results of those policies, not the editor.

## 6. Canonical visual direction

ClaimsFlow uses a premium dark command-center aesthetic based on the approved visual references.

### 6.1 Brand character

ClaimsFlow should feel:

- precise
- advanced
- calm under pressure
- operational
- trustworthy
- technically modern
- data-aware
- human-governed

ClaimsFlow should not feel:

- like a white generic admin dashboard
- like a consumer banking app
- like a video game HUD
- like an unreadable cyberpunk interface
- decorative at the expense of information clarity

### 6.2 Foundation colors

| Token | Value | Use |
| --- | --- | --- |
| `color.canvas` | `#04111F` | Application background |
| `color.sidebar` | `#061525` | Global navigation |
| `color.surface.1` | `#091A2C` | Main panels and cards |
| `color.surface.2` | `#0D2136` | Elevated controls and interactive panels |
| `color.surface.3` | `#122A42` | Selected rows and emphasized surfaces |
| `color.border.subtle` | `#18334D` | Default borders |
| `color.border.strong` | `#24516C` | Focused and elevated borders |
| `color.text.primary` | `#F1F7FB` | Titles and critical values |
| `color.text.secondary` | `#A9BBC9` | Supporting text |
| `color.text.muted` | `#70889A` | Metadata |

### 6.3 Semantic colors

| Token | Value | Use |
| --- | --- | --- |
| `color.cyan` | `#15CBE8` | Primary actions, focus, active navigation |
| `color.teal` | `#18D6B0` | Operational success and healthy progress |
| `color.violet` | `#8B6CFF` | AI, intelligence, recommendations |
| `color.emerald` | `#38D98B` | Confirmed success |
| `color.amber` | `#FFB84A` | Warning and approaching risk |
| `color.red` | `#FF5864` | Critical risk, overdue, destructive action |
| `color.blue` | `#4D9EFF` | Informational states |

Bright colors are signal colors. Large background regions remain navy and dark blue.

### 6.4 Surface treatment

```text
Default card background: color.surface.1
Interactive card background: color.surface.2
Selected card background: color.surface.3
Default border: 1px color.border.subtle
Focused border: cyan at 55% opacity
Critical border: red at 45% opacity
Standard radius: 10px
Elevated radius: 14px
Shadow: restrained dark ambient shadow
```

No heavy glass blur. Transparency is limited to decorative signal textures and overlays where legibility remains strong.

### 6.5 Typography

- Primary UI family: `Inter`
- Monospace family: `JetBrains Mono`
- Monospace is used for claim numbers, policy numbers, timestamps, SLA countdowns, identifiers, and aligned financial values.

| Role | Size | Weight |
| --- | ---: | ---: |
| Page title | 28px | 650 |
| Section title | 16px | 650 |
| Card title | 12px | 650, uppercase |
| Body | 13px | 400 |
| Metadata | 11px | 450 |
| KPI value | 26px to 32px | 600 |
| Table cell | 12px | 450 |
| Identifier | 12px to 14px | 550 monospace |

### 6.6 Layout grid

- Figma desktop frame: `1600px` wide
- Minimum desktop target: `1280px`
- Sidebar: `232px`
- Workspace outer padding: `24px`
- Grid gap: `12px`
- Standard card padding: `16px`
- Dense table row: `48px`
- Standard control height: `36px`
- Primary action height: `40px`
- Inspector width: `360px` to `400px`

### 6.7 Signature visual language

#### Signal-wave page headers

Page headers use a low-contrast cyan, blue, and violet dotted wave texture. Maximum opacity is 14%. It never interferes with text.

#### Operational metric rail

Top-level pages use connected KPI rails rather than unrelated floating cards. Subtle lines or chevrons communicate process flow.

#### Intelligence framing

AI and recommendation surfaces use:

- a violet icon
- a violet border or restrained violet-blue gradient
- confidence labeling
- explanation and supporting evidence
- explicit human review actions

#### Risk framing

Risk is communicated with text, icon, color, border treatment, and numeric timing. Color is never the only signal.

### 6.8 Icons

- Use Lucide icons throughout.
- Default stroke width: `1.75px`
- Dense controls: `16px`
- Standard navigation and buttons: `18px`
- KPI icons: `20px` to `22px`
- Do not mix icon families.

### 6.9 Motion

| Interaction | Duration |
| --- | ---: |
| Hover and focus | 120ms |
| Filter chip insertion | 140ms |
| Tab change | 160ms |
| Drawer or inspector | 180ms |
| Page module entrance | 220ms |
| Chart interpolation | 300ms |

No bounce, overshoot, dramatic parallax, or decorative motion. Reduced-motion mode removes wave animation, entrance motion, and chart interpolation.

## 7. Canonical application shell

```text
Global sidebar
└── Main workspace
    ├── Page header
    │   ├── title and description
    │   ├── context or date controls
    │   ├── signal-wave texture
    │   └── primary actions
    ├── optional KPI rail
    ├── primary operational workspace
    ├── optional inspector or drawer
    └── status or activity footer
```

### 7.1 Page header

Every page header includes:

- title
- one-line operational purpose
- optional information tooltip
- context, period, or view controls
- one primary action at most
- optional secondary action menu

### 7.2 Status footer

Operational pages may use a subtle footer showing:

- last refresh time
- connection state
- data coverage or synchronization
- relevant system warnings

The footer cannot imply live data unless the backend supports it.

## 8. Shared workspace patterns

### 8.1 Operational command center

Used by Overview and Analytics.

- KPI rail
- large primary chart or operational visualization
- supporting modules
- exception or action feed
- no decorative chart without a job-to-be-done

### 8.2 Queue plus inspector

Used by Claims, AI Recommendations, and Documents.

- command toolbar
- active filters
- dense table or structured list
- selected-row inspector
- URL-backed filters where practical
- keyboard selection support

### 8.3 Persistent entity workspace

Used by Claim Workspace, claim Communications, and claim Payments.

- persistent identity header
- local tabs
- contextual actions
- preserved claim context while navigating subsections

### 8.4 Configuration studio

Used by Automation and Settings.

- local navigation or library
- central configuration editor
- right-side explanation, preview, or outcome panel
- sticky save or publish controls

## 9. Page specifications

## 9.1 Operations Overview

**Route:** `/dashboard`

**Purpose:** Help team leads understand operational health and identify intervention points.

### Layout

```text
Page header
Connected operational metric rail
Claims trend                 SLA risk wheel        Claims by type
Exception watchlist          Adjuster workload     Decision and audit feed
Live operations footer
```

### KPI rail

- Open claims
- High priority
- SLA risk
- Unassigned
- Incomplete
- Auto-recommended

SLA Risk receives the strongest semantic emphasis.

### Modules

- claims received versus closed
- current SLA exposure
- claim-type distribution
- exception watchlist
- adjuster capacity
- recent recommendation and audit events

### Actions

- Open Claims Queue
- Open SLA Risk filtered view
- Open adjuster workload view
- Open claim from any exception or event

### Constraints

- Do not show percentage trends unless historical data exists.
- Do not claim real-time operation unless the backend supports it.
- Chart summaries must include numeric text.

## 9.2 Claims Queue

**Route:** `/claims`

**Purpose:** Help adjusters triage, compare, assign, and open claims quickly.

### Layout

```text
Page header
Search and command toolbar
Active filter chips
Queue metric strip
Claims table                         Claim preview inspector
Pagination and density controls
```

### Toolbar

- global queue search
- status
- SLA risk
- priority
- assignee
- claim type
- more filters
- saved views
- apply and reset where filters are not immediate

### Table columns

- selection
- claim number
- claimant
- type
- priority
- status
- assignee
- SLA time remaining
- completeness
- trend signal
- recommended next action

### Inspector

- claim identity
- type, status, and priority
- SLA countdown and risk level
- completeness ring
- top issues
- recommendation summary
- assignment
- quick actions
- Open Full Claim

### Interactions

- row selection opens the inspector
- Enter opens the full claim
- filters are bookmarkable
- visible columns and density are configurable
- bulk actions appear only when rows are selected

## 9.3 New Claim

**Base route:** `/claims/new`

The intake uses one persistent shell and five visual stages. The implementation may use child routes or a single route with step state, but browser refresh must preserve progress safely.

```text
Claimant → Incident → Evidence → Coverage → Review
```

### Shared intake shell

- five-stage stepper
- Save & Exit
- Back and Save & Continue
- persistent Claim Summary rail
- validation and completion status
- autosave state
- secure-data notice

### Step 1, Claimant

- filing relationship
- claimant identity
- contact information
- policy verification
- claim-type selection cards
- contextual guidance
- evidence checklist preview

### Step 2, Incident

- incident date and time
- time-zone handling
- location and map
- parties involved
- narrative of loss
- injury state
- police-report state
- weather, road, and visibility conditions
- optional incident diagram

### Step 3, Evidence

- drag-and-drop upload
- camera and scan actions
- file previews
- evidence categorization
- upload and validation state
- evidence completeness
- metadata editor
- AI quality scan
- missing-document detection

### Step 4, Coverage

- policy sections
- active coverages
- limits and deductibles
- potential conflicts
- exclusions
- coverage verification
- advisory summary

### Step 5, Review

- full claim summary
- evidence readiness
- validation results
- detected conflicts
- acknowledgments
- Submit Claim
- Save as Draft

### Intake authority boundary

Authoritative priority, final completeness, status, and coverage decisions are not shown until the backend evaluates the submitted claim.

## 9.4 Claim Workspace

**Base route:** `/claims/:claimId`

### Persistent identity header

- claim number
- claim type
- status
- priority
- SLA countdown
- claimant
- policy
- assignee
- previous and next claim navigation
- Actions menu

### Local navigation

```text
Overview
Evidence
Notes
Communications
Payments
Related Claims
Audit
```

### Overview tab

```text
Claim overview        Evidence completeness       Decision support
Loss details          Communications preview      Audit preview
```

Decision Support includes:

- recommended next action
- explanation
- confidence
- supporting evidence
- missing information
- review state
- reviewer
- approve, reject, or modify actions where authorized

### Evidence tab

- checklist
- files table
- verification status
- quality result
- missing items
- upload controls
- file preview inspector
- evidence history

### Notes tab

- adjuster notes
- internal notes
- structured note editor
- mentions
- pinned notes
- note history

### Communications tab

Claim-scoped communication center using the same components as global Communications.

### Payments tab

Claim-scoped reserves, payments, settlement, recovery, and compliance.

### Related Claims tab

- potential duplicates
- shared policies
- shared parties
- similar incidents
- relationship explanation
- link or dismiss

### Audit tab

- append-only timeline
- actor
- timestamp
- event type
- summary
- before and after values
- recommendation review events
- assignment and status transitions

## 9.5 Communications Center

**Routes:** `/communications`, `/communications/:threadId`

**Purpose:** Centralize claimant, adjuster, vendor, and internal communication.

### Layout

```text
Communication inbox       Conversation thread       Contact and intelligence inspector
```

### Modes

- Messages
- Calls
- Notes
- Activity

### Supported content

- email
- SMS
- phone call summaries and recordings
- internal notes
- attachments
- system events

### Inspector

- contact information
- associated claim
- engagement level
- urgency
- communication summary
- key topics
- recommended next action
- quick actions

### Composer

- Email
- Internal Note
- SMS
- Template
- attachments
- formatting appropriate to channel
- send state and delivery result

## 9.6 Payments & Recovery

**Routes:** `/payments`, `/payments/:claimId`

**Purpose:** Manage reserves, payments, settlements, and recovery.

### KPI rail

- total reserves
- paid to date
- outstanding
- recovered
- net exposure
- settlement progress

### Modules

```text
Payment trend        Reserve breakdown        Recovery trend        Subrogation
Payment ledger                                      Payee and controls inspector
```

### Ledger columns

- date
- transaction type
- payee
- description
- reserve category
- status
- amount
- remaining balance

### Inspector

- payee information
- payment method
- approval state
- compliance checks
- required documents
- next actions

### Financial formatting

- Use `en-US` currency formatting.
- Preserve exact transaction currency when supplied.
- Align monetary values with tabular numerals.
- Negative and recovered values include text or symbols in addition to color.

## 9.7 Analytics & Reports

**Base route:** `/analytics`

### Local navigation

```text
Overview
Claims Volume
Severity & Payments
Operations
SLA & Timeliness
Fraud & Compliance
Payer Insights
Geography
```

### Overview content

- claims volume over time
- claims by type
- severity distribution
- closure rate
- adjuster productivity
- SLA performance
- fraud flags
- payer mix
- geographic distribution

### Report Builder inspector

- saved reports
- date range
- comparison period
- grouping
- filters
- Run Report
- Export

### Chart standards

- charts use dark operational cards
- cyan and teal are primary series colors
- amber and red communicate risk
- all charts include labels and numeric summaries
- no 3D charts
- no decorative charts without decision value
- tables or textual summaries are available for accessibility

## 9.8 Automation & Rules

**Base route:** `/automation`

### Local navigation

```text
Triage Rules
Assignment Logic
SLA Policies
Fraud Triggers
Document Requirements
Notifications
AI Controls
Audit Log
```

### Layout

```text
Rule library           Visual rule builder           Outcome preview
Performance trend      Recent rule activity          Recommendation
```

### Rule builder capabilities

- conditions
- condition groups
- actions
- priority
- assignment
- notifications
- coverage review
- document requirements
- test rule
- draft and published states

### Outcome preview

- estimated claims affected
- queue-time impact
- SLA impact
- accuracy
- potential conflicts

### Safety

- dangerous rules require confirmation
- conflicting rules show explicit warnings
- publication records actor and time
- rules have draft, active, disabled, and archived states

## 9.9 AI Recommendations

**Routes:** `/ai-recommendations`, `/ai-recommendations/:recommendationId`

**Purpose:** Provide an organization-wide human-review queue for automated guidance.

### Queue columns

- claim
- recommendation type
- suggested action
- confidence
- operational impact
- generated time
- review state
- assigned reviewer

### Inspector

- recommendation
- explanation
- supporting evidence
- missing information
- similar-case pattern when available
- confidence
- provider or fallback provenance when available
- Accept
- Reject
- Modify
- Open Claim

### Governance boundary

A recommendation cannot approve, deny, pay, close, assign, or transition a claim without an authorized human action. The interface must not imply autonomous authority.

## 9.10 Documents

**Routes:** `/documents`, `/documents/:documentId`

**Purpose:** Provide organization-wide document search, quality, verification, and compliance management.

### Layout

```text
Document search and filters
Document table                         Document preview inspector
Missing and expiring document queues
```

### Table columns

- file name
- document type
- claim
- uploaded by
- uploaded date
- verification status
- quality
- expiration
- compliance state

### Inspector

- file preview
- metadata
- claim association
- AI quality scan
- verification history
- download
- replace
- reclassify
- open associated claim

## 9.11 Settings

**Base route:** `/settings`

Settings uses the same dark command-center system and a configuration studio, not plain white forms.

### Local navigation

```text
Organization
Users and Teams
Roles and Permissions
Claims Configuration
SLA Configuration
Integrations
Notifications
AI Governance
Audit and Retention
Appearance and Accessibility
```

### Layout

```text
Settings navigation
Configuration panel
Contextual explanation or preview
Sticky save bar
```

### Key capabilities

- role permission matrix
- SLA policy editor
- integration health
- notification channels
- AI provider and fallback controls
- human-review requirements
- data retention
- density preference
- reduced motion
- contrast preference

## 10. Shared component system

### 10.1 Navigation and shell

- `AppShell`
- `GlobalSidebar`
- `SidebarSection`
- `SidebarItem`
- `OperatorProfile`
- `SystemStatus`
- `PageHeader`
- `SignalWaveHeader`
- `StatusFooter`

### 10.2 Controls

- `Button` variants: primary, secondary, quiet, danger, intelligence
- `IconButton`
- `SearchField`
- `Select`
- `MultiSelect`
- `DateRangeControl`
- `FilterChip`
- `SavedViewControl`
- `SegmentedControl`
- `Tabs`
- `DensityControl`
- `Pagination`

### 10.3 Data display

- `MetricRail`
- `MetricItem`
- `Panel`
- `DataTable`
- `TableHeader`
- `TableRow`
- `StatusBadge`
- `PriorityBadge`
- `SlaCountdown`
- `CompletenessRing`
- `ProgressBar`
- `Sparkline`
- `Timeline`
- `EventItem`
- `EvidenceStatus`
- `ConfidenceBadge`

### 10.4 Workspaces and inspectors

- `RightInspector`
- `ClaimPreviewInspector`
- `DocumentInspector`
- `RecommendationInspector`
- `ClaimIdentityHeader`
- `ClaimWorkspaceTabs`
- `ConversationThread`
- `Composer`
- `RuleBuilder`
- `OutcomePreview`

### 10.5 Feedback and states

- `Alert`
- `InlineMessage`
- `Toast`
- `ErrorSummary`
- `EmptyState`
- `LoadingState`
- `Skeleton`
- `OfflineBanner`
- `StaleDataNotice`
- `ConfirmationDialog`
- `DestructiveDialog`

## 11. Component state requirements

Every interactive component must define:

- default
- hover
- focus-visible
- active
- selected
- disabled
- loading
- error when applicable

Tables additionally define:

- row hover
- row selected
- row keyboard focus
- sorting state
- bulk selection
- empty result
- partial load

Inspectors additionally define:

- closed
- opening
- open
- loading
- error
- unsaved content warning where applicable

## 12. Application states

Every major page must include designed states for:

- loading
- empty
- error
- permission denied
- offline
- partial data
- stale data
- saving
- saved
- validation failure
- confirmation
- destructive action
- no search results
- service unavailable

These states must use the canonical dark system and cannot fall back to generic browser messages.

## 13. Responsive behavior

### 13.1 Desktop

- Primary operating surface
- Full 232px sidebar
- Tables and multi-column layouts
- Persistent inspectors where space permits

### 13.2 Compact desktop and tablet landscape

- Sidebar collapses to 72px
- Three-column layouts become two-column
- Inspector becomes a drawer when needed
- Tables retain horizontal scrolling instead of removing important fields
- Claim identity header wraps into two rows

### 13.3 Tablet portrait

- Review and light-action mode
- Sidebar becomes a compact navigation drawer
- Tables may become structured cards when semantic order is preserved
- Secondary analytics stack vertically

### 13.4 Mobile

Mobile supports review, communication, approval, and urgent action. It does not require full parity with dense adjuster workflows.

- bottom or drawer navigation
- claim identity summary
- high-priority queue cards
- communication threads
- recommendation review
- simple evidence preview
- no attempt to reproduce full desktop analytics density

## 14. Accessibility

- Meet WCAG 2.2 AA for text and controls.
- Use a cyan focus ring with a 2px outer offset.
- Provide text and icons for warning, success, critical, and informational states.
- Maintain at least 40px interactive targets.
- Support keyboard access throughout tables, tabs, inspectors, dialogs, and navigation.
- Provide accessible names for icon-only controls.
- Charts require numeric summaries and accessible alternatives.
- Reduced-motion mode removes nonessential motion.
- Comfortable density mode increases row height, spacing, and control height.
- High-contrast preference increases borders and text contrast without changing semantic meaning.

## 15. Data and content standards

- Use realistic fictional data only.
- Never include real customer or protected personal data in design artifacts.
- Claim and policy numbers use consistent formatting.
- Dates use clear `MMM D, YYYY` or context-appropriate compact formats.
- Times include time zone when ambiguity is possible.
- SLA timing uses readable values such as `1h 23m`, `Due tomorrow`, or `3d remaining`, while preserving the exact deadline in accessible text.
- Financial values use `en-US` formatting unless a record specifies another currency.
- Avoid fabricated trends, percentages, or predictions without corresponding data support.

## 16. AI and automation governance

AI and automation surfaces must:

- identify advisory content visually
- provide explanation and evidence
- provide confidence only when confidence exists
- identify deterministic fallback or provider provenance when available
- require human review for consequential actions
- preserve reviewer, time, action, and rationale in audit history
- expose failure and unavailable states
- never present generated output as confirmed claim fact

## 17. Figma file organization

```text
00 Cover and Product Map
01 Foundations
02 Components
03 Global Shell
04 Operations Overview
05 Claims Queue
06 New Claim
07 Claim Workspace
08 Communications
09 Payments and Recovery
10 Analytics and Reports
11 Automation and Rules
12 AI Recommendations
13 Documents
14 Settings
15 Responsive
16 States and Accessibility
17 Prototype Flows
```

### 17.1 Variables

Create Figma variables for:

- colors
- spacing
- radii
- typography references
- elevation
- motion duration annotations
- density mode

### 17.2 Components

Components use slash naming:

```text
Navigation/Sidebar/Item
Navigation/Tabs/Item
Button/Primary
Button/Intelligence
Badge/Priority/Critical
Badge/Status/Open
Data/Metric/Item
Data/Table/Row
Inspector/ClaimPreview
Workspace/ClaimIdentityHeader
Feedback/Alert/Critical
```

### 17.3 Page-frame requirements

Each major page contains:

- default desktop frame
- major interaction states
- loading, empty, and error states
- inspector or drawer states
- compact desktop frame
- component annotations
- implementation notes

### 17.4 Prototype flows

Required Figma prototypes:

1. Overview to SLA-filtered Claims Queue to Claim Workspace
2. Claims Queue filtering, selection, inspector, and claim opening
3. Five-stage New Claim flow
4. Claim Workspace evidence review and recommendation decision
5. Communications response flow
6. Payment approval or review flow
7. Automation rule creation, testing, and publication
8. AI recommendation review
9. Document verification flow
10. Settings policy update

## 18. Superdesign workflow requirements

Superdesign is used to establish the full visual system before Figma production.

### 18.1 Source references

The approved dark ClaimsFlow images are the visual source. The white PDF and previous light mockups are not visual references.

### 18.2 Required first draft

Create one canonical `Operations Overview` draft containing:

- final global sidebar
- final page header
- final KPI rail
- final surfaces, typography, spacing, icons, and signal-wave texture
- representative charts, table, inspector, and AI panel

This draft becomes the style source for all generated flow pages.

### 18.3 Required flow generation

Generate pages in coherent batches from the canonical source:

1. Claims Queue and Claim Workspace
2. New Claim steps 1 through 5
3. Communications and Payments
4. Analytics and Automation
5. AI Recommendations, Documents, and Settings

Every generated page must preserve the same global sidebar and token system.

## 19. Angular implementation mapping

### 19.1 Routing

- Use lazy-loaded route groups for major product sections.
- Use nested child routes for Claim Workspace, Analytics, Automation, and Settings.
- Preserve existing MVP routes with redirects or compatible parent routes.
- Keep filters and selected views in URL query parameters where useful.

### 19.2 Component architecture

Organize components by purpose:

```text
core/layout
core/navigation
shared/controls
shared/data-display
shared/feedback
shared/inspectors
features/dashboard
features/claims/queue
features/claims/intake
features/claims/workspace
features/communications
features/payments
features/analytics
features/automation
features/recommendations
features/documents
features/settings
```

### 19.3 State and performance

- Continue using Angular signals and RxJS.
- Use `OnPush` change detection.
- Avoid loading major feature code before its route is activated.
- Virtualize very large tables where required.
- Preserve semantic HTML tables for desktop queue and ledger views.
- Use CSS variables generated from the design tokens.

## 20. Design QA acceptance criteria

### 20.1 Navigation consistency

- The same full global sidebar appears on every desktop page.
- The route label, icon, ordering, section headings, profile area, and system status do not change between screens.
- Claim-scoped pages highlight Claims globally.

### 20.2 Visual consistency

- No page uses a white dashboard foundation.
- All pages use the canonical navy surfaces and semantic accent system.
- AI surfaces use violet intelligence framing.
- Critical and warning states use the approved risk language.
- Typography, borders, radii, spacing, and card treatment match the tokens.

### 20.3 Product coherence

- Global and claim-scoped features are clearly differentiated.
- Claim context persists throughout Claim Workspace tabs.
- New Claim maintains progress and summary across all five stages.
- Queue, inspector, and workspace are distinct but connected.
- Future pages feel like parts of the same product, not separate mockups.

### 20.4 Accessibility

- Keyboard focus is visible.
- Contrast passes AA.
- Color is not the sole semantic cue.
- Charts include text summaries.
- reduced-motion and comfortable-density behavior are documented.

### 20.5 Data integrity

- No unsupported capabilities appear as live.
- No fake trends are shown without data.
- AI output is clearly advisory.
- Audit history is append-only in presentation.

## 21. Explicit non-goals

- Do not recreate the prior basic white PDF design.
- Do not make every surface glow.
- Do not turn ClaimsFlow into a decorative cyberpunk concept.
- Do not add consumer-facing marketing pages to this product file.
- Do not claim production compliance certification.
- Do not imply autonomous claim approval or denial.
- Do not sacrifice semantic HTML or accessibility for visual novelty.

## 22. Delivery sequence

1. Approve this written specification.
2. Create the implementation and design-production plan.
3. Initialize or refresh Superdesign context from the repository.
4. Create the canonical Operations Overview draft.
5. Review and lock the source design.
6. Generate the complete multi-page flow in Superdesign.
7. Build the Figma foundations, variables, and reusable library.
8. Compose every full page in Figma.
9. Create responsive frames, states, and prototypes.
10. Run visual and interaction QA.
11. Map approved components and routes into Angular implementation work.
