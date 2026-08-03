import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { ClaimPage, ClaimPriority, ClaimStatus, ClaimSummary } from '../../shared/models/claim.models';
import {
  completenessTone,
  formatSla,
  humanizeEnum,
  priorityTone,
  statusTone,
} from '../../shared/presentation/claim-presentation';
import { ProgressIndicatorComponent } from '../../shared/ui/progress-indicator/progress-indicator.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { ClaimFilters, DEFAULT_FILTERS, parseClaimFilters, serializeClaimFilters } from '../data-access/claim-filter-codec';
import { ClaimsApiService } from '../data-access/claims-api.service';

type FilterKey = 'q' | 'status' | 'priority' | 'assignment';
type QueueDensity = 'comfortable' | 'compact';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent, ProgressIndicatorComponent],
  templateUrl: './claims-queue-page.component.html',
  styleUrl: './claims-queue-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsQueuePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ClaimsApiService);
  private readonly subscription = new Subscription();

  readonly q = new FormControl('', { nonNullable: true });
  readonly status = new FormControl<ClaimStatus | ''>('', { nonNullable: true });
  readonly priority = new FormControl<ClaimPriority | ''>('', { nonNullable: true });
  readonly assignment = new FormControl('', { nonNullable: true });
  readonly statuses: ClaimStatus[] = ['NEW', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', 'READY_FOR_DECISION', 'RESOLVED', 'CLOSED'];
  readonly priorities: ClaimPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly data = signal<ClaimPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly density = signal<QueueDensity>('comfortable');
  readonly selectedClaimId = signal('');
  readonly demoClaimId = signal(this.readSession('claimsflow.demoClaimId'));
  readonly selectedClaim = computed(() => this.data()?.content.find(claim => claim.id === this.selectedClaimId()) ?? this.data()?.content[0] ?? null);
  private filters: ClaimFilters = DEFAULT_FILTERS;

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      this.filters = parseClaimFilters(params);
      this.q.setValue(this.filters.q, { emitEvent: false });
      this.status.setValue(this.filters.status, { emitEvent: false });
      this.priority.setValue(this.filters.priority, { emitEvent: false });
      this.assignment.setValue(this.filters.assignment, { emitEvent: false });
      this.load();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  apply(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: serializeClaimFilters({
        ...this.filters,
        q: this.q.value,
        status: this.status.value,
        priority: this.priority.value,
        assignment: this.assignment.value,
        page: 0,
      }),
    });
  }

  reset(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  removeFilter(key: FilterKey): void {
    const next: ClaimFilters = { ...this.filters, page: 0 };
    if (key === 'q') next.q = '';
    if (key === 'status') next.status = '';
    if (key === 'priority') next.priority = '';
    if (key === 'assignment') next.assignment = '';
    void this.router.navigate([], { relativeTo: this.route, queryParams: serializeClaimFilters(next) });
  }

  activeFilters(): ReadonlyArray<{ key: FilterKey; label: string }> {
    const active: Array<{ key: FilterKey; label: string }> = [];
    if (this.filters.q) active.push({ key: 'q', label: `Search: ${this.filters.q}` });
    if (this.filters.status) active.push({ key: 'status', label: humanizeEnum(this.filters.status) });
    if (this.filters.priority) active.push({ key: 'priority', label: `${humanizeEnum(this.filters.priority)} priority` });
    if (this.filters.assignment) active.push({ key: 'assignment', label: humanizeEnum(this.filters.assignment) });
    return active;
  }

  goTo(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: serializeClaimFilters({ ...this.filters, page }),
    });
  }

  setDensity(value: QueueDensity): void {
    this.density.set(value);
  }

  selectClaim(claim: ClaimSummary): void {
    this.selectedClaimId.set(claim.id);
  }

  isGoldenJourney(claim: ClaimSummary): boolean {
    return Boolean(this.demoClaimId()) && claim.id === this.demoClaimId();
  }

  label = humanizeEnum;
  sla = formatSla;
  priorityTone = priorityTone;
  statusTone = statusTone;
  completenessTone = completenessTone;

  priorityIcon(value: ClaimPriority): string {
    if (value === 'CRITICAL') return '!';
    if (value === 'HIGH') return '▲';
    return '•';
  }

  statusIcon(value: ClaimStatus): string {
    if (value === 'READY_FOR_DECISION' || value === 'RESOLVED' || value === 'CLOSED') return '✓';
    if (value === 'WAITING_FOR_INFORMATION') return '!';
    return '•';
  }

  resultRange(page: ClaimPage): string {
    if (!page.totalElements) return 'No results';
    const start = page.page * page.size + 1;
    const end = Math.min(page.totalElements, start + page.content.length - 1);
    return `Showing ${start}–${end}`;
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list(this.filters).subscribe({
      next: value => {
        this.data.set(value);
        if (!value.content.some(claim => claim.id === this.selectedClaimId())) {
          const demoClaim = value.content.find(claim => this.isGoldenJourney(claim));
          this.selectedClaimId.set(demoClaim?.id ?? value.content[0]?.id ?? '');
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : 'Claims are unavailable.');
        this.loading.set(false);
      },
    });
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
