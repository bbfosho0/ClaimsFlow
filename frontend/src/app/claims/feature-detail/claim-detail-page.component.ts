import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { Adjuster, AuditEvent, ClaimDetail, ClaimStatus, Recommendation } from '../../shared/models/claim.models';
import {
  completenessTone,
  formatSla,
  humanizeEnum,
  priorityTone,
  statusTone,
} from '../../shared/presentation/claim-presentation';
import { ProgressIndicatorComponent } from '../../shared/ui/progress-indicator/progress-indicator.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { ClaimsApiService } from '../data-access/claims-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent, ProgressIndicatorComponent],
  templateUrl: './claim-detail-page.component.html',
  styleUrl: './claim-detail-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClaimsApiService);
  private id = '';

  readonly claim = signal<ClaimDetail | null>(null);
  readonly adjusters = signal<Adjuster[]>([]);
  readonly audit = signal<AuditEvent[]>([]);
  readonly recommendation = signal<Recommendation | null>(null);
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly pageError = signal('');
  readonly assignmentError = signal('');
  readonly statusError = signal('');
  readonly recommendationError = signal('');
  readonly adjusterId = new FormControl('', { nonNullable: true });
  readonly nextStatus = new FormControl<ClaimStatus | ''>('', { nonNullable: true });

  label = humanizeEnum;
  sla = formatSla;
  priorityTone = priorityTone;
  statusTone = statusTone;
  completenessTone = completenessTone;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    forkJoin({
      claim: this.api.get(this.id),
      adjusters: this.api.getAdjusters(),
      audit: this.api.getAudit(this.id),
    }).subscribe({
      next: value => {
        this.claim.set(value.claim);
        this.adjusters.set(value.adjusters);
        this.audit.set(value.audit);
        this.adjusterId.setValue(value.claim.assignedAdjuster?.id ?? '');
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.pageError.set(this.message(error, 'Claim workspace is unavailable.'));
        this.loading.set(false);
      },
    });
  }

  evidenceItems(item: ClaimDetail): ReadonlyArray<{ label: string; present: boolean }> {
    return [
      { label: 'Incident report', present: item.evidence.incidentReportPresent },
      { label: 'Damage photos', present: item.evidence.photosPresent },
      { label: 'Proof of ownership', present: item.evidence.proofOfOwnershipPresent },
      { label: 'Medical documentation', present: item.evidence.medicalDocumentationPresent },
    ];
  }

  priorityIcon(priority: string): string {
    return priority === 'CRITICAL' ? '!' : priority === 'HIGH' ? '▲' : '•';
  }

  statusIcon(status: string): string {
    return status === 'READY_FOR_DECISION' || status === 'RESOLVED' || status === 'CLOSED' ? '✓' : status === 'WAITING_FOR_INFORMATION' ? '!' : '•';
  }

  assign(): void {
    if (!this.adjusterId.value) return;
    this.acting.set(true);
    this.assignmentError.set('');
    this.api.assign(this.id, this.adjusterId.value, 'Interview User').subscribe({
      next: value => {
        this.claim.set(value);
        this.acting.set(false);
        this.refreshAudit();
      },
      error: (error: unknown) => {
        this.assignmentError.set(this.message(error, 'Assignment failed.'));
        this.acting.set(false);
      },
    });
  }

  updateStatus(): void {
    if (!this.nextStatus.value) return;
    this.acting.set(true);
    this.statusError.set('');
    this.api.updateStatus(this.id, this.nextStatus.value, 'Interview User').subscribe({
      next: value => {
        this.claim.set(value);
        this.nextStatus.setValue('');
        this.acting.set(false);
        this.refreshAudit();
      },
      error: (error: unknown) => {
        this.statusError.set(this.message(error, 'Status update failed.'));
        this.acting.set(false);
      },
    });
  }

  generate(): void {
    this.acting.set(true);
    this.recommendationError.set('');
    this.api.generateRecommendation(this.id).subscribe({
      next: value => {
        this.recommendation.set(value);
        this.acting.set(false);
        this.refreshAudit();
      },
      error: (error: unknown) => {
        this.recommendationError.set(this.message(error, 'Recommendation failed.'));
        this.acting.set(false);
      },
    });
  }

  review(decision: 'APPROVED' | 'REJECTED'): void {
    const current = this.recommendation();
    if (!current) return;
    this.acting.set(true);
    this.api.reviewRecommendation(this.id, current.id, decision, 'Interview User').subscribe({
      next: value => {
        this.recommendation.set(value);
        this.acting.set(false);
        this.refreshAudit();
      },
      error: (error: unknown) => {
        this.recommendationError.set(this.message(error, 'Review failed.'));
        this.acting.set(false);
      },
    });
  }

  private refreshAudit(): void {
    this.api.getAudit(this.id).subscribe(value => this.audit.set(value));
  }

  private message(error: unknown, fallback: string): string {
    return error instanceof ApiError ? error.message : fallback;
  }
}
