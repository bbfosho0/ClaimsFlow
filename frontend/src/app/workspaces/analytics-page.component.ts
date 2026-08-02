import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WorkspaceDataService } from './workspace-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page analytics-workspace page-enter">
      <div class="workspace-filterbar">
        <button type="button" [class.active]="range() === 'Last 30 days'" (click)="setRange('Last 30 days')">Last 30 days <span>⌄</span></button>
        <button type="button" [class.active]="range() === 'Quarter to date'" (click)="setRange('Quarter to date')">Quarter to date <span>⌄</span></button>
        <button type="button">Line of Business · All <span>⌄</span></button>
        <button type="button">Claim Type · All <span>⌄</span></button>
        <button type="button">Region · All <span>⌄</span></button>
        <button type="button" class="export-control">Export Report <span>⌄</span></button>
      </div>

      <div class="metric-grid six-up">
        <article *ngFor="let metric of metrics()" class="workspace-metric" [attr.data-tone]="metric.tone">
          <div class="metric-accent" aria-hidden="true"></div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.trend }}</small>
          <i class="sparkline" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b></i>
        </article>
      </div>

      <div class="analytics-grid">
        <article class="workspace-panel span-5"><header><strong>Payout Trends</strong><span>Actual vs forecast</span></header><div class="line-chart" aria-label="Payout trend chart"><i></i><b></b></div></article>
        <article class="workspace-panel span-4"><header><strong>Resolution Performance</strong><span>Target 4.5 days</span></header><div class="line-chart compact" aria-label="Resolution chart"><i></i><b></b></div></article>
        <article class="workspace-panel span-3 region-panel"><header><strong>Claims by Region</strong><span>Paid amount</span></header><div class="region-map" aria-hidden="true"></div><ul><li>N. America <b>$2.11M</b></li><li>Europe <b>$1.04M</b></li><li>Asia Pacific <b>$862K</b></li></ul></article>
        <article class="workspace-panel span-3"><header><strong>Approval Funnel</strong><span>2,143 received</span></header><div class="funnel"><i></i><i></i><i></i><i></i></div></article>
        <article class="workspace-panel span-3 donut-panel"><header><strong>Severity Mix</strong><span>Active portfolio</span></header><div class="donut"><b>1,389</b></div></article>
        <article class="workspace-panel span-4"><header><strong>Cohort Analysis</strong><span>Resolution by age</span></header><div class="heatmap"><i *ngFor="let cell of heatmap; let index = index" [style.opacity]="0.35 + ((index % 6) * 0.1)">{{ 36 - index }}</i></div></article>
        <article class="workspace-panel span-2 benchmark-panel"><header><strong>Operational Benchmarks</strong><span>vs target</span></header><div *ngFor="let benchmark of benchmarks"><span>{{ benchmark.label }}</span><b>{{ benchmark.value }}</b><i><em [style.width.%]="benchmark.score"></em></i></div></article>
        <article class="workspace-panel span-4 insight-list"><header><strong>Trended Insights</strong><span>Generated now</span></header><p><i data-tone="cyan"></i>Payouts increased 18%, led by North America.</p><p><i data-tone="blue"></i>Resolution improved 0.6 days.</p><p><i data-tone="amber"></i>High-severity claims decreased 8%.</p></article>
        <article class="workspace-panel span-4 category-panel"><header><strong>Top Claim Categories by Payout</strong><span>Month to date</span></header><div *ngFor="let category of categories"><span>{{ category.label }}</span><i><em [style.width.%]="category.score"></em></i><b>{{ category.value }}</b></div></article>
        <article class="workspace-panel span-4 fraud-panel"><header><strong>Fraud Detection Impact</strong><span>Decision intelligence</span></header><div><article><span>Fraud Cases Detected</span><strong>134</strong><small>↑ vs prior</small></article><article><span>Fraud Savings</span><strong>$621K</strong><small>↑ vs prior</small></article><article><span>Confirmed Fraud Rate</span><strong>6.2%</strong><small>↑ vs prior</small></article></div></article>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly range = signal('Last 30 days');
  readonly heatmap = Array.from({ length: 30 });
  readonly benchmarks = [
    { label: 'First response', value: '1.6h', score: 72 },
    { label: 'Resolution', value: '4.2d', score: 78 },
    { label: 'Approval', value: '76.8%', score: 84 },
    { label: 'Accuracy', value: '98.7%', score: 94 },
  ];
  readonly categories = [
    { label: 'Property Damage', value: '$1.42M', score: 90 },
    { label: 'Liability', value: '$1.18M', score: 76 },
    { label: 'Medical', value: '$992K', score: 62 },
    { label: 'Auto Damage', value: '$678K', score: 48 },
  ];
  readonly metrics = computed(() => this.data.analyticsMetrics.map((metric, index) =>
    this.range() === 'Quarter to date' && index === 0
      ? { ...metric, value: '$12.86M', trend: '↑ 21% vs prior quarter' }
      : metric,
  ));

  setRange(range: string): void {
    this.range.set(range);
  }
}
