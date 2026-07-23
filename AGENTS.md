# Engineering Guide

## Boundaries

- Keep Spring controllers limited to HTTP translation.
- Put transactional workflow coordination in application services.
- Keep deterministic business rules in domain policies.
- Do not serialize JPA entities from REST endpoints.
- Keep Angular components focused on presentation and interaction; place HTTP calls in data-access services.

## Database

- Flyway migrations are the only source of schema changes.
- Never edit an applied migration. Add a new versioned migration.
- Runtime Hibernate mode is `validate`.

## Verification

```bash
cd backend && mvn verify
cd frontend && npm run test:ci && npm run build
```

## Repository hygiene

Do not commit credentials, dependency folders, generated build output, IDE state, local database volumes, prompt logs, or tool transcripts. Use focused comments and conventional engineering commit messages.
