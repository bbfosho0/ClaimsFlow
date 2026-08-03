import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimPage } from '../shared/models/claim.models';
import { TourOrchestratorService } from './tour-orchestrator.service';

const page: ClaimPage = {
  content: [{
    id: 'claim-fallback',
    claimNumber: 'CLM-2026-FALLBACK',
    claimantName: 'Taylor Reed',
    claimType: 'PROPERTY',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    completenessPercentage: 50,
    slaDeadline: '2026-08-03T12:00:00Z',
  }],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

describe('TourOrchestratorService', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  function configure() {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    api.list.and.returnValue(of(page));

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: ClaimsApiService, useValue: api },
      ],
    });
    return { router, api, service: TestBed.inject(TourOrchestratorService) };
  }

  it('defines the five approved role-bound steps and starts in the claimant portal', () => {
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const { router, api, service } = configure();

    expect(service.steps.length).toBe(5);
    expect(service.steps.map(step => step.id)).toEqual([
      'claimant-portal',
      'adjuster-review',
      'manager-impact',
      'administrator-routing',
      'engineering-proof',
    ]);

    service.start().subscribe();

    expect(api.list).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/portal/claims/claim-demo'], {
      queryParams: { tour: 'claimant-portal', claimId: 'claim-demo', role: null },
    });
    expect(service.restore()).toEqual({ step: 'claimant-portal', claimId: 'claim-demo' });
  });

  it('falls back to a real queue claim when the demo identifier is absent', () => {
    const { router, api, service } = configure();

    service.start().subscribe();

    expect(api.list).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/portal/claims/claim-fallback'], {
      queryParams: { tour: 'claimant-portal', claimId: 'claim-fallback', role: null },
    });
  });

  it('routes employee steps with the correct demo role and clears progress on exit', async () => {
    const { router, service } = configure();

    await service.navigateTo(1, 'claim-demo');
    expect(router.navigate).toHaveBeenCalledWith(['/app/claims/claim-demo'], {
      queryParams: { tour: 'adjuster-review', claimId: 'claim-demo', role: 'adjuster' },
    });

    await service.navigateTo(3, 'claim-demo');
    expect(router.navigate).toHaveBeenCalledWith(['/app/workflows'], {
      queryParams: { tour: 'administrator-routing', claimId: 'claim-demo', role: 'admin' },
    });

    await service.exit();
    expect(sessionStorage.getItem('claimsflow-tour-progress')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard'], { queryParams: { role: 'manager' } });
  });
});
