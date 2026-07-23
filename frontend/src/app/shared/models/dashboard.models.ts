export interface DashboardWorkload {
  adjusterId: string;
  displayName: string;
  activeClaims: number;
  capacity: number;
}

export interface DashboardActivity {
  actor: string;
  actionType: string;
  summary: string;
  occurredAt: string;
}

export interface DashboardSnapshot {
  openClaims: number;
  highPriorityClaims: number;
  slaRiskClaims: number;
  unassignedClaims: number;
  incompleteClaims: number;
  workload: DashboardWorkload[];
  recentActivity: DashboardActivity[];
}
