export type ChartTone = 'brand' | 'secondary' | 'live' | 'healthy' | 'warning' | 'critical' | 'neutral';

export interface ChartDatum {
  readonly label: string;
  readonly value: number;
  readonly detail?: string;
  readonly route?: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export interface LineChartSeries {
  readonly key: string;
  readonly label: string;
  readonly tone: ChartTone;
  readonly points: readonly ChartDatum[];
  readonly area?: boolean;
  readonly dashed?: boolean;
}

export interface BarChartDatum extends ChartDatum {
  readonly secondaryValue?: number;
  readonly target?: number;
  readonly tone?: ChartTone;
}

export interface StackedChartSegment {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly tone: ChartTone;
}

export interface HeatmapCell {
  readonly key: string;
  readonly label: string;
  readonly value: number | null;
  readonly detail?: string;
  readonly tone?: ChartTone;
}

export interface HeatmapRow {
  readonly key: string;
  readonly label: string;
  readonly cells: readonly HeatmapCell[];
}
