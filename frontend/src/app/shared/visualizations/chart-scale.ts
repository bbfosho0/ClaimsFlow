export interface ChartPoint {
  readonly x: string;
  readonly y: number;
}

export function extent(values: readonly number[]): readonly [number, number] {
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) {
    const padding = Math.max(1, Math.abs(minimum) * .05);
    return [minimum - padding, maximum + padding];
  }
  return [minimum, maximum];
}

export function scaleLinear(
  value: number,
  domainMinimum: number,
  domainMaximum: number,
  rangeMinimum: number,
  rangeMaximum: number,
): number {
  if (domainMinimum === domainMaximum) return (rangeMinimum + rangeMaximum) / 2;
  const ratio = (value - domainMinimum) / (domainMaximum - domainMinimum);
  return rangeMinimum + ratio * (rangeMaximum - rangeMinimum);
}

export function linePoints(
  points: readonly ChartPoint[],
  width = 100,
  height = 100,
  padding = 6,
): string {
  if (!points.length) return '';
  if (points.length === 1) return `${(width / 2).toFixed(2)},${padding.toFixed(2)}`;
  const [minimum, maximum] = extent(points.map(point => point.y));
  return points.map((point, index) => {
    const x = scaleLinear(index, 0, points.length - 1, padding, width - padding);
    const y = scaleLinear(point.y, minimum, maximum, height - padding, padding);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function pointX(index: number, total: number, width = 100, padding = 6): number {
  if (total <= 1) return width / 2;
  return scaleLinear(index, 0, total - 1, padding, width - padding);
}

export function pointY(value: number, values: readonly number[], height = 100, padding = 6): number {
  if (values.length <= 1) return padding;
  const [minimum, maximum] = extent(values);
  return scaleLinear(value, minimum, maximum, height - padding, padding);
}
