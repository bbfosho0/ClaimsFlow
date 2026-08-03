import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { OperationalDataStore } from '../../core/operational-data/operational-data.store';
import { EvidenceKind, PortalClaim, PortalMessage } from '../models/portal.models';

@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly http = inject(HttpClient);
  private readonly operational = inject(OperationalDataStore);

  getClaim(claimId: string): Observable<PortalClaim> {
    return this.http.get<PortalClaim>(`${API_BASE_URL}/portal/claims/${claimId}`);
  }

  updateEvidence(
    claimId: string,
    kind: EvidenceKind,
    present: boolean,
    actor = 'Taylor Reed',
  ): Observable<PortalClaim> {
    return this.http.patch<PortalClaim>(`${API_BASE_URL}/portal/claims/${claimId}/evidence`, {
      kind,
      present,
      actor,
    }).pipe(
      tap(() => this.operational.invalidate(
        ['dashboard', 'queue', 'analytics', 'team', 'evidence'],
        [claimId],
      )),
    );
  }

  messages(claimId: string): Observable<readonly PortalMessage[]> {
    return this.http.get<readonly PortalMessage[]>(`${API_BASE_URL}/portal/claims/${claimId}/messages`);
  }
}
