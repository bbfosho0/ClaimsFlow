import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ClaimFilters } from '../../claims/data-access/claim-filter-codec';
import { ClaimPage } from '../../shared/models/claim.models';
import { DashboardSnapshot } from '../../shared/models/dashboard.models';
import { ApiError } from '../api/api-error';
import { OperationalApiService } from './operational-api.service';
import {
  AnalyticsSnapshot,
  DEFAULT_OPERATIONAL_FILTERS,
  EvidenceOperationsSnapshot,
  OperationalFamily,
  OperationalFilters,
  OperationalResource,
  TeamOperationsSnapshot,
} from './operational-data.models';

const POLL_INTERVAL_MS = 45_000;
const CACHE_FRESH_MS = 15_000;

function emptyResource<T>(): OperationalResource<T> {
  return {
    value: null,
    loading: false,
    refreshing: false,
    stale: false,
    error: '',
    updatedAt: null,
    changedClaimIds: [],
  };
}

@Injectable({ providedIn: 'root' })
export class OperationalDataStore implements OnDestroy {
  private readonly api = inject(OperationalApiService);
  private readonly dashboardState = signal<OperationalResource<DashboardSnapshot>>(emptyResource());
  private readonly queueState = signal<OperationalResource<ClaimPage>>(emptyResource());
  private readonly analyticsState = signal<OperationalResource<AnalyticsSnapshot>>(emptyResource());
  private readonly teamState = signal<OperationalResource<TeamOperationsSnapshot>>(emptyResource());
  private readonly evidenceState = signal<OperationalResource<EvidenceOperationsSnapshot>>(emptyResource());

  readonly dashboard = this.dashboardState.asReadonly();
  readonly queue = this.queueState.asReadonly();
  readonly analytics = this.analyticsState.asReadonly();
  readonly team = this.teamState.asReadonly();
  readonly evidence = this.evidenceState.asReadonly();

  private readonly active = new Map<OperationalFamily, number>();
  private readonly dirty = new Set<OperationalFamily>();
  private readonly requests = new Map<OperationalFamily, Subscription>();
  private queueFilters: ClaimFilters | null = null;
  private analyticsFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private teamFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private evidenceFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private evidenceSelectedClaimId = '';
  private pollId: ReturnType<typeof setInterval> | null = null;
  private readonly visibilityHandler = () => this.onVisibilityChange();

  constructor() {
    globalThis.document?.addEventListener('visibilitychange', this.visibilityHandler);
  }

  activateDashboard(): () => void {
    return this.activate('dashboard');
  }

  activateQueue(filters: ClaimFilters): () => void {
    const changed = JSON.stringify(this.queueFilters) !== JSON.stringify(filters);
    this.queueFilters = { ...filters };
    if (changed) this.dirty.add('queue');
    return this.activate('queue');
  }

  activateAnalytics(filters: OperationalFilters): () => void {
    const changed = JSON.stringify(this.analyticsFilters) !== JSON.stringify(filters);
    this.analyticsFilters = { ...filters };
    if (changed) this.dirty.add('analytics');
    return this.activate('analytics');
  }

  activateTeam(filters: OperationalFilters): () => void {
    const changed = JSON.stringify(this.teamFilters) !== JSON.stringify(filters);
    this.teamFilters = { ...filters };
    if (changed) this.dirty.add('team');
    return this.activate('team');
  }

  activateEvidence(filters: OperationalFilters, selectedClaimId = ''): () => void {
    const changed = JSON.stringify(this.evidenceFilters) !== JSON.stringify(filters)
      || this.evidenceSelectedClaimId !== selectedClaimId;
    this.evidenceFilters = { ...filters };
    this.evidenceSelectedClaimId = selectedClaimId;
    if (changed) this.dirty.add('evidence');
    return this.activate('evidence');
  }

  refresh(family: OperationalFamily): void {
    this.load(family, true);
  }

  invalidate(
    families: readonly OperationalFamily[],
    changedClaimIds: readonly string[] = [],
  ): void {
    for (const family of families) {
      this.dirty.add(family);
      this.patchChangedIds(family, changedClaimIds);
      if ((this.active.get(family) ?? 0) > 0) {
        this.load(family, true);
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    globalThis.document?.removeEventListener('visibilitychange', this.visibilityHandler);
    for (const request of this.requests.values()) request.unsubscribe();
  }

  private activate(family: OperationalFamily): () => void {
    this.active.set(family, (this.active.get(family) ?? 0) + 1);
    this.ensurePolling();
    const state = this.readState(family);
    const age = state.updatedAt ? Date.now() - state.updatedAt.getTime() : Number.POSITIVE_INFINITY;
    if (!state.value || this.dirty.has(family) || age > CACHE_FRESH_MS) {
      this.load(family, Boolean(state.value));
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = Math.max(0, (this.active.get(family) ?? 1) - 1);
      if (next === 0) this.active.delete(family);
      else this.active.set(family, next);
      if (this.active.size === 0) this.stopPolling();
    };
  }

  private load(family: OperationalFamily, background: boolean): void {
    if (family === 'queue' && !this.queueFilters) return;
    this.requests.get(family)?.unsubscribe();
    this.writeLoading(family, background);

    let request: Observable<unknown>;
    switch (family) {
      case 'dashboard': request = this.api.loadDashboard(); break;
      case 'queue': request = this.api.loadQueue(this.queueFilters!); break;
      case 'analytics': request = this.api.loadAnalytics(this.analyticsFilters); break;
      case 'team': request = this.api.loadTeam(this.teamFilters); break;
      case 'evidence': request = this.api.loadEvidence(this.evidenceFilters, this.evidenceSelectedClaimId); break;
    }

    this.requests.set(family, request.subscribe({
      next: value => {
        this.dirty.delete(family);
        this.writeSuccess(family, value);
      },
      error: (error: unknown) => this.writeFailure(family, error),
    }));
  }

  private writeLoading(family: OperationalFamily, background: boolean): void {
    this.updateState(family, state => ({
      ...state,
      loading: !background && !state.value,
      refreshing: background || Boolean(state.value),
      error: background ? state.error : '',
    }));
  }

  private writeSuccess(family: OperationalFamily, value: unknown): void {
    this.updateState(family, state => ({
      ...state,
      value,
      loading: false,
      refreshing: false,
      stale: false,
      error: '',
      updatedAt: new Date(),
    }));
  }

  private writeFailure(family: OperationalFamily, error: unknown): void {
    const message = error instanceof ApiError ? error.message : 'Operational data is temporarily unavailable.';
    this.updateState(family, state => ({
      ...state,
      loading: false,
      refreshing: false,
      stale: Boolean(state.value),
      error: message,
    }));
  }

  private patchChangedIds(family: OperationalFamily, ids: readonly string[]): void {
    if (!ids.length) return;
    this.updateState(family, state => ({
      ...state,
      changedClaimIds: Array.from(new Set([...state.changedClaimIds, ...ids])),
    }));
  }

  private readState(family: OperationalFamily): OperationalResource<unknown> {
    switch (family) {
      case 'dashboard': return this.dashboardState();
      case 'queue': return this.queueState();
      case 'analytics': return this.analyticsState();
      case 'team': return this.teamState();
      case 'evidence': return this.evidenceState();
    }
  }

  private updateState(
    family: OperationalFamily,
    updater: (state: OperationalResource<any>) => OperationalResource<any>,
  ): void {
    switch (family) {
      case 'dashboard': this.dashboardState.update(updater); break;
      case 'queue': this.queueState.update(updater); break;
      case 'analytics': this.analyticsState.update(updater); break;
      case 'team': this.teamState.update(updater); break;
      case 'evidence': this.evidenceState.update(updater); break;
    }
  }

  private ensurePolling(): void {
    if (this.pollId || globalThis.document?.visibilityState === 'hidden') return;
    this.pollId = setInterval(() => this.refreshActiveFamilies(), POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (!this.pollId) return;
    clearInterval(this.pollId);
    this.pollId = null;
  }

  private onVisibilityChange(): void {
    if (globalThis.document?.visibilityState === 'visible') {
      this.refreshActiveFamilies();
      this.ensurePolling();
    } else {
      this.stopPolling();
    }
  }

  private refreshActiveFamilies(): void {
    if (globalThis.document?.visibilityState === 'hidden') return;
    for (const family of this.active.keys()) this.load(family, true);
  }
}
