import { smoothPath } from './AreaChart';

// Sample a cubic bézier at t and return the y.
const bezierY = (y0, y1, y2, y3, t) => {
  const u = 1 - t;
  return u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
};

// Walk the path and report the lowest and highest y the curve actually reaches,
// which is not the same as the lowest and highest y of the data.
const curveExtent = (d) => {
  const [, startY] = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)/).slice(1).map(Number);
  let from = startY;
  let min = startY;
  let max = startY;

  const segments = [...d.matchAll(/C\s+([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+)/g)];
  for (const seg of segments) {
    const [, , c1y, , c2y, , endY] = seg.map(Number);
    for (let t = 0; t <= 1; t += 0.02) {
      const y = bezierY(from, c1y, c2y, endY, t);
      min = Math.min(min, y);
      max = Math.max(max, y);
    }
    from = endY;
  }

  return { min, max };
};

// The chart draws in SVG coordinates, where y grows downwards: the baseline of
// a hashrate chart is the LARGEST y, and a curve that dips below zero on screen
// is one that goes past that maximum here.
const points = (ys) => ys.map((y, i) => ({ x: i * 100, y }));

describe('smoothPath', () => {
  // The shape that gave this away: a solo node idle all night at zero, then the
  // miner is pointed at it. Catmull-Rom took its tangent from the neighbours on
  // both sides, so the last flat sample was already tilted by the climb that
  // followed — and the curve dipped under the baseline, drawing hashrate the
  // device never produced.
  it('does not dip below a flat run before a climb', () => {
    const baseline = 300;
    const d = smoothPath(points([baseline, baseline, baseline, baseline, 120, 40]));

    expect(curveExtent(d).max).toBeLessThanOrEqual(baseline + 0.01);
  });

  it('does not overshoot a peak on the way back down', () => {
    const peak = 20;
    const d = smoothPath(points([300, 300, peak, 300, 300]));

    expect(curveExtent(d).min).toBeGreaterThanOrEqual(peak - 0.01);
  });

  it('keeps the whole curve inside the data it was given', () => {
    const ys = [300, 295, 180, 60, 240, 30, 300, 300];
    const { min, max } = curveExtent(smoothPath(points(ys)));

    expect(min).toBeGreaterThanOrEqual(Math.min(...ys) - 0.01);
    expect(max).toBeLessThanOrEqual(Math.max(...ys) + 0.01);
  });

  it('still passes through every sample', () => {
    const ys = [300, 120, 200, 40];
    const d = smoothPath(points(ys));
    const ends = [...d.matchAll(/,\s*([\d.-]+)\s+([\d.-]+)(?=\s|$)/g)].map((m) => Number(m[2]));

    expect(ends).toEqual(ys.slice(1));
  });

  it('draws nothing it cannot draw', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([{ x: 0, y: 5 }])).toBe('M 0 5');
  });
});
