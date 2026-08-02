import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkspaceDataService } from './workspace-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page team-workspace page-enter">
      <div class="workspace-filterbar team-filterbar"><button type="button" [class.active]="team() === 'All teams'" (click)="setTeam('All teams')">All teams <span>⌄</span></button><button type="button" [class.active]="team() === 'Property Response'" (click)="setTeam('Property Response')">Property Response <span>⌄</span></button><button type="button">Today <span>⌄</span></button><span class="selected-team">Viewing {{ team() }}</span></div>
      <div class="metric-grid six-up"><article class="workspace-metric" data-tone="cyan"><span>Active Claims</span><strong>248</strong><small>+12 today</small></article><article class="workspace-metric" data-tone="green"><span>SLA Compliance</span><strong>97.6%</strong><small>+1.8% this week</small></article><article class="workspace-metric" data-tone="amber"><span>At Risk</span><strong>17</strong><small>9 due today</small></article><article class="workspace-metric" data-tone="violet"><span>Avg. Load</span><strong>73%</strong><small>Balanced capacity</small></article><article class="workspace-metric" data-tone="blue"><span>Unassigned</span><strong>24</strong><small>4 above target</small></article><article class="workspace-metric" data-tone="magenta"><span>Quality Score</span><strong>96.8</strong><small>Top quartile</small></article></div>
      <div class="team-grid">
        <article class="workspace-panel capacity-overview"><header><strong>Workload & capacity</strong><span>Live ownership</span></header><div class="capacity-ring"><strong>73%</strong><span>utilized</span></div><div class="capacity-bars"><p *ngFor="let member of members"><span><b>{{ member.name }}</b><small>{{ member.active }} / {{ member.capacity }} active</small></span><i><em [style.width.%]="member.active / member.capacity * 100"></em></i><strong>{{ member.sla }}</strong></p></div></article>
        <article class="workspace-panel sla-panel"><header><strong>SLA command</strong><span>Next 8 hours</span></header><div class="sla-clock"><strong>01:48</strong><span>nearest breach</span></div><p><i data-tone="critical"></i><span><strong>CF-2026-0142</strong> Evidence review</span><b>1h 48m</b></p><p><i data-tone="amber"></i><span><strong>CF-2026-0134</strong> Manager approval</span><b>3h 12m</b></p><p><i data-tone="cyan"></i><span><strong>CF-2026-0128</strong> Owner assignment</span><b>5h 04m</b></p></article>
        <article class="workspace-panel recommendation-panel"><header><strong>Operations intelligence</strong><span>3 recommendations</span></header><p>Move two property claims to Elena Torres.</p><p>Open an approval focus block at 2:00 PM.</p><p>Assign the unowned evidence queue to triage.</p><button>Review recommendations →</button></article>
        <article class="workspace-panel queue-ownership"><header><strong>Queue ownership</strong><span>By team</span></header><div *ngFor="let queue of queues"><span>{{ queue.label }}</span><i><em [style.width.%]="queue.score"></em></i><b>{{ queue.value }}</b></div></article>
        <article class="workspace-panel shift-planner"><header><strong>Shift planner</strong><span>Coverage today</span></header><div class="shift-grid"><span *ngFor="let hour of hours">{{ hour }}</span><i *ngFor="let block of shiftBlocks" [attr.data-tone]="block"></i></div></article>
        <article class="workspace-panel escalation-list"><header><strong>Escalations</strong><span>4 open</span></header><p><i data-tone="critical"></i><span><strong>Coverage dispute</strong> CF-2026-0118</span><b>Executive</b></p><p><i data-tone="amber"></i><span><strong>Vendor delay</strong> CF-2026-0125</span><b>Operations</b></p><p><i data-tone="violet"></i><span><strong>Fraud review</strong> CF-2026-0139</span><b>SIU</b></p></article>
        <article class="workspace-panel integrity-strip"><header><strong>Operational integrity</strong><span>Last 24 hours</span></header><strong>99.2%</strong><p>All consequential decisions retain actor, reason, and evidence context.</p><i><b></b></i></article>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOperationsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly team = signal('All teams');
  readonly members = this.data.team;
  readonly queues = [{ label: 'Property', score: 82, value: 96 }, { label: 'Auto', score: 64, value: 74 }, { label: 'Liability', score: 55, value: 53 }, { label: 'Complex', score: 38, value: 25 }];
  readonly hours = ['08', '10', '12', '14', '16', '18'];
  readonly shiftBlocks = ['green', 'green', 'cyan', 'cyan', 'amber', 'violet', 'green', 'cyan', 'cyan', 'amber', 'violet', 'violet'];

  setTeam(team: string): void {
    this.team.set(team);
  }
}
