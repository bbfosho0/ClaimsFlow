export type ClaimType = 'AUTO' | 'PROPERTY' | 'PERSONAL_INJURY';
export type ClaimRegion = 'NORTHEAST' | 'SOUTHEAST' | 'MIDWEST' | 'SOUTHWEST' | 'WEST';
export type ClaimPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ClaimStatus = 'NEW' | 'UNDER_REVIEW' | 'WAITING_FOR_INFORMATION' | 'READY_FOR_DECISION' | 'RESOLVED' | 'CLOSED';
export type RecommendationReviewState = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MessageAudience = 'CLAIMANT' | 'INTERNAL';

export interface Adjuster {
  id: string;
  displayName: string;
  email: string;
  role: string;
  team?: string;
  workloadCapacity: number;
}

export interface Evidence {
  incidentReportPresent: boolean;
  photosPresent: boolean;
  proofOfOwnershipPresent: boolean;
  medicalDocumentationPresent: boolean;
}

export interface ClaimSummary {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimType: ClaimType;
  region?: ClaimRegion;
  priority: ClaimPriority;
  status: ClaimStatus;
  assignedAdjusterName?: string;
  assignedTeam?: string;
  slaDeadline: string;
  completenessPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimPage {
  content: ClaimSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ClaimDetail {
  id: string;
  claimNumber: string;
  claimantName: string;
  claimantEmail: string;
  claimType: ClaimType;
  region?: ClaimRegion;
  incidentDate: string;
  estimatedLoss: number;
  description: string;
  evidence: Evidence;
  completenessPercentage: number;
  missingEvidence: string[];
  priority: ClaimPriority;
  priorityFactors: string[];
  status: ClaimStatus;
  allowedNextStatuses: ClaimStatus[];
  assignedAdjuster?: Adjuster;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  version: number;
}

export interface CreateClaimRequest {
  claimantName: string;
  claimantEmail: string;
  claimType: ClaimType;
  incidentDate: string;
  estimatedLoss: number;
  description: string;
  incidentReportPresent: boolean;
  photosPresent: boolean;
  proofOfOwnershipPresent: boolean;
  medicalDocumentationPresent: boolean;
}

export interface Recommendation {
  id: string;
  recommendedAction: string;
  explanation: string;
  confidence: number;
  missingInformation: string[];
  generatedAt: string;
  reviewState: RecommendationReviewState;
  reviewerName?: string;
  reviewedAt?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actionType: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
  occurredAt: string;
}

export interface ClaimMessage {
  id: string;
  author: string;
  audience?: MessageAudience;
  body: string;
  createdAt: string;
}
