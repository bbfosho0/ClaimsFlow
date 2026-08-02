import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaimDetail, ClaimPage, Recommendation } from '../shared/models/claim.models';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { IntelligenceFacadeService } from './intelligence-facade.service';

const claim: ClaimDetail = {
  id: 'claim-1',
  claimNumber: 'CF-2026-0142',
  claimantName: 'Taylor Morgan',
  claimantEmail: 'taylor@example.test',
  claimType: 'PROPERTY',
  incidentDate: '2026-07-30',
  estimatedLoss: 42000,
  description: 'Storm damage affected the roof and interior ceiling.',
  evidence: {
    incidentReportPresent: true,
    photosPresent: true,
    proofOfOwnershipPresent: false,
    medicalDocumentationPresent: false,
  },
  completenessPercentage: 75,
  missingEvidence: ['Proof of ownership'],
  priority: 'CRITICAL',
  priorityFactors: ['Estimated loss exceeds threshold', 'Evidence is incomplete'],
  status: 'UNDER_REVIEW',
  allowedNextStatuses: ['WAITING_FOR_INFORMATION', 'READY_FOR_DECISION'],
  slaDeadline: '2026-08-03T12:00:00Z',
  createdAt: '2026-08-01T12:00:00Z',
  updatedAt: '2026-08-02T12:00:00Z',
  version: 1,
};

const recommendation: Recommendation = {
  id: 'rec-1',
  recommendedAction: 'REQUEST_INFORMATION',
  explanation: 'Collect proof of ownership before final review.',
  confidence: 84,
  missingInformation: ['Proof of ownership'],
  generatedAt: '2026-08-02T12:30:00Z',
  reviewState: 'PENDING',
};

const page: ClaimPage = {
  content: [{
    id: claim.id,
    claimNumber: claim.claimNumber,
    claimantName: claim.claimantName,
    claimType: claim.claimType,
    priority: claim.priority,
    status: claim.status,
    completenessPercentage: claim.completenessPercentage,
    slaDeadline: claim.slaDeadline,
    createdAt: claim.createdAt,
  }],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

describe('IntelligenceFacadeService', () => {
  it('ranks urgent incomplete unassigned claims and exposes source classifications', () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list', 'get', 'getLatestRecommendation', 'getAudit', 'generateRecommendation', 'reviewRecommendation']);
    api.list.and.returnValue(of(page));

    TestBed.configureTestingModule({ providers: [{ provide: ClaimsApiService, useValue: api }] });
    const service = TestBed.inject(IntelligenceFacadeService);

    service.loadReviewQueue().subscribe(items => {
      expect(items[0].claim.claimNumber).toBe('CF-2026-0142');
      expect(items[0].attentionScore).toBeGreaterThan(50);
      expect(items[0].reason).toContain('unassigned');
    });

    const nodes = service.evidenceNodes(claim, recommendation);
    expect(nodes.some(node => node.classification === 'verified' && node.source === 'Evidence ledger')).toBeTrue();
    expect(nodes.some(node => node.classification === 'missing' && node.label === 'Proof of ownership')).toBeTrue();
    expect(nodes.some(node => node.classification === 'policy')).toBeTrue();
    expect(nodes.some(node => node.classification === 'inferred' && node.source === 'Advisory recommendation')).toBeTrue();
  });

  it('prepares an action without mutating the backend', () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list', 'get', 'getLatestRecommendation', 'getAudit', 'generateRecommendation', 'reviewRecommendation']);
    TestBed.configureTestingModule({ providers: [{ provide: ClaimsApiService, useValue: api }] });
    const service = TestBed.inject(IntelligenceFacadeService);

    const action = service.prepareAction('APPROVE_RECOMMENDATION', { claim, recommendation, audit: [] });

    expect(action.requiresReason).toBeTrue();
    expect(action.effects).toContain('Claim status remains Under review.');
    expect(api.reviewRecommendation).not.toHaveBeenCalled();
    expect(api.generateRecommendation).not.toHaveBeenCalled();
  });

  it('sends the operator reason only after an explicit review request', () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list', 'get', 'getLatestRecommendation', 'getAudit', 'generateRecommendation', 'reviewRecommendation']);
    api.reviewRecommendation.and.returnValue(of({ ...recommendation, reviewState: 'APPROVED', reviewerName: 'Interview User' }));
    api.get.and.returnValue(of(claim));
    api.getLatestRecommendation.and.returnValue(of({ ...recommendation, reviewState: 'APPROVED', reviewerName: 'Interview User' }));
    api.getAudit.and.returnValue(of([]));

    TestBed.configureTestingModule({ providers: [{ provide: ClaimsApiService, useValue: api }] });
    const service = TestBed.inject(IntelligenceFacadeService);

    service.reviewRecommendation(claim.id, recommendation.id, 'APPROVED', 'Evidence reviewed by the assigned operator.').subscribe();

    expect(api.reviewRecommendation).toHaveBeenCalledWith(
      claim.id,
      recommendation.id,
      'APPROVED',
      'Interview User',
      'Evidence reviewed by the assigned operator.',
    );
  });
});
