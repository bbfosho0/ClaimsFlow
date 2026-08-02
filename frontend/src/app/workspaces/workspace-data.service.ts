import { Injectable } from '@angular/core';

export type WorkspaceTone = 'cyan' | 'blue' | 'violet' | 'green' | 'magenta' | 'amber' | 'critical' | 'muted';

export interface AnalyticsMetric {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly tone: Exclude<WorkspaceTone, 'critical' | 'muted'>;
}

export interface DocumentRecord {
  readonly name: string;
  readonly displayName: string;
  readonly type: string;
  readonly status: string;
  readonly size: string;
  readonly version: string;
  readonly date: string;
  readonly tone: WorkspaceTone;
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
  readonly tone: Exclude<WorkspaceTone, 'blue' | 'critical' | 'muted'>;
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
    {
      name: 'Police Report.pdf',
      displayName: 'Police Report · Incident #4567',
      type: 'Official report',
      status: 'Verified',
      size: '1.2 MB',
      version: 'v2.1',
      date: 'May 19',
      tone: 'green',
      confidence: 96,
      summary: 'Vehicle collision at Main St and 2nd Ave. Driver 2 failed to yield right of way.',
    },
    {
      name: 'Vehicle Damage Photos',
      displayName: 'Vehicle Damage Photos',
      type: 'Photo evidence',
      status: 'Processed',
      size: '8.4 MB',
      version: 'v1.0',
      date: 'May 19',
      tone: 'blue',
      confidence: 94,
      summary: 'Photos match the damage described in the incident report.',
    },
    {
      name: 'Repair Estimate.pdf',
      displayName: 'Repair Estimate · ABC Body',
      type: 'Estimate',
      status: 'Reviewed',
      size: '1.8 MB',
      version: 'v1.3',
      date: 'May 18',
      tone: 'cyan',
      confidence: 97,
      summary: 'Repair estimate totals $4,730 and remains within the current policy limits.',
    },
    {
      name: 'Medical Report.pdf',
      displayName: 'Medical Report · Dr. Smith',
      type: 'Medical record',
      status: 'Pending Review',
      size: '642 KB',
      version: 'v1.0',
      date: 'May 18',
      tone: 'amber',
      confidence: 89,
      summary: 'Medical documentation is awaiting claims review.',
    },
    {
      name: 'Insurance Card.pdf',
      displayName: 'Insurance Card · Front',
      type: 'Insurance card',
      status: 'Extracted',
      size: '320 KB',
      version: 'v1.0',
      date: 'May 17',
      tone: 'violet',
      confidence: 95,
      summary: 'Policy and insured identity fields were extracted successfully.',
    },
    {
      name: 'Witness Statement.pdf',
      displayName: 'Witness Statement · John D.',
      type: 'Witness statement',
      status: 'Verified',
      size: '456 KB',
      version: 'v1.5',
      date: 'May 17',
      tone: 'green',
      confidence: 93,
      summary: 'Witness statement corroborates the collision sequence.',
    },
    {
      name: 'Rental Agreement.pdf',
      displayName: 'Rental Agreement',
      type: 'Agreement',
      status: 'Uploaded',
      size: '412 KB',
      version: 'v1.0',
      date: 'May 17',
      tone: 'blue',
      confidence: 91,
      summary: 'Rental terms and dates are available for review.',
    },
    {
      name: 'Claim Confirmation.eml',
      displayName: 'Email · Claim Confirmation',
      type: 'Correspondence',
      status: 'Archived',
      size: '56 KB',
      version: 'v1.0',
      date: 'May 16',
      tone: 'muted',
      confidence: 100,
      summary: 'Original claim confirmation email retained in the audit record.',
    },
  ];

  readonly team: readonly TeamMember[] = [
    { name: 'Sarah Connor', role: 'Claims Intake', active: 42, capacity: 54, sla: '95%' },
    { name: 'Mike Thompson', role: 'Adjusting Team', active: 96, capacity: 104, sla: '93%' },
    { name: 'Jordan Lee', role: 'SIU Investigations', active: 38, capacity: 58, sla: '90%' },
    { name: 'Lisa Brown', role: 'Medical Review', active: 51, capacity: 60, sla: '96%' },
    { name: 'David Miller', role: 'Payment Review', active: 27, capacity: 38, sla: '94%' },
  ];

  readonly workflowNodes: readonly WorkflowNode[] = [
    { kind: 'Trigger', title: 'Claim Created', detail: 'When property claim is submitted', tone: 'green' },
    { kind: 'Condition', title: 'Policy Active?', detail: 'Is policy active and not expired?', tone: 'blue' as never },
    { kind: 'Condition', title: 'Claim Amount', detail: 'Estimated amount ≤ $25,000?', tone: 'violet' },
    { kind: 'Action', title: 'Send Notification', detail: 'Notify customer of ineligibility', tone: 'amber' },
    { kind: 'AI Action', title: 'Auto-Adjudicate', detail: 'Evaluate and recommend settlement', tone: 'violet' },
    { kind: 'Approval', title: 'Manager Review', detail: 'Required for $25k–$100k', tone: 'amber' },
    { kind: 'Condition', title: 'AI Confidence Score', detail: 'Confidence score ≥ 75%', tone: 'blue' as never },
    { kind: 'Action', title: 'Approve Claim', detail: 'Update status automatically', tone: 'green' },
    { kind: 'Action', title: 'Escalate to Adjuster', detail: 'Send for senior review', tone: 'amber' },
    { kind: 'Action', title: 'Update Claim', detail: 'Close workflow and write audit', tone: 'cyan' },
  ];
}
