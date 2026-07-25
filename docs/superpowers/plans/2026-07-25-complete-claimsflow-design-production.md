# ClaimsFlow Complete Design Production Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the complete ClaimsFlow product design in Superdesign and Figma using the approved dark command-center visual system, with one stable navigation model, reusable foundations and components, every present and future page, responsive frames, interaction states, prototype flows, and a verified handoff package.

**Architecture:** Superdesign establishes one canonical visual source, beginning with Operations Overview and then generating coherent page batches from that source. Figma receives variables and reusable components before full pages are composed, preventing page-by-page drift. JSON ledgers record every Superdesign draft, Figma page, frame, variable collection, component, and prototype flow.

**Tech Stack:** Superdesign CLI, Figma Design, Figma Plugin API runtime, Angular 20 repository context, Inter, JetBrains Mono, Lucide icons, GitHub, Markdown, JSON.

## Global Constraints

- The approved dark ClaimsFlow reference images are the visual source of truth.
- Do not use the prior light or white PDF as a visual reference.
- The global sidebar is fixed: Overview, Claims, New Claim, Communications, Payments & Recovery, Analytics & Reports, Automation & Rules, AI Recommendations, Documents, Settings.
- Expanded sidebar width is `232px`; collapsed width is `72px`.
- Desktop frames are `1600px` wide; minimum desktop target is `1280px`.
- Workspace padding is `24px`; grid gap is `12px`; standard card padding is `16px`.
- Dense table rows are `48px`; controls are `36px`; primary actions are `40px`.
- Use Inter for UI and JetBrains Mono for identifiers, timestamps, SLA values, and aligned financial values.
- Use Lucide icons only, at `1.75px` stroke weight.
- AI surfaces use violet framing, explanation, evidence, confidence when available, and explicit human review.
- Consequential actions cannot appear autonomous.
- Warning and critical meaning must use labels and icons in addition to color.
- Every major page requires loading, empty, error, permission denied, offline, partial data, stale data, saving, saved, validation failure, confirmation, destructive action, no-results, and service-unavailable states.
- Meet WCAG 2.2 AA and support keyboard navigation, reduced motion, comfortable density, and high contrast.
- Use realistic fictional data only.
- Preserve current MVP route compatibility while designing the full future product.
- Angular implementation is outside this plan and begins only after the complete design is approved.

---

### Task 1: Prepare an isolated design-production workspace

**Files:**
- Modify: `.gitignore`
- Create: `.superdesign/tmp/.gitkeep`
- Create: `docs/design/claimsflow-superdesign-ledger.json`
- Create: `docs/design/claimsflow-figma-ledger.json`

**Interfaces:**
- Consumes: approved specification at `docs/superpowers/specs/2026-07-25-complete-claimsflow-product-design.md`.
- Produces: an isolated worktree and stable ledgers consumed by every later task.

- [ ] **Step 1: Create an isolated worktree**

```bash
git fetch origin
git worktree add ../ClaimsFlow-design-production design/complete-claimsflow-product-spec
cd ../ClaimsFlow-design-production
```

Expected: clean worktree on `design/complete-claimsflow-product-spec`.

- [ ] **Step 2: Ignore generated Superdesign temporary files**

Add to `.gitignore`:

```gitignore
.superdesign/tmp/*
!.superdesign/tmp/.gitkeep
```

- [ ] **Step 3: Create design directories and ledgers**

```bash
mkdir -p .superdesign/tmp docs/design/figma docs/design/reference-assets
touch .superdesign/tmp/.gitkeep
```

Create `docs/design/claimsflow-superdesign-ledger.json`:

```json
{"schemaVersion":1,"project":null,"canonicalDraft":null,"batches":[],"assets":[],"lastUpdated":null}
```

Create `docs/design/claimsflow-figma-ledger.json`:

```json
{"schemaVersion":1,"file":null,"pages":{},"variableCollections":{},"styles":{},"components":{},"frames":{},"prototypeFlows":{},"lastUpdated":null}
```

- [ ] **Step 4: Verify and commit**

```bash
python -m json.tool docs/design/claimsflow-superdesign-ledger.json >/dev/null
python -m json.tool docs/design/claimsflow-figma-ledger.json >/dev/null
git add .gitignore .superdesign/tmp/.gitkeep docs/design
git commit -m "chore: prepare ClaimsFlow design production workspace"
```

---

### Task 2: Initialize Superdesign from the Angular repository

**Files:**
- Create or replace: `.superdesign/init/components.md`
- Create or replace: `.superdesign/init/layouts.md`
- Create or replace: `.superdesign/init/routes.md`
- Create or replace: `.superdesign/init/theme.md`
- Create or replace: `.superdesign/init/pages.md`
- Create or replace: `.superdesign/init/extractable-components.md`

**Interfaces:**
- Consumes: Angular 20 frontend, existing shell and routes, approved specification.
- Produces: the six mandatory non-empty Superdesign repository-context files.

- [ ] **Step 1: Run the Superdesign preflight**

```bash
npx --yes @superdesign/cli@latest
```

Expected: an `auth:` line and recent projects.

- [ ] **Step 2: Authenticate only if preflight reports unauthenticated**

```bash
npx --yes @superdesign/cli@latest login
```

- [ ] **Step 3: Run the CLI repository initialization workflow**

Expected outputs:

```text
.superdesign/init/components.md
.superdesign/init/layouts.md
.superdesign/init/routes.md
.superdesign/init/theme.md
.superdesign/init/pages.md
.superdesign/init/extractable-components.md
```

- [ ] **Step 4: Verify all six files are non-empty**

```bash
for file in .superdesign/init/components.md .superdesign/init/layouts.md .superdesign/init/routes.md .superdesign/init/theme.md .superdesign/init/pages.md .superdesign/init/extractable-components.md; do
  test -s "$file" || exit 1
done
```

- [ ] **Step 5: Verify route context**

`.superdesign/init/routes.md` must distinguish current routes:

```text
/dashboard
/claims
/claims/new
/claims/:id
```

from the approved future design routes.

- [ ] **Step 6: Commit initialization**

```bash
git add .superdesign/init
git commit -m "docs: initialize Superdesign ClaimsFlow context"
```

---

### Task 3: Author the canonical Superdesign design system

**Files:**
- Create: `.superdesign/design-system.md`
- Create: `docs/design/reference-assets/README.md`

**Interfaces:**
- Consumes: approved dark references and product specification.
- Produces: one canonical system used by every Superdesign generation.

- [ ] **Step 1: Document reference roles**

`docs/design/reference-assets/README.md` must map the approved images to:

```text
Operations Overview — shell, KPI rail, charts, command-center density
Claims Queue — table density, filters, right inspector, risk language
New Claim Step 1 — stepper, summary rail, selection cards
New Claim Step 2 — incident form, map, parties, diagram
New Claim Step 3 — uploads, quality scan, completeness
Claim Workspace — identity header, tabs, advisory, audit
Communications — inbox, thread, intelligence inspector
Payments & Recovery — financial rail, ledger, controls inspector
Analytics & Reports — executive charts, report builder
Automation & Rules — library, rule builder, outcome preview
```

State that the fixed approved global navigation replaces any inconsistent navigation in the images.

- [ ] **Step 2: Write `.superdesign/design-system.md`**

Include exact tokens, typography, navigation, spacing, card treatment, signal-wave header, KPI rail, queue, workspace, inspector, configuration-studio, AI framing, risk framing, icons, motion, charts, responsive behavior, accessibility, fictional-data rules, and explicit rejection of white dashboards and excessive glow.

- [ ] **Step 3: Verify required tokens**

```bash
grep -n "#04111F" .superdesign/design-system.md
grep -n "#15CBE8" .superdesign/design-system.md
grep -n "#8B6CFF" .superdesign/design-system.md
grep -n "232px" .superdesign/design-system.md
grep -n "1600px" .superdesign/design-system.md
```

- [ ] **Step 4: Commit**

```bash
git add .superdesign/design-system.md docs/design/reference-assets/README.md
git commit -m "design: define canonical ClaimsFlow visual system"
```

---

### Task 4: Create the canonical Superdesign project and source draft

**Files:**
- Modify: `docs/design/claimsflow-superdesign-ledger.json`

**Interfaces:**
- Consumes: canonical design system, repository context, approved references.
- Produces: one project and one approved Operations Overview source draft.

- [ ] **Step 1: Create or reuse `ClaimsFlow Complete Product System`**

Run preflight. Reuse only an exact matching project; otherwise create it:

```bash
npx --yes @superdesign/cli@latest create-project --title "ClaimsFlow Complete Product System"
```

Record the returned project ID and canvas URL.

- [ ] **Step 2: Upload the approved local references**

Upload `/mnt/data/1000017016.png` through `/mnt/data/1000017022.png` that correspond to the approved dark ClaimsFlow references. Record each returned asset ID.

- [ ] **Step 3: Create the canonical Operations Overview draft**

Use `create-design-draft` with:

- title `ClaimsFlow — Canonical Operations Overview`
- the complete fixed grouped sidebar
- dark navy command-center system
- dotted signal-wave header
- connected KPI rail
- claims trend
- SLA risk wheel
- claims by type
- exception watchlist
- adjuster workload
- recommendation and audit feed
- truthful status footer
- `.superdesign/design-system.md` and relevant `.superdesign/init` files as context

- [ ] **Step 4: Review against ten lock criteria**

The source passes only when:

1. Sidebar labels, groups, order, profile, and system status are correct.
2. No white or pale dashboard foundation appears.
3. Header uses the subtle dotted signal wave.
4. KPI rail is connected and SLA Risk is strongest.
5. AI uses violet advisory framing.
6. Risk uses labels and icons in addition to color.
7. Glow is restrained.
8. Expert density remains readable.
9. Fictional data is coherent.
10. No unsupported real-time capability is claimed.

- [ ] **Step 5: Iterate only failed criteria**

Use `iterate-design-draft --mode branch` with one precise correction set per pass. Select the best passing branch and record it as `canonicalDraft`.

- [ ] **Step 6: Commit the ledger**

```bash
python -m json.tool docs/design/claimsflow-superdesign-ledger.json >/dev/null
git add docs/design/claimsflow-superdesign-ledger.json
git commit -m "design: record canonical ClaimsFlow Superdesign draft"
```

---

### Task 5: Generate the complete Superdesign page set

**Files:**
- Modify: `docs/design/claimsflow-superdesign-ledger.json`
- Create: `docs/design/figma/page-inventory.md`

**Interfaces:**
- Consumes: approved canonical source draft.
- Produces: all present and future product pages with the same shell and tokens.

- [ ] **Step 1: Create the exact page inventory**

Include:

```text
Operations Overview
Claims Queue
New Claim / Claimant
New Claim / Incident
New Claim / Evidence
New Claim / Coverage
New Claim / Review
Claim Workspace / Overview
Claim Workspace / Evidence
Claim Workspace / Notes
Claim Workspace / Communications
Claim Workspace / Payments
Claim Workspace / Related Claims
Claim Workspace / Audit
Communications Center
Payments & Recovery
Analytics / Overview
Analytics / Claims Volume
Analytics / Severity & Payments
Analytics / Operations
Analytics / SLA & Timeliness
Analytics / Fraud & Compliance
Analytics / Payer Insights
Analytics / Geography
Automation / Triage Rules
Automation / Assignment Logic
Automation / SLA Policies
Automation / Fraud Triggers
Automation / Document Requirements
Automation / Notifications
Automation / AI Controls
Automation / Audit Log
Automation / Rule Detail
AI Recommendations
Documents
Settings / Organization
Settings / Users and Teams
Settings / Roles and Permissions
Settings / Claims Configuration
Settings / SLA Configuration
Settings / Integrations
Settings / Notifications
Settings / AI Governance
Settings / Audit and Retention
Settings / Appearance and Accessibility
```

- [ ] **Step 2: Generate Claims Queue and Claim Workspace first**

Use `execute-flow-pages` from the canonical draft. Claims Queue uses the queue-plus-inspector pattern. Every Claim Workspace page preserves the same claim identity header and local tabs.

- [ ] **Step 3: Generate all five New Claim stages in one coherent batch**

The stepper order, summary rail, footer actions, claimant, policy, incident, and evidence data must remain continuous. Do not show authoritative backend-derived priority, status, or final coverage before submission.

- [ ] **Step 4: Generate Communications and Payments**

Global pages highlight their global sidebar items. Claim-scoped versions continue highlighting Claims.

- [ ] **Step 5: Generate Analytics and Automation**

Preserve the exact local tab order from the specification. Analytics charts require numeric summaries. Automation requires draft, test, conflict, publish, actor, time, and safety states.

- [ ] **Step 6: Generate AI Recommendations, Documents, and every Settings section**

Recommendations remain advisory. Documents distinguish AI quality from verified facts. Settings uses the dark configuration-studio layout, never plain white forms.

- [ ] **Step 7: Record every draft**

For every page record title, draft ID, preview URL, canonical source ID, and review status.

- [ ] **Step 8: Commit**

```bash
git add docs/design/claimsflow-superdesign-ledger.json docs/design/figma/page-inventory.md
git commit -m "design: generate complete ClaimsFlow product flow"
```

---

### Task 6: Run the Superdesign consistency gate

**Files:**
- Create: `docs/design/claimsflow-design-qa.md`
- Modify: `docs/design/claimsflow-superdesign-ledger.json`

**Interfaces:**
- Consumes: every generated draft.
- Produces: a locked source set approved for Figma.

- [ ] **Step 1: Score every draft**

Record `pass`, `revise`, or `blocked` for:

```text
global navigation
visual tokens
typography
spacing and density
risk framing
AI framing
tables and inspectors
claim context
New Claim continuity
global versus claim-scoped behavior
responsive assumptions
accessibility
unsupported capability claims
fictional-data consistency
```

- [ ] **Step 2: Correct failed drafts only**

Use branch iterations and preserve passing regions.

- [ ] **Step 3: Verify the canonical sidebar on every page**

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

- [ ] **Step 4: Mark passing entries**

Set `status` to `approved-for-figma` and `reviewedAgainstCanonical` to `true`.

- [ ] **Step 5: Commit**

```bash
git add docs/design/claimsflow-design-qa.md docs/design/claimsflow-superdesign-ledger.json
git commit -m "design: approve Superdesign source set for Figma"
```

---

### Task 7: Create the Figma file and ordered pages

**Files:**
- Modify: `docs/design/claimsflow-figma-ledger.json`

**Interfaces:**
- Consumes: approved Superdesign source set.
- Produces: one Figma file with the canonical page structure.

- [ ] **Step 1: Resolve the Figma plan**

Call `whoami`. Use the only returned plan. If multiple plans exist, ask the user which team or organization should own the file.

- [ ] **Step 2: Create `ClaimsFlow — Complete Product Design`**

Use editor type `design`. Record file key, URL, plan key, and project ID when present.

- [ ] **Step 3: Create pages in this exact order**

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

- [ ] **Step 4: Verify eighteen unique pages in the exact order**

Return all page names and IDs and record them in the ledger.

- [ ] **Step 5: Commit the ledger**

```bash
git add docs/design/claimsflow-figma-ledger.json
git commit -m "design: create ClaimsFlow Figma file structure"
```

---

### Task 8: Build Figma foundations and variables

**Files:**
- Modify: `docs/design/claimsflow-figma-ledger.json`
- Create: `docs/design/figma/component-inventory.md`

**Interfaces:**
- Consumes: approved tokens.
- Produces: variables and styles used by every component and screen.

- [ ] **Step 1: Search existing Figma libraries before creating equivalents**

Use `get_libraries` and `search_design_system`.

- [ ] **Step 2: Create collections**

```text
ClaimsFlow / Color
ClaimsFlow / Spacing
ClaimsFlow / Radius
ClaimsFlow / Elevation
ClaimsFlow / Density
ClaimsFlow / Motion
```

- [ ] **Step 3: Create exact color variables**

```text
canvas #04111F
sidebar #061525
surface/1 #091A2C
surface/2 #0D2136
surface/3 #122A42
border/subtle #18334D
border/strong #24516C
text/primary #F1F7FB
text/secondary #A9BBC9
text/muted #70889A
cyan #15CBE8
teal #18D6B0
violet #8B6CFF
emerald #38D98B
amber #FFB84A
red #FF5864
blue #4D9EFF
```

- [ ] **Step 4: Create spacing, radius, density, and motion variables**

```text
spacing: 4, 8, 12, 16, 20, 24, 32, 40
radius: 6, 8, 10, 14, 18
table row: 48 default, 56 comfortable
control: 36 default, 40 comfortable
motion: 120, 140, 160, 180, 220, 300
```

- [ ] **Step 5: Create text styles**

```text
Page Title / Inter / 28 / 650
Section Title / Inter / 16 / 650
Card Title / Inter / 12 / 650 / uppercase
Body / Inter / 13 / 400
Metadata / Inter / 11 / 450
KPI / Inter / 30 / 600
Table / Inter / 12 / 450
Identifier / JetBrains Mono / 13 / 550
```

- [ ] **Step 6: Create and verify a foundation test frame**

Show every variable and text style on `01 Foundations`. Inspect bindings, not just appearance.

- [ ] **Step 7: Record IDs and commit**

```bash
git add docs/design/claimsflow-figma-ledger.json docs/design/figma/component-inventory.md
git commit -m "design: build ClaimsFlow Figma foundations"
```

---

### Task 9: Build the reusable Figma component library

**Files:**
- Modify: `docs/design/claimsflow-figma-ledger.json`
- Modify: `docs/design/figma/component-inventory.md`

**Interfaces:**
- Consumes: Figma variables and text styles.
- Produces: components and variants used by every page.

- [ ] **Step 1: Build dependencies in order**

Icons, buttons, badges, fields, indicators, panels, navigation, tables, inspectors, then workspace assemblies.

- [ ] **Step 2: Create navigation components**

```text
Navigation/Sidebar/Section
Navigation/Sidebar/Item
Navigation/Sidebar/Profile
Navigation/Sidebar/SystemStatus
Navigation/Tabs/Item
Navigation/Stepper/Item
Navigation/Breadcrumb
```

- [ ] **Step 3: Create controls**

```text
Button/Primary
Button/Secondary
Button/Quiet
Button/Danger
Button/Intelligence
Button/Icon
Input/Search
Input/Text
Input/Textarea
Select/Single
Select/Multi
Filter/Chip
SavedView/Control
Segmented/Control
DateRange/Control
Pagination
Density/Control
```

- [ ] **Step 4: Create data components**

```text
Data/Metric/Item
Data/Metric/Rail
Data/Panel
Data/Table/Header
Data/Table/Row
Badge/Status
Badge/Priority
Badge/Confidence
Indicator/SLA
Indicator/Completeness
Indicator/Progress
Data/Sparkline
Timeline/Event
Evidence/Status
```

- [ ] **Step 5: Create workspace assemblies**

```text
Shell/GlobalSidebar
Shell/PageHeader
Shell/StatusFooter
Inspector/Base
Inspector/ClaimPreview
Inspector/Document
Inspector/Recommendation
Workspace/ClaimIdentityHeader
Workspace/ClaimTabs
Workspace/Conversation
Workspace/Composer
Workspace/RuleBuilder
Workspace/OutcomePreview
```

- [ ] **Step 6: Create feedback states**

```text
Feedback/Alert
Feedback/InlineMessage
Feedback/Toast
Feedback/ErrorSummary
Feedback/EmptyState
Feedback/Loading
Feedback/Skeleton
Feedback/OfflineBanner
Feedback/StaleData
Dialog/Confirmation
Dialog/Destructive
```

- [ ] **Step 7: Verify states**

Every interactive component must define default, hover, focus-visible, active, selected, disabled, loading, and error where applicable.

- [ ] **Step 8: Record IDs and commit**

```bash
git add docs/design/claimsflow-figma-ledger.json docs/design/figma/component-inventory.md
git commit -m "design: build ClaimsFlow Figma component library"
```

---

### Task 10: Compose all full Figma pages

**Files:**
- Modify: `docs/design/claimsflow-figma-ledger.json`
- Modify: `docs/design/figma/page-inventory.md`

**Interfaces:**
- Consumes: approved Superdesign drafts and Figma library.
- Produces: every default desktop page and major interaction state.

- [ ] **Step 1: Build one global shell template on `03 Global Shell`**

Include fixed sidebar, page header, content grid, optional KPI rail, optional inspector, and optional footer. Record the wrapper frame ID.

- [ ] **Step 2: Compose in dependency order**

```text
Operations Overview
Claims Queue
Claim Workspace shell and tabs
New Claim shell and five stages
Communications
Payments & Recovery
Analytics and Reports
Automation and Rules
AI Recommendations
Documents
Settings
```

- [ ] **Step 3: Use component instances and variable bindings**

Do not use detached copies for sidebar, headers, buttons, badges, tabs, fields, table rows, inspectors, or common status components.

- [ ] **Step 4: Correct generated text without changing the approved composition**

Use exact approved route labels, fictional data, and product language.

- [ ] **Step 5: Create major interaction-state frames**

For each page include default plus the inspector, filter, selection, validation, loading, empty, and error states listed in the page inventory.

- [ ] **Step 6: Record every frame ID and source draft ID**

- [ ] **Step 7: Verify inventory completeness and commit**

```bash
git add docs/design/claimsflow-figma-ledger.json docs/design/figma/page-inventory.md
git commit -m "design: compose complete ClaimsFlow Figma pages"
```

---

### Task 11: Add responsive frames and universal states

**Files:**
- Modify: `docs/design/claimsflow-figma-ledger.json`
- Modify: `docs/design/figma/page-inventory.md`

**Interfaces:**
- Consumes: complete desktop pages.
- Produces: compact desktop, tablet, selected mobile review frames, and universal state boards.

- [ ] **Step 1: Create representative `1280px` compact-desktop frames**

Overview, Claims Queue, Claim Workspace, New Claim, Communications, Automation. Use the `72px` sidebar.

- [ ] **Step 2: Create tablet landscape frames**

Claims Queue, Claim Workspace, Communications, Recommendation Review. Three columns become two and inspectors become drawers where required.

- [ ] **Step 3: Create limited mobile review frames**

High-priority queue, claim identity and urgent actions, communication thread, recommendation review, evidence preview. Do not reproduce full desktop analytics density.

- [ ] **Step 4: Create universal state boards on `16 States and Accessibility`**

```text
loading
empty
error
permission denied
offline
partial data
stale data
saving
saved
validation failure
confirmation
destructive action
no search results
service unavailable
```

- [ ] **Step 5: Annotate keyboard order, focus, chart summaries, non-color cues, reduced motion, comfortable density, and high contrast**

- [ ] **Step 6: Commit**

```bash
git add docs/design/claimsflow-figma-ledger.json docs/design/figma/page-inventory.md
git commit -m "design: add ClaimsFlow responsive and application states"
```

---

### Task 12: Build prototype flows and final handoff

**Files:**
- Create: `docs/design/figma/prototype-flows.md`
- Modify: `docs/design/claimsflow-design-qa.md`
- Create: `docs/design/claimsflow-design-handoff.md`
- Modify: both design ledgers

**Interfaces:**
- Consumes: complete Figma design.
- Produces: ten tested prototype flows, final QA, and implementation-ready handoff.

- [ ] **Step 1: Build and document ten prototype flows**

1. Overview to SLA-filtered Queue to Claim Workspace
2. Queue filtering, selection, inspector, and opening
3. Five-stage New Claim
4. Evidence review and recommendation decision
5. Communications response
6. Payment review or approval
7. Automation rule creation, testing, and publication
8. AI recommendation review
9. Document verification
10. Settings policy update

Each flow includes success, cancellation, validation failure, and service-failure paths.

- [ ] **Step 2: Run navigation QA**

Verify the same groups, items, order, labels, profile, system status, dimensions, and active-route rules on every page.

- [ ] **Step 3: Run visual-token QA**

Verify no white foundation, variable bindings, violet AI framing, semantic risk framing, typography, radii, borders, and restrained glow.

- [ ] **Step 4: Run product-coherence QA**

Verify global versus claim-scoped Communications and Payments, persistent Claim Workspace context, New Claim continuity, and consistent future modules.

- [ ] **Step 5: Run accessibility and governance QA**

Verify WCAG AA, visible focus, keyboard notes, chart summaries, non-color cues, reduced motion, comfortable density, high contrast, fictional data, advisory AI, and no unsupported capabilities.

- [ ] **Step 6: Write `docs/design/claimsflow-design-handoff.md`**

Include Superdesign canvas, approved draft links, Figma file, page inventory, route-to-frame mapping, variables, components, prototypes, responsive behavior, universal states, accessibility, AI governance, Angular boundaries, and deliberate non-goals.

- [ ] **Step 7: Validate artifacts**

```bash
python -m json.tool docs/design/claimsflow-superdesign-ledger.json >/dev/null
python -m json.tool docs/design/claimsflow-figma-ledger.json >/dev/null
grep -RniE "TBD|TODO|implement later|fill in details" docs/design .superdesign/design-system.md
```

Expected: JSON checks pass and no unresolved placeholders exist.

- [ ] **Step 8: Commit final handoff**

```bash
git add docs/design .superdesign/design-system.md
git commit -m "design: complete ClaimsFlow product design handoff"
```

- [ ] **Step 9: Update draft PR #4**

Add Superdesign and Figma links, completed page count, component count, prototype count, QA result, and handoff path. Mark the PR ready only after every QA item passes.

## Execution Boundaries

- Superdesign must pass its consistency gate before Figma composition begins.
- Figma variables and components must exist before full pages are composed.
- Figma writes to one file are serialized; concurrent discovery reads are allowed.
- Every Figma mutation records created or updated IDs before dependent calls.
- Failed calls resume from recorded IDs instead of rerunning the complete build blindly.
- Component publication and Code Connect are excluded because publishing is user-controlled and Angular implementation has not started.
- Angular implementation begins only after the completed Figma design is approved and a separate implementation plan is written.
