import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../core/api/api-error';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { DashboardService } from './dashboard.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="page-header"><div><p class="eyebrow">Claims operations</p><h1>Operations dashboard</h1><p>Prioritize work, protect SLAs, and keep decisions auditable.</p></div><a class="button primary" routerLink="/claims/new">Create claim</a></header>
    <div *ngIf="loading()" class="panel" role="status">Loading operations data…</div>
    <div *ngIf="error()" class="alert" role="alert">{{ error() }}</div>
    <ng-container *ngIf="data() as dashboard">
      <section class="metric-grid" aria-label="Claim metrics">
        <article><span>Open claims</span><strong>{{dashboard.openClaims}}</strong></article>
        <article><span>High priority</span><strong>{{dashboard.highPriorityClaims}}</strong></article>
        <article><span>SLA risk</span><strong>{{dashboard.slaRiskClaims}}</strong></article>
        <article><span>Unassigned</span><strong>{{dashboard.unassignedClaims}}</strong></article>
        <article><span>Incomplete</span><strong>{{dashboard.incompleteClaims}}</strong></article>
      </section>
      <div class="two-column">
        <section class="panel"><div class="section-heading"><h2>Adjuster workload</h2><a routerLink="/claims">Open queue</a></div><div *ngIf="!dashboard.workload.length" class="empty">No active adjusters.</div><div class="workload" *ngFor="let item of dashboard.workload"><div><strong>{{item.displayName}}</strong><small>{{item.activeClaims}} of {{item.capacity}} active</small></div><progress [value]="item.activeClaims" [max]="item.capacity"></progress></div></section>
        <section class="panel"><h2>Recent activity</h2><div *ngIf="!dashboard.recentActivity.length" class="empty">No activity recorded.</div><ol class="timeline"><li *ngFor="let item of dashboard.recentActivity"><strong>{{item.summary}}</strong><span>{{item.actor}} · {{item.occurredAt | date:'medium'}}</span></li></ol></section>
      </div>
    </ng-container>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.page-header h1{margin:.15rem 0}.page-header p{margin:.25rem 0;color:#5d6b80}.eyebrow{text-transform:uppercase;font-weight:700;font-size:.75rem;letter-spacing:.12em;color:#287b70!important}.metric-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;margin-bottom:1rem}.metric-grid article,.panel{background:#fff;border:1px solid #dbe4ef;border-radius:14px;padding:1.25rem;box-shadow:0 8px 28px rgba(16,35,63,.05)}.metric-grid span{color:#65748a}.metric-grid strong{display:block;font-size:2rem;margin-top:.4rem}.two-column{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.section-heading{display:flex;justify-content:space-between;align-items:center}.workload{display:grid;grid-template-columns:1fr 140px;gap:1rem;align-items:center;padding:.8rem 0;border-top:1px solid #edf1f6}.workload small,.timeline span{display:block;color:#6d798b;margin-top:.2rem}.workload progress{width:100%}.timeline{padding-left:1.2rem}.timeline li{padding:.65rem}.button{display:inline-flex;align-items:center;text-decoration:none;padding:.75rem 1rem;border-radius:8px;font-weight:700}.primary{background:#16796d;color:white}.alert{background:#fff1f0;border:1px solid #ffb8b2;padding:1rem;border-radius:10px;color:#8c231a}.empty{color:#6d798b;padding:1rem 0}@media(max-width:1000px){.metric-grid{grid-template-columns:repeat(2,1fr)}.two-column{grid-template-columns:1fr}}@media(max-width:600px){.page-header{display:block}.page-header .button{margin-top:1rem}.metric-grid{grid-template-columns:1fr}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly service = inject(DashboardService);
  readonly data = signal<DashboardSnapshot | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.service.load().subscribe({
      next: value => { this.data.set(value); this.loading.set(false); },
      error: (error: unknown) => { this.error.set(error instanceof ApiError ? error.message : 'Dashboard data is unavailable.'); this.loading.set(false); },
    });
  }
}
