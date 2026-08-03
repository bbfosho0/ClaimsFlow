import { DemoRoleId } from '../core/demo-role/demo-role.model';

export type TourStepId =
  | 'claimant-portal'
  | 'adjuster-review'
  | 'manager-impact'
  | 'administrator-routing'
  | 'engineering-proof';

export interface TourStep {
  id: TourStepId;
  index: number;
  title: string;
  notice: string;
  technicalProof: string;
  target: string;
  role?: DemoRoleId;
  route: (claimId?: string) => string;
}
