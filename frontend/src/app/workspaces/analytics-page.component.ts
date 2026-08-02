import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WorkspaceDataService } from './workspace-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page analytics-workspace page-enter">
      <div class="workspace-filterbar analytics-filterbar" aria-label="Analytics filters">
        <button type="button" [class.active]="range() === 'Apr 19 – May 19, 2025'" (click)="setRange('Apr 19 – May 19, 2025')">{{ range() }} <span>⌄</span></button>
        <button type="button" [class.active]="range() === 'Quarter to date'" (click)="setRange('Quarter to date')">Compare to prior 30 days <span>⌄</span></button>
        <button type="button">Line of Business · All <span>⌄</span></button>
        <button type="button">Claim Type · All <span>⌄</span></button>
        <button type="button">Region · All <span>⌄</span></button>
        <button type="button">Channel · All <span>⌄</span></button>
        <button type="button" class="export-control">Export Report <span>⌄</span></button>
      </div>

      <div class="metric-grid six-up analytics-metrics">
        <article *ngFor="let metric of metrics()" class="workspace-metric" [attr.data-tone]="metric.tone">
          <div class="metric-accent" aria-hidden="true"></div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.trend }}</small>
          <svg class="metric-sparkline" viewBox="0 0 74 24" aria-hidden="true">
            <polyline points="1,20 11,16 20,18 29,11 39,13 49,6 59,8 73,3" />
          </svg>
        </article>
      </div>

      <div class="analytics-grid">
        <article class="workspace-panel analytics-payout">
          <header><strong>Payout Trends</strong></header>
          <div class="line-chart" role="img" aria-label="Payout trend chart with actual and forecast lines"><i></i><b></b></div>
        </article>

        <article class="workspace-panel analytics-resolution">
          <header><strong>Resolution Performance</strong></header>
          <div class="line-chart compact" role="img" aria-label="Resolution performance chart"><i></i><b></b></div>
        </article>

        <article class="workspace-panel analytics-region region-panel">
          <header><strong>Claims by Region</strong></header>
          <div class="region-map" aria-hidden="true"></div>
          <ul>
            <li>N. America <b>$2.11M</b></li>
            <li>Europe <b>$1.04M</b></li>
            <li>Asia Pacific <b>$862K</b></li>
            <li>Latin America <b>$376K</b></li>
            <li>Middle East <b>$296K</b></li>
          </ul>
        </article>

        <article class="workspace-panel analytics-cycle cycle-panel">
          <header><strong>Cycle Time Analysis</strong></header>
          <div class="cycle-donut"><b>4.2d</b></div>
        </article>

        <article class="workspace-panel analytics-funnel">
          <header><strong>Approval Funnel</strong></header>
          <div class="funnel"><i></i><i></i><i></i><i></i></div>
          <p class="chart-caption">2,143 received · 1,389 approved · $4.73M paid</p>
        </article>

        <article class="workspace-panel analytics-severity donut-panel">
          <header><strong>Severity Mix</strong></header>
          <div class="donut"><b>1,389</b></div>
        </article>

        <article class="workspace-panel analytics-cohort">
          <header><strong>Cohort Analysis</strong></header>
          <div class="cohort-layout">
            <div class="cohort-labels"><span>&lt;7d</span><span>8–14d</span><span>15–30d</span><span>31–60d</span><span>&gt;60d</span></div>
            <div class="heatmap"><i *ngFor="let cell of heatmap; let index = index" [attr.data-row]="Math.floor(index / 6)">{{ cohortValues[index] }}%</i></div>
          </div>
        </article>

        <article class="workspace-panel analytics-benchmarks benchmark-panel">
          <header><strong>Operational Benchmarks</strong></header>
          <div *ngFor="let benchmark of benchmarks"><span>{{ benchmark.label }}</span><b>{{ benchmark.value }}</b><i><em [style.width.%]="benchmark.score"></em></i></div>
        </article>

        <article class="workspace-panel analytics-insights insight-list">
          <header><strong>Trended Insights</strong></header>
          <p><i data-tone="cyan"></i>Payouts increased 18%, led by North America.</p>
          <p><i data-tone="blue"></i>Resolution improved 0.6 days.</p>
          <p><i data-tone="amber"></i>High severity claims decreased 8%.</p>
        </article>

        <article class="workspace-panel analytics-categories category-panel">
          <header><strong>Top Claim Categories by Payout</strong></header>
          <div *ngFor="let category of categories"><span>{{ category.label }}</span><i><em [style.width.%]="category.score"></em></i><b>{{ category.value }}</b></div>
        </article>

        <article class="workspace-panel analytics-fraud fraud-panel">
          <header><strong>Fraud Detection Impact</strong></header>
          <div>
            <article><span>Fraud Cases Detected</span><strong>134</strong><small>↑ vs prior 30 days</small><svg viewBox="0 0 100 40" aria-hidden="true"><polyline points="0,34 18,27 34,30 49,18 64,24 80,10 94,15 100,7" /></svg></article>
            <article><span>Fraud Savings</span><strong>$621K</strong><small>↑ vs prior 30 days</small><svg viewBox="0 0 100 40" aria-hidden="true"><polyline points="0,33 18,27 33,30 48,19 64,23 78,11 91,16 100,6" /></svg></article>
            <article><span>Confirmed Fraud Rate</span><strong>6.2%</strong><small>↑ vs prior 30 days</small><svg viewBox="0 0 100 40" aria-hidden="true"><polyline points="0,34 19,28 34,31 49,18 64,24 78,11 92,16 100,8" /></svg></article>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  protected readonly Math = Math;
  private readonly data = inject(WorkspaceDataService);
  readonly range = signal('Apr 19 – May 19, 2025');
  readonly heatmap = Array.from({ length: 30 });
  readonly cohortValues = [36, 35, 34, 33, 32, 31, 29, 28, 27, 26, 25, 24, 22, 21, 20, 19, 18, 17, 15, 14, 13, 12, 11, 10, 8, 7, 6, 6, 6, 6];
  readonly benchmarks = [
    { label: 'First response', value: '1.6h', score: 62 },
    { label: 'Resolution', value: '4.2d', score: 68 },
    { label: 'Approval', value: '76.8%', score: 74 },
    { label: 'Accuracy', value: '98.7%', score: 80 },
    { label: 'Satisfaction', value: '4.6/5', score: 86 },
  ];
  readonly categories = [
    { label: 'Property Damage', value: '$1.42M', score: 90 },
    { label: 'Liability', value: '$1.18M', score: 76 },
    { label: 'Medical', value: '$992K', score: 62 },
    { label: 'Auto Damage', value: '$678K', score: 48 },
    { label: 'Business Interruption', value: '$538K', score: 38 },
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
