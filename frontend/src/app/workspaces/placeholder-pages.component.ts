import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="workspace-page placeholder-workspace page-enter">
      <div class="placeholder-hero"><span>PERSONAL OPERATIONS</span><h1>My Work</h1><p>A focused personal command surface for assigned claims, commitments, and upcoming decisions.</p><button>Configure workspace →</button></div>
      <div class="placeholder-grid"><article class="workspace-panel"><i>01</i><strong>Priority queue</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>02</i><strong>Today’s focus</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>03</i><strong>Upcoming approvals</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>04</i><strong>Recent activity</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article></div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkPageComponent {}

@Component({
  standalone: true,
  template: `
    <section class="workspace-page placeholder-workspace page-enter">
      <div class="placeholder-hero"><span>REPORTING CENTER</span><h1>Reports</h1><p>Scheduled operational reporting, executive exports, and governed delivery destinations.</p><button>Configure workspace →</button></div>
      <div class="placeholder-grid"><article class="workspace-panel"><i>01</i><strong>Report library</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>02</i><strong>Scheduled delivery</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>03</i><strong>Executive exports</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>04</i><strong>Distribution history</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article></div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPageComponent {}

@Component({
  standalone: true,
  template: `
    <section class="workspace-page placeholder-workspace page-enter">
      <div class="placeholder-hero"><span>WORKSPACE GOVERNANCE</span><h1>Settings</h1><p>Configuration for teams, integrations, decision controls, notifications, and data governance.</p><button>Configure workspace →</button></div>
      <div class="placeholder-grid"><article class="workspace-panel"><i>01</i><strong>Workspace profile</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>02</i><strong>Teams & permissions</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>03</i><strong>Integrations</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article><article class="workspace-panel"><i>04</i><strong>Audit policy</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article></div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {}
