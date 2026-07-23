# Architecture

## System context

ClaimsFlow is an internal browser application. Angular communicates with a Spring Boot REST API. PostgreSQL stores operational state and Flyway owns schema evolution.

```text
Browser
  Angular application
        |
        v
Spring Boot API
  claims | adjusters | recommendations | audit | dashboard
        |
        v
PostgreSQL
```

## Backend boundaries

Each capability contains its own API, application, domain, and persistence concerns where needed.

- **Claims:** creation, list queries, assignment, status transitions, completeness, and priority.
- **Adjusters:** active adjuster lookup.
- **Recommendations:** advisory next-step generation and human review.
- **Audit:** append-only operational events.
- **Dashboard:** read-only aggregation across claims, adjusters, and recent activity.
- **Shared:** request IDs, CORS, and Problem Details mapping.

Controllers do not own business rules. Application services coordinate transactions. Domain policies are plain Java classes. Spring Data repositories hide persistence mechanics from controllers.

## Claim creation flow

```text
Angular reactive form
  → POST /api/claims
  → Bean Validation
  → completeness policy
  → priority policy
  → SLA calculation
  → claim save
  → CLAIM_CREATED audit event
  → claim detail response
```

## Decision support

`ClaimInsightProvider` is an interface. `OpenAiClaimInsightProvider` is the primary provider when `OPENAI_API_KEY` is configured; `RuleBasedClaimInsightProvider` is the deterministic fallback. The API key is read directly from the exact `OPENAI_API_KEY` process environment variable and is never exposed to Spring property binding. Model and timeout remain non-secret `claimsflow.openai` properties, and the default model is `gpt-5-nano`.

The OpenAI provider sends a redacted operational summary containing claim type, status, priority, assignment state, completeness percentage, and missing-information labels. It does not send claimant details or other free-text claim content. The request requires a strict JSON schema with an allowed action, bounded explanation and confidence, and a missing-information list. The response is validated again locally before it can become a recommendation.

The provider path is:

```text
RecommendationService
  → load redacted analysis facts
  → ClaimInsightProvider
  → OpenAI Responses API (optional)
  → strict schema and local validation
  → transactional claim reload
  → recommendation and audit persistence
  → pending advisory recommendation

No key configured, request failure, or invalid model output
  → RuleBasedClaimInsightProvider
```

OpenAI calls are advisory only. They run without an open database transaction and cannot mutate claims or approve or reject a recommendation. Only after an insight is available does the service open a transaction, reload the claim, and atomically persist the recommendation and audit event. If no key is configured, the provider fails, or its output is incomplete, refused, mixed, malformed, unsupported, or outside persistence limits, the deterministic provider supplies the recommendation automatically.

The provider cannot mutate claims. The recommendation is persisted as pending and requires a separate human approval or rejection request.

## Consistency

Claim creation, assignment, status changes, recommendation persistence, recommendation review, and their audit events run inside backend transactions. The remote recommendation-provider call is intentionally outside the persistence transaction; its result is followed by a transactional claim reload, recommendation save, and audit write. Claim entities use optimistic locking for conflicting updates.

## Error handling

`RequestIdFilter` accepts or generates `X-Request-Id`. `GlobalExceptionHandler` maps validation, missing resources, domain conflicts, optimistic-lock conflicts, and unexpected failures to RFC 9457 Problem Details.
