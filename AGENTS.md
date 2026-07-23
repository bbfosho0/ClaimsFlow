# ClaimsFlow Engineering Guide

## Architecture

- Keep Spring controllers limited to HTTP request and response translation.
- Put transaction boundaries and workflow coordination in application services.
- Keep completeness, priority, transition, and recommendation rules deterministic and independently testable.
- Repositories belong to their business capability. Do not call repositories directly from controllers.
- Do not serialize JPA entities from REST endpoints. Return immutable DTOs or records.
- Keep Angular components focused on rendering and interaction. Put HTTP access in typed data-access services.
- Use standalone Angular components and route-level lazy loading.

## Backend conventions

- Use Java 21 language features conservatively and favor clear records for immutable data.
- Use constructor injection for Spring components.
- Use `@Transactional` on application-service operations that mutate state.
- Return RFC 9457 Problem Details for errors with a stable `code` and `requestId`.
- Avoid leaking stack traces, SQL messages, or internal exception details to clients.
- Add domain tests for rule boundaries before changing business behavior.

## Database rules

- Flyway is the only source of schema changes.
- Never edit a migration that may already have been applied. Add a new versioned migration.
- Keep runtime Hibernate mode set to `validate`.
- Add database constraints in addition to application validation.
- Seed data must remain fictional and use reserved example domains.

## Frontend conventions

- Keep TypeScript strict mode enabled.
- Use typed API models and services.
- Use Angular Reactive Forms for workflow forms.
- Include loading, empty, success, and error states for data-driven views.
- Do not rely on color alone for status, priority, or SLA meaning.
- Preserve keyboard focus indicators, semantic headings, form labels, and the skip link.

## Required verification

```bash
cd backend
mvn verify
```

```bash
cd frontend
npm install
npm run test:ci
npm run build
```

Do not state that verification passed without command output or successful CI jobs.

## Repository hygiene

Do not commit credentials, `node_modules`, `target`, generated bundles, IDE state, local database volumes, prompt logs, tool transcripts, or unrelated generated files. Keep comments focused on intent and non-obvious tradeoffs. Use conventional engineering commit messages.
