import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page team-workspace page-enter">
      <div class="team-date-row">
        <span class="sr-only">Viewing {{ team() }}</span>
        <button type="button">May 20 – May 26, 2025 <span>⌄</span></button>
      </div>

      <div class="metric-grid six-up team-metrics">
        <article *ngFor="let metric of metrics" class="workspace-metric" [attr.data-tone]="metric.tone">
          <div class="metric-accent" aria-hidden="true"></div>
          <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small [attr.data-negative]="metric.negative || null">{{ metric.trend }}</small>
        </article>
      </div>

      <div class="team-figma-grid">
        <section class="workspace-panel workload-capacity-panel">
          <header><strong>Team Workload & Capacity</strong></header>
          <div class="workload-cards">
            <article *ngFor="let item of workload">
              <span>{{ item.label }}</span>
              <div><strong>{{ item.claims }}</strong><small>Active Claims</small><i class="mini-capacity" [style.--capacity]="item.capacity + '%'" [attr.data-tone]="item.tone"><b>{{ item.capacity }}%</b></i></div>
              <footer><span>SLA {{ item.sla }}</span><i><b [style.width.%]="item.slaScore"></b></i></footer>
            </article>
          </div>
        </section>

        <section class="workspace-panel intelligence-panel">
          <header><strong>Recommendations & Intelligence</strong></header>
          <article *ngFor="let recommendation of recommendations"><i [attr.data-tone]="recommendation.tone"></i><div><strong>{{ recommendation.title }}</strong><span>{{ recommendation.detail }}</span></div><button type="button">{{ recommendation.action }}</button></article>
        </section>

        <section class="workspace-panel sla-countdown-panel">
          <header><strong>SLA Countdown (At Risk)</strong></header>
          <div *ngFor="let risk of slaRisks"><span>{{ risk.label }}</span><strong [attr.data-tone]="risk.tone">{{ risk.time }}</strong><i [attr.data-tone]="risk.tone"></i></div>
        </section>

        <section class="workspace-panel queue-table-panel">
          <header><strong>Queue Ownership</strong></header>
          <div class="queue-table-head"><span>QUEUE</span><span>OWNER</span><span>RISK</span></div>
          <div *ngFor="let queue of queues"><span>{{ queue.label }}</span><span>{{ queue.owner }}</span><strong [attr.data-tone]="queue.tone">{{ queue.risk }}</strong></div>
        </section>

        <section class="workspace-panel adjuster-capacity-panel">
          <header><strong>Adjuster Capacity</strong></header>
          <div class="capacity-donut"><b>78%</b></div>
          <small>Overall Capacity</small>
          <dl><div><dt>Total Adjusters</dt><dd>54</dd></div><div><dt>Available Now</dt><dd>15</dd></div></dl>
        </section>

        <section class="workspace-panel process-intelligence-panel">
          <header><strong>Process Intelligence</strong></header>
          <article *ngFor="let item of processIntelligence"><i [attr.data-tone]="item.tone"></i><strong>{{ item.label }}</strong><span>{{ item.detail }}</span></article>
        </section>

        <section class="workspace-panel weekly-shift-panel">
          <header><div><strong>Shift Planner</strong><span>Week of May 20 – May 26</span></div></header>
          <table aria-label="Weekly shift planner">
            <thead><tr><th></th><th *ngFor="let day of days">{{ day }}</th></tr></thead>
            <tbody><tr *ngFor="let row of shiftRows"><th>{{ row.label }}</th><td *ngFor="let value of row.values" [attr.data-tone]="row.tone">{{ value }}</td></tr></tbody>
          </table>
        </section>

        <section class="workspace-panel priority-heatmap-panel">
          <header><strong>Priority Heatmap</strong></header>
          <div *ngFor="let row of heatmap"><span>{{ row.label }}</span><i *ngFor="let tone of row.tones" [attr.data-tone]="tone"></i></div>
        </section>

        <section class="workspace-panel escalations-panel">
          <header><strong>Escalations</strong></header>
          <article *ngFor="let item of escalations"><i [attr.data-tone]="item.tone">{{ item.initials }}</i><span>{{ item.name }}</span><strong [attr.data-tone]="item.tone">{{ item.reason }}</strong><time>{{ item.time }}</time></article>
        </section>

        <section class="workspace-panel performance-panel">
          <header><strong>Performance Scorecard</strong></header>
          <article *ngFor="let score of scores"><span>{{ score.label }}</span><strong>{{ score.value }}</strong><svg viewBox="0 0 90 22" aria-hidden="true"><polyline points="0,17 13,10 26,14 38,5 51,13 64,7 77,12 90,6" /></svg></article>
        </section>

        <section class="workspace-panel operational-integrity-panel">
          <div class="integrity-mark" aria-hidden="true"></div>
          <div><strong>Operational Integrity Score</strong><span>System health, compliance, and performance</span></div>
          <b>92</b><em>EXCELLENT</em>
          <dl><div><dt>SLA Compliance</dt><dd>93.6%</dd></div><div><dt>Data Quality</dt><dd>98%</dd></div><div><dt>Audit Readiness</dt><dd>91%</dd></div></dl>
        </section>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOperationsPageComponent {
  readonly team = signal('All teams');
  readonly metrics = [
    { label: 'Total Active Claims', value: '1,389', trend: '↑ 12% vs last week', tone: 'cyan' },
    { label: 'SLA Compliance', value: '93.6%', trend: '↑ 4.3% vs last week', tone: 'green' },
    { label: 'At Risk (SLA)', value: '72', trend: '↑ 18% vs last week', tone: 'critical' },
    { label: 'Overdue', value: '28', trend: '↓ 7% vs last week', tone: 'critical', negative: true },
    { label: 'Avg. Age (Days)', value: '4.2', trend: '↓ 0.6 days vs last week', tone: 'blue', negative: true },
    { label: 'Backlog Trend', value: '↓ 8.3%', trend: '↓ vs last week', tone: 'green', negative: true },
  ];
  readonly workload = [
    { label: 'Claims Intake', claims: 42, capacity: 78, sla: '95%', slaScore: 82, tone: 'green' },
    { label: 'Adjusting Team', claims: 96, capacity: 92, sla: '93%', slaScore: 92, tone: 'amber' },
    { label: 'SIU Investigations', claims: 38, capacity: 65, sla: '90%', slaScore: 72, tone: 'green' },
    { label: 'Medical Review', claims: 51, capacity: 85, sla: '96%', slaScore: 88, tone: 'green' },
    { label: 'Payment Review', claims: 27, capacity: 71, sla: '94%', slaScore: 80, tone: 'green' },
  ];
  readonly recommendations = [
    { title: 'AI Recommendation', detail: 'Reassign 12 property claims to balance capacity.', action: 'Apply', tone: 'amber' },
    { title: 'Predicted SLA Risk', detail: '18 claims may breach SLA in the next 48 hours.', action: 'View risk', tone: 'critical' },
    { title: 'Staffing Suggestion', detail: 'Add 2 adjusters to Thursday evening shift.', action: 'View planner', tone: 'violet' },
  ];
  readonly slaRisks = [
    { label: 'Property Damage', time: '02:15:42', tone: 'critical' },
    { label: 'Bodily Injury', time: '05:47:18', tone: 'critical' },
    { label: 'Medical Expense', time: '10:22:33', tone: 'amber' },
    { label: 'Liability Claim', time: '12:50:11', tone: 'amber' },
    { label: 'Property Loss', time: '20:14:09', tone: 'green' },
  ];
  readonly queues = [
    { label: 'Claims Intake', owner: 'Sarah Connor', risk: 5, tone: 'green' },
    { label: 'Adjusting Team', owner: 'Mike Thompson', risk: 18, tone: 'critical' },
    { label: 'SIU Investigations', owner: 'Jordan Lee', risk: 7, tone: 'green' },
    { label: 'Medical Review', owner: 'Lisa Brown', risk: 3, tone: 'green' },
    { label: 'Payment Review', owner: 'David Miller', risk: 2, tone: 'green' },
  ];
  readonly processIntelligence = [
    { label: 'Medical Review bottleneck', detail: 'Workflow automation recommended.', tone: 'amber' },
    { label: 'Evening shift gap', detail: 'Thursday projected overflow.', tone: 'violet' },
    { label: 'Property queue imbalance', detail: '12 claims should be reassigned.', tone: 'cyan' },
    { label: 'First contact opportunity', detail: '8 claims need claimant outreach.', tone: 'green' },
  ];
  readonly days = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
  readonly shiftRows = [
    { label: 'Morning', values: [18, 18, 20, 18, 12, 8, 16], tone: 'green' },
    { label: 'Afternoon', values: [16, 16, 18, 16, 10, 6, 12], tone: 'cyan' },
    { label: 'Evening', values: [10, 10, 12, 12, 6, 4, 8], tone: 'muted' },
    { label: 'Total', values: [44, 44, 50, 46, 28, 18, 36], tone: 'total' },
  ];
  readonly heatmap = [
    { label: 'Critical', tones: ['green', 'green', 'amber', 'critical', 'critical'] },
    { label: 'High', tones: ['green', 'amber', 'critical', 'critical', 'green'] },
    { label: 'Medium', tones: ['amber', 'critical', 'critical', 'green', 'green'] },
    { label: 'Low', tones: ['critical', 'critical', 'green', 'green', 'amber'] },
  ];
  readonly escalations = [
    { initials: 'JD', name: 'John Doe', reason: 'SLA Breach', time: '15m', tone: 'critical' },
    { initials: 'SM', name: 'Sarah Mitchell', reason: 'Customer Escalation', time: '22m', tone: 'critical' },
    { initials: 'RB', name: 'Robert Brown', reason: 'Aged >10 Days', time: '1h', tone: 'green' },
    { initials: 'TW', name: 'Tom Wilson', reason: 'Docs Missing', time: '2h', tone: 'green' },
    { initials: 'AK', name: 'Amanda King', reason: 'High Value Claim', time: '3h', tone: 'green' },
  ];
  readonly scores = [
    { label: 'Team SLA', value: '93.6%' },
    { label: 'First Contact', value: '57.3%' },
    { label: 'Cycle Time', value: '4.2d' },
    { label: 'Satisfaction', value: '4.6/5' },
  ];

  setTeam(team: string): void {
    this.team.set(team);
  }
}
