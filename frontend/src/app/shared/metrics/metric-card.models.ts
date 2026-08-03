import { AnimatedNumberFormat } from '../operational/animated-number.component';

export type MetricCardVariant = 'hero' | 'compact' | 'split' | 'radial';
export type MetricTone = 'brand' | 'live' | 'healthy' | 'warning' | 'critical' | 'advisory' | 'neutral';
export type MetricDeltaKind = 'PERCENTAGE' | 'NEW' | 'CLEARED' | 'UNCHANGED';

export interface MetricDeltaChange {
  readonly kind: MetricDeltaKind;
  readonly percentage: number | null;
}

export interface MetricStripSegment {
  readonly label: string;
  readonly value: number;
  readonly tone: MetricTone;
}

export interface MetricSparkPoint {
  readonly label: string;
  readonly value: number;
}

export interface MetricCardConfig {
  readonly label: string;
  readonly value: number | string;
  readonly format?: AnimatedNumberFormat;
  readonly variant?: MetricCardVariant;
  readonly tone?: MetricTone;
  readonly helper?: string;
  readonly definition?: string;
  readonly delta?: MetricDeltaChange | null;
  readonly inverseDelta?: boolean;
}
