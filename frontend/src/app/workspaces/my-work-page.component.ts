import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { DEFAULT_FILTERS } from '../claims/data-access/claim-filter-codec';
import { ClaimSummary } from '../shared/models/claim.models';
import { formatSla, humanizeEnum, priorityTone, statusTone } from '../shared/presentation/claim-presentation';
import { StatusBadgeComponent } from '../shared/ui/status-badge/status-badge.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './my-work-page.component.html',
  styleUrl: './my-work-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkPageComponent implements OnInit {
  private readonly api = inject(ClaimsApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly assignedClaims = signal<ClaimSummary[]>([]);
  readonly demoClaimId = signal(this.readSession('claimsflow.demoClaimId'));
  readonly adjusterId = signal(this.readSession('claimsflow.demoAdjusterId'));

  label = humanizeEnum;
  sla = formatSla;
  priorityTone = priorityTone;
  statusTone = statusTone;

  ngOnInit(): void {
    if (!this.adjusterId()) {
      this.loading.set(false);
      return;
    }

    this.api.list({
      ...DEFAULT_FILTERS,
      assignment: this.adjusterId(),
      sort: 'slaDeadline,asc',
    }).subscribe({
      next: page => {
        this.assignedClaims.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Assigned claims are unavailable. The rest of the workspace remains in demo mode.');
        this.loading.set(false);
      },
    });
  }

  isGoldenJourney(claim: ClaimSummary): boolean {
    return Boolean(this.demoClaimId()) && claim.id === this.demoClaimId();
  }

  urgentCount(): number {
    return this.assignedClaims().filter(claim => claim.priority === 'CRITICAL' || claim.priority === 'HIGH').length;
  }

  evidenceGapCount(): number {
    return this.assignedClaims().filter(claim => claim.completenessPercentage < 100).length;
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
