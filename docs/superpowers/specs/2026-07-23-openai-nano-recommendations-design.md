# OpenAI Nano Recommendations Design

## Purpose

Add an OpenAI-backed advisory recommendation provider for ClaimsFlow. It uses `gpt-5-nano` to turn redacted operational claim facts into a structured next-step recommendation while preserving the existing human-review workflow and deterministic fallback.

## Scope

- Keep `ClaimInsightProvider` as the application boundary.
- Add an `OpenAiClaimInsightProvider` that calls the OpenAI Responses API through Spring `RestClient`.
- Enable the AI provider only when `OPENAI_API_KEY` is available; otherwise use the current `RuleBasedClaimInsightProvider`.
- On an OpenAI timeout, refusal, non-success response, malformed response, or invalid action, return the deterministic fallback result.
- Require the model to return structured JSON containing an existing action, a concise explanation, confidence from 0 to 100, and missing-information items.
- Add focused tests for activation, request redaction, valid structured output, and deterministic fallback behavior.
- Document local configuration using an environment variable only.

## Out of scope

- Persisting API keys, prompts, raw OpenAI responses, or request payloads.
- Sending claimant names or email addresses to OpenAI.
- Automatic claim status changes, approvals, denials, assignments, or any other mutation by the model.
- Replacing the existing recommendation review endpoint, persistence model, or audit trail.
- Streaming, chat UI, background retries, or usage/billing dashboards.

## Architecture

`RecommendationService` continues to construct an immutable analysis request and persist a pending recommendation inside its transaction. The selected `ClaimInsightProvider` supplies advisory content only.

When AI is configured, `OpenAiClaimInsightProvider` sends redacted operational facts to `POST /v1/responses` with model `gpt-5-nano`, a short timeout, and a strict JSON schema. The prompt permits only the current action vocabulary: `REQUEST_INFORMATION`, `ASSIGN_ADJUSTER`, `BEGIN_REVIEW`, and `PREPARE_DECISION`.

The request includes claim type, status, priority, assignment state, completeness percentage, required evidence gaps, estimated loss, incident date, and the claim description. It excludes claimant name and claimant email. The provider never receives a mutable entity and cannot invoke application services or repositories.

The provider validates every result before returning it. If the response is refused, incomplete, non-JSON, schema-invalid, contains an unsupported action, or the request fails, it delegates to the existing rule-based provider. The fallback is internal and does not change the public API contract.

## Configuration and security

`OPENAI_API_KEY` is read from the process environment into a configuration properties class. The key is never committed, exposed through an endpoint, included in exceptions, or written to logs. The configured model defaults to `gpt-5-nano`; its name and HTTP timeout may be configurable through non-secret application properties.

Operational logs record only that AI was used or that deterministic fallback occurred, plus safe failure category and request ID where available. They do not log authorization headers, claimant data, full prompts, or raw model output.

## Error handling

The user-facing recommendation endpoint remains successful when fallback is used, because it still produces a valid advisory recommendation. A configuration-free environment remains fully functional through the deterministic provider. Unexpected persistence and domain failures retain the existing RFC 9457 Problem Details behavior.

## Testing and verification

- Unit-test the provider's request construction to prove claimant name and email are absent.
- Unit-test strict structured-result parsing and action allow-list validation.
- Unit-test fallback for no key, HTTP failure, timeout, refusal, malformed JSON, and unsupported action.
- Verify the recommendation service still persists a pending recommendation and audit event.
- Run `mvn verify`, `npm ci`, `npm run test:ci`, and `npm run build` after implementation.

## Acceptance criteria

With `OPENAI_API_KEY` configured, generating a claim recommendation uses `gpt-5-nano` and persists a pending human-review recommendation derived from valid structured output. Without the key, or on any provider failure, generating the same recommendation remains reliable through the deterministic rules. No model path can mutate claim state or send claimant names or email addresses.
