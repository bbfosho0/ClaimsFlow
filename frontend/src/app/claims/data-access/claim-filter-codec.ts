import { Params } from '@angular/router';
import { ClaimPriority, ClaimStatus } from '../../shared/models/claim.models';

export interface ClaimFilters {
  q: string;
  status: ClaimStatus | '';
  priority: ClaimPriority | '';
  assignment: string;
  page: number;
  size: number;
  sort: string;
}

export const DEFAULT_FILTERS: ClaimFilters = { q: '', status: '', priority: '', assignment: '', page: 0, size: 20, sort: 'createdAt,desc' };

export function parseClaimFilters(params: Params): ClaimFilters {
  const page = Math.max(0, Number(params['page'] ?? 0) || 0);
  const size = Math.min(100, Math.max(10, Number(params['size'] ?? 20) || 20));
  return {
    q: String(params['q'] ?? ''),
    status: (params['status'] ?? '') as ClaimStatus | '',
    priority: (params['priority'] ?? '') as ClaimPriority | '',
    assignment: String(params['assignment'] ?? ''),
    page,
    size,
    sort: String(params['sort'] ?? 'createdAt,desc'),
  };
}

export function serializeClaimFilters(filters: ClaimFilters): Params {
  const params: Params = {};
  if (filters.q.trim()) params['q'] = filters.q.trim();
  if (filters.status) params['status'] = filters.status;
  if (filters.priority) params['priority'] = filters.priority;
  if (filters.assignment) params['assignment'] = filters.assignment;
  if (filters.page > 0) params['page'] = filters.page;
  if (filters.size !== 20) params['size'] = filters.size;
  if (filters.sort !== 'createdAt,desc') params['sort'] = filters.sort;
  return params;
}
