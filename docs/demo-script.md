# Interview Demo Script

Target length: eight minutes.

## 0:00 to 0:45: problem

ClaimsFlow is an internal claims operations workspace. It reduces fragmented triage, assignment, deadline, recommendation, and audit workflows into one application.

## 0:45 to 1:45: architecture

Show `docs/architecture.md` and the repository tree.

Explain:

- Angular standalone frontend
- Spring Boot modular monolith
- REST DTOs rather than exposed entities
- PostgreSQL with Flyway
- deterministic domain policies
- advisory recommendation interface

## 1:45 to 2:30: dashboard

Open the dashboard. Point out open claims, high priority, SLA risk, unassigned claims, incomplete claims, workload, and recent activity. Explain that the backend owns aggregate definitions.

## 2:30 to 3:15: claims queue

Open Claims. Filter by high priority or unassigned. Refresh the page to demonstrate that filter state is preserved in the URL.

## 3:15 to 4:15: create a claim

Create an auto claim with a valid incident report but no photos. Show Angular field validation, submit it, and explain that the backend performs authoritative validation and deterministic triage.

## 4:15 to 5:15: claim workspace

Show the missing evidence, completeness percentage, priority factors, SLA deadline, and current status. Assign an adjuster and move the claim to a valid next status.

## 5:15 to 6:15: recommendation and human review

Generate a recommendation. Explain the `ClaimInsightProvider` boundary and why the core runtime uses a rule-based implementation. Approve or reject the pending recommendation. Emphasize that it cannot mutate or decide the claim automatically.

## 6:15 to 6:50: audit

Show the assignment, status, recommendation generation, and human review events in the timeline.

## 6:50 to 7:35: code and tests

Open:

- `CompletenessPolicy`
- `ClaimTransitionPolicy`
- `ClaimApplicationService`
- `RuleBasedClaimInsightProviderTest`
- `SchemaIntegrationTest`

Explain one test boundary and one transaction.

## 7:35 to 8:00: tradeoff

The principal tradeoff was choosing a modular monolith instead of microservices. It preserves clear module boundaries while keeping local startup, transactions, testing, and the interview walkthrough reliable.
