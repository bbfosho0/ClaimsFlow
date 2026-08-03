import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  operationalFilterKey,
  parseOperationalFilters,
  serializeOperationalFilters,
} from '../core/operational-data/operational-filter-codec';
import {
  DEFAULT_OPERATIONAL_FILTERS,
  EMPTY_OPERATIONAL_FILTER_OPTIONS,
  OperationalFilters,
  TeamOperationsSnapshot,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { OperationalClockService } from '../core/operational-data/operational-clock.service';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { MetricRadialComponent } from '../shared/metrics/metric-radial.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { ChartFrameComponent } from '../shared/visualizations/chart-frame.component';
import { BarChartDatum, LineChartSeries, StackedChartSegment } from '../shared/visualizations/chart.models';
import { HorizontalBarChartComponent } from '../shared/visualizations/horizontal-bar-chart.component';
import { LineAreaChartComponent } from '../shared/visualizations/line-area-chart.component';
import { StackedBarChartComponent } from '../shared/visualizations/stacked-bar-chart.component';
import { WorkloadMatrixComponent, WorkloadMatrixRow } from '../shared/visualizations/workload-matrix.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MetricCardComponent,
    MetricRadialComponent,
    AutoAnimateDirective,
    GsapRevealDirective,
    ChartFrameComponent,
    HorizontalBarChartComponent,
    LineAreaChartComponent,
    StackedBarChartComponent,
    WorkloadMatrixComponent,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalFilterBarComponent,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './team-operations-page.component.html',
  styleUrls: [
    './workspace-pages.component.css',
    './operational-workspaces.css',
    './team-operations-midnight-violet.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOperationsPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly clock = inject(OperationalClockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();
  private release: (() => void) | null = null;
  private activeFilterKey = '';

  readonly state = this.operational.team;
  readonly snapshot = computed(() => this.state().value);
  readonly filters = signal<OperationalFilters>(DEFAULT_OPERATIONAL_FILTERS);
  readonly options = computed(() => this.snapshot()?.options ?? EMPTY_OPERATIONAL_FILTER_OPTIONS);
  readonly now = this.clock.now;

  readonly capacitySeries = computed<readonly LineChartSeries[]>(() => {
    const operations = this.snapshot();
    if (!operations) return [];
    return [{
      key: 'capacity',
      label: 'Overall utilization',
      tone: 'brand',
      area: true,
      points: (operations.capacityTrend ?? []).map(point => ({ label: point.date, value: point.utilizationPercentage })),
    }];
  });

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      const next = parseOperationalFilters(params);
      const nextKey = operationalFilterKey(next);
      this.filters.set(next);
      if (nextKey === this.activeFilterKey) return;
      this.activeFilterKey = nextKey;
      this.release?.();
      this.release = this.operational.activateTeam(next);
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
    this.operational.refresh('team');
  }

  workloadRows(operations: TeamOperationsSnapshot): readonly WorkloadMatrixRow[] {
    return operations.adjusters.map(adjuster => ({
      id: adjuster.adjusterId,
      label: adjuster.displayName,
      detail: adjuster.team,
      activeClaims: adjuster.activeClaims,
      capacity: adjuster.capacity,
      utilizationPercentage: adjuster.utilizationPercentage,
      atRiskClaims: adjuster.atRiskClaims ?? 0,
      overdueClaims: adjuster.overdueClaims ?? 0,
      evidenceReadinessPercentage: adjuster.evidenceReadinessPercentage ?? 100,
    }));
  }

  teamSlaBars(operations: TeamOperationsSnapshot): readonly BarChartDatum[] {
    return (operations.teamSlaPerformance ?? []).map(team => ({
      label: team.team,
      value: team.compliancePercentage ?? 0,
      target: 90,
      detail: team.compliancePercentage === null
        ? 'No resolved claims'
        : `${team.resolvedClaims} resolved claims`,
      tone: team.compliancePercentage === null
        ? 'neutral'
        : team.compliancePercentage >= 90
          ? 'healthy'
          : team.compliancePercentage >= 75
            ? 'warning'
            : 'critical',
    }));
  }

  prioritySegments(operations: TeamOperationsSnapshot): readonly StackedChartSegment[] {
    const totals = new Map<string, number>();
    for (const team of operations.teamPriorityMix ?? []) {
      for (const segment of team.segments) totals.set(segment.key, (totals.get(segment.key) ?? 0) + segment.count);
    }
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(key => ({
      key,
      label: key.charAt(0) + key.slice(1).toLowerCase(),
      value: totals.get(key) ?? 0,
      tone: key === 'CRITICAL' ? 'critical' : key === 'HIGH' ? 'warning' : key === 'MEDIUM' ? 'brand' : 'neutral',
    }));
  }

  integrityBars(operations: TeamOperationsSnapshot): readonly BarChartDatum[] {
    return [
      { label: 'SLA compliance · 40%', value: operations.integrity.slaCompliance, target: 90, tone: operations.integrity.slaCompliance >= 90 ? 'healthy' : 'warning' },
      { label: 'Evidence readiness · 30%', value: operations.integrity.evidenceReadiness, target: 90, tone: operations.integrity.evidenceReadiness >= 90 ? 'healthy' : 'warning' },
      { label: 'Assignment coverage · 30%', value: operations.integrity.assignmentCoverage, target: 95, tone: operations.integrity.assignmentCoverage >= 95 ? 'healthy' : 'warning' },
    ];
  }

  countdown(deadline: string): { label: string; tone: 'critical' | 'warning' | 'healthy' } {
    const remaining = new Date(deadline).getTime() - this.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return { label: 'Overdue', tone: 'critical' };
    const totalMinutes = Math.floor(remaining / 60_000);
    const days = Math.floor(totalMinutes / 1_440);
    const hours = Math.floor((totalMinutes % 1_440) / 60);
    const minutes = totalMinutes % 60;
    const label = days > 0 ? `${days}d ${hours}h` : `${hours}h ${String(minutes).padStart(2, '0')}m`;
    return { label, tone: remaining <= 24 * 60 * 60 * 1_000 ? 'warning' : 'healthy' };
  }

  integrityTone(score: number): 'healthy' | 'warning' | 'critical' {
    if (score >= 90) return 'healthy';
    if (score >= 75) return 'warning';
    return 'critical';
  }
}
