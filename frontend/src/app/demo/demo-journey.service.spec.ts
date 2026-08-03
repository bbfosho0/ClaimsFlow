import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { DemoJourneySnapshot } from './demo-journey.models';
import { DemoJourneyService } from './demo-journey.service';

const snapshot: DemoJourneySnapshot = {
  claimId: 'claim-1',
  claimNumber: 'CLM-2026-DEMO01',
  adjusterId: 'adjuster-1',
  claimantRoute: '/portal/claims/claim-1',
  adjusterRoute: '/app/claims/claim-1?role=adjuster',
  managerRoute: '/app/dashboard?role=manager',
  administratorRoute: '/app/workflows?role=admin',
};

describe('DemoJourneyService', () => {
  let service: DemoJourneyService;
  let http: HttpTestingController;
  let operational: jasmine.SpyObj<OperationalDataStore>;

  beforeEach(() => {
    sessionStorage.clear();
    operational = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['invalidate']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OperationalDataStore, useValue: operational },
      ],
    });
    service = TestBed.inject(DemoJourneyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('stores identifiers and invalidates all resources only after reset succeeds', () => {
    service.reset().subscribe();

    const request = http.expectOne('/api/demo/reset');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBeNull();
    expect(sessionStorage.getItem('claimsflow.demoAdjusterId')).toBeNull();
    expect(operational.invalidate).not.toHaveBeenCalled();

    request.flush(snapshot);

    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBe('claim-1');
    expect(sessionStorage.getItem('claimsflow.demoAdjusterId')).toBe('adjuster-1');
    expect(operational.invalidate).toHaveBeenCalledWith(
      ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
      ['claim-1'],
    );
  });

  it('does not persist or invalidate after a failed reset', () => {
    service.reset().subscribe({ error: () => undefined });
    const request = http.expectOne('/api/demo/reset');
    request.flush({ message: 'disabled' }, { status: 404, statusText: 'Not Found' });

    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBeNull();
    expect(operational.invalidate).not.toHaveBeenCalled();
  });
});
