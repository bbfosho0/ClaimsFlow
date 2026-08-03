import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClaimFilters } from '../../claims/data-access/claim-filter-codec';
import { API_BASE_URL } from '../api/api-config';
import { ClaimPage } from '../../shared/models/claim.models';
import { DashboardSnapshot } from '../../shared/models/dashboard.models';
import {
  AnalyticsSnapshot,
  EvidenceOperationsSnapshot,
  MyWorkSnapshot,
  OperationalFilters,
  TeamOperationsSnapshot,
} from './operational-data.models';

@Injectable({ providedIn: 'root' })
export class OperationalApiService {
  private readonly http = inject(HttpClient);

  loadDashboard(): Observable<DashboardSnapshot> {
    return this.http.get<DashboardSnapshot>(`${API_BASE_URL}/dashboard`);
  }

  loadQueue(filters: ClaimFilters): Observable<ClaimPage> {
    let params = operationalFiltersToParams(filters)
      .set('page', filters.page)
      .set('size', filters.size)
      .set('sort', filters.sort);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.assignment) params = params.set('assignment', filters.assignment);
    return this.http.get<ClaimPage>(`${API_BASE_URL}/claims`, { params });
  }

  loadMyWork(adjusterId: string): Observable<MyWorkSnapshot> {
    return this.http.get<MyWorkSnapshot>(`${API_BASE_URL}/my-work/${adjusterId}`);
  }

  loadAnalytics(filters: OperationalFilters): Observable<AnalyticsSnapshot> {
    return this.http.get<AnalyticsSnapshot>(`${API_BASE_URL}/analytics`, {
      params: operationalFiltersToParams(filters),
    });
  }

  loadTeam(filters: OperationalFilters): Observable<TeamOperationsSnapshot> {
    return this.http.get<TeamOperationsSnapshot>(`${API_BASE_URL}/team-operations`, {
      params: operationalFiltersToParams(filters),
    });
  }

  loadEvidence(
    filters: OperationalFilters,
    selectedClaimId = '',
  ): Observable<EvidenceOperationsSnapshot> {
    let params = operationalFiltersToParams(filters);
    if (selectedClaimId) params = params.set('selectedClaimId', selectedClaimId);
    return this.http.get<EvidenceOperationsSnapshot>(`${API_BASE_URL}/evidence-operations`, { params });
  }
}

export function operationalFiltersToParams(
  filters: OperationalFilters | ClaimFilters,
): HttpParams {
  let params = new HttpParams();
  if (filters.from) params = params.set('from', filters.from);
  if (filters.to) params = params.set('to', filters.to);
  if (filters.claimType) params = params.set('claimType', filters.claimType);
  if (filters.priority) params = params.set('priority', filters.priority);
  if (filters.status) params = params.set('status', filters.status);
  if (filters.adjusterId) params = params.set('adjusterId', filters.adjusterId);
  if (filters.team) params = params.set('team', filters.team);
  if (filters.region) params = params.set('region', filters.region);
  return params;
}
