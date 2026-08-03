import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { MetricDeltaChange, MetricSparkPoint, MetricStripSegment } from '../shared/metrics/metric-card.models';
import { MetricRadialComponent } from '../shared/metrics/metric-radial.component';
import { MetricSparklineComponent } from '../shared/metrics/metric-sparkline.component';
import { MetricStackedStripComponent } from '../shared/metrics/metric-stacked-strip.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { ClaimDetail } from '../shared/models/claim.models';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum } from '../shared/presentation/claim-presentation';
import { ChartFrameComponent } from '../shared/visualizations/chart-frame.component';
import { BarChartDatum, LineChartSeries, StackedChartSegment } from '../shared/visualizations/chart.models';
import { HorizontalBarChartComponent } from '../shared/visualizations/horizontal-bar-chart.component';
import { LineAreaChartComponent } from '../shared/visualizations/line-area-chart.component';
import { StackedBarChartComponent } from '../shared/visualizations/stacked-bar-chart.component';

interface InterventionItem {
  tone: 'critical' | 'warning' | 'live' | 'advisory';
  label: string;
  detail: string;
  count: number;
  queryParams: Record<string, string>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MetricCardComponent,
    MetricRadialComponent,
    MetricSparklineComponent,
    MetricStackedStripComponent,
    ChartFrameComponent,
    LineAreaChartComponent,
    HorizontalBarChartComponent,
    StackedBarChartComponent,
    AutoAnimateDirective,
    GsapRevealDirective,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: [
    './dashboard-page.component.css',
    './dashboard-golden-journey.css',
    './dashboard-operational.css',
    './dashboard-midnight-violet.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly claims = inject(ClaimsApiService);
  private readonly route = inject(ActivatedRoute);
  private releaseDashboard: (() => void) | null = null;

  readonly state = this.operational.dashboard;
  readonly data = computed(() => this.state().value);
  readonly loading = computed(() => this.state().loading && !this.state().value);
  readonly error = computed(() => !this.state().value ? this.state().error : '');
  readonly goldenClaim = signal<ClaimDetail | null>(null);
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  readonly portfolioSeries = computed<readonly LineChartSeries[]>(() => {
    const snapshot = this.data();
    if (!snapshot) return [];
    return [
      {
        key: 'active', label: 'Active inventory', tone: 'brand', area: true,
        points: (snapshot.openPortfolioTrend ?? []).map(point => ({ label: this.dateLabel(point.date), value: point.value })),
      },
      {
        key: 'created', label: 'Created', tone: 'live',
        points: (snapshot.createdTrend ?? []).map(point => ({ label: this.dateLabel(point.date), value: point.value })),
      },
      {
        key: 'resolved', label: 'Resolved', tone: 'healthy',
        points: (snapshot.resolvedTrend ?? []).map(point => ({ label: this.dateLabel(point.date), value: point.value })),
      },
    ];
  });

  label = humanizeEnum;
  sla = formatSla;

  ngOnInit(): void {
    this.releaseDashboard = this.operational.activateDashboard();
    this.loadGoldenClaim();
  }

  ngOnDestroy(): void {
    this.releaseDashboard?.();
  }

  refresh(): void {
    this.operational.refresh('dashboard');
  }

  systemTone(snapshot: DashboardSnapshot): 'critical' | 'warning' | 'healthy' {
    if (snapshot.overdueClaims > 0) return 'critical';
    if (snapshot.slaRiskClaims > 0) return 'warning';
    return 'healthy';
  }

  systemLabel(snapshot: DashboardSnapshot): string {
    if (snapshot.overdueClaims > 0) return `${snapshot.overdueClaims} overdue ${snapshot.overdueClaims === 1 ? 'claim' : 'claims'}`;
    if (snapshot.slaRiskClaims > 0) return `${snapshot.slaRiskClaims} ${snapshot.slaRiskClaims === 1 ? 'deadline' : 'deadlines'} due <24h`;
    return 'Portfolio stable';
  }

  delta(snapshot: DashboardSnapshot, key: 'openClaims' | 'estimatedExposure' | 'slaPressure' | 'evidenceReadiness'): MetricDeltaChange | null {
    return snapshot.comparison?.[key] ?? null;
  }

  openSpark(snapshot: DashboardSnapshot): readonly MetricSparkPoint[] {
    return (snapshot.openPortfolioTrend ?? []).map(point => ({ label: point.date, value: point.value }));
  }

  exposureSpark(snapshot: DashboardSnapshot): readonly MetricSparkPoint[] {
    return (snapshot.exposureTrend ?? []).map(point => ({ label: point.date, value: point.amount }));
  }

  interventions(snapshot: DashboardSnapshot): readonly InterventionItem[] {
    const items: InterventionItem[] = [
      { tone: 'critical', label: 'Overdue claims', detail: 'Open claims have passed their service-level deadline.', count: snapshot.overdueClaims, queryParams: { sort: 'slaDeadline,asc' } },
      { tone: 'warning', label: 'SLA deadlines at risk', detail: 'Open claims are due within the next 24 hours.', count: snapshot.slaRiskClaims, queryParams: { sort: 'slaDeadline,asc' } },
      { tone: 'advisory', label: 'Evidence blockers', detail: 'Review-blocking evidence categories remain outstanding.', count: snapshot.incompleteClaims, queryParams: { sort: 'completenessPercentage,asc' } },
      { tone: 'live', label: 'Ownership unresolved', detail: 'Unassigned claims need an active reviewer.', count: snapshot.unassignedClaims, queryParams: { assignment: 'unassigned' } },
      { tone: 'advisory', label: 'High-priority review', detail: 'Critical and high-priority claims need focused review.', count: snapshot.highPriorityClaims, queryParams: { priority: 'HIGH' } },
    ];
    return items.filter(item => item.count > 0);
  }

  slaSegments(snapshot: DashboardSnapshot): readonly MetricStripSegment[] {
    return [
      { label: 'Due <24h', value: snapshot.slaRiskClaims, tone: 'warning' },
      { label: 'Overdue', value: snapshot.overdueClaims, tone: 'critical' },
    ];
  }

  slaProfile(snapshot: DashboardSnapshot): readonly StackedChartSegment[] {
    return (snapshot.slaDeadlineBands ?? []).map(point => ({ key: point.key, label: point.label, value: point.count, tone: this.slaBandTone(point.key) }));
  }

  prioritySegments(snapshot: DashboardSnapshot): readonly StackedChartSegment[] {
    return (snapshot.priorityDistribution ?? []).map(point => ({ key: point.key, label: point.label, value: point.count, tone: this.priorityTone(point.key) }));
  }

  evidenceBars(snapshot: DashboardSnapshot): readonly BarChartDatum[] {
    return (snapshot.evidenceReadinessBands ?? []).map(point => ({ label: point.label, value: point.count, detail: `${point.percentage}% of open claims`, tone: this.evidenceTone(point.key) }));
  }

  capacityBars(snapshot: DashboardSnapshot): readonly BarChartDatum[] {
    return snapshot.workload.map(item => ({
      label: item.displayName,
      value: this.utilization(item.activeClaims, item.capacity),
      target: 80,
      detail: `${item.team} · ${item.activeClaims} of ${item.capacity} active`,
      tone: this.utilization(item.activeClaims, item.capacity) >= 85 ? 'warning' : 'brand',
    }));
  }

  utilization(active: number, capacity: number): number {
    return capacity ? Math.min(100, Math.round((active / capacity) * 100)) : 0;
  }

  resolvedThisPeriod(snapshot: DashboardSnapshot): number {
    return snapshot.resolvedThisPeriod ?? Math.max(0, snapshot.totalClaims - snapshot.openClaims);
  }

  exposure(snapshot: DashboardSnapshot): number {
    return snapshot.estimatedExposure ?? 0;
  }

  comparisonPeriod(snapshot: DashboardSnapshot): string {
    return snapshot.comparison?.previousAsOf
      ? `As of ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${snapshot.comparison.previousAsOf}T00:00:00Z`))}`
      : 'Prior period';
  }

  private slaBandTone(key: string): StackedChartSegment['tone'] {
    if (key === 'OVERDUE') return 'critical';
    if (key === 'DUE_24H') return 'warning';
    if (key === 'DUE_1_3D') return 'live';
    return 'brand';
  }

  private priorityTone(key: string): StackedChartSegment['tone'] {
    if (key === 'CRITICAL') return 'critical';
    if (key === 'HIGH') return 'warning';
    if (key === 'MEDIUM') return 'brand';
    return 'neutral';
  }

  private evidenceTone(key: string): BarChartDatum['tone'] {
    if (key === 'COMPLETE') return 'healthy';
    if (key === '0_49') return 'critical';
    if (key === '50_74') return 'warning';
    return 'brand';
  }

  private dateLabel(value: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00Z`));
  }

  private loadGoldenClaim(): void {
    const claimId = this.route.snapshot.queryParamMap.get('claimId') || this.readSession('claimsflow.demoClaimId');
    if (!claimId) return;
    this.claims.get(claimId).subscribe({ next: claim => this.goldenClaim.set(claim), error: () => this.goldenClaim.set(null) });
  }

  private readSession(key: string): string {
    try { return globalThis.sessionStorage?.getItem(key) ?? ''; } catch { return ''; }
  }
}
