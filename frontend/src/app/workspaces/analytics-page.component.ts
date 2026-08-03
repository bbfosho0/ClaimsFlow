import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  operationalFilterKey,
  parseOperationalFilters,
  serializeOperationalFilters,
} from '../core/operational-data/operational-filter-codec';
import {
  AnalyticsSnapshot,
  DEFAULT_OPERATIONAL_FILTERS,
  DistributionPoint,
  EMPTY_OPERATIONAL_FILTER_OPTIONS,
  MetricChange,
  OperationalFilters,
  TimePoint,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { MetricRadialComponent } from '../shared/metrics/metric-radial.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { ChartFrameComponent } from '../shared/visualizations/chart-frame.component';
import { BarChartDatum, HeatmapRow, LineChartSeries, StackedChartSegment } from '../shared/visualizations/chart.models';
import { DistributionRingComponent } from '../shared/visualizations/distribution-ring.component';
import { HeatmapTableComponent } from '../shared/visualizations/heatmap-table.component';
import { HorizontalBarChartComponent } from '../shared/visualizations/horizontal-bar-chart.component';
import { LineAreaChartComponent } from '../shared/visualizations/line-area-chart.component';
import { StackedBarChartComponent } from '../shared/visualizations/stacked-bar-chart.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MetricCardComponent,
    MetricRadialComponent,
    AutoAnimateDirective,
    GsapRevealDirective,
    ChartFrameComponent,
    DistributionRingComponent,
    HeatmapTableComponent,
    HorizontalBarChartComponent,
    LineAreaChartComponent,
    StackedBarChartComponent,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalFilterBarComponent,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrls: [
    './workspace-pages.component.css',
    './operational-workspaces.css',
    './analytics-midnight-violet.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();
  private release: (() => void) | null = null;
  private activeFilterKey = '';

  readonly state = this.operational.analytics;
  readonly snapshot = computed(() => this.state().value);
  readonly filters = signal<OperationalFilters>(DEFAULT_OPERATIONAL_FILTERS);
  readonly options = computed(() => this.snapshot()?.options ?? EMPTY_OPERATIONAL_FILTER_OPTIONS);

  readonly volumeSeries = computed<readonly LineChartSeries[]>(() => {
    const analytics = this.snapshot();
    if (!analytics) return [];
    return [
      {
        key: 'inventory',
        label: 'Active inventory',
        tone: 'brand',
        area: true,
        points: (analytics.openPortfolioTrend ?? []).map(point => ({ label: point.date, value: point.count })),
      },
      {
        key: 'created',
        label: 'Created',
        tone: 'live',
        points: analytics.claimVolume.map(point => ({ label: point.date, value: point.count })),
      },
      {
        key: 'resolved',
        label: 'Resolved',
        tone: 'healthy',
        points: analytics.resolvedVolume.map(point => ({ label: point.date, value: point.count })),
      },
    ];
  });

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      const next = parseOperationalFilters(params);
      const nextKey = operationalFilterKey(next);
      this.filters.set(next);
      if (nextKey === this.activeFilterKey) return;
      this.activeFilterKey = nextKey;
      this.release?.();
      this.release = this.operational.activateAnalytics(next);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.release?.();
  }

  updateFilters(filters: OperationalFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: serializeOperationalFilters(filters),
    });
  }

  refresh(): void {
    this.operational.refresh('analytics');
  }

  resetFilters(): void {
    this.updateFilters(DEFAULT_OPERATIONAL_FILTERS);
  }

  statusSegments(analytics: AnalyticsSnapshot): readonly StackedChartSegment[] {
    return analytics.statusDistribution.map((point, index) => ({
      key: point.key,
      label: point.label,
      value: point.count,
      tone: (['brand', 'live', 'healthy', 'warning', 'secondary', 'neutral'] as const)[index % 6],
    }));
  }

  prioritySegments(analytics: AnalyticsSnapshot): readonly StackedChartSegment[] {
    return analytics.priorityDistribution.map(point => ({
      key: point.key,
      label: point.label,
      value: point.count,
      tone: point.key === 'CRITICAL'
        ? 'critical'
        : point.key === 'HIGH'
          ? 'warning'
          : point.key === 'MEDIUM'
            ? 'brand'
            : 'neutral',
    }));
  }

  resolutionBars(analytics: AnalyticsSnapshot): readonly BarChartDatum[] {
    return (analytics.resolutionByClaimType ?? []).map(point => ({
      label: point.label,
      value: point.averageHours ?? 0,
      detail: point.averageHours === null
        ? 'No resolved claims in this filter'
        : `${point.resolvedClaims} resolved claims`,
      tone: point.averageHours === null ? 'neutral' : 'brand',
    }));
  }

  exposureBars(analytics: AnalyticsSnapshot): readonly BarChartDatum[] {
    return (analytics.exposureByClaimType ?? []).map(point => ({
      label: point.label,
      value: point.amount,
      detail: `${point.count} claims · ${point.percentage}% of exposure`,
      tone: 'secondary',
    }));
  }

  agingBars(analytics: AnalyticsSnapshot): readonly BarChartDatum[] {
    return analytics.agingBands.map(point => ({
      label: point.label,
      value: point.count,
      detail: `${point.percentage}% of open claims`,
      tone: point.key.includes('31') ? 'critical' : point.key.includes('15') ? 'warning' : 'brand',
    }));
  }

  evidenceBars(analytics: AnalyticsSnapshot): readonly BarChartDatum[] {
    return (analytics.evidenceReadinessBands ?? []).map(point => ({
      label: point.label,
      value: point.count,
      detail: `${point.percentage}% of filtered claims`,
      tone: point.key === 'COMPLETE' ? 'healthy' : point.key === '0_49' ? 'critical' : point.key === '50_74' ? 'warning' : 'brand',
    }));
  }

  cohortRows(analytics: AnalyticsSnapshot): readonly HeatmapRow[] {
    return analytics.cohorts.map(row => ({
      key: row.weekStart,
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${row.weekStart}T00:00:00Z`)),
      cells: [
        { key: '7d', label: 'Within 7d', value: row.resolvedWithin7DaysPercentage, detail: `${row.totalClaims} claims in cohort`, tone: 'brand' },
        { key: '14d', label: 'Within 14d', value: row.resolvedWithin14DaysPercentage, detail: `${row.totalClaims} claims in cohort`, tone: 'live' },
        { key: '30d', label: 'Within 30d', value: row.resolvedWithin30DaysPercentage, detail: `${row.totalClaims} claims in cohort`, tone: 'healthy' },
      ],
    }));
  }

  delta(change: MetricChange): MetricChange {
    return change;
  }

  resolutionHelper(hours: number): string {
    if (!hours) return 'No resolved claims in this filter';
    return hours >= 48 ? `${(hours / 24).toFixed(1)} days across resolved claims` : `${hours.toFixed(1)} hours across resolved claims`;
  }

  linePoints(points: readonly TimePoint[], height = 100): string {
    if (!points.length) return '';
    const max = Math.max(1, ...points.map(point => point.count));
    const denominator = Math.max(1, points.length - 1);
    return points.map((point, index) => {
      const x = points.length === 1 ? 50 : (index / denominator) * 100;
      const y = height - (point.count / max) * (height - 12) - 6;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  pointX(index: number, total: number): number {
    return total <= 1 ? 50 : (index / (total - 1)) * 100;
  }

  pointY(point: TimePoint, points: readonly TimePoint[], height = 100): number {
    const max = Math.max(1, ...points.map(value => value.count));
    return height - (point.count / max) * (height - 12) - 6;
  }

  maxDistribution(points: readonly DistributionPoint[]): number {
    return Math.max(1, ...points.map(point => point.count));
  }

  relativeWidth(point: DistributionPoint, points: readonly DistributionPoint[]): number {
    if (point.count === 0) return 0;
    return Math.max(2, Math.round(point.count * 100 / this.maxDistribution(points)));
  }

  comparisonLabel(change: MetricChange): string {
    switch (change.kind) {
      case 'NEW': return 'New vs prior period';
      case 'CLEARED': return 'Cleared vs prior period';
      case 'UNCHANGED': return 'No change';
      case 'PERCENTAGE': {
        const value = change.percentage ?? 0;
        const prefix = value > 0 ? '+' : '';
        return `${prefix}${value.toFixed(1)}% vs prior period`;
      }
    }
  }

  comparisonTone(change: MetricChange, inverse = false): 'true' | 'false' | null {
    if (change.kind !== 'PERCENTAGE' || change.percentage === null || change.percentage === 0) return null;
    return inverse
      ? (change.percentage < 0 ? 'true' : 'false')
      : (change.percentage > 0 ? 'true' : 'false');
  }

  trackDistribution(_: number, item: DistributionPoint): string {
    return item.key;
  }
}
