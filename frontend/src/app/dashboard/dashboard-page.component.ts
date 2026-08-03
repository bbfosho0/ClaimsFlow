import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ApiError } from '../core/api/api-error';
import { ClaimDetail } from '../shared/models/claim.models';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { formatSla, humanizeEnum } from '../shared/presentation/claim-presentation';
import { CommandFieldComponent } from '../shared/visualizations/command-field.component';
import { DashboardService } from './dashboard.service';

interface InterventionItem {
  tone: 'critical' | 'warning' | 'live' | 'advisory';
  label: string;
  detail: string;
  count: number;
  queryParams: Record<string, string>;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, CommandFieldComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly service = inject(DashboardService);
  private readonly claims = inject(ClaimsApiService);
  readonly data = signal<DashboardSnapshot | null>(null);
  readonly goldenClaim = signal<ClaimDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  label = humanizeEnum;
  sla = formatSla;

  ngOnInit(): void {
    this.service.load().subscribe({
      next: value => {
        this.data.set(value);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : 'Dashboard data is unavailable.');
        this.loading.set(false);
      },
    });
    this.loadGoldenClaim();
  }

  activeSignals(snapshot: DashboardSnapshot): number {
    return Math.min(17, snapshot.highPriorityClaims + snapshot.slaRiskClaims + snapshot.unassignedClaims + snapshot.incompleteClaims);
  }

  interventions(snapshot: DashboardSnapshot): readonly InterventionItem[] {
    return [
      {
        tone: 'critical',
        label: 'SLA intervention required',
        detail: 'Claims with less than 24 hours before deadline.',
        count: snapshot.slaRiskClaims,
        queryParams: { sort: 'slaDeadline,asc' },
      },
      {
        tone: 'warning',
        label: 'Evidence incomplete',
        detail: 'Review-blocking documentation is outstanding.',
        count: snapshot.incompleteClaims,
        queryParams: { sort: 'completenessPercentage,asc' },
      },
      {
        tone: 'live',
        label: 'Ownership unresolved',
        detail: 'Unassigned claims need an active reviewer.',
        count: snapshot.unassignedClaims,
        queryParams: { assignment: 'unassigned' },
      },
      {
        tone: 'advisory',
        label: 'High-priority review',
        detail: 'Decision support is available for urgent work.',
        count: snapshot.highPriorityClaims,
        queryParams: { priority: 'HIGH' },
      },
    ];
  }

  utilization(active: number, capacity: number): number {
    if (!capacity) return 0;
    return Math.min(100, Math.round((active / capacity) * 100));
  }

  portfolioCompleteness(snapshot: DashboardSnapshot): number {
    if (!snapshot.openClaims) return 100;
    return Math.max(0, Math.round(((snapshot.openClaims - snapshot.incompleteClaims) / snapshot.openClaims) * 100));
  }

  private loadGoldenClaim(): void {
    const claimId = this.readSession('claimsflow.demoClaimId');
    if (!claimId) return;
    this.claims.get(claimId).subscribe({
      next: claim => this.goldenClaim.set(claim),
      error: () => this.goldenClaim.set(null),
    });
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
