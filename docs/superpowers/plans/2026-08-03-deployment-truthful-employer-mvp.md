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
- Use deterministic fictional seed data; tests must inject a fixed `Clock` and must not depend on random wall-clock timing.
- Motion must communicate live state, change, risk, progress, or feedback. Standard transitions remain 160–280 ms and hover movement remains 1–3 px.
- Respect `prefers-reduced-motion`; reduced mode updates values immediately and disables interpolation, breathing, scanning, orbiting, chart drawing, and animated scrolling.
- Preserve the independent claimant portal and human authority over consequential claim decisions.
- Reports and Settings remain in source for future work but are absent from deployed role navigation.
- Workflow Automation remains local, deterministic, explanatory, and nonconsequential.

---

## File Structure Map

### Backend domain and persistence

- `backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql` — adds region, resolution, team, and demo-dataset metadata.
- `backend/src/main/java/com/claimsflow/claim/domain/ClaimRegion.java` — supported reporting regions.
- `backend/src/main/java/com/claimsflow/claim/domain/Claim.java` — persisted operational fields and deterministic seeded construction.
- `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java` — persisted team name.
- `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java` — demo-dataset cleanup and eager operational reads.
- `backend/src/main/java/com/claimsflow/claim/persistence/ClaimSpecifications.java` — canonical queue/operations filters.

### Backend demo dataset

- `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetService.java` — idempotent 48-claim historical seed.
- `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetRunner.java` — seeds only when demo mode is enabled.
- `backend/src/main/java/com/claimsflow/demo/application/OperationalSeedScenario.java` — immutable scenario definitions.
- `backend/src/main/java/com/claimsflow/demo/application/DemoJourneyService.java` — preserves historical data while resetting only the reserved journey.

### Backend operational APIs

- `backend/src/main/java/com/claimsflow/operations/application/OperationalFilters.java` — one typed filter contract.
- `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java` — filtered, eager claim reads and date-window validation.
- `backend/src/main/java/com/claimsflow/operations/api/OperationalResponses.java` — shared response records and filter options.
- `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java` — upgraded truthful Dashboard snapshot.
- `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java` — KPI, comparison, trend, distribution, and cohort calculations.
- `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsController.java` — `GET /api/analytics`.
- `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java` — workload, capacity, SLA, escalation, and advisory calculations.
- `backend/src/main/java/com/claimsflow/team/api/TeamOperationsController.java` — `GET /api/team-operations`.
- `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java` — evidence-focused claim summaries and claimant-visible messages.
- `backend/src/main/java/com/claimsflow/evidence/api/EvidenceOperationsController.java` — `GET /api/evidence-operations`.

### Frontend shared operational state

- `frontend/src/app/core/operational-data/operational-data.models.ts` — filter, resource-state, and snapshot types.
- `frontend/src/app/core/operational-data/operational-api.service.ts` — typed HTTP reads for all operational families.
- `frontend/src/app/core/operational-data/operational-data.store.ts` — cache, activation, polling, invalidation, stale state, and changed IDs.
- `frontend/src/app/core/operational-data/operational-data.store.spec.ts` — deterministic timer and visibility tests.
- `frontend/src/app/shared/operational/operational-refresh-status.component.ts` — refresh button, update age, stale state.
- `frontend/src/app/shared/operational/animated-number.component.ts` — bounded numeric interpolation with reduced-motion fallback.
- `frontend/src/app/shared/operational/changed-value.directive.ts` — brief semantic highlight after value changes.
- `frontend/src/app/shared/operational/reduced-motion.service.ts` — one observable/signal source for motion preference.

### Frontend surfaces

- `frontend/src/app/dashboard/dashboard-page.component.*` — reactive Dashboard and truthful meters.
- `frontend/src/app/shared/visualizations/command-field.component.*` — category-aware signals.
- `frontend/src/app/claims/data-access/claim-filter-codec.ts` — canonical URL filter codec.
- `frontend/src/app/claims/data-access/claims-api.service.ts` — expanded queue parameters and mutation invalidation.
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.*` — store-backed queue and changed-row feedback.
- `frontend/src/app/workspaces/analytics-page.component.ts` — backend-backed Analytics.
- `frontend/src/app/workspaces/team-operations-page.component.ts` — backend-backed Team Operations.
- `frontend/src/app/workspaces/documents-page.component.ts` — truthful Evidence Operations workspace.
- `frontend/src/app/workspaces/workspace-base.css` — shared KPI, loading, chart, and state styles.
- `frontend/src/app/workspaces/workspace-team.css` — real Team Operations visual states.
- `frontend/src/app/workspaces/workspace-documents.css` — evidence-focused layout.
- `frontend/src/app/core/demo-role/demo-role.model.ts` — removes Reports and Settings navigation items.

### Verification and documentation

- `.github/workflows/visual-qa.yml` — exact-head functional and visual states.
- `frontend/scripts/capture-operational-visual-qa.mjs` — deterministic screenshot flow.
- `README.md` — truthful capability and deployment notes.
- `docs/demo-script.md` — employer walkthrough using one claim and reactive surfaces.

---

### Task 1: Add the persisted operational reporting fields

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql`
- Create: `backend/src/main/java/com/claimsflow/claim/domain/ClaimRegion.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- Modify: `backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Test: `backend/src/test/java/com/claimsflow/claim/domain/ClaimOperationalFieldsTest.java`
- Test: `backend/src/test/java/com/claimsflow/claim/persistence/OperationalFieldsMigrationTest.java`

**Interfaces:**
- Produces: `ClaimRegion`, `Claim.getRegion()`, `Claim.getResolvedAt()`, `Claim.getDemoDatasetKey()`, `Adjuster.getTeam()`.
- Produces: `Claim.createSeeded(...)` for Task 2.

- [ ] **Step 1: Write failing domain tests for region, resolution timestamps, and deterministic seeded IDs**

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

    claim.changeStatus(ClaimStatus.IN_REVIEW, created.plus(Duration.ofHours(13)));
    assertThat(claim.getResolvedAt()).isNull();
}

@Test
void seededClaimUsesProvidedIdAndDatasetKey() {
    UUID id = UUID.fromString("d7fbd89a-d6fd-3dd7-8f25-36d53cf20f51");
    Claim claim = Claim.createSeeded(id, "EMPLOYER_MVP", /* explicit scenario fields */);
    assertThat(claim.getId()).isEqualTo(id);
    assertThat(claim.getDemoDatasetKey()).isEqualTo("EMPLOYER_MVP");
}
```

- [ ] **Step 2: Run the domain test and confirm it fails**

```bash
cd backend
mvn -q -Dtest=ClaimOperationalFieldsTest test
```

Expected: compilation failure because `ClaimRegion`, the new getters, and `createSeeded` do not exist.

- [ ] **Step 3: Add the Flyway migration with explicit backfill values and indexes**

```sql
ALTER TABLE adjusters ADD COLUMN team VARCHAR(80);
UPDATE adjusters
SET team = CASE
  WHEN lower(role) LIKE '%medical%' THEN 'Medical Review'
  WHEN lower(role) LIKE '%investig%' THEN 'SIU Investigations'
  WHEN lower(role) LIKE '%payment%' THEN 'Payment Review'
  ELSE 'Claims Operations'
END;
ALTER TABLE adjusters ALTER COLUMN team SET NOT NULL;

ALTER TABLE claims ADD COLUMN region VARCHAR(40) NOT NULL DEFAULT 'SOUTHEAST';
ALTER TABLE claims ADD COLUMN resolved_at TIMESTAMPTZ;
ALTER TABLE claims ADD COLUMN demo_dataset_key VARCHAR(64);

UPDATE claims
SET resolved_at = updated_at
WHERE status IN ('RESOLVED', 'CLOSED') AND resolved_at IS NULL;

CREATE INDEX idx_claims_operational_date ON claims (created_at);
CREATE INDEX idx_claims_operational_region ON claims (region);
CREATE INDEX idx_claims_operational_dataset ON claims (demo_dataset_key);
CREATE INDEX idx_adjusters_team ON adjusters (team);
```

- [ ] **Step 4: Implement the domain fields and explicit seeded factory**

```java
public enum ClaimRegion {
    NORTHEAST, SOUTHEAST, MIDWEST, SOUTHWEST, WEST
}
```

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

`Claim.createSeeded(...)` must accept every persisted scenario value, including the UUID, claim number, status, region, assignment, timestamps, evidence flags, priority, SLA deadline, resolved timestamp, and dataset key. It must not call `UUID.randomUUID()`.

- [ ] **Step 5: Default normal claim intake to `ClaimRegion.SOUTHEAST` without expanding the public intake form**

```java
Claim claim = Claim.create(
    claimNumber(now),
    command.claimantName(),
    command.claimantEmail(),
    command.claimType(),
    ClaimRegion.SOUTHEAST,
    command.incidentDate(),
    command.estimatedLoss(),
    command.description(),
    command.incidentReportPresent(),
    command.photosPresent(),
    command.proofOfOwnershipPresent(),
    command.medicalDocumentationPresent(),
    complete.percentage(),
    triage.priority(),
    sla,
    now);
```

- [ ] **Step 6: Run focused tests and the full backend verification**

```bash
cd backend
mvn -q -Dtest=ClaimOperationalFieldsTest,OperationalFieldsMigrationTest test
mvn -q verify
```

Expected: all tests pass and Flyway applies V4 cleanly on a fresh test database.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/resources/db/migration/V4__operational_reporting_fields.sql \
  backend/src/main/java/com/claimsflow/claim/domain \
  backend/src/main/java/com/claimsflow/adjuster/domain/Adjuster.java \
  backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java \
  backend/src/test/java/com/claimsflow/claim
git commit -m "feat(backend): add operational reporting fields"
```

---

### Task 2: Seed a deterministic historical employer-demo dataset

**Files:**
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalSeedScenario.java`
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetService.java`
- Create: `backend/src/main/java/com/claimsflow/demo/application/OperationalDemoDatasetRunner.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/demo/application/DemoJourneyService.java`
- Modify: `backend/src/main/java/com/claimsflow/audit/domain/AuditEvent.java`
- Test: `backend/src/test/java/com/claimsflow/demo/application/OperationalDemoDatasetServiceTest.java`
- Test: `backend/src/test/java/com/claimsflow/demo/application/DemoJourneyServiceTransactionTest.java`

**Interfaces:**
- Produces: `OperationalDemoDatasetService.ensureSeeded()` and `resetHistoricalDataset()`.
- Dataset key: `EMPLOYER_MVP`.
- Dataset size: exactly 48 historical claims plus the separately resettable reserved golden-journey claim.

- [ ] **Step 1: Write failing idempotency and distribution tests**

```java
@Test
void ensureSeededCreatesExactlyFortyEightRepeatableHistoricalClaims() {
    service.ensureSeeded();
    service.ensureSeeded();

    List<Claim> claims = repository.findAllByDemoDatasetKey("EMPLOYER_MVP");
    assertThat(claims).hasSize(48);
    assertThat(claims).extracting(Claim::getRegion).containsAtLeast(
        ClaimRegion.NORTHEAST, ClaimRegion.SOUTHEAST,
        ClaimRegion.MIDWEST, ClaimRegion.SOUTHWEST, ClaimRegion.WEST);
    assertThat(claims).extracting(Claim::getStatus).contains(
        ClaimStatus.NEW, ClaimStatus.IN_REVIEW, ClaimStatus.RESOLVED, ClaimStatus.CLOSED);
}

@Test
void goldenJourneyResetDoesNotDeleteHistoricalDataset() {
    dataset.ensureSeeded();
    journey.reset();
    journey.reset();

    assertThat(repository.findAllByDemoDatasetKey("EMPLOYER_MVP")).hasSize(48);
    assertThat(repository.findAllByClaimantEmail(DemoJourneyService.CLAIMANT_EMAIL)).hasSize(1);
}
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
```

Expected: failure because dataset methods and repository queries do not exist.

- [ ] **Step 3: Define immutable scenarios with stable IDs and relative offsets**

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

Define exactly 48 explicit scenarios. The list must cover all regions, statuses, priorities, claim types, evidence-completeness bands, assigned/unassigned states, SLA-risk states, and at least four adjusters/teams.

- [ ] **Step 4: Implement idempotent seeding around an injected `Clock`**

```java
@Transactional
public void ensureSeeded() {
    if (claims.countByDemoDatasetKey(DATASET_KEY) == SCENARIOS.size()) return;
    resetHistoricalDataset();
    Instant anchor = LocalDate.now(clock).atStartOfDay(ZoneOffset.UTC).toInstant().plus(Duration.ofHours(12));
    for (OperationalSeedScenario scenario : SCENARIOS) {
        Claim claim = buildClaim(scenario, anchor);
        claims.save(claim);
        audit.recordSeeded(claim, "ClaimsFlow demo seed", "CLAIM_CREATED",
            "Deterministic historical claim seeded", null, claim.getStatus().name(), claim.getCreatedAt());
    }
}
```

Add `AuditEvent.recordSeeded(UUID id, ...)` or an equivalent explicit-ID factory so reseeding produces stable audit rows. Use `UUID.nameUUIDFromBytes(("claimsflow:audit:" + scenario.key()).getBytes(UTF_8))`.

- [ ] **Step 5: Add repository methods that isolate only the historical dataset**

```java
List<Claim> findAllByDemoDatasetKey(String demoDatasetKey);
long countByDemoDatasetKey(String demoDatasetKey);

@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("delete from Claim c where c.demoDatasetKey = :key")
int deleteByDemoDatasetKey(@Param("key") String key);
```

Delete child audit/message rows for those claim IDs before deleting seeded claims, or configure the service to delete through the matching repositories in a transaction.

- [ ] **Step 6: Run seeding only when demo mode is enabled**

```java
@Component
@ConditionalOnProperty(prefix = "claimsflow.demo", name = "enabled", havingValue = "true")
public class OperationalDemoDatasetRunner implements ApplicationRunner {
    private final OperationalDemoDatasetService service;
    public void run(ApplicationArguments args) { service.ensureSeeded(); }
}
```

`DemoJourneyService.reset()` must call `dataset.ensureSeeded()` first, then continue deleting only `taylor.reed@example.com`.

- [ ] **Step 7: Run focused and full backend verification**

```bash
cd backend
mvn -q -Dtest=OperationalDemoDatasetServiceTest,DemoJourneyServiceTransactionTest test
mvn -q verify
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/claimsflow/demo \
  backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java \
  backend/src/main/java/com/claimsflow/audit/domain/AuditEvent.java \
  backend/src/test/java/com/claimsflow/demo
git commit -m "feat(backend): seed deterministic operational history"
```

---

### Task 3: Establish one backend operational filter contract

**Files:**
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalFilters.java`
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimSpecifications.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/api/ClaimController.java`
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

- Produces: `OperationalQueryService.find(OperationalFilters)`.
- Extends queue URL parameters without removing `q`, `assignment`, `page`, `size`, or `sort`.

- [ ] **Step 1: Write failing filter validation and combination tests**

```java
@Test
void rejectsInvertedAndOverlongDateWindows() {
    assertThatThrownBy(() -> OperationalFilters.create(
        LocalDate.parse("2026-08-01"), LocalDate.parse("2026-07-01"), null, null, null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);

    assertThatThrownBy(() -> OperationalFilters.create(
        LocalDate.parse("2025-01-01"), LocalDate.parse("2026-08-01"), null, null, null, null, null, null, false))
        .isInstanceOf(IllegalArgumentException.class);
}

@Test
void combinesRegionTeamPriorityAndDateFilters() {
    Specification<Claim> spec = ClaimSpecifications.operational(filters);
    assertThat(repository.findAll(spec)).extracting(Claim::getRegion)
        .containsOnly(ClaimRegion.SOUTHEAST);
}
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=OperationalFiltersTest,ClaimSpecificationsIntegrationTest test
```

- [ ] **Step 3: Implement defaults and validation**

```java
public static OperationalFilters create(
        LocalDate from, LocalDate to, ClaimType claimType, ClaimPriority priority,
        ClaimStatus status, UUID adjusterId, String team, ClaimRegion region, boolean unassigned) {
    LocalDate effectiveTo = to == null ? LocalDate.now(ZoneOffset.UTC) : to;
    LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(29) : from;
    if (effectiveFrom.isAfter(effectiveTo)) throw new IllegalArgumentException("from must not be after to");
    if (ChronoUnit.DAYS.between(effectiveFrom, effectiveTo) > 366) throw new IllegalArgumentException("date range must not exceed 366 days");
    return new OperationalFilters(effectiveFrom, effectiveTo, claimType, priority, status,
        adjusterId, normalize(team), region, unassigned);
}
```

Use the application `Clock` in `OperationalQueryService` when supplying defaults; do not call wall-clock time inside tests.

- [ ] **Step 4: Extend `ClaimSpecifications` with one canonical specification**

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

Keep `filters(query, status, priority, assignment, ...)` as a queue wrapper that adds search and paging to the same canonical predicates.

- [ ] **Step 5: Expand the queue endpoint without breaking existing dashboard links**

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
    @PageableDefault(...) Pageable pageable) { ... }
```

`assignment=unassigned` remains valid. A UUID supplied through legacy `assignment` is normalized to `adjusterId`.

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
git commit -m "feat(backend): unify operational filters"
```

---

### Task 4: Upgrade the Dashboard snapshot and command-signal contract

**Files:**
- Modify: `backend/src/main/java/com/claimsflow/dashboard/application/DashboardService.java`
- Modify: `backend/src/main/java/com/claimsflow/dashboard/api/DashboardController.java`
- Create: `backend/src/test/java/com/claimsflow/dashboard/application/DashboardServiceTest.java`
- Create: `backend/src/test/java/com/claimsflow/dashboard/api/DashboardControllerTest.java`

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

- [ ] **Step 1: Write a failing service test for every Dashboard KPI and signal category**

```java
@Test
void snapshotCalculatesTruthfulMetersAndSignalCategories() {
    DashboardSnapshot snapshot = service.snapshot();
    assertThat(snapshot.totalClaims()).isEqualTo(49);
    assertThat(snapshot.activePortfolioPercentage())
        .isEqualTo(Math.round(snapshot.openClaims() * 100f / snapshot.totalClaims()));
    assertThat(snapshot.evidenceReadinessPercentage()).isBetween(0, 100);
    assertThat(snapshot.signalCounts()).extracting(SignalCount::category)
        .containsExactly("SLA", "EVIDENCE", "OWNERSHIP", "PRIORITY", "ADVISORY");
}
```

- [ ] **Step 2: Run the Dashboard tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
```

- [ ] **Step 3: Replace independent count queries with one coherent read-only snapshot calculation**

```java
@Transactional(readOnly = true)
public DashboardSnapshot snapshot() {
    Instant now = clock.instant();
    List<Claim> all = operational.findAllForDashboard();
    List<Claim> open = all.stream().filter(this::isOpen).toList();
    int readiness = all.isEmpty() ? 0 : roundAverage(all, Claim::getCompletenessPercentage);
    int activePercent = all.isEmpty() ? 0 : Math.round(open.size() * 100f / all.size());
    return new DashboardSnapshot(now, all.size(), open.size(), /* remaining derived fields */);
}
```

Use the same loaded claim set for all related Dashboard fields so the endpoint cannot return internally inconsistent counts.

- [ ] **Step 4: Define deterministic signal counts**

```java
List<SignalCount> signals = List.of(
    new SignalCount("SLA", "critical", slaRisk),
    new SignalCount("EVIDENCE", "warning", incomplete),
    new SignalCount("OWNERSHIP", "live", unassigned),
    new SignalCount("PRIORITY", "advisory", highPriority),
    new SignalCount("ADVISORY", "healthy", Math.max(0, open.size() - slaRisk - incomplete))
);
```

The frontend may cap rendered nodes for readability, but the response retains exact counts.

- [ ] **Step 5: Run tests and full backend verification**

```bash
cd backend
mvn -q -Dtest=DashboardServiceTest,DashboardControllerTest test
mvn -q verify
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/claimsflow/dashboard backend/src/test/java/com/claimsflow/dashboard
git commit -m "feat(backend): make dashboard metrics fully derived"
```

---

### Task 5: Build the Analytics aggregate API

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

Metric names must be truthful: use `Estimated exposure`, not `Total payouts`; use `Resolved claims`, not `Approval rate`; remove fraud savings because no fraud ledger exists.

- [ ] **Step 1: Write failing calculation tests with a fixed clock**

```java
@Test
void calculatesCurrentAndPreviousPeriodFromPersistedClaims() {
    AnalyticsSnapshot result = service.snapshot(filtersFor("2026-07-03", "2026-08-01"));
    assertThat(result.kpis().totalClaims()).isPositive();
    assertThat(result.kpis().estimatedExposure()).isGreaterThan(BigDecimal.ZERO);
    assertThat(result.kpis().evidenceReadinessPercentage()).isBetween(0, 100);
    assertThat(result.comparison().previousFrom()).isEqualTo(LocalDate.parse("2026-06-03"));
    assertThat(result.claimVolume()).hasSize(30);
}

@Test
void everyDistributionCountReconcilesToFilteredTotal() {
    AnalyticsSnapshot result = service.snapshot(filters);
    assertThat(result.statusDistribution().stream().mapToLong(DistributionPoint::count).sum())
        .isEqualTo(result.kpis().totalClaims());
}
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=AnalyticsServiceTest,AnalyticsControllerTest test
```

- [ ] **Step 3: Implement exact KPI formulas**

```java
long total = claims.size();
long open = claims.stream().filter(this::isOpen).count();
long resolved = claims.stream().filter(c -> c.getResolvedAt() != null).count();
BigDecimal exposure = claims.stream().map(Claim::getEstimatedLoss)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
int readiness = averagePercent(claims, Claim::getCompletenessPercentage);
int slaCompliance = percent(
    claims.stream().filter(c -> c.getResolvedAt() != null).filter(c -> !c.getResolvedAt().isAfter(c.getSlaDeadline())).count(),
    resolved);
Duration averageResolution = averageDuration(claims.stream()
    .filter(c -> c.getResolvedAt() != null)
    .map(c -> Duration.between(c.getCreatedAt(), c.getResolvedAt()))
    .toList());
```

Previous-period comparison uses the immediately preceding date range with identical inclusive length.

- [ ] **Step 4: Implement chart buckets with zero-filled dates and explicit aging bands**

```java
List<String> agingOrder = List.of("0–2 days", "3–7 days", "8–14 days", "15–30 days", "31+ days");
```

Every date between `from` and `to` appears in `claimVolume`, even when its value is zero. Cohort rows group claims by creation week and show resolved-within-7/14/30-day percentages derived from `resolvedAt`.

- [ ] **Step 5: Expose `GET /api/analytics` with the canonical filter parameters**

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
    return service.snapshot(filters.fromRequest(...));
}
```

- [ ] **Step 6: Run focused and full backend verification**

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

### Task 6: Build the Team Operations aggregate API

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

- [ ] **Step 1: Write failing workload, SLA, and integrity-score tests**

```java
@Test
void teamCapacityUsesPersistedAdjusterCapacityAndAssignments() {
    TeamOperationsSnapshot result = service.snapshot(filters);
    TeamWorkload operations = findTeam(result, "Claims Operations");
    assertThat(operations.capacity()).isEqualTo(sumActiveAdjusterCapacity("Claims Operations"));
    assertThat(operations.activeClaims()).isEqualTo(countOpenAssignedClaims("Claims Operations"));
}

@Test
void integrityScoreUsesDocumentedFormula() {
    IntegrityScore score = service.snapshot(filters).integrity();
    int expected = Math.round(
        score.slaCompliance() * 0.40f +
        score.evidenceReadiness() * 0.30f +
        score.assignmentCoverage() * 0.30f);
    assertThat(score.overall()).isEqualTo(expected);
}
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=TeamOperationsServiceTest,TeamOperationsControllerTest test
```

- [ ] **Step 3: Implement exact operational definitions**

- Active claim: status is not `RESOLVED` or `CLOSED`.
- SLA at risk: open claim deadline is between `now` and `now + 24h`.
- Overdue: open claim deadline is before `now`.
- Assignment coverage: assigned open claims divided by all open claims.
- Utilization: active assigned claims divided by summed active-adjuster capacity, capped at 100.
- Escalations: overdue first, then SLA risk, then critical priority; stable sort by deadline then claim number.

```java
int overall = Math.round(
    slaCompliance * 0.40f +
    evidenceReadiness * 0.30f +
    assignmentCoverage * 0.30f);
```

- [ ] **Step 4: Generate navigational advisories, not mutation actions**

```java
new Advisory(
    "SLA pressure",
    overdue + " overdue claims need review.",
    "/app/claims",
    Map.of("sort", "slaDeadline,asc"),
    "critical");
```

Other advisories cover unassigned claims and evidence incompleteness. Do not expose an `apply` or `rebalance` endpoint.

- [ ] **Step 5: Expose `GET /api/team-operations` with canonical filters**

Use the same request parameters and filter options as Analytics. Include active adjuster/team options in the response so the frontend never hard-codes filter choices.

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

### Task 7: Build the truthful Evidence Operations API

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

- [ ] **Step 1: Write failing tests that forbid unsupported content and internal messages**

```java
@Test
void selectedEvidenceContainsOnlyPersistedCategoriesAndClaimantMessages() {
    EvidenceClaimDetail detail = service.snapshot(filters, claimId).selected();
    assertThat(detail.evidence()).extracting(EvidenceCategory::kind)
        .containsExactlyInAnyOrder("INCIDENT_REPORT", "PHOTOS", "PROOF_OF_OWNERSHIP", "MEDICAL_DOCUMENTATION");
    assertThat(detail.claimantMessages()).allMatch(message -> message.audience().equals("CLAIMANT"));
}

@Test
void responseSchemaDoesNotExposeFakeFileMetadata() {
    String json = objectMapper.writeValueAsString(service.snapshot(filters, claimId));
    assertThat(json).doesNotContain("ocr", "confidence", "storage", "version", "fileSize", "sms");
}
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=EvidenceOperationsServiceTest,EvidenceOperationsControllerTest test
```

- [ ] **Step 3: Implement summaries and selected-detail behavior**

- Return summaries sorted by SLA urgency, then priority, then claim number.
- `selectedClaimId` is optional; select the first result when absent.
- Return `selected = null` when filters produce no claims.
- Derive category presence directly from the four persisted evidence flags.
- Read messages using `findByClaim_IdAndAudienceOrderByCreatedAtAsc(id, MessageAudience.CLAIMANT)`.

- [ ] **Step 4: Expose `GET /api/evidence-operations`**

```java
@GetMapping
public EvidenceOperationsSnapshot get(
    @RequestParam(required = false) UUID selectedClaimId,
    /* canonical filters */) {
    return service.snapshot(filters.fromRequest(...), selectedClaimId);
}
```

No POST, upload, OCR, comment, version, or communication-simulation endpoint is added.

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

### Task 8: Add the Angular operational API and reactive data store

**Files:**
- Create: `frontend/src/app/core/operational-data/operational-data.models.ts`
- Create: `frontend/src/app/core/operational-data/operational-api.service.ts`
- Create: `frontend/src/app/core/operational-data/operational-data.store.ts`
- Create: `frontend/src/app/core/operational-data/operational-data.store.spec.ts`
- Modify: `frontend/src/app/shared/models/dashboard.models.ts`

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

- [ ] **Step 1: Write failing cache, polling, visibility, stale-state, and invalidation tests**

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

it('keeps the last valid snapshot and marks it stale after refresh failure', fakeAsync(() => {
  store.activateDashboard();
  http.expectOne('/api/dashboard').flush(snapshotA);
  store.refresh('dashboard');
  http.expectOne('/api/dashboard').flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });

  expect(store.dashboard().value).toEqual(snapshotA);
  expect(store.dashboard().stale).toBeTrue();
}));
```

- [ ] **Step 2: Run the store test and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-data.store.spec.ts'
```

- [ ] **Step 3: Implement typed HTTP methods**

```ts
loadDashboard(): Observable<DashboardSnapshot>;
loadQueue(filters: ClaimFilters): Observable<ClaimPage>;
loadAnalytics(filters: OperationalFilters): Observable<AnalyticsSnapshot>;
loadTeam(filters: OperationalFilters): Observable<TeamOperationsSnapshot>;
loadEvidence(filters: OperationalFilters, selectedClaimId: string): Observable<EvidenceOperationsSnapshot>;
```

Build `HttpParams` through one pure `operationalFiltersToParams()` function and test it separately.

- [ ] **Step 4: Implement resource slots and activation reference counts**

```ts
activateDashboard(): () => void;
activateQueue(filters: ClaimFilters): () => void;
activateAnalytics(filters: OperationalFilters): () => void;
activateTeam(filters: OperationalFilters): () => void;
activateEvidence(filters: OperationalFilters, selectedClaimId: string): () => void;
refresh(family: OperationalFamily): void;
invalidate(families: readonly OperationalFamily[], changedClaimIds?: readonly string[]): void;
```

Each activation returns a cleanup function. Poll only active slots. Reuse cached values immediately, then refresh in the background when older than 15 seconds.

- [ ] **Step 5: Implement visibility-aware polling and stale recovery**

```ts
private readonly pollMs = 45_000;
private onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    this.refreshActiveFamilies();
    this.startPolling();
  } else {
    this.stopPolling();
  }
}
```

A successful refresh clears `stale` and `error`. Background failure leaves `value` and `updatedAt` unchanged.

- [ ] **Step 6: Run focused tests, full frontend tests, and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-data.store.spec.ts'
npm run test:ci
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/core/operational-data frontend/src/app/shared/models/dashboard.models.ts
git commit -m "feat(frontend): add reactive operational data store"
```

---

### Task 9: Expand queue filters and invalidate operational data after mutations

**Files:**
- Modify: `frontend/src/app/claims/data-access/claim-filter-codec.ts`
- Modify: `frontend/src/app/claims/data-access/claims-api.service.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Modify: `frontend/src/app/portal/data-access/portal-api.service.ts`
- Modify: `frontend/src/app/core/demo-journey/demo-journey.service.ts`
- Test: `frontend/src/app/claims/data-access/claim-filter-codec.spec.ts`
- Test: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`
- Test: affected mutation-service specs

**Interfaces:**
- Queue URL state includes all curated filters plus existing search, pagination, assignment, and sort.
- Mutation invalidation families:
  - create/reset: all five families
  - assignment/status/evidence: dashboard, queue, analytics, team, evidence
  - claimant-visible message: evidence plus the current claim detail

- [ ] **Step 1: Write failing URL round-trip tests for every curated filter**

```ts
it('round-trips curated filters without losing legacy assignment', () => {
  const filters: ClaimFilters = {
    ...DEFAULT_FILTERS,
    from: '2026-07-03',
    to: '2026-08-01',
    claimType: 'PROPERTY',
    priority: 'HIGH',
    status: 'IN_REVIEW',
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

- [ ] **Step 3: Extend the filter codec and HTTP params**

```ts
if (filters.from) params['from'] = filters.from;
if (filters.to) params['to'] = filters.to;
if (filters.claimType) params['claimType'] = filters.claimType;
if (filters.adjusterId) params['adjusterId'] = filters.adjusterId;
if (filters.team) params['team'] = filters.team;
if (filters.region) params['region'] = filters.region;
```

Reject unknown enum values during parsing by returning `''`, not by casting arbitrary strings.

- [ ] **Step 4: Move Claim Queue reads to `OperationalDataStore`**

```ts
private connect(filters: ClaimFilters): void {
  this.releaseQueue?.();
  this.releaseQueue = this.operational.activateQueue(filters);
}
```

Render last data during refresh. When `changedClaimIds` contains a row ID, add `data-changed="true"` for 1.2 seconds and then clear it through the store.

- [ ] **Step 5: Add invalidation to every successful mutation**

```ts
return this.http.patch<ClaimDetail>(...).pipe(
  tap(claim => this.operational.invalidate(
    ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
    [claim.id],
  )),
);
```

Apply the same pattern to claim creation, evidence mutation, assignment, status, claimant-visible messages, and demo reset. Do not invalidate on failed requests.

- [ ] **Step 6: Add a truthful empty-filter state and reset action**

The empty state must list active filters in plain language and provide a button that navigates to `/app/claims` with no query parameters.

- [ ] **Step 7: Run frontend tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/claims frontend/src/app/portal/data-access \
  frontend/src/app/core/demo-journey
git commit -m "feat(frontend): connect queue filters and mutation refresh"
```

---

### Task 10: Add shared refresh, number, changed-state, and reduced-motion primitives

**Files:**
- Create: `frontend/src/app/shared/operational/operational-refresh-status.component.ts`
- Create: `frontend/src/app/shared/operational/operational-refresh-status.component.spec.ts`
- Create: `frontend/src/app/shared/operational/animated-number.component.ts`
- Create: `frontend/src/app/shared/operational/animated-number.component.spec.ts`
- Create: `frontend/src/app/shared/operational/changed-value.directive.ts`
- Create: `frontend/src/app/shared/operational/changed-value.directive.spec.ts`
- Create: `frontend/src/app/shared/operational/reduced-motion.service.ts`
- Create: `frontend/src/app/shared/operational/reduced-motion.service.spec.ts`
- Modify: `frontend/src/styles.css`

**Interfaces:**

```ts
<app-animated-number [value]="metric" [format]="'integer'" />
<app-operational-refresh-status [resource]="state" (refreshRequested)="refresh()" />
<div [appChangedValue]="metric" [changeTone]="tone"></div>
```

- [ ] **Step 1: Write failing deterministic animation and reduced-motion tests**

```ts
it('interpolates only when the value changes', fakeAsync(() => {
  fixture.componentRef.setInput('value', 10);
  fixture.detectChanges();
  fixture.componentRef.setInput('value', 20);
  tick(110);
  expect(Number(text())).toBeGreaterThan(10);
  expect(Number(text())).toBeLessThan(20);
  tick(110);
  expect(text()).toBe('20');
}));

it('updates immediately when reduced motion is enabled', () => {
  reducedMotion.set(true);
  fixture.componentRef.setInput('value', 20);
  fixture.detectChanges();
  expect(text()).toBe('20');
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/operational/**/*.spec.ts'
```

- [ ] **Step 3: Implement numeric interpolation using `requestAnimationFrame`**

```ts
const duration = 220;
const eased = 1 - Math.pow(1 - progress, 3);
this.displayValue.set(start + (target - start) * eased);
```

Cancel an active frame before starting another. Do not animate the initial value. Format currency, percentage, decimal, duration, and integer through `Intl.NumberFormat`.

- [ ] **Step 4: Implement refresh status and update-age text**

Update the relative label every 15 seconds while mounted. Button copy is `Refresh` or `Updating…`; stale copy is `Showing the last successful update.` Use `role="status"` without repeatedly announcing unchanged polling results.

- [ ] **Step 5: Implement global reduced-motion service and CSS tokens**

```ts
const media = matchMedia('(prefers-reduced-motion: reduce)');
readonly reduced = signal(media.matches);
```

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

- [ ] **Step 6: Run focused tests, full frontend tests, and build**

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
- Dashboard reads only `OperationalDataStore.dashboard()`.
- Command field input becomes `signalCounts`, not only `activeCount`.

- [ ] **Step 1: Write failing tests for derived meters, refresh UI, and category-aware signals**

```ts
it('renders backend percentages instead of fixed meter values', () => {
  store.dashboard.set(resource({
    ...snapshot,
    activePortfolioPercentage: 63,
    evidenceReadinessPercentage: 78,
  }));
  fixture.detectChanges();
  expect(queryMeter('ACTIVE PORTFOLIO').style.getPropertyValue('--meter')).toBe('63%');
  expect(queryMeter('EVIDENCE READY').style.getPropertyValue('--meter')).toBe('78%');
});

it('passes exact signal categories to the command field', () => {
  expect(commandField.signalCounts()).toEqual(snapshot.signalCounts);
});
```

- [ ] **Step 2: Run Dashboard tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/shared/visualizations/*.spec.ts'
```

- [ ] **Step 3: Replace direct `DashboardService.load()` with store activation**

```ts
readonly state = this.operational.dashboard;
private release = this.operational.activateDashboard();
ngOnDestroy(): void { this.release(); }
refresh(): void { this.operational.refresh('dashboard'); }
```

Keep the separate golden-journey claim lookup, but invalidate/reload it after demo reset and changed claim IDs.

- [ ] **Step 4: Replace all numeric output with backend values and bounded animation**

Use `app-animated-number` for changed KPIs. Bind meters to `activePortfolioPercentage`, `highPriorityPercentage`, `evidenceReadinessPercentage`, and `unassignedPercentage` returned or derived from snapshot totals. No literal `82%` remains.

- [ ] **Step 5: Make intervention links use canonical queue filters**

- SLA: `sort=slaDeadline,asc` plus an at-risk query supported by the backend.
- Evidence: `sort=completenessPercentage,asc`.
- Ownership: `assignment=unassigned`.
- Priority: `priority=HIGH` or a supported multi-priority route resolved by the backend.

- [ ] **Step 6: Make command-field node categories and transitions data-driven**

```ts
readonly renderedSignals = computed(() => allocateSignals(this.signalCounts(), 17));
```

`allocateSignals` proportionally assigns the 17 visual nodes while ensuring every nonzero category receives at least one node. Node entry/exit uses opacity and halo changes; reduced-motion renders immediately.

- [ ] **Step 7: Add loading skeleton, stale notice, update age, and accessible change announcement**

Initial loading mirrors the command layout and KPI band geometry. Background refresh leaves content visible. Announce only meaningful count changes, for example: `Dashboard updated: 2 additional SLA-risk claims.`

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

### Task 12: Rebuild Analytics with functional filters and accessible charts

**Files:**
- Modify: `frontend/src/app/workspaces/analytics-page.component.ts`
- Create: `frontend/src/app/workspaces/analytics-page.component.html`
- Create: `frontend/src/app/workspaces/analytics-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-base.css`
- Modify: `frontend/src/app/workspaces/workspace-responsive.css`
- Create: `frontend/src/app/shared/operational/operational-filter-bar.component.ts`
- Create: `frontend/src/app/shared/operational/operational-filter-bar.component.spec.ts`

**Interfaces:**
- Filter bar emits complete `OperationalFilters` and writes them to URL query parameters.
- Analytics page renders only fields present in `AnalyticsSnapshot`.

- [ ] **Step 1: Write failing filter, metric, and accessibility tests**

```ts
it('updates the URL and requests a new snapshot when region changes', () => {
  filterBar.regionChange.emit('WEST');
  expect(router.navigate).toHaveBeenCalledWith([], {
    queryParams: jasmine.objectContaining({ region: 'WEST' }),
    queryParamsHandling: 'merge',
  });
  expect(store.activateAnalytics).toHaveBeenCalledWith(jasmine.objectContaining({ region: 'WEST' }));
});

it('renders an accessible data summary for every chart', () => {
  expect(fixture.nativeElement.querySelectorAll('[data-chart-summary]').length)
    .toBe(fixture.nativeElement.querySelectorAll('[data-operational-chart]').length);
});
```

- [ ] **Step 2: Run the Analytics tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/analytics-page.component.spec.ts' --include='src/app/shared/operational/operational-filter-bar.component.spec.ts'
```

- [ ] **Step 3: Implement the reusable curated filter bar**

Controls: date range, claim type, priority, status, team/adjuster, and region. Options come from the snapshot response. Selection is visible immediately; disable only the changed control while the replacement snapshot is loading.

Remove line-of-business, channel, unsupported comparison menus, and export controls.

- [ ] **Step 4: Replace fixture metrics with truthful KPIs**

Render:
- Estimated exposure
- Total claims
- Open claims
- Resolved claims
- Average resolution time
- Evidence readiness
- SLA compliance

Do not render payout, fraud-savings, or approval-rate claims.

- [ ] **Step 5: Render data-driven SVG/CSS charts**

- Claim volume and resolved volume: SVG polylines generated from time points.
- Status, priority, and region: proportional bars.
- Aging: ordered bands.
- Cohorts: percentage heatmap.

Each point or bar includes an exact text value and keyboard focus target. Add an adjacent visually hidden table under `data-chart-summary` so charts remain understandable without color or motion.

- [ ] **Step 6: Animate only state changes**

Use CSS transitions on path `stroke-dashoffset`, bar width, and heatmap opacity for 220 ms. Disable them under reduced motion. Do not animate idle cards.

- [ ] **Step 7: Add loading, stale, error, and no-results states**

No-results copy identifies the active filters and provides `Reset filters`. Initial request errors provide `Retry`. Background failures retain the previous charts and show the shared stale notice.

- [ ] **Step 8: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/workspaces/analytics-page.component.* \
  frontend/src/app/workspaces/workspace-base.css \
  frontend/src/app/workspaces/workspace-responsive.css \
  frontend/src/app/shared/operational/operational-filter-bar.component.*
git commit -m "feat(frontend): connect operational analytics"
```

---

### Task 13: Rebuild Team Operations with real workloads and navigational advisories

**Files:**
- Modify: `frontend/src/app/workspaces/team-operations-page.component.ts`
- Create: `frontend/src/app/workspaces/team-operations-page.component.html`
- Create: `frontend/src/app/workspaces/team-operations-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-team.css`
- Modify: `frontend/src/app/workspaces/workspace-responsive.css`

**Interfaces:**
- Team page reads `OperationalDataStore.team()`.
- Advisory actions are router links with backend-provided paths/query parameters.
- Countdown values are computed from real deadlines using one shared `now` signal updated once per second only while visible.

- [ ] **Step 1: Write failing workload, advisory, and countdown tests**

```ts
it('renders backend workload and capacity values', () => {
  store.team.set(resource(snapshot));
  fixture.detectChanges();
  expect(textForTeam('Claims Operations')).toContain('12 of 18 active');
});

it('advisory action navigates instead of mutating staffing', () => {
  const link = advisoryLink('SLA pressure');
  expect(link.getAttribute('href')).toContain('/app/claims');
  expect(fixture.nativeElement.querySelector('button[data-action="apply"]')).toBeNull();
});
```

- [ ] **Step 2: Run Team Operations tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/team-operations-page.component.spec.ts'
```

- [ ] **Step 3: Replace static arrays with snapshot signals**

Render backend KPIs, team workloads, adjuster workloads, escalations, advisories, and integrity inputs. Remove shift planner, fake performance sparklines, fake heatmap, and all static names/counts not returned by the API.

- [ ] **Step 4: Add real SLA timing behavior**

```ts
readonly now = signal(Date.now());
private startClock(): void {
  this.clockId = window.setInterval(() => {
    if (document.visibilityState === 'visible') this.now.set(Date.now());
  }, 1_000);
}
```

Countdowns display from actual `slaDeadline`; they stop at `Overdue` rather than becoming negative. Reduced motion does not affect the clock value, only visual transitions.

- [ ] **Step 5: Make workload, escalation, and advisory surfaces navigational**

Each item links to canonical Claim Queue filters. Add visible focus states and exact `aria-label` text, for example `Open 4 overdue Claims Operations claims`.

- [ ] **Step 6: Add restrained live/risk motion**

Only SLA-risk dots and the current refresh indicator breathe. Capacity rings transition when values change. Whole cards remain still.

- [ ] **Step 7: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/workspaces/team-operations-page.component.* \
  frontend/src/app/workspaces/workspace-team.css \
  frontend/src/app/workspaces/workspace-responsive.css
git commit -m "feat(frontend): connect team operations data"
```

---

### Task 14: Convert Documents into Evidence Operations and clean deployed navigation

**Files:**
- Modify: `frontend/src/app/workspaces/documents-page.component.ts`
- Create: `frontend/src/app/workspaces/documents-page.component.html`
- Create: `frontend/src/app/workspaces/documents-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workspace-documents.css`
- Modify: `frontend/src/app/workspaces/workspace-responsive.css`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.ts`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.spec.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/tour/tour-step-registry.ts`

**Interfaces:**
- Route remains `/app/documents` for Adjuster.
- Reports and Settings routes may remain direct-access source placeholders, but no role navigation or tour step links to them.

- [ ] **Step 1: Write failing control-integrity and navigation tests**

```ts
it('does not render unsupported evidence capabilities', () => {
  fixture.detectChanges();
  const text = fixture.nativeElement.textContent;
  expect(text).not.toContain('OCR');
  expect(text).not.toContain('Storage');
  expect(text).not.toContain('Versions');
  expect(text).not.toContain('Bulk Actions');
  expect(text).not.toContain('Upload Documents');
  expect(text).not.toContain('Compose New Message');
});

it('hides Reports and Settings from every demo role', () => {
  for (const role of Object.values(DEMO_ROLES)) {
    expect(role.navigation.map(item => item.id)).not.toContain('reports');
    expect(role.navigation.map(item => item.id)).not.toContain('settings');
  }
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/documents-page.component.spec.ts' --include='src/app/core/demo-role/*.spec.ts'
```

- [ ] **Step 3: Rebuild the workspace around the Evidence Operations snapshot**

Layout:
- Filter bar
- Claim/evidence result list
- Selected claim context
- Four evidence-category status cards
- Claimant-visible message timeline
- `Open authoritative Claim Workspace` link

The selected claim ID is stored in `selectedClaimId` URL query parameters so walkthrough links are reproducible.

- [ ] **Step 4: Remove unsupported UI and static fixture data**

Delete fake folder counts, storage meter, police report preview, OCR tags, confidence scores, version tabs, collaborative comments, bulk actions, upload controls, email/SMS stream, and AI summary. Remove corresponding fixture arrays from `WorkspaceDataService`; delete the service entirely only after confirming no other component consumes it.

- [ ] **Step 5: Add functional filtering and selection behavior**

Changing filters calls `activateEvidence(filters, selectedClaimId)`. Selecting a result updates the query parameter and requests the detail. Empty results provide `Reset filters`; a missing selected claim falls back to the first filtered result.

- [ ] **Step 6: Remove Reports and Settings from role navigation and tour references**

Manager navigation ends with Team Operations, Adjuster navigation ends with Documents, and Administrator navigation contains only Workflow Automation. Keep the role-switching menu and contextual claim routes unchanged.

- [ ] **Step 7: Run tests and build**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/workspaces/documents-page.component.* \
  frontend/src/app/workspaces/workspace-documents.css \
  frontend/src/app/workspaces/workspace-responsive.css \
  frontend/src/app/core/demo-role \
  frontend/src/app/app.routes.ts \
  frontend/src/app/tour/tour-step-registry.ts
git commit -m "feat(frontend): replace documents fixtures with evidence operations"
```

---

### Task 15: Add end-to-end functional visual QA and control-integrity verification

**Files:**
- Create: `frontend/scripts/capture-operational-visual-qa.mjs`
- Modify: `.github/workflows/visual-qa.yml`
- Create: `frontend/src/app/core/operational-data/control-integrity.spec.ts`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Visual artifact contains initial and changed states at exact branch head.
- CI fails when a deployed role-navigation surface contains a known unsupported control label.

- [ ] **Step 1: Write a control-integrity test across deployed routes**

```ts
const forbiddenLabels = [
  'Upload Documents', 'Bulk Actions', 'Export Report',
  'Configure workspace', 'Activate workflow', 'Apply recommendation'
];

for (const route of deployedRoutes) {
  it(`${route} exposes no unsupported controls`, async () => {
    await navigate(route);
    const visibleText = fixture.nativeElement.textContent;
    forbiddenLabels.forEach(label => expect(visibleText).not.toContain(label));
  });
}
```

Where a control is intentionally disabled, test its exact explanatory copy rather than adding the label to the forbidden list.

- [ ] **Step 2: Add Playwright capture steps for functional state transitions**

The script must:

1. Reset the demo journey and record returned IDs.
2. Capture Manager Dashboard initial state.
3. Open the Adjuster claim and change evidence.
4. Wait for immediate store invalidation, then capture Manager Dashboard changed state.
5. Capture Analytics default and `region=WEST` filtered state.
6. Capture Team Operations default and `team=Claims Operations` filtered state.
7. Open an intervention link and capture the filtered Claim Queue.
8. Select evidence in Documents and capture the selected state.
9. Intercept one background Dashboard refresh with HTTP 503 and capture the stale state while prior data remains visible.
10. Capture desktop 1440×1180, mobile 390×844, and reduced-motion variants.

Use `page.emulateMedia({ reducedMotion: 'reduce' })` for reduced-motion captures.

- [ ] **Step 3: Update `visual-qa.yml` to seed the backend and execute the script**

```yaml
- name: Capture operational employer journey
  run: node scripts/capture-operational-visual-qa.mjs
  working-directory: frontend
  env:
    BASE_URL: http://127.0.0.1:4200
    API_URL: http://127.0.0.1:8080
```

Validate every expected PNG exists and is nonempty before upload.

- [ ] **Step 4: Keep standard CI authoritative**

CI continues to run:

```bash
cd backend && mvn -q verify
cd frontend && npm run test:ci && npm run build
```

Add no separate “soft” job that can pass while these fail.

- [ ] **Step 5: Run local verification when the environment permits**

```bash
cd backend && mvn -q verify
cd ../frontend && npm ci && npm run test:ci && npm run build
```

Then start PostgreSQL, Spring Boot with `CLAIMSFLOW_DEMO_ENABLED=true`, and Angular, and run the visual script.

- [ ] **Step 6: Commit**

```bash
git add frontend/scripts frontend/src/app/core/operational-data/control-integrity.spec.ts \
  .github/workflows/visual-qa.yml .github/workflows/ci.yml
git commit -m "test: verify functional operational employer journey"
```

---

### Task 16: Update documentation, run final review, and prepare the PR

**Files:**
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Modify: `docs/superpowers/specs/2026-08-03-deployment-truthful-employer-mvp-design.md` only if implementation reveals a factual mismatch
- Modify: pull request #8 description

**Interfaces:**
- Documentation clearly separates real persisted behavior, deterministic demo data, local-only workflow simulation, and excluded production integrations.

- [ ] **Step 1: Update README capability boundaries**

Document:

- backend-derived Dashboard, Analytics, Team Operations, Queue, and Evidence Operations
- deterministic 48-claim historical demo dataset
- reserved golden-journey reset behavior
- immediate invalidation plus 45-second visible-tab polling
- supported filters
- reduced-motion behavior
- Reports/Settings hidden from deployed navigation
- Workflow Automation local-only boundary
- no binary uploads, OCR, email/SMS, payments, production auth, or autonomous decisions

- [ ] **Step 2: Rewrite the employer demo script around observable reactivity**

The walkthrough must explicitly perform:

1. Reset the reserved journey.
2. Show Manager Dashboard baseline.
3. Switch to Adjuster and update evidence or send a claimant-visible message.
4. Return to Manager and point out the changed KPI, signal field, queue row, Analytics, Team Operations, and Evidence Operations state.
5. Show one functional filter and URL-reproducible state.
6. Show Administrator local workflow simulation and its production boundary.
7. End on engineering proof: tests, reduced motion, deterministic data, and API ownership.

- [ ] **Step 3: Run the complete exact-head verification suite**

```bash
cd backend
mvn -q verify
cd ../frontend
npm run test:ci
npm run build
```

Trigger CI and Visual QA on the exact final commit. Record run IDs, conclusions, artifact ID, artifact digest, screenshot count, and head SHA.

- [ ] **Step 4: Perform the final code and product integrity review**

Search for and resolve every item:

```bash
rg -n "82%|1,389|4\.73M|621K|Upload Documents|Bulk Actions|Export Report|Configure workspace|TODO|TBD" frontend/src backend/src
rg -n "Reports|Settings" frontend/src/app/core/demo-role frontend/src/app/tour
```

Expected:
- no fixture KPI literals on deployed surfaces
- no unsupported controls on deployed surfaces
- no TODO/TBD placeholders in changed production files
- no Reports or Settings navigation/tour references

- [ ] **Step 5: Update PR #8 without merging**

The PR description must include:

- backend schema and deterministic seed architecture
- operational APIs and exact filter contract
- reactive store behavior
- state-driven motion and reduced motion
- truthful Documents replacement
- hidden placeholder navigation
- exact-head CI and Visual QA evidence
- explicit production boundaries

- [ ] **Step 6: Commit documentation**

```bash
git add README.md docs/demo-script.md docs/superpowers/specs/2026-08-03-deployment-truthful-employer-mvp-design.md
git commit -m "docs: document truthful employer demo experience"
```

- [ ] **Step 7: Final acceptance gate**

Do not report completion unless all thirteen design acceptance criteria are satisfied, CI and Visual QA succeed on the exact final head, the artifact has been manually inspected, and the PR remains unmerged unless the user explicitly requests merging.
