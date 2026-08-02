import { AuditEvent, ClaimDetail, ClaimSummary, Recommendation } from '../shared/models/claim.models';

export type IntelligenceMode = 'review' | 'investigation' | 'action';
export type EvidenceClassification = 'verified' | 'missing' | 'inferred' | 'policy' | 'operator' | 'uncertain';
export type PreparedActionType = 'APPROVE_RECOMMENDATION' | 'REJECT_RECOMMENDATION' | 'DRAFT_EVIDENCE_REQUEST';

export interface IntelligenceQueueItem {
  claim: ClaimSummary;
  attentionScore: number;
  reason: string;
  tone: 'critical' | 'warning' | 'advisory' | 'live';
}

export interface IntelligenceWorkspace {
  claim: ClaimDetail;
  recommendation: Recommendation | null;
  audit: AuditEvent[];
}

export interface EvidenceReasoningNode {
  id: string;
  label: string;
  detail: string;
  classification: EvidenceClassification;
  source: string;
}

export interface AssistantAnswer {
  title: string;
  body: string;
  facts: EvidenceReasoningNode[];
}

export interface PreparedAction {
  type: PreparedActionType;
  title: string;
  summary: string;
  effects: string[];
  requiresReason: boolean;
  destructive: boolean;
}
