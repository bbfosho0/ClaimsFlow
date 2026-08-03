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
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { OperationalClockService } from '../core/operational-data/operational-clock.service';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalFilterBarComponent,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './team-operations-page.component.html',
  styleUrls: ['./workspace-pages.component.css', './operational-workspaces.css'],
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
