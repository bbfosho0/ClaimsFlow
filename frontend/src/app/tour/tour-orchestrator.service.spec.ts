import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimPage } from '../shared/models/claim.models';
import { TourOrchestratorService } from './tour-orchestrator.service';

const page: ClaimPage = {
  content: [{
    id: 'claim-142',
    claimNumber: 'CF-2026-0142',
    claimantName: 'Taylor Morgan',
    claimType: 'PROPERTY',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    completenessPercentage: 75,
    slaDeadline: '2026-08-03T12:00:00Z',
    createdAt: '2026-08-01T12:00:00Z',
  }],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

describe('TourOrchestratorService', () => {
  beforeEach(() => sessionStorage.clear());

  it('defines the six approved steps and starts on the real dashboard route', () => {
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
    const service = TestBed.inject(TourOrchestratorService);

    expect(service.steps.length).toBe(6);
    expect(service.steps.map(step => step.id)).toEqual([
      'portfolio-pressure',
      'prioritized-queue',
      'claim-investigation',
      'human-authority',
      'review-ready-intake',
      'engineering-proof',
    ]);

    service.start().subscribe();

    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard'], {
      queryParams: { tour: 'portfolio-pressure', claimId: 'claim-142' },
    });
    expect(service.restore()).toEqual({ step: 'portfolio-pressure', claimId: 'claim-142' });
  });

  it('routes claim-specific steps with the resolved claim id and clears progress on exit', async () => {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: ClaimsApiService, useValue: api },
      ],
    });
    const service = TestBed.inject(TourOrchestratorService);

    await service.navigateTo(2, 'claim-142');
    expect(router.navigate).toHaveBeenCalledWith(['/app/claims/claim-142'], {
      queryParams: { tour: 'claim-investigation', claimId: 'claim-142' },
    });

    await service.exit();
    expect(sessionStorage.getItem('claimsflow-tour-progress')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard']);
  });
});
