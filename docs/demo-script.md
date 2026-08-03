# ClaimsFlow Interview Demo Script

Target length: seven to nine minutes.

## Before the interview

Start PostgreSQL, Spring Boot, and Angular with the demo environment enabled:

```bash
CLAIMSFLOW_DEMO_ENABLED=true mvn spring-boot:run
```

Open the employee application, use the profile menu, and choose **Reset Demo Journey**. Confirm `Demo journey reset.`

The reset:

- Preserves the deterministic 48-claim historical portfolio
- Recreates only the reserved fictional Taylor Reed journey
- Assigns the stable Jordan Lee adjuster
- Stores the real claim and adjuster IDs for every walkthrough route

## 0:00–0:35 — Product definition

Open `/tour`.

Use this sentence:

> ClaimsFlow connects claimant evidence, adjuster work, manager operations, and administrator routing around one auditable claim.

Explain that the claimant portal is independent from the employee shell and that each employee role sees only completed surfaces relevant to its work.

## 0:35–1:20 — Claimant perspective

Start the walkthrough. It opens the reserved claim in the claimant portal.

Show:

- Status and plain-language next action
- Evidence completeness
- SLA expectation
- Claimant-safe timeline
- Evidence categories
- Claimant-visible messages

State that the backend owns the claimant projection. It excludes internal priority rationale, recommendations, and internal notes.

Update one supported evidence category. Explain that the application persists evidence presence and recalculates completeness, priority, and SLA. It does not pretend to upload or store a binary file.

## 1:20–2:40 — Adjuster perspective

Advance to the Adjuster step. The same claim ID opens in Jordan Lee’s Claim Workspace.

Show:

- Assigned owner and team
- Evidence ledger
- SLA state
- Allowed backend transitions
- Evidence-grounded recommendation
- Audit history

Open Communications. Edit the claimant message, select **Review and send**, and pause at the confirmation dialog.

Point out the exact result before confirming:

- One claimant-visible message is created
- Jordan Lee is recorded as the author
- One audit event is appended
- Claim status does not change

Confirm and show `Request sent to the claimant portal.`

Open **My Work** briefly and show that its counts and claim cards come from the same filtered queue resource using Jordan Lee’s real seeded UUID.

## 2:40–4:40 — Manager operational impact

Advance to **Operations Overview**.

Show:

- The live golden-journey summary
- Open claims and active-portfolio percentage
- High-priority load
- Evidence readiness
- Ownership gap
- Categorized command-field signal composition
- Team capacity
- Recent persisted audit activity

Explain that every displayed number comes from `GET /api/dashboard`; the old fixed meter and fixture arrays are gone.

Point out the refresh status:

- Mutations invalidate active resources immediately
- Visible tabs refresh every 45 seconds
- Hidden tabs pause polling
- Background failure preserves the last valid snapshot and marks it stale

Open an intervention link. It lands in **Claim Queue** with the matching URL filter. Show:

- Search and curated filters
- Claim type, priority, status, team/adjuster, region, and date range
- Golden-journey selection
- Brief changed-row feedback
- One useful reset action when filters return no results

## 4:40–5:40 — Analytics and Team Operations

Open **Operational Analytics**.

Change Region to **West** and show that all dependent content recalculates:

- Estimated exposure
- Claim volume
- Resolved volume
- Average resolution time
- Evidence readiness
- SLA compliance
- Status, priority, and regional distributions
- Open-claim aging
- Resolution cohorts

State that these values come from persisted deterministic claims and resolution timestamps. There are no fake payout, approval-rate, or fraud-savings KPIs.

Open **Team Operations** and filter to one team. Show:

- Workload against configured capacity
- At-risk and overdue claims
- Assignment coverage
- Adjuster utilization
- Escalations with real deadlines
- Advisory links to filtered work
- Operational integrity formula

Recommendations navigate to relevant work. They do not silently rebalance or assign claims.

## 5:40–6:25 — Evidence Operations

Switch to the Adjuster role and open **Evidence Operations**.

Select the reserved claim and show:

- Claim status, priority, region, exposure, SLA, owner, and team
- Four persisted evidence-category states
- Claimant-visible message history
- Link to the authoritative Claim Workspace

State the truthfulness boundary:

- No binary object storage
- No OCR or extraction
- No file versions
- No fake confidence score
- No collaborative comments
- No email or SMS stream
- No unsupported upload action

## 6:25–7:10 — Administrator perspective

Advance to **Workflow Automation**.

The route loads the same real claim into a typed local simulation.

Show:

- Claim type
- Estimated loss
- Evidence completeness
- Priority and status
- Deterministic routing result

State the boundary at the controls:

- **Save draft** — local state only
- **Validate** — local validation only
- **Activate** — disabled with an explanation

This surface cannot approve, deny, pay, close, assign, or mutate production workflow state.

## 7:10–8:15 — Engineering proof

Advance to Engineering Proof and explain:

- Angular 20 standalone routes and signals
- A bounded `OperationalDataStore`
- Immediate mutation invalidation
- Visibility-aware 45-second polling
- Last-valid-data retention
- Spring transactional application services
- Shared JPA operational filters
- PostgreSQL and Flyway
- Deterministic 48-claim employer dataset
- Claimant-safe projection and scoped message audience
- Human authority over recommendations and workflow state
- Persistent audit events

Representative files:

- `ClaimApplicationService`
- `OperationalQueryService`
- `AnalyticsService`
- `TeamOperationsService`
- `EvidenceOperationsService`
- `OperationalDataStore`
- `DemoJourneyService`
- `OperationalDemoDatasetService`
- `capture-operational-visual-qa.mjs`

## 8:15–8:50 — Premium motion and accessibility

Explain that motion indicates state:

- KPI interpolation occurs only when a value changes
- Bars, rings, and paths transition to new backend values
- Changed claims receive a brief semantic highlight
- Live or SLA-risk indicators use restrained breathing
- Background refresh does not blank content
- Loading skeletons preserve layout

Reduced-motion mode updates immediately and disables interpolation, breathing, scanning, orbiting, chart drawing, and animated scrolling.

Charts include names, exact values, focusable points where appropriate, and nonvisual summaries. Status is not communicated by color alone.

## 8:50–9:15 — Verification and close

Show GitHub Actions:

- Maven verification
- Frontend Karma tests
- Angular production build
- PostgreSQL-backed deterministic reset
- 18 rendered screenshots
- Baseline and evidence-changed states
- Filtered Analytics and Team Operations
- Stale cached-data state
- Reduced-motion state
- Desktop and mobile layouts

Use this closing statement:

> ClaimsFlow is a typed end-to-end workflow rather than a static dashboard concept. The backend owns business and operational truth, changes propagate through shared reactive state, every visible control is honest, and consequential decisions remain human and auditable.
