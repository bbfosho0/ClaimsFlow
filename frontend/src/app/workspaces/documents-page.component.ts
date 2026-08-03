import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  operationalFilterKey,
  parseOperationalFilters,
  serializeOperationalFilters,
} from '../core/operational-data/operational-filter-codec';
import {
  DEFAULT_OPERATIONAL_FILTERS,
  EMPTY_OPERATIONAL_FILTER_OPTIONS,
  EvidenceClaimSummary,
  OperationalFilters,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { MetricRadialComponent } from '../shared/metrics/metric-radial.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalFilterBarComponent } from '../shared/operational/operational-filter-bar.component';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum } from '../shared/presentation/claim-presentation';
import {
  EvidenceMatrixCell,
  EvidenceMatrixComponent,
  EvidenceMatrixRow,
} from '../shared/visualizations/evidence-matrix.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MetricCardComponent,
    MetricRadialComponent,
    AutoAnimateDirective,
    GsapRevealDirective,
    EvidenceMatrixComponent,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalFilterBarComponent,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './documents-page.component.html',
  styleUrls: [
    './workspace-pages.component.css',
    './operational-workspaces.css',
    './documents-midnight-violet.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();
  private release: (() => void) | null = null;
  private activeResourceKey = '';

  readonly state = this.operational.evidence;
  readonly snapshot = computed(() => this.state().value);
  readonly filters = signal<OperationalFilters>(DEFAULT_OPERATIONAL_FILTERS);
  readonly selectedClaimId = signal('');
  readonly options = computed(() => this.snapshot()?.options ?? EMPTY_OPERATIONAL_FILTER_OPTIONS);
  readonly selected = computed(() => this.snapshot()?.selected ?? null);
  readonly headers: readonly EvidenceMatrixCell[] = [
    { key: 'INCIDENT_REPORT', label: 'Incident report', present: false },
    { key: 'PHOTOS', label: 'Photos', present: false },
    { key: 'PROOF_OF_OWNERSHIP', label: 'Proof of ownership', present: false },
    { key: 'MEDICAL_DOCUMENTATION', label: 'Medical documentation', present: false },
  ];

  label = humanizeEnum;
  sla = formatSla;

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      const filters = parseOperationalFilters(params);
      const selectedClaimId = typeof params['selectedClaimId'] === 'string'
        ? params['selectedClaimId']
        : this.readSession('claimsflow.demoClaimId');
      const resourceKey = `${operationalFilterKey(filters)}&selectedClaimId=${encodeURIComponent(selectedClaimId)}`;
      this.filters.set(filters);
      this.selectedClaimId.set(selectedClaimId);
      if (resourceKey === this.activeResourceKey) return;
      this.activeResourceKey = resourceKey;
      this.release?.();
      this.release = this.operational.activateEvidence(filters, selectedClaimId);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.release?.();
  }

  updateFilters(filters: OperationalFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...serializeOperationalFilters(filters),
        selectedClaimId: this.selectedClaimId() || null,
      },
    });
  }

  resetFilters(): void {
    this.updateFilters(DEFAULT_OPERATIONAL_FILTERS);
  }

  selectClaim(claimId: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...serializeOperationalFilters(this.filters()),
        selectedClaimId: claimId,
      },
    });
  }

  selectMatrixRow(row: EvidenceMatrixRow): void {
    this.selectClaim(row.claimId);
  }

  refresh(): void {
    this.operational.refresh('evidence');
  }

  matrixRows(claims: readonly EvidenceClaimSummary[]): readonly EvidenceMatrixRow[] {
    return claims.map(claim => ({
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      claimantName: claim.claimantName,
      priority: this.label(claim.priority),
      slaLabel: this.sla(claim.slaDeadline).label,
      slaTone: this.sla(claim.slaDeadline).tone,
      completenessPercentage: claim.completenessPercentage,
      cells: (claim.evidence ?? []).map(category => ({
        key: category.kind,
        label: category.label,
        present: category.present,
      })),
    }));
  }

  isSelected(claimId: string): boolean {
    return this.selected()?.id === claimId;
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
