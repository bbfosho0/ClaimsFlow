import { Injectable } from '@angular/core';

export interface AnalyticsMetric {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly tone: 'cyan' | 'blue' | 'violet' | 'green' | 'magenta' | 'amber';
}

export interface DocumentRecord {
  readonly name: string;
  readonly type: string;
  readonly status: string;
  readonly size: string;
  readonly confidence: number;
  readonly summary: string;
}

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly active: number;
  readonly capacity: number;
  readonly sla: string;
}

export interface WorkflowNode {
  readonly kind: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: 'cyan' | 'violet' | 'magenta' | 'amber' | 'green';
}

@Injectable({ providedIn: 'root' })
export class WorkspaceDataService {
  readonly analyticsMetrics: readonly AnalyticsMetric[] = [
    { label: 'Total Payouts (MTD)', value: '$4.73M', trend: '↑ 18% vs prior 30 days', tone: 'cyan' },
    { label: 'Open Claims', value: '1,389', trend: '↑ 12% vs prior 30 days', tone: 'blue' },
    { label: 'Avg. Resolution Time', value: '4.2 days', trend: '↓ 0.6 days vs prior', tone: 'violet' },
    { label: 'Approval Rate', value: '76.8%', trend: '↑ 5.4% vs prior', tone: 'green' },
    { label: 'Claims Received', value: '2,143', trend: '↑ 9% vs prior', tone: 'magenta' },
    { label: 'Fraud Detection Savings', value: '$621K', trend: '↑ 14% vs prior', tone: 'amber' },
  ];

  readonly documents: readonly DocumentRecord[] = [
    { name: 'Loss Assessment.pdf', type: 'Assessment', status: 'Verified', size: '2.4 MB', confidence: 98, summary: 'Independent assessment confirms structural water damage across the north wing.' },
    { name: 'Police Report.pdf', type: 'Official report', status: 'Reviewed', size: '1.8 MB', confidence: 96, summary: 'Report confirms incident timing, parties involved, and the responding officer narrative.' },
    { name: 'Damage Photos.zip', type: 'Evidence bundle', status: 'Indexed', size: '48.2 MB', confidence: 93, summary: 'Twenty-four timestamped photos grouped by room and severity.' },
    { name: 'Policy Endorsement.pdf', type: 'Policy', status: 'Needs review', size: '620 KB', confidence: 89, summary: 'Endorsement modifies water-damage sublimits and temporary accommodation terms.' },
  ];

  readonly team: readonly TeamMember[] = [
    { name: 'Priya Shah', role: 'Senior Adjuster', active: 14, capacity: 18, sla: '98.4%' },
    { name: 'Marcus Reed', role: 'Property Specialist', active: 11, capacity: 16, sla: '96.8%' },
    { name: 'Elena Torres', role: 'Complex Claims', active: 9, capacity: 15, sla: '99.1%' },
    { name: 'Jordan Kim', role: 'Triage Lead', active: 12, capacity: 14, sla: '94.6%' },
  ];

  readonly workflowNodes: readonly WorkflowNode[] = [
    { kind: 'Trigger', title: 'Claim created', detail: 'Property · severity high', tone: 'cyan' },
    { kind: 'Condition', title: 'Evidence score', detail: 'Below 80% completeness', tone: 'violet' },
    { kind: 'AI action', title: 'Summarize evidence', detail: 'Generate review brief', tone: 'magenta' },
    { kind: 'Approval', title: 'Human review', detail: 'Claims manager required', tone: 'amber' },
    { kind: 'Action', title: 'Assign specialist', detail: 'Property Response team', tone: 'green' },
  ];
}
