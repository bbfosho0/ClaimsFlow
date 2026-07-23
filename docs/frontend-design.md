# ClaimsOps Command Center frontend

The ClaimsFlow frontend uses the **ClaimsOps Command Center** visual system: a light operational workspace anchored by midnight navigation, restrained teal and cyan accents, explicit risk signaling, compact data density, and human-governed decision support.

## Figma source of truth

- [ClaimsFlow — ClaimsOps Command Center](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y)
- [Foundations](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=1-35)
- [Reusable components](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=3-2)
- [Desktop dashboard](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=5-2)
- [Desktop claims queue](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=7-2)
- [Desktop guided intake](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=8-2)
- [Desktop claim workspace](https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=8-424)
- Responsive mobile designs for all four routes
- Accessibility, motion, data-boundary, and Angular-mapping annotations

## Angular implementation

Major route components use external templates and styles:

```text
frontend/src/app/core/layout/app-shell.component.*
frontend/src/app/dashboard/dashboard-page.component.*
frontend/src/app/claims/feature-queue/claims-queue-page.component.*
frontend/src/app/claims/feature-create/new-claim-page.component.*
frontend/src/app/claims/feature-detail/claim-detail-page.component.*
```

Global CSS custom properties in `frontend/src/styles.css` mirror the Figma palette and geometry. Reusable presentation utilities and UI primitives live under `frontend/src/app/shared/presentation` and `frontend/src/app/shared/ui`.

## Product boundaries

The redesign does not change routes, API contracts, validation, state transitions, assignment behavior, recommendation review, or audit behavior. It does not fabricate trends, saved searches, unsupported filters, provider status, or recommendation provenance.

Recommendations are labeled **Decision support** and **Advisory only**. The interface does not claim that a recommendation came from OpenAI because the backend may use the deterministic fallback. Approval or rejection remains an explicit human action.

## Accessibility and responsive behavior

- Semantic desktop claims table with responsive claim cards on smaller screens
- Visible keyboard focus and preserved skip link
- Text or icons in addition to semantic color
- Error-summary focus retained on claim intake
- Reduced-motion support
- Responsive layouts from 320px mobile through large desktop widths
- Sticky regions collapse or move inline before they can obscure focused controls

## Verification

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

The pull request must pass the independent backend and frontend GitHub Actions jobs before merge.
