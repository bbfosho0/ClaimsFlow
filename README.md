# ClaimsFlow

ClaimsFlow is a portfolio-grade insurance claims operations application built with Angular 20, Spring Boot 3.5, Java 21, and PostgreSQL 16.

It demonstrates one connected claim journey across four separated perspectives:

```text
Claimant records a claim and evidence state
        ↓
Adjuster reviews assigned work and communicates
        ↓
Manager sees the portfolio and team impact update
        ↓
Administrator validates a local routing simulation
```

The primary employer-demo surfaces are not disconnected mockups. Their claims, assignments, evidence state, messages, audit events, KPIs, filters, charts, queues, and workload summaries come from persisted backend data.

## What is functional

### Claimant portal

The independent claimant shell supports:

- Starting or resuming a claim
- Viewing status, evidence progress, SLA expectations, and the next action
- Recording supported evidence-category presence
- Reading claimant-visible messages
- Reviewing a claimant-safe timeline

The claimant cannot submit derived priority, completeness, SLA, internal notes, or recommendation state.

### Adjuster

The **Jordan Lee** demo role exposes:

- **My Work** — API-backed assigned work using Jordan Lee’s real seeded UUID
- **Claim Queue** — search and curated backend filters
- **Evidence Operations** — persisted evidence categories, claim context, and claimant-visible messages
- **Claim Workspace** — assignment, status, evidence, recommendation, communication, and audit actions

Evidence Operations deliberately does not pretend to provide binary storage, OCR, extraction, file versions, collaborative comments, email, SMS, or unsupported upload processing.

### Claims Manager

The default employer-facing role is **Alex Morgan, Claims Manager**:

- **Operations Overview** — backend-derived portfolio KPIs, categorized live signals, interventions, capacity, and audit activity
- **Claim Queue** — URL-addressable filters and changed-claim feedback
- **Operational Analytics** — truthful exposure, volume, resolution, evidence, SLA, distribution, aging, and cohort aggregates
- **AI Insights** — evidence-grounded advisory recommendations with explicit human review
- **Team Operations** — workload, capacity, SLA pressure, escalations, advisory links, and operational integrity

No deployed Manager KPI is sourced from a frontend fixture array.

### Platform Administrator

The **Priya Shah** role exposes only **Workflow Automation**.

It can load the real reserved claim and run a deterministic local routing preview. Save Draft and Validate are local-only. Production activation is disabled at the action point with an exact explanation. The simulation cannot approve, deny, pay, close, assign, or otherwise mutate a consequential claim state.

### Not exposed in deployed navigation

- Reports
- Settings

The source-only preview routes may remain for future development, but they are absent from the role rails and employer tour.

## Reactive operational data

A bounded Angular `OperationalDataStore` coordinates Dashboard, Queue, Analytics, Team Operations, and Evidence Operations.

It provides:

- Immediate invalidation after successful claim creation, assignment, status, evidence, claimant-visible message, or demo reset
- A quiet **45-second** refresh while the tab is visible
- Polling pause while the tab is hidden
- Immediate refresh when the tab becomes visible again
- Manual Refresh controls with update-age text
- Cached data during background refresh
- Last-valid-data retention and a nonblocking stale warning after a transient failure
- Brief changed-claim and changed-value feedback

The application does not require WebSockets or server-sent events for the portfolio demonstration.

## Operational APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/dashboard` | Coherent portfolio snapshot, signal counts, workload, and recent activity |
| `GET /api/claims` | Searchable and filterable claim queue |
| `GET /api/analytics` | Backend-derived KPIs, comparisons, trends, distributions, aging, and cohorts |
| `GET /api/team-operations` | Team and adjuster capacity, SLA, escalations, advisories, and integrity |
| `GET /api/evidence-operations` | Read-only evidence operations projection and claimant-visible messages |
| `POST /api/demo/reset` | Configuration-gated reset of the reserved employer journey |

Supported operational filters are:

- Date range
- Claim type
- Priority
- Status
- Team or adjuster
- Region

Visible filters issue real backend queries and recalculate dependent KPIs, charts, tables, and lists.

## Deterministic employer data

When `CLAIMSFLOW_DEMO_ENABLED=true`, ClaimsFlow ensures a deterministic **48-claim fictional historical portfolio** exists.

The dataset covers:

- All claim types
- Five fictional operating regions
- Every status and priority
- Several evidence-completeness bands
- Assigned and unassigned work
- Current, at-risk, overdue, and resolved SLA states
- Multiple teams and adjusters
- Persisted status and audit history
- Resolution timestamps for operational analytics

Stable UUIDs and a defined clock make the history repeatable. The separate reserved Taylor Reed claim remains independently resettable.

The reset transaction:

- Preserves the 48-claim historical portfolio
- Deletes only claims using `taylor.reed@example.com`
- Creates one fresh claim through the normal application service
- Assigns the stable Jordan Lee adjuster
- Adds one claimant-visible welcome message
- Returns the real claim and adjuster IDs

Repeated resets leave exactly one reserved claim.

## Employer walkthrough

Open:

```text
http://localhost:4200/tour
```

The tour follows one claim through:

1. **Claimant Portal** — status, evidence progress, messages, and next action
2. **Adjuster Review** — evidence and human-confirmed communication
3. **Manager Impact** — reactive priority, SLA, ownership, and portfolio context
4. **Administrator Routing** — local simulation with the same real claim
5. **Engineering Proof** — architecture, authority boundaries, tests, and delivery

The tour preserves the real claim ID, supplies the appropriate demo role, supports keyboard navigation, and highlights stable targets on real application routes.

## Routes

### Public and claimant

| Route | Purpose |
| --- | --- |
| `/` | Portfolio showcase |
| `/tour` | Employer walkthrough |
| `/portal` | Claimant home and resume entry point |
| `/portal/claims/new` | Claimant claim intake |
| `/portal/claims/:id` | Claim status and timeline |
| `/portal/claims/:id/documents` | Supported evidence-category recording |
| `/portal/claims/:id/messages` | Claimant-visible messages |

### Deployed employee navigation

| Route | Role | Purpose |
| --- | --- | --- |
| `/app/dashboard` | Manager | Operations Overview |
| `/app/claims` | Manager, Adjuster | Functional Claim Queue |
| `/app/claims/new` | Manager, Adjuster | Employee claim intake |
| `/app/claims/:id` | Manager, Adjuster | Authoritative Claim Workspace |
| `/app/my-work` | Adjuster | Assigned work |
| `/app/analytics` | Manager | Operational Analytics |
| `/app/intelligence` | Manager | Advisory AI Insights |
| `/app/documents` | Adjuster | Evidence Operations |
| `/app/team-ops` | Manager | Team Operations |
| `/app/workflows` | Administrator | Local Workflow Automation preview |

## Backend authority

Spring owns or recalculates:

- Claim number
- Evidence completeness
- Priority and contributing factors
- SLA deadline
- Allowed status transitions
- Assignment validity
- Recommendation review validation
- Operational aggregate snapshots
- Audit events

## Human authority boundary

ClaimsFlow may:

- Explain an advisory recommendation
- Identify missing evidence
- Send a claimant-visible message after explicit confirmation
- Link an advisory to relevant filtered work
- Preview workflow routing locally
- Prepare a reversible action for review

ClaimsFlow may not:

- Approve or deny a claim autonomously
- Pay or close a claim
- Change status merely because a message was sent
- Reassign work from an advisory without an explicit employee action
- Activate a production workflow
- Execute a recommendation review without a human reason and confirmation

## Motion and visual behavior

Motion communicates state rather than decorating every surface:

- KPI numbers interpolate only after values change
- Bars, rings, and chart paths transition to new backend values
- Changed claims and values receive a brief semantic highlight
- Live and SLA-risk indicators use restrained breathing
- Loading skeletons match the final layout
- Background refresh keeps current content visible
- Hover translation remains approximately 1–3 pixels
- Standard transitions remain approximately 160–280 ms

`prefers-reduced-motion` removes interpolation, breathing, scanning, orbiting, chart drawing, and animated scrolling. Values update immediately instead.

The bounded WebGL Copilot orb remains decorative, low-power, lazy, pausable, and isolated from dense operational controls.

## Architecture

```text
Angular 20 standalone application
        |
        | typed JSON over HTTP
        v
Spring REST controllers
        |
        v
Transactional application services
        |
        +-- deterministic claim policies
        +-- operational aggregate queries
        +-- claimant-safe portal projection
        +-- scoped message boundary
        +-- advisory recommendation provider
        +-- immutable audit history
        +-- deterministic demo orchestration
        |
        v
PostgreSQL 16 + Flyway
```

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Angular 20.3, standalone lazy routes, signals, RxJS, Reactive Forms, HttpClient |
| Motion | CSS/SVG state transitions, View Transitions, bounded WebGL, reduced-motion fallback |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA |
| Database | PostgreSQL 16, Flyway |
| API | REST, Jakarta Validation, RFC 9457 Problem Details, Springdoc OpenAPI |
| Testing | Jasmine, Karma, JUnit 5, Mockito, MockMvc, Testcontainers |
| Delivery | Docker Compose and GitHub Actions |

## Quick start

### Prerequisites

- JDK 21
- Maven 3.9+
- Node.js 22+
- npm 10+
- Docker with Compose
- Google Chrome

### Start PostgreSQL

```bash
docker compose up -d db
docker compose ps
```

Wait for the database service to report `healthy`.

### Start Spring Boot

```bash
cd backend
mvn spring-boot:run
```

Health endpoint:

```text
http://localhost:8080/actuator/health
```

### Start Angular

In a second terminal:

```bash
cd frontend
npm ci
npm start
```

Open `http://localhost:4200`.

The Angular development server proxies `/api` and `/actuator` to port `8080`.

## Enable the employer journey

The reset endpoint and deterministic historical seeding are disabled by default.

PowerShell:

```powershell
$env:CLAIMSFLOW_DEMO_ENABLED = 'true'
cd backend
mvn spring-boot:run
```

Bash:

```bash
cd backend
CLAIMSFLOW_DEMO_ENABLED=true mvn spring-boot:run
```

Then choose **Reset Demo Journey** from the employee profile menu.

## Configuration

```text
DB_URL=jdbc:postgresql://localhost:5432/claimsflow
DB_USERNAME=claimsflow
DB_PASSWORD=claimsflow
PORT=8080
CLAIMSFLOW_DEMO_ENABLED=false
OPENAI_API_KEY=
```

Remote recommendations are optional. Without a valid provider response, ClaimsFlow uses its deterministic advisory fallback.

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

### Visual QA

`.github/workflows/visual-qa.yml` starts PostgreSQL, Spring Boot in demo mode, and Angular, then runs:

```bash
cd frontend
CHROME_EXECUTABLE=/path/to/chrome node scripts/capture-operational-visual-qa.mjs
```

The workflow validates and uploads **18 screenshots** covering:

- Claimant, Adjuster, Manager, Administrator, and tour surfaces
- Dashboard baseline and evidence-changed states
- SLA-filtered Claim Queue
- Default and region-filtered Analytics
- Default and team-filtered Team Operations
- Evidence Operations before and after evidence mutation
- A failed background refresh retaining the last valid Dashboard snapshot
- Reduced-motion rendering
- Mobile claimant, Manager, and Evidence Operations layouts

## Explicit limitations

- No production authentication, authorization, or SSO
- Demo persona switching is presentation-only
- Evidence categories are persisted; binary files are not stored
- No OCR, extraction, file versioning, or collaborative document comments
- No email, SMS, payment, carrier, or policy-administration integration
- Workflow draft, validation, and simulation are local-only
- Production workflow activation is disabled
- Reports and Settings are not deployed navigation surfaces
- The operating portfolio is deterministic fictional data
- No cloud deployment configuration is included

These boundaries are explicit so the project demonstrates real state, backend aggregation, reactivity, accessibility, testing, and product judgment without overstating production capability.

## Design and implementation records

- `docs/superpowers/specs/2026-08-02-role-aware-claims-journey-design.md`
- `docs/superpowers/plans/2026-08-02-role-aware-claims-journey-implementation.md`
- `docs/superpowers/specs/2026-08-03-deployment-truthful-employer-mvp-design.md`
- `docs/superpowers/plans/2026-08-03-deployment-truthful-employer-mvp.md`
- `docs/demo-script.md`

Figma remains an art-direction source. The Angular application, Spring API, automated tests, and exact-head rendered screenshots define the implemented product.
