export type TourStepId =
  | 'portfolio-pressure'
  | 'prioritized-queue'
  | 'claim-investigation'
  | 'human-authority'
  | 'review-ready-intake'
  | 'engineering-proof';

export interface TourStep {
  id: TourStepId;
  index: number;
  title: string;
  notice: string;
  technicalProof: string;
  target: string;
  route: (claimId?: string) => string;
}
