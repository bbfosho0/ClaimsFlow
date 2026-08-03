export interface DashboardSignalCount {
  category: string;
  tone: 'critical' | 'warning' | 'live' | 'advisory' | 'healthy';
  count: number;
}

export interface DashboardWorkload {
  adjusterId: string;
  displayName: string;
  team: string;
  activeClaims: number;
  capacity: number;
}

export interface DashboardActivity {
  claimId: string;
  actor: string;
  actionType: string;
  summary: string;
  occurredAt: string;
}

export interface DashboardSnapshot {
  generatedAt: string;
  totalClaims: number;
  openClaims: number;
  highPriorityClaims: number;
  slaRiskClaims: number;
  overdueClaims: number;
  unassignedClaims: number;
  incompleteClaims: number;
  evidenceReadinessPercentage: number;
  activePortfolioPercentage: number;
  signalCounts: DashboardSignalCount[];
  workload: DashboardWorkload[];
  recentActivity: DashboardActivity[];
}
