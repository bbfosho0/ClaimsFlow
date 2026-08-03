# Role-Aware ClaimsFlow Plan Self-Review

This file is part of the implementation plan and resolves the only repository-shape mismatch found during the final plan review.

## Required My Work extraction

`MyWorkPageComponent` currently lives inside:

```text
frontend/src/app/workspaces/placeholder-pages.component.ts
```

Task 11 of `2026-08-02-role-aware-claims-journey-implementation.md` must use the following exact files.

### Create

```text
frontend/src/app/workspaces/my-work-page.component.ts
frontend/src/app/workspaces/my-work-page.component.html
frontend/src/app/workspaces/my-work-page.component.css
frontend/src/app/workspaces/my-work-page.component.spec.ts
```

### Modify

```text
frontend/src/app/workspaces/placeholder-pages.component.ts
frontend/src/app/workspaces/workspace-pages.component.ts
frontend/src/app/app.routes.ts
frontend/src/app/workspaces/workspace-pages.component.spec.ts
```

### Required boundary

- Move `MyWorkPageComponent` out of `placeholder-pages.component.ts`.
- Keep `ReportsPageComponent` and `SettingsPageComponent` in `placeholder-pages.component.ts` for this implementation.
- Export `MyWorkPageComponent` from `workspace-pages.component.ts` using:

```ts
export { MyWorkPageComponent } from './my-work-page.component';
export { ReportsPageComponent, SettingsPageComponent } from './placeholder-pages.component';
```

- Keep the `/app/my-work` lazy route importing `MyWorkPageComponent` through the existing workspace barrel unless direct lazy import produces a smaller and clearer route boundary.
- Put My Work-specific tests in `my-work-page.component.spec.ts`.
- Keep `workspace-pages.component.spec.ts` for Analytics, Documents, Team Operations, and Workflows regression coverage.

## Test-first extraction sequence

1. Create `my-work-page.component.spec.ts` with the real assigned-claim behavior required by Task 11.
2. Run it and confirm failure because the focused component does not exist.
3. Extract the placeholder component into the new focused files without changing its route.
4. Replace the placeholder content with the API-backed Adjuster workspace.
5. Update the barrel exports.
6. Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/workspaces/my-work-page.component.spec.ts' --include='src/app/workspaces/workspace-pages.component.spec.ts' --include='src/app/app.routes.spec.ts'
npm run build
```

7. Commit the extraction and functional My Work change together with Task 11:

```bash
git add frontend/src/app/workspaces frontend/src/app/app.routes.ts frontend/src/app/app.routes.spec.ts
git commit -m "feat(frontend): connect adjuster journey"
```

## Review result

The reviewed plan now has concrete coverage for:

- role parsing, storage, and route ownership;
- accessible role switching;
- separate claimant navigation;
- policy-authoritative evidence changes;
- claimant-visible bounded messages;
- disabled-by-default scoped demo reset;
- reliable Jordan Lee assignment through an actual returned adjuster UUID;
- claimant, adjuster, manager, and administrator journey stages;
- truthful local workflow simulation;
- premium motion and a lazy WebGL fallback boundary;
- accessibility, mobile behavior, full verification, and rendered Visual QA.

No `TBD`, `TODO`, undefined test-only production helper, permissive demo default, or unsupported `assignment=mine` contract remains in the reviewed implementation package.
