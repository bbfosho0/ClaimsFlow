# ClaimsFlow

ClaimsFlow is an internal insurance claims operations portal for adjusters and team leads. It demonstrates a complete enterprise workflow with a Java 21 and Spring Boot backend, an Angular standalone frontend, PostgreSQL persistence, deterministic decision support, and an immutable audit trail.

The project intentionally uses a modular monolith. The product is large enough to demonstrate meaningful boundaries, transactions, validation, and testing without introducing distributed-system complexity that the workflow does not require.

## Product workflow

1. Create a claim from an accessible Angular reactive form.
2. Calculate evidence completeness and deterministic priority.
3. Search and filter the claims queue.
4. Assign the claim to an active adjuster.
5. Move the claim through controlled status transitions.
6. Generate an advisory next-step recommendation.
7. Approve or reject the recommendation as a human decision.
8. Inspect every important action in the audit timeline.

## Architecture

```text
Angular standalone application
        |
        | JSON over HTTP
        v
Spring REST controllers
        |
        v
Application services and transactions
        |
        +-- Domain policies
        +-- Spring Data repositories
        +-- Audit service
        |
        v
PostgreSQL and Flyway
```

Backend packages are organized by business capability: claims, adjusters, recommendations, audit, and dashboard. Controllers translate HTTP requests, application services coordinate transactions, and deterministic policies own completeness, priority, and status-transition rules.

## Technology

| Area | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA |
| Validation | Jakarta Bean Validation, domain policies |
| Database | PostgreSQL 16, Flyway migrations |
| API | REST, RFC 9457 Problem Details, Springdoc OpenAPI |
| Frontend | Angular 20 standalone components, Router, Reactive Forms, HttpClient, signals, RxJS |
| Testing | JUnit 5, AssertJ, Testcontainers, Jasmine, Karma |
| Delivery | Docker Compose, GitHub Actions |

## Repository structure

```text
backend/                       Spring Boot API
frontend/                      Angular application
docs/                          Product, architecture, API, and interview notes
docker-compose.yml             Local PostgreSQL
.github/workflows/ci.yml       Backend and frontend verification
AGENTS.md                      Engineering conventions
```

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 22+
- npm 10+
- Docker Desktop or Docker Engine
- Google Chrome for local Karma tests

## Run locally

Start PostgreSQL:

```bash
docker compose up -d db
docker compose ps
```

Start the backend:

```bash
cd backend
mvn spring-boot:run
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

The Angular development server proxies `/api` and `/actuator` to `http://localhost:8080`.

## Configuration

The backend accepts these optional environment variables:

```text
DB_URL=jdbc:postgresql://localhost:5432/claimsflow
DB_USERNAME=claimsflow
DB_PASSWORD=claimsflow
PORT=8080
```

The Docker Compose credentials are development-only values.

## API documentation

With the backend running:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health: `http://localhost:8080/actuator/health`

See `docs/api-overview.md` for the workflow-level contract.

## Verification

Backend:

```bash
cd backend
mvn verify
```

Frontend:

```bash
cd frontend
npm install
npm run test:ci
npm run build
```

GitHub Actions runs both verification jobs. The first frontend CI run also produces a `frontend-package-lock` artifact so the generated lockfile can be committed and later CI runs can use a repository-pinned dependency graph.

## Interview demo

Use `docs/demo-script.md` for the eight-minute walkthrough. The recommended path is:

```text
Dashboard
→ filter claims queue
→ create an incomplete claim
→ inspect priority and missing evidence
→ assign an adjuster
→ perform a valid status transition
→ generate and review a recommendation
→ verify the audit timeline
```

## Design decisions

- **Modular monolith:** one deployable backend with explicit capability boundaries.
- **Deterministic decision support:** the project remains reliable and testable without a paid model provider.
- **Human review:** recommendations never approve, deny, or mutate a claim automatically.
- **Flyway schema ownership:** migrations, constraints, and indexes define the database.
- **Stable errors:** API failures use Problem Details with application codes and request identifiers.

The decision records are in `docs/decisions/`.

## Current limitations

- No production authentication or single sign-on
- Evidence represented by availability indicators rather than uploaded files
- Single organization and a fictional adjuster identity for demo actions
- No external insurance system integration
- No cloud deployment configuration
- Recommendations are rule-based rather than model-generated

These constraints keep the project locally runnable and focused on the junior full-stack interview workflow.
