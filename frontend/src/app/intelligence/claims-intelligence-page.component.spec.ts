import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RecommendationReviewCoordinator } from '../shared/recommendation-review/recommendation-review-coordinator.service';
import { ClaimsIntelligencePageComponent } from './claims-intelligence-page.component';
import { IntelligenceFacadeService } from './intelligence-facade.service';
import { IntelligenceQueueItem, IntelligenceWorkspace, PreparedAction } from './intelligence.models';

const firstItem: IntelligenceQueueItem = {
  claim: {
    id: 'claim-1',
    claimNumber: 'CF-2026-1001',
    claimantName: 'Taylor Morgan',
    claimType: 'AUTO',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    slaDeadline: '2026-08-03T12:00:00Z',
    completenessPercentage: 50,
  },
  attentionScore: 94,
  reason: 'Critical claim with missing evidence.',
  tone: 'critical',
};

const secondItem: IntelligenceQueueItem = {
  claim: {
    id: 'claim-2',
    claimNumber: 'CF-2026-1002',
    claimantName: 'Jordan Lee',
    claimType: 'PROPERTY',
    priority: 'HIGH',
    status: 'WAITING_FOR_INFORMATION',
    slaDeadline: '2026-08-04T12:00:00Z',
    completenessPercentage: 75,
  },
  attentionScore: 76,
  reason: 'Evidence request needs review.',
  tone: 'warning',
};

function workspaceFor(item: IntelligenceQueueItem): IntelligenceWorkspace {
  return {
    claim: {
      ...item.claim,
      claimantEmail: `${item.claim.id}@example.test`,
      incidentDate: '2026-07-22',
      estimatedLoss: 12000,
      description: 'Structured claim description.',
      evidence: {
        incidentReportPresent: true,
        photosPresent: false,
        proofOfOwnershipPresent: true,
        medicalDocumentationPresent: false,
      },
      missingEvidence: ['Damage photos'],
      priorityFactors: ['Evidence is incomplete'],
      allowedNextStatuses: ['WAITING_FOR_INFORMATION'],
      createdAt: '2026-07-23T09:32:00Z',
      updatedAt: '2026-07-23T09:48:00Z',
      version: 1,
    },
    recommendation: null,
    audit: [],
  };
}

function facadeSpy(): jasmine.SpyObj<IntelligenceFacadeService> {
  const facade = jasmine.createSpyObj<IntelligenceFacadeService>('IntelligenceFacadeService', [
    'loadReviewQueue',
    'loadWorkspace',
    'evidenceNodes',
    'assistantAnswer',
    'generateRecommendation',
    'prepareAction',
  ]);
  facade.loadReviewQueue.and.returnValue(of([]));
  facade.evidenceNodes.and.returnValue([]);
  facade.assistantAnswer.and.returnValue({ title: 'Review', body: 'Evidence-grounded answer.', facts: [] });
  return facade;
}

describe('ClaimsIntelligencePageComponent', () => {
  it('keeps the latest selected dossier when an older request completes later', () => {
    const firstWorkspace = new Subject<IntelligenceWorkspace>();
    const secondWorkspace = new Subject<IntelligenceWorkspace>();
    const facade = facadeSpy();
    const reviewCoordinator = jasmine.createSpyObj<RecommendationReviewCoordinator>('RecommendationReviewCoordinator', ['review']);
    facade.loadWorkspace.and.callFake(id => id === 'claim-1' ? firstWorkspace : secondWorkspace);

    TestBed.configureTestingModule({
      imports: [ClaimsIntelligencePageComponent],
      providers: [
        provideRouter([]),
        { provide: IntelligenceFacadeService, useValue: facade },
        { provide: RecommendationReviewCoordinator, useValue: reviewCoordinator },
      ],
    });

    const fixture = TestBed.createComponent(ClaimsIntelligencePageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.select(firstItem);
    component.select(secondItem);
    secondWorkspace.next(workspaceFor(secondItem));
    secondWorkspace.complete();
    firstWorkspace.next(workspaceFor(firstItem));
    firstWorkspace.complete();
    fixture.detectChanges();

    expect(component.selectedId()).toBe('claim-2');
    expect(component.workspace()?.claim.id).toBe('claim-2');
    expect(component.loadingWorkspace()).toBeFalse();
  });

  it('reloads recommendation and audit data after a confirmed review', () => {
    const facade = facadeSpy();
    const reviewCoordinator = jasmine.createSpyObj<RecommendationReviewCoordinator>('RecommendationReviewCoordinator', ['review']);
    const pendingWorkspace = workspaceFor(firstItem);
    pendingWorkspace.recommendation = {
      id: 'recommendation-1',
      recommendedAction: 'REQUEST_INFORMATION',
      explanation: 'Collect missing evidence.',
      confidence: 92,
      missingInformation: ['Damage photos'],
      generatedAt: '2026-08-02T12:30:00Z',
      reviewState: 'PENDING',
    };
    const refreshedWorkspace: IntelligenceWorkspace = {
      ...pendingWorkspace,
      recommendation: {
        ...pendingWorkspace.recommendation,
        reviewState: 'APPROVED',
        reviewerName: 'Interview User',
      },
      audit: [{
        id: 'audit-review',
        actor: 'Interview User',
        actionType: 'RECOMMENDATION_REVIEWED',
        summary: 'Recommendation approved with operator reason.',
        occurredAt: '2026-08-02T13:00:00Z',
      }],
    };
    reviewCoordinator.review.and.returnValue(of(refreshedWorkspace.recommendation!));
    facade.loadWorkspace.and.returnValue(of(refreshedWorkspace));

    TestBed.configureTestingModule({
      imports: [ClaimsIntelligencePageComponent],
      providers: [
        provideRouter([]),
        { provide: IntelligenceFacadeService, useValue: facade },
        { provide: RecommendationReviewCoordinator, useValue: reviewCoordinator },
      ],
    });

    const fixture = TestBed.createComponent(ClaimsIntelligencePageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.workspace.set(pendingWorkspace);
    const action: PreparedAction = {
      type: 'APPROVE_RECOMMENDATION',
      title: 'Approve recommendation',
      summary: 'Record the human review.',
      effects: ['Audit event is appended.'],
      requiresReason: true,
      destructive: false,
    };

    component.confirmAction({ action, reason: 'Evidence reviewed by the assigned operator.' });
    fixture.detectChanges();

    expect(reviewCoordinator.review).toHaveBeenCalledWith({
      claimId: 'claim-1',
      recommendationId: 'recommendation-1',
      decision: 'APPROVED',
      reason: 'Evidence reviewed by the assigned operator.',
    });
    expect(facade.loadWorkspace).toHaveBeenCalledWith('claim-1');
    expect(component.workspace()?.recommendation?.reviewState).toBe('APPROVED');
    expect(component.workspace()?.audit.length).toBe(1);
  });
});
