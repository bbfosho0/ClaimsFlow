import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { OperationalDataStore } from '../../core/operational-data/operational-data.store';
import { ClaimPage } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { ClaimsQueuePageComponent } from './claims-queue-page.component';

const emptyPage: ClaimPage = {
  content: [], page: 0, size: 20, totalElements: 0, totalPages: 0,
};

const populatedPage: ClaimPage = {
  content: [
    {
      id: 'claim-other', claimNumber: 'CLM-OTHER', claimantName: 'Other Claimant', claimType: 'AUTO', region: 'WEST', priority: 'LOW', status: 'NEW', slaDeadline: '2026-08-05T12:00:00Z', completenessPercentage: 100, createdAt: '2026-08-02T12:00:00Z', updatedAt: '2026-08-02T12:00:00Z',
    },
    {
      id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimType: 'PROPERTY', region: 'SOUTHEAST', priority: 'HIGH', status: 'UNDER_REVIEW', assignedAdjusterName: 'Jordan Lee', assignedTeam: 'SIU Investigations', slaDeadline: '2026-08-03T18:00:00Z', completenessPercentage: 50, createdAt: '2026-08-03T05:00:00Z', updatedAt: '2026-08-03T06:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
};

function createStore(page: ClaimPage, changedClaimIds: readonly string[] = []): any {
  const queue = signal({
    value: page,
    loading: false,
    refreshing: false,
    stale: false,
    error: '',
    updatedAt: new Date('2026-08-03T12:00:00Z'),
    changedClaimIds,
  });
  const store = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateQueue', 'refresh']);
  store.activateQueue.and.returnValue(() => undefined);
  return Object.assign(store, { queue: queue.asReadonly() });
}

function createApi(): jasmine.SpyObj<ClaimsApiService> {
  const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['getAdjusters']);
  api.getAdjusters.and.returnValue(of([
    { id: 'adjuster-jordan', displayName: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'SENIOR_ADJUSTER', team: 'SIU Investigations', workloadCapacity: 12 },
  ]));
  return api;
}

describe('ClaimsQueuePageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('activates the store with curated URL filters and removes one while preserving the others', async () => {
    const store = createStore(emptyPage);
    const api = createApi();

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims', component: ClaimsQueuePageComponent }]),
        { provide: ClaimsApiService, useValue: api },
        { provide: OperationalDataStore, useValue: store },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/claims?status=NEW&priority=HIGH&claimType=PROPERTY&region=SOUTHEAST&team=SIU%20Investigations', ClaimsQueuePageComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    harness.detectChanges();

    expect(store.activateQueue).toHaveBeenCalledWith(jasmine.objectContaining({
      status: 'NEW',
      priority: 'HIGH',
      claimType: 'PROPERTY',
      region: 'SOUTHEAST',
      team: 'SIU Investigations',
    }));

    const root = harness.routeNativeElement!;
    const chips = Array.from(root.querySelectorAll('.filter-chip')) as HTMLButtonElement[];
    expect(chips.length).toBe(5);
    expect(root.textContent).toContain('Southeast');
    expect(root.textContent).toContain('SIU Investigations');

    const statusChip = chips.find(button => button.textContent?.includes('New'));
    statusChip?.click();

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({
        priority: 'HIGH',
        claimType: 'PROPERTY',
        region: 'SOUTHEAST',
        team: 'SIU Investigations',
        claimId: null,
      }),
    }));
  });

  it('selects, labels, and briefly marks the reserved changed claim', async () => {
    const store = createStore(populatedPage, ['claim-demo']);
    const api = createApi();

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims', component: ClaimsQueuePageComponent }]),
        { provide: ClaimsApiService, useValue: api },
        { provide: OperationalDataStore, useValue: store },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/claims?claimId=claim-demo', ClaimsQueuePageComponent);
    harness.detectChanges();

    expect(component.selectedClaim()?.id).toBe('claim-demo');
    expect(harness.routeNativeElement?.textContent).toContain('Golden journey');
    expect(harness.routeNativeElement?.textContent).toContain('Taylor Reed');
    expect(harness.routeNativeElement?.textContent).toContain('SIU Investigations');
    expect(harness.routeNativeElement?.querySelector('tr.state-changed')).not.toBeNull();
  });

  it('shows one useful reset action when filters produce no results', async () => {
    const store = createStore(emptyPage);
    const api = createApi();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims', component: ClaimsQueuePageComponent }]),
        { provide: ClaimsApiService, useValue: api },
        { provide: OperationalDataStore, useValue: store },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/claims?region=WEST', ClaimsQueuePageComponent);
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('No claims match');
    expect(harness.routeNativeElement?.textContent).toContain('Reset filters');
  });
});
