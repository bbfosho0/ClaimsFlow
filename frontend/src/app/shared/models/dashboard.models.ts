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

export interface DashboardMetricChange {
  kind: 'PERCENTAGE' | 'NEW' | 'CLEARED' | 'UNCHANGED';
  percentage: number | null;
}

export interface DashboardComparison {
  previousAsOf: string;
  openClaims: DashboardMetricChange;
  estimatedExposure: DashboardMetricChange;
  slaPressure: DashboardMetricChange;
  evidenceReadiness: DashboardMetricChange;
}

export interface DashboardTimePoint {
  date: string;
  value: number;
}

export interface DashboardMonetaryTimePoint {
  date: string;
  amount: number;
}

export interface DashboardSlaPressurePoint {
  date: string;
  atRisk: number;
  overdue: number;
}

export interface DashboardDistributionPoint {
  key: string;
  label: string;
  count: number;
  percentage: number;
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
  estimatedExposure: number;
  overallUtilizationPercentage: number;
  resolvedThisPeriod: number;
  comparison: DashboardComparison;
  openPortfolioTrend: DashboardTimePoint[];
  exposureTrend: DashboardMonetaryTimePoint[];
  slaPressureTrend: DashboardSlaPressurePoint[];
  evidenceReadinessBands: DashboardDistributionPoint[];
  priorityDistribution: DashboardDistributionPoint[];
  slaDeadlineBands: DashboardDistributionPoint[];
  signalCounts: DashboardSignalCount[];
  workload: DashboardWorkload[];
  recentActivity: DashboardActivity[];
}
