import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RecommendationReviewCoordinator } from '../shared/recommendation-review/recommendation-review-coordinator.service';
import { ClaimsIntelligencePageComponent } from './claims-intelligence-page.component';
import { IntelligenceFacadeService } from './intelligence-facade.service';
import { IntelligenceQueueItem, IntelligenceWorkspace } from './intelligence.models';

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

describe('ClaimsIntelligencePageComponent', () => {
  it('keeps the latest selected dossier when an older request completes later', () => {
    const firstWorkspace = new Subject<IntelligenceWorkspace>();
    const secondWorkspace = new Subject<IntelligenceWorkspace>();
    const facade = jasmine.createSpyObj<IntelligenceFacadeService>('IntelligenceFacadeService', [
      'loadReviewQueue',
      'loadWorkspace',
      'evidenceNodes',
      'assistantAnswer',
      'generateRecommendation',
      'prepareAction',
    ]);
    const reviewCoordinator = jasmine.createSpyObj<RecommendationReviewCoordinator>('RecommendationReviewCoordinator', ['review']);
    facade.loadReviewQueue.and.returnValue(of([]));
    facade.loadWorkspace.and.callFake(id => id === 'claim-1' ? firstWorkspace : secondWorkspace);
    facade.evidenceNodes.and.returnValue([]);
    facade.assistantAnswer.and.returnValue({ title: 'Review', body: 'Evidence-grounded answer.', facts: [] });

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
});
