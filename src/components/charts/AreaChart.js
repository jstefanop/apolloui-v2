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

// Catmull-Rom through the points, emitted as cubic béziers. This is the "smooth"
// curve the cards had: a polyline reads as jagged at this size, and interpolating
// is honest here because the series is a regular time sampling.
const smoothPath = (pts) => {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
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
