import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { ClaimDetail } from '../shared/models/claim.models';

interface LibraryItem {
  readonly title: string;
  readonly detail: string;
  readonly tone: string;
}

export interface WorkflowSimulationInput {
  readonly claimType: string;
  readonly estimatedLoss: number;
  readonly completenessPercentage: number;
  readonly priority: string;
  readonly status: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, MetricCardComponent, AutoAnimateDirective, GsapRevealDirective],
  templateUrl: './workflows-page.component.html',
  styleUrls: ['./workspace-pages.component.css', './workflow-golden-journey.css', './workflows-midnight-violet.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowsPageComponent implements OnInit {
  private readonly claims = inject(ClaimsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedNode = signal(1);
  readonly simulationState = signal<'idle' | 'passed'>('idle');
  readonly simulationInput = signal<WorkflowSimulationInput | null>(null);
  readonly demoClaim = signal<ClaimDetail | null>(null);
  readonly demoError = signal('');
  readonly loadingDemo = signal(false);
  readonly controlStatus = signal('Local draft · not persisted');
  readonly lastSimulationLabel = signal('Not run');
  readonly simulationSteps = Array.from({ length: 8 });
  readonly libraryGroups: readonly { label: string; items: readonly LibraryItem[] }[] = [
    { label: 'TRIGGERS', items: [
      { title: 'Claim Created', detail: 'New claim submitted', tone: 'green' },
      { title: 'Document Received', detail: 'Required document recorded', tone: 'violet' },
      { title: 'Event Occurred', detail: 'Specific system event', tone: 'critical' },
    ] },
    { label: 'LOGIC', items: [
      { title: 'Condition', detail: 'If / else routing', tone: 'green' },
      { title: 'Decision Table', detail: 'Multi-branch routing preview', tone: 'blue' },
      { title: 'Evidence Check', detail: 'Inspect completeness', tone: 'violet' },
      { title: 'Business Rule', detail: 'Local rule validation', tone: 'amber' },
    ] },
    { label: 'ACTIONS', items: [
      { title: 'Assign Review', detail: 'Route to a human queue', tone: 'amber' },
      { title: 'Prepare Notification', detail: 'Draft an in-app message', tone: 'cyan' },
      { title: 'Update Preview', detail: 'Show a local state preview', tone: 'green' },
      { title: 'Create Audit Preview', detail: 'Preview an audit entry', tone: 'violet' },
    ] },
  ];
  readonly nodes = [
    { kind: 'TRIGGER', title: 'Claim Created', detail: 'When a property claim is submitted', tone: 'green' },
    { kind: 'CONDITION', title: 'Policy Context', detail: 'Preview supplied policy state', tone: 'blue' },
    { kind: 'CONDITION', title: 'Claim Amount', detail: 'Display the reported loss band', tone: 'violet' },
    { kind: 'ACTION', title: 'Prepare Notification', detail: 'Draft a claimant portal update', tone: 'amber' },
    { kind: 'REVIEW', title: 'Evidence Review', detail: 'Show completeness to a human reviewer', tone: 'violet' },
    { kind: 'REVIEW', title: 'Manager Review', detail: 'Human review remains required', tone: 'amber' },
    { kind: 'CONDITION', title: 'Priority Context', detail: 'Preview the current priority', tone: 'blue' },
    { kind: 'ACTION', title: 'Route to Queue', detail: 'Preview the target review queue', tone: 'green' },
    { kind: 'ACTION', title: 'Escalation Preview', detail: 'Show a possible human escalation', tone: 'amber' },
    { kind: 'ACTION', title: 'Audit Preview', detail: 'Local output only', tone: 'cyan' },
  ];

  ngOnInit(): void {
    const claimId = this.route.snapshot.queryParamMap.get('claimId');
    if (claimId) this.loadDemoClaimById(claimId);
  }

  saveDraft(): void {
    this.controlStatus.set('Draft saved locally · no server persistence');
  }

  validate(): void {
    this.controlStatus.set('Local validation passed · activation still disabled');
  }

  loadDemoClaim(): void {
    const claimId = this.readSession('claimsflow.demoClaimId');
    this.demoError.set('');
    if (!claimId) {
      this.demoError.set('Reset the demo journey before loading a claim.');
      return;
    }
    this.loadDemoClaimById(claimId);
  }

  runSimulation(): void {
    if (!this.simulationInput()) {
      this.simulationInput.set({ claimType: 'PROPERTY', estimatedLoss: 18750, completenessPercentage: 50, priority: 'HIGH', status: 'UNDER_REVIEW' });
    }
    this.simulationState.set('passed');
    this.lastSimulationLabel.set('Passed locally');
  }

  selectedNodeLabel(): string {
    return this.nodes[this.selectedNode()]?.title ?? 'No node selected';
  }

  private loadDemoClaimById(claimId: string): void {
    this.demoError.set('');
    this.loadingDemo.set(true);
    this.claims.get(claimId).subscribe({
      next: claim => {
        this.demoClaim.set(claim);
        this.simulationInput.set(this.toSimulationInput(claim));
        this.loadingDemo.set(false);
        this.runSimulation();
      },
      error: () => {
        this.demoError.set('The reserved claim could not be loaded for local simulation.');
        this.loadingDemo.set(false);
      },
    });
  }

  private toSimulationInput(claim: ClaimDetail): WorkflowSimulationInput {
    return {
      claimType: claim.claimType,
      estimatedLoss: claim.estimatedLoss,
      completenessPercentage: claim.completenessPercentage,
      priority: claim.priority,
      status: claim.status,
    };
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
