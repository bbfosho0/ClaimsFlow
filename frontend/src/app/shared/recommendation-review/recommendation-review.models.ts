import { RecommendationReviewState } from '../models/claim.models';

export type ReviewDecision = Exclude<RecommendationReviewState, 'PENDING'>;

export interface RecommendationReviewCommand {
  claimId: string;
  recommendationId: string;
  decision: ReviewDecision;
  reason: string;
}
