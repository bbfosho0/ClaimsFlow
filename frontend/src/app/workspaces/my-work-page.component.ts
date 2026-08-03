import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEFAULT_FILTERS } from '../claims/data-access/claim-filter-codec';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { ClaimSummary } from '../shared/models/claim.models';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum, priorityTone, statusTone } from '../shared/presentation/claim-presentation';
import { StatusBadgeComponent } from '../shared/ui/status-badge/status-badge.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatusBadgeComponent,
    AnimatedNumberComponent,
    ChangedValueDirective,
    OperationalRefreshStatusComponent,
  ],
  templateUrl: './my-work-page.component.html',
  styleUrl: './my-work-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private releaseQueue: (() => void) | null = null;

  readonly state = this.operational.queue;
  readonly loading = computed(() => this.state().loading && !this.state().value);
  readonly error = computed(() => !this.state().value ? this.state().error : '');
  readonly assignedClaims = computed<ClaimSummary[]>(() => this.state().value?.content ?? []);
  readonly demoClaimId = signal(this.readSession('claimsflow.demoClaimId'));
  readonly adjusterId = signal(this.readSession('claimsflow.demoAdjusterId'));

  label = humanizeEnum;
  sla = formatSla;
  priorityTone = priorityTone;
  statusTone = statusTone;

  ngOnInit(): void {
    if (!this.adjusterId()) return;
    this.releaseQueue = this.operational.activateQueue({
      ...DEFAULT_FILTERS,
      adjusterId: this.adjusterId(),
      sort: 'slaDeadline,asc',
    });
  }

  ngOnDestroy(): void {
    this.releaseQueue?.();
  }

  refresh(): void {
    this.operational.refresh('queue');
  }

  isGoldenJourney(claim: ClaimSummary): boolean {
    return Boolean(this.demoClaimId()) && claim.id === this.demoClaimId();
  }

  isChanged(claim: ClaimSummary): boolean {
    return this.state().changedClaimIds.includes(claim.id);
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
