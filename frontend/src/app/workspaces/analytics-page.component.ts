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
  DEFAULT_OPERATIONAL_FILTERS,
  DistributionPoint,
  EMPTY_OPERATIONAL_FILTER_OPTIONS,
  MetricChange,
  OperationalFilters,
  TimePoint,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalFilterBarComponent,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./workspace-pages.component.css', './operational-workspaces.css'],
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
