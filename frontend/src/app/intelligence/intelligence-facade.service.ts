import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { DEFAULT_FILTERS } from '../claims/data-access/claim-filter-codec';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimDetail, ClaimSummary, Recommendation } from '../shared/models/claim.models';
import { AssistantAnswer, EvidenceReasoningNode, IntelligenceMode, IntelligenceQueueItem, IntelligenceWorkspace, PreparedAction, PreparedActionType } from './intelligence.models';

@Injectable({ providedIn: 'root' })
export class IntelligenceFacadeService {
  private readonly api = inject(ClaimsApiService);

  loadReviewQueue(): Observable<IntelligenceQueueItem[]> {
    return this.api.list({ ...DEFAULT_FILTERS, size: 50, sort: 'priority,desc' }).pipe(
      map(page => page.content
        .map(claim => this.toQueueItem(claim))
        .sort((left, right) => right.attentionScore - left.attentionScore)),
    );
  }

  loadWorkspace(claimId: string): Observable<IntelligenceWorkspace> {
    return forkJoin({
      claim: this.api.get(claimId),
      recommendation: this.api.getLatestRecommendation(claimId),
      audit: this.api.getAudit(claimId),
    });
  }

  generateRecommendation(claimId: string): Observable<Recommendation> {
    return this.api.generateRecommendation(claimId);
  }

  evidenceNodes(claim: ClaimDetail, recommendation: Recommendation | null): EvidenceReasoningNode[] {
    const nodes: EvidenceReasoningNode[] = [
      {
        id: 'coverage',
        label: 'Claim record',
        detail: `${claim.claimNumber} is a ${claim.claimType.toLowerCase().replace('_', ' ')} claim in ${claim.status.toLowerCase().replaceAll('_', ' ')} status.`,
        classification: 'verified',
        source: 'Claim API',
      },
      {
        id: 'incident-report',
        label: 'Incident report',
        detail: claim.evidence.incidentReportPresent ? 'Incident report is present.' : 'Incident report is not present.',
        classification: claim.evidence.incidentReportPresent ? 'verified' : 'missing',
        source: 'Evidence ledger',
      },
      {
        id: 'photos',
        label: 'Damage photos',
        detail: claim.evidence.photosPresent ? 'Damage photographs are present.' : 'Damage photographs are not present.',
        classification: claim.evidence.photosPresent ? 'verified' : 'missing',
        source: 'Evidence ledger',
      },
      {
        id: 'ownership',
        label: 'Proof of ownership',
        detail: claim.evidence.proofOfOwnershipPresent ? 'Ownership evidence is present.' : 'Ownership evidence is not present.',
        classification: claim.evidence.proofOfOwnershipPresent ? 'verified' : 'missing',
        source: 'Evidence ledger',
      },
      {
        id: 'priority-policy',
        label: 'Priority policy',
        detail: claim.priorityFactors.join(' ') || 'Backend priority policy produced the current priority.',
        classification: 'policy',
        source: 'Deterministic priority policy',
      },
    ];

    if (recommendation) {
      nodes.push({
        id: 'recommendation',
        label: 'Recommended action',
        detail: recommendation.explanation,
        classification: 'inferred',
        source: 'Advisory recommendation',
      });
      recommendation.missingInformation.forEach((value, index) => nodes.push({
        id: `missing-${index}`,
        label: value,
        detail: 'The recommendation identifies this as missing information.',
        classification: 'missing',
        source: 'Recommendation output',
      }));
    }

    return nodes;
  }

  assistantAnswer(mode: IntelligenceMode, workspace: IntelligenceWorkspace): AssistantAnswer {
    const nodes = this.evidenceNodes(workspace.claim, workspace.recommendation);
    if (mode === 'investigation') {
      const missing = nodes.filter(node => node.classification === 'missing');
      return {
        title: missing.length ? `${missing.length} evidence gaps require investigation` : 'No evidence contradiction is currently visible',
        body: missing.length
          ? 'The unresolved items can affect completeness and review confidence. ClaimsFlow is surfacing them, not inferring that they exist.'
          : 'The available structured evidence is internally consistent. A human should still inspect source documents before a consequential decision.',
        facts: missing.length ? missing : nodes.filter(node => node.classification === 'verified').slice(0, 3),
      };
    }
    if (mode === 'action') {
      return {
        title: 'Prepare a reversible next step',
        body: 'ClaimsFlow can draft an evidence request or prepare a recommendation review. Nothing is executed until the operator previews the exact result and confirms it with a reason.',
        facts: nodes.filter(node => node.classification === 'missing' || node.classification === 'policy').slice(0, 4),
      };
    }
    return {
      title: workspace.recommendation ? this.humanize(workspace.recommendation.recommendedAction) : 'Generate evidence-grounded guidance',
      body: workspace.recommendation?.explanation ?? 'No recommendation has been generated for this claim. Generation uses the configured advisory provider with deterministic fallback and does not alter claim workflow state.',
      facts: nodes.slice(0, 5),
    };
  }

  prepareAction(type: PreparedActionType, workspace: IntelligenceWorkspace): PreparedAction {
    if (type === 'DRAFT_EVIDENCE_REQUEST') {
      return {
        type,
        title: 'Prepare evidence request',
        summary: `Create a draft request for the missing evidence on ${workspace.claim.claimNumber}.`,
        effects: [
          'A claimant communication draft is prepared locally.',
          'Claim status and assignment remain unchanged.',
          'Nothing is sent automatically.',
        ],
        requiresReason: false,
        destructive: false,
      };
    }
    const approved = type === 'APPROVE_RECOMMENDATION';
    return {
      type,
      title: approved ? 'Approve recommendation' : 'Reject recommendation',
      summary: `${approved ? 'Approve' : 'Reject'} the current advisory recommendation for ${workspace.claim.claimNumber}.`,
      effects: [
        `Recommendation state becomes ${approved ? 'Approved' : 'Rejected'}.`,
        `Claim status remains ${this.humanize(workspace.claim.status)}.`,
        'The operator reason is appended to the immutable audit timeline.',
      ],
      requiresReason: true,
      destructive: !approved,
    };
  }

  private toQueueItem(claim: ClaimSummary): IntelligenceQueueItem {
    const priorityWeight = { LOW: 5, MEDIUM: 15, HIGH: 28, CRITICAL: 42 }[claim.priority];
    const evidencePenalty = Math.max(0, 100 - claim.completenessPercentage) / 4;
    const ownershipPenalty = claim.assignedAdjusterName ? 0 : 14;
    const statusWeight = claim.status === 'WAITING_FOR_INFORMATION' ? 9 : claim.status === 'READY_FOR_DECISION' ? 6 : 0;
    const attentionScore = Math.round(Math.min(100, priorityWeight + evidencePenalty + ownershipPenalty + statusWeight));
    const reasons: string[] = [];
    if (claim.priority === 'CRITICAL' || claim.priority === 'HIGH') reasons.push(`${this.humanize(claim.priority)} priority`);
    if (claim.completenessPercentage < 100) reasons.push(`${100 - claim.completenessPercentage}% evidence gap`);
    if (!claim.assignedAdjusterName) reasons.push('unassigned');
    return {
      claim,
      attentionScore,
      reason: reasons.join(' · ') || 'Routine review',
      tone: claim.priority === 'CRITICAL' ? 'critical' : claim.completenessPercentage < 75 ? 'warning' : claim.status === 'READY_FOR_DECISION' ? 'advisory' : 'live',
    };
  }

  private humanize(value: string): string {
    return value.toLowerCase().replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase());
  }
}
