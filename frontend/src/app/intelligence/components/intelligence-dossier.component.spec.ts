import { TestBed } from '@angular/core/testing';
import { EvidenceReasoningNode, IntelligenceQueueItem, IntelligenceWorkspace } from '../intelligence.models';
import { IntelligenceDossierComponent } from './intelligence-dossier.component';

const selectedItem: IntelligenceQueueItem = {
  claim: {
    id: 'claim-1',
    claimNumber: 'CF-2026-1001',
    claimantName: 'Taylor Morgan',
    claimType: 'AUTO',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    slaDeadline: '2026-08-03T12:00:00Z',
    completenessPercentage: 50,
  },
  attentionScore: 94,
  reason: 'Critical claim with missing evidence.',
  tone: 'critical',
};

const workspace: IntelligenceWorkspace = {
  claim: {
    ...selectedItem.claim,
    claimantEmail: 'taylor@example.test',
    incidentDate: '2026-07-22',
    estimatedLoss: 12000,
    description: 'Front-end collision damage.',
    evidence: {
      incidentReportPresent: true,
      photosPresent: false,
      proofOfOwnershipPresent: true,
      medicalDocumentationPresent: false,
    },
    missingEvidence: ['Damage photos'],
    priorityFactors: ['Evidence is incomplete'],
    allowedNextStatuses: ['WAITING_FOR_INFORMATION'],
    createdAt: '2026-07-23T09:32:00Z',
    updatedAt: '2026-07-23T09:48:00Z',
    version: 1,
  },
  recommendation: {
    id: 'rec-1',
    recommendedAction: 'REQUEST_INFORMATION',
    explanation: 'Collect missing evidence.',
    confidence: 92,
    missingInformation: ['Damage photos'],
    generatedAt: '2026-07-23T10:00:00Z',
    reviewState: 'PENDING',
  },
  audit: [],
};

const reasoningNodes: EvidenceReasoningNode[] = [{
  id: 'node-1',
  label: 'Damage photos',
  detail: 'Required before final review.',
  classification: 'missing',
  source: 'Claim evidence ledger',
}];

describe('IntelligenceDossierComponent', () => {
  it('renders the dossier and emits review preparation events', () => {
    const fixture = TestBed.createComponent(IntelligenceDossierComponent);
    fixture.componentRef.setInput('selectedItem', selectedItem);
    fixture.componentRef.setInput('workspace', workspace);
    fixture.componentRef.setInput('reasoningNodes', reasoningNodes);
    let approvalRequested = false;
    fixture.componentInstance.prepareApproval.subscribe(() => approvalRequested = true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('SELECTED INTELLIGENCE DOSSIER');
    expect(fixture.nativeElement.textContent).toContain('Explainable guidance');
    expect(fixture.nativeElement.querySelector('app-evidence-reasoning-graph')).not.toBeNull();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
    const approve = buttons.find(button => button.textContent?.includes('Approve guidance')) as HTMLButtonElement;
    approve.click();
    expect(approvalRequested).toBeTrue();
  });

  it('emits recommendation generation when no guidance exists', () => {
    const fixture = TestBed.createComponent(IntelligenceDossierComponent);
    fixture.componentRef.setInput('selectedItem', selectedItem);
    fixture.componentRef.setInput('workspace', { ...workspace, recommendation: null });
    fixture.componentRef.setInput('reasoningNodes', reasoningNodes);
    let generated = false;
    fixture.componentInstance.generateRecommendation.subscribe(() => generated = true);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
    const generate = buttons.find(button => button.textContent?.includes('Generate recommendation')) as HTMLButtonElement;
    generate.click();
    expect(generated).toBeTrue();
  });
});
