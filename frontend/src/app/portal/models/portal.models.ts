export type EvidenceKind =
  | 'INCIDENT_REPORT'
  | 'PHOTOS'
  | 'PROOF_OF_OWNERSHIP'
  | 'MEDICAL_DOCUMENTATION';

export interface PortalEvidence {
  readonly incidentReportPresent: boolean;
  readonly photosPresent: boolean;
  readonly proofOfOwnershipPresent: boolean;
  readonly medicalDocumentationPresent: boolean;
}

export interface PortalTimelineEvent {
  readonly actionType: string;
  readonly summary: string;
  readonly occurredAt: string;
}

export interface PortalClaim {
  readonly claimId: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly claimType: string;
  readonly status: string;
  readonly completenessPercentage: number;
  readonly slaDeadline: string;
  readonly evidence: PortalEvidence;
  readonly timeline: readonly PortalTimelineEvent[];
  readonly nextAction: string;
}

export interface PortalMessage {
  readonly id: string;
  readonly author: string;
  readonly body: string;
  readonly createdAt: string;
}
