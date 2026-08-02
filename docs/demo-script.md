# ClaimsFlow Interview Demo Script

Target length: eight to ten minutes.

The recommended starting point is `http://localhost:4200/`. A compressed version can start at `/tour` and follow the application controller.

## 0:00 to 0:50: product problem and showcase

Open the root showcase.

Explain that claims are not treated as equal rows. Each claim concentrates several operational signals:

- SLA pressure
- Evidence completeness
- Ownership
- Severity
- Recommendation readiness

Point out the interruptible Initial -> Signal Lock -> Ready sequence, then skip it to demonstrate that motion never blocks access. Mention that reduced-motion users receive the meaningful Ready state immediately.

## 0:50 to 1:30: architecture

Use the showcase architecture chapter or `docs/architecture.md`.

Explain:

- Angular 20 standalone lazy routes
- Spring Boot modular monolith
- Application-service transaction boundaries
- Deterministic domain policies
- PostgreSQL and Flyway
- Optional advisory provider with deterministic fallback
- Immutable audit events

## 1:30 to 2:20: Operations Overview

Open `/app/dashboard` or begin the guided tour.

Show:

- Priority Command Field
- Intervention queue
- Four-cell instrument band
- Flow Intelligence
- Team capacity
- Operational event feed

Explain that dashboard aggregate definitions and claim workflow state are owned by the backend. The SVG Command Field is a visual interpretation with a textual accessibility summary.

## 2:20 to 3:10: Claims Queue

Open `/app/claims`.

Demonstrate:

- Search, status, priority, and assignment filters
- URL-preserved filter state
- Comfortable and compact density
- Semantic desktop table
- Selected-claim context inspector
- SLA, ownership, priority, and evidence signals

Open `CF-2026-0142` when present. Otherwise use the highest-priority incomplete claim selected by the guided tour.

## 3:10 to 4:20: Claim Workspace

Show the identity band and authoritative claim dossier.

Switch through:

- Dossier
- Evidence ledger
- Communications
- Audit

Explain that the evidence ledger classifies present and missing evidence without inventing document contents. Assign an adjuster or perform an allowed workflow transition, then show the resulting audit event.

## 4:20 to 5:30: human-controlled recommendation review

Generate a recommendation in the Decision Support section.

Explain the provider boundary:

- `OpenAiClaimInsightProvider` is attempted only when `OPENAI_API_KEY` exists.
- Only a controlled operational summary is sent.
- Responses use structured output and local validation.
- Failures use `RuleBasedClaimInsightProvider`.
- The remote call completes outside the database transaction.
- The validated recommendation and audit event are persisted transactionally.

Click Approve guidance or Reject guidance.

Before confirming, point out the exact-result preview:

- Recommendation review state changes.
- Claim workflow status remains unchanged.
- The operator reason is appended to the immutable audit timeline.

Enter a meaningful reason and confirm. Show the updated audit event.

## 5:30 to 6:45: Claims Intelligence

Open `/app/intelligence`.

Show:

- Portfolio-wide review queue
- Attention score and review reason
- Selected recommendation dossier
- Confidence composition
- Source classifications
- Evidence Reasoning Graph
- Review, Investigate, and Action assistant modes

Prepare an evidence request. Explain that it creates a local draft only. Nothing is sent, and no claim state changes.

Prepare a recommendation approval or rejection. Explain that Claims Intelligence cannot execute it without the same operator reason, exact preview, explicit confirmation, and audit event enforced by the Claim Workspace.

## 6:45 to 7:25: New Claim

Open `/app/claims/new`.

Move through the four gates:

1. Claimant
2. Incident
3. Evidence
4. Review

Create an incomplete property or auto claim. Point out:

- Reactive form validation
- Evidence can remain incomplete
- Oversized file selection reports an error while preserving the form draft
- Staged files are not falsely presented as backend uploads
- Spring calculates claim number, completeness, priority, SLA, and initial workflow state

Submit and show the created claim workspace.

## 7:25 to 8:20: guided tour and engineering proof

Open `/tour`.

Explain that the controller navigates real routes using stable `data-tour-target` attributes. It does not replay screenshots or own domain state.

Show:

- Previous and next navigation
- Technical-proof expansion
- Arrow-key navigation
- Escape to exit
- Session-scoped progress
- Mobile bottom positioning

End on the Engineering Proof section and mention the independent frontend and backend GitHub Actions jobs.

## 8:20 to 9:10: code and tests

Open representative boundaries:

- `CompletenessPolicy`
- `ClaimTransitionPolicy`
- `RecommendationService`
- `RecommendationServiceReviewTest`
- `IntelligenceFacadeService`
- `TourOrchestratorService`
- `SchemaIntegrationTest`

Explain one transaction, one deterministic rule, one frontend composition boundary, and one regression test.

## 9:10 to 9:40: tradeoffs

The main architectural tradeoff was a modular monolith instead of microservices. It preserves clear capability boundaries while keeping transactions, local startup, integration testing, and the interview walkthrough reliable.

The main visual tradeoff was translating native Figma shaders into bounded CSS and SVG materials on the web. This preserves the premium signal language without placing expensive effects behind dense forms and tables.

## Closing statement

ClaimsFlow is not an AI-generated dashboard mockup. It is a complete typed workflow where the backend owns business truth, the frontend makes operational pressure legible, intelligence remains advisory, and every consequential human action is auditable.
