import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OperationalDataStore } from '../../core/operational-data/operational-data.store';
import {
  Adjuster,
  ClaimPage,
  ClaimPriority,
  ClaimRegion,
  ClaimStatus,
  ClaimSummary,
  ClaimType,
} from '../../shared/models/claim.models';
import { ChangedValueDirective } from '../../shared/operational/changed-value.directive';
import { OperationalRefreshStatusComponent } from '../../shared/operational/operational-refresh-status.component';
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

type FilterKey = 'q' | 'from' | 'to' | 'claimType' | 'status' | 'priority' | 'assignment' | 'adjusterId' | 'team' | 'region';
type QueueDensity = 'comfortable' | 'compact';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    StatusBadgeComponent,
    ProgressIndicatorComponent,
    ChangedValueDirective,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './claims-queue-page.component.html',
  styleUrls: ['./claims-queue-page.component.css', './claims-queue-golden-journey.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsQueuePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ClaimsApiService);
  private readonly operational = inject(OperationalDataStore);
  private readonly subscription = new Subscription();
  private releaseQueue: (() => void) | null = null;

  readonly q = new FormControl('', { nonNullable: true });
  readonly from = new FormControl('', { nonNullable: true });
  readonly to = new FormControl('', { nonNullable: true });
  readonly claimType = new FormControl<ClaimType | ''>('', { nonNullable: true });
  readonly status = new FormControl<ClaimStatus | ''>('', { nonNullable: true });
  readonly priority = new FormControl<ClaimPriority | ''>('', { nonNullable: true });
  readonly assignment = new FormControl('', { nonNullable: true });
  readonly adjusterId = new FormControl('', { nonNullable: true });
  readonly team = new FormControl('', { nonNullable: true });
  readonly region = new FormControl<ClaimRegion | ''>('', { nonNullable: true });

  readonly statuses: ClaimStatus[] = ['NEW', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', 'READY_FOR_DECISION', 'RESOLVED', 'CLOSED'];
  readonly priorities: ClaimPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly claimTypes: ClaimType[] = ['AUTO', 'PROPERTY', 'PERSONAL_INJURY'];
  readonly regions: ClaimRegion[] = ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST'];
  readonly adjusters = signal<readonly Adjuster[]>([]);
  readonly teams = computed(() => Array.from(new Set(this.adjusters().map(item => item.team).filter((value): value is string => Boolean(value)))).sort());

  readonly state = this.operational.queue;
  readonly data = computed(() => this.state().value);
  readonly loading = computed(() => this.state().loading && !this.state().value);
  readonly error = computed(() => !this.state().value ? this.state().error : '');
  readonly density = signal<QueueDensity>('comfortable');
  readonly selectedClaimId = signal('');
  readonly demoClaimId = signal(this.route.snapshot.queryParamMap.get('claimId') || this.readSession('claimsflow.demoClaimId'));
  readonly selectedClaim = computed(() => {
    const content = this.data()?.content ?? [];
    return content.find(claim => claim.id === this.selectedClaimId())
      ?? content.find(claim => this.isGoldenJourney(claim))
      ?? content[0]
      ?? null;
  });
  private filters: ClaimFilters = DEFAULT_FILTERS;

  ngOnInit(): void {
    this.api.getAdjusters().subscribe({ next: value => this.adjusters.set(value), error: () => this.adjusters.set([]) });
    this.subscription.add(this.route.queryParams.subscribe(params => {
      this.demoClaimId.set(typeof params['claimId'] === 'string' && params['claimId']
        ? params['claimId']
        : this.readSession('claimsflow.demoClaimId'));
      this.filters = parseClaimFilters(params);
      this.setControls(this.filters);
      this.releaseQueue?.();
      this.releaseQueue = this.operational.activateQueue(this.filters);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.releaseQueue?.();
  }

  apply(): void {
    const adjusterId = this.assignment.value === 'unassigned' ? '' : this.adjusterId.value;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...serializeClaimFilters({
          ...this.filters,
          q: this.q.value,
          from: this.from.value,
          to: this.to.value,
          claimType: this.claimType.value,
          status: this.status.value,
          priority: this.priority.value,
          assignment: this.assignment.value,
          adjusterId,
          team: adjusterId ? '' : this.team.value,
          region: this.region.value,
          page: 0,
        }),
        claimId: this.demoClaimId() || null,
      },
    });
  }

  reset(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { claimId: this.demoClaimId() || null },
    });
  }

  refresh(): void {
    this.operational.refresh('queue');
  }

  removeFilter(key: FilterKey): void {
    const next: ClaimFilters = { ...this.filters, page: 0, [key]: '' };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...serializeClaimFilters(next), claimId: this.demoClaimId() || null },
    });
  }

  activeFilters(): ReadonlyArray<{ key: FilterKey; label: string }> {
    const active: Array<{ key: FilterKey; label: string }> = [];
    if (this.filters.q) active.push({ key: 'q', label: `Search: ${this.filters.q}` });
    if (this.filters.from) active.push({ key: 'from', label: `From ${this.filters.from}` });
    if (this.filters.to) active.push({ key: 'to', label: `To ${this.filters.to}` });
    if (this.filters.claimType) active.push({ key: 'claimType', label: humanizeEnum(this.filters.claimType) });
    if (this.filters.status) active.push({ key: 'status', label: humanizeEnum(this.filters.status) });
    if (this.filters.priority) active.push({ key: 'priority', label: `${humanizeEnum(this.filters.priority)} priority` });
    if (this.filters.assignment) active.push({ key: 'assignment', label: humanizeEnum(this.filters.assignment) });
    if (this.filters.adjusterId) active.push({ key: 'adjusterId', label: this.adjusters().find(item => item.id === this.filters.adjusterId)?.displayName ?? 'Selected adjuster' });
    if (this.filters.team) active.push({ key: 'team', label: this.filters.team });
    if (this.filters.region) active.push({ key: 'region', label: humanizeEnum(this.filters.region) });
    return active;
  }

  goTo(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...serializeClaimFilters({ ...this.filters, page }), claimId: this.demoClaimId() || null },
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

  isChanged(claim: ClaimSummary): boolean {
    return this.state().changedClaimIds.includes(claim.id);
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

  private setControls(filters: ClaimFilters): void {
    this.q.setValue(filters.q, { emitEvent: false });
    this.from.setValue(filters.from, { emitEvent: false });
    this.to.setValue(filters.to, { emitEvent: false });
    this.claimType.setValue(filters.claimType, { emitEvent: false });
    this.status.setValue(filters.status, { emitEvent: false });
    this.priority.setValue(filters.priority, { emitEvent: false });
    this.assignment.setValue(filters.assignment, { emitEvent: false });
    this.adjusterId.setValue(filters.adjusterId, { emitEvent: false });
    this.team.setValue(filters.team, { emitEvent: false });
    this.region.setValue(filters.region, { emitEvent: false });
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
