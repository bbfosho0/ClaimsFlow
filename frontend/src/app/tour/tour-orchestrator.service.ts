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
    const storedClaimId = this.readSession('claimsflow.demoClaimId');
    const claimId$ = storedClaimId
      ? of(storedClaimId)
      : this.api.list({ ...DEFAULT_FILTERS, size: 50, sort: 'priority,desc' }).pipe(
          map(page => page.content.find(claim => claim.priority === 'CRITICAL' || claim.priority === 'HIGH') ?? page.content[0]),
          map(claim => claim?.id ?? ''),
          catchError(() => of('')),
        );

    return claimId$.pipe(
      tap(claimId => this.persist({ step: 'claimant-portal', claimId })),
      tap(claimId => void this.navigateTo(0, claimId)),
      map(() => undefined),
    );
  }

  step(id: string | null): TourStep | null {
    return this.steps.find(step => step.id === id) ?? null;
  }

  navigateTo(index: number, claimId?: string): Promise<boolean> {
    const step = this.steps[Math.max(0, Math.min(this.steps.length - 1, index))];
    const resolvedClaimId = claimId ?? '';
    this.persist({ step: step.id, claimId: resolvedClaimId });
    return this.router.navigate([step.route(resolvedClaimId)], {
      queryParams: {
        tour: step.id,
        claimId: resolvedClaimId || null,
        role: step.role ?? null,
      },
    });
  }

  exit(): Promise<boolean> {
    this.removeSession('claimsflow-tour-progress');
    return this.router.navigate(['/app/dashboard'], { queryParams: { role: 'manager' } });
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
    try {
      sessionStorage.setItem('claimsflow-tour-progress', JSON.stringify(value));
    } catch {
      // Tour persistence is optional and must not block navigation.
    }
  }

  private readSession(key: string): string {
    try {
      return sessionStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  }

  private removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Session storage is optional.
    }
  }
}
