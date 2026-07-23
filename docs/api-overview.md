# API Overview

Base path: `/api`

## Dashboard

`GET /api/dashboard`

Returns operational counts, adjuster workload, and the ten newest audit events.

## Claims

`GET /api/claims`

Query parameters:

- `q`
- `status`
- `priority`
- `assignment`, including `unassigned`
- `page`
- `size`
- `sort`

`POST /api/claims`

```json
{
  "claimantName": "Taylor Morgan",
  "claimantEmail": "taylor.morgan@example.test",
  "claimType": "AUTO",
  "incidentDate": "2026-07-21",
  "estimatedLoss": 14500,
  "description": "Vehicle sustained front-end damage after a low-speed collision.",
  "incidentReportPresent": true,
  "photosPresent": false,
  "proofOfOwnershipPresent": false,
  "medicalDocumentationPresent": false
}
```

`GET /api/claims/{claimId}`

Returns facts, evidence, missing evidence, priority factors, allowed next statuses, assignment, SLA, and version.

`PATCH /api/claims/{claimId}/assignment`

```json
{
  "adjusterId": "10000000-0000-0000-0000-000000000001",
  "actor": "Interview User"
}
```

`PATCH /api/claims/{claimId}/status`

```json
{
  "status": "UNDER_REVIEW",
  "actor": "Interview User"
}
```

## Recommendations

`POST /api/claims/{claimId}/recommendations`

Creates a pending recommendation.

`PATCH /api/claims/{claimId}/recommendations/{recommendationId}`

```json
{
  "decision": "APPROVED",
  "reviewer": "Interview User"
}
```

## Audit and adjusters

- `GET /api/claims/{claimId}/audit`
- `GET /api/adjusters`

## Errors

Errors use `application/problem+json` semantics and include:

```json
{
  "type": "https://claimsflow.local/problems/claim-not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Claim was not found.",
  "instance": "/api/claims/...",
  "code": "CLAIM_NOT_FOUND",
  "requestId": "..."
}
```
