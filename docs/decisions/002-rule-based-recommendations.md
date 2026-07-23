# ADR 002: Rule-based recommendations

## Status

Accepted.

## Decision

Implement `ClaimInsightProvider` with deterministic rules for the MVP.

## Rationale

The application must remain free to run, testable, and reliable without network access or a paid model provider. The provider interface preserves an integration boundary for a future external implementation.

## Consequences

- Recommendations are explainable and repeatable.
- Unit tests cover every outcome.
- The current provider is not natural-language reasoning or a trained model.
- Human review remains mandatory regardless of provider.
