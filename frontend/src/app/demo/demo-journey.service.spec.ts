import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DemoJourneyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('stores no identifiers before the backend confirms reset', () => {
    service.reset().subscribe();

    const request = http.expectOne('/api/demo/reset');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBeNull();
    expect(sessionStorage.getItem('claimsflow.demoAdjusterId')).toBeNull();

    request.flush(snapshot);

    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBe('claim-1');
    expect(sessionStorage.getItem('claimsflow.demoAdjusterId')).toBe('adjuster-1');
  });
});
