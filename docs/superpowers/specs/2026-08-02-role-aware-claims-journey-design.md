# ClaimsFlow Role-Aware Product Architecture and Golden Journey

**Status:** Approved design

**Date:** 2026-08-02

**Branch:** `design/role-aware-claims-journey`

## Summary

ClaimsFlow will become a role-aware internal claims-operations platform with a separate claimant portal. The visual ambition of the current Figma Make exploration remains, but the product will no longer expose every capability to every user through one universal eleven-item sidebar.

The redesign has one organizing sentence:

> A claimant submits evidence, an adjuster resolves the claim, a manager monitors operations, and an administrator controls the workflow.

Claims Manager is the default employer-facing persona. A profile-menu demo-role switcher lets a reviewer move instantly between Claims Manager, Adjuster, and Administrator modes without authentication. The claimant experience lives in a separate, calmer portal shell. One deterministic end-to-end claim journey is fully functional; the remaining screens stay coherent, interactive, and honest about any local-only or unsupported behavior.

## Problem

The current Angular application places all major capabilities under one shell:

- Executive Overview
- Claim Queue
- New Claim
- My Work
- Analytics
- AI Insights
- Documents
- Team Operations
- Workflow Automation
- Reports
- Settings

This is visually impressive but conceptually ambiguous. A reviewer cannot quickly tell which screens belong to a claimant, adjuster, manager, or administrator. The navigation implies that one fictional user owns personal work, claim intake, fraud investigation, document review, workforce management, reporting, workflow configuration, and system settings.

That ambiguity weakens the portfolio story even though the individual screens are strong.

## Goals

1. Make ClaimsFlow understandable within sixty seconds.
2. Preserve the strongest visual ideas from the Figma Make design.
3. Clarify who uses each capability and why.
4. Keep the employer demo fast, deterministic, and easy to navigate.
5. Demonstrate a complete customer-to-operations workflow.
6. Preserve the existing backend authority and human decision boundaries.
7. Add premium motion and atmospheric effects in the real Angular application.
8. Keep unsupported capabilities visibly bounded instead of pretending they are production integrations.

## Non-goals

- Production authentication or single sign-on
- Real backend authorization enforcement
- Multi-tenant data isolation
- A complete consumer insurance account portal
- Production payment, carrier, policy-administration, or messaging integrations
- Making every decorative or secondary control perform a server mutation
- Replacing real UI with screenshots from Figma Make
- Adding shaders to every panel or sacrificing readability for visual effects

## Product model

ClaimsFlow contains two clearly separated experiences.

### Internal employee platform

The internal platform serves Claims Managers, Adjusters, and Administrators. It uses the premium Midnight Command visual system, the dense operational shell, and role-aware navigation.

### Claimant portal

The claimant portal serves customers submitting or tracking a claim. It uses a separate shell with simpler language, fewer destinations, lower information density, and a calmer visual hierarchy.

The portal and employee platform share brand tokens and core domain data, but they do not share the same navigation model.

## Demo personas

### Claims Manager — default

**Persona:** Alex Morgan, Claims Manager

**Primary question:** What requires intervention across the operation?

**Default landing route:** `/app/dashboard`

**Visible navigation:**

1. Overview
2. Claim Queue
3. Analytics
4. AI Insights
5. Team Operations
6. Reports

**Contextual destinations:**

- Claim Workspace opens from Overview or Claim Queue.
- Documents may open within a claim context but does not need to be a permanent manager navigation item.

### Adjuster

**Persona:** Jordan Lee, Senior Adjuster

**Primary question:** What claim should I work next, and what evidence or action is missing?

**Default landing route:** `/app/my-work`

**Visible navigation:**

1. My Work
2. Claim Queue
3. Documents
4. Reports

**Contextual destinations:**

- Claim Workspace opens from My Work or Claim Queue.
- New Claim is a contextual queue action rather than a permanent sidebar destination.
- AI assistance is embedded in My Work, Claim Workspace, and Documents.

### Administrator

**Persona:** Priya Shah, Platform Administrator

**Primary question:** How is the claims workflow configured, governed, and validated?

**Default landing route:** `/app/workflows`

**Visible navigation:**

1. Workflow Automation
2. Reports
3. Settings

### Claimant

**Persona:** Taylor Reed, policyholder

**Primary question:** What does ClaimsFlow need from me, and what is happening with my claim?

**Default landing route:** `/portal`

**Visible navigation:**

1. My Claim
2. Documents
3. Messages
4. Help

The claimant is not represented as an employee demo role. The employee profile menu opens the claimant portal as a separate experience.

## Demo role switcher

The employee profile menu contains:

- Claims Manager
- Adjuster
- Administrator
- Open Claimant Portal
- Reset Demo Journey

The switcher is explicitly labeled **Demo Role**. It must never imply that it provides real authentication or authorization.

### Persistence and URL behavior

The selected employee role is stored in local storage and represented in the URL query string:

```text
/app/dashboard?role=manager
/app/my-work?role=adjuster
/app/workflows?role=admin
```

Resolution order:

1. Valid `role` query parameter
2. Previously stored demo role
3. Default role: `manager`

Switching roles updates the query parameter, stores the selection, closes the menu, and navigates to the selected role's default landing route when the current route is unavailable to the new role.

### Route access behavior

This is presentation-level demo routing, not security.

When a user attempts to open a route that is not part of the active role:

1. The application redirects to that role's default landing route.
2. A concise notice explains that the destination belongs to another demo role.
3. The notice offers a direct role switch where appropriate.

Deep links to contextual claim pages remain accessible to Manager and Adjuster roles.

## Information architecture

| Capability | Manager | Adjuster | Administrator | Claimant |
| --- | :---: | :---: | :---: | :---: |
| Executive Overview | Primary | — | — | — |
| My Work | — | Primary | — | — |
| Claim Queue | Primary | Primary | — | — |
| Claim Workspace | Contextual | Contextual | — | — |
| New Claim | — | Contextual action | — | Primary portal flow |
| Analytics | Primary | — | — | — |
| AI Insights | Primary | Embedded assistance | — | — |
| Documents | Contextual | Primary | — | Primary |
| Team Operations | Primary | — | — | — |
| Workflow Automation | — | — | Primary | — |
| Reports | Primary | Limited | Primary | — |
| Settings | — | — | Primary | — |
| Claim status and timeline | — | In claim context | — | Primary |
| Messages and requests | In claim context | In claim context | — | Primary |

Each employee role therefore sees three to six permanent destinations instead of eleven.

## Claimant portal

The claimant portal is a focused experience, not a full insurance account platform.

### Portal shell

The shell includes:

- ClaimsFlow identity
- Claim progress summary
- My Claim
- Documents
- Messages
- Help
- Customer profile menu
- Clear route back to the public showcase when appropriate

The portal uses the same dark brand family but with:

- Larger body text
- More whitespace
- Fewer simultaneous panels
- Less operational jargon
- Clear next-action language
- Reduced atmospheric intensity

### Routes

```text
/portal
/portal/claims/new
/portal/claims/:id
/portal/claims/:id/documents
/portal/claims/:id/messages
```

### Core claimant capabilities

1. Start or resume a claim.
2. Complete the guided claim intake.
3. Upload or stage evidence.
4. See status and progress.
5. Review a human-readable claim timeline.
6. Read messages and requested actions.
7. Complete a requested evidence action.

### Explicit limits

- Evidence may remain staged if object storage is unavailable.
- Messages may be represented as internal demo records when no messaging provider is configured.
- No payment, policy change, or production communication claim is made.

## Employer-facing golden journey

The existing `/tour` route becomes a concise guided demonstration of one end-to-end claim.

### Step 1 — Claimant submission

The reviewer enters the claimant portal, creates or resumes the reserved demo property-damage claim, completes intake, and adds evidence.

The backend creates or updates a real claim record and calculates:

- Claim number
- Completeness
- Priority
- SLA
- Initial workflow state

### Step 2 — Adjuster review

The demo switches to Adjuster mode. The claim appears in My Work with:

- Priority
- SLA pressure
- Evidence completeness
- Missing-information state
- Advisory AI summary
- Clear next action

The adjuster opens the Claim Workspace, reviews evidence, adds a note or requested action, and performs one allowed workflow transition.

### Step 3 — Manager impact

The demo switches to Claims Manager mode. The claim is reflected in:

- Claim Queue
- Portfolio pressure
- Team workload
- Risk or intervention state
- Audit activity
- Relevant operational metric deltas

The manager can inspect the claim but does not silently override the adjuster's consequential action.

### Step 4 — Administrator explanation

The demo switches to Administrator mode and opens the workflow responsible for routing the claim.

The reviewer can:

- Select the relevant workflow node
- Inspect its condition
- Run the existing local simulation
- See how the demo claim would travel through the workflow

The simulation remains explicitly local unless backend workflow persistence is later implemented.

### Step 5 — Audit proof

The guided journey ends by showing the immutable audit history and explaining:

- What the system calculated
- What AI recommended
- What the human decided
- What changed in claim state
- Which actions remain unsupported

## Demo journey state and reset

The golden journey must be deterministic and safe to repeat.

### Reserved demo data

Use a reserved fictional claim identity and reserved example domains. Demo records must be easy to distinguish from ordinary seed data.

### Reset behavior

`Reset Demo Journey` restores only the reserved demo records to their known baseline. It must not wipe arbitrary claims or database tables.

The reset operation is:

- Explicitly confirmed
- Idempotent
- Transactional
- Available only when the application runs with the demo capability enabled
- Covered by backend tests

A reset failure leaves the existing data intact and reports a recoverable error.

## Visual direction

The Figma Make exploration is treated as art direction, not as application architecture or generated code to copy blindly.

### Visual elements to retain and improve

- Floating rounded navigation rail
- Larger ClaimsFlow identity
- Premium cyan active-navigation surface
- Layered navy and near-black surfaces
- Crisp, larger operational typography
- Stronger metric cards
- Clearer chart illumination
- AI Copilot orb and signature card
- High-risk fraud hero
- Dense document investigation layout
- Team capacity and SLA panels
- Workflow canvas and inspector
- Consistent route-aware top bar
- Restrained cyan, teal, violet, amber, coral, and emerald accents

### Visual elements not to copy

- One global navigation containing every role's features
- React view-state architecture from Figma Make
- Invented company labels or dates
- Screenshots used as page backgrounds
- Generic card duplication
- Excessive neon or blurred decoration
- Tiny unreadable labels
- Effects that obscure operational data

## Shared employee shell

The employee shell remains consistent across Manager, Adjuster, and Administrator roles.

### Desktop

- Approximately 216 px navigation rail
- Approximately 84 px route-aware top bar
- Global search
- Notifications
- Help
- Active persona and demo-role indicator
- Role-filtered navigation
- AI Copilot surface where relevant

### Tablet

- Collapsed icon rail
- Accessible labels and tooltips
- Role menu remains available

### Mobile

- Five-item or smaller role-specific bottom navigation
- Secondary destination drawer only when required
- No horizontal overflow

## Motion system

Motion is implemented in the Angular application with CSS, SVG, Angular state, and browser-native APIs.

### Motion principles

- Clarify hierarchy and state changes.
- Keep most transitions between 140 and 300 ms.
- Avoid constant decorative motion.
- Preserve keyboard and pointer responsiveness.
- Respect `prefers-reduced-motion`.

### Motion behaviors

- Role switch: shell accent and navigation transition
- Route transition: subtle fade and short vertical settle
- Active navigation: shared highlight movement
- KPI updates: short value crossfade or count transition
- Chart entry: restrained line or bar reveal
- Claim selection: panel content transition
- Workflow simulation: connector traversal and node focus
- Risk state: limited pulse on critical score only
- Copilot: slow orb drift and response-state transition

## Shader and atmospheric effects

The actual application, not Figma, owns premium visual effects.

### Strategy

1. Prefer CSS gradients, masks, SVG filters, and Canvas-compatible effects.
2. Use WebGL only for one or two signature surfaces.
3. Lazy-load any WebGL implementation.
4. Provide a static CSS/SVG fallback.
5. Disable or simplify effects for reduced motion, low-power conditions, or failed initialization.

### Approved signature surfaces

- AI Copilot orb
- Optional bounded command-field atmosphere on the public showcase or Executive Overview

### Prohibited use

- A shader behind every card
- Continuous full-screen distortion
- Effects that reduce text contrast
- Large blocking bundles for decorative value

## Frontend architecture

Suggested focused modules:

```text
frontend/src/app/core/demo-role/
  demo-role.model.ts
  demo-role.service.ts
  demo-role-route.guard.ts

frontend/src/app/core/layout/
  employee-shell/
  claimant-shell/
  role-switcher/
  copilot-surface/

frontend/src/app/portal/
  portal-home/
  portal-claim/
  portal-documents/
  portal-messages/

frontend/src/app/demo/
  demo-journey.service.ts
  demo-reset-dialog/
```

Existing files may be refactored incrementally rather than moved wholesale when that produces a safer diff.

### Demo role model

```text
manager
adjuster
admin
```

Each role definition owns:

- Label
- Persona name and job title
- Default route
- Allowed permanent navigation items
- Allowed contextual route families
- Accent metadata where required

### Navigation

Navigation is derived from role definitions rather than hard-coded as one universal array inside the shell component.

### Route guard

The guard controls demo presentation only. Code comments, naming, and UI copy must not describe it as a security boundary.

## Backend changes

The current Spring backend remains authoritative for:

- Claim creation
- Deterministic completeness
- Priority
- SLA
- Status transitions
- Recommendation review
- Audit history

Likely backend additions:

- Reserved golden-journey seed data
- Narrow demo-reset application service
- Demo-reset endpoint enabled only under explicit configuration
- Any query needed for claimant-friendly status or messages
- Tests proving reset scope and transaction behavior

The backend does not need production users, sessions, roles, or permissions for this portfolio iteration.

## Data flow

```text
Claimant portal intake
        |
        v
Existing typed claim API
        |
        v
Spring application services and deterministic policies
        |
        +-- Claim state
        +-- Evidence metadata
        +-- Recommendation boundary
        +-- Immutable audit events
        |
        v
Manager and Adjuster projections
        |
        v
Administrator local workflow simulation
```

Role switching changes presentation and navigation. It does not alter claim data or bypass domain rules.

## Functional scope

### Fully functional golden path

```text
Claimant submits claim
→ backend creates or updates reserved demo claim
→ adjuster receives and reviews it
→ evidence or requested action changes
→ allowed status transition occurs
→ audit event is created
→ manager views reflect the change
→ administrator simulation explains routing
```

### Interactive but bounded screens

Secondary screens retain credible:

- Filters
- Selections
- Tabs
- Sorting
- Chart states
- Document preview behavior
- Local workflow simulation
- Responsive navigation

A control that does not persist must not claim that it persists.

## Error handling

### Role switching

- Invalid role query values fall back to Manager.
- Unavailable routes redirect with a short explanation.
- Local-storage failures do not block navigation.

### Claimant portal

- Failed claim load provides retry and support guidance.
- Failed evidence staging preserves the selected local file when possible.
- Missing claim IDs produce a clear not-found state.

### Demo reset

- Requires confirmation.
- Shows progress.
- Reports success only after backend confirmation.
- A failed reset does not fake completion.

### Visual effects

- Shader initialization failure silently activates the fallback.
- Effects never block page rendering or interaction.

## Accessibility

- Role selection is fully keyboard accessible.
- The active demo role is announced to assistive technology.
- Navigation changes preserve or deliberately move focus.
- Status and priority do not rely on color alone.
- Claimant copy avoids unexplained operational jargon.
- All motion honors reduced-motion preferences.
- Shader and atmospheric layers are decorative and ignored by assistive technology.
- Contrast remains sufficient above all atmospheric effects.

## Performance

- Role filtering must not duplicate route bundles.
- Existing lazy route loading remains.
- Signature visual effects are lazy-loaded.
- No effect may delay usable content.
- Prefer transform and opacity animation.
- Desktop visual QA target remains 1440 × 1180.
- Mobile visual QA target remains 390 × 844.
- Bundle growth from visual-effects code must be measured and documented.

## Testing strategy

### Frontend unit tests

- Role resolution precedence
- Role persistence
- Navigation filtering
- Default landing routes
- Invalid-role fallback
- Contextual route access
- Portal shell separation
- Reset dialog states
- Reduced-motion fallback behavior where practical

### Backend tests

- Golden claim creation or restoration
- Reset affects only reserved demo records
- Reset is idempotent
- Reset is transactional
- Existing claim rules remain authoritative
- Audit events remain immutable

### Integration and browser tests

- Complete golden journey
- Manager-to-Adjuster-to-Administrator switching
- Claimant portal submission
- Manager metrics or queue reflect the demo claim
- Unauthorized-for-role demo route redirect
- Reset and repeat the journey
- Browser console remains free of relevant errors

### Visual QA

Capture and compare:

- Manager Overview
- Manager Claim Queue
- Manager Analytics
- Adjuster My Work
- Adjuster Claim Workspace
- Administrator Workflow Automation
- Claimant portal home
- Claimant claim status
- One mobile employee screen
- One mobile claimant screen

Visual comparison must verify shell consistency, typography, panel hierarchy, role clarity, responsiveness, and signature effects.

## Acceptance criteria

The design is complete when:

1. Claims Manager is the default role.
2. The profile menu switches instantly among Manager, Adjuster, and Administrator.
3. The active role is clearly labeled as a demo role.
4. Each employee role sees no more than six permanent destinations.
5. The claimant portal has a separate shell.
6. The golden claim can move through the end-to-end journey.
7. Backend rules and audit history remain authoritative.
8. The workflow builder does not claim unsupported persistence.
9. Reset restores only reserved demo records.
10. The strongest Figma Make visual ideas are implemented as real Angular UI.
11. Premium motion and signature atmospheric effects have reduced-motion and failure fallbacks.
12. A reviewer can explain the product, users, role boundaries, AI boundary, and claim journey within sixty seconds.
13. Existing backend and frontend verification remains passing.
14. Rendered screenshots support any claim of visual completion.

## Reviewer comprehension test

After a one-minute demonstration, a reviewer should be able to answer:

1. What does ClaimsFlow do?
2. Who uses it?
3. What does each role control?
4. How does a claim move through the system?
5. Where does AI help?
6. Which decisions require a human?
7. Which parts are fully functional?
8. Which capabilities are intentionally local or simulated?

## Implementation order

The subsequent implementation plan should follow this order:

1. Demo role model and role-filtered navigation
2. Profile role switcher and route behavior
3. Separate claimant portal shell and routes
4. Golden journey data contract and reset design
5. Functional claimant-to-adjuster-to-manager flow
6. Administrator workflow explanation
7. Figma Make visual-system integration
8. Motion and signature effects
9. Accessibility, performance, and responsive hardening
10. Automated verification and rendered visual QA
