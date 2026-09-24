import { useColorModeValue } from '@chakra-ui/react';

// A half-circle gauge, drawn as two SVG paths.
//
// It replaces an ApexCharts radialBar, and the reason is measured rather than
// aesthetic: on an Apollo III — a board whose kernel exposes no GPU driver, so
// every repaint is rasterised by the CPU — the three gauges on the Overview
// accounted for roughly 22% of a core, more than the whole of the rest of the
// dashboard. Hiding them dropped the browser from ~42% to ~18%. Turning off the
// chart's animations, its drop shadow and its gradient changed nothing: the cost
// was ApexCharts rebuilding its SVG on every value change, and these values
// change on every push.
//
// This draws one arc and moves a dash offset. Nothing is rebuilt, nothing is
// filtered, and there is no chart library on the path.

const R = 80;
const CX = 100;
const CY = 96;
const STROKE = 8;
// Half a circle: the visible length the dash offset works against.
const LENGTH = Math.PI * R;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

const GaugeArc = ({ percent, color, label, id }) => {
  const trackColor = useColorModeValue('#a3aed0', '#a3aed0');
  const labelColor = useColorModeValue('#a3aed0', '#a3aed0');

  // A value outside 0-100 is a bug upstream, not something to draw: clamping
  // keeps a wrong number from rendering as a stray arc.
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <svg
      id={id}
      viewBox="0 0 200 128"
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label={`${pct}%`}
    >
      <path
        d={ARC}
        fill="none"
        stroke={trackColor}
        strokeOpacity="0.3"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* The fade the chart used to draw, kept because it costs nothing here:
          one gradient rasterised with the path, rather than a chart library
          rebuilding its DOM on every value change. */}
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d={ARC}
        fill="none"
        stroke={`url(#${id}-fade)`}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={LENGTH}
        strokeDashoffset={LENGTH * (1 - pct / 100)}
      />
      {label && (
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fill={labelColor}
          fontSize="14"
          fontFamily="DM Sans, sans-serif"
        >
          {label}
        </text>
      )}
    </svg>
  );
};

export default GaugeArc;
