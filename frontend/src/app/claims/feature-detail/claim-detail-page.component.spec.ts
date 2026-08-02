import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimDetail, Recommendation } from '../../shared/models/claim.models';
import { RecommendationReviewCoordinator } from '../../shared/recommendation-review/recommendation-review-coordinator.service';
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

const approvedRecommendation: Recommendation = {
  ...recommendation,
  reviewState: 'APPROVED',
  reviewerName: 'Interview User',
};

describe('ClaimDetailPageComponent', () => {
  it('presents advisory decision support and requires a human reason before approval', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', [
      'get',
      'getAdjusters',
      'getAudit',
      'assign',
      'updateStatus',
      'generateRecommendation',
    ]);
    const reviewCoordinator = jasmine.createSpyObj<RecommendationReviewCoordinator>(
      'RecommendationReviewCoordinator',
      ['review'],
    );
    api.get.and.returnValue(of(claim));
    api.getAdjusters.and.returnValue(of([claim.assignedAdjuster!]));
    api.getAudit.and.returnValue(of([
      { id: 'audit-1', actor: 'System', actionType: 'CLAIM_CREATED', summary: 'Claim created', occurredAt: '2026-07-23T09:32:00Z' },
      { id: 'audit-2', actor: 'Interview User', actionType: 'ASSIGNED', summary: 'Assigned to Maya Chen', occurredAt: '2026-07-23T09:41:00Z' },
    ]));
    reviewCoordinator.review.and.returnValue(of(approvedRecommendation));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims/:id', component: ClaimDetailPageComponent }]),
        { provide: ClaimsApiService, useValue: api },
        { provide: RecommendationReviewCoordinator, useValue: reviewCoordinator },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/claims/claim-1', ClaimDetailPageComponent);
    component.recommendation.set(recommendation);
    harness.detectChanges();

    let root = harness.routeNativeElement!;
    expect(root.querySelector('[data-tour-target="decision-support"]')).not.toBeNull();
    expect(root.querySelector('.decision-panel')?.textContent).toContain('Human-controlled recommendation');
    expect(root.querySelector('.decision-panel')?.textContent).toContain('Advisory only');
    expect(root.textContent).not.toContain('OpenAI recommendation');
    expect(root.querySelector('.identity-instruments article:nth-child(2) strong')?.textContent?.trim()).toBe('50%');
    expect(root.querySelector('.workspace-tabs button:last-child')?.textContent).toContain('2');

    const auditTab = Array.from(root.querySelectorAll('.workspace-tabs button'))
      .find(button => button.textContent?.includes('Audit')) as HTMLButtonElement;
    auditTab.click();
    harness.detectChanges();
    root = harness.routeNativeElement!;
    expect(root.querySelectorAll('.audit-event').length).toBe(2);

    const dossierTab = root.querySelector('.workspace-tabs button:first-child') as HTMLButtonElement;
    dossierTab.click();
    harness.detectChanges();
    root = harness.routeNativeElement!;

    const approve = Array.from(root.querySelectorAll('button'))
      .find(button => button.textContent?.includes('Approve guidance')) as HTMLButtonElement;
    approve.click();
    harness.detectChanges();

    root = harness.routeNativeElement!;
    expect(reviewCoordinator.review).not.toHaveBeenCalled();
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();

    const reason = root.querySelector('textarea') as HTMLTextAreaElement;
    reason.value = 'Evidence gaps should be resolved before the claim advances.';
    reason.dispatchEvent(new Event('input'));
    harness.detectChanges();

    root = harness.routeNativeElement!;
    const confirm = Array.from(root.querySelectorAll('button'))
      .find(button => button.textContent?.includes('Confirm approved')) as HTMLButtonElement;
    confirm.click();
    harness.detectChanges();

    expect(reviewCoordinator.review).toHaveBeenCalledWith({
      claimId: 'claim-1',
      recommendationId: 'recommendation-1',
      decision: 'APPROVED',
      reason: 'Evidence gaps should be resolved before the claim advances.',
    });
  });
});
