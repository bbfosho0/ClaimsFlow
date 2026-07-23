# ClaimsFlow

ClaimsFlow is an internal insurance claims operations portal for adjusters and team leads. It demonstrates a complete enterprise workflow with a Java 21 and Spring Boot backend, an Angular standalone frontend, PostgreSQL persistence, deterministic decision support, and an immutable audit trail.

The project uses a modular monolith. It demonstrates meaningful business boundaries, transactions, validation, persistence, testing, and API integration without introducing distributed-system complexity that the workflow does not require.

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

Backend packages are organized by business capability: claims, adjusters, recommendations, audit, and dashboard. Controllers translate HTTP requests, application services coordinate transactions, and deterministic policies own completeness, priority, recommendation, and status-transition rules.

## Technology

| Area | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA |
| Validation | Jakarta Bean Validation, domain policies |
| Database | PostgreSQL 16, Flyway migrations |
| API | REST, RFC 9457 Problem Details, Springdoc OpenAPI |
| Frontend | Angular 20 standalone components, Router, Reactive Forms, HttpClient, signals, RxJS |
| Testing | JUnit 5, AssertJ, MockMvc, Testcontainers, Jasmine, Karma |
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

Install the following before starting:

- Git
- Java Development Kit 21
- Maven 3.9 or newer
- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop or Docker Engine with Docker Compose
- Google Chrome for local Karma tests

A global Angular CLI installation is not required. The npm scripts use the repository-pinned Angular CLI.

Verify the tools from a terminal:

```bash
git --version
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
```

`mvn -version` must report Java 21. If it reports another Java version, correct `JAVA_HOME` before starting the backend.

## Clone the repository

Using the current repository name:

```bash
git clone https://github.com/bbfosho0/Programming1SemesterProject.git
cd Programming1SemesterProject
```

If the repository has been renamed to `ClaimsFlow`, use the clone URL displayed by GitHub and enter the corresponding directory.

## Quick start

No environment variables are required for the default local setup. The backend defaults match the PostgreSQL credentials in `docker-compose.yml`.

### 1. Start PostgreSQL

Ensure Docker Desktop or the Docker daemon is running, then execute from the repository root:

```bash
docker compose up -d db
docker compose ps
```

Wait until the `db` service reports `healthy`. The first backend startup runs Flyway migrations and loads fictional demonstration data automatically.

### 2. Start the Spring Boot backend

Open a terminal in the repository root:

```bash
cd backend
mvn spring-boot:run
```

The backend is ready when the console reports that the application started on port `8080`.

### Optional AI-assisted recommendations

OpenAI recommendations are opt-in. To enable them locally, set `OPENAI_API_KEY` to your own key using a placeholder in documentation or your local shell, then start the backend:

```powershell
$env:OPENAI_API_KEY = 'your-api-key'
cd backend
mvn spring-boot:run
```

ClaimsFlow sends a redacted operational summary to OpenAI for decision-support only. AI results are advisory and never approve, deny, or change a claim automatically. If no key is configured, or the provider is unavailable or returns an invalid result, ClaimsFlow automatically uses its deterministic rule-based recommendation instead.

Verify it in another terminal:

```bash
curl http://localhost:8080/actuator/health
```

PowerShell equivalent:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

Expected status:

```json
{"status":"UP"}
```

### 3. Start the Angular frontend

Open a second terminal in the repository root:

```bash
cd frontend
npm ci
npm start
```

Open `http://localhost:4200`.

The Angular development server proxies `/api` and `/actuator` requests to `http://localhost:8080`, so the browser does not require separate CORS configuration during local development.

### Running services

| Service | Address |
| --- | --- |
| Angular application | `http://localhost:4200` |
| Spring Boot API | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| Health endpoint | `http://localhost:8080/actuator/health` |
| PostgreSQL | `localhost:5432` |

## Configuration

The default backend configuration is:

```text
DB_URL=jdbc:postgresql://localhost:5432/claimsflow
DB_USERNAME=claimsflow
DB_PASSWORD=claimsflow
PORT=8080
OPENAI_API_KEY=
```

These values match `docker-compose.yml`. The credentials are for local development only.

### Bash or zsh

```bash
export DB_URL='jdbc:postgresql://localhost:5432/claimsflow'
export DB_USERNAME='claimsflow'
export DB_PASSWORD='claimsflow'
export PORT='8080'
cd backend
mvn spring-boot:run
```

### Windows PowerShell

```powershell
$env:DB_URL = 'jdbc:postgresql://localhost:5432/claimsflow'
$env:DB_USERNAME = 'claimsflow'
$env:DB_PASSWORD = 'claimsflow'
$env:PORT = '8080'
Set-Location backend
mvn spring-boot:run
```

Changing the backend port also requires changing the target in `frontend/proxy.conf.json` for local Angular development.

`OPENAI_API_KEY` is optional and must be supplied through the environment; never commit a key. Leave it unset or blank to use deterministic recommendations. The integration uses the `gpt-5-nano` model by default, sends only redacted operational claim fields, and falls back automatically when the provider fails or its response does not pass local validation.

## Database operations

Open a PostgreSQL shell inside the container:

```bash
docker compose exec db psql -U claimsflow -d claimsflow
```

Useful commands inside `psql`:

```sql
\dt
SELECT claim_number, status, priority FROM claims ORDER BY created_at DESC;
\q
```

Stop PostgreSQL without deleting data:

```bash
docker compose stop db
```

Stop and remove the container while preserving the named volume:

```bash
docker compose down
```

Delete all local database data and recreate the seed dataset on the next startup:

```bash
docker compose down -v
docker compose up -d db
```

The `-v` command permanently removes the local ClaimsFlow database volume.

## Verification

### Backend tests and package verification

The full Maven verification includes unit tests, web-layer tests, application-context verification, Flyway validation, and PostgreSQL Testcontainers integration tests:

```bash
cd backend
mvn verify
```

Create the executable Spring Boot JAR without skipping tests:

```bash
mvn package
```

The packaged application is written under `backend/target/`.

### Frontend tests and production build

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

The production bundle is written under `frontend/dist/`.

For interactive local test watching:

```bash
npm test
```

### Verify everything from the repository root

Run these commands in sequence:

```bash
docker compose up -d db
cd backend && mvn verify
cd ../frontend && npm ci && npm run test:ci && npm run build
```

GitHub Actions runs independent backend and frontend verification jobs using the committed Maven and npm dependency definitions.

## Dependency changes

For normal setup and CI, use `npm ci` so the committed lockfile is honored.

When intentionally changing frontend dependencies:

```bash
cd frontend
npm install
npm run test:ci
npm run build
```

Commit both `package.json` and `package-lock.json`. Do not edit `package-lock.json` manually.

Backend dependencies are declared in `backend/pom.xml`. After changing them, run `mvn verify` before committing.

## Flyway migration rules

- Flyway owns the database schema.
- Never use Hibernate `create`, `create-drop`, or `update` for runtime schema management.
- Never modify a migration that may already have been applied.
- Add a new sequential migration under `backend/src/main/resources/db/migration/`.
- For disposable local data only, `docker compose down -v` can reset the database after migration experiments.

## Troubleshooting

### Docker cannot connect

Confirm Docker Desktop is running, then execute:

```bash
docker info
docker compose ps
```

### Port 5432 is already in use

A locally installed PostgreSQL server may already own the port. Stop that service before using the provided Compose database, or update both the host port in `docker-compose.yml` and `DB_URL` consistently.

### Backend reports a database connection error

Check database health:

```bash
docker compose ps
docker compose logs db
```

The backend defaults expect database, username, and password `claimsflow` on port `5432`.

If credentials were changed after the database volume was created, reset the disposable local database:

```bash
docker compose down -v
docker compose up -d db
```

### Maven uses the wrong Java version

Run:

```bash
mvn -version
```

Set `JAVA_HOME` to a JDK 21 installation and reopen the terminal.

### Port 8080 or 4200 is already in use

Stop the process using the port before starting ClaimsFlow. The frontend proxy expects the backend on port `8080` unless `frontend/proxy.conf.json` is updated.

### Frontend dependencies fail to install

Confirm Node.js 22 and npm 10 or newer, then remove only the local dependency directory and reinstall from the lockfile:

```bash
cd frontend
rm -rf node_modules
npm ci
```

PowerShell equivalent:

```powershell
Set-Location frontend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm ci
```

### ChromeHeadless cannot start

Install Google Chrome and ensure it is available to the current user. The Angular production build does not require Chrome, but `npm run test:ci` does.

### Flyway reports a checksum mismatch

Do not edit an applied migration. Restore the original migration or create a new migration. For disposable local data, reset the database volume with `docker compose down -v`.

## API documentation

With the backend running:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health: `http://localhost:8080/actuator/health`

See `docs/api-overview.md` for the workflow-level API contract.

## Interview demo

Use `docs/demo-script.md` for the structured eight-minute walkthrough. The recommended path is:

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

The seed data makes the dashboard, queue filters, assignments, and SLA indicators immediately demonstrable after the first startup.

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
- OpenAI recommendations are optional; deterministic rule-based recommendations remain the fallback

These constraints keep the project locally runnable and focused on the junior full-stack interview workflow.
