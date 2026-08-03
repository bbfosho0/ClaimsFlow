import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { MyWorkClaim, MyWorkTimelineItem } from '../core/operational-data/operational-data.models';
import { MetricCardComponent } from '../shared/metrics/metric-card.component';
import { MetricRadialComponent } from '../shared/metrics/metric-radial.component';
import { MetricSparkPoint } from '../shared/metrics/metric-card.models';
import { MetricSparklineComponent } from '../shared/metrics/metric-sparkline.component';
import { AutoAnimateDirective } from '../shared/motion/auto-animate.directive';
import { GsapRevealDirective } from '../shared/motion/gsap-reveal.directive';
import { AnimatedNumberComponent } from '../shared/operational/animated-number.component';
import { ChangedValueDirective } from '../shared/operational/changed-value.directive';
import { OperationalRefreshStatusComponent } from '../shared/operational/operational-refresh-status.component';
import { formatSla, humanizeEnum, priorityTone, statusTone } from '../shared/presentation/claim-presentation';
import { StatusBadgeComponent } from '../shared/ui/status-badge/status-badge.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MetricCardComponent, MetricRadialComponent, MetricSparklineComponent, AutoAnimateDirective, GsapRevealDirective, StatusBadgeComponent, AnimatedNumberComponent, ChangedValueDirective, OperationalRefreshStatusComponent],
  templateUrl: './my-work-page.component.html',
  styleUrls: ['./my-work-page.component.css', './my-work-midnight-violet.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWorkPageComponent implements OnInit, OnDestroy {
  private readonly operational = inject(OperationalDataStore);
  private releaseMyWork: (() => void) | null = null;

  readonly state = this.operational.myWork;
  readonly snapshot = computed(() => this.state().value);
  readonly loading = computed(() => this.state().loading && !this.state().value);
  readonly error = computed(() => {
    if (!this.adjusterId()) return 'Reset the golden journey to resolve Jordan Lee’s adjuster ID.';
    return !this.state().value ? this.state().error : '';
  });
  readonly assignedClaims = computed<readonly MyWorkClaim[]>(() => this.snapshot()?.claims ?? []);
  readonly demoClaimId = signal(this.readSession('claimsflow.demoClaimId'));
  readonly adjusterId = signal(this.readSession('claimsflow.demoAdjusterId'));

  label = humanizeEnum;
  sla = formatSla;
  priorityTone = priorityTone;
  statusTone = statusTone;

  ngOnInit(): void {
    if (!this.adjusterId()) return;
    this.releaseMyWork = this.operational.activateMyWork(this.adjusterId());
  }

  ngOnDestroy(): void {
    this.releaseMyWork?.();
  }

  refresh(): void {
    if (!this.adjusterId()) return;
    this.operational.refresh('myWork');
  }

  isGoldenJourney(claim: MyWorkClaim): boolean {
    return Boolean(this.demoClaimId()) && claim.id === this.demoClaimId();
  }

  isChanged(claim: MyWorkClaim): boolean {
    return this.state().changedClaimIds.includes(claim.id);
  }

  workloadSpark(): readonly MetricSparkPoint[] {
    return (this.snapshot()?.workloadTrend ?? []).map(point => ({ label: point.date, value: point.activeClaims }));
  }

  actions(group: MyWorkTimelineItem['group']): readonly MyWorkTimelineItem[] {
    return (this.snapshot()?.timeline ?? []).filter(item => item.group === group);
  }

  groupLabel(group: MyWorkTimelineItem['group']): string {
    if (group === 'NOW') return 'Now';
    if (group === 'TODAY') return 'Today';
    return 'Later';
  }

  private readSession(key: string): string {
    try {
      return globalThis.sessionStorage?.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
