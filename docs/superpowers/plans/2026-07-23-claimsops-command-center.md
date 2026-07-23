# ClaimsOps Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ClaimsFlow MVP presentation with a polished, responsive ClaimsOps Command Center design in Figma and Angular while preserving every existing route, API contract, workflow rule, validation rule, and human-review requirement.

**Architecture:** Figma is the visual source of truth for foundations, reusable components, desktop screens, and responsive variants. Angular keeps the current standalone/lazy-loaded application architecture, adds global CSS custom-property tokens, extracts major page templates and styles into external files, introduces a small set of focused presentational components and pure formatting utilities, and leaves data access and business behavior unchanged.

**Tech Stack:** Figma Design and Plugin API, Angular 20.3 standalone components, TypeScript 5.8 strict mode, Reactive Forms, signals/RxJS, semantic HTML, CSS custom properties, Jasmine/Karma, ChromeHeadless, GitHub Actions.

## Global Constraints

- Preserve `/dashboard`, `/claims`, `/claims/new`, and `/claims/:id`.
- Preserve current API services, DTOs, signals, URL-backed filters, Reactive Forms, validation rules, recommendation review, and audit behavior.
- Do not add authentication, roles, saved searches, uploads, notifications, unsupported filters, historical trends, workflow-distribution analytics, or invented provider provenance.
- Do not label recommendations as OpenAI-generated; the backend may use deterministic fallback.
- Keep the desktop claims queue as a semantic HTML table.
- Meet WCAG AA contrast, preserve the skip link and form error-summary focus, and support keyboard navigation and 320px-wide layouts.
- Use text or icons in addition to color for every status.
- Use restrained 120–280ms motion and disable nonessential motion under `prefers-reduced-motion: reduce`.
- Do not add a large UI framework or global state-management library.
- Do not commit credentials, generated build output, prompt logs, or temporary screenshots.
- Required verification: `npm ci`, `npm run test:ci`, `npm run build`, and green GitHub Actions.

---

## File map

### Design artifact

- Figma file `jVmP142OtufkQZvNk8VE6y`
  - Page `01 Foundations`
  - Page `02 Components`
  - Page `03 Desktop Screens`
  - Page `04 Responsive Screens`
  - Page `05 Annotations`

### Angular files to create

- `frontend/src/app/shared/presentation/claim-presentation.ts`
- `frontend/src/app/shared/presentation/claim-presentation.spec.ts`
- `frontend/src/app/shared/ui/status-badge/status-badge.component.ts`
- `frontend/src/app/shared/ui/status-badge/status-badge.component.html`
- `frontend/src/app/shared/ui/status-badge/status-badge.component.css`
- `frontend/src/app/shared/ui/progress-indicator/progress-indicator.component.ts`
- `frontend/src/app/shared/ui/progress-indicator/progress-indicator.component.html`
- `frontend/src/app/shared/ui/progress-indicator/progress-indicator.component.css`
- `frontend/src/app/shared/ui/metric-card/metric-card.component.ts`
- `frontend/src/app/shared/ui/metric-card/metric-card.component.html`
- `frontend/src/app/shared/ui/metric-card/metric-card.component.css`
- `frontend/src/app/core/layout/app-shell.component.html`
- `frontend/src/app/core/layout/app-shell.component.css`
- `frontend/src/app/dashboard/dashboard-page.component.html`
- `frontend/src/app/dashboard/dashboard-page.component.css`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

### Angular files to modify

- `frontend/src/styles.css`
- `frontend/src/app/core/layout/app-shell.component.ts`
- `frontend/src/app/dashboard/dashboard-page.component.ts`
- `frontend/src/app/dashboard/dashboard-page.component.spec.ts`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- `README.md`

---

### Task 1: Build Figma foundations and reusable components

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`

**Interfaces:**
- Produces variable names and component names used by all later Figma screens and mirrored by Angular CSS tokens.
- Produces: `Color/*`, `Space/*`, `Radius/*`, `Typography/*`, `Button/*`, `Badge/*`, `Metric Card`, `Progress/*`, `Form Control/*`, `Evidence Card/*`, `Alert/*`, `Timeline Item`, and `Command Panel`.

- [ ] **Step 1: Create and name the five Figma pages**

Use `Figma.use_figma` and create missing pages exactly as follows:

```javascript
const names = ['01 Foundations', '02 Components', '03 Desktop Screens', '04 Responsive Screens', '05 Annotations'];
const pages = [];
for (const name of names) {
  let page = figma.root.children.find(node => node.type === 'PAGE' && node.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  pages.push({ id: page.id, name: page.name });
}
return pages;
```

Expected: five page IDs returned with no duplicate page names.

- [ ] **Step 2: Create local color variables**

Create one collection named `ClaimsOps` and these variables in the default mode:

```text
Color/Nav/Midnight        #071B2E
Color/Nav/Elevated        #0D2942
Color/Workspace           #F3F7FA
Color/Surface/Primary     #FFFFFF
Color/Surface/Secondary   #EAF1F5
Color/Text/Primary        #102235
Color/Text/Muted          #607286
Color/Border              #D5E0E8
Color/Brand/Teal          #0A8478
Color/Brand/Cyan          #27C7B8
Color/Info                #2F6FED
Color/Success             #15815D
Color/Warning             #B66A09
Color/Critical            #B93832
Color/Neutral             #64748B
```

- [ ] **Step 3: Create spacing and radius variables**

```text
Space/1  4
Space/2  8
Space/3  12
Space/4  16
Space/5  20
Space/6  24
Space/8  32
Space/10 40
Space/12 48
Radius/Control 8
Radius/Card 12
Radius/Command 16
Radius/Pill 999
```

- [ ] **Step 4: Build component variants**

Create Auto Layout components with these exact names and variants:

```text
Button / Kind=Primary|Secondary|Danger / State=Default|Hover|Disabled
Navigation Item / State=Default|Hover|Active
Badge / Type=Status|Priority / Tone=Neutral|Info|Success|Warning|Critical
Progress / Kind=Bar|Ring / Tone=Neutral|Success|Warning|Critical
Form Control / Type=Input|Select|Textarea / State=Default|Focus|Error|Disabled
Evidence Card / State=Unchecked|Checked|Missing
Alert / Tone=Info|Success|Warning|Critical
Timeline Item / Type=Created|Assigned|Status|Recommendation|Review
Command Panel
Metric Card / Tone=Primary|Neutral|Warning|Critical
```

Every component must use Auto Layout, visible focus treatment where applicable, and text/icon semantics rather than color-only meaning.

- [ ] **Step 5: Review foundations**

Use `Figma.get_screenshot` on the Foundations and Components top-level frames. Verify:

- Midnight text/surface combinations meet readable contrast.
- Teal primary buttons use white text.
- Warning and critical badges include labels/icons.
- All controls have 44px minimum interactive height where practical.
- No accidental detached duplicates remain.

- [ ] **Step 6: Record component node IDs**

Add an annotation frame containing a two-column table of component name and node ID so implementation references are stable.

---

### Task 2: Design desktop and responsive screens in Figma

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`

**Interfaces:**
- Consumes: components and variables from Task 1.
- Produces top-level frames named `Desktop / Dashboard`, `Desktop / Claims Queue`, `Desktop / New Claim`, `Desktop / Claim Workspace`, and corresponding `Mobile / ...` frames.

- [ ] **Step 1: Build `Desktop / Dashboard` at 1440×1024**

Use a 248px persistent sidebar and a flexible workspace. Include only existing dashboard data:

```text
Open claims: 7
High priority: 3
SLA risk: 2
Unassigned: 1
Incomplete: 4
Adjuster workload: Maya Chen, 5 of 12 active
Recent activity: representative existing audit entries marked as design sample data
```

Do not add trend percentages, workflow distribution, or ranked recommendation counts.

- [ ] **Step 2: Build `Desktop / Claims Queue` at 1440×1024**

Include search, status, priority, assignment, apply, reset, applied-filter chips, semantic-table layout, priority/status badges, SLA countdown plus exact timestamp, completeness bars, pagination, hover state, and keyboard-focus state.

- [ ] **Step 3: Build `Desktop / New Claim` at 1440×1100**

Keep one visual page with four sections. Use claim-type selection cards backed conceptually by one select value, evidence cards backed by checkboxes, the existing validation summary, and a sticky form-state summary that never predicts backend priority.

- [ ] **Step 4: Build `Desktop / Claim Workspace` at 1440×1200**

Include header summary, claim facts, evidence matrix, priority factors, advisory decision-support panel, human approve/reject controls, sticky assignment/status rail, and complete audit timeline. Label the module `Decision support`, not `OpenAI recommendation`.

- [ ] **Step 5: Build four mobile frames at 390px width**

Create:

```text
Mobile / Dashboard
Mobile / Claims Queue
Mobile / New Claim
Mobile / Claim Workspace
```

Queue rows become cards, the sidebar becomes a compact top bar plus visible primary destinations, form summary moves inline, and workspace actions become an accessible sticky bottom region without obscuring focus.

- [ ] **Step 6: Add annotation frames**

Document breakpoints, 120–280ms motion guidance, reduced-motion behavior, semantic HTML mapping, API-supported data boundaries, and Angular component/file mapping.

- [ ] **Step 7: Review all eight screens**

Use `Figma.get_screenshot` for each top-level frame and verify alignment, clipping, color consistency, component reuse, data authenticity, and 320px feasibility.

---

### Task 3: Add global design tokens and refactor the application shell

**Files:**
- Modify: `frontend/src/styles.css`
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Create: `frontend/src/app/core/layout/app-shell.component.html`
- Create: `frontend/src/app/core/layout/app-shell.component.css`
- Test: `frontend/src/app/app.component.spec.ts`

**Interfaces:**
- Produces CSS variables used by every later component.
- Preserves the `app-shell` selector and router outlet.

- [ ] **Step 1: Write the failing shell test**

Add assertions to `app.component.spec.ts`:

```typescript
expect(fixture.nativeElement.querySelector('.app-sidebar')).not.toBeNull();
expect(fixture.nativeElement.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
expect(fixture.nativeElement.textContent).toContain('Operations Intelligence');
expect(fixture.nativeElement.textContent).toContain('Decision support available');
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
cd frontend
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/app.component.spec.ts'
```

Expected: FAIL because the new shell classes and copy do not exist.

- [ ] **Step 3: Replace global styles with tokens and shared primitives**

Start `styles.css` with:

```css
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --color-nav-midnight: #071b2e;
  --color-nav-elevated: #0d2942;
  --color-workspace: #f3f7fa;
  --color-surface: #ffffff;
  --color-surface-secondary: #eaf1f5;
  --color-text: #102235;
  --color-text-muted: #607286;
  --color-border: #d5e0e8;
  --color-teal: #0a8478;
  --color-cyan: #27c7b8;
  --color-info: #2f6fed;
  --color-success: #15815d;
  --color-warning: #b66a09;
  --color-critical: #b93832;
  --shadow-card: 0 12px 32px rgb(7 27 46 / 0.07);
  --shadow-command: 0 24px 60px rgb(7 27 46 / 0.12);
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-command: 16px;
  --transition-fast: 160ms ease;
}

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--color-workspace); }
body { margin: 0; min-height: 100vh; color: var(--color-text); background: var(--color-workspace); }
button, input, select, textarea { font: inherit; }
a { color: var(--color-teal); }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--color-cyan);
  outline-offset: 3px;
}

.button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: var(--radius-control);
  padding: 0.7rem 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}
.button:hover:not(:disabled) { transform: translateY(-1px); }
.button.primary { color: white; background: var(--color-teal); }
.button.secondary { color: var(--color-text); background: var(--color-surface-secondary); }
.button.danger { color: white; background: var(--color-critical); }
.button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Move shell template and styles to external files**

Change component metadata to:

```typescript
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

The HTML must retain the skip link, `#main-content`, router links, and router outlet; add the approved sidebar hierarchy and generic `Decision support available` status only.

- [ ] **Step 5: Run the shell test**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles.css frontend/src/app/core/layout frontend/src/app/app.component.spec.ts
git commit -m "feat: establish ClaimsOps application shell"
```

---

### Task 4: Add pure presentation utilities and reusable status components

**Files:**
- Create: `frontend/src/app/shared/presentation/claim-presentation.ts`
- Create: `frontend/src/app/shared/presentation/claim-presentation.spec.ts`
- Create: `frontend/src/app/shared/ui/status-badge/*`
- Create: `frontend/src/app/shared/ui/progress-indicator/*`
- Create: `frontend/src/app/shared/ui/metric-card/*`

**Interfaces:**
- Produces:

```typescript
export function humanizeEnum(value: string): string;
export function formatSla(deadline: string, now?: Date): { label: string; detail: string; tone: 'neutral' | 'warning' | 'critical' };
export function completenessTone(value: number): 'neutral' | 'warning' | 'success';
```

- [ ] **Step 1: Write failing utility tests**

```typescript
import { completenessTone, formatSla, humanizeEnum } from './claim-presentation';

describe('claim presentation', () => {
  it('humanizes enum values', () => {
    expect(humanizeEnum('WAITING_FOR_INFORMATION')).toBe('Waiting For Information');
  });

  it('formats urgent and expired SLA values', () => {
    const now = new Date('2026-07-23T12:00:00Z');
    expect(formatSla('2026-07-23T17:00:00Z', now)).toEqual({
      label: 'Due in 5h',
      detail: 'Jul 23, 2026, 5:00 PM',
      tone: 'warning',
    });
    expect(formatSla('2026-07-23T10:00:00Z', now).label).toBe('Overdue by 2h');
    expect(formatSla('2026-07-23T10:00:00Z', now).tone).toBe('critical');
  });

  it('maps completeness to semantic tone', () => {
    expect(completenessTone(100)).toBe('success');
    expect(completenessTone(50)).toBe('warning');
    expect(completenessTone(80)).toBe('neutral');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared/presentation/claim-presentation.spec.ts'
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the utilities**

Use pure functions, no services, no browser globals in templates. `formatSla` must compute whole hours, use `Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })`, return `critical` for expired values, `warning` for 0–24 hours, and `neutral` otherwise.

- [ ] **Step 4: Implement reusable components**

`StatusBadgeComponent` inputs:

```typescript
readonly label = input.required<string>();
readonly tone = input<'neutral' | 'info' | 'success' | 'warning' | 'critical'>('neutral');
readonly icon = input<string>('•');
```

`ProgressIndicatorComponent` inputs:

```typescript
readonly value = input.required<number>();
readonly label = input.required<string>();
readonly tone = input<'neutral' | 'success' | 'warning' | 'critical'>('neutral');
readonly compact = input(false);
```

It must render a native `role="progressbar"` wrapper with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`, and visible numeric text.

`MetricCardComponent` inputs:

```typescript
readonly label = input.required<string>();
readonly value = input.required<number>();
readonly context = input.required<string>();
readonly tone = input<'primary' | 'neutral' | 'warning' | 'critical'>('neutral');
readonly icon = input.required<string>();
```

- [ ] **Step 5: Run utility and component tests**

Add small component tests asserting visible labels, numeric progress text, and ARIA values. Run all new specs.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/shared
git commit -m "feat: add reusable claims presentation primitives"
```

---

### Task 5: Refactor the operations dashboard

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Create: `frontend/src/app/dashboard/dashboard-page.component.html`
- Create: `frontend/src/app/dashboard/dashboard-page.component.css`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`

**Interfaces:**
- Consumes `MetricCardComponent` and existing `DashboardService` response.
- Does not create trends, charts, or unsupported metrics.

- [ ] **Step 1: Expand the dashboard test**

Assert:

```typescript
expect(fixture.nativeElement.querySelector('[aria-label="Claim metrics"]')).not.toBeNull();
expect(fixture.nativeElement.querySelectorAll('app-metric-card').length).toBe(5);
expect(fixture.nativeElement.textContent).toContain('Protect SLAs and keep decisions auditable');
expect(fixture.nativeElement.textContent).toContain('Maya Chen');
expect(fixture.nativeElement.querySelector('progress')?.getAttribute('max')).toBe('12');
```

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/dashboard/dashboard-page.component.spec.ts'
```

Expected: FAIL on new component count/copy.

- [ ] **Step 3: Move the template and styles to external files**

Use `templateUrl` and `styleUrl`. Import `MetricCardComponent`. Render exactly five metric components from existing values. Keep existing loading, error, workload, and recent-activity states.

- [ ] **Step 4: Implement the approved layout**

Use one command header, a responsive metrics grid, workload command panel, and recent activity timeline. Use semantic `section`, `article`, `ol`, and native `progress` elements.

- [ ] **Step 5: Run focused test**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/dashboard
git commit -m "feat: redesign operations dashboard"
```

---

### Task 6: Refactor the claims queue with filter chips and SLA presentation

**Files:**
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`

**Interfaces:**
- Consumes `humanizeEnum`, `formatSla`, `StatusBadgeComponent`, and `ProgressIndicatorComponent`.
- Produces `removeFilter(key: 'q' | 'status' | 'priority' | 'assignment'): void` and `activeFilters(): ReadonlyArray<{ key: 'q' | 'status' | 'priority' | 'assignment'; label: string }>`.

- [ ] **Step 1: Write failing component tests**

Use a stubbed `ActivatedRoute` and router. Assert that a query such as `status=NEW&priority=HIGH` renders two removable filter buttons and that clicking the status chip navigates with status removed while preserving priority and resetting page to 0.

Core assertion:

```typescript
expect(fixture.nativeElement.querySelectorAll('.filter-chip').length).toBe(2);
statusChip.click();
expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
  queryParams: jasmine.objectContaining({ status: undefined, priority: 'HIGH', page: 0 }),
}));
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts'
```

Expected: FAIL because filter-chip behavior does not exist.

- [ ] **Step 3: Implement filter-chip methods**

Build chips only from supported URL-backed fields. Removing a chip must preserve the other filters and reset page to 0. `reset()` continues clearing all query parameters.

- [ ] **Step 4: Externalize and redesign the template**

Keep the desktop semantic table. Add sticky headers, status and priority components, SLA label plus exact detail, completeness progress, a row hover state, clear link focus, result count, and pagination. Add a mobile card representation through CSS without duplicating data-loading logic.

- [ ] **Step 5: Run queue and codec tests**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts' --include='src/app/claims/data-access/claim-filter-codec.spec.ts'
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/claims/feature-queue
git commit -m "feat: redesign claims queue"
```

---

### Task 7: Refactor claim intake into a guided single-page form

**Files:**
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`

**Interfaces:**
- Preserves the existing `form`, request payload, validator functions, submit behavior, and error-summary focus.
- Produces computed presentation values only: completed required-field count, selected claim-type label, and evidence selected count.

- [ ] **Step 1: Add failing interaction tests**

Add tests that click the `Auto` claim-type card and `Photos` evidence card and assert:

```typescript
expect(component.form.controls.claimType.value).toBe('AUTO');
expect(component.form.controls.photosPresent.value).toBeTrue();
expect(fixture.nativeElement.textContent).toContain('1 evidence item selected');
```

Also retain the future-date and incomplete-evidence tests.

- [ ] **Step 2: Run focused tests and verify failure**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
```

Expected: FAIL because selection-card buttons and summary copy do not exist.

- [ ] **Step 3: Add presentation methods**

Implement:

```typescript
selectClaimType(value: ClaimType): void {
  this.form.controls.claimType.setValue(value);
  this.form.controls.claimType.markAsTouched();
}

toggleEvidence(control: 'incidentReportPresent' | 'photosPresent' | 'proofOfOwnershipPresent' | 'medicalDocumentationPresent'): void {
  const field = this.form.controls[control];
  field.setValue(!field.value);
  field.markAsTouched();
}
```

Use `computed()` signals or pure getters for summary counts without duplicating authoritative backend completeness logic.

- [ ] **Step 4: Externalize and redesign the form**

Use one `<form>` and one submit action. Keep actual accessible radio/select semantics for claim type and checkboxes for evidence; the cards are labels/presentation around real controls. Preserve the error summary with `tabindex="-1"`, `role="alert"`, and focus movement.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/claims/feature-create
git commit -m "feat: redesign guided claim intake"
```

---

### Task 8: Refactor the claim workspace and decision-support module

**Files:**
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

**Interfaces:**
- Preserves assignment, allowed status transitions, recommendation generation, approve/reject review, and audit refresh.
- Consumes status badge, progress indicator, SLA formatter, and enum humanizer.

- [ ] **Step 1: Write failing workspace tests**

Stub `ClaimsApiService` with a complete claim, adjusters, audit, and pending recommendation. Assert:

```typescript
expect(fixture.nativeElement.textContent).toContain('Decision support');
expect(fixture.nativeElement.textContent).toContain('Advisory only');
expect(fixture.nativeElement.textContent).not.toContain('OpenAI recommendation');
expect(fixture.nativeElement.querySelector('[aria-label="Claim completeness 75%"]')).not.toBeNull();
expect(fixture.nativeElement.querySelectorAll('.audit-event').length).toBe(2);
```

Click approve and verify `reviewRecommendation` receives the same claim ID, recommendation ID, `APPROVED`, and `Interview User`.

- [ ] **Step 2: Run focused tests and verify failure**

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

Expected: FAIL because the redesigned semantics/copy do not exist.

- [ ] **Step 3: Externalize component files**

Move template and CSS out of the TypeScript file. Keep the current methods and signals. Replace duplicate label formatting with `humanizeEnum` and calculate SLA presentation in TypeScript rather than templates.

- [ ] **Step 4: Implement the command-center workspace**

Render header summary, facts grid, evidence matrix, priority factors, advisory decision-support panel, sticky action rail, and uncropped audit timeline. Present approve and reject with text and distinct icons; keep disabled states bound to `acting()`.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/claims/feature-detail
git commit -m "feat: redesign claim workspace"
```

---

### Task 9: Complete accessibility, responsive, documentation, and visual review

**Files:**
- Modify: all new page CSS files as required
- Modify: `README.md`
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`

**Interfaces:**
- Produces final desktop/mobile parity and documentation link.

- [ ] **Step 1: Inspect responsive layouts**

Run the application and inspect at 320×700, 390×844, 768×1024, 1440×1024, and 1920×1080. Verify no horizontal page overflow, no obscured focus, and readable queue cards/action regions.

- [ ] **Step 2: Perform keyboard review**

Tab from skip link through navigation, filters, queue links, form fields, and decision actions. Verify visible focus, logical order, no keyboard traps, and error-summary focus.

- [ ] **Step 3: Perform contrast and reduced-motion review**

Use browser accessibility tooling. Fix every WCAG AA contrast failure. Enable reduced motion and verify page-entry/hover/progress animation is removed.

- [ ] **Step 4: Compare implementation to Figma**

Capture each route and compare against the corresponding Figma frame. Record only intentional deviations in `05 Annotations`.

- [ ] **Step 5: Update README**

Add a `Frontend design` section linking the Figma file and describing the ClaimsOps design system, responsive support, and the fact that recommendation provenance is intentionally not claimed by the UI.

- [ ] **Step 6: Commit**

```bash
git add README.md frontend/src Figma-design-notes-if-exported
git commit -m "docs: document ClaimsOps frontend design"
```

Do not add exported screenshots to the repository unless they are deliberately used in the PR or README and optimized.

---

### Task 10: Final verification, review, and pull request

**Files:**
- Review all files changed since `main`.

- [ ] **Step 1: Install exact dependencies**

```bash
cd frontend
npm ci
```

Expected: exit code 0 with no lockfile modification.

- [ ] **Step 2: Run the entire frontend test suite**

```bash
npm run test:ci
```

Expected: all Jasmine/Karma tests pass in ChromeHeadless.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: exit code 0 and Angular production output under `frontend/dist`.

- [ ] **Step 4: Review the diff**

Verify:

- No backend or API contract changed.
- No secrets, generated bundles, or temporary captures are tracked.
- No recommendation is labeled as OpenAI-generated.
- Existing error/loading/empty states remain.
- All major page components use external template/style files.
- CSS tokens and shared components eliminate repeated primitive styles.

- [ ] **Step 5: Push the branch and open a PR**

PR title:

```text
Revamp ClaimsFlow frontend as ClaimsOps Command Center
```

PR body must include:

- Figma link
- Scope summary
- Desktop and mobile screenshots
- Accessibility notes
- Explicit statement that workflow/API behavior is unchanged
- `npm run test:ci` result
- `npm run build` result

- [ ] **Step 6: Verify GitHub Actions**

Wait for backend and frontend jobs on the exact PR head. Inspect failing logs if any, fix the root cause, rerun local verification, and push a new commit.

- [ ] **Step 7: Request review**

Perform a code-quality review and a spec-compliance review. Resolve every material issue before presenting the PR for merge.
