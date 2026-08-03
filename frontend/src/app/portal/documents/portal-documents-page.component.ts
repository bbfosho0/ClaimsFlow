import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { EvidenceKind, PortalClaim } from '../models/portal.models';

interface EvidenceDisplay {
  readonly kind: EvidenceKind;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly present: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-documents-page.component.html',
  styleUrl: '../portal-pages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalDocumentsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PortalApiService);

  readonly claimId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly error = signal('');
  readonly announcement = signal('');
  readonly updating = signal<EvidenceKind | null>(null);
  readonly claim = signal<PortalClaim | null>(null);
  readonly evidence = computed<readonly EvidenceDisplay[]>(() => {
    const claim = this.claim();
    if (!claim) return [];
    return [
      { kind: 'INCIDENT_REPORT', label: 'Incident report', description: 'Formal report or reference number', icon: '▤', present: claim.evidence.incidentReportPresent },
      { kind: 'PHOTOS', label: 'Photos', description: 'Images documenting the affected property', icon: '▣', present: claim.evidence.photosPresent },
      { kind: 'PROOF_OF_OWNERSHIP', label: 'Proof of ownership', description: 'Receipt, title, or ownership record', icon: '◇', present: claim.evidence.proofOfOwnershipPresent },
      { kind: 'MEDICAL_DOCUMENTATION', label: 'Medical documentation', description: 'Records supporting an injury claim', icon: '+', present: claim.evidence.medicalDocumentationPresent },
    ];
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getClaim(this.claimId).subscribe({
      next: claim => {
        this.claim.set(claim);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : 'Evidence status could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  addEvidence(item: EvidenceDisplay): void {
    if (item.present || this.updating()) return;
    this.updating.set(item.kind);
    this.error.set('');
    this.announcement.set('');
    this.api.updateEvidence(this.claimId, item.kind, true).subscribe({
      next: claim => {
        this.claim.set(claim);
        this.updating.set(null);
        this.announcement.set(`${item.label} added to the claim.`);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : `${item.label} could not be recorded.`);
        this.updating.set(null);
      },
    });
  }
}
