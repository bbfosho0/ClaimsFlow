# ADR 001: Modular monolith

## Status

Accepted.

## Decision

Use one Spring Boot deployment with packages organized by business capability.

## Rationale

The MVP needs strong boundaries, transactions, validation, and a complete workflow, but it does not need independent scaling or network-level isolation. A modular monolith reduces operational complexity while preserving interfaces that could support later extraction.

## Consequences

- Local startup and debugging remain straightforward.
- Cross-capability operations can use database transactions.
- Package discipline is required to prevent accidental coupling.
