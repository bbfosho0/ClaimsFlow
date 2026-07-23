# ClaimsFlow MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file inventory console program with an interview-ready insurance claims operations portal built with Spring Boot, Angular, PostgreSQL, deterministic decision support, audit history, automated tests, and complete developer documentation.

**Architecture:** Build a modular monolith with an Angular standalone frontend and a Spring Boot REST backend. Controllers translate HTTP requests, application services coordinate transactions, domain policies own deterministic business rules, Spring Data JPA adapters persist state, and Flyway owns the PostgreSQL schema. The recommendation provider remains behind an interface so the core runtime works without an external AI service.

**Tech Stack:** Java 21, Spring Boot 3.5.9, Maven Wrapper, Spring Web, Spring Data JPA, Bean Validation, PostgreSQL, Flyway, Springdoc OpenAPI, Actuator, JUnit 5, MockMvc, Testcontainers, Angular 20 standalone APIs, TypeScript, Angular Router, Reactive Forms, HttpClient, signals, RxJS, Jasmine/Karma, Docker Compose, GitHub Actions.

## Global Constraints

- Use Java 21 and Spring Boot 3.5.9.
- Use Angular 20 with standalone components and route-level lazy loading.
- Use PostgreSQL at runtime and Flyway as the only schema-authoring mechanism.
- Configure Hibernate with `ddl-auto: validate`; never use `create`, `create-drop`, or `update` outside isolated tests.
- Keep controllers thin and prohibit direct controller-to-repository calls.
- Do not serialize JPA entities from REST endpoints; use immutable request and response DTOs.
- Keep domain policies deterministic and independent of Spring where practical.
- Use RFC 9457 Problem Details with stable application error codes and request identifiers.
- Do not add production authentication, file upload, Kafka, RabbitMQ, Kubernetes, tenant isolation, paid model providers, or automatic claim approval.
- Keep recommendations advisory; a user must explicitly approve or reject each pending recommendation.
- Use fictional seed data only.
- Do not commit credentials, `node_modules`, Maven build output, IDE state, database volumes, prompt logs, tool transcripts, or assistant branding.
- Do not claim verification succeeded unless the exact commands in this plan or equivalent CI jobs pass.

## Locked File Map

### Repository root

- `README.md`: product summary, architecture, startup, testing, demo, tradeoffs, and limitations.
- `AGENTS.md`: neutral engineering rules, boundaries, commands, migration policy, and testing expectations.
- `.gitignore`: Java, Node, Angular, IDE, environment, and local database exclusions.
- `docker-compose.yml`: PostgreSQL 16 development database.
- `.github/workflows/ci.yml`: independent backend and frontend verification jobs.

### Backend

- `backend/pom.xml`: Spring Boot build and dependency definition.
- `backend/mvnw`, `backend/mvnw.cmd`, `backend/.mvn/wrapper/*`: Maven Wrapper.
- `backend/src/main/java/com/claimsflow/ClaimsFlowApplication.java`: application entry point.
- `backend/src/main/java/com/claimsflow/shared/web/RequestIdFilter.java`: request correlation.
- `backend/src/main/java/com/claimsflow/shared/error/*`: domain exceptions and Problem Details mapping.
- `backend/src/main/java/com/claimsflow/claim/domain/*`: claim enums, entity, transition policy, completeness policy, and priority policy.
- `backend/src/main/java/com/claimsflow/claim/application/*`: claim commands, queries, and transactional services.
- `backend/src/main/java/com/claimsflow/claim/api/*`: REST DTOs, mapper, and controller.
- `backend/src/main/java/com/claimsflow/claim/persistence/*`: Spring Data repository and specifications.
- `backend/src/main/java/com/claimsflow/adjuster/*`: adjuster entity, repository, service, DTO, and controller.
- `backend/src/main/java/com/claimsflow/recommendation/*`: recommendation entity, provider interface, rule provider, service, DTOs, and controller.
- `backend/src/main/java/com/claimsflow/audit/*`: immutable audit entity, repository, service, DTO, and controller.
- `backend/src/main/java/com/claimsflow/dashboard/*`: dashboard query service, DTOs, and controller.
- `backend/src/main/resources/application.yml`: runtime configuration.
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`: tables, constraints, and indexes.
- `backend/src/main/resources/db/migration/V2__seed_demo_data.sql`: fictional interview data.
- `backend/src/test/java/com/claimsflow/**/*`: unit, web, and persistence tests.

### Frontend

- `frontend/package.json`: Angular scripts and dependencies.
- `frontend/angular.json`, `frontend/tsconfig*.json`: Angular build and TypeScript configuration.
- `frontend/src/main.ts`: standalone bootstrap.
- `frontend/src/app/app.config.ts`: router, HttpClient, and interceptor providers.
- `frontend/src/app/app.routes.ts`: lazy route definitions.
- `frontend/src/app/core/api/*`: API base URL, typed client, error model, and interceptor.
- `frontend/src/app/core/layout/*`: application shell and navigation.
- `frontend/src/app/shared/models/*`: typed API contracts.
- `frontend/src/app/dashboard/*`: dashboard page and data service.
- `frontend/src/app/claims/data-access/*`: claim API service and URL filter codec.
- `frontend/src/app/claims/feature-queue/*`: queue page.
- `frontend/src/app/claims/feature-create/*`: reactive claim form.
- `frontend/src/app/claims/feature-detail/*`: claim workspace.
- `frontend/src/styles.css`: design tokens and global responsive styles.
- `frontend/src/**/*.spec.ts`: component, service, and utility tests.

### Documentation

- `docs/product-brief.md`: users, problem, jobs, and acceptance criteria.
- `docs/architecture.md`: module boundaries and data flow.
- `docs/api-overview.md`: endpoints and example payloads.
- `docs/demo-script.md`: eight-minute interview walkthrough.
- `docs/decisions/001-modular-monolith.md`: architecture decision.
- `docs/decisions/002-rule-based-recommendations.md`: decision-support boundary.
- `docs/decisions/003-postgresql-and-flyway.md`: persistence decision.

---

### Task 1: Establish the buildable monorepo and smoke tests

**Files:**
- Delete: `Main.java`
- Create: `.gitignore`
- Create: `docker-compose.yml`
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/claimsflow/ClaimsFlowApplication.java`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/test/java/com/claimsflow/ClaimsFlowApplicationTest.java`
- Create: `frontend/package.json`
- Create: `frontend/angular.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/tsconfig.spec.json`
- Create: `frontend/src/index.html`
- Create: `frontend/src/main.ts`
- Create: `frontend/src/app/app.component.ts`
- Create: `frontend/src/app/app.component.spec.ts`
- Create: `frontend/src/app/app.config.ts`
- Create: `frontend/src/app/app.routes.ts`
- Create: `frontend/src/styles.css`
- Create: `README.md`
- Create: `AGENTS.md`

**Interfaces:**
- Consumes: no application interfaces.
- Produces: `ClaimsFlowApplication`, a bootable Angular root component, `mvn verify`, `npm test -- --watch=false`, and `npm run build`.

- [ ] **Step 1: Write backend and frontend smoke tests**

Create `backend/src/test/java/com/claimsflow/ClaimsFlowApplicationTest.java`:

```java
package com.claimsflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ClaimsFlowApplicationTest {
    @Test
    void contextLoads() {
    }
}
```

Create `frontend/src/app/app.component.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
  });

  it('renders the product name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ClaimsFlow');
  });
});
```

- [ ] **Step 2: Run smoke tests and verify they fail before scaffolding**

Run:

```bash
cd backend && mvn test
cd ../frontend && npm test -- --watch=false
```

Expected: both commands fail because the backend build and Angular workspace do not exist yet.

- [ ] **Step 3: Create the minimal backend and frontend builds**

Create `backend/pom.xml` with parent `org.springframework.boot:spring-boot-starter-parent:3.5.9`, Java version `21`, and dependencies for web, validation, data-jpa, actuator, Flyway, PostgreSQL runtime, Springdoc `2.8.5`, test starter, Testcontainers JUnit Jupiter, Testcontainers PostgreSQL, and `spring-boot-testcontainers`. Configure `spring-boot-maven-plugin`.

Create `backend/src/main/java/com/claimsflow/ClaimsFlowApplication.java`:

```java
package com.claimsflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClaimsFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClaimsFlowApplication.class, args);
    }
}
```

Create `backend/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: claimsflow
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/claimsflow}
    username: ${DB_USERNAME:claimsflow}
    password: ${DB_PASSWORD:claimsflow}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  flyway:
    enabled: true
management:
  endpoints:
    web:
      exposure:
        include: health,info
server:
  port: ${PORT:8080}
```

Create `frontend/package.json` with Angular `20.3.0` packages, TypeScript `5.8.3`, RxJS `7.8.2`, Zone.js `0.15.1`, Angular CLI/build `20.3.0`, Jasmine `5.8.0`, Karma `6.4.4`, Chrome launcher `3.2.0`, and scripts `start`, `build`, `test`, and `test:ci` where `test:ci` is `ng test --watch=false --browsers=ChromeHeadless`.

Create `frontend/src/app/app.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<header><strong>ClaimsFlow</strong></header><main><router-outlet /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

Create `frontend/src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => console.error(error));
```

Create `frontend/src/app/app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};
```

Create `frontend/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [{ path: '', pathMatch: 'full', redirectTo: 'dashboard' }];
```

Create `docker-compose.yml` with a PostgreSQL 16 service named `db`, database/user/password `claimsflow`, port `5432:5432`, a health check using `pg_isready`, and named volume `claimsflow-data`.

Create `.gitignore` covering `.idea`, `.vscode`, `.env`, `backend/target`, `frontend/node_modules`, `frontend/dist`, `coverage`, Chrome test output, and local PostgreSQL volumes.

Create concise initial `README.md` and `AGENTS.md` that identify the project, stack, current branch workflow, and verification commands without claiming features not yet implemented.

- [ ] **Step 4: Run smoke verification**

Run:

```bash
cd backend && mvn test
cd ../frontend && npm install && npm run test:ci && npm run build
```

Expected: the Spring context test passes, the Angular component test passes, and the production bundle builds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold ClaimsFlow monorepo"
```

---

### Task 2: Add the PostgreSQL schema, entities, and repositories

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- Create: `backend/src/main/resources/db/migration/V2__seed_demo_data.sql`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimType.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimPriority.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimStatus.java`
- Create: `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/domain/Recommendation.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/domain/RecommendationReviewState.java`
- Create: `backend/src/main/java/com/claimsflow/audit/domain/AuditEvent.java`
- Create: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Create: `backend/src/main/java/com/claimsflow/adjuster/persistence/AdjusterJpaRepository.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/persistence/RecommendationJpaRepository.java`
- Create: `backend/src/main/java/com/claimsflow/audit/persistence/AuditEventJpaRepository.java`
- Create: `backend/src/test/java/com/claimsflow/persistence/SchemaIntegrationTest.java`

**Interfaces:**
- Consumes: configured PostgreSQL datasource and Flyway.
- Produces: persisted `Claim`, `Adjuster`, `Recommendation`, and `AuditEvent` aggregates with UUID identifiers and optimistic locking on claims.

- [ ] **Step 1: Write the failing schema integration test**

Create `SchemaIntegrationTest` with `@SpringBootTest`, `@Testcontainers(disabledWithoutDocker = true)`, a static `PostgreSQLContainer<?>` annotated with `@Container` and `@ServiceConnection`, and assertions that `AdjusterJpaRepository.count()` and `ClaimJpaRepository.count()` are greater than zero after Flyway seed migration.

- [ ] **Step 2: Run the integration test and verify failure**

Run:

```bash
cd backend
mvn -Dtest=SchemaIntegrationTest test
```

Expected: FAIL because migrations, entities, and repositories do not exist.

- [ ] **Step 3: Create schema and persistence model**

`V1__initial_schema.sql` must create `adjusters`, `claims`, `recommendations`, and `audit_events` with UUID primary keys, foreign keys, enum-compatible varchar checks, non-negative loss checks, confidence range `0.00` to `1.00`, immutable audit timestamps, claim version column, and indexes on claim number, status, priority, assignee, SLA deadline, and audit claim/timestamp.

Define enums with these exact constants:

```java
public enum ClaimType { AUTO, PROPERTY, PERSONAL_INJURY }
public enum ClaimPriority { LOW, MEDIUM, HIGH, CRITICAL }
public enum ClaimStatus { NEW, UNDER_REVIEW, WAITING_FOR_INFORMATION, READY_FOR_DECISION, RESOLVED, CLOSED }
public enum RecommendationReviewState { PENDING, APPROVED, REJECTED }
```

Map entities with `@Entity`, UUID identifiers, `Instant` timestamps, `BigDecimal` monetary values, `@Enumerated(EnumType.STRING)`, and `@Version long version` on `Claim`. Store missing recommendation information in a separate `recommendation_missing_information` element collection table created by the migration.

`V2__seed_demo_data.sql` must insert four fictional adjusters and at least six fictional claims spanning every major status, priority, assignment, completeness, and SLA-risk state.

- [ ] **Step 4: Run schema verification**

Run:

```bash
cd backend
mvn -Dtest=SchemaIntegrationTest test
```

Expected: PASS when Docker is available; otherwise Testcontainers reports the test skipped without failing the build.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main backend/src/test/java/com/claimsflow/persistence
git commit -m "feat: add claims persistence model"
```

---

### Task 3: Implement deterministic claim policies with boundary tests

**Files:**
- Create: `backend/src/main/java/com/claimsflow/claim/domain/CompletenessResult.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimCompletenessPolicy.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/PriorityResult.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimPriorityPolicy.java`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimStatusTransitionPolicy.java`
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimCompletenessPolicyTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimPriorityPolicyTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimStatusTransitionPolicyTest.java`

**Interfaces:**
- Consumes: `ClaimType`, `ClaimStatus`, claim evidence booleans, loss amount, incident date, and SLA deadline.
- Produces: `CompletenessResult(int percentage, List<String> missingEvidence)`, `PriorityResult(ClaimPriority priority, List<String> factors)`, and `boolean canTransition(ClaimStatus from, ClaimStatus to)`.

- [ ] **Step 1: Write failing policy tests**

Test exact completeness rules:

```java
assertThat(policy.evaluate(ClaimType.AUTO, true, true, false, false))
    .isEqualTo(new CompletenessResult(100, List.of()));
assertThat(policy.evaluate(ClaimType.PROPERTY, false, true, false, false).missingEvidence())
    .containsExactly("proofOfOwnership");
assertThat(policy.evaluate(ClaimType.PERSONAL_INJURY, true, false, false, false).missingEvidence())
    .containsExactly("medicalDocumentation");
```

Test priority boundaries using a fixed `Clock`:

```java
assertThat(policy.evaluate(new BigDecimal("100000"), ClaimType.PERSONAL_INJURY,
    LocalDate.now(clock).minusDays(1), 100, Instant.now(clock).plus(2, ChronoUnit.HOURS)).priority())
    .isEqualTo(ClaimPriority.CRITICAL);
```

Test transitions:

```java
assertThat(policy.canTransition(ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW)).isTrue();
assertThat(policy.canTransition(ClaimStatus.CLOSED, ClaimStatus.UNDER_REVIEW)).isFalse();
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
cd backend
mvn -Dtest='ClaimCompletenessPolicyTest,ClaimPriorityPolicyTest,ClaimStatusTransitionPolicyTest' test
```

Expected: FAIL because the policy classes do not exist.

- [ ] **Step 3: Implement minimal deterministic policies**

Implement `ClaimCompletenessPolicy` with exact required evidence:

- `AUTO`: incident report and photos.
- `PROPERTY`: photos and proof of ownership.
- `PERSONAL_INJURY`: incident report and medical documentation.

Calculate percentage as `(present required evidence * 100) / required evidence count`.

Implement `ClaimPriorityPolicy` with a score:

- Add 4 for personal injury.
- Add 4 for loss at least `100000`.
- Add 2 for loss at least `25000` and below `100000`.
- Add 2 when SLA is within 24 hours.
- Add 1 when incident is within 7 days.
- Add 2 when completeness is below 50.

Map score `0-2` to LOW, `3-5` to MEDIUM, `6-8` to HIGH, and `9+` to CRITICAL. Return human-readable factor strings for every added score component.

Implement transition map:

```java
NEW -> UNDER_REVIEW, WAITING_FOR_INFORMATION
UNDER_REVIEW -> WAITING_FOR_INFORMATION, READY_FOR_DECISION
WAITING_FOR_INFORMATION -> UNDER_REVIEW
READY_FOR_DECISION -> RESOLVED
RESOLVED -> CLOSED
CLOSED -> no transitions
```

- [ ] **Step 4: Run policy tests**

Run:

```bash
cd backend
mvn -Dtest='ClaimCompletenessPolicyTest,ClaimPriorityPolicyTest,ClaimStatusTransitionPolicyTest' test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/claim/domain backend/src/test/java/com/claimsflow/claim/domain
git commit -m "feat: add claim evaluation policies"
```

---

### Task 4: Deliver claim creation, detail retrieval, request IDs, and Problem Details

**Files:**
- Create: `backend/src/main/java/com/claimsflow/shared/web/RequestIdFilter.java`
- Create: `backend/src/main/java/com/claimsflow/shared/error/ResourceNotFoundException.java`
- Create: `backend/src/main/java/com/claimsflow/shared/error/DomainConflictException.java`
- Create: `backend/src/main/java/com/claimsflow/shared/error/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/CreateClaimRequest.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/ClaimDetailResponse.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/ClaimMapper.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/ClaimController.java`
- Create: `backend/src/main/java/com/claimsflow/claim/application/ClaimNumberGenerator.java`
- Create: `backend/src/main/java/com/claimsflow/claim/application/ClaimService.java`
- Test: `backend/src/test/java/com/claimsflow/claim/api/ClaimControllerTest.java`

**Interfaces:**
- Consumes: claim repository and policies from Tasks 2 and 3.
- Produces: `POST /api/claims`, `GET /api/claims/{claimId}`, `ClaimService.create(CreateClaimRequest)`, and `ClaimService.get(UUID)`.

- [ ] **Step 1: Write failing web tests**

Use `@WebMvcTest(ClaimController.class)`, `MockMvc`, and `@MockitoBean ClaimService`. Cover:

- Valid POST returns `201 Created`, a `Location` header, UUID, claim number, calculated completeness, and calculated priority.
- Missing claimant name returns `400` with content type `application/problem+json`, error code `VALIDATION_FAILED`, a `fieldErrors.claimantName` entry, and `requestId`.
- Unknown UUID returns `404` with error code `CLAIM_NOT_FOUND`.
- An inbound `X-Request-Id` is echoed in the response.

- [ ] **Step 2: Run the controller test and verify failure**

Run:

```bash
cd backend
mvn -Dtest=ClaimControllerTest test
```

Expected: FAIL because API and error components do not exist.

- [ ] **Step 3: Implement claim create/detail use cases**

Define `CreateClaimRequest` as a record with Bean Validation:

```java
public record CreateClaimRequest(
    @NotBlank @Size(max = 120) String claimantName,
    @NotBlank @Email @Size(max = 180) String claimantEmail,
    @NotNull ClaimType claimType,
    @NotNull @PastOrPresent LocalDate incidentDate,
    @NotNull @DecimalMin("0.00") BigDecimal estimatedLoss,
    @NotBlank @Size(min = 20, max = 2000) String description,
    boolean incidentReportPresent,
    boolean photosPresent,
    boolean proofOfOwnershipPresent,
    boolean medicalDocumentationPresent
) {}
```

`ClaimService.create` must generate `CLM-YYYY-NNNNNN`, set status `NEW`, set SLA to 72 hours from the injected `Clock`, evaluate completeness and priority, persist the claim, append `CLAIM_CREATED`, and return `ClaimDetailResponse` in one transaction.

`RequestIdFilter` must use inbound `X-Request-Id` when nonblank, otherwise generate a UUID, store it as a request attribute, and return it as a response header.

`GlobalExceptionHandler` must return `ProblemDetail` with properties `code`, `requestId`, and `fieldErrors` where applicable. Use stable codes `VALIDATION_FAILED`, `CLAIM_NOT_FOUND`, `DOMAIN_CONFLICT`, and `INTERNAL_ERROR`.

- [ ] **Step 4: Run controller and application tests**

Run:

```bash
cd backend
mvn -Dtest=ClaimControllerTest test
mvn test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/shared backend/src/main/java/com/claimsflow/claim backend/src/test/java/com/claimsflow/claim
git commit -m "feat: add claim creation API"
```

---

### Task 5: Add the queue, assignment, and controlled status workflow

**Files:**
- Create: `backend/src/main/java/com/claimsflow/claim/api/ClaimSummaryResponse.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/ClaimPageResponse.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/AssignClaimRequest.java`
- Create: `backend/src/main/java/com/claimsflow/claim/api/UpdateClaimStatusRequest.java`
- Create: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimSpecifications.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimController.java`
- Test: `backend/src/test/java/com/claimsflow/claim/api/ClaimWorkflowControllerTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/persistence/ClaimRepositoryIntegrationTest.java`

**Interfaces:**
- Consumes: `ClaimStatusTransitionPolicy`, `AdjusterJpaRepository`, and claim persistence.
- Produces: `GET /api/claims`, `PATCH /api/claims/{id}/assignment`, and `PATCH /api/claims/{id}/status`.

- [ ] **Step 1: Write failing workflow tests**

Cover list filtering by free text, status, priority, and assignment; page metadata; successful assignment; inactive adjuster rejection; successful status transition; invalid transition returning `409 DOMAIN_CONFLICT`; and audit append calls.

Repository integration test must seed claims and verify `ClaimSpecifications` combines case-insensitive claim number/claimant search with status, priority, and assignment predicates.

- [ ] **Step 2: Run workflow tests and verify failure**

Run:

```bash
cd backend
mvn -Dtest='ClaimWorkflowControllerTest,ClaimRepositoryIntegrationTest' test
```

Expected: FAIL because list and mutation APIs do not exist.

- [ ] **Step 3: Implement queue and workflow APIs**

`GET /api/claims` query parameters:

```text
q, status, priority, assignment, page=0, size=20, sort=createdAt,desc
```

Allow sort fields only `createdAt`, `slaDeadline`, `priority`, `status`, and `claimNumber`; reject any other field with `400 INVALID_SORT`.

`AssignClaimRequest` contains `@NotNull UUID adjusterId`. Verify adjuster exists and is active, update assignment, and append `CLAIM_ASSIGNED` with old and new names.

`UpdateClaimStatusRequest` contains `@NotNull ClaimStatus status` and `@NotBlank @Size(max=120) String actor`. Validate transition before mutation, update status, recalculate priority because SLA proximity may have changed, and append `STATUS_CHANGED`.

- [ ] **Step 4: Run workflow verification**

Run:

```bash
cd backend
mvn -Dtest='ClaimWorkflowControllerTest,ClaimRepositoryIntegrationTest' test
mvn test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/claim backend/src/test/java/com/claimsflow/claim
git commit -m "feat: add claims queue and workflow"
```

---

### Task 6: Add recommendations, human review, and audit history

**Files:**
- Create: `backend/src/main/java/com/claimsflow/recommendation/application/ClaimAnalysisRequest.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/application/ClaimInsight.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/application/ClaimInsightProvider.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/application/RuleBasedClaimInsightProvider.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/application/RecommendationService.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/api/RecommendationResponse.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/api/ReviewRecommendationRequest.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/api/RecommendationController.java`
- Create: `backend/src/main/java/com/claimsflow/audit/application/AuditService.java`
- Create: `backend/src/main/java/com/claimsflow/audit/api/AuditEventResponse.java`
- Create: `backend/src/main/java/com/claimsflow/audit/api/AuditController.java`
- Test: `backend/src/test/java/com/claimsflow/recommendation/application/RuleBasedClaimInsightProviderTest.java`
- Test: `backend/src/test/java/com/claimsflow/recommendation/api/RecommendationControllerTest.java`

**Interfaces:**
- Consumes: complete claim detail, recommendation repository, audit repository, and `Clock`.
- Produces: `ClaimInsightProvider.analyze(ClaimAnalysisRequest)`, recommendation generation/review endpoints, and audit history endpoint.

- [ ] **Step 1: Write failing recommendation tests**

Test exact provider outcomes:

- Missing evidence returns action `REQUEST_INFORMATION`, confidence `0.95`, and missing evidence.
- Unassigned complete claim returns `ASSIGN_ADJUSTER`, confidence `0.90`.
- New complete assigned claim returns `BEGIN_REVIEW`, confidence `0.85`.
- Under-review complete claim returns `PREPARE_DECISION`, confidence `0.80`.

Controller tests cover generation, approving pending recommendation, rejecting pending recommendation, and duplicate review returning `409 RECOMMENDATION_ALREADY_REVIEWED`.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
cd backend
mvn -Dtest='RuleBasedClaimInsightProviderTest,RecommendationControllerTest' test
```

Expected: FAIL because recommendation services do not exist.

- [ ] **Step 3: Implement provider and review workflow**

Define:

```java
public interface ClaimInsightProvider {
    ClaimInsight analyze(ClaimAnalysisRequest request);
}

public record ClaimInsight(
    String recommendedAction,
    String explanation,
    BigDecimal confidence,
    List<String> missingInformation
) {}
```

`POST /api/claims/{claimId}/recommendations` persists a pending recommendation and appends `RECOMMENDATION_GENERATED`.

`PATCH /api/claims/{claimId}/recommendations/{recommendationId}` accepts:

```java
public record ReviewRecommendationRequest(
    @NotNull RecommendationReviewState decision,
    @NotBlank @Size(max = 120) String reviewer
) {
    public ReviewRecommendationRequest {
        if (decision == RecommendationReviewState.PENDING) {
            throw new IllegalArgumentException("Review decision must be APPROVED or REJECTED");
        }
    }
}
```

Only pending recommendations may be reviewed. Persist reviewer and timestamp and append `RECOMMENDATION_APPROVED` or `RECOMMENDATION_REJECTED`.

`GET /api/claims/{claimId}/audit` returns newest-first immutable audit DTOs.

- [ ] **Step 4: Run recommendation and audit verification**

Run:

```bash
cd backend
mvn -Dtest='RuleBasedClaimInsightProviderTest,RecommendationControllerTest' test
mvn test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/recommendation backend/src/main/java/com/claimsflow/audit backend/src/test/java/com/claimsflow/recommendation
git commit -m "feat: add claim recommendations and audit"
```

---

### Task 7: Add adjuster and dashboard query APIs

**Files:**
- Create: `backend/src/main/java/com/claimsflow/adjuster/application/AdjusterService.java`
- Create: `backend/src/main/java/com/claimsflow/adjuster/api/AdjusterResponse.java`
- Create: `backend/src/main/java/com/claimsflow/adjuster/api/AdjusterController.java`
- Create: `backend/src/main/java/com/claimsflow/dashboard/api/DashboardResponse.java`
- Create: `backend/src/main/java/com/claimsflow/dashboard/api/WorkloadResponse.java`
- Create: `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- Create: `backend/src/main/java/com/claimsflow/dashboard/api/DashboardController.java`
- Test: `backend/src/test/java/com/claimsflow/dashboard/api/DashboardControllerTest.java`

**Interfaces:**
- Consumes: claim, adjuster, and audit repositories.
- Produces: `GET /api/adjusters` and `GET /api/dashboard`.

- [ ] **Step 1: Write failing dashboard tests**

Mock repository projections and assert response fields:

```text
openClaims, highPriorityClaims, slaRiskClaims, unassignedClaims,
incompleteClaims, workloadByAdjuster, recentActivity
```

Test that only active adjusters are returned and each adjuster includes computed active workload and capacity.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
cd backend
mvn -Dtest=DashboardControllerTest test
```

Expected: FAIL because dashboard APIs do not exist.

- [ ] **Step 3: Implement aggregate query services**

Define open claims as every status except `RESOLVED` and `CLOSED`; high-priority as `HIGH` or `CRITICAL`; SLA risk as open claims due within 24 hours; incomplete as completeness below 100; unassigned as null adjuster.

Return the ten newest audit events and workload sorted descending by active claim count, then adjuster display name.

- [ ] **Step 4: Run backend verification**

Run:

```bash
cd backend
mvn -Dtest=DashboardControllerTest test
mvn verify
```

Expected: PASS, with Testcontainers tests passing when Docker is available or skipped when unavailable.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/adjuster backend/src/main/java/com/claimsflow/dashboard backend/src/test/java/com/claimsflow/dashboard
git commit -m "feat: add operations dashboard API"
```

---

### Task 8: Build Angular API foundations and application shell

**Files:**
- Modify: `frontend/src/app/app.component.ts`
- Modify: `frontend/src/app/app.config.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Create: `frontend/src/app/core/api/api-config.ts`
- Create: `frontend/src/app/core/api/api-error.ts`
- Create: `frontend/src/app/core/api/error.interceptor.ts`
- Create: `frontend/src/app/core/layout/app-shell.component.ts`
- Create: `frontend/src/app/shared/models/claim.models.ts`
- Create: `frontend/src/app/shared/models/dashboard.models.ts`
- Create: `frontend/src/app/shared/models/adjuster.models.ts`
- Test: `frontend/src/app/core/api/error.interceptor.spec.ts`
- Test: `frontend/src/app/core/layout/app-shell.component.spec.ts`

**Interfaces:**
- Consumes: backend Problem Details and REST DTO contracts.
- Produces: `API_BASE_URL`, `ApiError`, `errorInterceptor`, typed frontend models, and lazy routes.

- [ ] **Step 1: Write failing interceptor and shell tests**

Use `provideHttpClient(withInterceptors([errorInterceptor]))` and `provideHttpClientTesting()` to verify a backend Problem Details payload becomes `ApiError` with `status`, `code`, `detail`, `requestId`, and `fieldErrors`.

Test the shell renders navigation links for Dashboard, Claims, and New Claim and includes a skip-to-content link.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/core/**/*.spec.ts'
```

Expected: FAIL because API and shell components do not exist.

- [ ] **Step 3: Implement typed API foundation**

Define:

```typescript
export interface ProblemDetails {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
```

The functional interceptor must catch `HttpErrorResponse`, parse the body as `ProblemDetails`, and throw `ApiError`; non-Problem responses use code `HTTP_ERROR` and a stable fallback message.

Configure `appConfig` with `provideRouter(routes)` and `provideHttpClient(withInterceptors([errorInterceptor]))`.

Lazy routes must load dashboard, queue, create, and detail standalone components. The app root renders only `AppShellComponent`.

- [ ] **Step 4: Run frontend foundation verification**

Run:

```bash
cd frontend
npm run test:ci
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app frontend/src/styles.css
git commit -m "feat: add Angular application foundation"
```

---

### Task 9: Implement Angular dashboard and claims queue

**Files:**
- Create: `frontend/src/app/dashboard/dashboard.service.ts`
- Create: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Create: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`
- Create: `frontend/src/app/claims/data-access/claims-api.service.ts`
- Create: `frontend/src/app/claims/data-access/claim-filter-codec.ts`
- Create: `frontend/src/app/claims/data-access/claim-filter-codec.spec.ts`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`

**Interfaces:**
- Consumes: `GET /api/dashboard` and `GET /api/claims`.
- Produces: dashboard cards/workload/activity, URL-backed claim filters, and responsive claims table.

- [ ] **Step 1: Write failing dashboard, filter, and queue tests**

Test filter round-trip:

```typescript
const filters = { q: 'CLM-2026', status: 'UNDER_REVIEW', priority: 'HIGH', assignment: 'unassigned', page: 2, size: 20, sort: 'slaDeadline,asc' };
expect(parseClaimFilters(serializeClaimFilters(filters))).toEqual(filters);
```

Dashboard tests cover loading, success metrics, empty workload, and API error state. Queue tests cover initial query parameter parsing, filter changes updating the router, reset behavior, table row rendering, pagination, empty state, and API error state.

- [ ] **Step 2: Run feature tests and verify failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/**/*.spec.ts' --include='src/app/claims/**/*queue*.spec.ts' --include='src/app/claims/**/*codec*.spec.ts'
```

Expected: FAIL because features do not exist.

- [ ] **Step 3: Implement dashboard and queue**

`DashboardService` returns `Observable<DashboardResponse>`. The page converts the stream into explicit loading, success, and error signals and never recomputes backend metrics.

`ClaimsApiService.list(filters)` uses `HttpParams` and returns `Observable<ClaimPage>`.

`ClaimFilterCodec` omits empty/default values, clamps page to zero or greater and size to 10-100, and defaults sort to `createdAt,desc`.

The queue page uses a semantic `<table>`, accessible form labels, status and priority badges, SLA warning text rather than color alone, and router links to `/claims/:id`.

- [ ] **Step 4: Run dashboard and queue verification**

Run:

```bash
cd frontend
npm run test:ci
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/dashboard frontend/src/app/claims
git commit -m "feat: add dashboard and claims queue"
```

---

### Task 10: Implement Angular claim creation and claim workspace

**Files:**
- Create: `frontend/src/app/claims/feature-create/claim-form.ts`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`
- Modify: `frontend/src/app/claims/data-access/claims-api.service.ts`

**Interfaces:**
- Consumes: claim create/detail, adjuster list, assignment, status, recommendation, review, and audit APIs.
- Produces: accessible reactive claim form and complete interview workflow in `/claims/:id`.

- [ ] **Step 1: Write failing form and workspace tests**

Form tests must verify:

- Required claimant fields.
- Email format.
- Incident date cannot be future.
- Estimated loss cannot be negative.
- Description length 20-2000.
- AUTO requires incident report and photos.
- PROPERTY requires photos and proof of ownership.
- PERSONAL_INJURY requires incident report and medical documentation.
- Invalid submission shows a linked error summary.
- Successful creation disables duplicate submission and navigates to the returned claim ID.

Workspace tests must verify detail rendering, adjuster assignment, valid status options only, recommendation generation, approval/rejection, local refresh after mutation, audit timeline, and local action errors.

- [ ] **Step 2: Run feature tests and verify failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-create/**/*.spec.ts' --include='src/app/claims/feature-detail/**/*.spec.ts'
```

Expected: FAIL because create/detail features do not exist.

- [ ] **Step 3: Implement create and detail features**

Build the form with `NonNullableFormBuilder`. Implement a group validator that returns `{ missingEvidence: string[] }` based on claim type. On invalid submit, mark all controls touched, populate an error summary signal, and focus the summary heading.

Extend `ClaimsApiService` with exact methods:

```typescript
create(request: CreateClaimRequest): Observable<ClaimDetail>
get(id: string): Observable<ClaimDetail>
assign(id: string, adjusterId: string): Observable<ClaimDetail>
updateStatus(id: string, status: ClaimStatus, actor: string): Observable<ClaimDetail>
generateRecommendation(id: string): Observable<Recommendation>
reviewRecommendation(id: string, recommendationId: string, decision: 'APPROVED' | 'REJECTED', reviewer: string): Observable<Recommendation>
getAudit(id: string): Observable<AuditEvent[]>
getAdjusters(): Observable<Adjuster[]>
```

The detail page loads claim, adjusters, and audit with `forkJoin`; mutations use `exhaustMap` or disabled buttons to prevent duplicate requests; successful mutations refresh only affected state; errors remain adjacent to the failed action.

- [ ] **Step 4: Run full frontend verification**

Run:

```bash
cd frontend
npm run test:ci
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/claims
git commit -m "feat: add claim intake and workspace"
```

---

### Task 11: Complete documentation, CI, cleanup, and full verification

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Create: `.github/workflows/ci.yml`
- Create: `docs/product-brief.md`
- Create: `docs/architecture.md`
- Create: `docs/api-overview.md`
- Create: `docs/demo-script.md`
- Create: `docs/decisions/001-modular-monolith.md`
- Create: `docs/decisions/002-rule-based-recommendations.md`
- Create: `docs/decisions/003-postgresql-and-flyway.md`
- Verify deletion: `Main.java`

**Interfaces:**
- Consumes: all completed backend and frontend features.
- Produces: reviewable repository, CI evidence, setup guide, engineering guide, architecture record, and interview demo script.

- [ ] **Step 1: Add CI before final documentation claims**

Create `.github/workflows/ci.yml` with `contents: read`, triggers for pushes to `main` and `feature/**` and pull requests, and two jobs:

```yaml
backend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        distribution: temurin
        java-version: '21'
        cache: maven
    - run: mvn verify
      working-directory: backend

frontend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: npm
        cache-dependency-path: frontend/package-lock.json
    - run: npm ci
      working-directory: frontend
    - run: npm run test:ci
      working-directory: frontend
    - run: npm run build
      working-directory: frontend
```

- [ ] **Step 2: Write final README, AGENTS, and supporting documents**

`README.md` must include product problem, screenshots section with instructions for adding captures after local run, features, architecture diagram, technology table, repository structure, prerequisites, exact Docker/database/backend/frontend commands, environment variables, testing, Swagger URL, demo workflow, tradeoffs, limitations, and roadmap. Do not claim deployment or passing CI until observed.

`AGENTS.md` must state:

- Backend boundaries and constructor injection rule.
- No JPA entities in REST responses.
- Flyway-only schema changes and append-only migration rule.
- Angular standalone components, OnPush change detection, typed data services, and accessible states.
- Required backend and frontend verification commands.
- No credentials, dependency folders, generated build output, prompt logs, or tool transcripts.
- Focused comments and conventional engineering commits.

Write the product brief, architecture, API overview, demo script, and three decision records with final implemented names and commands. The demo script must fit eight minutes and include problem, architecture, dashboard, claim creation, assignment/status, recommendation review, audit, code/test highlight, and one explicit tradeoff.

- [ ] **Step 3: Run full local verification**

Run:

```bash
docker compose up -d db
cd backend && mvn verify
cd ../frontend && npm ci && npm run test:ci && npm run build
```

Expected:

- PostgreSQL health check becomes healthy.
- Backend unit, web, and PostgreSQL integration tests pass.
- Frontend tests pass in ChromeHeadless.
- Angular production build succeeds.

Start applications:

```bash
cd backend && mvn spring-boot:run
cd frontend && npm start
```

Manually verify:

```text
Dashboard loads seeded metrics
Claims queue filters persist in URL
New incomplete claim is created
Claim detail shows missing evidence and priority
Adjuster assignment succeeds
Valid status transition succeeds
Recommendation is generated
Recommendation is approved
Audit timeline contains every action
Swagger UI opens at /swagger-ui.html
Actuator health returns UP
```

- [ ] **Step 4: Open a pull request and use CI as the final source of truth**

Create a pull request from `feature/claimsflow-mvp` to `main` titled `Build ClaimsFlow insurance operations portal`. The body must summarize architecture, completed workflow, tests, local commands, known exclusions, and manual demo steps.

Wait for both `backend` and `frontend` jobs. If a job fails, inspect the failing step and logs, fix the underlying issue in a focused commit, and rerun verification. Do not merge with failing checks.

- [ ] **Step 5: Commit final documentation and verification fixes**

```bash
git add README.md AGENTS.md .github docs docker-compose.yml
git commit -m "docs: finalize ClaimsFlow delivery guide"
```

After CI passes, merge with squash title:

```text
Build ClaimsFlow insurance operations portal
```

---

## Plan Self-Review Results

### Spec coverage

- Build and repository structure: Tasks 1 and 11.
- PostgreSQL, Flyway, entities, constraints, indexes, and seed data: Task 2.
- Completeness, priority, and transition policies: Task 3.
- Claim creation, detail, validation, request IDs, and Problem Details: Task 4.
- Queue, filtering, pagination, assignment, and status workflow: Task 5.
- Recommendation provider, human review, and audit: Task 6.
- Adjusters and dashboard metrics: Task 7.
- Angular architecture, typed HTTP, and application shell: Task 8.
- Dashboard and claims queue interface: Task 9.
- Claim intake and claim workspace: Task 10.
- CI, README, AGENTS, architecture records, demo script, and full verification: Task 11.
- Authentication, uploads, external AI, messaging infrastructure, Kubernetes, and multi-tenancy remain excluded.

### Placeholder scan

The plan contains no `TBD`, `TODO`, unspecified implementation step, or reference to undefined neighboring interfaces.

### Type consistency

- Backend claim types, priorities, statuses, and recommendation review states use the same uppercase constants throughout.
- Frontend models and service methods mirror the REST contracts defined in backend tasks.
- Recommendation generation and review remain separate operations.
- Audit events remain append-only and query-only through the API.
- Flyway remains schema authority and Hibernate remains validation-only.
