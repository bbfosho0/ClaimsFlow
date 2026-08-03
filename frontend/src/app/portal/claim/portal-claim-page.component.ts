import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { PortalClaim } from '../models/portal.models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-claim-page.component.html',
  styleUrl: '../portal-pages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalClaimPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PortalApiService);

  readonly claimId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly error = signal('');
  readonly claim = signal<PortalClaim | null>(null);

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
        this.error.set(error instanceof ApiError ? error.message : 'Your claim could not be loaded. Try again.');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    return status.toLowerCase().replaceAll('_', ' ').replace(/^./, value => value.toUpperCase());
  }

  timelineLabel(action: string): string {
    const labels: Record<string, string> = {
      CLAIM_CREATED: 'Claim submitted',
      EVIDENCE_UPDATED: 'Evidence updated',
      STATUS_CHANGED: 'Review status updated',
    };
    return labels[action] ?? 'Claim update';
  }
}
