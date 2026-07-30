# ClaimsFlow Portfolio Experience Design

**Status:** Approved design specification  
**Date:** 2026-07-30  
**Repository:** `bbfosho0/ClaimsFlow`

## 1. Purpose

ClaimsFlow will become a portfolio centerpiece that demonstrates both product-design quality and real full-stack engineering. The experience must help recruiters, engineering interviewers, and product reviewers understand the project quickly, inspect its technical depth, and verify that the system is functional.

The final product will combine three connected layers:

```text
Cinematic project showcase
          ↓
Guided interactive product tour
          ↓
Fully functional ClaimsFlow application
```

The showcase explains the project. The guided tour demonstrates the core workflow. The application proves that the workflow is real.

## 2. Goals

The experience must let a viewer answer these questions without reading the repository first:

- What problem does ClaimsFlow solve?
- What makes it more than a dashboard?
- What did the developer build?
- How does the Angular frontend communicate with the Spring Boot backend?
- How are recommendations controlled by a human operator?
- How are decisions validated and audited?
- Is the product functional and inspectable?

The design must also:

- Preserve the existing Angular, Spring Boot, and PostgreSQL application as the production source of truth.
- Use the canonical dark Command Field visual system from Figma.
- Add cinematic motion only where it improves storytelling or state comprehension.
- Keep operational application screens restrained, fast, accessible, and credible.
- Provide deterministic demo data for a reliable portfolio walkthrough.
- Support reduced motion, keyboard navigation, responsive layouts, and static fallbacks.

## 3. Audience

### Recruiters

Need to understand the project, its value, and the developer's contribution within approximately two minutes.

### Engineering interviewers

Need to inspect architecture, state management, API integration, domain logic, validation, testing, performance, and cleanup behavior.

### Product and design reviewers

Need to see workflow clarity, hierarchy, interaction safeguards, accessibility, and the relationship between recommendations and human authority.

## 4. Experience Architecture

### 4.1 Showcase mode

**Primary route:** `/`  
**Alias:** `/showcase` redirects to `/`

Purpose:

- Establish the project identity.
- Explain the operational problem.
- Present the most important product and engineering decisions.
- Lead viewers into the guided tour or live application.

Primary actions:

- Take guided tour
- Open live application
- View GitHub
- Explore architecture

Showcase chapters:

1. Cinematic hero and project thesis
2. Operational problem
3. Claims lifecycle
4. System architecture
5. Human-controlled decision support
6. Reliability, auditability, accessibility, and performance
7. Transition into the live application

### 4.2 Guided tour mode

**Primary route:** `/tour`

Purpose:

- Demonstrate the core workflow without requiring the viewer to explore blindly.
- Use real application routes and deterministic seeded data.
- Explain product value and technical implementation in parallel.

The tour remains interactive. It highlights and suggests actions but does not lock the interface.

### 4.3 Application mode

**Routes:**

```text
/app/dashboard
/app/claims
/app/claims/:id
/app/claims/new
```

Purpose:

- Prove that ClaimsFlow is a real working application.
- Preserve operational credibility.
- Allow unrestricted exploration after the guided tour.

Motion inside application mode must remain restrained and functional.

## 5. Visual Direction

### 5.1 Concept

The design language is **Operational Signal Intelligence**.

Claims are represented as operational signals moving through a controlled system:

- Evidence appears as structured data fragments.
- Risk appears as pressure and concentration.
- Recommendations appear as assistive intelligence.
- Decisions appear as deliberate state transitions.
- Audit history appears as an immutable sequence of events.

The product should feel like a premium enterprise command system, not a generic cyberpunk dashboard.

### 5.2 Semantic color system

| Signal | Meaning |
|---|---|
| Teal | healthy flow, completion, primary action |
| Cyan | live data, system activity, navigation |
| Violet | recommendation intelligence |
| Amber | approaching SLA or incomplete work |
| Red | immediate operational risk |
| Blue-gray neutrals | structure, history, secondary information |

Glow indicates active information. It is not decoration.

### 5.3 Signature visual components

#### Command Field

A bounded telemetry surface showing portfolio risk concentration. It may respond subtly to pointer position and scroll progress.

#### Claim Lifecycle Trace

A connected visualization of claim state, evidence, recommendation, decision, and audit events.

#### Architecture Signal Map

A technical visualization of Angular, REST, Spring Boot, domain policies, PostgreSQL, and audit boundaries.

These components must support typed inputs, resizing, cleanup, reduced motion, static fallback rendering, and visible text equivalents.

## 6. Showcase Story and Motion

### 6.1 Scene 1: System initialization

The page begins near black. The ClaimsFlow identity and Command Field resolve in sequence:

1. A scanning line establishes the frame.
2. Grid structure appears.
3. Radar rings resolve.
4. Claim signals enter.
5. The priority count stabilizes at `17`.
6. The project thesis appears.
7. Primary actions become available.

Target duration: 1.8 to 2.4 seconds.

The sequence must be interruptible. User input immediately completes it.

### 6.2 Scene 2: Operational problem

As the hero compresses, the 17 priority signals divide into:

- SLA risk
- Missing evidence
- Unassigned ownership
- High severity

The visualization and copy explain why claims operations require prioritization, traceability, and explicit ownership.

### 6.3 Scene 3: Claims lifecycle

A representative claim moves through:

```text
New
  → Under review
  → Waiting for evidence
  → Recommendation ready
  → Human decision
  → Closed
```

The scene identifies validation boundaries, audit events, evidence dependencies, and decision points.

### 6.4 Scene 4: Architecture reveal

The interface separates into:

```text
Angular interface
      ↓
REST boundary
      ↓
Spring Boot services
      ↓
Domain policies
      ↓
PostgreSQL and audit history
```

Connections animate only when explaining data flow.

### 6.5 Scene 5: Human authority

The recommendation layer appears in violet, but the decision controls remain visually dominant.

The scene demonstrates:

1. Recommendation generated
2. Evidence inspected
3. Operator approves or rejects
4. Reason recorded
5. Audit event appended

The product statement is explicit: intelligence assists the operator and does not silently control the workflow.

### 6.6 Scene 6: Live system transition

The final showcase viewport aligns with the real Operations Overview screen. Case-study decoration recedes while the application shell remains.

The transition should feel like entering the system, not opening a different website.

## 7. Guided Tour

### 7.1 Duration and behavior

- Target primary path: approximately 90 seconds
- Six steps
- No autoplay by default
- Previous, next, skip, collapse, exit, and technical-details controls
- Keyboard accessible
- Session-scoped progress
- Direct linking through query parameters

Examples:

```text
/tour?step=workspace
/app/claims/142?tour=decision
```

### 7.2 Tour controller

The controller is compact and subordinate to the product.

It includes:

- Current step and total steps
- Step title
- Why the step matters
- Previous and next actions
- Exit action
- Expandable technical details
- Progress indicator

Desktop placement: lower-right, with collision-aware repositioning.  
Mobile placement: bottom sheet or compact dock that avoids primary controls.

### 7.3 Step 1: Portfolio pressure

**Surface:** Operations Overview

Demonstrates:

- 248 active claims
- 17 requiring intervention
- SLA, evidence, and ownership pressure
- Decision-oriented prioritization

Technical proof:

- Angular services
- Signal-based view state
- Aggregated portfolio API data

### 7.4 Step 2: Prioritized queue

**Surface:** Claims Queue

Demonstrates:

- Operational sorting
- Filter state
- Selected-row context
- SLA countdown
- Assignment state
- Evidence state

The tour highlights `CF-2026-0142`.

### 7.5 Step 3: Claim investigation

**Surface:** Claim Workspace

Demonstrates:

1. Claim dossier
2. Evidence ledger
3. Audit timeline
4. Recommendation panel
5. Decision controls

A shared-element transition may connect the queue row to the workspace when supported.

### 7.6 Step 4: Human-controlled decision

The viewer selects approve or reject.

A confirmation interface requires a reason before the decision can be submitted.

After confirmation:

- Claim state updates
- Recommendation state updates
- Audit event appears
- Success feedback is shown
- Relevant portfolio metrics update

The workflow must use the real backend transition in production.

### 7.7 Step 5: New claim intake

**Surface:** New Claim

Demonstrates:

- Progressive disclosure
- Validation
- Evidence upload
- Duplicate or policy checks
- Submission state
- Backend triage result

The viewer completes final submission manually.

### 7.8 Step 6: Technical proof

The tour ends with:

- Architecture Signal Map
- Repository link
- Test summary
- API boundaries
- Accessibility strategy
- Performance targets
- Key engineering decisions

Final actions:

- Continue exploring
- Restart guided tour
- View source
- Read case study

## 8. Demo Data Strategy

The tour uses deterministic seeded data.

Required primary record:

```text
CF-2026-0142
Morgan Ellis
Property claim
High severity
Missing evidence
Near SLA deadline
Recommendation available
Complete audit history
Valid approve and reject paths
```

Preferred production structure:

```text
Demo profile
    ↓
Dedicated seeded database or isolated schema
    ↓
Reset endpoint available only in demo mode
```

Requirements:

- Reset must not affect normal application data.
- The primary path must be repeatable.
- The frontend must not fake the entire workflow.
- Backend services must process state transitions.
- Demo reset controls must be unavailable outside demo mode.

## 9. Optional Failure and Recovery Demonstrations

Failure states are optional expansions, not blockers in the primary tour.

Supported examples:

- API unavailable
- Evidence upload failure
- Validation error
- Recommendation unavailable
- Concurrent claim update
- Submission retry

Every failure state must explain:

1. What failed
2. What data remains safe
3. What the user can do next
4. Whether retry is automatic or manual

## 10. Motion Architecture

### 10.1 Native CSS and Angular

Use for:

- Route view transitions
- Component entry and exit
- Dialogs and drawers
- Toasts
- Button feedback
- Loading states
- Selection states
- Simple metric updates

Prefer Angular 20 compiler-supported entry and exit animation patterns and the browser View Transitions API where appropriate.

### 10.2 GSAP

Use only for coordinated sequences that justify a timeline engine:

- Showcase scroll choreography
- Architecture reveal
- Lifecycle choreography
- Shared-element transitions
- Coordinated SVG telemetry
- Hero-to-application transformation

All GSAP timelines and ScrollTriggers must be scoped, killable, and cleaned up when their Angular component is destroyed.

### 10.3 Three.js or WebGL

Use only for the bounded showcase Command Field hero.

Requirements:

- One active WebGL canvas maximum
- Pause when outside the viewport
- Pause or reset when the tab is hidden
- Cap device pixel ratio
- Dispose geometry, materials, textures, renderer resources, and event listeners
- Provide a non-WebGL fallback
- Disable or simplify on low-power mobile devices

The application dashboard should use SVG or Canvas 2D unless WebGL performance is explicitly proven acceptable.

## 11. Motion Rules

Motion must explain hierarchy, causality, state, or navigation.

Do not use:

- Scroll hijacking
- Constant card floating
- Repetitive upward fade effects
- Continuous decorative motion in operational screens
- Full-screen shaders on mobile
- Input-blocking sequences
- Delayed controls for theatrical effect

Timing guidance inside the application:

| Interaction | Duration |
|---|---:|
| Route transition | 180 to 260 ms |
| Dialog or drawer | 180 to 220 ms |
| Metric update | 300 to 500 ms |
| Chart drawing | 500 to 800 ms |
| Selection feedback | under 160 ms |
| Success confirmation | under 600 ms |
| Hover translation | maximum 2 px |

## 12. Accessibility

- Honor `prefers-reduced-motion` throughout.
- Replace cinematic sequences with immediate states and short opacity changes under reduced motion.
- Keep every animated explanation available as visible text.
- Support keyboard operation for the full tour.
- Preserve visible focus rings.
- Ensure dialog focus is trapped and restored correctly.
- Announce asynchronous state changes where needed.
- Do not rely on pointer motion, color, or animation as the only source of meaning.
- Provide static visualization fallbacks with equivalent labels and summaries.

## 13. Performance Targets

Target Core Web Vitals:

- LCP at or below 2.5 seconds
- INP at or below 200 milliseconds
- CLS at or below 0.1

Additional requirements:

- Lazy-load showcase-only motion dependencies.
- Do not load Three.js on application-only routes.
- Defer non-critical visualizations.
- Pause animation outside the viewport.
- Avoid layout-changing animation properties.
- Prefer transforms and opacity.
- Verify memory after repeated navigation.
- Test low-power and mobile fallbacks.

## 14. Production Component Boundaries

### 14.1 Showcase system

```text
showcase/
  showcase-page
  showcase-hero
  problem-narrative
  lifecycle-story
  architecture-story
  decision-story
  technical-proof
```

Responsibilities:

- Scroll-based storytelling
- Product explanation
- Technical evidence
- Entry into tour or application

### 14.2 Tour system

```text
tour/
  tour-orchestrator
  tour-controller
  tour-step-registry
  tour-highlight
  tour-technical-details
  tour-session-state
```

The tour system owns presentation state and navigation guidance. It must not contain claims business logic.

Each tour step defines:

- Route
- Target interface element
- Required demo state
- Explanatory copy
- Technical proof
- Completion condition

### 14.3 Motion system

```text
core/motion/
  motion-preferences
  route-transition
  scroll-orchestrator
  shared-element-transition
  animation-budget
```

Responsibilities:

- Reduced-motion preferences
- Route transitions
- GSAP lifecycle and cleanup
- Visibility pausing
- Motion timing tokens
- Animation-budget enforcement

### 14.4 Telemetry system

```text
shared/visualizations/
  command-field
  claim-lifecycle-trace
  architecture-signal-map
  pressure-curve
  instrument-band
```

Each visualization must expose a typed input model and a textual summary.

### 14.5 Existing application system

Existing dashboard, claims queue, workspace, intake, services, backend workflows, validation, and persistence remain the functional source of truth.

Target frontend structure:

```text
frontend/src/app/
  showcase/
  tour/
  dashboard/
  claims/
  core/
    layout/
    motion/
    telemetry/
  shared/
    ui/
    visualizations/
```

This structure is directional. The implementation must follow current repository conventions and avoid unrelated refactoring.

## 15. Figma Prototype Scope

The Figma prototype validates interaction, hierarchy, timing, and storytelling. It does not reproduce backend behavior.

### Included

1. Showcase hero initialization and primary actions
2. Guided-tour controller and six-step progress
3. Operations Overview priority interaction
4. Claims Queue filtering, selected claim, and inspector state
5. Claim Workspace tabs and decision paths
6. Approve and reject confirmation states
7. New Claim progressive states, validation, upload, and submission
8. Technical proof and architecture state
9. Key mobile states for hero, controller, queue, workspace, and confirmation

### Excluded

- Real API calls
- Real persistence
- Complete keyboard simulation
- Every field-validation combination
- Every responsive breakpoint interaction
- Production shader code
- Every failure state as an independent flow
- A second fake implementation of ClaimsFlow

## 16. Testing Strategy

### Unit tests

Test:

- Tour step transitions
- Route and query parsing
- Session-state behavior
- Reduced-motion decisions
- Visualization input mapping
- Confirmation requirements
- Animation cleanup
- Demo reset behavior

### Component tests

Verify:

- Tour controller behavior
- Technical-details expansion
- Dialog focus management
- Decision confirmation
- New Claim validation
- Loading and failure states
- Static visualization fallbacks

### Integration tests

Verify:

- Showcase to tour
- Showcase to application
- Tour to application
- Queue to workspace
- Recommendation decision to audit update
- New Claim submission to created workspace
- Demo-data reset

### End-to-end path

```text
Open showcase
→ start guided tour
→ inspect urgent claim
→ review evidence
→ approve or reject recommendation
→ verify audit event
→ create a new claim
→ exit into live application
```

### Visual regression widths

- 1440 px
- 1024 px
- 768 px
- 390 px

Capture:

- Showcase hero
- Operations Overview
- Claims Queue
- Claim Workspace
- Decision confirmation
- New Claim
- Reduced-motion variants

### Performance verification

Test:

- Initial showcase load
- Application route load
- Hero canvas cost
- Scroll performance
- Memory after repeated navigation
- WebGL disposal
- Hidden-tab behavior
- Low-power fallback

## 17. Figma and Production Handoff

The canonical Figma file remains the design source of truth:

`ClaimsFlow Canonical Dark Product System, Attempt 2`

The prototype must extend the existing final pages rather than replace them.

Production implementation must:

- Translate the Figma system into Angular components and project-native CSS.
- Avoid generated React and Tailwind code.
- Preserve existing services, models, routes, business rules, and tests unless a scoped change is required.
- Treat animation specifications as behavioral guidance, not a reason to copy absolute Figma coordinates into production.

## 18. Research Basis

The direction is informed by current practices in product tours, high-end product storytelling, and performance-aware motion:

- Vercel virtual product tour design: `https://vercel.com/blog/designing-the-vercel-virtual-product-tour`
- Vercel interface guidelines: `https://vercel.com/design/guidelines`
- Linear design refinement: `https://linear.app/now/behind-the-latest-design-refresh`
- GSAP ScrollTrigger documentation: `https://gsap.com/docs/v3/Plugins/ScrollTrigger/`
- Angular route transition documentation: `https://angular.dev/guide/routing/route-transition-animations`
- Angular animation guidance: `https://angular.dev/guide/animations`
- Three.js official examples and renderer guidance: `https://threejs.org/examples/`
- Core Web Vitals guidance: `https://web.dev/articles/vitals`
- W3C reduced-motion guidance: `https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html`

## 19. Definition of Done

The portfolio experience is complete when:

- The showcase explains ClaimsFlow without requiring repository reading.
- The guided tour completes in approximately 90 seconds.
- The real application remains fully usable without the tour.
- The main workflow uses real backend transitions.
- The demo state is deterministic and resettable.
- Recommendations never bypass explicit human authority.
- Motion is restrained in operational workflows.
- Reduced-motion mode preserves all information and controls.
- Visual implementation closely matches the canonical Figma system.
- Tests cover the showcase-to-decision journey.
- The experience remains fast on ordinary laptops and mobile devices.
- Source code, architecture, and implementation evidence are easy to inspect.

## 20. Approved Implementation Sequence

```text
Approved design specification
        ↓
Figma interaction prototype
        ↓
Prototype visual and interaction QA
        ↓
Detailed implementation plan
        ↓
Local Codex production implementation
        ↓
Automated and browser verification
        ↓
GitHub pull request
        ↓
Final Figma-to-code audit
```
