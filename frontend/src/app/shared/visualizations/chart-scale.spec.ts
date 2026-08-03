import { extent, linePoints, scaleLinear } from './chart-scale';

describe('chart scale helpers', () => {
  it('returns a padded domain for equal values', () => {
    expect(extent([5, 5, 5])).toEqual([4, 6]);
  });

  it('places a single point at the horizontal center', () => {
    expect(linePoints([{ x: '2026-08-03', y: 7 }], 100, 80)).toEqual('50.00,6.00');
  });

  it('returns a finite midpoint for a zero-width input domain', () => {
    expect(scaleLinear(10, 10, 10, 0, 100)).toBe(50);
  });

  it('returns an empty path for an empty series', () => {
    expect(linePoints([], 100, 80)).toBe('');
  });
});
