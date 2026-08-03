import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { OperationalDataStore } from '../../core/operational-data/operational-data.store';
import {
  Adjuster,
  AuditEvent,
  ClaimDetail,
  ClaimMessage,
  ClaimPage,
  ClaimStatus,
  CreateClaimRequest,
  MessageAudience,
  Recommendation,
  RecommendationReviewState,
} from '../../shared/models/claim.models';
import { ClaimFilters } from './claim-filter-codec';

@Injectable({ providedIn: 'root' })
export class ClaimsApiService {
  private readonly http = inject(HttpClient);
  private readonly operational = inject(OperationalDataStore);

  list(filters: ClaimFilters): Observable<ClaimPage> {
    let params = new HttpParams().set('page', filters.page).set('size', filters.size).set('sort', filters.sort);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.claimType) params = params.set('claimType', filters.claimType);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.assignment) params = params.set('assignment', filters.assignment);
    if (filters.adjusterId) params = params.set('adjusterId', filters.adjusterId);
    if (filters.team) params = params.set('team', filters.team);
    if (filters.region) params = params.set('region', filters.region);
    return this.http.get<ClaimPage>(`${API_BASE_URL}/claims`, { params });
  }

  create(request: CreateClaimRequest): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(`${API_BASE_URL}/claims`, request).pipe(
      tap(claim => this.invalidateClaimMutation(claim.id)),
    );
  }

  get(id: string): Observable<ClaimDetail> { return this.http.get<ClaimDetail>(`${API_BASE_URL}/claims/${id}`); }

  assign(id: string, adjusterId: string, actor: string): Observable<ClaimDetail> {
    return this.http.patch<ClaimDetail>(`${API_BASE_URL}/claims/${id}/assignment`, { adjusterId, actor }).pipe(
      tap(claim => this.invalidateClaimMutation(claim.id)),
    );
  }

  updateStatus(id: string, status: ClaimStatus, actor: string): Observable<ClaimDetail> {
    return this.http.patch<ClaimDetail>(`${API_BASE_URL}/claims/${id}/status`, { status, actor }).pipe(
      tap(claim => this.invalidateClaimMutation(claim.id)),
    );
  }

  addMessage(
    id: string,
    request: { author: string; audience: MessageAudience; body: string },
  ): Observable<ClaimMessage> {
    return this.http.post<ClaimMessage>(`${API_BASE_URL}/claims/${id}/messages`, request).pipe(
      tap(() => this.operational.invalidate(['evidence', 'myWork'], [id])),
    );
  }

  getLatestRecommendation(id: string): Observable<Recommendation | null> { return this.http.get<Recommendation | null>(`${API_BASE_URL}/claims/${id}/recommendations/latest`); }
  generateRecommendation(id: string): Observable<Recommendation> { return this.http.post<Recommendation>(`${API_BASE_URL}/claims/${id}/recommendations`, {}); }
  reviewRecommendation(
    id: string,
    recommendationId: string,
    decision: Exclude<RecommendationReviewState, 'PENDING'>,
    reviewer: string,
    reason: string,
  ): Observable<Recommendation> {
    return this.http.patch<Recommendation>(`${API_BASE_URL}/claims/${id}/recommendations/${recommendationId}`, { decision, reviewer, reason });
  }
  getAudit(id: string): Observable<AuditEvent[]> { return this.http.get<AuditEvent[]>(`${API_BASE_URL}/claims/${id}/audit`); }
  getAdjusters(): Observable<Adjuster[]> { return this.http.get<Adjuster[]>(`${API_BASE_URL}/adjusters`); }

  private invalidateClaimMutation(claimId: string): void {
    this.operational.invalidate(
      ['dashboard', 'queue', 'myWork', 'analytics', 'team', 'evidence'],
      [claimId],
    );
  }
}
