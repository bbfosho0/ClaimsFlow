# ClaimsFlow Role-Aware Golden Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ClaimsFlow into a role-aware internal claims platform with a separate claimant portal, one deterministic customer-to-operations demo journey, and premium motion and atmospheric effects implemented in the Angular application.

**Architecture:** Spring remains authoritative for claim creation, evidence completeness, priority, SLA, assignment, status transitions, recommendations, and audit history. Angular adds a presentation-only role model for Claims Manager, Adjuster, and Administrator, plus a separate claimant shell. A configuration-gated demo orchestrator resets only one reserved fictional claim and returns the actual claim and adjuster IDs required by the frontend. Premium effects use CSS/SVG first and one lazy native-WebGL Copilot orb with a non-blocking fallback.

**Tech Stack:** Angular 20.3 standalone components, TypeScript 5.8, signals, RxJS 7.8, Reactive Forms, HttpClient, CSS/SVG/native WebGL, Jasmine/Karma, Java 21, Spring Boot 3.5, Spring Data JPA, PostgreSQL 16, Flyway, JUnit 5, Mockito, MockMvc, Testcontainers, Docker Compose, GitHub Actions.

## Global Constraints

- Claims Manager is the default employer-facing role.
- Employee demo roles are exactly `manager`, `adjuster`, and `admin`.
- Demo-role routing is presentation behavior, not authentication or authorization.
- The claimant portal is a separate shell and is not an employee role.
- Manager navigation: Overview, Claim Queue, Analytics, AI Insights, Team Operations, Reports.
- Adjuster navigation: My Work, Claim Queue, Documents, Reports.
- Administrator navigation: Workflow Automation, Reports, Settings.
- Claim Workspace is contextual for Manager and Adjuster.
- New Claim is contextual and is not permanent employee navigation.
- Role resolution order: valid `role` query parameter, stored role, then `manager`.
- A disallowed route redirects to the active role’s default route and displays a concise ownership notice.
- The golden journey is deterministic, idempotent, resettable, and scoped only to `taylor.reed@example.com`.
- Demo reset is disabled by default and exists only when `CLAIMSFLOW_DEMO_ENABLED=true`.
- The portal records evidence metadata; it does not claim object-storage persistence.
- Claim messages are internal demo records; the product does not claim external email or SMS delivery.
- AI remains advisory and cannot approve, deny, pay, close, or reassign without explicit human action.
- Workflow Save and Validate are local; Activate remains disabled with truthful explanatory copy.
- Preserve Midnight Command v2 routes, visual tokens, responsive behavior, keyboard focus, skip links, and reduced-motion support.
- Do not add a component library, state-management library, Three.js, authentication dependency, messaging provider, or object-storage dependency.
- Do not use screenshots as UI backgrounds.
- WebGL is limited to the Copilot orb, dynamically imported, and never blocks rendering.
- Use test-first changes and commit each independently reviewable task.
- Do not claim visual parity without inspecting rendered screenshots from the exact final tree.

---

## File Map

### Frontend additions

```text
frontend/src/app/core/demo-role/
├── demo-role.model.ts
├── demo-role.service.ts
├── demo-role.service.spec.ts
├── demo-role-route.guard.ts
└── demo-role-route.guard.spec.ts

frontend/src/app/core/layout/role-switcher/
├── role-switcher.component.ts
├── role-switcher.component.html
├── role-switcher.component.css
└── role-switcher.component.spec.ts

frontend/src/app/core/layout/copilot-surface/
├── copilot-surface.component.ts
├── copilot-surface.component.html
├── copilot-surface.component.css
├── copilot-surface.component.spec.ts
└── copilot-orb.renderer.ts

frontend/src/app/portal/
├── models/portal.models.ts
├── data-access/portal-api.service.ts
├── data-access/portal-api.service.spec.ts
├── layout/claimant-shell.component.ts
├── layout/claimant-shell.component.html
├── layout/claimant-shell.component.css
├── layout/claimant-shell.component.spec.ts
├── home/portal-home-page.component.*
├── claim/portal-claim-page.component.*
├── documents/portal-documents-page.component.*
└── messages/portal-messages-page.component.*

frontend/src/app/demo/
├── demo-journey.models.ts
├── demo-journey.service.ts
├── demo-journey.service.spec.ts
├── demo-reset-dialog.component.ts
├── demo-reset-dialog.component.html
├── demo-reset-dialog.component.css
└── demo-reset-dialog.component.spec.ts
```

Every `component.*` group contains `.ts`, `.html`, `.css`, and `.spec.ts`.

### Backend additions

```text
backend/src/main/java/com/claimsflow/portal/
├── api/PortalController.java
├── api/PortalResponses.java
├── application/PortalApplicationService.java
├── domain/ClaimMessage.java
├── domain/EvidenceKind.java
└── persistence/ClaimMessageJpaRepository.java

backend/src/main/java/com/claimsflow/demo/
├── api/DemoController.java
├── api/DemoResponses.java
├── application/DemoJourneyService.java
└── config/DemoProperties.java

backend/src/main/resources/db/migration/
└── V2__claim_messages_and_demo_adjuster.sql
```

### Existing files modified

```text
frontend/src/app/app.routes.ts
frontend/src/app/core/layout/app-shell.component.ts
frontend/src/app/core/layout/app-shell.component.html
frontend/src/app/core/layout/app-shell.component.css
frontend/src/app/core/layout/app-shell.component.spec.ts
frontend/src/app/claims/data-access/claims-api.service.ts
frontend/src/app/claims/feature-create/new-claim-page.component.*
frontend/src/app/claims/feature-detail/claim-detail-page.component.*
frontend/src/app/workspaces/my-work-page.component.ts
frontend/src/app/workspaces/workflows-page.component.ts
frontend/src/app/workspaces/workspace-pages.component.spec.ts
frontend/src/app/tour/tour-step-registry.ts
frontend/src/app/tour/tour-orchestrator.service.ts
frontend/src/app/tour/tour-page.component.ts
frontend/src/styles.css
backend/src/main/java/com/claimsflow/claim/domain/Claim.java
backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java
backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java
backend/src/main/java/com/claimsflow/adjuster/application/AdjusterService.java
backend/src/main/java/com/claimsflow/adjuster/persistence/AdjusterJpaRepository.java
backend/src/main/resources/application.yml
backend/src/test/resources/application-test.yml
README.md
docs/demo-script.md
docs/design/claimsflow-final-mvp-handoff.md
.github/workflows/visual-qa.yml
```

---

## Task 1: Establish an isolated passing baseline

**Files:** read `AGENTS.md`, `README.md`, the approved spec, and this plan.

**Produces:** a clean worktree and recorded baseline test count.

- [ ] Create an isolated worktree:

```bash
git fetch origin
git worktree add ../ClaimsFlow-role-aware design/role-aware-claims-journey
cd ../ClaimsFlow-role-aware
git status --short
git log -1 --oneline
```

Expected: clean status on `design/role-aware-claims-journey`.

- [ ] Verify required tools:

```bash
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
google-chrome --version || chromium --version || chromium-browser --version
```

Expected: Java 21, Maven 3.9+, Node 22+, npm 10+, Docker Compose, Chrome or Chromium.

- [ ] Verify backend:

```bash
cd backend
mvn verify
```

Expected: PASS.

- [ ] Verify frontend:

```bash
cd ../frontend
npm ci
npm run test:ci
npm run build
```

Expected: existing tests and build pass. Record the test count outside the repository.

- [ ] Do not commit baseline-only work.

---

## Task 2: Add the typed demo-role model and service

**Files:** create `frontend/src/app/core/demo-role/demo-role.model.ts`, `demo-role.service.ts`, and `demo-role.service.spec.ts`.

**Produces:**

```ts
export type DemoRoleId = 'manager' | 'adjuster' | 'admin';

export interface DemoNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface DemoRoleDefinition {
  readonly id: DemoRoleId;
  readonly label: string;
  readonly personaName: string;
  readonly personaTitle: string;
  readonly initials: string;
  readonly defaultRoute: string;
  readonly navigation: readonly DemoNavigationItem[];
  readonly contextualPrefixes: readonly string[];
}
```

- [ ] Write failing parsing tests:

```ts
expect(parseDemoRole('manager')).toBe('manager');
expect(parseDemoRole('adjuster')).toBe('adjuster');
expect(parseDemoRole('admin')).toBe('admin');
expect(parseDemoRole('claimant')).toBeNull();
expect(parseDemoRole(null)).toBeNull();
```

- [ ] Write failing navigation tests:

```ts
expect(DEMO_ROLES.manager.navigation.map(item => item.label)).toEqual([
  'Overview', 'Claim Queue', 'Analytics', 'AI Insights', 'Team Operations', 'Reports',
]);
expect(DEMO_ROLES.adjuster.navigation.map(item => item.label)).toEqual([
  'My Work', 'Claim Queue', 'Documents', 'Reports',
]);
expect(DEMO_ROLES.admin.navigation.map(item => item.label)).toEqual([
  'Workflow Automation', 'Reports', 'Settings',
]);
```

- [ ] Write query/storage precedence tests with a fake `Storage`: valid query wins; valid stored value is second; invalid values and storage exceptions fall back to Manager.

- [ ] Run and confirm failure:

```bash
cd frontend
npm run test:ci -- --include='src/app/core/demo-role/demo-role.service.spec.ts'
```

- [ ] Implement `DEMO_ROLES` using:

```ts
manager: { personaName: 'Alex Morgan', personaTitle: 'Claims Manager', initials: 'AM', defaultRoute: '/app/dashboard' }
adjuster: { personaName: 'Jordan Lee', personaTitle: 'Senior Adjuster', initials: 'JL', defaultRoute: '/app/my-work' }
admin: { personaName: 'Priya Shah', personaTitle: 'Platform Administrator', initials: 'PS', defaultRoute: '/app/workflows' }
```

- [ ] Implement service signals:

```ts
readonly role: Signal<DemoRoleId>;
readonly definition: Signal<DemoRoleDefinition>;
readonly navigation: Signal<readonly DemoNavigationItem[]>;
switchRole(role: DemoRoleId): Promise<boolean>;
recordBlockedRoute(owner: DemoRoleId): void;
consumeNotice(): string | null;
```

Use storage key `claimsflow.demoRole`. All storage access is inside `try/catch`.

- [ ] `switchRole` navigates to the selected role’s default route with `{ queryParams: { role } }` and stores the role only after parsing it.

- [ ] Run focused test and commit:

```bash
npm run test:ci -- --include='src/app/core/demo-role/demo-role.service.spec.ts'
git add frontend/src/app/core/demo-role
git commit -m "feat(frontend): add demo role state"
```

---

## Task 3: Add presentation-only route ownership

**Files:** create `demo-role-route.guard.ts`, `demo-role-route.guard.spec.ts`; modify `frontend/src/app/app.routes.ts`; create or modify `app.routes.spec.ts`.

**Produces:**

```ts
export const demoRoleRouteGuard: CanActivateFn;
```

Route data key:

```ts
allowedDemoRoles: readonly DemoRoleId[];
```

- [ ] Write guard tests with a fake service, not a production test helper:

```ts
const activeRole = signal<DemoRoleId>('manager');
const fakeRoleService = {
  definition: computed(() => DEMO_ROLES[activeRole()]),
  recordBlockedRoute: jasmine.createSpy('recordBlockedRoute'),
};
```

Assert Manager may open Analytics; Adjuster is redirected from Analytics to `/app/my-work?role=adjuster`; Administrator is redirected from Claim Workspace; Manager and Adjuster may open `/app/claims/:id`.

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/core/demo-role/demo-role-route.guard.spec.ts'
```

- [ ] Add exact ownership metadata:

```text
Manager only: dashboard, analytics, intelligence, team-ops
Adjuster only: my-work, documents
Manager + Adjuster: claims, claims/new, claims/:id, reports
Administrator only: workflows, settings
```

- [ ] Guard behavior:

```ts
roleService.recordBlockedRoute(route.data['allowedDemoRoles'][0]);
return router.createUrlTree([roleService.definition().defaultRoute], {
  queryParams: { role: roleService.definition().id },
});
```

- [ ] Run route/guard tests and commit:

```bash
npm run test:ci -- --include='src/app/core/demo-role/*.spec.ts' --include='src/app/app.routes.spec.ts'
git add frontend/src/app/core/demo-role frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts
git commit -m "feat(frontend): add role-owned demo routes"
```

---

## Task 4: Build the accessible profile-menu role switcher and role-filtered shell

**Files:** create `frontend/src/app/core/layout/role-switcher/*`; modify `app-shell.component.ts/html/css/spec.ts`.

**Consumes:** `DemoRoleService`.

**Produces:** `<app-role-switcher>` with outputs `openClaimantPortal` and `resetDemoJourney`.

- [ ] Write failing component tests for visible `Demo Role`, all three employee roles, `Open Claimant Portal`, and `Reset Demo Journey`.

- [ ] Test keyboard behavior: Enter opens, ArrowDown moves, Enter selects, Escape closes, and focus returns to trigger.

- [ ] Update shell tests first:

```text
Manager: six permanent links and Alex Morgan
Adjuster: four permanent links and Jordan Lee
Administrator: three permanent links and Priya Shah
```

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts' --include='src/app/core/layout/app-shell.component.spec.ts'
```

- [ ] Implement a button with `aria-haspopup="menu"`, `aria-expanded`, and menu choices using `role="menuitemradio"` and `aria-checked`.

- [ ] Remove the shell’s hard-coded universal navigation and expose:

```ts
readonly navigation = this.demoRole.navigation;
readonly operator = this.demoRole.definition;
readonly roleNotice = signal<string | null>(null);
```

- [ ] Render a visible `DEMO ROLE` badge and a dismissible `role="status"` notice after redirects.

- [ ] Mobile shows up to four role destinations plus More only when needed.

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/core/layout/**/*.spec.ts' --include='src/app/core/demo-role/*.spec.ts'
npm run build
git add frontend/src/app/core/layout frontend/src/app/core/demo-role
git commit -m "feat(frontend): add role-aware employee shell"
```

---

## Task 5: Add claimant evidence mutation through existing domain policies

**Files:** create `portal/domain/EvidenceKind.java`, `portal/application/PortalApplicationService.java`, `portal/api/PortalResponses.java`, `portal/api/PortalController.java`, their tests; modify `Claim.java`, `ClaimApplicationService.java`, and `ClaimJpaRepository.java`.

**Produces:**

```java
public enum EvidenceKind {
    INCIDENT_REPORT, PHOTOS, PROOF_OF_OWNERSHIP, MEDICAL_DOCUMENTATION
}

public Claim updateEvidence(UUID claimId, EvidenceKind kind, boolean present, String actor)
```

API:

```text
GET   /api/portal/claims/{claimId}
PATCH /api/portal/claims/{claimId}/evidence
```

- [ ] Write a service test: update `PHOTOS` from false to true and assert evidence, completeness, priority, SLA, `updatedAt`, and `EVIDENCE_UPDATED` audit are recalculated.

- [ ] Write MockMvc contract tests:

```json
{"kind":"PHOTOS","present":true,"actor":"Taylor Reed"}
```

Expect 200, changed evidence, and updated completeness. Add 404 and invalid-kind Problem Details tests.

- [ ] Run and confirm failure:

```bash
cd backend
mvn -Dtest=PortalApplicationServiceTest,PortalControllerWebTest test
```

- [ ] Implement `Claim.updateEvidence(...)` as the only domain mutation. `ClaimApplicationService.updateEvidence` must call `CompletenessPolicy` and `PriorityPolicy`; it must not accept client-supplied completeness, priority, or SLA.

- [ ] Portal projection exposes only:

```java
UUID claimId;
String claimNumber;
String claimantName;
String claimType;
String status;
int completenessPercentage;
Instant slaDeadline;
PortalEvidence evidence;
List<PortalTimelineEvent> timeline;
String nextAction;
```

- [ ] Run and commit:

```bash
mvn -Dtest=PortalApplicationServiceTest,PortalControllerWebTest test
mvn verify
git add backend/src/main/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/portal backend/src/main/java/com/claimsflow/claim
git commit -m "feat(backend): add claimant evidence workflow"
```

---

## Task 6: Add bounded claimant messages and the reserved demo adjuster

**Files:** create `V2__claim_messages_and_demo_adjuster.sql`, `ClaimMessage.java`, `ClaimMessageJpaRepository.java`, tests; modify portal service/controller/responses and `SchemaIntegrationTest`.

**Produces:**

```text
GET  /api/portal/claims/{claimId}/messages
POST /api/claims/{claimId}/messages
```

- [ ] Write migration tests for `claim_messages` and `idx_claim_messages_claim_time`.

- [ ] Write service tests: `CLAIMANT` messages appear in portal results, `INTERNAL` messages do not, body length is 1–1200, and adding a message records `MESSAGE_ADDED`.

- [ ] Run and confirm failure:

```bash
mvn -Dtest=SchemaIntegrationTest,PortalMessageIntegrationTest test
```

- [ ] Migration content:

```sql
CREATE TABLE claim_messages (
    id UUID PRIMARY KEY,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    author VARCHAR(160) NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('CLAIMANT', 'INTERNAL')),
    body VARCHAR(1200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_claim_messages_claim_time
    ON claim_messages(claim_id, created_at ASC);

INSERT INTO adjusters (id, display_name, email, role, active, workload_capacity)
VALUES (
    '00000000-0000-0000-0000-0000000000a1',
    'Jordan Lee',
    'jordan.lee@example.com',
    'SENIOR_ADJUSTER',
    TRUE,
    18
)
ON CONFLICT (email) DO NOTHING;
```

- [ ] Employee request contract:

```java
public record CreateMessageRequest(
    @NotBlank @Size(max = 160) String author,
    @NotBlank @Pattern(regexp = "CLAIMANT|INTERNAL") String audience,
    @NotBlank @Size(max = 1200) String body) {}
```

- [ ] Run and commit:

```bash
mvn -Dtest=SchemaIntegrationTest,PortalMessageIntegrationTest test
mvn verify
git add backend/src/main/resources/db/migration/V2__claim_messages_and_demo_adjuster.sql backend/src/main/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/persistence/SchemaIntegrationTest.java
git commit -m "feat(backend): add claimant messages and demo adjuster"
```

---

## Task 7: Add the disabled-by-default deterministic demo reset

**Files:** create `backend/src/main/java/com/claimsflow/demo/*` and tests; modify claim and adjuster repositories/services plus application configuration.

**Produces:**

```text
POST /api/demo/reset
```

Response:

```java
public record DemoJourneySnapshot(
    UUID claimId,
    String claimNumber,
    UUID adjusterId,
    String claimantRoute,
    String adjusterRoute,
    String managerRoute,
    String administratorRoute) {}
```

- [ ] Write disabled test: with `claimsflow.demo.enabled=false`, `POST /api/demo/reset` returns 404 because the controller bean is absent.

- [ ] Write transaction tests with one reserved and one unrelated claim. Call reset twice and assert:

```text
exactly one taylor.reed@example.com claim
unrelated claim untouched
reserved claim PROPERTY / NEW
incident report present
photos absent
proof of ownership absent
assigned to jordan.lee@example.com
one claimant-visible welcome message
actual claimId and adjusterId returned
```

- [ ] Run and confirm failure:

```bash
mvn -Dtest=DemoJourneyServiceTransactionTest,DemoControllerWebTest test
```

- [ ] Configuration:

```java
@ConfigurationProperties(prefix = "claimsflow.demo")
public record DemoProperties(boolean enabled) {}
```

```yaml
claimsflow:
  demo:
    enabled: ${CLAIMSFLOW_DEMO_ENABLED:false}
```

`application-test.yml` sets true except the explicit disabled test.

- [ ] Add exact repository operations:

```java
List<Claim> findAllByClaimantEmail(String email);

@Modifying
@Query("delete from Claim c where c.claimantEmail = :email")
int deleteByClaimantEmail(@Param("email") String email);
```

Database `ON DELETE CASCADE` removes only child rows of the reserved claims. Do not call `deleteAll()`.

- [ ] `DemoJourneyService.reset()` is one `@Transactional` method:

```text
find reserved claims
bulk-delete by exact email
flush
create baseline through ClaimApplicationService.create
resolve Jordan by jordan.lee@example.com
assign through ClaimApplicationService.assign
add claimant-visible welcome message
return actual claimId and adjusterId
```

- [ ] Run and commit:

```bash
mvn -Dtest=DemoJourneyServiceTransactionTest,DemoControllerWebTest test
mvn verify
git add backend/src/main/java/com/claimsflow/demo backend/src/test/java/com/claimsflow/demo backend/src/main/java/com/claimsflow/claim backend/src/main/java/com/claimsflow/adjuster backend/src/main/resources/application.yml backend/src/test/resources/application-test.yml
git commit -m "feat(backend): add scoped demo reset"
```

---

## Task 8: Add the claimant portal shell and typed client

**Files:** create portal models, API service/spec, claimant shell/spec; modify routes and route tests.

**Produces:**

```ts
export type EvidenceKind = 'INCIDENT_REPORT' | 'PHOTOS' | 'PROOF_OF_OWNERSHIP' | 'MEDICAL_DOCUMENTATION';

export interface PortalClaim {
  claimId: string;
  claimNumber: string;
  claimantName: string;
  claimType: string;
  status: string;
  completenessPercentage: number;
  slaDeadline: string;
  evidence: PortalEvidence;
  timeline: readonly PortalTimelineEvent[];
  nextAction: string;
}
```

Routes:

```text
/portal
/portal/claims/new
/portal/claims/:id
/portal/claims/:id/documents
/portal/claims/:id/messages
```

- [ ] Write `HttpTestingController` tests for exact GET/PATCH URLs and evidence body:

```ts
{ kind: 'PHOTOS', present: true, actor: 'Taylor Reed' }
```

- [ ] Write shell tests: exactly My Claim, Documents, Messages, Help; no employee role controls; skip link and active `aria-current` exist.

- [ ] Run and confirm failure:

```bash
cd frontend
npm run test:ci -- --include='src/app/portal/**/*.spec.ts'
```

- [ ] Implement the claimant shell outside `AppShellComponent`. Use larger body text, fewer simultaneous panels, plain-language next actions, and the shared dark brand tokens.

- [ ] Portal routes do not use `demoRoleRouteGuard`.

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/app.routes.spec.ts'
npm run build
git add frontend/src/app/portal frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts
git commit -m "feat(frontend): add claimant portal shell"
```

---

## Task 9: Implement claimant home, claim status, evidence, and messages

**Files:** create portal page component groups; modify New Claim component for portal context.

- [ ] Write loading, success, empty, and error tests for every portal page.

- [ ] Documents test: successful PHOTOS update refreshes completeness and announces `Photos added to the claim.`

- [ ] Intake test: portal-mode success navigates to `/portal/claims/{id}` and retains the existing typed create request.

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
```

- [ ] Portal home reads `claimsflow.demoClaimId` from session storage. When present, show `Resume demo claim`; when absent, show `Start a claim`.

- [ ] Claim page displays status, progress, SLA expectation, next action, and human-readable timeline. It does not expose internal policy rationale.

- [ ] Evidence copy is exactly `Add evidence` and `Recorded for this demo`; it never says the binary file is permanently stored.

- [ ] Messages empty state: `No messages yet. Updates from your claims team will appear here.`

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
npm run build
git add frontend/src/app/portal frontend/src/app/claims/feature-create
git commit -m "feat(frontend): implement claimant journey"
```

---

## Task 10: Add frontend reset orchestration

**Files:** create `frontend/src/app/demo/*`; connect role switcher.

**Produces:**

```ts
export interface DemoJourneySnapshot {
  claimId: string;
  claimNumber: string;
  adjusterId: string;
  claimantRoute: string;
  adjusterRoute: string;
  managerRoute: string;
  administratorRoute: string;
}
```

- [ ] Service test: `POST /api/demo/reset`; no success before HTTP completion; on success store:

```text
claimsflow.demoClaimId
claimsflow.demoAdjusterId
```

in session storage.

- [ ] Dialog test exact confirmation copy:

`Reset only the reserved ClaimsFlow demo journey? Other claims will not be changed.`

Cancel calls nothing; Reset calls once; loading disables actions; failure leaves dialog open.

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/demo/*.spec.ts' --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts'
```

- [ ] Implement reset success sequence: store IDs, switch to Manager, close dialog, announce `Demo journey reset.`, navigate to `/tour`.

- [ ] Handle 404 with copy: `Demo reset is disabled. Start the backend with CLAIMSFLOW_DEMO_ENABLED=true.`

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/demo/*.spec.ts' --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts'
git add frontend/src/app/demo frontend/src/app/core/layout/role-switcher
git commit -m "feat(frontend): add demo reset orchestration"
```

---

## Task 11: Connect the Adjuster golden path

**Files:** modify Claims API client/spec, My Work page/spec, Claim Workspace files/spec.

**Produces:**

```ts
addMessage(
  claimId: string,
  request: { author: string; audience: 'CLAIMANT' | 'INTERNAL'; body: string },
): Observable<ClaimMessage>;
```

- [ ] API test exact endpoint: `POST /api/claims/{id}/messages`.

- [ ] My Work test reads `claimsflow.demoAdjusterId` and queries claims with `assignment=<actual UUID>`. Do not use unsupported values such as `mine`.

- [ ] Claim Workspace test: Jordan Lee enters a 1–1200 character claimant-visible message, reviews confirmation, submits, refreshes audit, and sees `Request sent to the claimant portal.`

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/claims/data-access/claims-api.service.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts' --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

- [ ] Replace the golden-path My Work card’s deterministic data with the real API claim. Retain secondary demo workload cards with visible `Demo workload` labeling.

- [ ] Adding a message does not auto-change claim status. Existing human-confirmed status and recommendation flows remain intact.

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/claims/**/*.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts'
npm run build
git add frontend/src/app/claims frontend/src/app/workspaces
git commit -m "feat(frontend): connect adjuster journey"
```

---

## Task 12: Connect Manager impact and Administrator explanation

**Files:** modify dashboard/queue/workflow page components and specs.

**Produces:**

```ts
export interface WorkflowSimulationInput {
  claimType: string;
  estimatedLoss: number;
  completenessPercentage: number;
  priority: string;
  status: string;
}
```

- [ ] Manager tests: reserved claim appears in Claim Queue; dashboard snapshot changes after reset/evidence/status operations; highlighted row uses real backend state.

- [ ] Workflow test: `Load demo claim` reads the stored claim ID, maps it to `WorkflowSimulationInput`, and runs existing local simulation.

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/claims/feature-queue/*.spec.ts' --include='src/app/workspaces/*.spec.ts'
```

- [ ] Add a subtle `Golden journey` badge only when the row matches the stored demo claim ID. Do not alter backend status or priority for presentation.

- [ ] Workflow control truthfulness:

```text
Save draft — local state only
Validate — local validation only
Activate — disabled
```

Disabled explanation: `Production workflow activation is not connected in this portfolio demo.`

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/claims/feature-queue/*.spec.ts' --include='src/app/workspaces/*.spec.ts'
npm run build
git add frontend/src/app/dashboard frontend/src/app/claims/feature-queue frontend/src/app/workspaces
git commit -m "feat(frontend): connect manager and admin journey"
```

---

## Task 13: Rewrite the guided tour around the five-role journey

**Files:** modify tour registry, orchestrator, page, and specs.

Required step IDs:

```ts
[
  'claimant-submission',
  'adjuster-review',
  'manager-impact',
  'admin-routing',
  'audit-proof',
]
```

- [ ] Write registry tests before implementation.

- [ ] Routes use actual snapshot IDs:

```ts
`/portal/claims/${claimId}`
`/app/claims/${claimId}?role=adjuster`
'/app/dashboard?role=manager'
'/app/workflows?role=admin'
`/app/claims/${claimId}?role=manager`
```

- [ ] First-step copy says the claimant resumes the prepared demo claim and submits missing evidence; it does not falsely imply reset itself was a user action.

- [ ] Every step contains business value, technical proof, and the human/AI authority boundary.

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/tour/*.spec.ts' --include='src/app/demo/*.spec.ts'
npm run build
git add frontend/src/app/tour frontend/src/app/demo
git commit -m "feat(frontend): focus tour on end-to-end claim journey"
```

---

## Task 14: Add premium motion and the bounded Copilot orb

**Files:** create `copilot-surface/*`; modify shell, global styles, and workspace styles.

**Produces:**

```ts
export class CopilotOrbRenderer {
  start(canvas: HTMLCanvasElement): void;
  stop(): void;
}
```

- [ ] Lifecycle tests: renderer starts only when reduced motion is false and WebGL succeeds; destroy stops it; failure keeps the CSS/SVG fallback visible.

- [ ] Reduced-motion tests: no continuous orb drift, chart reveal, workflow traversal, or critical pulse.

- [ ] Run and confirm failure:

```bash
npm run test:ci -- --include='src/app/core/layout/copilot-surface/*.spec.ts'
```

- [ ] Build CSS/SVG fallback first:

```html
<div class="copilot-orb-fallback" aria-hidden="true">
  <span class="orb-core"></span>
  <span class="orb-ring orb-ring-a"></span>
  <span class="orb-ring orb-ring-b"></span>
</div>
```

- [ ] Lazy-load native WebGL:

```ts
const { CopilotOrbRenderer } = await import('./copilot-orb.renderer');
```

Use one canvas, one vertex shader, one fragment shader, `requestAnimationFrame`, device-pixel ratio capped at 1.5, and pause while the document is hidden.

- [ ] Shared motion tokens:

```css
:root {
  --motion-fast: 140ms;
  --motion-standard: 220ms;
  --motion-emphasis: 300ms;
  --ease-out-premium: cubic-bezier(.2,.8,.2,1);
}
```

- [ ] Motion is limited to role-switch shell accent, route settle, active navigation, KPI value changes, chart reveal, claim selection, workflow traversal, one critical pulse, and Copilot response state.

- [ ] Run and commit:

```bash
npm run test:ci -- --include='src/app/core/layout/**/*.spec.ts'
npm run build
git add frontend/src/app/core/layout frontend/src/styles.css frontend/src/app/workspaces/*.css
git commit -m "feat(frontend): add premium motion and copilot orb"
```

---

## Task 15: Harden accessibility, responsive behavior, and Visual QA

**Files:** modify employee/claimant shells, page styles/specs, and `.github/workflows/visual-qa.yml`.

- [ ] Add tests for one `h1` per page, keyboard focus, role announcement, focus restoration, text labels in addition to status color, form labels, and working skip links.

- [ ] Add Visual QA captures:

```text
manager-dashboard-1440x1180.png
adjuster-my-work-1440x1180.png
admin-workflows-1440x1180.png
claimant-portal-1440x1180.png
claimant-portal-390x844.png
manager-dashboard-390x844.png
```

- [ ] Visual QA starts backend with `CLAIMSFLOW_DEMO_ENABLED=true`.

- [ ] Fail capture on horizontal overflow:

```js
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
if (overflow) throw new Error(`Horizontal overflow at ${page.url()}`);
```

Also fail on page errors and console `error` events.

- [ ] Desktop keeps approximately 216 px sidebar and 84 px top bar. Tablet uses an icon rail. Mobile uses no more than four role destinations plus More. Pointer targets are at least 44×44 px.

- [ ] Run and commit:

```bash
npm run test:ci
npm run build
git add frontend .github/workflows/visual-qa.yml
git commit -m "test(frontend): harden role-aware experience"
```

---

## Task 16: Verify the full journey and update documentation

**Files:** modify `README.md`, `docs/demo-script.md`, `docs/design/claimsflow-final-mvp-handoff.md`, and the approved spec status after evidence exists.

- [ ] Start PostgreSQL:

```bash
docker compose up -d db
docker compose ps
```

- [ ] Start backend with demo mode explicitly enabled:

```powershell
$env:CLAIMSFLOW_DEMO_ENABLED = 'true'
cd backend
mvn spring-boot:run
```

Bash equivalent:

```bash
CLAIMSFLOW_DEMO_ENABLED=true mvn -f backend/pom.xml spring-boot:run
```

- [ ] Start frontend:

```bash
cd frontend
npm ci
npm start
```

- [ ] Manually execute:

```text
reset reserved journey
claimant resumes claim and adds photos
adjuster opens assigned claim
adjuster adds claimant-visible request
adjuster performs one allowed status transition
manager verifies queue/dashboard impact
administrator loads claim into local simulation
manager verifies audit events
```

- [ ] Confirm browser console has no relevant errors or failed API requests.

- [ ] Backend verification:

```bash
cd backend
mvn verify
mvn package
```

- [ ] Frontend verification:

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

Test count must not be lower than baseline.

- [ ] Run local Visual QA, inspect every screenshot, and compare existing reference-driven screens against the approved ClaimsFlow images. Reject clipped content, role-inappropriate navigation, unclear active role, generic flat surfaces, excessive bloom, unsupported persistence claims, WebGL render blocking, or console errors.

- [ ] Update README with role matrix, portal routes, explicit demo toggle, reset scope, message/evidence limits, golden journey, and WebGL fallback.

- [ ] Rewrite `docs/demo-script.md` as a 60–90 second five-step interview walkthrough.

- [ ] Change the design spec status to `Implemented and verified` only after backend tests, frontend tests, builds, manual journey, and rendered QA pass on the same commit.

- [ ] Final hygiene:

```bash
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
```

- [ ] Commit docs:

```bash
git add README.md docs/demo-script.md docs/design/claimsflow-final-mvp-handoff.md docs/superpowers/specs/2026-08-02-role-aware-claims-journey-design.md
git commit -m "docs: document role-aware ClaimsFlow journey"
```

- [ ] Push and open a pull request. Do not merge until CI and Visual QA succeed for the exact PR head and the screenshots have been inspected.
