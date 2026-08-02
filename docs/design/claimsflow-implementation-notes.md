# ClaimsFlow Figma Implementation Notes

This document records how the frozen Figma MVP was translated into the Angular and Spring Boot repository.

## Source of truth

- Figma file: `M7GOuna2hq7jWCGTZhiP5b`
- Production handoff: node `261:2`
- Full prototype: node `221:2`
- Final implementation plan: `docs/superpowers/plans/2026-08-02-claimsflow-final-mvp-integration.md`
- Targeted refactor design: `docs/superpowers/specs/2026-08-02-claimsflow-targeted-refactor-design.md`
- Targeted refactor plan: `docs/superpowers/plans/2026-08-02-claimsflow-targeted-refactor.md`

## Implemented product surfaces

| Figma surface | Production route |
| --- | --- |
| Cinematic showcase | `/` |
| Guided portfolio prototype | `/tour` plus route-aware controller |
| Operations Overview | `/app/dashboard` |
| Claims Queue | `/app/claims` |
| Claim Workspace | `/app/claims/:id` |
| New Claim | `/app/claims/new` |
| Claims Intelligence | `/app/intelligence` |

## Design-system translation

The implementation uses the hardened Figma token values as CSS custom properties. It does not copy Figma coordinates into DOM layout and does not introduce Tailwind or a second UI framework.

Reusable production patterns include:

- Application command rail
- Page headers and live-status indicators
- Buttons and semantic chips
- Command Field visualization
- Instrument cells
- Intervention rows
- Claims table and context inspector
- Claim identity and evidence ledger
- Decision-support and confirmation surfaces
- Four-gate intake workflow
- Claims Intelligence queue, dossier, assistant, and action preview
- Guided-tour controller

## Frontend feature boundaries

- `AppComponent` hosts the public route outlet and the optional guided-tour controller.
- `AppShellComponent` contains permanent application chrome only and has no dependency on claims data, HTTP, or tour orchestration.
- Claims Intelligence uses a route orchestrator plus standalone review-queue, dossier, assistant, and action-dialog presentation components.
- Claim Workspace and Claims Intelligence share `RecommendationReviewCoordinator`; each feature retains its own presentation, confirmation copy, success state, and audit-refresh behavior.
- `IntelligenceFacadeService` remains responsible for review-queue ranking, workspace reads, evidence classification, assistant presentation, and prepared-action descriptions. Consequential recommendation review is not duplicated there.
- Claims Intelligence selection uses `switchMap`, so an older dossier response cannot replace a newer user selection.

The refactor preserves the approved routes, API contracts, DOM classes, responsive layouts, motion grammar, shader equivalents, accessibility semantics, and human-authority boundary.

## Shader translation

The Figma source contains six native shader resources:

- Glowing Wave
- Mesh Gradient
- Water Caustic
- Pattern Grid
- Bloom
- Chromatic Metal

The web implementation uses bounded CSS and SVG equivalents:

| Figma material | Web implementation |
| --- | --- |
| Glowing Wave | SVG path gradient, dash motion, and glow filter |
| Mesh Gradient | Layered semantic radial gradients |
| Water Caustic | Selected-context radial highlights and controlled surface light |
| Pattern Grid | Low-opacity CSS grid with masks |
| Bloom | Box shadows and SVG Gaussian blur restricted to active signals |
| Chromatic Metal | Layered gradients and a slow highlight scan on the CF monogram |

Dense tables, forms, and evidence text do not receive decorative shaders. WebGL was not introduced because CSS and SVG satisfy the visual contract with less runtime and cleanup risk.

## Motion translation

The showcase implements the approved sequence:

```text
Initial
-> 650 ms delay
Signal Lock
-> 730 ms later
Ready
```

The transition changes hierarchy, Command Field emphasis, signal activity, supporting-content opacity, and material intensity. Users may skip it immediately. Reduced-motion users receive the Ready state directly.

Application motion is deliberately restrained:

- Router View Transitions for route changes
- 160 ms control interactions
- 280 ms ordinary page transitions
- 520 ms coordinated visualization transitions
- Short overlay appearance and focus restoration
- No constant card floating or scroll hijacking

## Claims Intelligence implementation

Claims Intelligence composes existing claims, recommendation, and audit APIs. It does not duplicate domain policy in Angular.

The backend now provides a read-only latest-recommendation endpoint:

```text
GET /api/claims/{claimId}/recommendations/latest
```

Recommendation review requires:

```json
{
  "decision": "APPROVED",
  "reviewer": "Interview User",
  "reason": "Evidence was reviewed and the guidance is appropriate."
}
```

The reason is validated by Spring and written into the immutable audit summary. Reviewing a recommendation does not mutate claim workflow status.

The contextual assistant is deterministic presentation logic over structured claim data. It classifies statements and prepares actions, but only the shared review coordinator and existing recommendation review API perform a consequential mutation after confirmation.

## Evidence-file boundary

The New Claim interface stages selected files and validates a 10 MB client limit. Files are not uploaded because the current backend has no object-storage or evidence-upload API.

The interface states this boundary explicitly. An invalid file preserves the claim form draft and provides retry and clear actions.

## Tour architecture

The tour uses real application routes and stable targets:

- `priority-command`
- `urgent-claim`
- `evidence-ledger`
- `decision-support`
- `new-claim-submit`
- `engineering-proof`

The controller is hosted once by `AppComponent`. It stores only progress and the selected claim ID in session storage. It does not store or fake claim domain state, and the permanent application shell can be constructed and tested without HTTP providers.

## Accessibility boundaries

Implemented accessibility features include:

- Semantic landmarks and skip link
- Real buttons, links, form labels, tables, and dialogs
- Visible keyboard focus
- Text summaries for SVG visualizations
- Color plus text or icon status encoding
- Reduced-motion handling
- Error summaries and live status regions
- Responsive table alternatives
- Explicit action-result previews

## Intentional deviations

1. **Native Figma shaders are not embedded directly in Angular.** CSS and SVG equivalents preserve the visual intent while remaining maintainable and performant.
2. **Evidence files are staged, not uploaded.** The repository does not claim a backend capability that does not exist.
3. **The assistant uses structured deterministic responses.** The optional remote provider remains behind the backend recommendation boundary rather than turning the browser into an uncontrolled chat client.
4. **The application shell adapts to bottom navigation on mobile.** This follows the responsive contract while using semantic route links rather than fixed-position Figma replicas.

## Verification commands

```bash
cd backend
mvn verify
mvn package

cd ../frontend
npm ci
npm run test:ci
npm run build
```

GitHub Actions runs frontend and backend jobs independently. Completion requires both jobs to pass from the final integration head.
