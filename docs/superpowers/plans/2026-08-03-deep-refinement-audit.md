# ClaimsFlow Deep Refinement Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine ClaimsFlow into a structurally cleaner, more truthful, better-tested, visually tighter, and more reliably verified employer portfolio application without changing its approved role-aware architecture or merging PR #8.

**Architecture:** Preserve the public route and API concepts while extracting shared operational filter, timing, resource-lifecycle, and metric-calculation boundaries. Correct ambiguous comparison semantics, remove deployable placeholder routes, strengthen visual and source audits, and finish with exact-head CI plus manual artifact inspection.

**Tech Stack:** Angular 20.3, TypeScript 5.8, RxJS 7.8, Jasmine/Karma, Java 21, Spring Boot 3.5, Spring Data JPA, JUnit 5, Mockito, PostgreSQL 16, Flyway, GitHub Actions, Node.js 22, Chrome DevTools Protocol.

## Global Constraints

- Preserve the claimant, adjuster, manager, and administrator product journey.
- Preserve the Midnight Command visual identity.
- Do not add WebSockets, authentication, object storage, OCR, external messaging, payments, or carrier integrations.
- Do not allow autonomous claim approval, denial, payment, closure, assignment, or workflow activation.
- Do not merge PR #8.
- Use injected `Clock` for backend operational time.
- Respect `prefers-reduced-motion` globally.
- Every completion claim requires exact-head automated verification and rendered inspection.
- Use test-driven changes and commit each independently reviewable task.

---

## Planned file structure

### Frontend operational boundaries

- Create `frontend/src/app/core/operational-data/operational-filter-codec.ts` — canonical route parsing, serialization, validation, and equality keys.
- Create `frontend/src/app/core/operational-data/operational-filter-codec.spec.ts` — codec boundary tests.
- Create `frontend/src/app/core/operational-data/operational-resource.controller.ts` — typed resource lifecycle state machine.
- Create `frontend/src/app/core/operational-data/operational-resource.controller.spec.ts` — loading, refresh, stale, success, and cancellation tests.
- Create `frontend/src/app/core/operational-data/operational-poll-coordinator.service.ts` — visibility-aware shared polling.
- Create `frontend/src/app/core/operational-data/operational-poll-coordinator.service.spec.ts` — poll start, stop, and resume tests.
- Create `frontend/src/app/core/operational-data/operational-clock.service.ts` — shared low-frequency operational clock.
- Create `frontend/src/app/core/operational-data/operational-clock.service.spec.ts` — cadence and visibility tests.
- Modify `frontend/src/app/core/operational-data/operational-data.models.ts` — shared empty options and truthful comparison types.
- Modify `frontend/src/app/core/operational-data/operational-data.store.ts` — facade over typed resource controllers and poll coordinator.
- Modify `frontend/src/app/core/operational-data/operational-data.store.spec.ts` — invalidation, cancellation, highlight, and stale-data coverage.

### Frontend routes and workspaces

- Modify `frontend/src/app/app.routes.ts` — remove deployable Reports and Settings routes.
- Modify `frontend/src/app/app.routes.spec.ts` — prove placeholder routes are unreachable.
- Modify `frontend/src/app/workspaces/analytics-page.component.ts` — consume codec and truthful comparison model.
- Modify `frontend/src/app/workspaces/analytics-page.component.html` — render finite, new, cleared, and unchanged comparison labels.
- Modify `frontend/src/app/workspaces/team-operations-page.component.ts` — consume shared codec and clock.
- Modify `frontend/src/app/workspaces/documents-page.component.ts` — consume shared codec and defaults.
- Modify `frontend/src/app/workspaces/workspace-pages.component.ts` — remove unused Reports and Settings exports when unreferenced.
- Modify `frontend/src/app/workspaces/placeholder-pages.component.ts` — delete or reduce to genuinely referenced source-only content.
- Modify workspace specs to assert route, filter, stale, empty, and comparison behavior.

### Backend operational boundaries

- Create `backend/src/main/java/com/claimsflow/operations/application/OperationalMetrics.java` — shared open-state, percentage, completeness, SLA, aging, and utilization calculations.
- Create `backend/src/main/java/com/claimsflow/operations/application/MetricChange.java` — truthful prior-period comparison value object.
- Create `backend/src/main/java/com/claimsflow/operations/application/OperationalFilterOptionsService.java` — one owned options provider.
- Create `backend/src/test/java/com/claimsflow/operations/application/OperationalMetricsTest.java` — calculation boundary tests.
- Create `backend/src/test/java/com/claimsflow/operations/application/MetricChangeTest.java` — zero-denominator and finite comparison tests.
- Modify `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsResponses.java` — expose `MetricChangeResponse` rather than ambiguous doubles.
- Modify `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java` — orchestrate shared calculations.
- Create `backend/src/test/java/com/claimsflow/analytics/application/AnalyticsServiceTest.java` — period, series, distribution, aging, and cohort tests.
- Modify `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java` — orchestrate shared calculations and explicit capacity semantics.
- Create `backend/src/test/java/com/claimsflow/team/application/TeamOperationsServiceTest.java` — SLA, capacity, advisories, and integrity tests.
- Modify `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java` only where tests expose clarity or efficiency defects.
- Create `backend/src/test/java/com/claimsflow/evidence/application/EvidenceOperationsServiceTest.java` — selection, filtering, and claimant-message projection tests.

### Verification and documentation

- Create `frontend/scripts/audit-deployed-source.mjs` — deterministic source-contract audit.
- Create `frontend/scripts/audit-deployed-source.test.mjs` — Node built-in test fixtures for audit rules.
- Modify `frontend/package.json` — add `audit:source` and `audit:source:test`.
- Create `frontend/scripts/visual-qa/cdp-client.mjs` — minimal CDP request and event client.
- Create `frontend/scripts/visual-qa/assertions.mjs` — route, DOM, console, network, image, and manifest assertions.
- Create `frontend/scripts/visual-qa/scenarios.mjs` — declarative 18-state journey.
- Modify `frontend/scripts/capture-operational-visual-qa.mjs` — orchestration only.
- Modify `.github/workflows/ci.yml` — run source audit tests and source audit.
- Modify `.github/workflows/visual-qa.yml` — upload manifest and enforce behavioral assertions.
- Modify `README.md` and `docs/demo-script.md` — final route and metric semantics.
- Create `docs/audits/2026-08-03-claimsflow-deep-refinement.md` — final findings and resolutions.
- Update PR #8 body only after exact-head verification.

---

### Task 1: Characterize and remove deployable placeholder routes

**Files:**
- Modify: `frontend/src/app/app.routes.spec.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/workspaces/workspace-pages.component.ts`
- Modify or delete: `frontend/src/app/workspaces/placeholder-pages.component.ts`
- Modify: `frontend/src/app/core/demo-role/demo-role.model.ts`
- Test: `frontend/src/app/core/layout/app-shell.component.spec.ts`

**Interfaces:**
- Consumes: existing `routes`, `demoRoleRouteGuard`, and role navigation definitions.
- Produces: a deployed route graph with no `/app/reports` or `/app/settings` component route and unchanged valid landing routes.

- [ ] **Step 1: Write failing route tests**

Add assertions that the app child routes contain no `reports` or `settings` path and that role navigation contains no matching destination.

```ts
it('does not expose source-only placeholder routes', () => {
  const app = routes.find(route => route.path === 'app');
  const paths = app?.children?.map(route => route.path) ?? [];
  expect(paths).not.toContain('reports');
  expect(paths).not.toContain('settings');
});
```

- [ ] **Step 2: Run the targeted tests and confirm failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/app.routes.spec.ts'
```

Expected: FAIL because both routes currently exist.

- [ ] **Step 3: Remove the routes and unused exports**

Delete the two route entries. Remove Reports and Settings exports only when no remaining source imports require them. Keep the wildcard route fallback unchanged.

- [ ] **Step 4: Add redirect behavior coverage**

Use `RouterTestingHarness` to prove direct placeholder URLs resolve through the wildcard fallback rather than rendering placeholder copy.

```ts
await harness.navigateByUrl('/app/reports');
expect(router.url).not.toBe('/app/reports');
```

- [ ] **Step 5: Run route and shell tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/app.routes.spec.ts' --include='src/app/core/layout/app-shell.component.spec.ts'
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts frontend/src/app/workspaces frontend/src/app/core/demo-role
 git commit -m "refactor: remove placeholder routes from deployed app"
```

---

### Task 2: Extract the canonical operational filter codec

**Files:**
- Create: `frontend/src/app/core/operational-data/operational-filter-codec.ts`
- Create: `frontend/src/app/core/operational-data/operational-filter-codec.spec.ts`
- Modify: `frontend/src/app/core/operational-data/operational-data.models.ts`
- Modify: `frontend/src/app/workspaces/analytics-page.component.ts`
- Modify: `frontend/src/app/workspaces/team-operations-page.component.ts`
- Modify: `frontend/src/app/workspaces/documents-page.component.ts`
- Modify: `frontend/src/app/shared/operational/operational-filter-bar.component.ts`

**Interfaces:**
- Produces:

```ts
export function parseOperationalFilters(params: Readonly<Record<string, unknown>>): OperationalFilters;
export function serializeOperationalFilters(filters: OperationalFilters): Record<string, string>;
export function operationalFilterKey(filters: OperationalFilters): string;
export const EMPTY_OPERATIONAL_FILTER_OPTIONS: OperationalFilterOptions;
```

- [ ] **Step 1: Write codec tests for validation and canonical order**

```ts
it('drops invalid enum values and creates a stable key', () => {
  const filters = parseOperationalFilters({ priority: 'IMPOSSIBLE', region: 'WEST', team: 'SIU' });
  expect(filters.priority).toBe('');
  expect(filters.region).toBe('WEST');
  expect(operationalFilterKey(filters)).toBe(
    'from=&to=&claimType=&priority=&status=&adjusterId=&team=SIU&region=WEST',
  );
});
```

Cover date strings, empty values, all allowed enums, ignored object/array values, and round-trip serialization.

- [ ] **Step 2: Run the new spec and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-filter-codec.spec.ts'
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the codec**

Use explicit readonly allowed-value arrays and ordered fields. Do not use `JSON.stringify` for equality.

```ts
const FILTER_FIELDS = [
  'from', 'to', 'claimType', 'priority', 'status', 'adjusterId', 'team', 'region',
] as const;

export function operationalFilterKey(filters: OperationalFilters): string {
  const params = new URLSearchParams();
  for (const field of FILTER_FIELDS) params.set(field, filters[field]);
  return params.toString();
}
```

- [ ] **Step 4: Replace page-to-page imports and duplicated empty options**

Analytics, Team Operations, and Evidence Operations must import from the codec/model boundary only.

- [ ] **Step 5: Update component tests**

Assert that route changes activate resources with parsed values and preserve `selectedClaimId` only in Evidence Operations.

- [ ] **Step 6: Run operational workspace tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/*.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts'
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/core/operational-data frontend/src/app/workspaces frontend/src/app/shared/operational
 git commit -m "refactor: centralize operational filter contracts"
```

---

### Task 3: Introduce the shared operational clock

**Files:**
- Create: `frontend/src/app/core/operational-data/operational-clock.service.ts`
- Create: `frontend/src/app/core/operational-data/operational-clock.service.spec.ts`
- Modify: `frontend/src/app/workspaces/team-operations-page.component.ts`
- Modify: `frontend/src/app/workspaces/workspace-pages.component.spec.ts`

**Interfaces:**
- Produces:

```ts
@Injectable({ providedIn: 'root' })
export class OperationalClockService {
  readonly now: Signal<number>;
}
```

The signal updates every 30 seconds while visible, stops while hidden, and refreshes immediately when visible again.

- [ ] **Step 1: Write fake-timer visibility tests**

```ts
it('pauses while hidden and refreshes immediately on visibility return', fakeAsync(() => {
  const initial = service.now();
  setVisibility('hidden');
  tick(60_000);
  expect(service.now()).toBe(initial);
  setVisibility('visible');
  expect(service.now()).toBeGreaterThan(initial);
}));
```

- [ ] **Step 2: Run the spec and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-clock.service.spec.ts'
```

- [ ] **Step 3: Implement one visibility-aware interval**

Use a signal, a 30-second timer, and a bound `visibilitychange` listener. Clear both in `ngOnDestroy`.

- [ ] **Step 4: Replace Team Operations page timer**

Remove the page-owned `setInterval` and bind countdown calculations to `clock.now()`.

- [ ] **Step 5: Run targeted tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-clock.service.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts'
```

Expected: PASS with no remaining one-second page timer.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/operational-data/operational-clock.service* frontend/src/app/workspaces
 git commit -m "refactor: share visibility-aware operational clock"
```

---

### Task 4: Type and decompose operational resource lifecycle

**Files:**
- Create: `frontend/src/app/core/operational-data/operational-resource.controller.ts`
- Create: `frontend/src/app/core/operational-data/operational-resource.controller.spec.ts`
- Create: `frontend/src/app/core/operational-data/operational-poll-coordinator.service.ts`
- Create: `frontend/src/app/core/operational-data/operational-poll-coordinator.service.spec.ts`
- Modify: `frontend/src/app/core/operational-data/operational-data.store.ts`
- Modify: `frontend/src/app/core/operational-data/operational-data.store.spec.ts`

**Interfaces:**
- Produces:

```ts
export class OperationalResourceController<T> {
  readonly state: Signal<OperationalResource<T>>;
  begin(background: boolean): void;
  succeed(value: T, updatedAt?: Date): void;
  fail(message: string): void;
  markClaimsChanged(ids: readonly string[]): void;
  clearClaimsChanged(ids: readonly string[]): void;
}

@Injectable({ providedIn: 'root' })
export class OperationalPollCoordinator {
  register(key: string, refresh: () => void): () => void;
}
```

- [ ] **Step 1: Write controller state-transition tests**

Cover initial load, background refresh preserving value, stale failure preserving value, foreground failure, success clearing stale state, and changed-ID deduplication.

- [ ] **Step 2: Write poll coordinator tests**

Cover one global timer, multiple active registrations, release, hidden-tab pause, and immediate visible-tab refresh.

- [ ] **Step 3: Run both specs and confirm failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/operational-resource.controller.spec.ts' --include='src/app/core/operational-data/operational-poll-coordinator.service.spec.ts'
```

- [ ] **Step 4: Implement the controller without `any`**

Use `WritableSignal<OperationalResource<T>>` internally and typed update functions.

- [ ] **Step 5: Implement the coordinator**

Maintain a `Map<string, () => void>`, one interval, and one visibility listener. Refresh callbacks only when visible.

- [ ] **Step 6: Refactor OperationalDataStore as a facade**

Keep public signals and activation methods stable. Replace `JSON.stringify` comparisons with `operationalFilterKey`. Replace repeated state-switch mutation with typed controllers.

Requests must remain cancellable:

```ts
private replaceRequest(family: OperationalFamily, request: Observable<unknown>): void {
  this.requests.get(family)?.unsubscribe();
  this.requests.set(family, request.subscribe(/* typed dispatch */));
}
```

Use typed overloads or family-specific private loaders rather than an `any` updater.

- [ ] **Step 7: Add stale-response and rapid-filter tests**

Activate Analytics with filter A, immediately activate filter B, emit A after B, and assert B remains the displayed snapshot.

- [ ] **Step 8: Run store tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/operational-data/*.spec.ts'
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/core/operational-data
 git commit -m "refactor: type operational resource lifecycle"
```

---

### Task 5: Centralize backend operational metrics

**Files:**
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalMetrics.java`
- Create: `backend/src/main/java/com/claimsflow/operations/application/MetricChange.java`
- Create: `backend/src/test/java/com/claimsflow/operations/application/OperationalMetricsTest.java`
- Create: `backend/src/test/java/com/claimsflow/operations/application/MetricChangeTest.java`

**Interfaces:**
- Produces:

```java
public final class OperationalMetrics {
    public static boolean isOpen(Claim claim);
    public static int percent(long numerator, long denominator);
    public static int averageCompleteness(List<Claim> claims);
    public static int slaCompliance(List<Claim> claims);
    public static SlaState slaState(Claim claim, Instant now);
    public static long ageDays(Claim claim, Instant now);
}

public record MetricChange(ChangeKind kind, Double percentage) {
    public enum ChangeKind { PERCENTAGE, NEW, CLEARED, UNCHANGED }
    public static MetricChange between(double current, double previous);
}
```

- [ ] **Step 1: Write calculation boundary tests**

```java
@Test
void percentReturnsZeroForZeroDenominator() {
    assertThat(OperationalMetrics.percent(4, 0)).isZero();
}

@Test
void metricChangeRepresentsNewValueWithoutInventingOneHundredPercent() {
    assertThat(MetricChange.between(5, 0))
        .isEqualTo(new MetricChange(ChangeKind.NEW, null));
}
```

Cover overdue at the exact instant, 24-hour risk boundary, resolved SLA compliance, empty completeness, finite positive/negative changes, cleared values, and unchanged zero.

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=OperationalMetricsTest,MetricChangeTest test
```

- [ ] **Step 3: Implement stateless helpers**

Use no repositories and no static wall-clock access. Require `Instant now` as an argument.

- [ ] **Step 4: Run tests**

```bash
cd backend
mvn -q -Dtest=OperationalMetricsTest,MetricChangeTest test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/claimsflow/operations backend/src/test/java/com/claimsflow/operations
 git commit -m "refactor: centralize operational metric semantics"
```

---

### Task 6: Refactor Analytics and truthful comparison rendering

**Files:**
- Modify: `backend/src/main/java/com/claimsflow/analytics/api/AnalyticsResponses.java`
- Modify: `backend/src/main/java/com/claimsflow/analytics/application/AnalyticsService.java`
- Create: `backend/src/test/java/com/claimsflow/analytics/application/AnalyticsServiceTest.java`
- Modify: `frontend/src/app/core/operational-data/operational-data.models.ts`
- Modify: `frontend/src/app/workspaces/analytics-page.component.ts`
- Modify: `frontend/src/app/workspaces/analytics-page.component.html`
- Modify: `frontend/src/app/workspaces/workspace-pages.component.spec.ts`

**Interfaces:**
- Backend response:

```java
public record MetricChangeResponse(String kind, Double percentage) {}

public record AnalyticsComparison(
    LocalDate previousFrom,
    LocalDate previousTo,
    long previousTotalClaims,
    BigDecimal previousEstimatedExposure,
    double previousAverageResolutionHours,
    MetricChangeResponse claimVolumeChange,
    MetricChangeResponse exposureChange,
    MetricChangeResponse resolutionTimeChange) {}
```

- Frontend model:

```ts
export interface MetricChange {
  readonly kind: 'PERCENTAGE' | 'NEW' | 'CLEARED' | 'UNCHANGED';
  readonly percentage: number | null;
}
```

- [ ] **Step 1: Write AnalyticsService tests**

Use a mocked `OperationalQueryService` and fixed Clock. Cover:

- inclusive current and prior periods;
- newly present totals;
- finite negative exposure change;
- average resolution hours;
- one-point time series;
- empty time series;
- all enum distribution keys;
- exact aging buckets;
- cohort resolution percentages.

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd backend
mvn -q -Dtest=AnalyticsServiceTest test
```

- [ ] **Step 3: Refactor AnalyticsService**

Use explicit imports, `OperationalMetrics`, and `MetricChange`. Keep the service responsible for period orchestration and response assembly.

- [ ] **Step 4: Update frontend comparison rendering**

Replace `signed(number)` with:

```ts
comparisonLabel(change: MetricChange, inverse = false): string {
  switch (change.kind) {
    case 'NEW': return 'New vs prior period';
    case 'CLEARED': return 'Cleared vs prior period';
    case 'UNCHANGED': return 'No change';
    case 'PERCENTAGE': return `${change.percentage! > 0 ? '+' : ''}${change.percentage!.toFixed(1)}% vs prior period`;
  }
}
```

Tone must account for inverse metrics such as resolution time.

- [ ] **Step 5: Add component tests for all comparison kinds**

Assert no rendered text contains `NaN`, `Infinity`, or fabricated `+100.0%` for a new metric.

- [ ] **Step 6: Run backend and frontend targeted tests**

```bash
cd backend && mvn -q -Dtest=AnalyticsServiceTest,OperationalMetricsTest,MetricChangeTest test
cd ../frontend && npm run test:ci -- --include='src/app/workspaces/workspace-pages.component.spec.ts'
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/analytics backend/src/test/java/com/claimsflow/analytics frontend/src/app/core/operational-data frontend/src/app/workspaces
 git commit -m "fix: make operational comparisons truthful"
```

---

### Task 7: Refactor Team Operations and strengthen evidence projection tests

**Files:**
- Create: `backend/src/main/java/com/claimsflow/operations/application/OperationalFilterOptionsService.java`
- Modify: `backend/src/main/java/com/claimsflow/operations/application/OperationalQueryService.java`
- Modify: `backend/src/main/java/com/claimsflow/team/application/TeamOperationsService.java`
- Create: `backend/src/test/java/com/claimsflow/team/application/TeamOperationsServiceTest.java`
- Create: `backend/src/test/java/com/claimsflow/evidence/application/EvidenceOperationsServiceTest.java`
- Modify: `backend/src/main/java/com/claimsflow/evidence/application/EvidenceOperationsService.java` only when required by failing tests.
- Modify: frontend KPI labels in Team Operations templates.

**Interfaces:**
- Produces:

```java
@Service
public class OperationalFilterOptionsService {
    public OperationalFilterOptions options();
}
```

`OperationalQueryService` remains responsible only for claim queries.

- [ ] **Step 1: Write TeamOperationsService tests**

Cover:

- capacity denominator from active adjusters in selected team/adjuster scope;
- filtered active workload numerator;
- utilization capping at 100;
- exact at-risk and overdue boundaries;
- assignment coverage;
- SLA compliance from resolved claims;
- integrity weighted score;
- critical, warning, ownership, evidence, and stable advisories;
- advisory query parameters.

- [ ] **Step 2: Write EvidenceOperationsService tests**

Cover:

- default selected claim;
- explicit selected claim;
- selected claim absent from filtered result;
- claimant-visible messages only;
- evidence category ordering and presence;
- adjuster/team projection;
- empty result.

- [ ] **Step 3: Run tests and confirm failures**

```bash
cd backend
mvn -q -Dtest=TeamOperationsServiceTest,EvidenceOperationsServiceTest test
```

- [ ] **Step 4: Extract options service and refactor Team Operations**

Remove wildcard imports. Replace repeated helpers with `OperationalMetrics`. Make labels and response fields explicitly describe selected workload versus available capacity.

- [ ] **Step 5: Apply minimal Evidence Operations fixes**

Do not add new capabilities. Fix only projection order, selection, query efficiency, or visibility defects demonstrated by tests.

- [ ] **Step 6: Update frontend labels**

Use precise copy such as `Selected workload utilization` and `Resolved-claim SLA compliance` where the denominator requires explanation.

- [ ] **Step 7: Run targeted backend and frontend tests**

```bash
cd backend && mvn -q -Dtest=TeamOperationsServiceTest,EvidenceOperationsServiceTest test
cd ../frontend && npm run test:ci -- --include='src/app/workspaces/workspace-pages.component.spec.ts'
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/claimsflow/operations backend/src/main/java/com/claimsflow/team backend/src/main/java/com/claimsflow/evidence backend/src/test/java/com/claimsflow/team backend/src/test/java/com/claimsflow/evidence frontend/src/app/workspaces
 git commit -m "refactor: clarify operational workload calculations"
```

---

### Task 8: Refine visual hierarchy, charts, states, and motion tokens

**Files:**
- Modify: `frontend/src/app/workspaces/analytics-page.component.html`
- Modify: `frontend/src/app/workspaces/team-operations-page.component.html`
- Modify: `frontend/src/app/workspaces/documents-page.component.html`
- Modify: `frontend/src/app/workspaces/operational-workspaces.css`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.html`
- Modify: `frontend/src/app/dashboard/dashboard-operational.css`
- Modify: `frontend/src/app/shared/operational/operational-refresh-status.component.ts`
- Modify: `frontend/src/operational-motion.css`
- Modify relevant component specs.

**Interfaces:**
- Consumes: unchanged snapshot and resource state interfaces.
- Produces: consistent employer-facing status regions, metric descriptions, chart summaries, and motion tokens.

- [ ] **Step 1: Add failing semantic-state tests**

Assert each workspace renders:

- one page-level heading;
- refresh age;
- stale message when `state.stale` is true;
- retry control for initial error;
- meaningful empty state;
- accessible chart summary or table;
- no unsupported action label.

- [ ] **Step 2: Run targeted workspace tests and record failures**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/workspace-pages.component.spec.ts' --include='src/app/dashboard/dashboard-page.component.spec.ts'
```

- [ ] **Step 3: Normalize information hierarchy**

Use shared workspace classes for eyebrow, title, description, refresh area, KPI grid, chart card, table card, state panel, and context note. Keep existing semantic colors.

- [ ] **Step 4: Harden chart edge cases**

Ensure one-point series centers correctly, empty datasets render a textual empty state, distribution bars use a minimum visible marker only when count is nonzero, and exact values appear in accessible summaries.

- [ ] **Step 5: Standardize motion tokens**

Define CSS custom properties:

```css
:root {
  --motion-fast: 160ms;
  --motion-standard: 220ms;
  --motion-emphasis: 280ms;
  --motion-ease: cubic-bezier(.2, .8, .2, 1);
}
```

Replace inconsistent durations in touched operational styles. Keep breathing only on live/risk selectors. Verify reduced-motion overrides remove all touched animation and transition behavior.

- [ ] **Step 6: Check mobile density**

At widths below 720px, stack filters, preserve 44px minimum control targets, prevent KPI truncation, allow tables to scroll with visible context, and keep chart labels readable.

- [ ] **Step 7: Run component tests and production build**

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/workspace-pages.component.spec.ts' --include='src/app/dashboard/dashboard-page.component.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/workspaces frontend/src/app/dashboard frontend/src/app/shared/operational frontend/src/operational-motion.css
 git commit -m "style: refine operational hierarchy and state feedback"
```

---

### Task 9: Add deterministic deployed-source audit

**Files:**
- Create: `frontend/scripts/audit-deployed-source.mjs`
- Create: `frontend/scripts/audit-deployed-source.test.mjs`
- Modify: `frontend/package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces commands:

```json
{
  "audit:source:test": "node --test scripts/audit-deployed-source.test.mjs",
  "audit:source": "node scripts/audit-deployed-source.mjs"
}
```

- [ ] **Step 1: Write Node test fixtures for every rule**

Use temporary directories and small fixture files. Verify the audit reports exact file, line, and rule for:

- placeholder route terms in deployable route source;
- page-to-page operational utility import;
- debug console call in `src/app`;
- direct `Instant.now`, `LocalDate.now`, or `System.currentTimeMillis` in backend operational packages;
- Reports or Settings in role navigation;
- prohibited marker comments.

Also verify allowlisted scripts and documentation do not fail.

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd frontend
node --test scripts/audit-deployed-source.test.mjs
```

- [ ] **Step 3: Implement explicit rules and allowlists**

The audit must print a deterministic summary and exit nonzero when findings exist.

```js
if (findings.length) {
  for (const finding of findings) console.error(`${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);
  process.exitCode = 1;
}
```

- [ ] **Step 4: Add package scripts and CI steps**

Run audit tests before the live repository audit in the frontend CI job.

- [ ] **Step 5: Run the audit locally through CI-compatible commands**

```bash
cd frontend
npm run audit:source:test
npm run audit:source
```

Expected: PASS with zero findings.

- [ ] **Step 6: Commit**

```bash
git add frontend/scripts/audit-deployed-source* frontend/package.json .github/workflows/ci.yml
 git commit -m "ci: audit deployed source contracts"
```

---

### Task 10: Harden the reactive visual QA harness

**Files:**
- Create: `frontend/scripts/visual-qa/cdp-client.mjs`
- Create: `frontend/scripts/visual-qa/assertions.mjs`
- Create: `frontend/scripts/visual-qa/scenarios.mjs`
- Modify: `frontend/scripts/capture-operational-visual-qa.mjs`
- Modify: `.github/workflows/visual-qa.yml`

**Interfaces:**
- `CdpClient.send(method, params)` and `CdpClient.close()`.
- Scenario shape:

```js
{
  name: 'analytics-west-filtered',
  filename: 'analytics-west-filtered-1440x1180.png',
  url: '/app/analytics?role=manager&region=WEST',
  expectedPath: '/app/analytics',
  requiredText: ['Operational Analytics', 'West'],
  forbiddenText: ['Loading operational analytics'],
}
```

- Manifest shape:

```json
{
  "claimId": "uuid",
  "screenshots": [{ "name": "...", "width": 1440, "height": 1180, "bytes": 12345 }],
  "consoleErrors": [],
  "unexpectedRequestFailures": []
}
```

- [ ] **Step 1: Extract the minimal CDP client**

Move request correlation and socket lifecycle only. Remove the unused `once`, listener map, and event removal code unless a new assertion explicitly requires events.

- [ ] **Step 2: Add console, exception, and request-failure collection**

Enable `Runtime`, `Log`, and `Network`. Fail at the end on any unexpected browser exception or failed API request. The stale-dashboard scenario may allow exactly the intentionally blocked dashboard URL.

- [ ] **Step 3: Convert screenshots to declarative scenarios**

Keep the approved 18 states. Add route-specific required text, expected path, viewport, and reduced-motion metadata.

- [ ] **Step 4: Add DOM assertions before capture**

Fail when:

- the final path is wrong;
- required text is missing;
- a fatal error panel is visible;
- initial loading never settles;
- the expected role shell is absent.

- [ ] **Step 5: Add image sanity and manifest output**

Validate returned PNG dimensions from the PNG header, minimum byte size, and nonidentical digests across obviously different scenarios. Write `visual-qa/manifest.json`.

- [ ] **Step 6: Define CI graphics behavior**

Replace ambiguous `--disable-gpu` behavior with a documented choice. Prefer software WebGL:

```bash
--use-gl=swiftshader
--enable-webgl
```

When the runner cannot provide WebGL, assert and record the static fallback rather than silently changing behavior.

- [ ] **Step 7: Update workflow validation and artifacts**

Validate 18 images plus the manifest. Upload both. Preserve browser, API, and Angular logs on failure.

- [ ] **Step 8: Commit**

```bash
git add frontend/scripts/capture-operational-visual-qa.mjs frontend/scripts/visual-qa .github/workflows/visual-qa.yml
 git commit -m "test: harden reactive visual QA evidence"
```

---

### Task 11: Run full verification and resolve exact-head failures

**Files:**
- Modify only files required by observed failures.

**Interfaces:**
- Produces one branch head on which CI and Visual QA both succeed.

- [ ] **Step 1: Run backend verification**

```bash
cd backend
mvn verify
```

Expected: PASS.

- [ ] **Step 2: Run frontend audit, tests, and build**

```bash
cd frontend
npm ci
npm run audit:source:test
npm run audit:source
npm run test:ci
npm run build
```

Expected: PASS.

- [ ] **Step 3: Push the checkpoint and read exact-head Actions results**

Confirm the workflow runs reference the current branch head rather than a prior commit or merge ref.

- [ ] **Step 4: Diagnose every failure from logs before editing**

Classify each failure as product defect, test defect, environment defect, or workflow defect. Make the smallest evidence-backed fix.

- [ ] **Step 5: Rerun until both workflows succeed on the same exact head**

Do not use a previous green run as final evidence.

- [ ] **Step 6: Download the final Visual QA artifact**

Record artifact ID, size, SHA-256 digest, run ID, and exact head.

- [ ] **Step 7: Manually inspect all rendered states**

Inspect desktop and mobile contact sheets plus baseline, mutation, filtered, stale, reduced-motion, claimant, adjuster, manager, and administrator captures.

Blocking visual findings include blank content, loading residue, clipped controls, unreadable labels, wrong role shell, stale placeholder copy, missing focus/state semantics, or visibly inconsistent hierarchy.

- [ ] **Step 8: Commit any final evidence-backed fixes and rerun exact-head verification**

Do not declare completion until the artifact from the new head is inspected.

---

### Task 12: Final documentation, audit report, and PR hygiene

**Files:**
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Create: `docs/audits/2026-08-03-claimsflow-deep-refinement.md`
- Update: PR #8 description through GitHub API.

**Interfaces:**
- Produces a final review package that matches the exact verified implementation.

- [ ] **Step 1: Write the audit report**

Use a finding table:

```markdown
| Severity | Finding | Resolution | Evidence |
| --- | --- | --- | --- |
| High | Prior-period zero denominator rendered as +100% | Added typed NEW/CLEARED/UNCHANGED semantics | Analytics service and component tests |
```

Include intentionally deferred items and deployment prerequisites.

- [ ] **Step 2: Update README and demo script**

Remove stale exact-head metadata from permanent docs. Confirm route lists exclude Reports and Settings. Explain comparison, capacity, SLA, and fallback semantics accurately.

- [ ] **Step 3: Run the source audit and documentation search**

```bash
cd frontend
npm run audit:source
cd ..
git grep -nE '2d491a6|0f99d3f|Reports Preview|Settings Preview' -- README.md docs frontend/src/app || true
```

Expected: no stale verification SHA or deployable preview copy outside historical specs/plans where context requires it.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md docs
 git commit -m "docs: publish final ClaimsFlow audit evidence"
```

- [ ] **Step 5: Verify the documentation commit exact head**

Because docs change the head, rerun or confirm required workflows execute and pass on this final commit. Download and inspect the final artifact when Visual QA reruns.

- [ ] **Step 6: Update PR #8 body**

Include:

- final product summary;
- architecture and audit refinements;
- authority and integration boundaries;
- exact final head;
- CI run ID and conclusion;
- Visual QA run ID and conclusion;
- artifact ID and digest;
- test totals when available;
- audit report path;
- known limitations;
- explicit `Open, review-ready, and unmerged` statement.

- [ ] **Step 7: Confirm PR state**

Verify:

```text
state = open
merged = false
mergeable = true or pending GitHub calculation
head_sha = exact verified head
```

Do not merge.
