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

`ClaimInsightProvider` is an interface. `OpenAiClaimInsightProvider` is the primary provider when `OPENAI_API_KEY` is configured; `RuleBasedClaimInsightProvider` is the deterministic fallback. The API key is read from the optional `OPENAI_API_KEY` environment variable through `claimsflow.openai.api-key`, and the default model is `gpt-5-nano`.

The OpenAI provider sends a redacted operational summary containing claim type, status, priority, assignment state, completeness percentage, and missing-information labels. It does not send claimant details or other free-text claim content. The request requires a strict JSON schema with an allowed action, bounded explanation and confidence, and a missing-information list. The response is validated again locally before it can become a recommendation.

The provider path is:

```text
RecommendationService
  → ClaimInsightProvider
  → OpenAI Responses API (optional)
  → strict schema and local validation
  → pending advisory recommendation

No key configured, request failure, or invalid model output
  → RuleBasedClaimInsightProvider
```

OpenAI calls are advisory only. They cannot mutate claims or approve or reject a recommendation. If no key is configured, the provider fails, or its output is missing, malformed, unsupported, or outside persistence limits, the deterministic provider supplies the recommendation automatically.

The provider cannot mutate claims. The recommendation is persisted as pending and requires a separate human approval or rejection request.

## Consistency

Claim creation, assignment, status changes, recommendation generation, recommendation review, and their audit events run inside backend transactions. Claim entities use optimistic locking for conflicting updates.

## Error handling

`RequestIdFilter` accepts or generates `X-Request-Id`. `GlobalExceptionHandler` maps validation, missing resources, domain conflicts, optimistic-lock conflicts, and unexpected failures to RFC 9457 Problem Details.
