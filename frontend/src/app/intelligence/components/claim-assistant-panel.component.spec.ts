import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssistantAnswer, IntelligenceWorkspace } from '../intelligence.models';
import { ClaimAssistantPanelComponent } from './claim-assistant-panel.component';

const workspace: IntelligenceWorkspace = {
  claim: {
    id: 'claim-1',
    claimNumber: 'CF-2026-1001',
    claimantName: 'Taylor Morgan',
    claimantEmail: 'taylor@example.test',
    claimType: 'AUTO',
    incidentDate: '2026-07-22',
    estimatedLoss: 12000,
    description: 'Front-end collision damage.',
    evidence: {
      incidentReportPresent: true,
      photosPresent: false,
      proofOfOwnershipPresent: true,
      medicalDocumentationPresent: false,
    },
    completenessPercentage: 50,
    missingEvidence: ['Damage photos'],
    priority: 'CRITICAL',
    priorityFactors: ['Evidence is incomplete'],
    status: 'UNDER_REVIEW',
    allowedNextStatuses: ['WAITING_FOR_INFORMATION'],
    slaDeadline: '2026-08-03T12:00:00Z',
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

const answer: AssistantAnswer = {
  title: 'Review missing evidence',
  body: 'Damage photos are required before final review.',
  facts: [{
    id: 'fact-1',
    label: 'Damage photos',
    detail: 'Required evidence is missing.',
    classification: 'missing',
    source: 'Claim evidence ledger',
  }],
};

describe('ClaimAssistantPanelComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('emits investigation mode from the review prompt and preserves source classification', () => {
    const fixture = TestBed.createComponent(ClaimAssistantPanelComponent);
    fixture.componentRef.setInput('workspace', workspace);
    fixture.componentRef.setInput('mode', 'review');
    fixture.componentRef.setInput('answer', answer);
    let requestedMode = '';
    fixture.componentInstance.modeChanged.subscribe(mode => requestedMode = mode);
    fixture.detectChanges();

    const prompt = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Which evidence is missing?')) as HTMLButtonElement;
    prompt.click();

    expect(requestedMode).toBe('investigation');
    expect(fixture.nativeElement.querySelector('[data-classification="missing"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Claim evidence ledger');
  });

  it('emits only a prepared approval request and never reviews directly', () => {
    const fixture = TestBed.createComponent(ClaimAssistantPanelComponent);
    fixture.componentRef.setInput('workspace', workspace);
    fixture.componentRef.setInput('mode', 'action');
    fixture.componentRef.setInput('answer', answer);
    let approvalRequested = false;
    fixture.componentInstance.prepareApproval.subscribe(() => approvalRequested = true);
    fixture.detectChanges();

    const prepare = fixture.nativeElement.querySelector('.action-buttons .button.primary') as HTMLButtonElement;
    prepare.click();
    expect(approvalRequested).toBeTrue();
  });
});
