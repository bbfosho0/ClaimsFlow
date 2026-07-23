# ClaimsFlow MVP Design

## Status

Approved product and architecture design for the first interview-ready release of ClaimsFlow.

## Purpose

ClaimsFlow is an internal insurance claims operations portal for adjusters and team leads. It demonstrates production-oriented Java and Angular development through a complete business workflow rather than a collection of disconnected features.

The application will allow users to create claims, evaluate completeness and urgency, assign work, review a rule-based recommendation, record a human decision, and inspect a complete audit timeline.

The project replaces the current single-file console inventory program in this repository. The legacy `Main.java` implementation will be removed after the new application structure and tests are established.

## Success criteria

The MVP is complete when a reviewer can:

1. Start the database, backend, and frontend with documented commands.
2. Open a polished operations dashboard populated with representative seed data.
3. Search and filter a claims queue.
4. create a valid claim through an accessible Angular form.
5. Open the claim workspace and understand its status, priority, evidence, assignment, and SLA risk.
6. Assign the claim to an adjuster.
7. Generate a deterministic recommendation and review its explanation.
8. Approve or reject the recommendation as a human decision.
9. See each action in the claim audit timeline.
10. Run backend and frontend verification commands successfully.

## Scope

### Included

- Java 21 and Spring Boot backend.
- Angular standalone frontend.
- PostgreSQL persistence.
- Flyway database migrations.
- REST APIs with OpenAPI documentation.
- Dashboard summary metrics.
- Claims queue with search, filters, sorting, and pagination.
- Claim creation with conditional validation.
- Claim detail workspace.
- Adjuster assignment.
- Controlled claim status transitions.
- Rule-based completeness and priority evaluation.
- Rule-based recommendation generation.
- Human approval or rejection of recommendations.
- Immutable audit events for important state changes.
- Backend unit, web, and persistence tests.
- Frontend component and service tests.
- Continuous integration for backend tests, frontend tests, and frontend production build.
- `README.md`, `AGENTS.md`, architecture documentation, API overview, decision records, and interview demo script.

### Excluded

- Production authentication and single sign-on.
- File upload and object storage.
- Real insurance integrations.
- Automatic claim approval or denial.
- Paid language-model providers.
- Kafka, RabbitMQ, or distributed microservices.
- Kubernetes and cloud deployment infrastructure.
- Multiple organizations or tenant isolation.
- Customer-facing claim submission portals.

These exclusions keep the first release coherent, runnable, and explainable.

## Repository structure

```text
.
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/claimsflow/
│       ├── main/resources/
│       └── test/java/com/claimsflow/
├── frontend/
│   ├── package.json
│   └── src/
├── docs/
│   ├── architecture.md
│   ├── product-brief.md
│   ├── api-overview.md
│   ├── demo-script.md
│   ├── decisions/
│   └── superpowers/specs/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

The backend and frontend remain independently buildable. The repository root contains orchestration and documentation only.

## Architecture

ClaimsFlow will use a modular monolith. The design separates HTTP concerns, application use cases, domain rules, and persistence without introducing network boundaries that the MVP does not need.

```text
Angular application
        |
        | JSON over HTTP
        v
Spring REST controllers
        |
        v
Application services
        |
        +--> Domain policies
        +--> Repositories
        +--> Audit service
        |
        v
PostgreSQL
```

### Backend packages

```text
com.claimsflow
├── claim
│   ├── api
│   ├── application
│   ├── domain
│   └── persistence
├── adjuster
│   ├── api
│   ├── application
│   ├── domain
│   └── persistence
├── recommendation
│   ├── api
│   ├── application
│   └── domain
├── audit
│   ├── application
│   ├── domain
│   └── persistence
├── dashboard
│   ├── api
│   └── application
└── shared
    ├── error
    ├── time
    └── web
```

Controllers translate HTTP requests into application commands and queries. They do not contain business rules or direct repository calls.

Application services coordinate transactions and invoke domain policies. Domain policies remain deterministic and independently testable.

Persistence adapters use Spring Data JPA and expose repository interfaces meaningful to the application layer.

### Frontend structure

```text
src/app
├── core
│   ├── api
│   ├── error
│   └── layout
├── dashboard
├── claims
│   ├── data-access
│   ├── feature-queue
│   ├── feature-create
│   ├── feature-detail
│   └── ui
├── adjusters
├── shared
│   ├── components
│   ├── models
│   └── utilities
├── app.config.ts
└── app.routes.ts
```

The Angular application will use standalone components, route-level lazy loading, `HttpClient`, reactive forms, signals for local view state, and RxJS for asynchronous API workflows.

## Domain model

### Claim

A claim contains:

- UUID primary key.
- Human-readable claim number.
- Claimant name.
- Claimant email.
- Claim type.
- Incident date.
- Estimated loss amount.
- Description.
- Evidence indicators.
- Completeness state.
- Priority.
- Status.
- Assigned adjuster reference.
- SLA deadline.
- Created timestamp.
- Updated timestamp.
- Optimistic-lock version.

Supported claim types:

- Auto.
- Property.
- Personal injury.

Supported priorities:

- Low.
- Medium.
- High.
- Critical.

Supported statuses:

- New.
- Under review.
- Waiting for information.
- Ready for decision.
- Resolved.
- Closed.

Status changes must pass a transition policy. Invalid transitions return a domain conflict response instead of silently changing state.

### Evidence indicators

The MVP will store evidence availability as explicit booleans rather than uploaded files:

- Incident report present.
- Photos present.
- Proof of ownership present.
- Medical documentation present.

Required evidence varies by claim type. The completeness policy returns both a completion percentage and a list of missing evidence.

### Adjuster

An adjuster contains:

- UUID primary key.
- Display name.
- Email.
- Role.
- Active flag.
- Workload capacity.

Current workload is calculated from active assigned claims rather than stored as a mutable counter.

### Recommendation

A recommendation contains:

- UUID primary key.
- Claim reference.
- Recommended action.
- Explanation.
- Confidence score.
- Missing-information list.
- Generation timestamp.
- Review state.
- Reviewer name.
- Review timestamp.

Review states:

- Pending.
- Approved.
- Rejected.

Only pending recommendations may be reviewed.

### Audit event

An audit event contains:

- UUID primary key.
- Claim reference.
- Actor.
- Action type.
- Human-readable summary.
- Previous value when applicable.
- New value when applicable.
- Timestamp.

Audit events are append-only through the application. The API does not expose mutation or deletion operations for them.

## Domain policies

### Completeness policy

The completeness policy evaluates evidence based on claim type:

- Auto claims require an incident report and photos.
- Property claims require photos and proof of ownership.
- Personal injury claims require an incident report and medical documentation.

The result includes a completion percentage and explicit missing evidence.

### Priority policy

Priority is deterministic and based on:

- Estimated loss amount.
- Incident recency.
- Missing evidence.
- Personal injury classification.
- SLA proximity.

The policy returns both a priority and explanation factors. The exact thresholds will be constants in a focused policy class and covered by boundary tests.

### Recommendation provider

The recommendation module uses an interface:

```java
public interface ClaimInsightProvider {
    ClaimInsight analyze(ClaimAnalysisRequest request);
}
```

The first implementation is `RuleBasedClaimInsightProvider`. It evaluates completeness, priority, current status, and assignment to suggest a next action such as requesting missing information, assigning an adjuster, beginning review, or preparing a decision.

The interface allows a future external provider without changing controllers or claim-domain logic. The rule-based provider remains the reliable fallback.

No recommendation changes claim state automatically. A user must explicitly approve or reject it.

## API design

Base path: `/api`

### Dashboard

- `GET /api/dashboard`

Returns aggregate counts, SLA-risk counts, workload summaries, and recent activity.

### Claims

- `GET /api/claims`
- `POST /api/claims`
- `GET /api/claims/{claimId}`
- `PATCH /api/claims/{claimId}/assignment`
- `PATCH /api/claims/{claimId}/status`

The list endpoint supports:

- Free-text search.
- Status filter.
- Priority filter.
- Assignment filter.
- Page and page size.
- Sort field and direction.

The API uses stable DTOs and does not serialize JPA entities directly.

### Recommendations

- `POST /api/claims/{claimId}/recommendations`
- `PATCH /api/claims/{claimId}/recommendations/{recommendationId}`

The review endpoint accepts an approval decision and reviewer name.

### Audit

- `GET /api/claims/{claimId}/audit`

### Adjusters

- `GET /api/adjusters`

### Operations

- `GET /actuator/health`
- OpenAPI JSON and Swagger UI through Springdoc.

## HTTP error handling

The backend will use RFC 9457 Problem Details responses through Spring's `ProblemDetail` support.

Expected mappings:

- `400 Bad Request` for malformed input and Bean Validation failures.
- `404 Not Found` for missing claims, adjusters, or recommendations.
- `409 Conflict` for invalid status transitions, duplicate review attempts, or optimistic-lock conflicts.
- `500 Internal Server Error` for unexpected failures, with no internal stack details returned to clients.

Each problem response includes:

- Type.
- Title.
- Status.
- Detail.
- Instance.
- Stable application error code.
- Validation field errors when applicable.
- Request identifier.

A global exception handler centralizes this mapping.

## User interface

### Application shell

The interface will use a professional internal-tool visual system with:

- Left navigation.
- Page title and contextual actions.
- Responsive content area.
- Clear keyboard focus indicators.
- Semantic landmarks.
- Consistent loading, empty, and error states.

Navigation routes:

- `/dashboard`
- `/claims`
- `/claims/new`
- `/claims/:id`

### Dashboard

The dashboard presents:

- Open claims.
- High and critical claims.
- Claims approaching SLA.
- Unassigned claims.
- Incomplete claims.
- Workload by adjuster.
- Recent audit activity.

Metrics come from the dashboard API rather than being recomputed inconsistently in components.

### Claims queue

The queue presents a responsive data table with:

- Claim number.
- Claimant.
- Claim type.
- Priority.
- Status.
- Assignment.
- SLA deadline.
- Completeness.

Search and filters synchronize with URL query parameters. Refreshing or sharing the URL preserves the current view.

### New claim form

The form uses Angular reactive forms with:

- Required claimant information.
- Claim-type selection.
- Incident date validation.
- Non-negative loss amount validation.
- Description length constraints.
- Claim-type-specific evidence fields.
- Inline messages.
- A top-level accessible error summary after an invalid submission.
- Disabled duplicate submission while the request is active.

Successful creation navigates to the new claim workspace.

### Claim workspace

The detail route presents:

- Claim identity and status header.
- Claim facts.
- Evidence completeness.
- Assignment controls.
- Status controls limited to valid next states.
- Recommendation panel.
- Audit timeline.

Mutation success updates the relevant view state without a full page reload. Mutation errors remain visible near the action that failed.

## Data flow

### Create claim

1. User completes the Angular form.
2. Client validation prevents obvious invalid requests.
3. `POST /api/claims` performs authoritative backend validation.
4. Application service creates the claim number and SLA deadline.
5. Completeness and priority policies evaluate the claim.
6. Claim is persisted in one transaction.
7. A `CLAIM_CREATED` audit event is appended.
8. API returns the claim summary.
9. Frontend navigates to the detail page.

### Assign claim

1. User chooses an active adjuster.
2. Backend verifies the claim and adjuster exist.
3. Backend verifies the adjuster remains active.
4. Assignment is persisted.
5. An audit event records the previous and new assignment.
6. Frontend refreshes claim and dashboard data.

### Generate and review recommendation

1. User requests a recommendation.
2. Provider receives an immutable analysis request.
3. Provider returns action, explanation, confidence, and missing information.
4. Recommendation is persisted as pending.
5. Audit event records generation.
6. User approves or rejects the pending recommendation.
7. Review metadata is persisted.
8. Audit event records the human decision.

## Database and seed data

PostgreSQL is the runtime database. Flyway owns all schema changes.

Migrations will include:

1. Initial tables and constraints.
2. Useful indexes for claim list filters and audit lookup.
3. Development seed data with several adjusters and claims in varied states.

Hibernate schema generation will validate migrations rather than create or update production tables.

Seed data must be fictional and must not contain real personal or insurance information.

## Testing strategy

### Backend unit tests

- Completeness rules for every claim type.
- Priority threshold boundaries.
- Valid and invalid status transitions.
- Rule-based recommendation outcomes.
- Recommendation review rules.

### Backend web tests

- Claim creation validation.
- Claim list filtering and pagination.
- Missing-resource responses.
- Conflict responses.
- Problem Details structure.
- Assignment and recommendation endpoints.

### Backend persistence tests

- Repository query behavior.
- Flyway migration startup.
- Database constraints.
- Optimistic locking.

Testcontainers will be used for PostgreSQL integration tests when Docker is available. Tests that do not require PostgreSQL remain fast and isolated.

### Frontend tests

- Reactive-form validators and conditional evidence requirements.
- Claims API service request construction.
- URL-backed filter parsing and serialization.
- Dashboard and queue loading, empty, success, and error states.
- Claim workspace action behavior.

### End-to-end path

A Playwright test may be added after the core Angular and backend integration is stable. The required manual demo path remains:

```text
Open dashboard
→ create an initially incomplete claim
→ inspect calculated priority and missing evidence
→ assign an adjuster
→ update the claim status
→ generate a recommendation
→ approve the recommendation
→ verify the audit timeline
```

## Continuous integration

GitHub Actions will run on pushes and pull requests.

Backend job:

```bash
cd backend
./mvnw verify
```

Frontend job:

```bash
cd frontend
npm ci
npm test -- --watch=false
npm run build
```

The repository will not claim successful verification unless these commands or the equivalent CI jobs have passed.

## Documentation

### README.md

The README will include:

- Product summary.
- Feature list.
- Architecture diagram.
- Technology stack.
- Repository structure.
- Prerequisites.
- Local and Docker startup instructions.
- Test commands.
- API documentation location.
- Demo workflow.
- Design tradeoffs.
- Current limitations and roadmap.

### AGENTS.md

`AGENTS.md` will contain neutral repository guidance:

- Architectural boundaries.
- Backend and frontend conventions.
- Required commands before changes are complete.
- Flyway migration rules.
- Testing expectations.
- Generated or dependency files that should not be edited manually.
- Expectations for focused comments and professional commit messages.

It will not contain prompts, persona text, tool transcripts, or marketing language.

### Supporting documents

- `docs/product-brief.md`
- `docs/architecture.md`
- `docs/api-overview.md`
- `docs/demo-script.md`
- `docs/decisions/001-modular-monolith.md`
- `docs/decisions/002-rule-based-recommendations.md`
- `docs/decisions/003-postgresql-and-flyway.md`

## Engineering conventions

- Prefer constructor injection in Spring components.
- Keep controllers thin.
- Keep domain rules independent of Spring where practical.
- Use records for immutable request and response DTOs when appropriate.
- Do not expose JPA entities in API responses.
- Use database constraints in addition to application validation.
- Use explicit transactional boundaries in application services.
- Keep Angular components focused on presentation and interaction.
- Put HTTP access in Angular data-access services.
- Avoid broad shared utility modules with unrelated responsibilities.
- Keep comments focused on intent and non-obvious tradeoffs.
- Do not commit credentials, generated dependency folders, IDE state, or local database volumes.

## Repository hygiene and provenance

The repository will use normal engineering documentation and commit messages. It will not include prompt logs, generated-chat transcripts, assistant branding, or claims that the project was created automatically.

The project history will remain intact. Documentation will not falsely claim that assisted work was completed without assistance. Reviewers should evaluate the implementation, architecture, tests, and the developer's demonstrated understanding.

## Delivery sequence

Implementation will proceed in vertical slices:

1. Repository scaffold, build configuration, documentation skeleton, and CI.
2. Database migrations and core domain model.
3. Claim creation and retrieval APIs with tests.
4. Claims queue API and Angular queue.
5. Dashboard API and Angular dashboard.
6. Assignment and status workflow.
7. Recommendation provider and human review workflow.
8. Audit timeline.
9. UX, accessibility, error-state, and documentation polish.
10. Full verification and interview demo review.

Each slice must leave the repository in a buildable, testable state before the next slice begins.

## Final design decisions

- Use a modular monolith instead of microservices.
- Use deterministic recommendation rules for the MVP.
- Require human review for all recommendations.
- Use PostgreSQL and Flyway as the source of schema truth.
- Use Angular standalone APIs and reactive forms.
- Use Spring Problem Details for consistent errors.
- Prefer a complete, explainable workflow over broad feature count.
- Preserve a future integration boundary without making an external AI provider part of the core runtime.
