import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { DEFAULT_FILTERS } from '../claims/data-access/claim-filter-codec';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { TOUR_STEPS } from './tour-step-registry';
import { TourStep, TourStepId } from './tour.models';

@Injectable({ providedIn: 'root' })
export class TourOrchestratorService {
  private readonly router = inject(Router);
  private readonly api = inject(ClaimsApiService);
  readonly steps = TOUR_STEPS;

  start(): Observable<void> {
    return this.api.list({ ...DEFAULT_FILTERS, size: 50, sort: 'priority,desc' }).pipe(
      map(page => page.content.find(claim => claim.claimNumber === 'CF-2026-0142') ?? page.content.find(claim => claim.priority === 'CRITICAL' || claim.priority === 'HIGH') ?? page.content[0]),
      catchError(() => of(undefined)),
      tap(claim => this.persist({ step: 'portfolio-pressure', claimId: claim?.id ?? '' })),
      tap(claim => void this.navigateTo(0, claim?.id)),
      map(() => undefined),
    );
  }

  step(id: string | null): TourStep | null {
    return this.steps.find(step => step.id === id) ?? null;
  }

  navigateTo(index: number, claimId?: string): Promise<boolean> {
    const step = this.steps[Math.max(0, Math.min(this.steps.length - 1, index))];
    this.persist({ step: step.id, claimId: claimId ?? '' });
    return this.router.navigate([step.route(claimId)], {
      queryParams: { tour: step.id, claimId: claimId || null },
    });
  }

  exit(): Promise<boolean> {
    sessionStorage.removeItem('claimsflow-tour-progress');
    return this.router.navigate(['/app/dashboard']);
  }

  restore(): { step: TourStepId; claimId: string } | null {
    try {
      const raw = sessionStorage.getItem('claimsflow-tour-progress');
      return raw ? JSON.parse(raw) as { step: TourStepId; claimId: string } : null;
    } catch {
      return null;
    }
  }

  private persist(value: { step: TourStepId; claimId: string }): void {
    sessionStorage.setItem('claimsflow-tour-progress', JSON.stringify(value));
  }
}
