import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../core/api/api-config';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { DemoJourneySnapshot } from './demo-journey.models';

@Injectable({ providedIn: 'root' })
export class DemoJourneyService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly operational = inject(OperationalDataStore);

  reset(): Observable<DemoJourneySnapshot> {
    return this.http.post<DemoJourneySnapshot>(`${API_BASE_URL}/demo/reset`, {}).pipe(
      tap(snapshot => {
        this.store(snapshot);
        this.operational.invalidate(
          ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
          [snapshot.claimId],
        );
      }),
    );
  }

  private store(snapshot: DemoJourneySnapshot): void {
    try {
      const storage = this.document.defaultView?.sessionStorage;
      storage?.setItem('claimsflow.demoClaimId', snapshot.claimId);
      storage?.setItem('claimsflow.demoAdjusterId', snapshot.adjusterId);
    } catch {
      // Session persistence improves the demo but must not hide a successful reset.
    }
  }
}
