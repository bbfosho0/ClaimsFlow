# Deployment-Truthful Employer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fixture-driven employer-demo surfaces with backend-derived operational data, truthful controls, hybrid reactive refresh, and restrained state-driven motion.

**Architecture:** Persist the minimum reporting fields, seed a deterministic fictional 48-claim history when demo mode is enabled, and calculate coherent Dashboard, Analytics, Team Operations, Queue, and Evidence Operations responses in Spring. A bounded Angular `OperationalDataStore` caches those snapshots, invalidates them after successful mutations, polls every 45 seconds only while visible, retains stale data during transient errors, and drives state-change animation.

**Tech Stack:** Java 21, Spring Boot, Spring Data JPA Specifications, PostgreSQL, Flyway, JUnit 5, Angular 20 standalone components, Angular signals, RxJS 7.8, Jasmine/Karma, CSS/SVG, GitHub Actions.

## Global Constraints

- Work on `design/role-aware-claims-journey`; do not merge without explicit user approval.
- Every KPI on deployed navigation traces to a backend response.
- Every visible control performs a real action, navigates, is specifically disabled, or is removed.
- Poll every **45 seconds** only while `document.visibilityState === 'visible'`.
- Preserve the last valid snapshot during background failures.
- Immediately invalidate affected resources after claim creation, assignment, status, evidence, claimant-visible message, or demo reset.
- Supported filters: date range, claim type, priority, status, team/adjuster, and region.
- No WebSockets/SSE, production auth/RBAC, binary storage, OCR, email/SMS, payments, carrier integrations, autonomous claim decisions, or production workflow activation.
- Inject `Clock`; tests use `Clock.fixed(...)`.
- State transitions remain 160–280 ms; hover movement remains 1–3 px.
- `prefers-reduced-motion` disables interpolation, breathing, scanning, orbiting, chart drawing, and animated scrolling.
- Reports and Settings remain source-only and disappear from deployed navigation and the employer tour.
- Workflow Automation remains real-claim input plus local draft, validation, and simulation only.

---

### Task 1: Add operational domain fields and an injectable clock

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimRegion.java`
- Create: `backend/src/main/java/com/claimsflow/shared/time/ClockConfiguration.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- Modify: `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimOperationalFieldsTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/persistence/OperationalFieldsMigrationTest.java`

**Interfaces:**

```java
public enum ClaimRegion {
    NORTHEAST, SOUTHEAST, MIDWEST, SOUTHWEST, WEST
}
```

```java
@Configuration
public class ClockConfiguration {
    @Bean
    Clock applicationClock() {
        return Clock.systemUTC();
    }
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
void resolvedStatusRecordsResolutionAndReopenClearsIt() {
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
```

- [ ] **Step 2: Run the failing test**

```bash
cd backend
mvn -q -Dtest=ClaimOperationalFieldsTest test
```

- [ ] **Step 3: Add the migration**

```sql
ALTER TABLE adjusters ADD COLUMN team VARCHAR(80) NOT NULL DEFAULT 'Claims Operations';
UPDATE adjusters SET team = 'Claims Intake' WHERE email = 'maya.chen@example.test';
UPDATE adjusters SET team = 'Adjusting Team' WHERE email = 'daniel.brooks@example.test';
UPDATE adjusters SET team = 'Medical Review' WHERE email = 'priya.shah@example.test';
UPDATE adjusters SET team = 'SIU Investigations' WHERE email = 'jordan.lee@example.com';

ALTER TABLE claims ADD COLUMN region VARCHAR(40) NOT NULL DEFAULT 'SOUTHEAST';
ALTER TABLE claims ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE claims ADD COLUMN demo_dataset_key VARCHAR(64);
UPDATE claims SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED') AND resolved_at IS NULL;

CREATE INDEX idx_claims_created_at ON claims(created_at);
CREATE INDEX idx_claims_region ON claims(region);
CREATE INDEX idx_claims_demo_dataset_key ON claims(demo_dataset_key);
CREATE INDEX idx_adjusters_team ON adjusters(team);
```

- [ ] **Step 4: Implement fields and state rules**

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 40)
private ClaimRegion region;

private Instant resolvedAt;

@Column(length = 64)
private String demoDatasetKey;

public void changeStatus(ClaimStatus next, Instant now) {
    status = next;
    resolvedAt = switch (next) {
        case RESOLVED, CLOSED -> now;
        default -> null;
    };
    updatedAt = now;
}
```

Normal intake passes `ClaimRegion.SOUTHEAST`. Replace `Clock.systemUTC()` fields with constructor-injected `Clock`.

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
  backend/src/main/java/com/claimsflow/shared/time \
  backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java \
  backend/src/test/java/com/claimsflow/claim
git commit -m "feat(backend): add operational reporting fields"
```

---

### Task 2: Seed deterministic historical demo data

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

    UUID stableId() {
        return UUID.nameUUIDFromBytes(("claimsflow:" + key)
            .getBytes(StandardCharsets.UTF_8));
    }
}
```

- [ ] **Step 1: Write failing idempotency/isolation tests**

```java
@Test
void ensureSeededCreatesExactlyFortyEightClaimsOnce() {
    service.ensureSeeded();
    service.ensureSeeded();
    assertThat(claims.findAllByDemoDatasetKey("EMPLOYER_MVP")).hasSize(48);
}

@Test
void journeyResetPreservesHistoricalData() {
    dataset.ensureSeeded();
    journey.reset();
    journey.reset();
    assertThat(claims.findAllByDemoDatasetKey("EMPLOYER_MVP")).hasSize(48);
    assertThat(claims.findAllByClaimantEmail(DemoJourneyService.CLAIMANT_EMAIL)).hasSize(1);
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
```

- [ ] **Step 3: Define 48 explicit scenarios**

The list covers all claim types, regions, statuses, priorities, completeness bands, four teams, assigned/unassigned states, overdue, at-risk, healthy SLA, and resolved-within/after-SLA cases. Use an injected-clock anchor:

```java
Instant anchor = LocalDate.now(clock)
    .atStartOfDay(ZoneOffset.UTC)
    .toInstant()
    .plus(Duration.ofHours(12));
```

- [ ] **Step 4: Implement scoped cleanup and idempotent seeding**

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
    if (claims.countByDemoDatasetKey(DATASET_KEY) != 48) {
        resetHistoricalDataset();
    }
}
```

- [ ] **Step 5: Enable startup seeding only in demo mode**

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

`DemoJourneyService.reset()` calls `dataset.ensureSeeded()` and still deletes only the reserved claimant email.

- [ ] **Step 6: Verify and commit**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
mvn -q verify
git add src/main/java/com/claimsflow/demo src/main/java/com/claimsflow/claim/persistence \
  src/main/java/com/claimsflow/audit/persistence src/main/java/com/claimsflow/portal/persistence \
  src/test/java/com/claimsflow/demo
git commit -m "feat(backend): seed deterministic operational history"
```

---

### Task 3: Create the canonical filter/query layer

**Files:**
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalFilters.java`
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalFilterFactory.java`
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java`
- Create: `backend/src/main/java/com/claimsflow/operations/api/OperationalResponses.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimSpecifications.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimController.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimResponses.java`
- Test: `backend/src/test/java/com/claimsflow/operations/application/OperationalFilterFactoryTest.java`
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
public final class OperationalFilterFactory {
    OperationalFilters create(
        LocalDate from,
        LocalDate to,
        ClaimType claimType,
        ClaimPriority priority,
        ClaimStatus status,
        UUID adjusterId,
        String team,
        ClaimRegion region,
        boolean unassigned);
}
```

```java
public final class OperationalQueryService {
    List<Claim> find(OperationalFilters filters);
    List<Claim> findAllForDashboard();
    OperationalFilterOptions options();
}
```

- [ ] **Step 1: Write failing validation and combination tests**

```java
@Test
void rejectsInvalidDateWindows() {
    assertThatThrownBy(() -> factory.create(
        LocalDate.parse("2026-08-01"), LocalDate.parse("2026-07-01"),
        null, null, null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);
}

@Test
void combinesRegionTeamPriorityAndStatus() {
    List<Claim> result = query.find(factory.create(
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
mvn -q -Dtest=OperationalFilterFactoryTest,ClaimSpecificationsIntegrationTest test
```

- [ ] **Step 3: Implement date defaults and validation**

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

- [ ] **Step 4: Implement one JPA Specification**

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

Add an eager `findAll(Specification<Claim>, Sort)` repository overload.

- [ ] **Step 5: Expand the queue contract**

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
    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
    Pageable pageable) {
    return ClaimResponses.page(service.list(
        q, from, to, claimType, status, priority, assignment,
        adjusterId, team, region, pageable));
}
```

Preserve `assignment=unassigned` and legacy UUID assignment. Queue/detail responses add region and team.

- [ ] **Step 6: Verify and commit**

```bash
cd backend
mvn -q -Dtest=OperationalFilterFactoryTest,ClaimSpecificationsIntegrationTest test
mvn -q verify
git add src/main/java/com/claimsflow/operations src/main/java/com/claimsflow/claim \
  src/test/java/com/claimsflow/operations src/test/java/com/claimsflow/claim
git commit -m "feat(backend): unify operational filtering"
```

---

### Task 4: Upgrade the Dashboard API

**Files:**
- Modify: `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- Test: `backend/src/test/java/com/claimsflow/dashboard/application/DashboardServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/dashboard/api/DashboardControllerTest.java`

**Produces:**

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
```

- [ ] **Step 1: Write failing reconciliation tests**

```java
@Test
void metersAndSignalsReconcile() {
    DashboardSnapshot snapshot = service.snapshot();
    assertThat(snapshot.activePortfolioPercentage()).isEqualTo(
        snapshot.totalClaims() == 0 ? 0
            : Math.round(snapshot.openClaims() * 100f / snapshot.totalClaims()));
    assertThat(snapshot.signalCounts()).extracting(SignalCount::category)
        .containsExactly("SLA", "EVIDENCE", "OWNERSHIP", "PRIORITY", "ADVISORY");
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
```

- [ ] **Step 3: Calculate one coherent snapshot**

```java
Instant now = clock.instant();
List<Claim> all = operational.findAllForDashboard();
List<Claim> open = all.stream().filter(this::isOpen).toList();
long high = open.stream().filter(this::isHighPriority).count();
long atRisk = open.stream().filter(claim -> isWithin24Hours(claim, now)).count();
long overdue = open.stream().filter(claim -> claim.getSlaDeadline().isBefore(now)).count();
long unassigned = open.stream().filter(claim -> claim.getAssignedAdjuster() == null).count();
long incomplete = open.stream().filter(claim -> claim.getCompletenessPercentage() < 100).count();
```

Signal categories are exact backend counts. No meter remains hard-coded.

- [ ] **Step 4: Verify and commit**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
mvn -q verify
git add src/main/java/com/claimsflow/dashboard src/test/java/com/claimsflow/dashboard
git commit -m "feat(backend): derive complete dashboard snapshot"
```

---

### Task 5: Add Analytics, Team Operations, and Evidence Operations APIs

**Files:**
- Create: `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java`
- Create: `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsController.java`
- Create: `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsResponses.java`
- Create: `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java`
- Create: `backend/src/main/java/com/claimsflow/team/api/TeamOperationsController.java`
- Create: `backend/src/main/java/com/claimsflow/team/api/TeamOperationsResponses.java`
- Create: `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java`
- Create: `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsController.java`
- Create: `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsResponses.java`
- Test: corresponding application and controller tests under `backend/src/test/java/com/claimsflow/{analytics,team,evidence}`

**Analytics formulas:**

```java
long total = claims.size();
long open = claims.stream().filter(this::isOpen).count();
long resolved = claims.stream().filter(claim -> claim.getResolvedAt() != null).count();
BigDecimal exposure = claims.stream().map(Claim::getEstimatedLoss)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
int readiness = averagePercent(claims, Claim::getCompletenessPercentage);
int slaCompliance = percent(
    claims.stream()
        .filter(claim -> claim.getResolvedAt() != null)
        .filter(claim -> !claim.getResolvedAt().isAfter(claim.getSlaDeadline()))
        .count(),
    resolved);
```

**Team integrity formula:**

```java
int overall = Math.round(
    slaCompliance * 0.40f +
    evidenceReadiness * 0.30f +
    assignmentCoverage * 0.30f);
```

- [ ] **Step 1: Write failing service tests**

Tests cover equal-length prior periods, zero-filled daily series, distribution reconciliation, average resolution, aging bands, cohorts, capacity from persisted adjusters, at-risk/overdue boundaries, escalation ordering, integrity weights, and claimant-message audience filtering.

```java
assertThat(analytics.statusDistribution().stream()
    .mapToLong(DistributionPoint::count).sum())
    .isEqualTo(analytics.kpis().totalClaims());

assertThat(evidence.selected().claimantMessages())
    .allMatch(message -> message.audience().equals("CLAIMANT"));
```

- [ ] **Step 2: Run the failing tests**

```bash
cd backend
mvn -q -Dtest=AnalyticsServiceTest,AnalyticsControllerTest,TeamOperationsServiceTest,TeamOperationsControllerTest,EvidenceOperationsServiceTest,EvidenceOperationsControllerTest test
```

- [ ] **Step 3: Implement truthful response contracts**

Analytics exposes Estimated exposure, Total/Open/Resolved claims, Average resolution, Evidence readiness, SLA compliance, daily created/resolved series, status/priority/region distributions, aging bands, and weekly cohorts. It does not expose payout, approval, or fraud metrics.

Team Operations exposes persisted capacity/utilization, SLA risk, overdue, assignment coverage, workload, escalations, performance summaries, integrity inputs, and router advisories. Advisories contain route/query parameters and never mutate staffing.

Evidence Operations exposes filtered claim summaries, four persisted evidence categories, completeness, status, priority, region, SLA, owner/team, claimant context, and claimant-visible messages. It exposes no upload, OCR, storage, version, comment, email, or SMS contract.

- [ ] **Step 4: Expose canonical GET endpoints**

```text
GET /api/analytics
GET /api/team-operations
GET /api/evidence-operations?selectedClaimId=<uuid>
```

All accept the Task 3 filter parameters and return `OperationalFilterOptions`.

- [ ] **Step 5: Verify and commit**

```bash
cd backend
mvn -q verify
git add src/main/java/com/claimsflow/analytics src/main/java/com/claimsflow/team \
  src/main/java/com/claimsflow/evidence src/test/java/com/claimsflow/analytics \
  src/test/java/com/claimsflow/team src/test/java/com/claimsflow/evidence
git commit -m "feat(backend): add employer operational snapshots"
```

---

### Task 6: Add the Angular operational store

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
```

```ts
activateDashboard(): () => void;
activateQueue(filters: ClaimFilters): () => void;
activateAnalytics(filters: OperationalFilters): () => void;
activateTeam(filters: OperationalFilters): () => void;
activateEvidence(filters: OperationalFilters, selectedClaimId: string): () => void;
refresh(family: OperationalFamily): void;
invalidate(families: readonly OperationalFamily[], changedClaimIds?: readonly string[]): void;
```

- [ ] **Step 1: Write failing store tests**

```ts
it('polls every 45 seconds only while visible', fakeAsync(() => {
  visibility.set('visible');
  store.activateDashboard();
  http.expectOne('/api/dashboard').flush(snapshotA);
  tick(45_000);
  http.expectOne('/api/dashboard').flush(snapshotB);
  visibility.set('hidden');
  tick(90_000);
  http.expectNone('/api/dashboard');
}));

it('retains the last snapshot after background failure', () => {
  expect(store.dashboard().value).toEqual(snapshotA);
  expect(store.dashboard().stale).toBeTrue();
});
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-data.store.spec.ts'
```

- [ ] **Step 3: Implement typed HTTP methods and keyed cache slots**

```ts
loadDashboard(): Observable<DashboardSnapshot>;
loadQueue(filters: ClaimFilters): Observable<ClaimPage>;
loadAnalytics(filters: OperationalFilters): Observable<AnalyticsSnapshot>;
loadTeam(filters: OperationalFilters): Observable<TeamOperationsSnapshot>;
loadEvidence(filters: OperationalFilters, selectedClaimId: string): Observable<EvidenceOperationsSnapshot>;
```

Activation returns cleanup. Poll active slots only. Revisit displays cache immediately and refreshes in the background after 15 seconds. Successful refresh clears stale/error state; failed background refresh leaves value/update time intact.

- [ ] **Step 4: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/core/operational-data src/app/shared/models
git commit -m "feat(frontend): add reactive operational data store"
```

---

### Task 7: Connect queue, My Work, and successful-mutation invalidation

**Files:**
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.ts`
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.spec.ts`
- Modify: `frontend/src/app/claims/data-access/claims-api.service.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.*`
- Modify: `frontend/src/app/workspaces/my-work-page.component.ts`
- Modify: `frontend/src/app/portal/data-access/portal-api.service.ts`
- Modify: `frontend/src/app/core/demo-journey/demo-journey.service.ts`
- Modify: affected specs

- [ ] **Step 1: Write failing URL round-trip tests**

```ts
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
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/**/*.spec.ts'
```

- [ ] **Step 3: Use the store for Queue and My Work**

My Work activates Queue with `adjusterId = sessionStorage['claimsflow.demoAdjusterId']`. Unknown enum query values normalize to empty strings. Existing `assignment=unassigned` and UUID links remain valid.

- [ ] **Step 4: Invalidate only after successful mutations**

```ts
return this.http.patch<ClaimDetail>(url, body).pipe(
  tap(claim => this.operational.invalidate(
    ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
    [claim.id],
  )),
);
```

Create/reset invalidates all five families. Claimant-visible message invalidates Evidence and refreshes current claim detail/audit.

- [ ] **Step 5: Add changed-row and empty-filter states**

Changed IDs receive a 1.2-second semantic highlight. Empty results list active filters and provide `Reset filters`.

- [ ] **Step 6: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/claims src/app/workspaces/my-work-page.component.ts \
  src/app/portal/data-access src/app/core/demo-journey
git commit -m "feat(frontend): connect queue and mutation refresh"
```

---

### Task 8: Add shared motion, refresh, and filter primitives

**Files:**
- Create: `frontend/src/app/shared/operational/reduced-motion.service.ts`
- Create: `frontend/src/app/shared/operational/animated-number.component.ts`
- Create: `frontend/src/app/shared/operational/changed-value.directive.ts`
- Create: `frontend/src/app/shared/operational/operational-refresh-status.component.ts`
- Create: `frontend/src/app/shared/operational/operational-filter-bar.component.ts`
- Create: matching specs
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Write failing interpolation/reduced-motion tests**

```ts
it('interpolates a changed value over 220ms', fakeAsync(() => {
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
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/operational/**/*.spec.ts'
```

- [ ] **Step 3: Implement bounded primitives**

Use `requestAnimationFrame`, cancel prior frames, skip initial-value animation, use `Intl.NumberFormat`, and update immediately under reduced motion. Refresh status renders update age, Refresh/Updating, and stale copy. Filter options come from backend snapshots and emit complete URL-representable filters.

```css
:root {
  --cf-duration-state: 220ms;
  --cf-duration-highlight: 1200ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --cf-duration-state: 0ms; --cf-duration-highlight: 0ms; }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 4: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/shared/operational src/styles.css
git commit -m "feat(frontend): add state-driven motion primitives"
```

---

### Task 9: Rebuild the Dashboard and command field

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.*`
- Modify: `frontend/src/app/shared/visualizations/command-field.component.*`
- Modify: matching specs

- [ ] **Step 1: Write failing meter/signal tests**

```ts
expect(meter('ACTIVE PORTFOLIO')).toBe('63%');
expect(meter('EVIDENCE READY')).toBe('78%');
expect(commandField.signalCounts()).toEqual(snapshot.signalCounts);
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/shared/visualizations/*.spec.ts'
```

- [ ] **Step 3: Bind every KPI and meter to the store**

Remove literal `82%`. Add layout-matched skeletons, retry, background stale state, update age, and manual refresh. Existing content remains during background refresh.

- [ ] **Step 4: Make intervention links canonical**

- SLA: `sort=slaDeadline,asc`
- Evidence: `sort=completenessPercentage,asc`
- Ownership: `assignment=unassigned`
- Priority: `priority=HIGH`

- [ ] **Step 5: Allocate command nodes from category counts**

```ts
readonly renderedSignals = computed(() =>
  allocateSignals(this.signalCounts(), 17));
```

Every nonzero category receives at least one node. Node tone/opacity reacts to state. Orbit/scan/halo motion is restrained and freezes under reduced motion. Announce meaningful changes only.

- [ ] **Step 6: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/dashboard src/app/shared/visualizations
git commit -m "feat(frontend): make dashboard reactive and truthful"
```

---

### Task 10: Rebuild Analytics and Team Operations

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

- [ ] **Step 1: Write failing filter/accessibility tests**

```ts
expect(store.activateAnalytics)
  .toHaveBeenCalledWith(jasmine.objectContaining({ region: 'WEST' }));
expect(queryAll('[data-chart-summary]').length)
  .toBe(queryAll('[data-operational-chart]').length);
expect(query('button[data-action="apply"]')).toBeNull();
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/analytics-page.component.spec.ts' --include='src/app/workspaces/team-operations-page.component.spec.ts'
```

- [ ] **Step 3: Replace Analytics fixtures**

Render Estimated exposure, Total/Open/Resolved claims, Average resolution, Evidence readiness, and SLA compliance. Remove payout, fraud, approval, line-of-business, channel, and export claims. Render data-driven SVG lines, proportional distributions, aging bars, and cohort heatmap. Every chart includes focusable exact values and an adjacent visually hidden table.

- [ ] **Step 4: Replace Team Operations fixtures**

Render backend KPI, workload, capacity, adjuster, escalation, advisory, and integrity data. Remove fake shift planner, performance sparklines, priority heatmap, static names, and apply buttons. Advisories navigate to filtered Queue states.

- [ ] **Step 5: Add real countdown and complete states**

Update `now` once per second only while visible; stop at `Overdue`; clear timer on destroy. Both pages implement skeleton, retry, no-results/reset, background stale, changed-value transitions, and reduced motion.

- [ ] **Step 6: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/workspaces/analytics-page.component.* \
  src/app/workspaces/team-operations-page.component.* \
  src/app/workspaces/workspace-base.css src/app/workspaces/workspace-team.css \
  src/app/workspaces/workspace-responsive.css
git commit -m "feat(frontend): connect analytics and team operations"
```

---

### Task 11: Replace Documents fixtures and audit remaining deployed surfaces

**Files:**
- Modify: `frontend/src/app/workspaces/documents-page.component.ts`
- Create: `frontend/src/app/workspaces/documents-page.component.html`
- Create: `frontend/src/app/workspaces/documents-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-documents.css`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.*`
- Modify: `frontend/src/app/workspaces/workflows-page.component.ts`
- Modify: matching AI/Workflow specs
- Modify: `frontend/src/app/core/demo-role/demo-role.model.ts`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.spec.ts`
- Modify: `frontend/src/app/tour/tour-step-registry.ts`
- Modify: `frontend/src/app/app.routes.ts`

- [ ] **Step 1: Write failing truthfulness/navigation tests**

```ts
[
  'OCR', 'Storage', 'Versions', 'Bulk Actions',
  'Upload Documents', 'Compose New Message', 'SMS'
].forEach(label => expect(text()).not.toContain(label));

for (const role of Object.values(DEMO_ROLES)) {
  expect(role.navigation.map(item => item.id)).not.toContain('reports');
  expect(role.navigation.map(item => item.id)).not.toContain('settings');
}
```

- [ ] **Step 2: Run the failing tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/documents-page.component.spec.ts' --include='src/app/intelligence/*.spec.ts' --include='src/app/core/demo-role/*.spec.ts'
```

- [ ] **Step 3: Rebuild Documents as Evidence Operations**

Use shared filters, claim/evidence list, selected claim context, four evidence-category cards, claimant-visible messages, and `Open authoritative Claim Workspace`. Store `selectedClaimId` in query parameters. Remove fake folders, storage, preview, OCR, confidence, versions, comments, bulk/upload, email/SMS, and AI summary.

- [ ] **Step 4: Verify AI Insights and Workflow boundaries**

AI actions must call existing recommendation generation/review APIs or navigate to a real claim. Workflow keeps real claim loading, local Save Draft, Validate, and simulation. Activation remains disabled with:

```text
Production workflow activation is not connected in this portfolio demo.
```

- [ ] **Step 5: Remove Reports/Settings from navigation and tour**

Manager ends with Team Operations; Adjuster ends with Documents; Administrator contains only Workflow Automation. Direct source routes may remain but receive no nav/profile/tour/demo-script links.

- [ ] **Step 6: Verify and commit**

```bash
cd frontend
npm run test:ci
npm run build
git add src/app/workspaces/documents-page.component.* src/app/workspaces/workspace-documents.css \
  src/app/intelligence src/app/workspaces/workflows-page.component.* \
  src/app/core/demo-role src/app/tour/tour-step-registry.ts src/app/app.routes.ts
git commit -m "feat(frontend): finish truthful deployed surfaces"
```

---

### Task 12: Add exact-head functional Visual QA and documentation

**Files:**
- Create: `frontend/scripts/capture-operational-visual-qa.mjs`
- Create: `frontend/src/app/core/operational-data/control-integrity.spec.ts`
- Modify: `.github/workflows/visual-qa.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Modify: pull request #8 description

- [ ] **Step 1: Add deployed-route control-integrity tests**

```ts
const forbiddenLabels = [
  'Upload Documents', 'Bulk Actions', 'Export Report',
  'Configure workspace', 'Apply recommendation'
];
for (const route of deployedRoutes) {
  forbiddenLabels.forEach(label => expect(visibleText(route)).not.toContain(label));
}
```

Workflow activation is tested by exact copy plus disabled state rather than included in the forbidden list.

- [ ] **Step 2: Capture the functional employer journey**

The script:

1. POSTs `/api/demo/reset` and stores claim/adjuster IDs.
2. Captures Manager Dashboard baseline.
3. Changes evidence in Adjuster Claim Workspace.
4. Waits for immediate invalidation and captures changed Dashboard.
5. Captures Analytics default and `region=WEST`.
6. Captures Team Operations default and `team=Claims Operations`.
7. Follows a Dashboard intervention to filtered Queue.
8. Selects the reserved claim in Evidence Operations.
9. Intercepts one background Dashboard request with 503 and captures stale state with old data still visible.
10. Captures desktop 1440×1180, mobile 390×844, and reduced-motion variants.

```js
await page.emulateMedia({ reducedMotion: 'reduce' });
```

- [ ] **Step 3: Update workflows**

```yaml
- name: Capture operational employer journey
  run: node scripts/capture-operational-visual-qa.mjs
  working-directory: frontend
  env:
    BASE_URL: http://127.0.0.1:4200
    API_URL: http://127.0.0.1:8080
```

Validate every expected PNG exists and is nonempty before upload. Standard CI remains `mvn -q verify`, `npm run test:ci`, and `npm run build`.

- [ ] **Step 4: Update README and employer script**

Document real backend-derived behavior, deterministic 48-claim history, reserved reset, curated filters, immediate invalidation, 45-second visible polling, reduced motion, hidden placeholders, local-only Workflow Automation, and excluded integrations. The demo script performs one mutation and observes it across Dashboard, Queue, Analytics, Team Operations, and Evidence Operations.

- [ ] **Step 5: Run final exact-head verification**

```bash
cd backend
mvn -q verify
cd ../frontend
npm run test:ci
npm run build
rg -n "82%|1,389|4\.73M|621K|Upload Documents|Bulk Actions|Export Report|Configure workspace" src ../backend/src
rg -n "Reports|Settings" src/app/core/demo-role src/app/tour
```

Expected: all tests/builds pass; no deployed fixture KPI/control labels; no Reports/Settings nav or tour references.

- [ ] **Step 6: Update PR #8 without merging**

Record schema/seed design, operational APIs, reactive store, motion/reduced motion, Evidence Operations, hidden placeholders, production boundaries, exact final head SHA, CI run/conclusion, Visual QA run, artifact ID/digest, screenshot count, and manual visual inspection.

- [ ] **Step 7: Commit and enforce final acceptance**

```bash
git add frontend/scripts frontend/src/app/core/operational-data/control-integrity.spec.ts \
  .github/workflows/visual-qa.yml .github/workflows/ci.yml README.md docs/demo-script.md
git commit -m "test: verify truthful employer demo experience"
```

Do not report completion until all thirteen design acceptance criteria pass, CI and Visual QA succeed on the exact final head, screenshots are manually inspected, and the PR remains unmerged unless the user explicitly requests merging.
