# ClaimsFlow

ClaimsFlow is a portfolio-grade insurance claims operations system built with Angular 20, Spring Boot 3.5, Java 21, and PostgreSQL 16. It combines a cinematic product showcase, a route-aware guided tour, and a functional claims application with deterministic triage, advisory intelligence, explicit human authority, and immutable audit history.

The repository implements the final Figma MVP contract rather than presenting static mockups. Operational pages read and mutate the Spring API, domain rules remain backend-authoritative, and the Claims Intelligence assistant cannot silently approve, deny, pay, close, or reassign a claim.

## Product experience

### Public experience

| Route | Purpose |
| --- | --- |
| `/` | Cinematic portfolio showcase |
| `/tour` | Six-step guided product tour and engineering proof |

The showcase uses an interruptible `Initial -> Signal Lock -> Ready` sequence. It includes reduced-motion behavior and CSS/SVG equivalents for the bounded Glowing Wave, Mesh Gradient, Water Caustic, Pattern Grid, Bloom, and Chromatic Metal treatments defined in Figma.

### Operational application

| Route | Purpose |
| --- | --- |
| `/app/dashboard` | Portfolio pressure, intervention queue, flow intelligence, capacity, and audit activity |
| `/app/claims` | Filterable claims queue, density controls, selection, and claim context |
| `/app/claims/:id` | Claim dossier, evidence ledger, workflow actions, recommendations, and audit timeline |
| `/app/claims/new` | Four-gate claim intake using Angular Reactive Forms |
| `/app/intelligence` | Portfolio-wide Claims Intelligence review center |

Legacy `/dashboard` and `/claims*` links redirect to the corresponding `/app/*` route.

## Core workflow

1. Create a claim from an accessible reactive form.
2. Let the backend calculate completeness, deterministic priority, SLA, claim number, and initial workflow state.
3. Read portfolio pressure in Operations Overview.
4. Filter and inspect the Claims Queue.
5. Assign an adjuster and perform an allowed status transition.
6. Review evidence provenance and missing information.
7. Generate an advisory recommendation through the configured provider or deterministic fallback.
8. Preview an approval or rejection, enter an operator reason, and confirm it explicitly.
9. Inspect the resulting immutable audit event.

## Claims Intelligence authority boundary

Claims Intelligence may:

- Explain recommendations
- Identify missing evidence
- Detect visible contradictions
- Classify statements as verified, missing, inferred, policy, operator-provided, or uncertain
- Draft claimant communications
- Prepare reversible workflow actions

Claims Intelligence may not:

- Approve or deny a claim autonomously
- Pay or close a claim
- Reassign work without confirmation
- Present an unsourced material statement as verified fact
- Execute a consequential recommendation review without an operator reason

Recommendation review is validated by Spring. The operator reason is included in the immutable audit summary.

## Architecture

```text
Angular 20 standalone application
        |
        | typed JSON over HTTP
        v
Spring REST controllers
        |
        v
Application services and transactions
        |
        +-- Deterministic domain policies
        +-- Recommendation provider boundary
        +-- Spring Data repositories
        +-- Immutable audit service
        |
        v
PostgreSQL 16 and Flyway
```

The backend is a modular monolith organized by business capability: claims, adjusters, recommendations, audit, and dashboard. Controllers translate HTTP, application services coordinate transactions, domain policies own deterministic rules, and DTOs prevent JPA entities from leaking through the API.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Angular 20.3, standalone lazy routes, signals, RxJS, Reactive Forms, HttpClient |
| Motion | Router View Transitions, CSS animation, SVG signal animation, reduced-motion fallbacks |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA |
| API | REST, Jakarta Validation, RFC 9457 Problem Details, Springdoc OpenAPI |
| Database | PostgreSQL 16, Flyway migrations |
| Decision support | Optional OpenAI provider with strict validation and deterministic fallback |
| Testing | Jasmine, Karma, JUnit 5, Mockito, MockMvc, Testcontainers |
| Delivery | Docker Compose and GitHub Actions |

## Repository structure

```text
backend/                       Spring Boot API and domain modules
frontend/                      Angular showcase, tour, and operational application
design/figma/                  Frozen Figma-to-code maps
docs/design/                   Final design handoff and implementation notes
docs/superpowers/plans/        Approved implementation plans
figma-plugin/                  Native shader registry and tooling
docker-compose.yml             Local PostgreSQL
.github/workflows/ci.yml       Independent frontend and backend verification
AGENTS.md                      Engineering conventions
```

## Prerequisites

- Git
- JDK 21
- Maven 3.9+
- Node.js 22+
- npm 10+
- Docker with Compose
- Google Chrome for Karma

Verify Java selection before starting:

```bash
java -version
mvn -version
```

Both must use Java 21.

## Quick start

### 1. Clone

```bash
git clone https://github.com/bbfosho0/ClaimsFlow.git
cd ClaimsFlow
```

### 2. Start PostgreSQL

```bash
docker compose up -d db
docker compose ps
```

Wait for the `db` service to report `healthy`.

### 3. Start Spring Boot

```bash
cd backend
mvn spring-boot:run
```

Backend health:

```text
http://localhost:8080/actuator/health
```

### 4. Start Angular

In a second terminal:

```bash
cd frontend
npm ci
npm start
```

Open:

```text
http://localhost:4200
```

The Angular development server proxies `/api` and `/actuator` to port `8080`.

## Optional OpenAI recommendations

Remote recommendations are opt-in. Set the exact process environment variable before starting Spring:

```powershell
$env:OPENAI_API_KEY = 'your-api-key'
cd backend
mvn spring-boot:run
```

Without a key, after a provider failure, or after an invalid response, ClaimsFlow uses the deterministic rule-based provider. Only a controlled operational summary is sent remotely. The result remains advisory and cannot mutate claim workflow state.

Never commit a key.

## Configuration

Defaults match `docker-compose.yml`:

```text
DB_URL=jdbc:postgresql://localhost:5432/claimsflow
DB_USERNAME=claimsflow
DB_PASSWORD=claimsflow
PORT=8080
OPENAI_API_KEY=
```

Changing the backend port also requires changing `frontend/proxy.conf.json`.

## Verification

### Backend

```bash
cd backend
mvn verify
mvn package
```

### Frontend

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

### Complete local verification

```bash
docker compose up -d db
cd backend && mvn verify
cd ../frontend && npm ci && npm run test:ci && npm run build
```

GitHub Actions runs frontend and backend verification independently.

## Demonstration path

The fastest product walkthrough starts at `/tour`. The primary path is:

```text
Showcase
-> Operations Overview
-> prioritized Claims Queue
-> Claim Workspace evidence review
-> human-controlled recommendation review
-> New Claim intake
-> engineering proof
```

A detailed interview script is available in `docs/demo-script.md`.

## Figma production source

The final design handoff is recorded in:

- `docs/design/claimsflow-final-mvp-handoff.md`
- `design/figma/claimsflow-component-map.json`
- `design/figma/claimsflow-node-map.json`
- `design/figma/claimsflow-motion-map.json`
- `design/figma/claimsflow-shader-map.json`
- `figma-plugin/presets/generated-shader-registry.json`

Figma file:

```text
https://www.figma.com/design/M7GOuna2hq7jWCGTZhiP5b/ClaimsFlow-Canonical-Dark-Product-System--Attempt-2
```

Native shader resources are design references. Operational web routes use maintainable CSS, SVG, and Canvas-compatible equivalents. Only the bounded showcase Command Field may be upgraded to WebGL after measured performance validation.

## Important API behavior

- Errors use Problem Details with stable application codes.
- Claim transitions are validated by deterministic policy.
- Recommendation generation is advisory.
- `GET /api/claims/{claimId}/recommendations/latest` reads the latest recommendation without generating a new one.
- Recommendation approval or rejection requires `decision`, `reviewer`, and `reason`.
- Claim status does not change when a recommendation is reviewed.
- Audit events retain the operator reason.

## Current limitations

- No production authentication or single sign-on
- One fictional organization and demo operator
- Evidence files are staged in the frontend but not persisted to object storage
- Draft communications are not sent without an external messaging provider
- No external carrier or policy-administration integration
- No cloud deployment configuration

These boundaries are explicit so the portfolio demonstrates real workflow integrity without pretending unsupported integrations exist.
