import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardSnapshot } from '../../shared/models/dashboard.models';
import { OperationalDataStore } from './operational-data.store';

const snapshot: DashboardSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  totalClaims: 12,
  openClaims: 8,
  highPriorityClaims: 3,
  slaRiskClaims: 2,
  overdueClaims: 1,
  unassignedClaims: 1,
  incompleteClaims: 4,
  evidenceReadinessPercentage: 78,
  activePortfolioPercentage: 67,
  signalCounts: [
    { category: 'SLA', tone: 'critical', count: 3 },
    { category: 'EVIDENCE', tone: 'warning', count: 4 },
    { category: 'OWNERSHIP', tone: 'live', count: 1 },
    { category: 'PRIORITY', tone: 'advisory', count: 3 },
    { category: 'ADVISORY', tone: 'healthy', count: 5 },
  ],
  workload: [],
  recentActivity: [],
};

describe('OperationalDataStore', () => {
  let store: OperationalDataStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(OperationalDataStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    store.ngOnDestroy();
    http.verify();
  });

  it('loads immediately and polls each active family every 45 seconds', fakeAsync(() => {
    const release = store.activateDashboard();
    http.expectOne('/api/dashboard').flush(snapshot);
    expect(store.dashboard().value).toEqual(snapshot);

    tick(44_999);
    http.expectNone('/api/dashboard');

    tick(1);
    http.expectOne('/api/dashboard').flush({ ...snapshot, openClaims: 9 });
    expect(store.dashboard().value?.openClaims).toBe(9);

    release();
    tick(45_000);
    http.expectNone('/api/dashboard');
  }));

  it('retains the last successful snapshot and marks it stale after background failure', fakeAsync(() => {
    const release = store.activateDashboard();
    http.expectOne('/api/dashboard').flush(snapshot);

    store.refresh('dashboard');
    const request = http.expectOne('/api/dashboard');
    request.flush({ message: 'offline' }, { status: 503, statusText: 'Unavailable' });

    expect(store.dashboard().value).toEqual(snapshot);
    expect(store.dashboard().stale).toBeTrue();
    expect(store.dashboard().error).toContain('temporarily unavailable');

    store.refresh('dashboard');
    http.expectOne('/api/dashboard').flush({ ...snapshot, openClaims: 7 });
    expect(store.dashboard().stale).toBeFalse();
    expect(store.dashboard().error).toBe('');
    release();
  }));

  it('refreshes active resources immediately and expires changed claim IDs', fakeAsync(() => {
    const release = store.activateDashboard();
    http.expectOne('/api/dashboard').flush(snapshot);

    store.invalidate(['dashboard'], ['claim-123']);
    expect(store.dashboard().changedClaimIds).toContain('claim-123');
    http.expectOne('/api/dashboard').flush({ ...snapshot, openClaims: 9 });

    tick(1_199);
    expect(store.dashboard().changedClaimIds).toContain('claim-123');
    tick(1);
    expect(store.dashboard().changedClaimIds).not.toContain('claim-123');
    release();
  }));

  it('keeps inactive resources dirty and refreshes when the surface activates', fakeAsync(() => {
    store.invalidate(['dashboard'], ['claim-123']);
    http.expectNone('/api/dashboard');

    const release = store.activateDashboard();
    http.expectOne('/api/dashboard').flush(snapshot);
    expect(store.dashboard().value).toEqual(snapshot);
    release();
    tick(1_200);
  }));
});
