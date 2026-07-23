import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api/api-config';
import { DashboardSnapshot } from '../shared/models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  load(): Observable<DashboardSnapshot> { return this.http.get<DashboardSnapshot>(`${API_BASE_URL}/dashboard`); }
}
