# ClaimsFlow Targeted Pre-Merge Refactor Design

**Date:** 2026-08-02  
**Branch:** `feature/claimsflow-final-mvp-integration`  
**Pull request:** #6  
**Status:** Approved scope, pending implementation plan

## Purpose

Refactor the completed ClaimsFlow MVP before merge so the code is easier to understand, test, and extend without changing the approved product design, routes, API contracts, visible behavior, motion grammar, shader-equivalent materials, or human-authority rules.

This is a targeted architecture refactor, not a product redesign and not a full-stack rewrite.

## Current problems

### 1. Application shell depends on feature-specific tour infrastructure

`AppShellComponent` imports `TourControllerComponent`. The controller depends on `TourOrchestratorService`, which depends on `ClaimsApiService`, which depends on `HttpClient`.

This creates an unnecessary dependency chain for the permanent application shell and caused the shell unit test to fail when `HttpClient` was not provided. The shell should render navigation and layout without requiring claims data or guided-tour services.

### 2. Claims Intelligence is a monolithic page component

`ClaimsIntelligencePageComponent` currently owns:

- Review-queue loading and selection
- Workspace loading
- Recommendation generation
- Assistant mode state
- Evidence-request drafting
- Action preview state
- Recommendation review submission
- Confirmation and error messaging
- A large template covering queue, dossier, reasoning, assistant, and dialog UI

These responsibilities are individually understandable but too tightly combined. The page is difficult to test and increases the chance that a presentation change affects orchestration logic.

### 3. Recommendation-review behavior is duplicated

Claim Workspace and Claims Intelligence both implement the same consequential review flow:

1. Prepare approval or rejection
2. Require an operator reason
3. Preview the exact result
4. Submit a review request
5. Preserve claim workflow state
6. Display confirmation or error feedback

The visual presentations differ, but the state machine and validation rules are the same. Duplicating this flow risks divergence.

### 4. Repeated presentation helpers and state patterns

The implementation repeats small patterns for:

- Humanized enum labels
- Recommendation-review reason validation
- Pending action state
- API error normalization
- Confirmation/error reset behavior

These should be consolidated only where the shared abstraction is clear and already used by multiple features.

## Goals

- Remove feature-data dependencies from the permanent application shell.
- Split Claims Intelligence into bounded, independently testable components.
- Centralize recommendation-review state and validation without forcing Claim Workspace and Claims Intelligence into the same visual component.
- Preserve every current route, API request, response model, user-visible workflow, Figma-aligned visual contract, and accessibility behavior.
- Resolve the current frontend test failures as part of the refactor.
- Finish with a clean frontend test suite, frontend production build, backend verification, and backend package build.

## Non-goals

- No route changes.
- No backend package reorganization.
- No database or Flyway changes.
- No API shape changes beyond existing PR #6 work.
- No redesign of Operations Overview, Claims Queue, Claim Workspace, New Claim, Claims Intelligence, showcase, or tour.
- No new framework, state-management library, component library, WebGL runtime, or dependency.
- No broad refactor of Dashboard, Queue, Workspace, or New Claim beyond adapting them to the extracted review workflow.
- No authentication, deployment, messaging provider, or file-storage implementation.

## Architecture

### A. Decouple tour rendering from the application shell

The application shell will contain only permanent application chrome:

- Skip link
- Brand and navigation
- System status
- Operator identity
- Workspace outlet

The guided-tour controller will move to an application-level host that can observe route state without making `AppShellComponent` import tour feature code.

Preferred structure:

```text
AppComponent
├── RouterOutlet
└── TourControllerComponent

AppShellComponent
├── permanent navigation
└── RouterOutlet for /app children
```

`TourControllerComponent` will continue to render only when a valid tour query parameter or stored tour state is active. Moving it does not change tour behavior or routes.

This removes the dependency chain:

```text
AppShellComponent
  -> TourControllerComponent
  -> TourOrchestratorService
  -> ClaimsApiService
  -> HttpClient
```

from shell construction and shell tests.

### B. Split Claims Intelligence into four presentation components

The page remains the route-level orchestration boundary. It owns loading, selection, API coordination, and composition.

#### `IntelligenceReviewQueueComponent`

Responsibilities:

- Render queue heading, loading, empty, selected, and item states
- Emit selected queue item
- No API calls

Inputs:

- Queue items
- Selected claim ID
- Loading state

Output:

- `selected`

#### `IntelligenceDossierComponent`

Responsibilities:

- Render claim identity and signals
- Render recommendation dossier
- Render source classifications
- Render evidence reasoning graph
- Emit recommendation generation and prepared review requests

Inputs:

- Selected queue item
- Intelligence workspace
- Reasoning nodes
- Acting state

Outputs:

- `generateRecommendation`
- `prepareApproval`
- `prepareRejection`

#### `ClaimAssistantPanelComponent`

Responsibilities:

- Render Review, Investigation, and Action modes
- Render evidence-grounded answer and classified facts
- Emit mode changes and safe action requests
- Render prepared draft text

Inputs:

- Workspace
- Current mode
- Assistant answer
- Prepared draft

Outputs:

- `modeChanged`
- `prepareEvidenceRequest`
- `prepareApproval`

#### `IntelligenceActionDialogComponent`

Responsibilities:

- Render exact-result preview
- Own the operator-reason form control and validation UI
- Emit cancel or confirmed action with normalized reason
- Prevent confirmation when the reason contract is not satisfied

Inputs:

- Prepared action
- Acting state

Outputs:

- `cancelled`
- `confirmed` with `{ action, reason }`

The route page will no longer own a dialog-specific `FormControl`.

### C. Extract a shared recommendation-review coordinator

Create a small injectable coordinator or focused state utility under a shared recommendation-review boundary.

Proposed responsibility:

```text
RecommendationReviewCoordinator
├── validates and normalizes operator reason
├── maps prepared action to APPROVED or REJECTED
├── calls ClaimsApiService.reviewRecommendation(...)
├── exposes a single typed result
└── does not own presentation, routing, or claim workflow transitions
```

Both Claim Workspace and Claims Intelligence will use the coordinator for submission. Their dialogs and page state remain separate.

The coordinator must preserve these invariants:

- Reviewer identity remains `Interview User` in the demo contract.
- Operator reason is trimmed and validated before submission.
- Recommendation review never mutates claim workflow status.
- API errors remain feature-controlled and user-readable.
- Success responses remain the server-returned recommendation/workspace data.

### D. Consolidate only proven shared helpers

Create or reuse focused helpers for:

- Operator-reason validation constants
- API error message extraction
- Review-decision mapping

Do not create a generic page-state framework or global store. Signals remain local to route components.

## Data flow

### Claims Intelligence

```text
ClaimsIntelligencePageComponent
  -> IntelligenceFacadeService.loadReviewQueue()
  -> queue signal
  -> IntelligenceReviewQueueComponent

queue selection
  -> ClaimsIntelligencePageComponent.select(item)
  -> IntelligenceFacadeService.loadWorkspace(claimId)
  -> workspace signal
  -> IntelligenceDossierComponent
  -> ClaimAssistantPanelComponent

prepare review
  -> page creates PreparedAction
  -> IntelligenceActionDialogComponent
  -> confirmed(action, reason)
  -> RecommendationReviewCoordinator.review(...)
  -> updated workspace
  -> confirmation banner
```

### Claim Workspace

```text
ClaimDetailPageComponent
  -> existing recommendation UI
  -> existing review dialog
  -> RecommendationReviewCoordinator.review(...)
  -> updated recommendation
  -> audit reload / existing confirmation behavior
```

### Guided tour

```text
AppComponent
  -> TourControllerComponent
  -> TourOrchestratorService
  -> route/query/session state

AppShellComponent
  -> no tour or claims-data dependency
```

## Error handling

- Route pages remain responsible for user-visible error messages.
- Extracted presentation components do not catch API errors.
- The review coordinator returns observable errors without replacing them with generic values.
- Existing `ApiError` messages are preserved when available.
- Loading and acting states must reset in `finalize` or equivalent single-exit paths so success and failure cannot leave controls disabled.
- Queue selection must ignore stale workspace responses when a newer claim is selected. The implementation plan should use `switchMap` or an equivalent cancellation strategy rather than nested subscriptions where practical.

## Testing strategy

### Existing CI failures

Before broader refactoring, correct the two confirmed test failures:

1. `AppShellComponent` test must no longer require `HttpClient` after tour decoupling.
2. `ClaimDetailPageComponent` test must assert the rendered production markup using stable selectors and complete change detection, rather than case-sensitive copied text and hidden-tab audit rows.

### Unit coverage

Add focused tests for:

- Application shell construction without claims or HTTP providers
- Tour controller still rendering and navigating from the application-level host
- Intelligence queue selection output
- Dossier generation and review events
- Assistant mode and safe-action events
- Action dialog reason validation and normalized confirmation payload
- Recommendation review coordinator request mapping and error propagation
- Claims Intelligence route orchestration after component extraction
- Claim Workspace using the shared coordinator

### Regression gate

Run fresh verification on the final branch head:

```bash
cd frontend
npm ci
npm run test:ci
npm run build

cd ../backend
mvn verify
mvn package
```

The PR may merge only when all commands exit successfully and GitHub Actions reports successful frontend and backend jobs for the exact head SHA.

## Accessibility and visual preservation

- Preserve all existing semantic landmarks, labels, live regions, dialog roles, tab semantics, focus indicators, and keyboard behavior.
- Extracted components must retain the current DOM classes unless a test or accessibility correction requires a deliberate change.
- No changes to Figma-derived tokens, shaders, motion, density, responsive breakpoints, or route transitions.
- Dialog focus management should not regress. The action dialog must remain modal and dismissible only through existing explicit cancel/backdrop behavior while not acting.

## File organization

Proposed additions:

```text
frontend/src/app/intelligence/components/
├── intelligence-review-queue.component.*
├── intelligence-dossier.component.*
├── claim-assistant-panel.component.*
└── intelligence-action-dialog.component.*

frontend/src/app/shared/recommendation-review/
├── recommendation-review.models.ts
├── recommendation-review.validators.ts
├── recommendation-review-coordinator.service.ts
└── recommendation-review-coordinator.service.spec.ts
```

Existing page files remain at their current routes.

## Migration sequence

1. Establish failing or corrected tests for the current defects.
2. Move the tour controller to the application-level host and verify shell isolation.
3. Extract shared recommendation-review validation and coordinator.
4. Adapt Claim Workspace to the coordinator.
5. Extract Claims Intelligence queue, dossier, assistant, and dialog components one at a time.
6. Replace nested selection subscriptions with cancelable orchestration where appropriate.
7. Remove obsolete duplicated page logic and styles.
8. Run focused tests after each extraction.
9. Run the full frontend and backend verification gate.
10. Perform final PR review, update documentation only where architecture descriptions changed, and merge PR #6 using squash merge.

## Acceptance criteria

- `AppShellComponent` has no dependency on tour or claims-data services.
- Claims Intelligence route page is an orchestration component rather than a single large presentation component.
- Queue, dossier, assistant, and action dialog are independent standalone components.
- Claim Workspace and Claims Intelligence submit recommendation reviews through one shared coordinator.
- No route, API, visual, motion, responsive, or authority-boundary regression.
- Current frontend test failures are resolved for root-cause reasons, not skipped or weakened.
- Frontend tests and production build pass.
- Backend verification and package build pass.
- GitHub Actions is green for the exact PR head.
- No blocking review findings remain.
- PR #6 is squash-merged into `main` only after the full gate passes.
