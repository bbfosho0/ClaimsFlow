# ClaimsFlow Interview Demo Script

Target length: six to eight minutes.

## Before the interview

Start PostgreSQL, Spring Boot, and Angular. Enable the deterministic demo reset only for this local demonstration:

```bash
CLAIMSFLOW_DEMO_ENABLED=true mvn spring-boot:run
```

Open the employee application, use the profile menu, and choose **Reset Demo Journey**. Confirm that the application reports `Demo journey reset.`

This produces one reserved fictional claim for `taylor.reed@example.com`, assigns Jordan Lee, and stores the returned claim and adjuster IDs for the walkthrough.

## 0:00–0:40 — Product definition

Open `/tour`.

Use one sentence:

> ClaimsFlow lets a claimant submit evidence, an adjuster resolve the work, a manager monitor operational impact, and an administrator explain the routing.

Explain that the product intentionally separates the claimant portal from the employee application and filters employee navigation by demo role.

## 0:40–1:30 — Claimant perspective

Start the walkthrough. It opens the reserved claim in the separate claimant portal.

Show:

- Claim status
- Plain-language next action
- Evidence completeness
- Service expectation
- Claimant-safe timeline
- Documents and messages destinations

State that the claimant response is a dedicated backend projection. It excludes internal priority rationale, recommendation details, and internal notes.

Open Documents briefly and explain that the demo records supported evidence categories. It does not falsely claim to persist the selected binary file.

## 1:30–3:10 — Adjuster perspective

Move to the Adjuster step. The route switches to Jordan Lee and opens the same claim ID.

Show:

- Authoritative claim dossier
- Evidence ledger
- Assigned owner and SLA pressure
- Allowed backend status transitions
- Human-controlled recommendation section

Open Communications.

Edit the claimant message, choose **Review and send**, and pause at the confirmation dialog. Point out the exact result:

- One claimant-visible message is created
- Jordan Lee is recorded as the author
- One audit event is appended
- Claim status remains unchanged

Confirm the message and show `Request sent to the claimant portal.`

Explain that the message endpoint accepts a bounded audience and body. Internal notes are never returned by the claimant feed.

For recommendation review, explain that approval or rejection requires an operator reason and confirmation. Recommendation state and claim workflow state remain separate.

## 3:10–4:10 — Manager perspective

Advance to the Manager step.

Show the golden-journey summary on Operations Overview:

- Claim number and claimant
- Current status
- Priority
- Evidence percentage
- SLA state

Then open Claims Queue and point out the highlighted **Golden journey** row and context inspector.

Explain that the dashboard snapshot represents portfolio aggregates, while the highlighted card and row use the exact claim ID returned by reset. The claim can also be resolved from a shareable `claimId` query parameter.

## 4:10–5:10 — Administrator perspective

Advance to Workflow Automation.

The route automatically loads the same claim into a typed local routing input.

Show:

- Claim type
- Estimated loss
- Evidence completeness
- Priority
- Status
- Local routing result

Then state the truthfulness boundary:

- **Save draft** — local state only
- **Validate** — local validation only
- **Activate** — disabled

The portfolio demo cannot approve, deny, mutate the claim, or activate a production workflow from this screen.

## 5:10–6:20 — Engineering proof

Advance to the Engineering Proof step.

Explain the architecture:

- Angular 20 standalone lazy routes
- Spring Boot modular monolith
- Application-service transaction boundaries
- PostgreSQL and Flyway
- Deterministic policies
- Claimant-safe portal projection
- Scoped message audience
- Optional advisory provider with deterministic fallback
- Persistent audit events

Show representative files:

- `ClaimApplicationService`
- `PortalApplicationService`
- `DemoJourneyService`
- `ClaimTransitionPolicy`
- `TourOrchestratorService`
- `DemoJourneyServiceTransactionTest`
- `workspace-pages.component.spec.ts`

## 6:20–7:00 — Visual and accessibility implementation

Point out that Figma is art direction, while Angular and browser screenshots are the implementation source of truth.

The premium layer uses:

- Restrained route and interaction motion
- Reduced-motion fallbacks
- Accessible SVG/CSS visualizations
- One isolated Copilot WebGL orb
- Static CSS fallback when WebGL is unavailable
- Off-screen animation pause and context-loss handling

Emphasize that shaders are not placed behind tables, forms, evidence records, or consequential controls.

## 7:00–7:40 — Verification and tradeoffs

Show GitHub Actions:

- Backend Maven verification
- Frontend Karma tests
- Angular production build
- PostgreSQL-backed deterministic reset
- Desktop and mobile screenshots across all four perspectives

Key tradeoffs:

- A modular monolith keeps transactions and local demonstration reliable while preserving capability boundaries.
- Demo persona switching makes the product easy to evaluate but is not production authorization.
- Evidence presence is real; binary object storage is intentionally not claimed.
- Workflow routing is demonstrable without pretending production activation exists.

## Closing statement

> ClaimsFlow is a typed end-to-end workflow, not a static dashboard concept. The backend owns business truth, each role sees only the context it needs, assistance remains bounded, and consequential actions stay human and auditable.
