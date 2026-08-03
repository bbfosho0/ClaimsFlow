# Deployment-Truthful Employer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fixture-driven employer-demo surfaces with backend-derived operational data, truthful interactions, hybrid reactive refresh, and restrained state-driven motion so ClaimsFlow is credible to deploy and present to employers.

**Architecture:** Extend the persisted claim model with the minimum reporting fields, seed a deterministic fictional historical dataset when demo mode is enabled, and expose cohesive Dashboard, Analytics, Team Operations, and Evidence Operations snapshots from Spring. Add a bounded Angular `OperationalDataStore` that owns caching, invalidation, 45-second visibility-aware polling, stale-state retention, and changed-record metadata, then rebuild each employer-facing surface against those snapshots.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA Specifications, PostgreSQL, Flyway, JUnit 5, Angular 20 standalone components, TypeScript 5.8, Angular signals, RxJS 7.8, Jasmine/Karma, CSS/SVG motion, GitHub Actions.

## Global Constraints

- Work on `design/role-aware-claims-journey`; do not merge the pull request without explicit user approval.
- Every KPI visible in deployed navigation must be traceable to a backend response.
- Every visible control must perform a real action, navigate to a real surface, be disabled with a specific explanation, or be removed.
- Poll every **45 seconds** only while `document.visibilityState === 'visible'`.
- Preserve the last successful snapshot during transient background failures.
- Use immediate invalidation after claim creation, evidence updates, assignment changes, status changes, claimant-visible messages, and demo reset.
- Supported filters are date range, claim type, priority, status, assigned team or adjuster, and region.
- Do not add WebSockets, server-sent events, production authentication/RBAC, object storage, OCR, email/SMS, payments, carrier integrations, or production workflow activation.
- Use deterministic fictional seed data; tests inject a fixed `Clock` and do not depend on random wall-clock timing.
- Motion communicates live state, change, risk, progress, or feedback. Standard transitions remain 160–280 ms and hover movement remains 1–3 px.
- Respect `prefers-reduced-motion`; reduced mode updates values immediately and disables interpolation, breathing, scanning, orbiting, chart drawing, and animated scrolling.
- Preserve the independent claimant portal and human authority over consequential claim decisions.
- Reports and Settings remain in source for future work but are absent from deployed role navigation.
- Workflow Automation remains local, deterministic, explanatory, and nonconsequential.

---

## File Structure

### Backend

- `backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql`
- `backend/src/main/java/com/claimsflow/claim/domain/ClaimRegion.java`
- `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java`
- `backend/src/main/java/com/claimsflow/demo/application/OperationalSeedScenario.java`
- `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetService.java`
- `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetRunner.java`
- `backend/src/main/java/com/claimsflow/operations/application/OperationalFilters.java`
- `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java`
- `backend/src/main/java/com/claimsflow/operations/api/OperationalResponses.java`
- `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java`
- `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsController.java`
- `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsResponses.java`
- `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java`
- `backend/src/main/java/com/claimsflow/team/api/TeamOperationsController.java`
- `backend/src/main/java/com/claimsflow/team/api/TeamOperationsResponses.java`
- `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java`
- `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsController.java`
- `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsResponses.java`

### Frontend

- `frontend/src/app/core/operational-data/operational-data.models.ts`
- `frontend/src/app/core/operational-data/operational-api.service.ts`
- `frontend/src/app/core/operational-data/operational-data.store.ts`
- `frontend/src/app/shared/operational/reduced-motion.service.ts`
- `frontend/src/app/shared/operational/animated-number.component.ts`
- `frontend/src/app/shared/operational/changed-value.directive.ts`
- `frontend/src/app/shared/operational/operational-refresh-status.component.ts`
- `frontend/src/app/shared/operational/operational-filter-bar.component.ts`
- Existing Dashboard, Queue, My Work, Analytics, Team Operations, Documents, AI Insights, Workflow Automation, role-navigation, and tour files listed in the tasks below.

---

### Task 1: Persist the minimum operational reporting model

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimRegion.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- Modify: `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: existing claim-domain tests that construct `Claim` directly
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimOperationalFieldsTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/persistence/OperationalFieldsMigrationTest.java`

**Interfaces:**

```java
public enum ClaimRegion {
    NORTHEAST, SOUTHEAST, MIDWEST, SOUTHWEST, WEST
}
```

```java
public static Claim createSeeded(
    UUID id,
    String claimNumber,
    String claimantName,
    String claimantEmail,
    ClaimType claimType,
    ClaimRegion region,
    LocalDate incidentDate,
    BigDecimal estimatedLoss,
    String description,
    boolean incidentReportPresent,
    boolean photosPresent,
    boolean proofOfOwnershipPresent,
    boolean medicalDocumentationPresent,
    int completenessPercentage,
    ClaimPriority priority,
    ClaimStatus status,
    Adjuster assignedAdjuster,
    Instant slaDeadline,
    Instant createdAt,
    Instant updatedAt,
    Instant resolvedAt,
    String demoDatasetKey)
```

- [ ] **Step 1: Write failing domain tests**

```java
@Test
void resolvedStatusRecordsResolutionTimeAndReopenClearsIt() {
    Instant created = Instant.parse("2026-07-01T12:00:00Z");
    Claim claim = Claim.create(
        "CLM-2026-TEST", "Taylor Reed", "taylor@example.com",
        ClaimType.PROPERTY, ClaimRegion.SOUTHEAST,
        LocalDate.parse("2026-06-28"), new BigDecimal("24000.00"),
        "Water damage with documented structural impact.",
        true, false, false, false, 25, ClaimPriority.HIGH,
        created.plus(Duration.ofHours(24)), created);

    claim.changeStatus(ClaimStatus.RESOLVED, created.plus(Duration.ofHours(12)));
    assertThat(claim.getResolvedAt()).isEqualTo(created.plus(Duration.ofHours(12)));

    claim.changeStatus(ClaimStatus.UNDER_REVIEW, created.plus(Duration.ofHours(13)));
    assertThat(claim.getResolvedAt()).isNull();
}

@Test
void seededClaimUsesProvidedIdentityAndDatasetKey() {
    UUID id = UUID.fromString("d7fbd89a-d6fd-3dd7-8f25-36d53cf20f51");
    Instant created = Instant.parse("2026-07-01T12:00:00Z");
    Claim claim = Claim.createSeeded(
        id, "CLM-DEMO-001", "Morgan Diaz", "morgan.diaz@example.com",
        ClaimType.AUTO, ClaimRegion.WEST, LocalDate.parse("2026-06-30"),
        new BigDecimal("7800.00"), "Rear-end collision with documented bumper damage.",
        true, true, false, false, 100, ClaimPriority.MEDIUM,
        ClaimStatus.RESOLVED, null, created.plus(Duration.ofHours(72)),
        created, created.plus(Duration.ofHours(28)), created.plus(Duration.ofHours(28)),
        "EMPLOYER_MVP");

    assertThat(claim.getId()).isEqualTo(id);
    assertThat(claim.getDemoDatasetKey()).isEqualTo("EMPLOYER_MVP");
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=ClaimOperationalFieldsTest test
```

Expected: compilation failure because the new region, fields, getters, and seeded factory do not exist.

- [ ] **Step 3: Add the migration**

```sql
ALTER TABLE adjusters ADD COLUMN team VARCHAR(80) NOT NULL DEFAULT 'Claims Operations';
UPDATE adjusters SET team = 'SIU Investigations' WHERE email = 'jordan.lee@example.com';

ALTER TABLE claims ADD COLUMN region VARCHAR(40) NOT NULL DEFAULT 'SOUTHEAST';
ALTER TABLE claims ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE claims ADD COLUMN demo_dataset_key VARCHAR(64);

UPDATE claims
SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED') AND resolved_at IS NULL;

CREATE INDEX idx_claims_created_at ON claims (created_at);
CREATE INDEX idx_claims_region ON claims (region);
CREATE INDEX idx_claims_demo_dataset_key ON claims (demo_dataset_key);
CREATE INDEX idx_adjusters_team ON adjusters (team);
```

- [ ] **Step 4: Implement the entity fields and state rules**

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 40)
private ClaimRegion region;

private Instant resolvedAt;

@Column(length = 64)
private String demoDatasetKey;

public void changeStatus(ClaimStatus next, Instant now) {
    this.status = next;
    this.resolvedAt = switch (next) {
        case RESOLVED, CLOSED -> now;
        default -> null;
    };
    this.updatedAt = now;
}
```

Normal intake continues without a new user-visible region field; `ClaimApplicationService.create()` passes `ClaimRegion.SOUTHEAST`. `Adjuster` receives a non-null `team` field and getter.

- [ ] **Step 5: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=ClaimOperationalFieldsTest,OperationalFieldsMigrationTest test
mvn -q verify
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql \
  backend/src/main/java/com/claimsflow/claim \
  backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java \
  backend/src/test/java/com/claimsflow/claim
git commit -m "feat(backend): add operational reporting fields"
```

---

### Task 2: Seed a deterministic 48-claim historical dataset

**Files:**
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalSeedScenario.java`
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetService.java`
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetRunner.java`
- Modify: `backend/src/main/java/com/claimsflow/demo/application/DemoJourneyService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/audit/persistence/AuditEventJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java`
- Test: `backend/src/test/java/com/claimsflow/demo/application/OperationalDemoDatasetServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/demo/application/DemoJourneyServiceTransactionTest.java`

**Interfaces:**

```java
public record OperationalSeedScenario(
    String key,
    int createdDaysAgo,
    int incidentDaysBeforeCreation,
    ClaimType claimType,
    ClaimRegion region,
    BigDecimal estimatedLoss,
    ClaimStatus status,
    ClaimPriority priority,
    int completeness,
    String adjusterEmail,
    int slaHours,
    Integer resolvedHoursAfterCreation) {

    public UUID stableId() {
        return UUID.nameUUIDFromBytes(("claimsflow:" + key).getBytes(StandardCharsets.UTF_8));
    }
}
```

- [ ] **Step 1: Write failing idempotency and isolation tests**

```java
@Test
void ensureSeededCreatesExactlyFortyEightRepeatableClaims() {
    service.ensureSeeded();
    service.ensureSeeded();

    List<Claim> claims = repository.findAllByDemoDatasetKey("EMPLOYER_MVP");
    assertThat(claims).hasSize(48);
    assertThat(claims).extracting(Claim::getRegion)
        .contains(ClaimRegion.NORTHEAST, ClaimRegion.SOUTHEAST,
            ClaimRegion.MIDWEST, ClaimRegion.SOUTHWEST, ClaimRegion.WEST);
    assertThat(claims).extracting(Claim::getStatus)
        .contains(ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW,
            ClaimStatus.WAITING_FOR_INFORMATION, ClaimStatus.READY_FOR_DECISION,
            ClaimStatus.RESOLVED, ClaimStatus.CLOSED);
}

@Test
void reservedJourneyResetPreservesHistoricalClaims() {
    dataset.ensureSeeded();
    journey.reset();
    journey.reset();

    assertThat(repository.findAllByDemoDatasetKey("EMPLOYER_MVP")).hasSize(48);
    assertThat(repository.findAllByClaimantEmail(DemoJourneyService.CLAIMANT_EMAIL)).hasSize(1);
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
```

- [ ] **Step 3: Define exactly 48 explicit scenarios**

The immutable list covers every claim type, region, status, priority, completeness band, assigned/unassigned state, and SLA state. Stable IDs use `UUID.nameUUIDFromBytes`. The anchor is the injected clock rounded to UTC noon:

```java
Instant anchor = LocalDate.now(clock)
    .atStartOfDay(ZoneOffset.UTC)
    .toInstant()
    .plus(Duration.ofHours(12));
```

- [ ] **Step 4: Implement idempotent cleanup and seeding**

```java
@Transactional
public void resetHistoricalDataset() {
    messages.deleteByClaimDemoDatasetKey(DATASET_KEY);
    auditEvents.deleteByClaimDemoDatasetKey(DATASET_KEY);
    claims.deleteByDemoDatasetKey(DATASET_KEY);
    claims.flush();
    seed(anchor());
}

@Transactional
public void ensureSeeded() {
    if (claims.countByDemoDatasetKey(DATASET_KEY) != SCENARIOS.size()) {
        resetHistoricalDataset();
    }
}
```

Repository methods are explicit JPQL bulk deletes scoped by `claim.demoDatasetKey`; no email or global table delete is used.

- [ ] **Step 5: Seed only when demo mode is enabled**

```java
@Component
@ConditionalOnProperty(prefix = "claimsflow.demo", name = "enabled", havingValue = "true")
public final class OperationalDemoDatasetRunner implements ApplicationRunner {
    private final OperationalDemoDatasetService service;

    public OperationalDemoDatasetRunner(OperationalDemoDatasetService service) {
        this.service = service;
    }

    @Override
    public void run(ApplicationArguments args) {
        service.ensureSeeded();
    }
}
```

`DemoJourneyService.reset()` calls `dataset.ensureSeeded()` and continues deleting only `taylor.reed@example.com`.

- [ ] **Step 6: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
mvn -q verify
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/demo \
  backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java \
  backend/src/main/java/com/claimsflow/audit/persistence/AuditEventJpaRepository.java \
  backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java \
  backend/src/test/java/com/claimsflow/demo
git commit -m "feat(backend): seed deterministic operational history"
```

---

### Task 3: Establish one operational filter and query contract

**Files:**
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalFilters.java`
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java`
- Create: `backend/src/main/java/com/claimsflow/operations/api/OperationalResponses.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimSpecifications.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimController.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimResponses.java`
- Test: `backend/src/test/java/com/claimsflow/operations/application/OperationalFiltersTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/persistence/ClaimSpecificationsIntegrationTest.java`

**Interfaces:**

```java
public record OperationalFilters(
    LocalDate from,
    LocalDate to,
    ClaimType claimType,
    ClaimPriority priority,
    ClaimStatus status,
    UUID adjusterId,
    String team,
    ClaimRegion region,
    boolean unassigned) {}
```

```java
public record OperationalFilterOptions(
    List<String> claimTypes,
    List<String> priorities,
    List<String> statuses,
    List<String> regions,
    List<String> teams,
    List<AdjusterOption> adjusters) {}
```

- [ ] **Step 1: Write failing validation and combination tests**

```java
@Test
void rejectsInvertedAndOverlongDateWindows() {
    assertThatThrownBy(() -> filters.create(
        LocalDate.parse("2026-08-01"), LocalDate.parse("2026-07-01"),
        null, null, null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);

    assertThatThrownBy(() -> filters.create(
        LocalDate.parse("2025-01-01"), LocalDate.parse("2026-08-01"),
        null, null, null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);
}

@Test
void combinesDateRegionTeamPriorityAndStatus() {
    List<Claim> result = query.find(filters.create(
        LocalDate.parse("2026-07-03"), LocalDate.parse("2026-08-01"),
        ClaimType.PROPERTY, ClaimPriority.HIGH, ClaimStatus.UNDER_REVIEW,
        null, "Claims Operations", ClaimRegion.SOUTHEAST, false));

    assertThat(result).allMatch(claim ->
        claim.getClaimType() == ClaimType.PROPERTY &&
        claim.getPriority() == ClaimPriority.HIGH &&
        claim.getStatus() == ClaimStatus.UNDER_REVIEW &&
        claim.getRegion() == ClaimRegion.SOUTHEAST &&
        claim.getAssignedAdjuster().getTeam().equals("Claims Operations"));
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=OperationalFiltersTest,ClaimSpecificationsIntegrationTest test
```

- [ ] **Step 3: Implement date defaults and validation using the injected `Clock`**

```java
LocalDate effectiveTo = to == null ? LocalDate.now(clock) : to;
LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(29) : from;
if (effectiveFrom.isAfter(effectiveTo)) {
    throw new IllegalArgumentException("from must not be after to");
}
if (ChronoUnit.DAYS.between(effectiveFrom, effectiveTo) > 366) {
    throw new IllegalArgumentException("date range must not exceed 366 days");
}
```

- [ ] **Step 4: Implement a canonical JPA Specification**

```java
public static Specification<Claim> operational(OperationalFilters filters) {
    return Specification.where(createdBetween(filters.from(), filters.to()))
        .and(hasClaimType(filters.claimType()))
        .and(hasPriority(filters.priority()))
        .and(hasStatus(filters.status()))
        .and(hasAdjuster(filters.adjusterId(), filters.unassigned()))
        .and(hasTeam(filters.team()))
        .and(hasRegion(filters.region()));
}
```

`ClaimJpaRepository` adds an `@EntityGraph(attributePaths = "assignedAdjuster")` overload for `findAll(Specification<Claim>, Sort)`.

- [ ] **Step 5: Expand the queue endpoint without breaking old links**

```java
@GetMapping
public ClaimResponses.ClaimPage list(
    @RequestParam(required = false) String q,
    @RequestParam(required = false) LocalDate from,
    @RequestParam(required = false) LocalDate to,
    @RequestParam(required = false) ClaimType claimType,
    @RequestParam(required = false) ClaimStatus status,
    @RequestParam(required = false) ClaimPriority priority,
    @RequestParam(required = false) String assignment,
    @RequestParam(required = false) UUID adjusterId,
    @RequestParam(required = false) String team,
    @RequestParam(required = false) ClaimRegion region,
    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ClaimResponses.page(service.list(
        q, from, to, claimType, status, priority, assignment,
        adjusterId, team, region, pageable));
}
```

`assignment=unassigned` and legacy UUID assignment links remain valid. Claim queue/detail responses add `region` and assigned `team`.

- [ ] **Step 6: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=OperationalFiltersTest,ClaimSpecificationsIntegrationTest test
mvn -q verify
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/operations \
  backend/src/main/java/com/claimsflow/claim \
  backend/src/test/java/com/claimsflow/operations \
  backend/src/test/java/com/claimsflow/claim
git commit -m "feat(backend): unify operational filtering"
```

---

### Task 4: Make the Dashboard snapshot internally coherent and fully derived

**Files:**
- Modify: `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- Modify: `backend/src/main/java/com/claimsflow/dashboard/api/DashboardController.java`
- Test: `backend/src/test/java/com/claimsflow/dashboard/application/DashboardServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/dashboard/api/DashboardControllerTest.java`

**Interfaces:**

```java
public record DashboardSnapshot(
    Instant generatedAt,
    long totalClaims,
    long openClaims,
    long highPriorityClaims,
    long slaRiskClaims,
    long overdueClaims,
    long unassignedClaims,
    long incompleteClaims,
    int evidenceReadinessPercentage,
    int activePortfolioPercentage,
    List<SignalCount> signalCounts,
    List<Workload> workload,
    List<Activity> recentActivity) {}

public record SignalCount(String category, String tone, long count) {}
```

- [ ] **Step 1: Write failing snapshot tests**

```java
@Test
void snapshotReconcilesMetersAndSignalCounts() {
    DashboardSnapshot snapshot = service.snapshot();

    assertThat(snapshot.activePortfolioPercentage())
        .isEqualTo(snapshot.totalClaims() == 0
            ? 0
            : Math.round(snapshot.openClaims() * 100f / snapshot.totalClaims()));
    assertThat(snapshot.evidenceReadinessPercentage()).isBetween(0, 100);
    assertThat(snapshot.signalCounts()).extracting(SignalCount::category)
        .containsExactly("SLA", "EVIDENCE", "OWNERSHIP", "PRIORITY", "ADVISORY");
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
```

- [ ] **Step 3: Calculate the complete response from one loaded claim set**

```java
@Transactional(readOnly = true)
public DashboardSnapshot snapshot() {
    Instant now = clock.instant();
    List<Claim> all = operational.findAllForDashboard();
    List<Claim> open = all.stream().filter(this::isOpen).toList();

    long high = open.stream().filter(this::isHighPriority).count();
    long atRisk = open.stream().filter(claim -> isWithin24Hours(claim, now)).count();
    long overdue = open.stream().filter(claim -> claim.getSlaDeadline().isBefore(now)).count();
    long unassigned = open.stream().filter(claim -> claim.getAssignedAdjuster() == null).count();
    long incomplete = open.stream().filter(claim -> claim.getCompletenessPercentage() < 100).count();
    int readiness = averageCompleteness(all);
    int activePercent = percent(open.size(), all.size());

    return buildSnapshot(now, all, open, high, atRisk, overdue,
        unassigned, incomplete, readiness, activePercent);
}
```

- [ ] **Step 4: Define exact signal categories**

```java
List<SignalCount> signals = List.of(
    new SignalCount("SLA", "critical", atRisk + overdue),
    new SignalCount("EVIDENCE", "warning", incomplete),
    new SignalCount("OWNERSHIP", "live", unassigned),
    new SignalCount("PRIORITY", "advisory", high),
    new SignalCount("ADVISORY", "healthy", Math.max(0, open.size() - high - atRisk - overdue))
);
```

- [ ] **Step 5: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
mvn -q verify
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/claimsflow/dashboard backend/src/test/java/com/claimsflow/dashboard
git commit -m "feat(backend): derive complete dashboard snapshot"
```

---

### Task 5: Add the Analytics aggregate API

**Files:**
- Create: `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java`
- Create: `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsController.java`
- Create: `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsResponses.java`
- Test: `backend/src/test/java/com/claimsflow/analytics/application/AnalyticsServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/analytics/api/AnalyticsControllerTest.java`

**Interfaces:**

```java
public record AnalyticsSnapshot(
    Instant generatedAt,
    OperationalFilterOptions options,
    AnalyticsKpis kpis,
    AnalyticsComparison comparison,
    List<TimePoint> claimVolume,
    List<TimePoint> resolvedVolume,
    List<DistributionPoint> statusDistribution,
    List<DistributionPoint> priorityDistribution,
    List<DistributionPoint> regionDistribution,
    List<DistributionPoint> agingBands,
    List<CohortRow> cohorts) {}
```

Truthful labels are `Estimated exposure`, `Resolved claims`, `Evidence readiness`, and `SLA compliance`. Do not expose payouts, approval rate, fraud savings, or confirmed fraud rate.

- [ ] **Step 1: Write failing reconciliation and comparison tests**

```java
@Test
void currentAndPreviousPeriodsUseEqualInclusiveLengths() {
    AnalyticsSnapshot result = service.snapshot(filters(
        LocalDate.parse("2026-07-03"), LocalDate.parse("2026-08-01")));

    assertThat(result.comparison().previousFrom()).isEqualTo(LocalDate.parse("2026-06-03"));
    assertThat(result.comparison().previousTo()).isEqualTo(LocalDate.parse("2026-07-02"));
    assertThat(result.claimVolume()).hasSize(30);
}

@Test
void distributionsReconcileToFilteredTotal() {
    AnalyticsSnapshot result = service.snapshot(filters);
    assertThat(result.statusDistribution().stream().mapToLong(DistributionPoint::count).sum())
        .isEqualTo(result.kpis().totalClaims());
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=AnalyticsServiceTest,AnalyticsControllerTest test
```

- [ ] **Step 3: Implement exact KPI formulas**

```java
long total = claims.size();
long open = claims.stream().filter(this::isOpen).count();
long resolved = claims.stream().filter(claim -> claim.getResolvedAt() != null).count();
BigDecimal exposure = claims.stream()
    .map(Claim::getEstimatedLoss)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
int readiness = averagePercent(claims, Claim::getCompletenessPercentage);
int slaCompliance = percent(
    claims.stream()
        .filter(claim -> claim.getResolvedAt() != null)
        .filter(claim -> !claim.getResolvedAt().isAfter(claim.getSlaDeadline()))
        .count(),
    resolved);
```

Average resolution is the mean `Duration.between(createdAt, resolvedAt)` across resolved claims. Aging bands are `0–2`, `3–7`, `8–14`, `15–30`, and `31+ days` for open claims.

- [ ] **Step 4: Zero-fill dates and derive cohort percentages**

Every date in the inclusive range appears in both time series. Cohorts group by creation week and report resolved within 7, 14, and 30 days. Empty denominators return zero, not fabricated values.

- [ ] **Step 5: Expose canonical filter parameters**

```java
@GetMapping
public AnalyticsSnapshot get(
    @RequestParam(required = false) LocalDate from,
    @RequestParam(required = false) LocalDate to,
    @RequestParam(required = false) ClaimType claimType,
    @RequestParam(required = false) ClaimPriority priority,
    @RequestParam(required = false) ClaimStatus status,
    @RequestParam(required = false) UUID adjusterId,
    @RequestParam(required = false) String team,
    @RequestParam(required = false) ClaimRegion region) {
    OperationalFilters selected = filters.create(
        from, to, claimType, priority, status, adjusterId, team, region, false);
    return service.snapshot(selected);
}
```

- [ ] **Step 6: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=AnalyticsServiceTest,AnalyticsControllerTest test
mvn -q verify
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/analytics backend/src/test/java/com/claimsflow/analytics
git commit -m "feat(backend): add operational analytics snapshots"
```

---

### Task 6: Add the Team Operations aggregate API

**Files:**
- Create: `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java`
- Create: `backend/src/main/java/com/claimsflow/team/api/TeamOperationsController.java`
- Create: `backend/src/main/java/com/claimsflow/team/api/TeamOperationsResponses.java`
- Test: `backend/src/test/java/com/claimsflow/team/application/TeamOperationsServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/team/api/TeamOperationsControllerTest.java`

**Interfaces:**

```java
public record TeamOperationsSnapshot(
    Instant generatedAt,
    OperationalFilterOptions options,
    TeamKpis kpis,
    List<TeamWorkload> teams,
    List<AdjusterWorkload> adjusters,
    List<Escalation> escalations,
    List<Advisory> advisories,
    IntegrityScore integrity) {}
```

- [ ] **Step 1: Write failing capacity, SLA, and integrity tests**

```java
@Test
void capacityUsesPersistedAdjusterCapacity() {
    TeamOperationsSnapshot result = service.snapshot(filters);
    TeamWorkload operations = result.teams().stream()
        .filter(team -> team.name().equals("Claims Operations"))
        .findFirst().orElseThrow();

    assertThat(operations.capacity()).isEqualTo(expectedClaimsOperationsCapacity());
    assertThat(operations.activeClaims()).isEqualTo(expectedClaimsOperationsOpenClaims());
}

@Test
void integrityScoreUsesDocumentedWeights() {
    IntegrityScore score = service.snapshot(filters).integrity();
    int expected = Math.round(
        score.slaCompliance() * 0.40f +
        score.evidenceReadiness() * 0.30f +
        score.assignmentCoverage() * 0.30f);
    assertThat(score.overall()).isEqualTo(expected);
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=TeamOperationsServiceTest,TeamOperationsControllerTest test
```

- [ ] **Step 3: Implement exact definitions**

- Active: status is not `RESOLVED` or `CLOSED`.
- At risk: open deadline is between `now` and `now + 24h`.
- Overdue: open deadline is before `now`.
- Utilization: active assigned claims divided by summed active-adjuster capacity, capped at 100.
- Assignment coverage: assigned open claims divided by all open claims.
- Escalations: overdue first, then at-risk, then critical priority; sort by deadline and claim number.

```java
int overall = Math.round(
    slaCompliance * 0.40f +
    evidenceReadiness * 0.30f +
    assignmentCoverage * 0.30f);
```

- [ ] **Step 4: Return navigational advisories only**

```java
new Advisory(
    "SLA pressure",
    overdue + " overdue claims need review.",
    "/app/claims",
    Map.of("sort", "slaDeadline,asc"),
    "critical");
```

Additional advisories cover unassigned claims and evidence gaps. There is no apply, rebalance, staffing, assignment, or mutation endpoint.

- [ ] **Step 5: Expose `GET /api/team-operations` with the canonical filter contract**

The response includes live team and adjuster options so the frontend does not hard-code filter values.

- [ ] **Step 6: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=TeamOperationsServiceTest,TeamOperationsControllerTest test
mvn -q verify
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/team backend/src/test/java/com/claimsflow/team
git commit -m "feat(backend): add team operations snapshots"
```

---

### Task 7: Add the truthful Evidence Operations API

**Files:**
- Create: `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java`
- Create: `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsController.java`
- Create: `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsResponses.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java`
- Test: `backend/src/test/java/com/claimsflow/evidence/application/EvidenceOperationsServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/evidence/api/EvidenceOperationsControllerTest.java`

**Interfaces:**

```java
public record EvidenceOperationsSnapshot(
    Instant generatedAt,
    OperationalFilterOptions options,
    List<EvidenceClaimSummary> claims,
    EvidenceClaimDetail selected) {}

public record EvidenceClaimDetail(
    UUID id,
    String claimNumber,
    String claimantName,
    String claimantEmail,
    ClaimType claimType,
    ClaimStatus status,
    ClaimPriority priority,
    ClaimRegion region,
    int completenessPercentage,
    Instant slaDeadline,
    String adjusterName,
    String team,
    List<EvidenceCategory> evidence,
    List<ClaimantMessage> claimantMessages) {}
```

- [ ] **Step 1: Write failing truthfulness tests**

```java
@Test
void selectedClaimContainsOnlyPersistedEvidenceAndClaimantMessages() {
    EvidenceClaimDetail detail = service.snapshot(filters, claimId).selected();

    assertThat(detail.evidence()).extracting(EvidenceCategory::kind)
        .containsExactlyInAnyOrder(
            "INCIDENT_REPORT", "PHOTOS",
            "PROOF_OF_OWNERSHIP", "MEDICAL_DOCUMENTATION");
    assertThat(detail.claimantMessages())
        .allMatch(message -> message.audience().equals("CLAIMANT"));
}

@Test
void responseDoesNotClaimUnsupportedFileFeatures() throws Exception {
    String json = objectMapper.writeValueAsString(service.snapshot(filters, claimId));
    assertThat(json).doesNotContain(
        "ocr", "confidence", "storage", "version", "fileSize", "sms", "upload");
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=EvidenceOperationsServiceTest,EvidenceOperationsControllerTest test
```

- [ ] **Step 3: Implement summary and selected-detail behavior**

- Sort summaries by overdue, at-risk, priority, SLA deadline, and claim number.
- Select the requested claim when it remains in the filtered result.
- Otherwise select the first result.
- Return `selected = null` when the result set is empty.
- Derive the four evidence rows directly from persisted booleans.
- Read only `MessageAudience.CLAIMANT` messages in ascending creation order.

- [ ] **Step 4: Expose the read-only endpoint**

```java
@GetMapping
public EvidenceOperationsSnapshot get(
    @RequestParam(required = false) UUID selectedClaimId,
    @RequestParam(required = false) LocalDate from,
    @RequestParam(required = false) LocalDate to,
    @RequestParam(required = false) ClaimType claimType,
    @RequestParam(required = false) ClaimPriority priority,
    @RequestParam(required = false) ClaimStatus status,
    @RequestParam(required = false) UUID adjusterId,
    @RequestParam(required = false) String team,
    @RequestParam(required = false) ClaimRegion region) {
    OperationalFilters selected = filters.create(
        from, to, claimType, priority, status, adjusterId, team, region, false);
    return service.snapshot(selected, selectedClaimId);
}
```

No POST, upload, OCR, extraction, version, comment, storage, email, or SMS endpoint is added.

- [ ] **Step 5: Run focused and full verification**

```bash
cd backend
mvn -q -Dtest=EvidenceOperationsServiceTest,EvidenceOperationsControllerTest test
mvn -q verify
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/claimsflow/evidence \
  backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java \
  backend/src/test/java/com/claimsflow/evidence
git commit -m "feat(backend): add truthful evidence operations API"
```

---

### Task 8: Add the Angular operational API and reactive store

**Files:**
- Create: `frontend/src/app/core/operational-data/operational-data.models.ts`
- Create: `frontend/src/app/core/operational-data/operational-api.service.ts`
- Create: `frontend/src/app/core/operational-data/operational-data.store.ts`
- Create: `frontend/src/app/core/operational-data/operational-data.store.spec.ts`
- Modify: `frontend/src/app/shared/models/dashboard.models.ts`
- Modify: `frontend/src/app/shared/models/claim.models.ts`

**Interfaces:**

```ts
export type OperationalFamily = 'dashboard' | 'queue' | 'analytics' | 'team' | 'evidence';

export interface OperationalResource<T> {
  readonly value: T | null;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly stale: boolean;
  readonly error: string;
  readonly updatedAt: Date | null;
  readonly changedClaimIds: readonly string[];
}

export interface OperationalFilters {
  readonly from: string;
  readonly to: string;
  readonly claimType: ClaimType | '';
  readonly priority: ClaimPriority | '';
  readonly status: ClaimStatus | '';
  readonly adjusterId: string;
  readonly team: string;
  readonly region: ClaimRegion | '';
}
```

- [ ] **Step 1: Write failing polling, visibility, cache, stale, and invalidation tests**

```ts
it('polls every 45 seconds only while visible', fakeAsync(() => {
  visibility.set('visible');
  store.activateDashboard();
  http.expectOne('/api/dashboard').flush(snapshotA);

  tick(44_999);
  http.expectNone('/api/dashboard');
  tick(1);
  http.expectOne('/api/dashboard').flush(snapshotB);

  visibility.set('hidden');
  tick(90_000);
  http.expectNone('/api/dashboard');
}));

it('retains the last valid snapshot after background failure', fakeAsync(() => {
  store.activateDashboard();
  http.expectOne('/api/dashboard').flush(snapshotA);
  store.refresh('dashboard');
  http.expectOne('/api/dashboard')
    .flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });

  expect(store.dashboard().value).toEqual(snapshotA);
  expect(store.dashboard().stale).toBeTrue();
}));
```

- [ ] **Step 2: Run the failing store tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-data.store.spec.ts'
```

- [ ] **Step 3: Implement typed HTTP reads**

```ts
loadDashboard(): Observable<DashboardSnapshot>;
loadQueue(filters: ClaimFilters): Observable<ClaimPage>;
loadAnalytics(filters: OperationalFilters): Observable<AnalyticsSnapshot>;
loadTeam(filters: OperationalFilters): Observable<TeamOperationsSnapshot>;
loadEvidence(filters: OperationalFilters, selectedClaimId: string): Observable<EvidenceOperationsSnapshot>;
```

One pure `operationalFiltersToParams()` function builds the common query parameters.

- [ ] **Step 4: Implement activation, caching, refresh, and invalidation**

```ts
activateDashboard(): () => void;
activateQueue(filters: ClaimFilters): () => void;
activateAnalytics(filters: OperationalFilters): () => void;
activateTeam(filters: OperationalFilters): () => void;
activateEvidence(filters: OperationalFilters, selectedClaimId: string): () => void;
refresh(family: OperationalFamily): void;
invalidate(families: readonly OperationalFamily[], changedClaimIds?: readonly string[]): void;
```

Each activation returns a cleanup function. Poll active slots only. Revisit uses cached data immediately and refreshes in the background when the cached snapshot is older than 15 seconds.

- [ ] **Step 5: Implement visible-tab polling**

```ts
private onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    this.refreshActiveFamilies();
    this.startPolling(45_000);
  } else {
    this.stopPolling();
  }
}
```

Successful refresh clears stale/error state. Background failure leaves value and update time intact.

- [ ] **Step 6: Run focused and full frontend verification**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-data.store.spec.ts'
npm run test:ci
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/core/operational-data frontend/src/app/shared/models
git commit -m "feat(frontend): add reactive operational data store"
```

---

### Task 9: Connect queue, My Work, and mutation invalidation

**Files:**
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.ts`
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.spec.ts`
- Modify: `frontend/src/app/claims/data-access/claims-api.service.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/my-work-page.component.ts`
- Modify: `frontend/src/app/portal/data-access/portal-api.service.ts`
- Modify: `frontend/src/app/core/demo-journey/demo-journey.service.ts`
- Modify: affected service specs

**Interfaces:**

- Create/reset invalidates all five families.
- Assignment/status/evidence invalidates Dashboard, Queue, Analytics, Team, and Evidence.
- Claimant-visible message invalidates Evidence and refreshes current claim detail/audit.

- [ ] **Step 1: Write failing filter round-trip tests**

```ts
it('round-trips every curated queue filter', () => {
  const filters: ClaimFilters = {
    ...DEFAULT_FILTERS,
    from: '2026-07-03',
    to: '2026-08-01',
    claimType: 'PROPERTY',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    assignment: 'unassigned',
    adjusterId: '',
    team: 'Claims Operations',
    region: 'SOUTHEAST',
  };

  expect(parseClaimFilters(serializeClaimFilters(filters))).toEqual(filters);
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/**/*.spec.ts'
```

- [ ] **Step 3: Extend URL parsing and HTTP parameters**

Unknown enum values normalize to `''`; they are not cast through blindly. Preserve legacy `assignment=unassigned` and UUID assignment values.

- [ ] **Step 4: Move Queue and My Work reads to the store**

```ts
private reconnectQueue(filters: ClaimFilters): void {
  this.releaseQueue?.();
  this.releaseQueue = this.operational.activateQueue(filters);
}
```

My Work uses the same queue family with `adjusterId = sessionStorage['claimsflow.demoAdjusterId']` and does not maintain a second fixture dataset.

- [ ] **Step 5: Invalidate after successful mutations only**

```ts
return this.http.patch<ClaimDetail>(url, body).pipe(
  tap(claim => this.operational.invalidate(
    ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
    [claim.id],
  )),
);
```

Apply this pattern to create, assign, status, evidence, claimant-visible message, and demo reset calls. Failed requests do not invalidate.

- [ ] **Step 6: Add changed-row and empty-filter behavior**

Rows whose IDs appear in `changedClaimIds` receive a 1.2-second semantic highlight. Empty results list active filters and offer one `Reset filters` action that navigates to `/app/claims` without query parameters.

- [ ] **Step 7: Run frontend tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/claims frontend/src/app/workspaces/my-work-page.component.ts \
  frontend/src/app/portal/data-access frontend/src/app/core/demo-journey
git commit -m "feat(frontend): connect queue and mutation refresh"
```

---

### Task 10: Add shared state-driven motion and refresh primitives

**Files:**
- Create: `frontend/src/app/shared/operational/reduced-motion.service.ts`
- Create: `frontend/src/app/shared/operational/reduced-motion.service.spec.ts`
- Create: `frontend/src/app/shared/operational/animated-number.component.ts`
- Create: `frontend/src/app/shared/operational/animated-number.component.spec.ts`
- Create: `frontend/src/app/shared/operational/changed-value.directive.ts`
- Create: `frontend/src/app/shared/operational/changed-value.directive.spec.ts`
- Create: `frontend/src/app/shared/operational/operational-refresh-status.component.ts`
- Create: `frontend/src/app/shared/operational/operational-refresh-status.component.spec.ts`
- Create: `frontend/src/app/shared/operational/operational-filter-bar.component.ts`
- Create: `frontend/src/app/shared/operational/operational-filter-bar.component.spec.ts`
- Modify: `frontend/src/styles.css`

**Interfaces:**

```html
<app-animated-number [value]="metric" format="integer" />
<app-operational-refresh-status
  [resource]="state()"
  (refreshRequested)="refresh()" />
<div [appChangedValue]="metric" [changeTone]="tone"></div>
```

- [ ] **Step 1: Write failing animation and reduced-motion tests**

```ts
it('interpolates only after a value changes', fakeAsync(() => {
  fixture.componentRef.setInput('value', 10);
  fixture.detectChanges();
  fixture.componentRef.setInput('value', 20);
  fixture.detectChanges();

  tick(110);
  expect(Number(text())).toBeGreaterThan(10);
  expect(Number(text())).toBeLessThan(20);
  tick(110);
  expect(text()).toBe('20');
}));

it('updates immediately under reduced motion', () => {
  reducedMotion.set(true);
  fixture.componentRef.setInput('value', 20);
  fixture.detectChanges();
  expect(text()).toBe('20');
});
```

- [ ] **Step 2: Run the failing focused tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/operational/**/*.spec.ts'
```

- [ ] **Step 3: Implement bounded number interpolation**

```ts
const durationMs = 220;
const progress = Math.min(1, elapsed / durationMs);
const eased = 1 - Math.pow(1 - progress, 3);
this.displayValue.set(start + (target - start) * eased);
```

Cancel old animation frames before starting new ones. Do not animate initial values. Support integer, decimal, percentage, currency, and duration formatting with `Intl.NumberFormat`.

- [ ] **Step 4: Implement update age, stale state, and filter behavior**

Refresh status renders `Updated just now`, `Updated 32 seconds ago`, `Refresh`, `Updating…`, and `Showing the last successful update.` The filter bar emits complete `OperationalFilters`, uses backend options, and writes URL query parameters.

- [ ] **Step 5: Add global motion tokens**

```css
:root {
  --cf-duration-state: 220ms;
  --cf-duration-highlight: 1200ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --cf-duration-state: 0ms;
    --cf-duration-highlight: 0ms;
  }

  html { scroll-behavior: auto; }
}
```

- [ ] **Step 6: Run focused and full frontend verification**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/operational/**/*.spec.ts'
npm run test:ci
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/shared/operational frontend/src/styles.css
git commit -m "feat(frontend): add state-driven motion primitives"
```

---

### Task 11: Rebuild the Manager Dashboard against the reactive snapshot

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.html`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.css`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`
- Modify: `frontend/src/app/shared/visualizations/command-field.component.ts`
- Modify: `frontend/src/app/shared/visualizations/command-field.component.html`
- Modify: `frontend/src/app/shared/visualizations/command-field.component.css`
- Modify: `frontend/src/app/shared/visualizations/command-field.component.spec.ts`

**Interfaces:**
- Dashboard reads only `OperationalDataStore.dashboard()` for operational metrics.
- Command field accepts `signalCounts`, not only `activeCount`.

- [ ] **Step 1: Write failing meter and signal tests**

```ts
it('renders backend percentages instead of fixed meters', () => {
  store.dashboard.set(resource({
    ...snapshot,
    activePortfolioPercentage: 63,
    evidenceReadinessPercentage: 78,
  }));
  fixture.detectChanges();

  expect(meter('ACTIVE PORTFOLIO')).toBe('63%');
  expect(meter('EVIDENCE READY')).toBe('78%');
});

it('passes exact signal categories to the command field', () => {
  expect(commandField.signalCounts()).toEqual(snapshot.signalCounts);
});
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/shared/visualizations/*.spec.ts'
```

- [ ] **Step 3: Replace direct Dashboard service loading with store activation**

```ts
readonly state = this.operational.dashboard;
private readonly releaseDashboard = this.operational.activateDashboard();

ngOnDestroy(): void {
  this.releaseDashboard();
}

refresh(): void {
  this.operational.refresh('dashboard');
}
```

- [ ] **Step 4: Bind every KPI, meter, workload, event, and intervention to response data**

Remove the literal `82%`. Use `app-animated-number` for changed values. Use shared refresh/stale/loading/error components. Initial skeleton geometry matches the final command layout and KPI band; background refresh leaves existing content visible.

- [ ] **Step 5: Make intervention links canonical**

- SLA links to `sort=slaDeadline,asc`.
- Evidence links to `sort=completenessPercentage,asc`.
- Ownership links to `assignment=unassigned`.
- Priority links to `priority=HIGH`.

- [ ] **Step 6: Allocate command nodes by category**

```ts
readonly renderedSignals = computed(() =>
  allocateSignals(this.signalCounts(), 17));
```

`allocateSignals` proportionally assigns at most 17 nodes and gives every nonzero category at least one. Nodes change tone and opacity when counts change. Ambient orbit, scan, and halo motion remain restrained and freeze under reduced motion.

- [ ] **Step 7: Add concise accessible change announcements**

Announce meaningful changes only, such as `Dashboard updated: 2 additional SLA-risk claims.` Do not announce unchanged polling cycles.

- [ ] **Step 8: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/dashboard frontend/src/app/shared/visualizations
git commit -m "feat(frontend): make dashboard reactive and truthful"
```

---

### Task 12: Rebuild Analytics and Team Operations from backend snapshots

**Files:**
- Modify: `frontend/src/app/workspaces/analytics-page.component.ts`
- Create: `frontend/src/app/workspaces/analytics-page.component.html`
- Create: `frontend/src/app/workspaces/analytics-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/team-operations-page.component.ts`
- Create: `frontend/src/app/workspaces/team-operations-page.component.html`
- Create: `frontend/src/app/workspaces/team-operations-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-base.css`
- Modify: `frontend/src/app/workspaces/workspace-team.css`
- Modify: `frontend/src/app/workspaces/workspace-responsive.css`

**Interfaces:**
- Both pages use the shared operational filter bar and refresh status.
- Every chart has a visible/keyboard value path and an adjacent nonvisual summary.

- [ ] **Step 1: Write failing filter and accessibility tests**

```ts
it('requests Analytics again when region changes', () => {
  filterBar.filtersChange.emit({ ...DEFAULT_OPERATIONAL_FILTERS, region: 'WEST' });
  expect(store.activateAnalytics)
    .toHaveBeenCalledWith(jasmine.objectContaining({ region: 'WEST' }));
});

it('renders one accessible summary per chart', () => {
  expect(queryAll('[data-chart-summary]').length)
    .toBe(queryAll('[data-operational-chart]').length);
});

it('team advisories navigate and never expose apply actions', () => {
  expect(advisoryLink('SLA pressure').getAttribute('href')).toContain('/app/claims');
  expect(query('button[data-action="apply"]')).toBeNull();
});
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/analytics-page.component.spec.ts' --include='src/app/workspaces/team-operations-page.component.spec.ts'
```

- [ ] **Step 3: Replace Analytics fixture data and unsupported controls**

Render only Estimated exposure, Total claims, Open claims, Resolved claims, Average resolution time, Evidence readiness, and SLA compliance. Remove payout, fraud, approval-rate, line-of-business, channel, and export controls.

Charts:
- claim and resolved volume: SVG polylines
- status, priority, and region: proportional bars
- aging: ordered bars
- cohorts: percentage heatmap

Each chart includes exact text values, focusable data points, and a visually hidden table marked `data-chart-summary`.

- [ ] **Step 4: Replace Team Operations fixture arrays**

Render backend KPIs, team workloads, adjuster workloads, escalations, advisories, and integrity inputs. Remove fake shift planner, fake performance sparklines, fake priority heatmap, static names, and nonfunctional recommendation buttons.

- [ ] **Step 5: Calculate real SLA countdowns from response deadlines**

```ts
readonly now = signal(Date.now());
private clockId = window.setInterval(() => {
  if (document.visibilityState === 'visible') {
    this.now.set(Date.now());
  }
}, 1_000);
```

Countdowns stop at `Overdue`; they never become negative. The clock is cleared on destroy.

- [ ] **Step 6: Apply state-driven motion and complete data states**

Bars, rings, paths, and changed numbers transition for 220 ms only when values change. SLA-risk dots may breathe. Whole cards remain still. Both pages implement initial skeleton, retry, no-results/reset, background stale, and reduced-motion states.

- [ ] **Step 7: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/workspaces/analytics-page.component.* \
  frontend/src/app/workspaces/team-operations-page.component.* \
  frontend/src/app/workspaces/workspace-base.css \
  frontend/src/app/workspaces/workspace-team.css \
  frontend/src/app/workspaces/workspace-responsive.css
git commit -m "feat(frontend): connect analytics and team operations"
```

---

### Task 13: Replace Documents fixtures and audit the remaining deployed surfaces

**Files:**
- Modify: `frontend/src/app/workspaces/documents-page.component.ts`
- Create: `frontend/src/app/workspaces/documents-page.component.html`
- Create: `frontend/src/app/workspaces/documents-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-documents.css`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.html`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workflows-page.component.ts`
- Modify: `frontend/src/app/workspaces/workflows-page.component.spec.ts`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.ts`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.spec.ts`
- Modify: `frontend/src/app/tour/tour-step-registry.ts`
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- `/app/documents` becomes Evidence Operations.
- AI Insights remains backend-backed and advisory.
- Workflow Automation remains real-claim input plus local simulation, draft, and validation only.
- Reports and Settings disappear from role navigation and tour links.

- [ ] **Step 1: Write failing truthfulness and navigation tests**

```ts
it('does not render unsupported evidence capabilities', () => {
  fixture.detectChanges();
  const text = fixture.nativeElement.textContent;
  [
    'OCR', 'Storage', 'Versions', 'Bulk Actions',
    'Upload Documents', 'Compose New Message', 'SMS'
  ].forEach(label => expect(text).not.toContain(label));
});

it('hides Reports and Settings from every role', () => {
  for (const role of Object.values(DEMO_ROLES)) {
    expect(role.navigation.map(item => item.id)).not.toContain('reports');
    expect(role.navigation.map(item => item.id)).not.toContain('settings');
  }
});

it('keeps workflow activation disabled with exact boundary copy', () => {
  expect(text()).toContain(
    'Production workflow activation is not connected in this portfolio demo.');
  expect(activateButton().disabled).toBeTrue();
});
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/documents-page.component.spec.ts' --include='src/app/intelligence/*.spec.ts' --include='src/app/core/demo-role/*.spec.ts'
```

- [ ] **Step 3: Rebuild Documents as Evidence Operations**

Layout:
- shared filter bar
- claim/evidence result list
- selected claim context
- four evidence-category presence cards
- claimant-visible message timeline
- `Open authoritative Claim Workspace` link

Selection is represented by `selectedClaimId` in URL query parameters. Changing filters or selection reconnects the Evidence store slot.

- [ ] **Step 4: Remove unsupported fixture content**

Remove fake folder counts, storage totals, police-report preview, OCR tags, confidence, versions, collaborative comments, bulk actions, upload controls, email/SMS stream, AI summary, and corresponding arrays. Delete `WorkspaceDataService` only after repository search confirms no remaining consumer.

- [ ] **Step 5: Verify AI Insights control integrity**

Every visible action must call existing recommendation generation/review APIs or navigate to a real claim. Confidence, source evidence, review state, and human review reason remain visible. Remove any decorative action discovered by the component test.

- [ ] **Step 6: Preserve Workflow Automation boundaries**

Real claim loading, local Save Draft, local Validate, and simulation remain functional. Activation stays disabled with exact explanatory copy. No approve, deny, pay, close, assign, or production activation action is added.

- [ ] **Step 7: Remove placeholder navigation**

Manager navigation ends with Team Operations, Adjuster navigation ends with Documents, and Administrator navigation contains only Workflow Automation. Direct placeholder routes may remain in source but no navigation, profile menu, tour step, or employer script links to them.

- [ ] **Step 8: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/workspaces/documents-page.component.* \
  frontend/src/app/workspaces/workspace-documents.css \
  frontend/src/app/intelligence \
  frontend/src/app/workspaces/workflows-page.component.* \
  frontend/src/app/core/demo-role \
  frontend/src/app/tour/tour-step-registry.ts \
  frontend/src/app/app.routes.ts
git commit -m "feat(frontend): finish truthful deployed surfaces"
```

---

### Task 14: Add exact-head functional visual QA, documentation, and PR evidence

**Files:**
- Create: `frontend/scripts/capture-operational-visual-qa.mjs`
- Create: `frontend/src/app/core/operational-data/control-integrity.spec.ts`
- Modify: `.github/workflows/visual-qa.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Modify: pull request #8 description

**Interfaces:**
- Visual artifact captures initial, changed, filtered, stale, mobile, and reduced-motion states against the actual Spring API and deterministic PostgreSQL data.

- [ ] **Step 1: Add deployed-route control-integrity tests**

```ts
const forbiddenLabels = [
  'Upload Documents',
  'Bulk Actions',
  'Export Report',
  'Configure workspace',
  'Apply recommendation'
];

for (const route of deployedRoutes) {
  it(`${route} exposes no unsupported control labels`, async () => {
    await navigate(route);
    const visibleText = fixture.nativeElement.textContent;
    forbiddenLabels.forEach(label => expect(visibleText).not.toContain(label));
  });
}
```

Intentionally disabled Workflow activation is tested by its exact boundary copy and disabled state, not added to the forbidden list.

- [ ] **Step 2: Implement the browser capture flow**

The script performs these exact actions:

1. POST `/api/demo/reset` and retain claim/adjuster IDs.
2. Capture Manager Dashboard baseline.
3. Open Adjuster Claim Workspace and change evidence.
4. Wait for immediate invalidation and capture Manager Dashboard changed state.
5. Capture Analytics default and `region=WEST` states.
6. Capture Team Operations default and `team=Claims Operations` states.
7. Follow a Dashboard intervention to filtered Claim Queue.
8. Select the reserved claim in Evidence Operations.
9. Intercept one background Dashboard request with HTTP 503 and capture stale state while old data remains visible.
10. Capture desktop 1440×1180, mobile 390×844, and reduced-motion variants.

Use:

```js
await page.emulateMedia({ reducedMotion: 'reduce' });
```

- [ ] **Step 3: Update Visual QA workflow**

```yaml
- name: Capture operational employer journey
  run: node scripts/capture-operational-visual-qa.mjs
  working-directory: frontend
  env:
    BASE_URL: http://127.0.0.1:4200
    API_URL: http://127.0.0.1:8080
```

Validate every expected PNG exists and has nonzero size before uploading the artifact.

- [ ] **Step 4: Update README and employer demo script**

Document backend-derived surfaces, deterministic 48-claim history, reserved reset, curated filters, immediate invalidation, visible-tab polling, reduced motion, hidden placeholders, local-only Workflow Automation, and excluded integrations.

The employer script demonstrates one mutation flowing through Dashboard, Queue, Analytics, Team Operations, and Evidence Operations.

- [ ] **Step 5: Run the exact-head verification suite**

```bash
cd backend
mvn -q verify
cd ../frontend
npm run test:ci
npm run build
```

Then run the local or Actions-backed visual flow against PostgreSQL, Spring Boot with `CLAIMSFLOW_DEMO_ENABLED=true`, and Angular.

- [ ] **Step 6: Run the final fixture/control scan**

```bash
rg -n "82%|1,389|4\.73M|621K|Upload Documents|Bulk Actions|Export Report|Configure workspace" frontend/src backend/src
rg -n "Reports|Settings" frontend/src/app/core/demo-role frontend/src/app/tour
```

Expected: no fixture KPI literals or unsupported control labels on deployed surfaces, and no Reports/Settings navigation or tour references.

- [ ] **Step 7: Update PR #8 without merging**

The PR body records:
- schema and deterministic seed architecture
- operational API contracts
- reactive store behavior
- state-driven and reduced motion
- truthful Evidence Operations replacement
- hidden placeholder navigation
- exact-head CI run ID and conclusion
- Visual QA run ID, artifact ID, digest, screenshot count, and head SHA
- explicit production boundaries

- [ ] **Step 8: Commit documentation and verification changes**

```bash
git add frontend/scripts frontend/src/app/core/operational-data/control-integrity.spec.ts \
  .github/workflows/visual-qa.yml .github/workflows/ci.yml \
  README.md docs/demo-script.md
git commit -m "test: verify truthful employer demo experience"
```

- [ ] **Step 9: Final acceptance gate**

Do not report completion until all thirteen design acceptance criteria pass, CI and Visual QA succeed on the exact final head, the screenshot artifact is manually inspected, and the pull request remains unmerged unless the user explicitly requests merging.
