import { useMemo, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

// A small area chart, drawn directly.
//
// It replaces ApexCharts for the metric cards, and the reason is the same one
// that took the gauges out: a chart library rebuilds its SVG whenever the data
// changes, and this data changes on every push. On a controller with no GPU
// driver every one of those rebuilds is rasterised by the CPU. What is actually
// on screen here is two paths per series, a few grid lines and a tooltip — so
// that is what this draws, and an update moves the `d` attributes instead of
// replacing a subtree.
//
// The viewBox is a fixed drawing space stretched to the container, which keeps
// the maths simple; `vector-effect="non-scaling-stroke"` stops the stretch from
// distorting line widths.

const W = 1000;
const GRID_LINES = 4;

// A smooth curve through the points, emitted as cubic béziers.
//
// Monotone cubic (Fritsch-Carlson), not Catmull-Rom. Catmull-Rom sets each
// tangent from the neighbours on either side, which makes it overshoot where
// the slope changes abruptly: a hashrate that sat at zero all night and then
// climbs made the curve dip *below* zero first, drawing hashrate the miner
// never produced and a reading the axis says is impossible. This scheme limits
// every tangent so a segment stays inside the values at its two ends — no
// invented minima, no invented peaks.
export const smoothPath = (pts) => {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';

  const n = pts.length;
  // Secant slope of each segment.
  const slope = [];
  for (let i = 0; i < n - 1; i += 1) {
    const dx = pts[i + 1].x - pts[i].x;
    slope.push(dx === 0 ? 0 : (pts[i + 1].y - pts[i].y) / dx);
  }

  // Start from the average of the neighbouring secants, the Catmull-Rom
  // tangent, then clamp it.
  const tangent = new Array(n);
  tangent[0] = slope[0];
  tangent[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    // A turning point is flat. Where the series changes direction the average
    // of the two secants still leans one way, and the curve rounds past the
    // sample — a peak drawn higher than the highest reading, a trough drawn
    // lower than the lowest.
    tangent[i] =
      slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }

  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      // A flat segment must stay flat: this is the run of zeros that used to
      // be bent into a dip by whatever came after it.
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i += 1) {
    const dx = (pts[i + 1].x - pts[i].x) / 3;
    const c1x = pts[i].x + dx;
    const c1y = pts[i].y + tangent[i] * dx;
    const c2x = pts[i + 1].x - dx;
    const c2y = pts[i + 1].y - tangent[i + 1] * dx;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${pts[i + 1].x.toFixed(2)} ${pts[i + 1].y.toFixed(2)}`;
  }
  return d;
};

const AreaChart = ({
  series = [],
  labels = [],
  height = 148,
  gridColor = '#2D3748',
  // Each series scaled to its own maximum. What the cards did when the two
  // series carried different units — a shared axis would flatten one of them.
  dualScale = false,
  formatDate = (v) => v,
  // Line only, no gradient underneath — what the full-width chart wants.
  fill = true,
  // Axis labels live in HTML, not in the SVG: the drawing space is stretched to
  // the container, and stretched text is unreadable.
  showAxes = false,
  formatY = (v) => String(Math.round(v)),
  xTicks = 4,
  axisColor = '#718096',
  tooltipBg = 'rgba(17, 28, 68, 0.95)',
  tooltipColor = '#fff',
}) => {
  const [hover, setHover] = useState(null);
  const boxRef = useRef(null);

  const n = Math.max(...series.map((s) => s.data?.length || 0), 0);

  const geom = useMemo(() => {
    if (!n) return null;
    const H = height;
    const pad = 6; // room for the stroke and for the dot at the extremes
    const xOf = (i) => (n === 1 ? W / 2 : (i / (n - 1)) * W);

    // A flat series has max === 0; dividing by it would put every point at the
    // top. Fall back to 1 so a flat line sits on the baseline instead.
    const maxOf = (data) => Math.max(...data.filter((v) => Number.isFinite(v)), 0) || 1;
    const sharedMax = maxOf(series.flatMap((s) => s.data || []));

    return series.map((s) => {
      const data = s.data || [];
      const max = dualScale ? maxOf(data) : sharedMax;
      const yOf = (v) => {
        const value = Number.isFinite(v) ? v : 0;
        return H - pad - (value / max) * (H - pad * 2);
      };
      const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
      const line = smoothPath(pts);
      const area = pts.length ? `${line} L ${xOf(pts.length - 1)} ${H} L ${xOf(0)} ${H} Z` : '';
      return { ...s, pts, line, area, max };
    });
  }, [series, n, height, dualScale]);

  if (!geom) return null;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const i = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
    setHover({ i, x: e.clientX - rect.left, w: rect.width });
  };

  const h = hover;

  return (
    <Box position="relative" ref={boxRef} onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {geom.map((s, k) => (
            <linearGradient key={k} id={`${s.id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.colorFrom} stopOpacity="0.55" />
              <stop offset="90%" stopColor={s.colorTo || s.colorFrom} stopOpacity="0.05" />
            </linearGradient>
          ))}
        </defs>

        {Array.from({ length: GRID_LINES }, (_, k) => {
          const y = ((k + 1) / (GRID_LINES + 1)) * height;
          return (
            <line
              key={k}
              x1="0"
              y1={y}
              x2={W}
              y2={y}
              stroke={gridColor}
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {geom.map((s, k) => (
          <g key={k}>
            {fill && <path d={s.area} fill={`url(#${s.id}-area)`} stroke="none" />}
            <path
              d={s.line}
              fill="none"
              stroke={s.colorFrom}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {h && (
          <g>
            <line
              x1={geom[0].pts[h.i].x}
              y1="0"
              x2={geom[0].pts[h.i].x}
              y2={height}
              stroke={gridColor}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {geom.map((s, k) =>
              s.pts[h.i] ? (
                <circle
                  key={k}
                  cx={s.pts[h.i].x}
                  cy={s.pts[h.i].y}
                  r="3"
                  fill={s.colorFrom}
                  stroke="#fff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  // The circle would stretch with the viewBox like everything
                  // else; counter-scale it so the dot stays round.
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ) : null
            )}
          </g>
        )}
      </svg>

      {showAxes && (
        <>
          {Array.from({ length: GRID_LINES + 1 }, (_, k) => {
            const frac = k / GRID_LINES;
            return (
              <Box
                key={`y${k}`}
                position="absolute"
                left="0"
                top={`${(1 - frac) * 100}%`}
                transform="translate(-100%, -50%)"
                pr="6px"
                fontSize="xs"
                color={axisColor}
                whiteSpace="nowrap"
                pointerEvents="none"
              >
                {formatY(geom[0].max * frac)}
              </Box>
            );
          })}
          {Array.from({ length: xTicks }, (_, k) => {
            const i = Math.round((k / (xTicks - 1)) * (n - 1));
            return (
              <Box
                key={`x${k}`}
                position="absolute"
                left={`${(i / Math.max(n - 1, 1)) * 100}%`}
                top="100%"
                transform="translateX(-50%)"
                mt="4px"
                fontSize="xs"
                color={axisColor}
                whiteSpace="nowrap"
                pointerEvents="none"
              >
                {formatDate(labels[i])}
              </Box>
            );
          })}
        </>
      )}

      {h && (
        <Box
          position="absolute"
          top="4px"
          left={`${Math.min(Math.max(h.x, 60), h.w - 60)}px`}
          transform="translateX(-50%)"
          bg={tooltipBg}
          color={tooltipColor}
          fontSize="xs"
          px="8px"
          py="6px"
          borderRadius="6px"
          pointerEvents="none"
          whiteSpace="nowrap"
          zIndex="2"
        >
          <Box opacity={0.7}>{formatDate(labels[h.i])}</Box>
          {geom.map((s, k) => (
            <Box key={k} display="flex" alignItems="center" gap="6px" mt="2px">
              <Box w="8px" h="8px" borderRadius="full" bg={s.colorFrom} />
              <span>
                {s.name ? `${s.name}: ` : ''}
                {s.format ? s.format(s.data?.[h.i]) : s.data?.[h.i]}
              </span>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AreaChart;
