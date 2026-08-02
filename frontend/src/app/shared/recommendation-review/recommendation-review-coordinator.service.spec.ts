import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClaimsApiService } from '../../claims/data-access/claims-api.service';
import { Recommendation } from '../models/claim.models';
import { RecommendationReviewCoordinator } from './recommendation-review-coordinator.service';
import { normalizeReviewReason, reviewReasonValidators } from './recommendation-review.validators';

const recommendation: Recommendation = {
  id: 'recommendation-1',
  recommendedAction: 'REQUEST_INFORMATION',
  explanation: 'Collect missing evidence before the claim advances.',
  confidence: 96,
  missingInformation: ['Damage photos'],
  generatedAt: '2026-07-23T10:00:00Z',
  reviewState: 'APPROVED',
  reviewerName: 'Interview User',
};

describe('RecommendationReviewCoordinator', () => {
  let api: jasmine.SpyObj<ClaimsApiService>;
  let coordinator: RecommendationReviewCoordinator;

  beforeEach(() => {
    api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['reviewRecommendation']);
    api.reviewRecommendation.and.returnValue(of(recommendation));

    TestBed.configureTestingModule({
      providers: [
        RecommendationReviewCoordinator,
        { provide: ClaimsApiService, useValue: api },
      ],
    });

    coordinator = TestBed.inject(RecommendationReviewCoordinator);
  });

  it('normalizes the reason and maps the command to the API', () => {
    coordinator.review({
      claimId: 'claim-1',
      recommendationId: 'recommendation-1',
      decision: 'APPROVED',
      reason: '  Evidence reviewed by the operator.  ',
    }).subscribe();

    expect(api.reviewRecommendation).toHaveBeenCalledWith(
      'claim-1',
      'recommendation-1',
      'APPROVED',
      'Interview User',
      'Evidence reviewed by the operator.',
    );
  });

  it('propagates API errors without replacing them', done => {
    const failure = new Error('provider unavailable');
    api.reviewRecommendation.and.returnValue(throwError(() => failure));

    coordinator.review({
      claimId: 'claim-1',
      recommendationId: 'recommendation-1',
      decision: 'REJECTED',
      reason: 'Recommendation lacks sufficient support.',
    }).subscribe({
      error: error => {
        expect(error).toBe(failure);
        done();
      },
    });
  });

  it('shares trimmed reason normalization and length validation', () => {
    expect(normalizeReviewReason('  reviewed  ')).toBe('reviewed');
    const control = new FormControl('short', { nonNullable: true, validators: reviewReasonValidators() });
    expect(control.hasError('minlength')).toBeTrue();
    control.setValue('Evidence reviewed by the operator.');
    expect(control.valid).toBeTrue();
  });
});
