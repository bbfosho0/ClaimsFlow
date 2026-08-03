import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  ClaimFilters,
  claimFilterKey,
} from '../../claims/data-access/claim-filter-codec';
import { ClaimPage } from '../../shared/models/claim.models';
import { DashboardSnapshot } from '../../shared/models/dashboard.models';
import { ApiError } from '../api/api-error';
import { operationalFilterKey } from './operational-filter-codec';
import { OperationalApiService } from './operational-api.service';
import {
  AnalyticsSnapshot,
  DEFAULT_OPERATIONAL_FILTERS,
  EvidenceOperationsSnapshot,
  MyWorkSnapshot,
  OperationalFamily,
  OperationalFilters,
  OperationalResource,
  TeamOperationsSnapshot,
} from './operational-data.models';
import { OperationalPollCoordinator } from './operational-poll-coordinator.service';
import { OperationalResourceController } from './operational-resource.controller';

const CACHE_FRESH_MS = 15_000;
const CHANGE_HIGHLIGHT_MS = 1_200;

@Injectable({ providedIn: 'root' })
export class OperationalDataStore implements OnDestroy {
  private readonly api = inject(OperationalApiService);
  private readonly poll = inject(OperationalPollCoordinator);

  private readonly dashboardController = new OperationalResourceController<DashboardSnapshot>();
  private readonly queueController = new OperationalResourceController<ClaimPage>();
  private readonly myWorkController = new OperationalResourceController<MyWorkSnapshot>();
  private readonly analyticsController = new OperationalResourceController<AnalyticsSnapshot>();
  private readonly teamController = new OperationalResourceController<TeamOperationsSnapshot>();
  private readonly evidenceController = new OperationalResourceController<EvidenceOperationsSnapshot>();

  readonly dashboard = this.dashboardController.state;
  readonly queue = this.queueController.state;
  readonly myWork = this.myWorkController.state;
  readonly analytics = this.analyticsController.state;
  readonly team = this.teamController.state;
  readonly evidence = this.evidenceController.state;

  private readonly dirty = new Set<OperationalFamily>();
  private readonly requests = new Map<OperationalFamily, Subscription>();
  private readonly highlightTimers = new Map<OperationalFamily, ReturnType<typeof setTimeout>>();

  private queueFilters: ClaimFilters | null = null;
  private queueFilterKey = '';
  private myWorkAdjusterId = '';
  private analyticsFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private analyticsFilterKey = operationalFilterKey(DEFAULT_OPERATIONAL_FILTERS);
  private teamFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private teamFilterKey = operationalFilterKey(DEFAULT_OPERATIONAL_FILTERS);
  private evidenceFilters: OperationalFilters = DEFAULT_OPERATIONAL_FILTERS;
  private evidenceFilterKey = operationalFilterKey(DEFAULT_OPERATIONAL_FILTERS);
  private evidenceSelectedClaimId = '';

  activateDashboard(): () => void {
    return this.activate('dashboard');
  }

  activateQueue(filters: ClaimFilters): () => void {
    const nextKey = claimFilterKey(filters);
    if (nextKey !== this.queueFilterKey) {
      this.queueFilters = { ...filters };
      this.queueFilterKey = nextKey;
      this.dirty.add('queue');
    }
    return this.activate('queue');
  }

  activateMyWork(adjusterId: string): () => void {
    if (this.myWorkAdjusterId !== adjusterId) {
      this.myWorkAdjusterId = adjusterId;
      this.dirty.add('myWork');
    }
    return this.activate('myWork');
  }

  activateAnalytics(filters: OperationalFilters): () => void {
    const nextKey = operationalFilterKey(filters);
    if (nextKey !== this.analyticsFilterKey) {
      this.analyticsFilters = { ...filters };
      this.analyticsFilterKey = nextKey;
      this.dirty.add('analytics');
    }
    return this.activate('analytics');
  }

  activateTeam(filters: OperationalFilters): () => void {
    const nextKey = operationalFilterKey(filters);
    if (nextKey !== this.teamFilterKey) {
      this.teamFilters = { ...filters };
      this.teamFilterKey = nextKey;
      this.dirty.add('team');
    }
    return this.activate('team');
  }

  activateEvidence(filters: OperationalFilters, selectedClaimId = ''): () => void {
    const nextKey = operationalFilterKey(filters);
    if (nextKey !== this.evidenceFilterKey || this.evidenceSelectedClaimId !== selectedClaimId) {
      this.evidenceFilters = { ...filters };
      this.evidenceFilterKey = nextKey;
      this.evidenceSelectedClaimId = selectedClaimId;
      this.dirty.add('evidence');
    }
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
      this.markClaimsChanged(family, changedClaimIds);
      if (this.poll.isActive(family)) this.load(family, true);
    }
  }

  ngOnDestroy(): void {
    for (const request of this.requests.values()) request.unsubscribe();
    this.requests.clear();
    for (const timer of this.highlightTimers.values()) clearTimeout(timer);
    this.highlightTimers.clear();
  }

  private activate(family: OperationalFamily): () => void {
    const release = this.poll.register(family, () => this.load(family, true));
    if (this.shouldLoad(family)) this.load(family, this.hasValue(family));
    return release;
  }

  private shouldLoad(family: OperationalFamily): boolean {
    if (family === 'queue' && !this.queueFilters) return false;
    if (family === 'myWork' && !this.myWorkAdjusterId) return false;
    if (this.dirty.has(family)) return true;
    const state = this.readState(family);
    if (!state.value || !state.updatedAt) return true;
    return Date.now() - state.updatedAt.getTime() > CACHE_FRESH_MS;
  }

  private hasValue(family: OperationalFamily): boolean {
    return Boolean(this.readState(family).value);
  }

  private readState(family: OperationalFamily): OperationalResource<unknown> {
    switch (family) {
      case 'dashboard': return this.dashboard();
      case 'queue': return this.queue();
      case 'myWork': return this.myWork();
      case 'analytics': return this.analytics();
      case 'team': return this.team();
      case 'evidence': return this.evidence();
    }
  }

  private load(family: OperationalFamily, background: boolean): void {
    switch (family) {
      case 'dashboard':
        this.loadResource(family, this.dashboardController, this.api.loadDashboard(), background);
        break;
      case 'queue':
        if (this.queueFilters) {
          this.loadResource(family, this.queueController, this.api.loadQueue(this.queueFilters), background);
        }
        break;
      case 'myWork':
        if (this.myWorkAdjusterId) {
          this.loadResource(family, this.myWorkController, this.api.loadMyWork(this.myWorkAdjusterId), background);
        }
        break;
      case 'analytics':
        this.loadResource(family, this.analyticsController, this.api.loadAnalytics(this.analyticsFilters), background);
        break;
      case 'team':
        this.loadResource(family, this.teamController, this.api.loadTeam(this.teamFilters), background);
        break;
      case 'evidence':
        this.loadResource(
          family,
          this.evidenceController,
          this.api.loadEvidence(this.evidenceFilters, this.evidenceSelectedClaimId),
          background,
        );
        break;
    }
  }

  private loadResource<T>(
    family: OperationalFamily,
    controller: OperationalResourceController<T>,
    request: Observable<T>,
    background: boolean,
  ): void {
    this.requests.get(family)?.unsubscribe();
    controller.begin(background);
    const subscription = request.subscribe({
      next: value => {
        this.dirty.delete(family);
        controller.succeed(value);
        this.requests.delete(family);
      },
      error: (error: unknown) => {
        controller.fail(this.errorMessage(error));
        this.requests.delete(family);
      },
    });
    this.requests.set(family, subscription);
  }

  private errorMessage(error: unknown): string {
    return error instanceof ApiError
      ? error.message
      : 'Operational data is temporarily unavailable.';
  }

  private markClaimsChanged(family: OperationalFamily, ids: readonly string[]): void {
    if (!ids.length) return;
    const unique = Array.from(new Set(ids));
    this.controllerForHighlights(family).markClaimsChanged(unique);

    const previousTimer = this.highlightTimers.get(family);
    if (previousTimer) clearTimeout(previousTimer);
    this.highlightTimers.set(family, setTimeout(() => {
      const currentIds = this.readState(family).changedClaimIds;
      this.controllerForHighlights(family).clearClaimsChanged(currentIds);
      this.highlightTimers.delete(family);
    }, CHANGE_HIGHLIGHT_MS));
  }

  private controllerForHighlights(
    family: OperationalFamily,
  ): OperationalResourceController<unknown> {
    switch (family) {
      case 'dashboard': return this.dashboardController;
      case 'queue': return this.queueController;
      case 'myWork': return this.myWorkController;
      case 'analytics': return this.analyticsController;
      case 'team': return this.teamController;
      case 'evidence': return this.evidenceController;
    }
  }
}
