# Product Brief

## Problem

Claims adjusters often work across disconnected queues, notes, evidence checklists, and deadline trackers. Important cases can remain unassigned, incomplete, or close to an SLA deadline without a clear operational view.

## Users

### Claims adjuster

Needs to understand the claim, missing evidence, urgency, assignment, valid next states, and prior decisions in one workspace.

### Team lead

Needs to see volume, high-priority work, SLA risk, unassigned cases, and workload distribution before assigning work.

## Jobs to be done

- When new claim information arrives, create a structured case and immediately identify missing evidence.
- When planning daily work, find urgent and unassigned claims quickly.
- When advancing a claim, allow only valid state transitions.
- When using automated guidance, understand the recommendation and retain human control.
- When reviewing prior work, see an append-only timeline of meaningful events.

## MVP acceptance criteria

- Dashboard shows open, high-priority, SLA-risk, unassigned, and incomplete counts.
- Queue supports search, filters, pagination, and bookmarkable URLs.
- Claim intake validates core fields and accepts evidence indicators.
- Claim detail shows facts, completeness, priority factors, assignment, status actions, recommendation, and audit history.
- Assignment and status changes create audit events.
- Recommendations are deterministic, persisted, and require explicit review.
- Backend and frontend have automated tests and CI build jobs.
