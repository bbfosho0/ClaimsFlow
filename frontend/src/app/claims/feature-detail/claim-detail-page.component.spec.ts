import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClaimDetail, Recommendation } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { ClaimDetailPageComponent } from './claim-detail-page.component';

const claim: ClaimDetail = {
  id: 'claim-1',
  claimNumber: 'CF-2026-1048',
  claimantName: 'Taylor Morgan',
  claimantEmail: 'taylor.morgan@example.test',
  claimType: 'AUTO',
  incidentDate: '2026-07-22',
  estimatedLoss: 12000,
  description: 'Vehicle sustained front-end damage in a low-speed collision.',
  evidence: {
    incidentReportPresent: true,
    photosPresent: false,
    proofOfOwnershipPresent: true,
    medicalDocumentationPresent: false,
  },
  completenessPercentage: 50,
  missingEvidence: ['Damage photos', 'Medical documentation'],
  priority: 'CRITICAL',
  priorityFactors: ['Estimated loss exceeds threshold', 'Evidence is incomplete'],
  status: 'UNDER_REVIEW',
  allowedNextStatuses: ['WAITING_FOR_INFORMATION', 'READY_FOR_DECISION'],
  assignedAdjuster: {
    id: 'adjuster-1',
    displayName: 'Maya Chen',
    email: 'maya.chen@example.test',
    role: 'ADJUSTER',
    workloadCapacity: 12,
  },
  slaDeadline: '2026-07-23T17:00:00Z',
  createdAt: '2026-07-23T09:32:00Z',
  updatedAt: '2026-07-23T09:48:00Z',
  version: 1,
};

const recommendation: Recommendation = {
  id: 'recommendation-1',
  recommendedAction: 'REQUEST_INFORMATION',
  explanation: 'Collect the missing evidence before the claim advances.',
  confidence: 96,
  missingInformation: ['Damage photos', 'Medical documentation'],
  generatedAt: '2026-07-23T10:00:00Z',
  reviewState: 'PENDING',
};

describe('ClaimDetailPageComponent', () => {
  it('presents advisory decision support and preserves human approval', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', [
      'get',
      'getAdjusters',
      'getAudit',
      'assign',
      'updateStatus',
      'generateRecommendation',
      'reviewRecommendation',
    ]);
    api.get.and.returnValue(of(claim));
    api.getAdjusters.and.returnValue(of([claim.assignedAdjuster!]));
    api.getAudit.and.returnValue(of([
      { id: 'audit-1', actor: 'System', actionType: 'CLAIM_CREATED', summary: 'Claim created', occurredAt: '2026-07-23T09:32:00Z' },
      { id: 'audit-2', actor: 'Interview User', actionType: 'ASSIGNED', summary: 'Assigned to Maya Chen', occurredAt: '2026-07-23T09:41:00Z' },
    ]));
    api.reviewRecommendation.and.returnValue(of({ ...recommendation, reviewState: 'APPROVED', reviewerName: 'Interview User' }));

    await TestBed.configureTestingModule({
      imports: [ClaimDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ClaimsApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'claim-1' }) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ClaimDetailPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.recommendation.set(recommendation);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Decision support');
    expect(fixture.nativeElement.textContent).toContain('Advisory only');
    expect(fixture.nativeElement.textContent).not.toContain('OpenAI recommendation');
    expect(fixture.nativeElement.querySelector('[aria-label="Claim completeness 50%"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.audit-event').length).toBe(2);

    const approve = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: Element) => button.textContent?.includes('Approve')) as HTMLButtonElement | undefined;
    approve?.click();

    expect(api.reviewRecommendation).toHaveBeenCalledWith('claim-1', 'recommendation-1', 'APPROVED', 'Interview User');
  });
});
