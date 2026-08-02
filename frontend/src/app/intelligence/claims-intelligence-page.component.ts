import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiError } from '../core/api/api-error';
import { humanizeEnum } from '../shared/presentation/claim-presentation';
import { RecommendationReviewCoordinator } from '../shared/recommendation-review/recommendation-review-coordinator.service';
import { ClaimAssistantPanelComponent } from './components/claim-assistant-panel.component';
import { ConfirmedIntelligenceAction, IntelligenceActionDialogComponent } from './components/intelligence-action-dialog.component';
import { IntelligenceDossierComponent } from './components/intelligence-dossier.component';
import { IntelligenceReviewQueueComponent } from './components/intelligence-review-queue.component';
import { IntelligenceFacadeService } from './intelligence-facade.service';
import { IntelligenceMode, IntelligenceQueueItem, IntelligenceWorkspace, PreparedAction, PreparedActionType } from './intelligence.models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, IntelligenceReviewQueueComponent, IntelligenceDossierComponent, ClaimAssistantPanelComponent, IntelligenceActionDialogComponent],
  templateUrl: './claims-intelligence-page.component.html',
  styleUrl: './claims-intelligence-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ClaimsIntelligencePageComponent implements OnInit {
  private readonly facade = inject(IntelligenceFacadeService);
  private readonly reviewCoordinator = inject(RecommendationReviewCoordinator);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedItems = new Subject<IntelligenceQueueItem>();

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
    this.selectedItems.pipe(
      tap(item => {
        this.selectedId.set(item.claim.id);
        this.workspace.set(null);
        this.loadingWorkspace.set(true);
        this.error.set('');
        this.confirmationMessage.set('');
        this.preparedDraft.set('');
      }),
      switchMap(item => this.facade.loadWorkspace(item.claim.id).pipe(
        map(workspace => ({ workspace, error: '' })),
        catchError((error: unknown) => of({
          workspace: null as IntelligenceWorkspace | null,
          error: this.message(error, 'The selected intelligence dossier is unavailable.'),
        })),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.workspace.set(result.workspace);
      this.error.set(result.error);
      this.loadingWorkspace.set(false);
    });

    this.facade.loadReviewQueue().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
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
    this.selectedItems.next(item);
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
    this.preparedAction.set(this.facade.prepareAction(type, workspace));
  }

  cancelAction(): void {
    if (this.acting()) return;
    this.preparedAction.set(null);
  }

  confirmAction(event: ConfirmedIntelligenceAction): void {
    const workspace = this.workspace();
    if (!workspace) return;

    if (event.action.type === 'DRAFT_EVIDENCE_REQUEST') {
      const missing = workspace.claim.missingEvidence.length
        ? workspace.claim.missingEvidence.join(', ')
        : 'supporting evidence';
      this.preparedDraft.set(`Hello ${workspace.claim.claimantName}, we are reviewing claim ${workspace.claim.claimNumber}. Please provide: ${missing}. This draft has not been sent.`);
      this.confirmationMessage.set('Evidence request draft prepared. No communication was sent and no claim state changed.');
      this.preparedAction.set(null);
      this.mode.set('action');
      return;
    }

    const recommendation = workspace.recommendation;
    if (!recommendation) return;
    const decision = event.action.type === 'APPROVE_RECOMMENDATION' ? 'APPROVED' : 'REJECTED';
    this.acting.set(true);
    this.error.set('');
    this.reviewCoordinator.review({
      claimId: workspace.claim.id,
      recommendationId: recommendation.id,
      decision,
      reason: event.reason,
    }).subscribe({
      next: updatedRecommendation => {
        this.workspace.set({ ...workspace, recommendation: updatedRecommendation });
        this.confirmationMessage.set(`${this.label(decision)} review recorded with operator reason and audit event.`);
        this.preparedAction.set(null);
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
