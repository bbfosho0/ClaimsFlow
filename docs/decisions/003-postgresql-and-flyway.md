# ADR 003: PostgreSQL and Flyway

## Status

Accepted.

## Decision

Use PostgreSQL 16 for runtime persistence and Flyway for all schema creation and evolution.

## Rationale

The workflow is relational and benefits from foreign keys, constraints, indexed filters, transactions, and optimistic locking. Versioned migrations make schema changes reviewable and reproducible.

## Consequences

- Docker is the simplest local database path.
- Hibernate validates rather than authors the schema.
- Applied migrations are append-only.
- Integration tests use PostgreSQL Testcontainers when Docker is available.
