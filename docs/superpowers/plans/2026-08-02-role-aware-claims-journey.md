# ClaimsFlow Role-Aware Golden Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ClaimsFlow into a role-aware internal claims platform with a separate claimant portal, one fully functional end-to-end demo journey, and premium motion and atmospheric effects implemented in the Angular application.

**Architecture:** Keep Spring authoritative for claim creation, deterministic triage, assignment, evidence completeness, status transitions, recommendations, and audit history. Add a presentation-only Angular demo-role boundary for Manager, Adjuster, and Administrator navigation, a separate claimant shell backed by narrow portal APIs, and a demo-only reset orchestrator scoped to reserved records. Preserve the Midnight Command visual system, then add restrained CSS/SVG motion and one lazy native-WebGL Copilot orb with a static fallback.

**Tech Stack:** Angular 20.3 standalone components, TypeScript 5.8, signals, RxJS 7.8, Reactive Forms, HttpClient, CSS/SVG/native WebGL, Jasmine/Karma, Java 21, Spring Boot 3.5, Spring Data JPA, PostgreSQL 16, Flyway, JUnit 5, Mockito, MockMvc, Testcontainers, Docker Compose, GitHub Actions.

## Global Constraints

- Claims Manager is the default employer-facing demo role.
- Employee roles are `manager`, `adjuster`, and `admin`; role switching is presentation-only and must never be described as authentication or authorization.
- The claimant portal is a separate shell and is not an employee demo role.
- Manager navigation: Overview, Claim Queue, Analytics, AI Insights, Team Operations, Reports.
- Adjuster navigation: My Work, Claim Queue, Documents, Reports.
- Administrator navigation: Workflow Automation, Reports, Settings.
- Claim Workspace is contextual for Manager and Adjuster; New Claim is a contextual employee action, not permanent navigation.
- The active role is resolved from a valid `role` query parameter, then local storage, then `manager`.
- A disallowed route redirects to the role default and explains which demo role owns the destination.
- The golden journey must be deterministic, resettable, and scoped only to reserved fictional demo records.
- Demo reset must be explicit, confirmed, idempotent, transactional, configuration-gated, and covered by backend tests.
- The claimant portal may stage evidence metadata but must not claim object-storage persistence.
- Messages may be demo records but must not claim delivery through an external provider.
- Spring remains authoritative for completeness, priority, SLA, status transitions, recommendation review, and audit history.
- AI remains advisory and cannot approve, deny, pay, close, or reassign a claim without explicit human action.
- Workflow Save, Validate, and Activate remain visually honest; only local simulation is implemented unless a server contract is added in this plan.
- Preserve the approved Midnight Command palette, route content, responsive behavior, keyboard focus, skip link, and reduced-motion support.
- Use CSS, SVG, and browser-native APIs before WebGL; WebGL is limited to the Copilot orb and must lazy-load with a non-blocking fallback.
- Do not add a component library, state-management library, Three.js, authentication package, messaging provider, or object-storage dependency.
- Do not use screenshots as UI backgrounds.
- Do not commit credentials, build output, browser traces, prompt logs, temporary screenshots, local database volumes, `node_modules`, or `target`.
- Use test-first changes and commit each independently reviewable task.
- Do not state that visual parity passed without rendered screenshots from the exact final tree.

---

## File Structure

### Demo-role boundary

```text
frontend/src/app/core/demo-role/
├── demo-role.model.ts
├── demo-role.service.ts
├── demo-role.service.spec.ts
├── demo-role-route.guard.ts
└── demo-role-route.guard.spec.ts
```

- `demo-role.model.ts` owns role IDs, persona copy, default routes, permanent navigation, contextual route families, and role parsing.
- `demo-role.service.ts` owns query-string/local-storage resolution, current-role state, role switching, and notice state.
- `demo-role-route.guard.ts` owns presentation redirects only; it is not a security boundary.

### Employee shell additions

```text
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
```

The existing `AppShellComponent` remains the employee shell and consumes these focused components.

### Claimant portal

```text
frontend/src/app/portal/
├── data-access/
│   ├── portal-api.service.ts
│   └── portal-api.service.spec.ts
├── models/
│   └── portal.models.ts
├── layout/
│   ├── claimant-shell.component.ts
│   ├── claimant-shell.component.html
│   ├── claimant-shell.component.css
│   └── claimant-shell.component.spec.ts
├── home/
│   ├── portal-home-page.component.ts
│   ├── portal-home-page.component.html
│   ├── portal-home-page.component.css
│   └── portal-home-page.component.spec.ts
├── claim/
│   ├── portal-claim-page.component.ts
│   ├── portal-claim-page.component.html
│   ├── portal-claim-page.component.css
│   └── portal-claim-page.component.spec.ts
├── documents/
│   ├── portal-documents-page.component.ts
│   ├── portal-documents-page.component.html
│   ├── portal-documents-page.component.css
│   └── portal-documents-page.component.spec.ts
└── messages/
    ├── portal-messages-page.component.ts
    ├── portal-messages-page.component.html
    ├── portal-messages-page.component.css
    └── portal-messages-page.component.spec.ts
```

### Demo journey orchestration

```text
frontend/src/app/demo/
├── demo-journey.models.ts
├── demo-journey.service.ts
├── demo-journey.service.spec.ts
├── demo-reset-dialog.component.ts
├── demo-reset-dialog.component.html
├── demo-reset-dialog.component.css
└── demo-reset-dialog.component.spec.ts
```

### Backend demo and portal boundaries

```text
backend/src/main/java/com/claimsflow/demo/
├── api/DemoController.java
├── api/DemoResponses.java
├── application/DemoJourneyService.java
└── config/DemoProperties.java

backend/src/main/java/com/claimsflow/portal/
├── api/PortalController.java
├── api/PortalResponses.java
├── application/PortalApplicationService.java
├── domain/ClaimMessage.java
├── domain/EvidenceKind.java
└── persistence/ClaimMessageJpaRepository.java

backend/src/main/resources/db/migration/
└── V2__claim_messages.sql
```

### Existing files modified across tasks

```text
frontend/src/app/app.routes.ts
frontend/src/app/core/layout/app-shell.component.ts
frontend/src/app/core/layout/app-shell.component.html
frontend/src/app/core/layout/app-shell.component.css
frontend/src/app/core/layout/app-shell.component.spec.ts
frontend/src/app/workspaces/workspace-pages.component.ts
frontend/src/app/workspaces/workspace-pages.component.spec.ts
frontend/src/app/claims/data-access/claims-api.service.ts
frontend/src/app/claims/feature-detail/claim-detail-page.component.ts
frontend/src/app/claims/feature-detail/claim-detail-page.component.html
frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts
frontend/src/app/tour/tour-step-registry.ts
frontend/src/app/tour/tour-orchestrator.service.ts
frontend/src/app/tour/tour-page.component.ts
frontend/src/styles.css
backend/src/main/java/com/claimsflow/claim/api/ClaimController.java
backend/src/main/java/com/claimsflow/claim/api/ClaimResponses.java
backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java
backend/src/main/java/com/claimsflow/claim/domain/Claim.java
backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java
backend/src/main/java/com/claimsflow/audit/application/AuditService.java
backend/src/main/resources/application.yml
backend/src/test/resources/application-test.yml
docs/demo-script.md
README.md
.github/workflows/visual-qa.yml
```

---

### Task 1: Establish a clean execution baseline in an isolated worktree

**Files:**
- Read: `AGENTS.md`
- Read: `README.md`
- Read: `docs/superpowers/specs/2026-08-02-role-aware-claims-journey-design.md`
- Read: `docs/superpowers/plans/2026-08-02-role-aware-claims-journey.md`

**Interfaces:**
- Consumes: branch `design/role-aware-claims-journey`.
- Produces: isolated worktree with a recorded passing baseline and no unrelated edits.

- [ ] **Step 1: Create the execution worktree**

```bash
git fetch origin
git worktree add ../ClaimsFlow-role-aware design/role-aware-claims-journey
cd ../ClaimsFlow-role-aware
git status --short
git log -1 --oneline
```

Expected: clean status and branch head containing this plan.

- [ ] **Step 2: Verify local toolchain**

```bash
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
google-chrome --version || chromium --version || chromium-browser --version
```

Expected: Java 21, Maven 3.9+, Node 22+, npm 10+, Docker Compose, and Chrome/Chromium.

- [ ] **Step 3: Run the baseline backend suite**

```bash
cd backend
mvn verify
```

Expected: PASS.

- [ ] **Step 4: Run the baseline frontend suite and build**

```bash
cd ../frontend
npm ci
npm run test:ci
npm run build
```

Expected: all existing tests pass and the production build succeeds. Record the current test count in the execution notes.

- [ ] **Step 5: Do not commit baseline-only work**

No repository files should change during this task.

---

### Task 2: Add the typed demo-role model and persistence service

**Files:**
- Create: `frontend/src/app/core/demo-role/demo-role.model.ts`
- Create: `frontend/src/app/core/demo-role/demo-role.service.ts`
- Create: `frontend/src/app/core/demo-role/demo-role.service.spec.ts`

**Interfaces:**
- Produces:
  - `type DemoRoleId = 'manager' | 'adjuster' | 'admin'`
  - `interface DemoNavigationItem`
  - `interface DemoRoleDefinition`
  - `DEMO_ROLES: Record<DemoRoleId, DemoRoleDefinition>`
  - `parseDemoRole(value: string | null): DemoRoleId | null`
  - `DemoRoleService.role: Signal<DemoRoleId>`
  - `DemoRoleService.definition: Signal<DemoRoleDefinition>`
  - `DemoRoleService.navigation: Signal<readonly DemoNavigationItem[]>`
  - `DemoRoleService.switchRole(role: DemoRoleId): Promise<boolean>`
  - `DemoRoleService.consumeNotice(): string | null`

- [ ] **Step 1: Write parsing and role-definition tests**

```ts
it('parses only supported role ids', () => {
  expect(parseDemoRole('manager')).toBe('manager');
  expect(parseDemoRole('adjuster')).toBe('adjuster');
  expect(parseDemoRole('admin')).toBe('admin');
  expect(parseDemoRole('customer')).toBeNull();
  expect(parseDemoRole(null)).toBeNull();
});

it('exposes the approved permanent navigation per role', () => {
  expect(DEMO_ROLES.manager.navigation.map(item => item.label)).toEqual([
    'Overview', 'Claim Queue', 'Analytics', 'AI Insights', 'Team Operations', 'Reports',
  ]);
  expect(DEMO_ROLES.adjuster.navigation.map(item => item.label)).toEqual([
    'My Work', 'Claim Queue', 'Documents', 'Reports',
  ]);
  expect(DEMO_ROLES.admin.navigation.map(item => item.label)).toEqual([
    'Workflow Automation', 'Reports', 'Settings',
  ]);
});
```

- [ ] **Step 2: Write query/local-storage precedence tests**

Use `provideRouter([])`, `ActivatedRoute` with a controlled query map, and a fake `Storage` object. Assert:

```ts
expect(service.role()).toBe('adjuster'); // valid query wins
expect(storage.getItem('claimsflow.demoRole')).toBe('adjuster');
```

Add separate cases for stored `admin`, invalid query fallback, and storage exceptions falling back to `manager`.

- [ ] **Step 3: Run the focused test and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/demo-role/demo-role.service.spec.ts'
```

Expected: FAIL because the files do not exist.

- [ ] **Step 4: Implement the role definitions**

Use these exact role records:

```ts
export const DEMO_ROLES: Record<DemoRoleId, DemoRoleDefinition> = {
  manager: {
    id: 'manager',
    label: 'Claims Manager',
    personaName: 'Alex Morgan',
    personaTitle: 'Claims Manager',
    initials: 'AM',
    defaultRoute: '/app/dashboard',
    navigation: [
      { id: 'overview', label: 'Overview', path: '/app/dashboard', icon: 'overview' },
      { id: 'queue', label: 'Claim Queue', path: '/app/claims', icon: 'queue' },
      { id: 'analytics', label: 'Analytics', path: '/app/analytics', icon: 'analytics' },
      { id: 'intelligence', label: 'AI Insights', path: '/app/intelligence', icon: 'spark' },
      { id: 'team-ops', label: 'Team Operations', path: '/app/team-ops', icon: 'team' },
      { id: 'reports', label: 'Reports', path: '/app/reports', icon: 'reports' },
    ],
    contextualPrefixes: ['/app/claims/'],
  },
  adjuster: {
    id: 'adjuster',
    label: 'Adjuster',
    personaName: 'Jordan Lee',
    personaTitle: 'Senior Adjuster',
    initials: 'JL',
    defaultRoute: '/app/my-work',
    navigation: [
      { id: 'my-work', label: 'My Work', path: '/app/my-work', icon: 'check' },
      { id: 'queue', label: 'Claim Queue', path: '/app/claims', icon: 'queue' },
      { id: 'documents', label: 'Documents', path: '/app/documents', icon: 'document' },
      { id: 'reports', label: 'Reports', path: '/app/reports', icon: 'reports' },
    ],
    contextualPrefixes: ['/app/claims/'],
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    personaName: 'Priya Shah',
    personaTitle: 'Platform Administrator',
    initials: 'PS',
    defaultRoute: '/app/workflows',
    navigation: [
      { id: 'workflows', label: 'Workflow Automation', path: '/app/workflows', icon: 'workflow' },
      { id: 'reports', label: 'Reports', path: '/app/reports', icon: 'reports' },
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'settings' },
    ],
    contextualPrefixes: [],
  },
};
```

- [ ] **Step 5: Implement query and storage resolution**

Use storage key `claimsflow.demoRole`. Keep storage access inside `try/catch`. `switchRole` must update state, storage, and navigate with:

```ts
await this.router.navigate([definition.defaultRoute], {
  queryParams: { role },
  queryParamsHandling: 'merge',
});
```

- [ ] **Step 6: Run the focused test**

Run the Step 3 command.

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/core/demo-role
git commit -m "feat(frontend): add demo role model and state"
```

---

### Task 3: Enforce role-aware routes as presentation behavior

**Files:**
- Create: `frontend/src/app/core/demo-role/demo-role-route.guard.ts`
- Create: `frontend/src/app/core/demo-role/demo-role-route.guard.spec.ts`
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `DemoRoleService.definition()`.
- Produces: `demoRoleRouteGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree`.
- Route data uses `allowedDemoRoles: readonly DemoRoleId[]`.

- [ ] **Step 1: Write guard tests**

```ts
it('allows a manager to open analytics', () => {
  service.setForTest('manager');
  const result = runGuard({ allowedDemoRoles: ['manager'] }, '/app/analytics?role=manager');
  expect(result).toBeTrue();
});

it('redirects an adjuster away from analytics and records a notice', () => {
  service.setForTest('adjuster');
  const result = runGuard({ allowedDemoRoles: ['manager'] }, '/app/analytics?role=adjuster') as UrlTree;
  expect(router.serializeUrl(result)).toBe('/app/my-work?role=adjuster');
  expect(service.consumeNotice()).toContain('Claims Manager');
});
```

Include contextual `/app/claims/:id` cases for Manager and Adjuster and deny Administrator.

- [ ] **Step 2: Run the focused test and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/demo-role/demo-role-route.guard.spec.ts'
```

Expected: FAIL because the guard does not exist.

- [ ] **Step 3: Implement route metadata and guard**

Add `canActivate: [demoRoleRouteGuard]` and exact role arrays:

```ts
// manager
allowedDemoRoles: ['manager']

// adjuster
allowedDemoRoles: ['adjuster']

// shared queue, reports, and claim detail
allowedDemoRoles: ['manager', 'adjuster']

// admin
allowedDemoRoles: ['admin']
```

`/app/claims/new` remains accessible to Manager and Adjuster only as a contextual route. Do not add it to permanent navigation.

- [ ] **Step 4: Preserve the active role through redirects**

The guard must return:

```ts
return this.router.createUrlTree([definition.defaultRoute], {
  queryParams: { role: definition.id },
});
```

- [ ] **Step 5: Run guard and route tests**

```bash
npm run test:ci -- --include='src/app/core/demo-role/*.spec.ts' --include='src/app/app.routes.spec.ts'
```

If `app.routes.spec.ts` does not exist, create it and assert each role metadata assignment by finding routes in `routes[2].children`.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/demo-role frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts
git commit -m "feat(frontend): add role-aware demo routing"
```

---

### Task 4: Add the profile role switcher and role-filtered employee shell

**Files:**
- Create: `frontend/src/app/core/layout/role-switcher/role-switcher.component.ts`
- Create: `frontend/src/app/core/layout/role-switcher/role-switcher.component.html`
- Create: `frontend/src/app/core/layout/role-switcher/role-switcher.component.css`
- Create: `frontend/src/app/core/layout/role-switcher/role-switcher.component.spec.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.html`
- Modify: `frontend/src/app/core/layout/app-shell.component.css`
- Modify: `frontend/src/app/core/layout/app-shell.component.spec.ts`

**Interfaces:**
- Consumes: `DemoRoleService.role`, `definition`, `navigation`, and `switchRole`.
- Produces:
  - `<app-role-switcher />`
  - output `openClaimantPortal`
  - output `resetDemoJourney`
  - role-aware sidebar, top-bar profile, mobile drawer, and notice banner.

- [ ] **Step 1: Write role-switcher component tests**

Assert:

```ts
expect(text()).toContain('Demo Role');
expect(text()).toContain('Claims Manager');
expect(text()).toContain('Adjuster');
expect(text()).toContain('Administrator');
expect(text()).toContain('Open Claimant Portal');
expect(text()).toContain('Reset Demo Journey');
```

Simulate keyboard opening, ArrowDown navigation, Enter selection, and Escape close. Assert focus returns to the trigger.

- [ ] **Step 2: Update shell tests first**

For Manager, expect exactly six permanent links and no My Work, Documents, Workflows, or Settings. For Adjuster, expect four links and Jordan Lee. For Administrator, expect three links and Priya Shah.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts' --include='src/app/core/layout/app-shell.component.spec.ts'
```

Expected: FAIL because the current shell has one hard-coded navigation array and static Alex Morgan copy.

- [ ] **Step 4: Implement the accessible menu**

Use a button with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`. Menu choices use `role="menuitemradio"` and `aria-checked`. The current role displays a visible `DEMO ROLE` badge.

- [ ] **Step 5: Refactor the shell to consume role state**

Remove the hard-coded `navigation` array from `AppShellComponent`. Expose:

```ts
readonly navigation = this.demoRole.navigation;
readonly operator = this.demoRole.definition;
readonly roleNotice = signal<string | null>(null);
```

Use one shared role-switcher component in desktop sidebar and top bar. Mobile navigation uses the first four role destinations plus a More button only when the role has more than four destinations.

- [ ] **Step 6: Add route ownership notice**

Render a dismissible status banner after a redirect:

```html
<div *ngIf="roleNotice() as notice" class="role-notice" role="status">
  <span>{{ notice }}</span>
  <button type="button" (click)="dismissRoleNotice()" aria-label="Dismiss role notice">×</button>
</div>
```

- [ ] **Step 7: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/core/layout/**/*.spec.ts' --include='src/app/core/demo-role/*.spec.ts'
npm run build
```

Expected: PASS with no new Angular compiler warning.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/core/layout frontend/src/app/core/demo-role
git commit -m "feat(frontend): add employee demo role switcher"
```

---

### Task 5: Add backend evidence mutation and claimant-friendly portal projection

**Files:**
- Create: `backend/src/main/java/com/claimsflow/portal/domain/EvidenceKind.java`
- Create: `backend/src/main/java/com/claimsflow/portal/application/PortalApplicationService.java`
- Create: `backend/src/main/java/com/claimsflow/portal/api/PortalResponses.java`
- Create: `backend/src/main/java/com/claimsflow/portal/api/PortalController.java`
- Create: `backend/src/test/java/com/claimsflow/portal/application/PortalApplicationServiceTest.java`
- Create: `backend/src/test/java/com/claimsflow/portal/api/PortalControllerWebTest.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/domain/Claim.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/application/ClaimApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`

**Interfaces:**
- Produces:
  - `EvidenceKind { INCIDENT_REPORT, PHOTOS, PROOF_OF_OWNERSHIP, MEDICAL_DOCUMENTATION }`
  - `Claim.updateEvidence(EvidenceKind kind, boolean present, int completenessPercentage, ClaimPriority priority, Instant slaDeadline, Instant now)`
  - `ClaimApplicationService.updateEvidence(UUID claimId, EvidenceKind kind, boolean present, String actor): Claim`
  - `GET /api/portal/claims/{claimId}`
  - `PATCH /api/portal/claims/{claimId}/evidence`

- [ ] **Step 1: Write domain/service tests**

Create a property claim with 25% completeness, call:

```java
service.updateEvidence(claimId, EvidenceKind.PHOTOS, true, "Taylor Reed");
```

Assert photos become present, completeness is recalculated through `CompletenessPolicy`, priority is recalculated through `PriorityPolicy`, `updatedAt` changes, and audit contains `EVIDENCE_UPDATED`.

- [ ] **Step 2: Write controller contract tests**

```java
mockMvc.perform(patch("/api/portal/claims/{claimId}/evidence", claimId)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"kind":"PHOTOS","present":true,"actor":"Taylor Reed"}
            """))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.claimId").value(claimId.toString()))
    .andExpect(jsonPath("$.evidence.photos.present").value(true));
```

Add 404 and invalid-enum cases using existing Problem Details conventions.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd backend
mvn -Dtest=PortalApplicationServiceTest,PortalControllerWebTest test
```

Expected: FAIL because portal classes and evidence mutation do not exist.

- [ ] **Step 4: Implement evidence mutation without bypassing policies**

`ClaimApplicationService.updateEvidence` must:

1. Load the claim.
2. Compute the new evidence booleans.
3. Call `CompletenessPolicy.evaluate`.
4. Call `PriorityPolicy.evaluate` using the current claim values and the new completeness.
5. Recalculate SLA only when priority changes, using the existing `slaDuration` method and current clock.
6. Call `Claim.updateEvidence`.
7. Record `EVIDENCE_UPDATED` with previous and new values.

- [ ] **Step 5: Implement the claimant projection**

`PortalResponses.PortalClaim` must contain only:

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

Do not expose internal recommendation prompts, adjuster email, raw policy rationale, or JPA entities.

- [ ] **Step 6: Run focused tests and backend verification**

```bash
mvn -Dtest=PortalApplicationServiceTest,PortalControllerWebTest test
mvn verify
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/portal backend/src/main/java/com/claimsflow/claim
git commit -m "feat(backend): add claimant portal projection and evidence updates"
```

---

### Task 6: Add bounded claim messages for the golden journey

**Files:**
- Create: `backend/src/main/resources/db/migration/V2__claim_messages.sql`
- Create: `backend/src/main/java/com/claimsflow/portal/domain/ClaimMessage.java`
- Create: `backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java`
- Create: `backend/src/test/java/com/claimsflow/portal/application/PortalMessageIntegrationTest.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/application/PortalApplicationService.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/api/PortalController.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/api/PortalResponses.java`
- Modify: `backend/src/test/java/com/claimsflow/persistence/SchemaIntegrationTest.java`

**Interfaces:**
- Produces:
  - `GET /api/portal/claims/{claimId}/messages`
  - `POST /api/claims/{claimId}/messages`
  - `PortalApplicationService.addMessage(UUID claimId, String author, String audience, String body)`
  - `PortalApplicationService.messages(UUID claimId)`

- [ ] **Step 1: Write migration assertions**

Extend `SchemaIntegrationTest` to assert table `claim_messages` and index `idx_claim_messages_claim_time` exist.

- [ ] **Step 2: Write message service tests**

Assert an adjuster-created `CLAIMANT` message appears in the portal list, an `INTERNAL` message does not, body length is limited to 1–1200 characters, and adding a message records `MESSAGE_ADDED` in audit.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd backend
mvn -Dtest=SchemaIntegrationTest,PortalMessageIntegrationTest test
```

Expected: FAIL before the migration and entity exist.

- [ ] **Step 4: Add the migration**

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
```

- [ ] **Step 5: Implement API contracts**

Employee request:

```java
public record CreateMessageRequest(
    @NotBlank @Size(max = 160) String author,
    @NotBlank @Pattern(regexp = "CLAIMANT|INTERNAL") String audience,
    @NotBlank @Size(max = 1200) String body) {}
```

Portal responses expose only `CLAIMANT` messages.

- [ ] **Step 6: Run focused and full backend verification**

```bash
mvn -Dtest=SchemaIntegrationTest,PortalMessageIntegrationTest test
mvn verify
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/resources/db/migration/V2__claim_messages.sql backend/src/main/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/portal backend/src/test/java/com/claimsflow/persistence/SchemaIntegrationTest.java
git commit -m "feat(backend): add bounded claim messages"
```

---

### Task 7: Add the configuration-gated deterministic demo reset

**Files:**
- Create: `backend/src/main/java/com/claimsflow/demo/config/DemoProperties.java`
- Create: `backend/src/main/java/com/claimsflow/demo/application/DemoJourneyService.java`
- Create: `backend/src/main/java/com/claimsflow/demo/api/DemoResponses.java`
- Create: `backend/src/main/java/com/claimsflow/demo/api/DemoController.java`
- Create: `backend/src/test/java/com/claimsflow/demo/application/DemoJourneyServiceTransactionTest.java`
- Create: `backend/src/test/java/com/claimsflow/demo/api/DemoControllerWebTest.java`
- Modify: `backend/src/main/java/com/claimsflow/claim/persistence/ClaimJpaRepository.java`
- Modify: `backend/src/main/java/com/claimsflow/audit/application/AuditService.java`
- Modify: `backend/src/main/java/com/claimsflow/portal/persistence/ClaimMessageJpaRepository.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/test/resources/application-test.yml`

**Interfaces:**
- Produces:
  - configuration key `claimsflow.demo.enabled`
  - reserved claimant email `taylor.reed@example.com`
  - `POST /api/demo/reset`
  - `DemoJourneyService.reset(): DemoJourneySnapshot`

- [ ] **Step 1: Write disabled-endpoint tests**

With `claimsflow.demo.enabled=false`, assert:

```java
mockMvc.perform(post("/api/demo/reset"))
    .andExpect(status().isNotFound());
```

Use conditional bean registration rather than a runtime 403 so the demo API is absent when disabled.

- [ ] **Step 2: Write reset transaction tests**

Seed two claims: one reserved email and one unrelated email. Add audit, recommendation, and message rows for both. Call reset twice. Assert after each call:

- exactly one claim exists for `taylor.reed@example.com`;
- unrelated claim and child rows are untouched;
- reserved claim status is `NEW`;
- reserved claim type is `PROPERTY`;
- incident report is present;
- photos and proof of ownership are absent;
- the claim is assigned to Jordan Lee;
- response includes the new claim ID and default routes;
- the second reset produces the same baseline state without duplicate reserved rows.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd backend
mvn -Dtest=DemoJourneyServiceTransactionTest,DemoControllerWebTest test
```

Expected: FAIL because the demo boundary does not exist.

- [ ] **Step 4: Implement configuration binding**

```java
@ConfigurationProperties(prefix = "claimsflow.demo")
public record DemoProperties(boolean enabled) {}
```

Register with `@EnableConfigurationProperties(DemoProperties.class)`. Add:

```yaml
claimsflow:
  demo:
    enabled: ${CLAIMSFLOW_DEMO_ENABLED:true}
```

Set test default true in `application-test.yml`; disabled tests override the property.

- [ ] **Step 5: Implement scoped deletion and recreation**

Inside one `@Transactional` method:

1. Find claims by exact reserved email.
2. Delete only their messages, recommendations, audit events, and claims.
3. Create the baseline through `ClaimApplicationService.create`, not direct SQL.
4. Resolve Jordan Lee by exact seeded email and assign through `ClaimApplicationService.assign`.
5. Add one claimant-visible welcome message.
6. Return claim ID, claim number, current state, and role routes.

Do not use `deleteAll()` on any repository.

- [ ] **Step 6: Run focused tests and `mvn verify`**

```bash
mvn -Dtest=DemoJourneyServiceTransactionTest,DemoControllerWebTest test
mvn verify
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/com/claimsflow/demo backend/src/test/java/com/claimsflow/demo backend/src/main/java/com/claimsflow/claim/persistence backend/src/main/java/com/claimsflow/audit/application backend/src/main/java/com/claimsflow/portal/persistence backend/src/main/resources/application.yml backend/src/test/resources/application-test.yml
git commit -m "feat(backend): add scoped demo journey reset"
```

---

### Task 8: Build the claimant portal shell, API client, and route structure

**Files:**
- Create: all files under `frontend/src/app/portal/models`, `data-access`, and `layout`
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes:
  - `GET /api/portal/claims/{claimId}`
  - `PATCH /api/portal/claims/{claimId}/evidence`
  - `GET /api/portal/claims/{claimId}/messages`
- Produces:
  - `PortalApiService.getClaim(id)`
  - `PortalApiService.updateEvidence(id, kind, present)`
  - `PortalApiService.getMessages(id)`
  - routes `/portal`, `/portal/claims/new`, `/portal/claims/:id`, `/portal/claims/:id/documents`, `/portal/claims/:id/messages`.

- [ ] **Step 1: Write HTTP contract tests**

Use `HttpTestingController` to assert exact URLs, methods, and bodies. Evidence request must be:

```ts
{
  kind: 'PHOTOS',
  present: true,
  actor: 'Taylor Reed',
}
```

- [ ] **Step 2: Write claimant-shell tests**

Assert the shell has exactly My Claim, Documents, Messages, and Help; does not render employee role controls; contains a skip link; and labels the active route with `aria-current="page"`.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/portal/**/*.spec.ts'
```

Expected: FAIL because the portal files do not exist.

- [ ] **Step 4: Implement typed portal models**

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

- [ ] **Step 5: Implement the separate shell**

Use a calmer composition: top navigation, claim progress, 16 px minimum body text, larger action labels, no dense employee sidebar, and no AI fraud terminology. Preserve the Midnight Command brand tokens.

- [ ] **Step 6: Register portal routes outside `AppShellComponent`**

Use one lazy claimant-shell route with child pages. Portal routes must not use `demoRoleRouteGuard`.

- [ ] **Step 7: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/app.routes.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/portal frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts
git commit -m "feat(frontend): add claimant portal shell and API client"
```

---

### Task 9: Implement claimant home, status, documents, and messages pages

**Files:**
- Create: page files under `frontend/src/app/portal/home`, `claim`, `documents`, and `messages`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`

**Interfaces:**
- Consumes: `PortalApiService` and existing `ClaimsApiService.create`.
- Produces: a customer can create the reserved demo claim, view status/timeline, mark evidence present, and read claimant-visible messages.

- [ ] **Step 1: Write portal page tests**

Cover four states for each data-driven page: loading, success, empty, and error. Documents test must assert that a successful evidence update refreshes completeness and announces `Photos added to the claim.` through a status region.

- [ ] **Step 2: Write intake-context tests**

Add a `portalMode` input or route-data check to `NewClaimPageComponent`. In portal mode:

- actor-facing operational copy is removed;
- successful creation navigates to `/portal/claims/{id}`;
- no employee sidebar assumptions exist;
- the request remains the existing typed `CreateClaimRequest`.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
```

Expected: FAIL before the pages and portal mode exist.

- [ ] **Step 4: Implement the portal home**

The home page reads the current demo claim ID from `sessionStorage` key `claimsflow.demoClaimId`. If absent, it displays one primary action: `Start a claim` linked to `/portal/claims/new`.

- [ ] **Step 5: Implement status and timeline**

Show human-readable status copy, completeness progress, SLA expectation, next action, and timeline. Do not expose internal priority-policy explanations.

- [ ] **Step 6: Implement evidence actions**

Each evidence card uses a real button and exact evidence kind. The UI says `Add evidence` and `Recorded for this demo`; it must not say a binary file was uploaded to permanent storage.

- [ ] **Step 7: Implement messages**

Render only API-returned claimant messages. Empty state: `No messages yet. Updates from your claims team will appear here.`

- [ ] **Step 8: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/portal/**/*.spec.ts' --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/portal frontend/src/app/claims/feature-create
git commit -m "feat(frontend): implement focused claimant experience"
```

---

### Task 10: Connect the adjuster golden path through My Work and Claim Workspace

**Files:**
- Modify: `frontend/src/app/workspaces/workspace-pages.component.ts`
- Modify: `frontend/src/app/workspaces/workspace-pages.component.spec.ts`
- Modify: `frontend/src/app/claims/data-access/claims-api.service.ts`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

**Interfaces:**
- Consumes: claim list/get/status/audit/recommendation APIs plus `POST /api/claims/{id}/messages`.
- Produces: Adjuster My Work reads the assigned reserved claim; Claim Workspace can add a claimant-visible request and perform one allowed transition.

- [ ] **Step 1: Add the employee message client contract test**

Extend `ClaimsApiService` with:

```ts
addMessage(
  claimId: string,
  request: { author: string; audience: 'CLAIMANT' | 'INTERNAL'; body: string },
): Observable<ClaimMessage>
```

Assert `POST /api/claims/{claimId}/messages` and exact body.

- [ ] **Step 2: Write My Work behavior tests**

For Adjuster role, assert the reserved claim is loaded with `assignment='mine'` or exact seeded adjuster filter supported by the current API; it appears first when SLA/priority requires attention; the primary action links to Claim Workspace.

- [ ] **Step 3: Write Claim Workspace request-action tests**

Assert the adjuster can enter a claimant-visible message, sees a confirmation preview, submits it, refreshes audit, and receives success copy. Assert an empty or over-1200-character body is blocked.

- [ ] **Step 4: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/data-access/claims-api.service.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts' --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

Expected: FAIL before the message action and API client exist.

- [ ] **Step 5: Implement the Adjuster My Work projection**

Use the existing API, not the Figma deterministic workspace-data service, for the golden-path card. Keep secondary workload cards deterministic but label them `Demo workload`. The reserved claim card must use real ID, status, priority, completeness, SLA, and assignment.

- [ ] **Step 6: Add the claimant request action**

Use author `Jordan Lee`, audience `CLAIMANT`, and require explicit confirmation. On success, refresh audit and show `Request sent to the claimant portal.` Do not claim external email or SMS delivery.

- [ ] **Step 7: Preserve human authority**

Status change and recommendation review continue using existing confirmation and validation paths. Do not automatically change status after adding a message.

- [ ] **Step 8: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/claims/**/*.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/claims frontend/src/app/workspaces
git commit -m "feat(frontend): connect adjuster golden journey"
```

---

### Task 11: Reflect golden-journey changes in Manager and Administrator views

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`
- Modify: `frontend/src/app/workspaces/workflows-page.component.ts`
- Modify: `frontend/src/app/workspaces/workspace-pages.component.spec.ts`

**Interfaces:**
- Consumes: existing dashboard snapshot, claim queue, and local workflow simulation.
- Produces: Manager views surface the real reserved claim and Administrator simulation accepts a typed demo-claim context.

- [ ] **Step 1: Write manager projection tests**

Assert the reserved claim appears in the intervention/queue surface after reset and evidence changes. The dashboard must use API data for the highlighted claim while retaining approved aggregate demo data where the backend has no aggregate contract.

- [ ] **Step 2: Write workflow-context tests**

Define:

```ts
export interface WorkflowSimulationInput {
  claimType: string;
  estimatedLoss: number;
  completenessPercentage: number;
  priority: string;
  status: string;
}
```

Assert selecting `Load demo claim` maps the real claim into this input and produces the existing visible simulation result without server persistence.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/dashboard-page.component.spec.ts' --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts'
```

Expected: FAIL before the demo claim context is connected.

- [ ] **Step 4: Implement manager highlighting**

Mark the reserved claim with a subtle `Golden journey` badge visible only when demo mode is enabled. Do not alter backend priority or status for presentation.

- [ ] **Step 5: Implement admin simulation context**

Fetch the demo claim ID from `DemoJourneyService`, load the claim through `ClaimsApiService`, and map it to `WorkflowSimulationInput`. Keep buttons labeled:

- `Save draft` — local state only
- `Validate` — local validation only
- `Activate` — disabled with explanation `Production workflow activation is not connected in this portfolio demo.`

- [ ] **Step 6: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/dashboard/*.spec.ts' --include='src/app/claims/feature-queue/*.spec.ts' --include='src/app/workspaces/*.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/dashboard frontend/src/app/claims/feature-queue frontend/src/app/workspaces
git commit -m "feat(frontend): connect manager and admin journey views"
```

---

### Task 12: Add frontend demo reset orchestration and rewrite the guided tour

**Files:**
- Create: all files under `frontend/src/app/demo`
- Modify: `frontend/src/app/core/layout/role-switcher/role-switcher.component.ts`
- Modify: `frontend/src/app/tour/tour-step-registry.ts`
- Modify: `frontend/src/app/tour/tour-orchestrator.service.ts`
- Modify: `frontend/src/app/tour/tour-page.component.ts`
- Modify: associated tour specs

**Interfaces:**
- Produces:
  - `DemoJourneyService.reset(): Observable<DemoJourneySnapshot>`
  - `DemoJourneyService.claimId: Signal<string | null>`
  - five-step employer tour: Claimant, Adjuster, Manager, Administrator, Audit Proof.

- [ ] **Step 1: Write reset service tests**

Assert `POST /api/demo/reset`, storage of claim ID in `sessionStorage`, role reset to Manager, and no local success state before the HTTP response completes.

- [ ] **Step 2: Write reset-dialog tests**

Assert explicit confirmation copy:

`Reset only the reserved ClaimsFlow demo journey? Other claims will not be changed.`

Assert Cancel does not call the service, Reset calls once, loading disables both actions, and failure leaves the dialog open with retry copy.

- [ ] **Step 3: Rewrite tour registry tests first**

Required exact step IDs:

```ts
['claimant-submission', 'adjuster-review', 'manager-impact', 'admin-routing', 'audit-proof']
```

Required routes preserve role query parameters.

- [ ] **Step 4: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/demo/*.spec.ts' --include='src/app/tour/*.spec.ts' --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts'
```

Expected: FAIL before the reset service/dialog and new tour steps exist.

- [ ] **Step 5: Implement reset orchestration**

On success:

1. store `claimId` in session storage;
2. switch to Manager;
3. close the dialog;
4. announce `Demo journey reset.`;
5. navigate to `/tour`.

- [ ] **Step 6: Implement the five-step registry**

Routes:

```ts
'/portal/claims/new'
`/app/claims/${claimId}?role=adjuster`
'/app/dashboard?role=manager'
'/app/workflows?role=admin'
`/app/claims/${claimId}?role=manager`
```

Each step must state business value, technical proof, and the human/AI authority boundary.

- [ ] **Step 7: Run focused tests and build**

```bash
npm run test:ci -- --include='src/app/demo/*.spec.ts' --include='src/app/tour/*.spec.ts' --include='src/app/core/layout/role-switcher/role-switcher.component.spec.ts'
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/demo frontend/src/app/tour frontend/src/app/core/layout/role-switcher
git commit -m "feat(frontend): add deterministic employer demo journey"
```

---

### Task 13: Implement premium motion and the bounded Copilot orb

**Files:**
- Create: all files under `frontend/src/app/core/layout/copilot-surface`
- Modify: `frontend/src/app/core/layout/app-shell.component.html`
- Modify: `frontend/src/app/core/layout/app-shell.component.css`
- Modify: `frontend/src/styles.css`
- Modify: relevant workspace styles

**Interfaces:**
- Produces:
  - `<app-copilot-surface />`
  - `CopilotOrbRenderer.start(canvas): void`
  - `CopilotOrbRenderer.stop(): void`
  - CSS/SVG fallback with identical layout footprint.

- [ ] **Step 1: Write component lifecycle tests**

Inject a renderer factory spy. Assert renderer starts only when:

- canvas exists;
- `matchMedia('(prefers-reduced-motion: reduce)')` is false;
- WebGL context creation succeeds.

Assert destroy calls `stop`. Assert fallback remains visible on renderer failure.

- [ ] **Step 2: Write reduced-motion and keyboard tests**

The Copilot action remains a real button. Reduced motion disables continuous drift, chart reveals, workflow traversal animation, and critical pulses while preserving state changes.

- [ ] **Step 3: Run focused tests and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/core/layout/copilot-surface/*.spec.ts' --include='src/app/core/layout/app-shell.component.spec.ts'
```

Expected: FAIL before the component exists.

- [ ] **Step 4: Implement the CSS/SVG fallback first**

Fallback layers:

```html
<div class="copilot-orb-fallback" aria-hidden="true">
  <span class="orb-core"></span>
  <span class="orb-ring orb-ring-a"></span>
  <span class="orb-ring orb-ring-b"></span>
</div>
```

Use existing cyan/teal/violet tokens, masks, blur, and restrained bloom. The orb must not reduce text contrast.

- [ ] **Step 5: Implement lazy native WebGL**

Use dynamic import from the component:

```ts
const { CopilotOrbRenderer } = await import('./copilot-orb.renderer');
```

The renderer uses one canvas, one vertex shader, one fragment shader, `requestAnimationFrame`, and a capped device-pixel ratio of 1.5. Stop rendering when `document.visibilityState === 'hidden'` and resume on visibility change. No third-party dependency is added.

- [ ] **Step 6: Add restrained shared motion tokens**

```css
:root {
  --motion-fast: 140ms;
  --motion-standard: 220ms;
  --motion-emphasis: 300ms;
  --ease-out-premium: cubic-bezier(.2,.8,.2,1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}
```

Use motion only for role-switch shell accents, route settle, active navigation, KPI value changes, chart reveal, claim selection, workflow traversal, one critical pulse, and Copilot response state.

- [ ] **Step 7: Run focused tests and production build**

```bash
npm run test:ci -- --include='src/app/core/layout/**/*.spec.ts'
npm run build
```

Expected: PASS. Record initial and lazy chunk sizes; the orb code must be emitted in a lazy chunk.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/core/layout/copilot-surface frontend/src/app/core/layout/app-shell.component.* frontend/src/styles.css frontend/src/app/workspaces/*.css
git commit -m "feat(frontend): add premium motion and copilot atmosphere"
```

---

### Task 14: Complete responsive, accessibility, and performance hardening

**Files:**
- Modify: employee shell, claimant shell, portal pages, role switcher, workspace responsive CSS, and corresponding specs
- Modify: `.github/workflows/visual-qa.yml`

**Interfaces:**
- Produces: verified desktop, tablet, and mobile role-aware layouts with no horizontal overflow and stable focus behavior.

- [ ] **Step 1: Add accessibility assertions**

Test:

- one `h1` per route page;
- visible keyboard focus for role menu and portal navigation;
- active role announced through `aria-live="polite"`;
- role menu returns focus on close;
- status/priority includes text, not color alone;
- every form control has a label;
- skip links target existing focusable main regions.

- [ ] **Step 2: Add viewport smoke cases to Visual QA**

Capture:

```text
manager-dashboard-1440x1180.png
adjuster-my-work-1440x1180.png
admin-workflows-1440x1180.png
claimant-portal-1440x1180.png
claimant-portal-390x844.png
manager-dashboard-390x844.png
```

Set role query parameters explicitly in capture URLs.

- [ ] **Step 3: Add overflow checks to the capture script**

Evaluate:

```js
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (overflow) throw new Error(`Horizontal overflow at ${page.url()}`);
```

Also fail on uncaught page errors and console messages of type `error`.

- [ ] **Step 4: Implement responsive corrections**

Desktop retains approximately 216 px rail and 84 px top bar. Tablet uses an icon rail with accessible labels. Mobile uses at most four role destinations plus More, while the claimant portal uses compact top navigation and a bottom action region. Keep minimum pointer targets at 44×44 px.

- [ ] **Step 5: Verify reduced motion manually and in tests**

Use browser emulation for reduced motion and confirm the orb fallback, route changes, charts, and workflow remain usable without continuous animation.

- [ ] **Step 6: Run frontend verification**

```bash
cd frontend
npm run test:ci
npm run build
```

Expected: all tests pass, no relevant browser console error, and production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add frontend .github/workflows/visual-qa.yml
git commit -m "test(frontend): harden role-aware responsive experience"
```

---

### Task 15: Run end-to-end verification, update documentation, and prepare review

**Files:**
- Modify: `README.md`
- Modify: `docs/demo-script.md`
- Modify: `docs/design/claimsflow-final-mvp-handoff.md`
- Modify: spec status only after implementation verification

**Interfaces:**
- Produces: reproducible setup, role matrix, golden-journey script, truthful limitation list, and rendered visual evidence.

- [ ] **Step 1: Start the complete stack**

```bash
docker compose up -d db
docker compose ps

cd backend
mvn spring-boot:run

# second terminal
cd frontend
npm ci
npm start
```

Verify:

```text
http://localhost:8080/actuator/health
http://localhost:4200
```

- [ ] **Step 2: Reset and exercise the golden journey manually**

1. Reset reserved demo journey.
2. Open Claimant Portal.
3. Add photos evidence.
4. Switch to Adjuster and open the reserved claim.
5. Add one claimant-visible request.
6. Perform one allowed status transition.
7. Switch to Manager and verify queue/dashboard reflection.
8. Switch to Administrator and load the demo claim into local workflow simulation.
9. Return to claim audit and verify created, evidence, message, assignment, and status events.

Record exact claim ID and browser console status in execution notes; do not commit those notes.

- [ ] **Step 3: Run backend verification and package build**

```bash
cd backend
mvn verify
mvn package
```

Expected: PASS.

- [ ] **Step 4: Run frontend verification and production build**

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

Expected: PASS with a test count not lower than the baseline.

- [ ] **Step 5: Run rendered Visual QA**

Run the same capture script used by `.github/workflows/visual-qa.yml` against the local application. Inspect every screenshot. Compare the Manager, Analytics, Documents, Team Ops, and Workflow routes against approved references, then verify the new Adjuster and Claimant screens use the same design language without copying employee density into the portal.

Acceptance failures include:

- role-inappropriate navigation;
- unclear active role;
- missing portal next action;
- clipped content at 1440×1180 or 390×844;
- horizontal overflow;
- unreadable labels;
- generic flat cards replacing approved surfaces;
- excessive bloom or motion;
- WebGL blocking render;
- unsupported persistence claims;
- console errors or failed API requests.

Fix evidence-backed failures, then repeat Steps 3–5.

- [ ] **Step 6: Update README and demo script**

README must include:

- employee role matrix;
- claimant portal routes;
- `CLAIMSFLOW_DEMO_ENABLED` behavior;
- reset scope and warning;
- exact golden-journey walkthrough;
- distinction between demo roles and security;
- message/evidence limitations;
- WebGL fallback and reduced-motion behavior.

`docs/demo-script.md` must fit a 60–90 second interview walkthrough and use the five approved tour steps.

- [ ] **Step 7: Update spec status after evidence exists**

Change the design spec status from `Approved for implementation planning` to `Implemented and verified` only after backend, frontend, build, manual golden journey, and rendered Visual QA all pass on the same commit.

- [ ] **Step 8: Final hygiene checks**

```bash
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Expected: no temporary artifacts and no whitespace errors.

- [ ] **Step 9: Commit documentation**

```bash
git add README.md docs/demo-script.md docs/design/claimsflow-final-mvp-handoff.md docs/superpowers/specs/2026-08-02-role-aware-claims-journey-design.md
git commit -m "docs: document role-aware ClaimsFlow journey"
```

- [ ] **Step 10: Push and open a pull request without merging**

```bash
git push -u origin design/role-aware-claims-journey
gh pr create \
  --base main \
  --head design/role-aware-claims-journey \
  --title "Add role-aware ClaimsFlow golden journey" \
  --body-file <(cat <<'EOF'
## Summary
- adds presentation-only Manager, Adjuster, and Administrator demo roles
- adds a separate claimant portal
- connects one deterministic customer-to-operations golden journey
- adds scoped demo reset, claimant evidence metadata, and bounded messages
- adds premium motion and a lazy Copilot orb with reduced-motion fallback

## Verification
- backend `mvn verify`
- backend `mvn package`
- frontend `npm run test:ci`
- frontend `npm run build`
- rendered desktop and mobile Visual QA
- manual five-step golden journey

## Boundaries
- demo roles are not authentication or authorization
- evidence does not claim object-storage persistence
- messages do not claim external delivery
- workflow simulation remains local
EOF
)
```

Do not merge until the exact PR head has successful CI and Visual QA and the rendered screenshots have been inspected.
