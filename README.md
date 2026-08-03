# ClaimsFlow

ClaimsFlow is a portfolio-grade insurance claims operations platform built with Angular 20, Spring Boot 3.5, Java 21, and PostgreSQL 16.

It demonstrates one end-to-end claim journey across four clearly separated perspectives:

```text
Claimant submits and tracks a claim
        ↓
Adjuster reviews evidence and communicates
        ↓
Manager monitors operational impact
        ↓
Administrator previews workflow routing
```

The system is not a collection of disconnected dashboard mockups. The claimant portal, employee workspaces, deterministic backend policies, scoped messages, audit events, and resettable employer demonstration share real application state.

## Product model

### Claimant portal

A focused customer experience with a separate shell:

- Start or resume a claim
- View status and the next required action
- Record evidence presence
- Read claimant-visible messages
- Review a claimant-safe timeline

The portal does not expose internal priority factors, recommendation details, or employee-only notes.

### Adjuster

The Adjuster role is represented by **Jordan Lee** and includes:

- My Work
- Claim Queue
- Documents
- Reports
- Claim Workspace opened contextually from assigned work

The functional golden path loads Jordan Lee’s real seeded UUID, queries assigned claims through the API, reviews evidence, and sends a claimant-visible message only after an explicit confirmation step.

### Claims Manager

The default employer-facing role is **Alex Morgan, Claims Manager**:

- Operations Overview
- Claim Queue
- Analytics
- AI Insights
- Team Operations
- Reports

The reserved claim appears in the live queue and Manager overview using the exact claim identifier returned by the reset transaction.

### Platform Administrator

The Administrator role is represented by **Priya Shah**:

- Workflow Automation
- Reports
- Settings

The workflow builder can load the real reserved claim into a typed **local routing preview**. Save Draft and Validate are local-only. Production activation is disabled and clearly labeled as unavailable.

## Demo roles

The employee profile menu switches instantly between:

- Claims Manager
- Adjuster
- Administrator
- Claimant Portal

This is intentionally a **demo persona system**, not authentication or authorization. Route guards and navigation ownership improve presentation clarity; they are not a substitute for backend security.

The selected role is reflected in the URL and local storage so role-specific views remain understandable when refreshed or shared.

## Employer walkthrough

Open:

```text
http://localhost:4200/tour
```

The walkthrough follows one claim through five steps:

1. **Claimant Portal** — clear status, progress, messages, and next action
2. **Adjuster Review** — evidence, human-confirmed communication, and bounded guidance
3. **Manager Impact** — SLA, priority, evidence, ownership, and portfolio context
4. **Administrator Routing** — local workflow simulation using the real claim
5. **Engineering Proof** — architecture, authority boundaries, tests, and delivery

The controller navigates real application routes, preserves the claim ID, supplies the correct demo role, supports arrow-key navigation, and highlights stable `data-tour-target` elements. It does not replay screenshots or own business logic.

## Routes

### Public and claimant routes

| Route | Purpose |
| --- | --- |
| `/` | Portfolio showcase |
| `/tour` | Five-step employer walkthrough and engineering proof |
| `/portal` | Claimant home and resume entry point |
| `/portal/claims/new` | Claimant-mode typed claim intake |
| `/portal/claims/:id` | Claim status, next action, progress, and timeline |
| `/portal/claims/:id/documents` | Evidence-presence recording |
| `/portal/claims/:id/messages` | Claimant-visible message history |

### Employee routes

| Route | Primary role | Purpose |
| --- | --- | --- |
| `/app/dashboard` | Manager | Portfolio pressure and golden-journey impact |
| `/app/my-work` | Adjuster | API-backed personal assigned work |
| `/app/claims` | Manager, Adjuster | Filterable queue and selected-claim context |
| `/app/claims/:id` | Manager, Adjuster | Dossier, evidence, communications, decisions, and audit |
| `/app/claims/new` | Manager, Adjuster | Employee claim intake |
| `/app/analytics` | Manager | Performance and operational analytics |
| `/app/intelligence` | Manager | Portfolio review and advisory intelligence |
| `/app/documents` | Adjuster | Document investigation workspace |
| `/app/team-ops` | Manager | Capacity and SLA operations |
| `/app/workflows` | Administrator | Local workflow routing preview |
| `/app/reports` | All employee roles | Reporting workspace |
| `/app/settings` | Administrator | Governance and integration configuration surface |

Legacy `/dashboard` and `/claims*` URLs redirect to the corresponding `/app/*` routes.

## Backend-authoritative behavior

Spring owns and recalculates:

- Claim number
- Evidence completeness
- Priority and priority factors
- SLA deadline
- Allowed status transitions
- Assignment validity
- Recommendation review validation
- Audit events

The claimant portal may record that a supported evidence category is present or absent. It cannot submit a derived completeness percentage, priority, or SLA.

## Human authority boundary

ClaimsFlow may:

- Explain an advisory recommendation
- Identify missing evidence
- Draft or send a claimant-portal message after confirmation
- Preview workflow routing locally
- Prepare a reversible action for review

ClaimsFlow may not:

- Approve or deny a claim autonomously
- Pay or close a claim
- Change claim status when a message is sent
- Reassign work without an explicit employee action
- Activate a production workflow from the portfolio demo
- Execute a recommendation review without a human reason and confirmation

Recommendation review state and claim workflow state remain separate.

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
        +-- deterministic claim policies
        +-- claimant-safe portal projection
        +-- scoped message boundary
        +-- advisory recommendation provider
        +-- immutable audit service
        |
        v
PostgreSQL 16 and Flyway
```

The backend is a modular monolith organized by business capability: claims, adjusters, portal messaging, recommendations, audit, dashboard, and deterministic demo orchestration.

## Visual system and motion

The Figma and Figma Make work is treated as art direction. Angular and the browser-rendered application are the implementation source of truth.

The web implementation uses:

- Layered midnight surfaces
- Cyan, teal, violet, amber, and coral operational signals
- Restrained 160–280 ms interaction and route motion
- Browser View Transitions with CSS fallbacks
- Reduced-motion support
- Accessible SVG and CSS visualizations
- One bounded, lazy WebGL Copilot orb

The Copilot effect:

- Is decorative and isolated to the sidebar card
- Uses a low-power WebGL context
- Caps device-pixel ratio
- Pauses when off-screen
- Handles context loss
- Falls back to a static CSS orb
- Disables animation when reduced motion is requested

Shaders are not placed behind tables, forms, evidence records, or decision controls.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Angular 20.3, standalone lazy routes, signals, RxJS, Reactive Forms, HttpClient |
| Motion | View Transitions, CSS animation, bounded WebGL effect, reduced-motion fallback |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA |
| API | REST, Jakarta Validation, RFC 9457 Problem Details, Springdoc OpenAPI |
| Database | PostgreSQL 16, Flyway migrations |
| Decision support | Optional provider with strict validation and deterministic fallback |
| Testing | Jasmine, Karma, JUnit 5, Mockito, MockMvc, Testcontainers |
| Delivery | Docker Compose and GitHub Actions |

## Repository structure

```text
backend/                       Spring Boot API and domain modules
frontend/                      Angular showcase, portals, tour, and employee app
design/figma/                  Frozen Figma-to-code maps
docs/design/                   Design handoff and implementation notes
docs/superpowers/specs/        Approved product architecture
docs/superpowers/plans/        Approved implementation plan and review
docker-compose.yml             Local PostgreSQL
.github/workflows/ci.yml       Frontend and backend verification
.github/workflows/visual-qa.yml Backend-backed rendered route capture
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

Verify Java selection:

```bash
java -version
mvn -version
```

Both commands must use Java 21.

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

Wait for the database service to report `healthy`.

### 3. Start Spring Boot

```bash
cd backend
mvn spring-boot:run
```

Health endpoint:

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

## Enable the deterministic employer journey

The reset endpoint is **disabled by default**. Enable it only for local portfolio demonstration or controlled visual QA.

PowerShell:

```powershell
$env:CLAIMSFLOW_DEMO_ENABLED = 'true'
cd backend
mvn spring-boot:run
```

Bash:

```bash
CLAIMSFLOW_DEMO_ENABLED=true mvn spring-boot:run
```

Then use **Reset Demo Journey** from the employee profile menu.

The reset transaction:

- Deletes only claims owned by the reserved fictional email `taylor.reed@example.com`
- Preserves unrelated claims
- Creates one deterministic baseline claim through normal application services
- Assigns the stable seeded Jordan Lee adjuster
- Adds a claimant-visible welcome message
- Returns the real claim and adjuster IDs

Calling reset repeatedly leaves exactly one reserved claim.

## Optional recommendation provider

Remote recommendations are opt-in. Set the provider key in the backend process environment. Never commit a key.

Without a key, after a provider failure, or after an invalid response, ClaimsFlow uses the deterministic fallback. The result remains advisory and cannot mutate claim workflow state.

## Configuration

Defaults match `docker-compose.yml`:

```text
DB_URL=jdbc:postgresql://localhost:5432/claimsflow
DB_USERNAME=claimsflow
DB_PASSWORD=claimsflow
PORT=8080
CLAIMSFLOW_DEMO_ENABLED=false
OPENAI_API_KEY=
```

Changing the backend port also requires updating `frontend/proxy.conf.json`.

## Verification

### Backend

```bash
cd backend
mvn verify
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

GitHub Actions runs:

- Independent backend verification
- Frontend tests and production build
- PostgreSQL-backed deterministic demo reset
- Desktop and mobile screenshots of claimant, adjuster, manager, administrator, tour, and premium workspace routes

## Important API behavior

- Errors use Problem Details with stable application codes.
- Missing routes return a real 404 Problem Details response rather than a generic 500.
- Claim transitions are validated by deterministic policy.
- Claimant messages are filtered by audience.
- Internal notes never appear in the claimant portal feed.
- Sending a message appends an audit event but does not change claim status.
- Recommendation approval or rejection requires a decision, reviewer, and reason.
- Reviewing a recommendation does not change claim status.
- Demo reset is configuration-gated and scoped to one reserved fictional identity.

## Current limitations

- No production authentication, authorization, or single sign-on
- Demo role switching is presentation-only
- Evidence categories are persisted, but binary files are not stored in object storage
- No email, SMS, payment, carrier, or policy-administration integration
- Workflow Save Draft and Validate are local-only
- Production workflow activation is disabled
- One fictional organization and deterministic demonstration dataset
- No cloud deployment configuration

These boundaries are explicit so the portfolio demonstrates real workflow integrity without pretending unsupported integrations exist.

## Design sources

The final design handoff and role-aware implementation documents are recorded in:

- `docs/design/claimsflow-final-mvp-handoff.md`
- `docs/superpowers/specs/2026-08-02-role-aware-claims-journey-design.md`
- `docs/superpowers/plans/2026-08-02-role-aware-claims-journey-implementation.md`
- `design/figma/claimsflow-component-map.json`
- `design/figma/claimsflow-motion-map.json`
- `design/figma/claimsflow-shader-map.json`

Figma is a design reference. The Angular application, Spring API, automated tests, and rendered screenshots define the implemented product.
