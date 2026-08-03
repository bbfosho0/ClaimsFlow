import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { ClaimDetail } from '../shared/models/claim.models';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum } from '../shared/presentation/claim-presentation';
import { CommandFieldComponent } from '../shared/visualizations/command-field.component';

interface InterventionItem {
  tone: 'critical' | 'warning' | 'live' | 'advisory';
  label: string;
  detail: string;
  count: number;
  queryParams: Record<string, string>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CommandFieldComponent,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: [
    './dashboard-page.component.css',
    './dashboard-golden-journey.css',
    './dashboard-operational.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly claims = inject(ClaimsApiService);
  private readonly route = inject(ActivatedRoute);
  private releaseDashboard: (() => void) | null = null;

  readonly state = this.operational.dashboard;
  readonly data = computed(() => this.state().value);
  readonly loading = computed(() => this.state().loading && !this.state().value);
  readonly error = computed(() => !this.state().value ? this.state().error : '');
  readonly goldenClaim = signal<ClaimDetail | null>(null);
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  label = humanizeEnum;
  sla = formatSla;

  ngOnInit(): void {
    this.releaseDashboard = this.operational.activateDashboard();
    this.loadGoldenClaim();
  }

  ngOnDestroy(): void {
    this.releaseDashboard?.();
  }

  refresh(): void {
    this.operational.refresh('dashboard');
  }

  activeSignals(snapshot: DashboardSnapshot): number {
    return Math.min(17, snapshot.signalCounts.reduce((sum, item) => sum + item.count, 0));
  }

  systemTone(snapshot: DashboardSnapshot): 'critical' | 'warning' | 'healthy' {
    if (snapshot.overdueClaims > 0) return 'critical';
    if (snapshot.slaRiskClaims > 0) return 'warning';
    return 'healthy';
  }

  systemLabel(snapshot: DashboardSnapshot): string {
    if (snapshot.overdueClaims > 0) return `${snapshot.overdueClaims} overdue SLA${snapshot.overdueClaims === 1 ? '' : 's'}`;
    if (snapshot.slaRiskClaims > 0) return `${snapshot.slaRiskClaims} SLA${snapshot.slaRiskClaims === 1 ? '' : 's'} at risk`;
    return 'Portfolio stable';
  }

  interventions(snapshot: DashboardSnapshot): readonly InterventionItem[] {
    return [
      {
        tone: 'critical',
        label: 'SLA intervention required',
        detail: `${snapshot.overdueClaims} overdue and ${snapshot.slaRiskClaims} due within 24 hours.`,
        count: snapshot.slaRiskClaims + snapshot.overdueClaims,
        queryParams: { sort: 'slaDeadline,asc' },
      },
      {
        tone: 'warning',
        label: 'Evidence incomplete',
        detail: 'Review-blocking evidence categories remain outstanding.',
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
        detail: 'Critical and high-priority claims need focused review.',
        count: snapshot.highPriorityClaims,
        queryParams: { priority: 'HIGH' },
      },
    ];
  }

  utilization(active: number, capacity: number): number {
    if (!capacity) return 0;
    return Math.min(100, Math.round((active / capacity) * 100));
  }

  percent(value: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  private loadGoldenClaim(): void {
    const claimId = this.route.snapshot.queryParamMap.get('claimId') || this.readSession('claimsflow.demoClaimId');
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
