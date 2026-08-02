import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiError } from '../core/api/api-error';
import { humanizeEnum } from '../shared/presentation/claim-presentation';
import { ClaimAssistantPanelComponent } from './components/claim-assistant-panel.component';
import { IntelligenceDossierComponent } from './components/intelligence-dossier.component';
import { IntelligenceReviewQueueComponent } from './components/intelligence-review-queue.component';
import { IntelligenceFacadeService } from './intelligence-facade.service';
import { IntelligenceMode, IntelligenceQueueItem, IntelligenceWorkspace, PreparedAction, PreparedActionType } from './intelligence.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IntelligenceReviewQueueComponent, IntelligenceDossierComponent, ClaimAssistantPanelComponent],
  templateUrl: './claims-intelligence-page.component.html',
  styleUrl: './claims-intelligence-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ClaimsIntelligencePageComponent implements OnInit {
  private readonly facade = inject(IntelligenceFacadeService);

  readonly queue = signal<IntelligenceQueueItem[]>([]);
  readonly selectedId = signal('');
  readonly workspace = signal<IntelligenceWorkspace | null>(null);
  readonly mode = signal<IntelligenceMode>('review');
  readonly loadingQueue = signal(true);
  readonly loadingWorkspace = signal(false);
  readonly acting = signal(false);
  readonly error = signal('');
  readonly preparedAction = signal<PreparedAction | null>(null);
  readonly confirmationMessage = signal('');
  readonly preparedDraft = signal('');
  readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(500)] });

  readonly selectedQueueItem = computed(() => this.queue().find(item => item.claim.id === this.selectedId()) ?? null);
  readonly reasoningNodes = computed(() => {
    const workspace = this.workspace();
    return workspace ? this.facade.evidenceNodes(workspace.claim, workspace.recommendation) : [];
  });
  readonly assistant = computed(() => {
    const workspace = this.workspace();
    return workspace ? this.facade.assistantAnswer(this.mode(), workspace) : null;
  });

  label = humanizeEnum;

  ngOnInit(): void {
    this.facade.loadReviewQueue().subscribe({
      next: items => {
        this.queue.set(items);
        this.loadingQueue.set(false);
        if (items[0]) this.select(items[0]);
      },
      error: (error: unknown) => {
        this.error.set(this.message(error, 'Claims Intelligence review data is unavailable.'));
        this.loadingQueue.set(false);
      },
    });
  }

  select(item: IntelligenceQueueItem): void {
    this.selectedId.set(item.claim.id);
    this.workspace.set(null);
    this.loadingWorkspace.set(true);
    this.error.set('');
    this.confirmationMessage.set('');
    this.preparedDraft.set('');
    this.facade.loadWorkspace(item.claim.id).subscribe({
      next: value => {
        this.workspace.set(value);
        this.loadingWorkspace.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.message(error, 'The selected intelligence dossier is unavailable.'));
        this.loadingWorkspace.set(false);
      },
    });
  }

  setMode(mode: IntelligenceMode): void {
    this.mode.set(mode);
  }

  generateRecommendation(): void {
    const workspace = this.workspace();
    if (!workspace) return;
    this.acting.set(true);
    this.error.set('');
    this.facade.generateRecommendation(workspace.claim.id).subscribe({
      next: recommendation => {
        this.workspace.set({ ...workspace, recommendation });
        this.acting.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.message(error, 'Recommendation generation failed.'));
        this.acting.set(false);
      },
    });
  }

  openAction(type: PreparedActionType): void {
    const workspace = this.workspace();
    if (!workspace) return;
    if (type !== 'DRAFT_EVIDENCE_REQUEST' && !workspace.recommendation) {
      this.error.set('Generate a recommendation before preparing a review decision.');
      return;
    }
    this.reason.reset('');
    this.preparedAction.set(this.facade.prepareAction(type, workspace));
  }

  cancelAction(): void {
    if (this.acting()) return;
    this.preparedAction.set(null);
    this.reason.reset('');
  }

  confirmAction(): void {
    const action = this.preparedAction();
    const workspace = this.workspace();
    if (!action || !workspace) return;

    if (action.type === 'DRAFT_EVIDENCE_REQUEST') {
      const missing = workspace.claim.missingEvidence.length ? workspace.claim.missingEvidence.join(', ') : 'supporting evidence';
      this.preparedDraft.set(`Hello ${workspace.claim.claimantName}, we are reviewing claim ${workspace.claim.claimNumber}. Please provide: ${missing}. This draft has not been sent.`);
      this.confirmationMessage.set('Evidence request draft prepared. No communication was sent and no claim state changed.');
      this.preparedAction.set(null);
      this.mode.set('action');
      return;
    }

    if (this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    const recommendation = workspace.recommendation;
    if (!recommendation) return;

    this.acting.set(true);
    const decision = action.type === 'APPROVE_RECOMMENDATION' ? 'APPROVED' : 'REJECTED';
    this.facade.reviewRecommendation(workspace.claim.id, recommendation.id, decision, this.reason.value.trim()).subscribe({
      next: updated => {
        this.workspace.set(updated);
        this.confirmationMessage.set(`${this.label(decision)} review recorded with operator reason and audit event.`);
        this.preparedAction.set(null);
        this.reason.reset('');
        this.acting.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.message(error, 'The prepared action could not be confirmed.'));
        this.acting.set(false);
      },
    });
  }

  private message(error: unknown, fallback: string): string {
    return error instanceof ApiError ? error.message : fallback;
  }
}
