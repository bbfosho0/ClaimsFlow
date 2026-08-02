import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClaimsApiService } from '../../claims/data-access/claims-api.service';
import { Recommendation } from '../models/claim.models';
import { RecommendationReviewCommand } from './recommendation-review.models';
import { normalizeReviewReason } from './recommendation-review.validators';

@Injectable({ providedIn: 'root' })
export class RecommendationReviewCoordinator {
  private readonly api = inject(ClaimsApiService);

  review(command: RecommendationReviewCommand): Observable<Recommendation> {
    return this.api.reviewRecommendation(
      command.claimId,
      command.recommendationId,
      command.decision,
      'Interview User',
      normalizeReviewReason(command.reason),
    );
  }
}
