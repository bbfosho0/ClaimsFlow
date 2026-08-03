import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DEFAULT_OPERATIONAL_FILTERS,
  OperationalFilterOptions,
  OperationalFilters,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum } from '../shared/presentation/claim-presentation';
import { parseOperationalFilters, serializeOperationalFilters } from './analytics-page.component';

const EMPTY_OPTIONS: OperationalFilterOptions = {
  claimTypes: [], priorities: [], statuses: [], regions: [], teams: [], adjusters: [],
};

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
  templateUrl: './documents-page.component.html',
  styleUrls: ['./workspace-pages.component.css', './operational-workspaces.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();
  private release: (() => void) | null = null;

  readonly state = this.operational.evidence;
  readonly snapshot = computed(() => this.state().value);
  readonly filters = signal<OperationalFilters>(DEFAULT_OPERATIONAL_FILTERS);
  readonly selectedClaimId = signal('');
  readonly options = computed(() => this.snapshot()?.options ?? EMPTY_OPTIONS);
  readonly selected = computed(() => this.snapshot()?.selected ?? null);

  label = humanizeEnum;
  sla = formatSla;

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      const filters = parseOperationalFilters(params);
      const selectedClaimId = typeof params['selectedClaimId'] === 'string'
        ? params['selectedClaimId']
        : this.readSession('claimsflow.demoClaimId');
      this.filters.set(filters);
      this.selectedClaimId.set(selectedClaimId);
      this.release?.();
      this.release = this.operational.activateEvidence(filters, selectedClaimId);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.release?.();
  }

  updateFilters(filters: OperationalFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...serializeOperationalFilters(filters),
        selectedClaimId: this.selectedClaimId() || null,
      },
    });
  }

  selectClaim(claimId: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...serializeOperationalFilters(this.filters()),
        selectedClaimId: claimId,
      },
    });
  }

  refresh(): void {
    this.operational.refresh('evidence');
  }

  isSelected(claimId: string): boolean {
    return this.selected()?.id === claimId;
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
