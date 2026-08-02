# ClaimsFlow Targeted Pre-Merge Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the completed ClaimsFlow MVP into clearer frontend boundaries while preserving every approved route, API contract, visual treatment, motion behavior, responsive state, accessibility contract, and human-authority safeguard.

**Architecture:** Move tour rendering to the application root so permanent shell construction has no claims-data dependency. Centralize recommendation-review request mapping and validation in a focused shared coordinator, then split Claims Intelligence into queue, dossier, assistant, and action-dialog presentation components while keeping API orchestration in the route page. Use Angular standalone components, signals, RxJS cancellation, and existing services only.

**Tech Stack:** Angular 20.3 standalone components, TypeScript, signals, RxJS, Reactive Forms, Jasmine/Karma, Spring Boot 3.5, Java 21, Maven, GitHub Actions.

## Global Constraints

- Preserve `/`, `/tour`, `/app/dashboard`, `/app/claims`, `/app/claims/:id`, `/app/claims/new`, and `/app/intelligence` exactly.
- Preserve the current Spring request and response shapes.
- Preserve the existing Figma-aligned DOM classes unless a deliberate test or accessibility correction requires a change.
- Preserve the Initial -> Signal Lock -> Ready showcase sequence, route transitions, reduced-motion behavior, and bounded CSS/SVG shader equivalents.
- Recommendation review must require an explicit decision, reviewer `Interview User`, a trimmed reason of 8-500 characters, exact result preview, explicit confirmation, and immutable audit event.
- Recommendation review must not change claim workflow status.
- Do not add dependencies, a state-management library, WebGL, a component library, authentication, messaging, object storage, or backend package restructuring.
- Keep API errors feature-controlled and user-readable.
- Use test-first changes and commit each independently reviewable task.
- Do not merge until frontend tests, frontend production build, backend verification, backend package build, and GitHub Actions all pass for the exact PR head.

---

## File Structure

### New shared review boundary

```text
frontend/src/app/shared/recommendation-review/
├── recommendation-review.models.ts
├── recommendation-review.validators.ts
├── recommendation-review-coordinator.service.ts
└── recommendation-review-coordinator.service.spec.ts
```

- `models.ts` owns the shared decision and request/result types.
- `validators.ts` owns the reason length constants, Angular validator factory, and normalization function.
- `coordinator.service.ts` maps a typed review command to `ClaimsApiService.reviewRecommendation`.
- The coordinator does not own dialogs, signals, routing, audit refresh, or feature copy.

### New Claims Intelligence presentation boundary

```text
frontend/src/app/intelligence/components/
├── intelligence-review-queue.component.ts
├── intelligence-review-queue.component.html
├── intelligence-review-queue.component.spec.ts
├── intelligence-dossier.component.ts
├── intelligence-dossier.component.html
├── intelligence-dossier.component.spec.ts
├── claim-assistant-panel.component.ts
├── claim-assistant-panel.component.html
├── claim-assistant-panel.component.spec.ts
├── intelligence-action-dialog.component.ts
├── intelligence-action-dialog.component.html
└── intelligence-action-dialog.component.spec.ts
```

Existing CSS remains in `claims-intelligence-page.component.css` during extraction so visual regression risk stays low. Each child uses the existing class names and `ViewEncapsulation.None` only if inherited route-level styles cannot reach extracted templates. Prefer moving only the exact class blocks required by a child into a sibling component stylesheet when isolation is straightforward.

### Modified route and shell files

```text
frontend/src/app/app.component.ts
frontend/src/app/app.component.spec.ts
frontend/src/app/core/layout/app-shell.component.ts
frontend/src/app/core/layout/app-shell.component.html
frontend/src/app/core/layout/app-shell.component.spec.ts
frontend/src/app/claims/feature-detail/claim-detail-page.component.ts
frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts
frontend/src/app/intelligence/claims-intelligence-page.component.ts
frontend/src/app/intelligence/claims-intelligence-page.component.html
frontend/src/app/intelligence/claims-intelligence-page.component.spec.ts
frontend/src/app/intelligence/intelligence.models.ts
frontend/src/app/intelligence/intelligence-facade.service.ts
```

---

### Task 1: Decouple the guided tour from the permanent application shell

**Files:**
- Modify: `frontend/src/app/app.component.ts`
- Modify: `frontend/src/app/app.component.spec.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Modify: `frontend/src/app/core/layout/app-shell.component.html`
- Modify: `frontend/src/app/core/layout/app-shell.component.spec.ts`

**Interfaces:**
- Consumes: existing `TourControllerComponent` selector `app-tour-controller`.
- Produces: `AppComponent` hosts one `RouterOutlet` and one `TourControllerComponent`; `AppShellComponent` imports only router primitives.

- [ ] **Step 1: Update the shell test to prove isolation**

Replace shell test setup with no HTTP provider and retain navigation/accessibility assertions:

```ts
await TestBed.configureTestingModule({
  imports: [AppShellComponent],
  providers: [provideRouter([])],
}).compileComponents();

const fixture = TestBed.createComponent(AppShellComponent);
fixture.detectChanges();
expect(fixture.nativeElement.querySelector('app-tour-controller')).toBeNull();
expect(fixture.nativeElement.querySelector('#main-content')).not.toBeNull();
```

- [ ] **Step 2: Update the root test to require application-level tour hosting**

```ts
await TestBed.configureTestingModule({
  imports: [AppComponent],
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
}).compileComponents();

const fixture = TestBed.createComponent(AppComponent);
fixture.detectChanges();
expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
expect(fixture.nativeElement.querySelector('app-tour-controller')).not.toBeNull();
expect(fixture.nativeElement.querySelector('.app-sidebar')).toBeNull();
```

Add imports from `@angular/common/http`, `@angular/common/http/testing`, and `TourControllerComponent` as required by the compiled root.

- [ ] **Step 3: Run the two focused tests and verify the expected failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/core/layout/app-shell.component.spec.ts' --include='src/app/app.component.spec.ts'
```

Expected before implementation: shell test fails because `app-tour-controller` still exists in the shell; root test fails because the controller is not hosted by `AppComponent`.

- [ ] **Step 4: Move the controller to the application root**

Implement:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TourControllerComponent } from './tour/tour-controller.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TourControllerComponent],
  template: `<router-outlet /><app-tour-controller />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

Remove `TourControllerComponent` from `AppShellComponent.imports` and remove `<app-tour-controller />` from `app-shell.component.html`.

- [ ] **Step 5: Run focused tests and verify success**

Run the Step 3 command.

Expected: both specs pass, and shell construction does not request `ClaimsApiService` or `HttpClient`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/app.component.ts frontend/src/app/app.component.spec.ts frontend/src/app/core/layout/app-shell.component.ts frontend/src/app/core/layout/app-shell.component.html frontend/src/app/core/layout/app-shell.component.spec.ts
git commit -m "refactor(frontend): decouple tour from application shell"
```

---

### Task 2: Create the shared recommendation-review contract and coordinator

**Files:**
- Create: `frontend/src/app/shared/recommendation-review/recommendation-review.models.ts`
- Create: `frontend/src/app/shared/recommendation-review/recommendation-review.validators.ts`
- Create: `frontend/src/app/shared/recommendation-review/recommendation-review-coordinator.service.ts`
- Create: `frontend/src/app/shared/recommendation-review/recommendation-review-coordinator.service.spec.ts`

**Interfaces:**
- Consumes: `ClaimsApiService.reviewRecommendation(id, recommendationId, decision, reviewer, reason): Observable<Recommendation>`.
- Produces:
  - `type ReviewDecision = Exclude<RecommendationReviewState, 'PENDING'>`
  - `interface RecommendationReviewCommand`
  - `REVIEW_REASON_MIN_LENGTH = 8`
  - `REVIEW_REASON_MAX_LENGTH = 500`
  - `reviewReasonValidators(): ValidatorFn[]`
  - `normalizeReviewReason(value: string): string`
  - `RecommendationReviewCoordinator.review(command): Observable<Recommendation>`

- [ ] **Step 1: Write the coordinator tests**

```ts
const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['reviewRecommendation']);
api.reviewRecommendation.and.returnValue(of(recommendation));

await TestBed.configureTestingModule({
  providers: [
    RecommendationReviewCoordinator,
    { provide: ClaimsApiService, useValue: api },
  ],
}).compileComponents();

const coordinator = TestBed.inject(RecommendationReviewCoordinator);

it('normalizes the reason and maps the command to the API', () => {
  coordinator.review({
    claimId: 'claim-1',
    recommendationId: 'recommendation-1',
    decision: 'APPROVED',
    reason: '  Evidence reviewed by the operator.  ',
  }).subscribe();

  expect(api.reviewRecommendation).toHaveBeenCalledWith(
    'claim-1',
    'recommendation-1',
    'APPROVED',
    'Interview User',
    'Evidence reviewed by the operator.',
  );
});

it('propagates API errors without replacing them', done => {
  const failure = new Error('provider unavailable');
  api.reviewRecommendation.and.returnValue(throwError(() => failure));
  coordinator.review({
    claimId: 'claim-1',
    recommendationId: 'recommendation-1',
    decision: 'REJECTED',
    reason: 'Recommendation lacks sufficient support.',
  }).subscribe({
    error: error => {
      expect(error).toBe(failure);
      done();
    },
  });
});
```

Add a pure validator spec:

```ts
expect(normalizeReviewReason('  reviewed  ')).toBe('reviewed');
const control = new FormControl('short', reviewReasonValidators());
expect(control.hasError('minlength')).toBeTrue();
```

- [ ] **Step 2: Run the new spec and verify failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/recommendation-review/recommendation-review-coordinator.service.spec.ts'
```

Expected: compilation fails because the shared files do not exist.

- [ ] **Step 3: Implement the types and validators**

`recommendation-review.models.ts`:

```ts
import { RecommendationReviewState } from '../models/claim.models';

export type ReviewDecision = Exclude<RecommendationReviewState, 'PENDING'>;

export interface RecommendationReviewCommand {
  claimId: string;
  recommendationId: string;
  decision: ReviewDecision;
  reason: string;
}
```

`recommendation-review.validators.ts`:

```ts
import { ValidatorFn, Validators } from '@angular/forms';

export const REVIEW_REASON_MIN_LENGTH = 8;
export const REVIEW_REASON_MAX_LENGTH = 500;

export function reviewReasonValidators(): ValidatorFn[] {
  return [
    Validators.required,
    Validators.minLength(REVIEW_REASON_MIN_LENGTH),
    Validators.maxLength(REVIEW_REASON_MAX_LENGTH),
  ];
}

export function normalizeReviewReason(value: string): string {
  return value.trim();
}
```

- [ ] **Step 4: Implement the coordinator**

```ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClaimsApiService } from '../../claims/data-access/claims-api.service';
import { Recommendation } from '../models/claim.models';
import { RecommendationReviewCommand } from './recommendation-review.models';
import { normalizeReviewReason } from './recommendation-review.validators';

@Injectable({ providedIn: 'root' })
export class RecommendationReviewCoordinator {
  private readonly api = inject(ClaimsApiService);

  review(command: RecommendationReviewCommand): Observable<Recommendation> {
    return this.api.reviewRecommendation(
      command.claimId,
      command.recommendationId,
      command.decision,
      'Interview User',
      normalizeReviewReason(command.reason),
    );
  }
}
```

- [ ] **Step 5: Run the focused spec and verify success**

Run the Step 2 command.

Expected: all coordinator and validator assertions pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/shared/recommendation-review
git commit -m "refactor(frontend): centralize recommendation review contract"
```

---

### Task 3: Adapt Claim Workspace to the shared review coordinator and stabilize its test

**Files:**
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

**Interfaces:**
- Consumes: `RecommendationReviewCoordinator.review(command)` and `reviewReasonValidators()`.
- Produces: the same page signals, markup, API result handling, audit refresh, and visible dialog behavior.

- [ ] **Step 1: Rewrite unstable markup assertions around stable production selectors**

Use selectors that reflect the current DOM state:

```ts
expect(root.querySelector('[data-tour-target="decision-support"]')).not.toBeNull();
expect(root.querySelector('.decision-panel')?.textContent).toContain('Human-controlled recommendation');
expect(root.querySelector('.decision-panel')?.textContent).toContain('Advisory only');
expect(root.querySelector('.identity-instruments article:nth-child(2) strong')?.textContent?.trim()).toBe('50%');
expect(root.querySelector('.workspace-tabs button:last-child')?.textContent).toContain('2');
```

Do not assert `.audit-event` count while the Dossier tab is active. After clicking the Audit tab, call `harness.detectChanges()` and then assert two audit events.

Replace direct `ClaimsApiService.reviewRecommendation` expectation with a coordinator spy:

```ts
const reviewCoordinator = jasmine.createSpyObj<RecommendationReviewCoordinator>('RecommendationReviewCoordinator', ['review']);
reviewCoordinator.review.and.returnValue(of(approvedRecommendation));
```

- [ ] **Step 2: Run the Claim Workspace spec and verify failure**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

Expected before implementation: injector or expectation failure because the page still calls `ClaimsApiService.reviewRecommendation` directly.

- [ ] **Step 3: Replace local decision and validator declarations**

Remove the local `ReviewDecision` alias and direct `Validators` import. Import:

```ts
import { ReviewDecision } from '../../shared/recommendation-review/recommendation-review.models';
import { RecommendationReviewCoordinator } from '../../shared/recommendation-review/recommendation-review-coordinator.service';
import { reviewReasonValidators } from '../../shared/recommendation-review/recommendation-review.validators';
```

Inject the coordinator:

```ts
private readonly reviewCoordinator = inject(RecommendationReviewCoordinator);
```

Create the control with:

```ts
readonly reviewReason = new FormControl('', {
  nonNullable: true,
  validators: reviewReasonValidators(),
});
```

- [ ] **Step 4: Delegate submission through the coordinator**

Replace the direct API call with:

```ts
this.reviewCoordinator.review({
  claimId: this.id,
  recommendationId: current.id,
  decision,
  reason: this.reviewReason.value,
}).subscribe({
  next: value => {
    this.recommendation.set(value);
    this.reviewSuccess.set(`${this.label(decision)} review recorded and appended to the audit timeline.`);
    this.pendingReview.set(null);
    this.reviewReason.reset('');
    this.acting.set(false);
    this.refreshAudit();
  },
  error: (error: unknown) => {
    this.recommendationError.set(this.message(error, 'Review failed.'));
    this.acting.set(false);
  },
});
```

- [ ] **Step 5: Run the focused spec and coordinator spec**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts' --include='src/app/shared/recommendation-review/recommendation-review-coordinator.service.spec.ts'
```

Expected: both specs pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/claims/feature-detail/claim-detail-page.component.ts frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts
git commit -m "refactor(frontend): reuse recommendation review coordinator"
```

---

### Task 4: Extract the Claims Intelligence review queue

**Files:**
- Create: `frontend/src/app/intelligence/components/intelligence-review-queue.component.ts`
- Create: `frontend/src/app/intelligence/components/intelligence-review-queue.component.html`
- Create: `frontend/src/app/intelligence/components/intelligence-review-queue.component.spec.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.html`

**Interfaces:**
- Consumes: `IntelligenceQueueItem[]`, selected claim ID, loading state.
- Produces: `selected = output<IntelligenceQueueItem>()`.

- [ ] **Step 1: Write queue component tests**

```ts
@Component({
  standalone: true,
  imports: [IntelligenceReviewQueueComponent],
  template: `
    <app-intelligence-review-queue
      [items]="items"
      selectedId="claim-2"
      [loading]="false"
      (selected)="selection = $event"
    />
  `,
})
class HostComponent {
  items = [firstItem, secondItem];
  selection: IntelligenceQueueItem | null = null;
}

it('renders queue items and emits the selected item', () => {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const rows = fixture.nativeElement.querySelectorAll('button.intelligence-row');
  expect(rows.length).toBe(2);
  expect(rows[1].classList).toContain('selected');
  rows[0].click();
  expect(fixture.componentInstance.selection).toBe(firstItem);
});
```

Add loading and empty-state assertions.

- [ ] **Step 2: Run the new spec and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-review-queue.component.spec.ts'
```

Expected: component import does not exist.

- [ ] **Step 3: Implement the standalone queue component**

```ts
@Component({
  selector: 'app-intelligence-review-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intelligence-review-queue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceReviewQueueComponent {
  readonly items = input.required<readonly IntelligenceQueueItem[]>();
  readonly selectedId = input('');
  readonly loading = input(false);
  readonly selected = output<IntelligenceQueueItem>();
  readonly label = humanizeEnum;
}
```

Move the existing queue markup unchanged into the component template. Keep all class names.

- [ ] **Step 4: Replace queue markup in the route page**

```html
<app-intelligence-review-queue
  [items]="queue()"
  [selectedId]="selectedId()"
  [loading]="loadingQueue()"
  (selected)="select($event)"
/>
```

Add the child component to route-page imports.

- [ ] **Step 5: Run queue and route-page tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-review-queue.component.spec.ts' --include='src/app/intelligence/claims-intelligence-page.component.spec.ts'
```

Expected: queue behavior and route composition pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/intelligence/components/intelligence-review-queue.component.* frontend/src/app/intelligence/claims-intelligence-page.component.ts frontend/src/app/intelligence/claims-intelligence-page.component.html
git commit -m "refactor(frontend): extract intelligence review queue"
```

---

### Task 5: Extract the Claims Intelligence dossier

**Files:**
- Create: `frontend/src/app/intelligence/components/intelligence-dossier.component.ts`
- Create: `frontend/src/app/intelligence/components/intelligence-dossier.component.html`
- Create: `frontend/src/app/intelligence/components/intelligence-dossier.component.spec.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.html`

**Interfaces:**
- Consumes: selected queue item, workspace, reasoning nodes, acting state.
- Produces: `generateRecommendation`, `prepareApproval`, and `prepareRejection` outputs.

- [ ] **Step 1: Write dossier tests**

Assert:

```ts
expect(fixture.nativeElement.textContent).toContain('SELECTED INTELLIGENCE DOSSIER');
expect(fixture.nativeElement.textContent).toContain('Explainable guidance');
expect(fixture.nativeElement.querySelector('app-evidence-reasoning-graph')).not.toBeNull();
```

Click `Approve guidance` and assert `prepareApproval` emits. Render with `recommendation: null`, click `Generate recommendation`, and assert `generateRecommendation` emits.

- [ ] **Step 2: Run the new spec and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-dossier.component.spec.ts'
```

Expected: component import does not exist.

- [ ] **Step 3: Implement the dossier component**

```ts
@Component({
  selector: 'app-intelligence-dossier',
  standalone: true,
  imports: [CommonModule, EvidenceReasoningGraphComponent],
  templateUrl: './intelligence-dossier.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceDossierComponent {
  readonly selectedItem = input<IntelligenceQueueItem | null>(null);
  readonly workspace = input.required<IntelligenceWorkspace>();
  readonly reasoningNodes = input.required<readonly EvidenceReasoningNode[]>();
  readonly acting = input(false);
  readonly generateRecommendation = output<void>();
  readonly prepareApproval = output<void>();
  readonly prepareRejection = output<void>();
  readonly label = humanizeEnum;
}
```

Move the dossier header, recommendation dossier, source classification, and reasoning panel markup unchanged. Replace page method calls with output emissions.

- [ ] **Step 4: Replace dossier markup in the route page**

```html
<app-intelligence-dossier
  *ngIf="workspace() as data"
  [selectedItem]="selectedQueueItem()"
  [workspace]="data"
  [reasoningNodes]="reasoningNodes()"
  [acting]="acting()"
  (generateRecommendation)="generateRecommendation()"
  (prepareApproval)="openAction('APPROVE_RECOMMENDATION')"
  (prepareRejection)="openAction('REJECT_RECOMMENDATION')"
/>
```

- [ ] **Step 5: Run dossier and route-page tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-dossier.component.spec.ts' --include='src/app/intelligence/claims-intelligence-page.component.spec.ts'
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/intelligence/components/intelligence-dossier.component.* frontend/src/app/intelligence/claims-intelligence-page.component.ts frontend/src/app/intelligence/claims-intelligence-page.component.html
git commit -m "refactor(frontend): extract intelligence dossier"
```

---

### Task 6: Extract the claim assistant panel

**Files:**
- Create: `frontend/src/app/intelligence/components/claim-assistant-panel.component.ts`
- Create: `frontend/src/app/intelligence/components/claim-assistant-panel.component.html`
- Create: `frontend/src/app/intelligence/components/claim-assistant-panel.component.spec.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.html`

**Interfaces:**
- Consumes: workspace, mode, assistant answer, prepared draft.
- Produces: `modeChanged`, `prepareEvidenceRequest`, and `prepareApproval` outputs.

- [ ] **Step 1: Write assistant tests**

```ts
it('emits investigation mode from the prompt', () => {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const prompt = Array.from(fixture.nativeElement.querySelectorAll('button'))
    .find((button: HTMLButtonElement) => button.textContent?.includes('Which evidence is missing?')) as HTMLButtonElement;
  prompt.click();
  expect(fixture.componentInstance.mode).toBe('investigation');
});

it('emits only prepared actions and never reviews directly', () => {
  const prepare = fixture.nativeElement.querySelector('.action-buttons .button.primary') as HTMLButtonElement;
  prepare.click();
  expect(fixture.componentInstance.approvalRequested).toBeTrue();
});
```

Also assert classified facts retain `data-classification` and source labels.

- [ ] **Step 2: Run the new spec and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/claim-assistant-panel.component.spec.ts'
```

Expected: component import does not exist.

- [ ] **Step 3: Implement the assistant component**

```ts
@Component({
  selector: 'app-claim-assistant-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './claim-assistant-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimAssistantPanelComponent {
  readonly workspace = input.required<IntelligenceWorkspace>();
  readonly mode = input.required<IntelligenceMode>();
  readonly answer = input.required<AssistantAnswer>();
  readonly preparedDraft = input('');
  readonly modeChanged = output<IntelligenceMode>();
  readonly prepareEvidenceRequest = output<void>();
  readonly prepareApproval = output<void>();
  readonly label = humanizeEnum;
}
```

Move assistant markup unchanged and replace page method calls with output emissions.

- [ ] **Step 4: Replace assistant markup in the route page**

```html
<app-claim-assistant-panel
  *ngIf="workspace() as data"
  [workspace]="data"
  [mode]="mode()"
  [answer]="assistant()!"
  [preparedDraft]="preparedDraft()"
  (modeChanged)="setMode($event)"
  (prepareEvidenceRequest)="openAction('DRAFT_EVIDENCE_REQUEST')"
  (prepareApproval)="openAction('APPROVE_RECOMMENDATION')"
/>
```

- [ ] **Step 5: Run assistant and route-page tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/claim-assistant-panel.component.spec.ts' --include='src/app/intelligence/claims-intelligence-page.component.spec.ts'
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/intelligence/components/claim-assistant-panel.component.* frontend/src/app/intelligence/claims-intelligence-page.component.ts frontend/src/app/intelligence/claims-intelligence-page.component.html
git commit -m "refactor(frontend): extract claim assistant panel"
```

---

### Task 7: Extract the Intelligence action dialog and use the shared review coordinator

**Files:**
- Create: `frontend/src/app/intelligence/components/intelligence-action-dialog.component.ts`
- Create: `frontend/src/app/intelligence/components/intelligence-action-dialog.component.html`
- Create: `frontend/src/app/intelligence/components/intelligence-action-dialog.component.spec.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.html`

**Interfaces:**
- Consumes: `PreparedAction | null`, acting state.
- Produces: `cancelled` and `confirmed: { action: PreparedAction; reason: string }`.
- Route page consumes `RecommendationReviewCoordinator.review(command)` for approval and rejection.

- [ ] **Step 1: Write dialog tests**

```ts
it('blocks consequential confirmation until a valid reason is entered', () => {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const confirm = fixture.nativeElement.querySelector('.dialog-actions .button.primary') as HTMLButtonElement;
  confirm.click();
  fixture.detectChanges();
  expect(fixture.componentInstance.confirmed).toBeNull();
  expect(fixture.nativeElement.textContent).toContain('Enter a reason of at least 8 characters.');
});

it('emits a normalized reason', () => {
  const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  textarea.value = '  Evidence reviewed by operator.  ';
  textarea.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  const confirm = fixture.nativeElement.querySelector('.dialog-actions .button.primary') as HTMLButtonElement;
  confirm.click();
  expect(fixture.componentInstance.confirmed?.reason).toBe('Evidence reviewed by operator.');
});
```

Add a no-reason test for `DRAFT_EVIDENCE_REQUEST`.

- [ ] **Step 2: Run the dialog spec and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-action-dialog.component.spec.ts'
```

Expected: component import does not exist.

- [ ] **Step 3: Implement the dialog component**

```ts
export interface ConfirmedIntelligenceAction {
  action: PreparedAction;
  reason: string;
}

@Component({
  selector: 'app-intelligence-action-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './intelligence-action-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceActionDialogComponent implements OnChanges {
  readonly action = input<PreparedAction | null>(null);
  readonly acting = input(false);
  readonly cancelled = output<void>();
  readonly confirmed = output<ConfirmedIntelligenceAction>();
  readonly reason = new FormControl('', { nonNullable: true, validators: reviewReasonValidators() });

  ngOnChanges(): void {
    this.reason.reset('');
    this.reason.markAsUntouched();
  }

  confirm(): void {
    const action = this.action();
    if (!action) return;
    if (action.requiresReason && this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    this.confirmed.emit({ action, reason: normalizeReviewReason(this.reason.value) });
  }
}
```

Move the existing action-dialog markup unchanged and call `confirm()`.

- [ ] **Step 4: Simplify route-page action state**

Remove the route-page `reason` control. Inject `RecommendationReviewCoordinator`.

Change `confirmAction()` to:

```ts
confirmAction(event: ConfirmedIntelligenceAction): void {
  const workspace = this.workspace();
  if (!workspace) return;

  if (event.action.type === 'DRAFT_EVIDENCE_REQUEST') {
    const missing = workspace.claim.missingEvidence.length
      ? workspace.claim.missingEvidence.join(', ')
      : 'supporting evidence';
    this.preparedDraft.set(`Hello ${workspace.claim.claimantName}, we are reviewing claim ${workspace.claim.claimNumber}. Please provide: ${missing}. This draft has not been sent.`);
    this.confirmationMessage.set('Evidence request draft prepared. No communication was sent and no claim state changed.');
    this.preparedAction.set(null);
    this.mode.set('action');
    return;
  }

  const recommendation = workspace.recommendation;
  if (!recommendation) return;
  const decision = event.action.type === 'APPROVE_RECOMMENDATION' ? 'APPROVED' : 'REJECTED';
  this.acting.set(true);
  this.reviewCoordinator.review({
    claimId: workspace.claim.id,
    recommendationId: recommendation.id,
    decision,
    reason: event.reason,
  }).subscribe({
    next: updatedRecommendation => {
      this.workspace.set({ ...workspace, recommendation: updatedRecommendation });
      this.confirmationMessage.set(`${this.label(decision)} review recorded with operator reason and audit event.`);
      this.preparedAction.set(null);
      this.acting.set(false);
    },
    error: (error: unknown) => {
      this.error.set(this.message(error, 'The prepared action could not be confirmed.'));
      this.acting.set(false);
    },
  });
}
```

If `IntelligenceFacadeService.reviewRecommendation` becomes unused, remove that method and update its spec.

- [ ] **Step 5: Replace dialog markup in the route page**

```html
<app-intelligence-action-dialog
  [action]="preparedAction()"
  [acting]="acting()"
  (cancelled)="cancelAction()"
  (confirmed)="confirmAction($event)"
/>
```

- [ ] **Step 6: Run dialog, coordinator, intelligence, and claim workspace tests**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/components/intelligence-action-dialog.component.spec.ts' --include='src/app/intelligence/claims-intelligence-page.component.spec.ts' --include='src/app/shared/recommendation-review/recommendation-review-coordinator.service.spec.ts' --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/intelligence/components/intelligence-action-dialog.component.* frontend/src/app/intelligence/claims-intelligence-page.component.ts frontend/src/app/intelligence/claims-intelligence-page.component.html frontend/src/app/intelligence/intelligence-facade.service.ts frontend/src/app/intelligence/intelligence-facade.service.spec.ts
git commit -m "refactor(frontend): extract intelligence action dialog"
```

---

### Task 8: Make Claims Intelligence selection cancelable and finalize orchestration tests

**Files:**
- Modify: `frontend/src/app/intelligence/claims-intelligence-page.component.ts`
- Create or modify: `frontend/src/app/intelligence/claims-intelligence-page.component.spec.ts`

**Interfaces:**
- Consumes: `IntelligenceFacadeService.loadReviewQueue()` and `loadWorkspace(claimId)`.
- Produces: latest-selection-wins orchestration; stale responses cannot replace the active dossier.

- [ ] **Step 1: Write the stale-selection regression test**

Use subjects for two workspace responses:

```ts
const firstWorkspace = new Subject<IntelligenceWorkspace>();
const secondWorkspace = new Subject<IntelligenceWorkspace>();
facade.loadWorkspace.and.callFake(id => id === 'claim-1' ? firstWorkspace : secondWorkspace);

component.select(firstItem);
component.select(secondItem);
secondWorkspace.next(secondDossier);
secondWorkspace.complete();
firstWorkspace.next(firstDossier);
firstWorkspace.complete();

expect(component.selectedId()).toBe('claim-2');
expect(component.workspace()?.claim.id).toBe('claim-2');
```

- [ ] **Step 2: Run the route-page spec and verify failure**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/claims-intelligence-page.component.spec.ts'
```

Expected: stale first response replaces the second selection under nested subscriptions.

- [ ] **Step 3: Implement a selection stream with `switchMap`**

Add:

```ts
private readonly selectedItems = new Subject<IntelligenceQueueItem>();
private readonly destroyRef = inject(DestroyRef);
```

In `ngOnInit()` establish one selection pipeline:

```ts
this.selectedItems.pipe(
  tap(item => {
    this.selectedId.set(item.claim.id);
    this.workspace.set(null);
    this.loadingWorkspace.set(true);
    this.error.set('');
    this.confirmationMessage.set('');
    this.preparedDraft.set('');
  }),
  switchMap(item => this.facade.loadWorkspace(item.claim.id).pipe(
    map(workspace => ({ workspace, error: '' })),
    catchError((error: unknown) => of({
      workspace: null,
      error: this.message(error, 'The selected intelligence dossier is unavailable.'),
    })),
  )),
  takeUntilDestroyed(this.destroyRef),
).subscribe(result => {
  this.workspace.set(result.workspace);
  this.error.set(result.error);
  this.loadingWorkspace.set(false);
});
```

Change `select(item)` to `this.selectedItems.next(item)`.

Keep the initial queue load, but call `select(items[0])` after setting the queue.

- [ ] **Step 4: Run the route-page spec and verify success**

Run the Step 2 command.

Expected: latest selection remains active even when the first request completes later.

- [ ] **Step 5: Run the full Intelligence test slice**

```bash
cd frontend
npm run test:ci -- --include='src/app/intelligence/**/*.spec.ts'
```

Expected: all Intelligence specs pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/intelligence/claims-intelligence-page.component.ts frontend/src/app/intelligence/claims-intelligence-page.component.spec.ts
git commit -m "refactor(frontend): cancel stale intelligence selection"
```

---

### Task 9: Clean up styles, documentation, and architecture descriptions

**Files:**
- Modify only if required: `frontend/src/app/intelligence/claims-intelligence-page.component.css`
- Modify: `docs/design/claimsflow-implementation-notes.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-08-02-claimsflow-final-mvp-integration.md`

**Interfaces:**
- Consumes: completed refactor file structure.
- Produces: documentation matching the delivered architecture; no visual change.

- [ ] **Step 1: Remove unreachable or duplicated Intelligence styles**

Search selectors against current templates:

```bash
rg -o '\.[a-zA-Z][a-zA-Z0-9_-]*' frontend/src/app/intelligence/claims-intelligence-page.component.css | sort -u
rg 'class="[^"]+"' frontend/src/app/intelligence -g '*.html'
```

Remove only selectors whose class is absent from every current Intelligence template. Do not rename existing classes during this pass.

- [ ] **Step 2: Document the new boundaries**

Add an architecture subsection stating:

```markdown
### Frontend feature boundaries

- `AppComponent` hosts the route outlet and optional guided-tour controller.
- `AppShellComponent` contains permanent application chrome only.
- Claims Intelligence uses a route orchestrator plus queue, dossier, assistant, and action-dialog presentation components.
- Claim Workspace and Claims Intelligence share `RecommendationReviewCoordinator`; each retains feature-specific presentation and success handling.
```

Update file-tree examples to include `shared/recommendation-review` and `intelligence/components`.

- [ ] **Step 3: Run documentation and secret scans**

```bash
rg -n 'TODO|TBD|implement later|OPENAI_API_KEY\s*=\s*[^\s]' README.md docs frontend/src || true
find . -type d \( -name node_modules -o -name dist -o -name target \) -prune -print
```

Expected: no placeholders or committed output directories; documentation contains no key value.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/intelligence/claims-intelligence-page.component.css README.md docs/design/claimsflow-implementation-notes.md docs/superpowers/plans/2026-08-02-claimsflow-final-mvp-integration.md
git commit -m "docs: record targeted frontend refactor"
```

---

### Task 10: Full verification, code review, and squash merge

**Files:**
- Review: all files changed in PR #6.
- Modify only verified defects found during review.

**Interfaces:**
- Consumes: completed Tasks 1-9.
- Produces: green exact-head CI and merged PR #6.

- [ ] **Step 1: Run the complete frontend gate**

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

Expected: dependency installation exits 0, all Karma specs pass with 0 failures, and Angular production build exits 0.

- [ ] **Step 2: Run the complete backend gate**

```bash
cd ../backend
mvn verify
mvn package
```

Expected: both commands exit 0 with no failed tests.

- [ ] **Step 3: Review the final diff against the approved design**

```bash
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
git diff origin/main...HEAD -- frontend/src/app/app.component.ts frontend/src/app/core/layout frontend/src/app/shared/recommendation-review frontend/src/app/intelligence frontend/src/app/claims/feature-detail
```

Confirm:

- `AppShellComponent` has no tour import.
- `AppComponent` hosts the tour controller once.
- Queue, dossier, assistant, and dialog are standalone components.
- Claim Workspace and Intelligence both use `RecommendationReviewCoordinator`.
- No direct duplicate review API call remains outside the coordinator and `ClaimsApiService`.
- No route, Figma-derived class, motion, or authority copy regressed.
- No secrets, `.env`, `node_modules`, `dist`, `target`, or unrelated generated artifacts appear.

- [ ] **Step 4: Request final code review**

Review base `3cd68599f1346ca966290fb3d3865fa878f72946` through the exact current head. Fix every Critical and Important finding, then repeat Steps 1-3.

- [ ] **Step 5: Wait for GitHub Actions on the exact head**

Required workflow outcomes:

```text
frontend: success
backend: success
```

Do not use a green result from an earlier SHA.

- [ ] **Step 6: Update PR #6 verification section**

Record the exact head SHA, frontend test count, frontend build result, Maven verification result, Maven package result, and final review outcome. Remove any stale claim that contradicts GitHub Actions.

- [ ] **Step 7: Squash merge PR #6**

Use title:

```text
feat: integrate and refactor final ClaimsFlow MVP (#6)
```

Use a commit message summarizing the final Figma implementation, Claims Intelligence, human-controlled review flow, targeted frontend refactor, tests, and documentation.

- [ ] **Step 8: Verify the merged result**

Confirm PR #6 reports `merged: true`, `main` points to the returned merge SHA, and the post-merge workflow is not failing. Update Figma handoff metadata from `VERIFIED_PENDING_REVIEW` to `MERGED` with the final merge SHA only after GitHub confirms the merge.

---

## Plan Self-Review

- Spec coverage: every design requirement maps to Tasks 1-10.
- Shell decoupling: Task 1.
- Shared review validation and coordinator: Tasks 2, 3, and 7.
- Queue, dossier, assistant, dialog extraction: Tasks 4-7.
- Cancelable selection: Task 8.
- Visual, accessibility, documentation preservation: Task 9 and Task 10 review checklist.
- Full exact-head verification and merge: Task 10.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or undefined interface remains.
- Type consistency: shared names are `ReviewDecision`, `RecommendationReviewCommand`, `RecommendationReviewCoordinator`, `ConfirmedIntelligenceAction`, and `reviewReasonValidators()` throughout.
