import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { ClaimPage, ClaimPriority, ClaimStatus } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { ClaimFilters, DEFAULT_FILTERS, parseClaimFilters, serializeClaimFilters } from '../data-access/claim-filter-codec';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-header"><div><p class="eyebrow">Work queue</p><h1>Claims</h1><p>Filter by status, priority, or assignment and open the cases that need attention.</p></div><a class="button primary" routerLink="/claims/new">New claim</a></header>
    <form class="filters" (ngSubmit)="apply()">
      <label>Search<input [formControl]="q" placeholder="Claim number or claimant"></label>
      <label>Status<select [formControl]="status"><option value="">All statuses</option><option *ngFor="let item of statuses" [value]="item">{{label(item)}}</option></select></label>
      <label>Priority<select [formControl]="priority"><option value="">All priorities</option><option *ngFor="let item of priorities" [value]="item">{{label(item)}}</option></select></label>
      <label>Assignment<select [formControl]="assignment"><option value="">All claims</option><option value="unassigned">Unassigned</option></select></label>
      <div class="filter-actions"><button class="button primary" type="submit">Apply</button><button class="button secondary" type="button" (click)="reset()">Reset</button></div>
    </form>
    <div *ngIf="loading()" class="panel" role="status">Loading claims…</div><div *ngIf="error()" class="alert" role="alert">{{error()}}</div>
    <section *ngIf="data() as page" class="panel table-panel"><div class="table-meta"><strong>{{page.totalElements}} claims</strong><span>Page {{page.page + 1}} of {{page.totalPages || 1}}</span></div><div *ngIf="!page.content.length" class="empty">No claims match the selected filters.</div><div class="table-wrap" *ngIf="page.content.length"><table><thead><tr><th>Claim</th><th>Claimant</th><th>Type</th><th>Priority</th><th>Status</th><th>Assignment</th><th>SLA</th><th>Complete</th></tr></thead><tbody><tr *ngFor="let claim of page.content"><td><a [routerLink]="['/claims', claim.id]">{{claim.claimNumber}}</a></td><td>{{claim.claimantName}}</td><td>{{label(claim.claimType)}}</td><td><span class="badge" [attr.data-priority]="claim.priority">{{label(claim.priority)}}</span></td><td>{{label(claim.status)}}</td><td>{{claim.assignedAdjusterName || 'Unassigned'}}</td><td><span [class.warning]="isSlaRisk(claim.slaDeadline)">{{claim.slaDeadline | date:'short'}}</span></td><td>{{claim.completenessPercentage}}%</td></tr></tbody></table></div><div class="pagination"><button class="button secondary" [disabled]="page.page === 0" (click)="goTo(page.page - 1)">Previous</button><button class="button secondary" [disabled]="page.page + 1 >= page.totalPages" (click)="goTo(page.page + 1)">Next</button></div></section>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.page-header h1{margin:.15rem 0}.page-header p{margin:.25rem 0;color:#5d6b80}.eyebrow{text-transform:uppercase;font-weight:700;font-size:.75rem;letter-spacing:.12em;color:#287b70!important}.filters{display:grid;grid-template-columns:2fr repeat(3,1fr) auto;gap:.75rem;background:#fff;border:1px solid #dbe4ef;border-radius:14px;padding:1rem;margin-bottom:1rem}.filters label{display:grid;gap:.35rem;font-size:.85rem;font-weight:700}.filters input,.filters select{border:1px solid #c9d5e4;border-radius:8px;padding:.65rem;background:#fff}.filter-actions{display:flex;gap:.5rem;align-items:end}.panel{background:#fff;border:1px solid #dbe4ef;border-radius:14px;padding:1rem}.table-panel{padding:0}.table-meta,.pagination{display:flex;justify-content:space-between;padding:1rem;align-items:center}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.85rem 1rem;border-top:1px solid #e7edf4;white-space:nowrap}th{font-size:.78rem;text-transform:uppercase;color:#65748a}.badge{display:inline-block;padding:.25rem .55rem;border-radius:999px;background:#e8eef6}.badge[data-priority="HIGH"],.badge[data-priority="CRITICAL"]{background:#ffe8e5;color:#8c231a}.warning{font-weight:700;color:#9a4d00}.button{border:0;text-decoration:none;padding:.7rem 1rem;border-radius:8px;font-weight:700;cursor:pointer}.primary{background:#16796d;color:#fff}.secondary{background:#e8eef6;color:#26364e}.button:disabled{opacity:.5;cursor:not-allowed}.alert{background:#fff1f0;border:1px solid #ffb8b2;padding:1rem;border-radius:10px;color:#8c231a}.empty{padding:2rem;color:#6d798b;text-align:center}@media(max-width:1000px){.filters{grid-template-columns:1fr 1fr}.filter-actions{align-items:center}.page-header{display:block}.page-header .button{margin-top:1rem}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsQueuePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly api = inject(ClaimsApiService); private readonly subscription = new Subscription();
  readonly q = new FormControl('', { nonNullable: true }); readonly status = new FormControl<ClaimStatus | ''>('', { nonNullable: true }); readonly priority = new FormControl<ClaimPriority | ''>('', { nonNullable: true }); readonly assignment = new FormControl('', { nonNullable: true });
  readonly statuses: ClaimStatus[] = ['NEW','UNDER_REVIEW','WAITING_FOR_INFORMATION','READY_FOR_DECISION','RESOLVED','CLOSED']; readonly priorities: ClaimPriority[] = ['LOW','MEDIUM','HIGH','CRITICAL'];
  readonly data = signal<ClaimPage | null>(null); readonly loading = signal(true); readonly error = signal(''); private filters: ClaimFilters = DEFAULT_FILTERS;
  ngOnInit(): void { this.subscription.add(this.route.queryParams.subscribe(params => { this.filters = parseClaimFilters(params); this.q.setValue(this.filters.q,{emitEvent:false}); this.status.setValue(this.filters.status,{emitEvent:false}); this.priority.setValue(this.filters.priority,{emitEvent:false}); this.assignment.setValue(this.filters.assignment,{emitEvent:false}); this.load(); })); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  apply(): void { void this.router.navigate([], { relativeTo:this.route, queryParams:serializeClaimFilters({...this.filters,q:this.q.value,status:this.status.value,priority:this.priority.value,assignment:this.assignment.value,page:0}) }); }
  reset(): void { void this.router.navigate([], { relativeTo:this.route, queryParams:{} }); }
  goTo(page:number): void { void this.router.navigate([], { relativeTo:this.route, queryParams:serializeClaimFilters({...this.filters,page}) }); }
  label(value:string): string { return value.toLowerCase().replaceAll('_',' ').replace(/\b\w/g, letter => letter.toUpperCase()); }
  isSlaRisk(value:string): boolean { const hours=(new Date(value).getTime()-Date.now())/3600000; return hours>=0&&hours<=24; }
  private load(): void { this.loading.set(true); this.error.set(''); this.api.list(this.filters).subscribe({next:value=>{this.data.set(value);this.loading.set(false);},error:(error:unknown)=>{this.error.set(error instanceof ApiError?error.message:'Claims are unavailable.');this.loading.set(false);}}); }
}
