import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import moment from '../../lib/moment';
import { Box, Flex, Text, Icon, useColorModeValue, Skeleton } from '@chakra-ui/react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <Skeleton height="148px" borderRadius="md" />,
});

/**
 * MiniMetricChart — standalone area chart card for the 2×2 miner metrics grid.
 *
 * @param {string}        title      — Card title (top-left, large)
 * @param {string|number} valueNum   — Numeric part of live value (top-right, accent color)
 * @param {string}        valueUnit  — Unit part of live value (top-right, muted color)
 * @param {string[]}      labels     — ISO date strings for each data point
 * @param {number[]}      data       — Y-axis values
 * @param {string}        colorFrom  — Gradient / stroke start color (hex)
 * @param {string}        colorTo    — Gradient end color (hex)
 * @param {string}        tooltipUnit      — Unit shown inside tooltip (fallback formatter)
 * @param {function}      tooltipFormatter — Optional custom y-value formatter for tooltip
 * @param {string}        interval   — 'tenmin'|'hour'|'day'
 * @param {React.ElementType} icon — Chakra-compatible icon component (e.g. MinerIcon)
 * @param {boolean}       loading    — Show skeleton while data loads
 */
const MiniMetricChart = React.memo(({
  title,
  valueNum,
  valueUnit = '',
  labels = [],
  data = [],
  colorFrom = '#5E71D7',
  colorTo = '#364285',
  tooltipUnit = '',
  tooltipFormatter,
  icon,
  interval = 'hour',
  loading = false,
  // Optional second series rendered on the same card. When provided, the
  // header shows both values stacked and the chart uses a dual y-axis
  // (independent scale + axis on the right for the secondary series).
  secondary = null,
}) => {
  const cardBg     = useColorModeValue('white', 'navy.800');
  const gridColor  = useColorModeValue('#EDF2F7', '#2D3748');
  const unitColor  = useColorModeValue('#A0AEC0', '#718096');
  const titleColor = useColorModeValue('#1A202C', '#FFFFFF');
  const timeColor  = useColorModeValue('#A0AEC0', '#4A5568');

  const tooltipDateFmt = interval === 'day' ? 'DD MMM YYYY' : 'HH:mm';

  // First / last time label for the bottom strip
  const startLabel = useMemo(() => {
    if (!labels.length) return '';
    return moment(labels[0]).format(interval === 'day' ? 'DD MMM' : 'HH:mm');
  }, [labels, interval]);

  const options = useMemo(() => {
    const colors = secondary ? [colorFrom, secondary.colorFrom] : [colorFrom];
    const gradientTo = secondary ? [colorTo, secondary.colorTo] : [colorTo];

    // When the second series uses a different unit, give it its own y-axis
    // anchored on the right side. Same-unit series share a single axis.
    const sameUnit =
      !secondary || (secondary.tooltipUnit || '') === (tooltipUnit || '');
    const yaxis = secondary && !sameUnit
      ? [
          { labels: { show: false }, min: 0 },
          { opposite: true, labels: { show: false }, min: 0 },
        ]
      : { labels: { show: false }, min: 0 };

    return {
      chart: {
        type: 'area',
        toolbar:    { show: false },
        zoom:       { enabled: false },
        sparkline:  { enabled: false },
        animations: {
          enabled: true,
          easing:  'easeinout',
          dynamicAnimation: { speed: 700 },
        },
        background: 'transparent',
      },
      dataLabels: { enabled: false },
      stroke: {
        curve:  'smooth',
        width:  2.5,
        colors,
      },
      fill: {
        type: 'gradient',
        gradient: {
          type:             'vertical',
          gradientToColors: gradientTo,
          shadeIntensity:   1,
          opacityFrom:      0.55,
          opacityTo:        0.05,
          stops:            [0, 90, 100],
        },
      },
      colors,
      grid: {
        borderColor:    gridColor,
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: -10, right: 4, bottom: -12, left: 4 },
      },
      xaxis: {
        categories: labels,
        labels:      { show: false },
        axisBorder:  { show: false },
        axisTicks:   { show: false },
        tooltip:     { enabled: false },
      },
      yaxis,
      tooltip: {
        theme: 'dark',
        shared: !!secondary,
        x: {
          formatter: (_, { dataPointIndex }) => {
            const raw = labels[dataPointIndex];
            return raw ? moment(raw).format(tooltipDateFmt) : '';
          },
        },
        y: secondary
          ? [
              {
                formatter: (v) =>
                  v != null
                    ? tooltipFormatter
                      ? tooltipFormatter(v)
                      : `${Number(v).toFixed(1)} ${tooltipUnit}`
                    : 'N/A',
                title: { formatter: () => `${title}:` },
              },
              {
                formatter: (v) =>
                  v != null
                    ? secondary.tooltipFormatter
                      ? secondary.tooltipFormatter(v)
                      : `${Number(v).toFixed(1)} ${secondary.tooltipUnit || ''}`
                    : 'N/A',
                title: { formatter: () => `${secondary.title}:` },
              },
            ]
          : {
              formatter: (v) =>
                v != null
                  ? tooltipFormatter
                    ? tooltipFormatter(v)
                    : `${Number(v).toFixed(1)} ${tooltipUnit}`
                  : 'N/A',
              title: { formatter: () => '' },
            },
      },
      legend:  { show: false },
      markers: { size: 0 },
    };
  }, [
    labels,
    colorFrom,
    colorTo,
    gridColor,
    tooltipUnit,
    tooltipFormatter,
    tooltipDateFmt,
    title,
    secondary,
  ]);

  const series = useMemo(() => {
    const base = [{ name: title, data }];
    if (secondary) base.push({ name: secondary.title, data: secondary.data });
    return base;
  }, [title, data, secondary]);

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      boxShadow="md"
      overflow="hidden"
      width="100%"
      pb={2}
    >
      {/* Header: title + value(s) */}
      <Flex px={5} pt={5} pb={2} justify="space-between" align="flex-start" gap={3}>
        <Flex align="center" gap={2} minW={0}>
          {icon && (
            <Box color="white" flexShrink={0} sx={{ '& svg path': { fill: 'white' } }}>
              <Icon as={icon} w="18px" h="18px" />
            </Box>
          )}
          <Text fontSize="md" fontWeight="700" color={titleColor} lineHeight="1.2" noOfLines={1}>
            {title}
            {secondary && (
              <Text as="span" color={unitColor} fontWeight="600">
                {' / '}
                {secondary.title}
              </Text>
            )}
          </Text>
        </Flex>
        <Flex direction={secondary ? 'column' : 'row'} align={secondary ? 'flex-end' : 'baseline'} gap={secondary ? 0 : 1} flexShrink={0}>
          <Flex align="baseline" gap={1}>
            <Text fontSize={secondary ? 'xl' : '2xl'} fontWeight="800" color={colorFrom} lineHeight="1.1">
              {loading ? '—' : (valueNum ?? '—')}
            </Text>
            {valueUnit && (
              <Text fontSize="xs" fontWeight="500" color={unitColor} lineHeight="1">
                {valueUnit}
              </Text>
            )}
          </Flex>
          {secondary && (
            <Flex align="baseline" gap={1}>
              <Text fontSize="xl" fontWeight="800" color={secondary.colorFrom} lineHeight="1.1">
                {loading ? '—' : (secondary.valueNum ?? '—')}
              </Text>
              {secondary.valueUnit && (
                <Text fontSize="xs" fontWeight="500" color={unitColor} lineHeight="1">
                  {secondary.valueUnit}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Chart area */}
      {loading || !data.length ? (
        <Skeleton height="120px" mx={3} mb={3} borderRadius="lg" />
      ) : (
        <Box mx={-1}>
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={148}
          />
        </Box>
      )}

      {/* Time range strip */}
      {!loading && data.length > 0 && (
        <Flex px={5} justify="space-between" mt="-6px">
          <Text fontSize="xs" color={timeColor}>{startLabel}</Text>
          <Text fontSize="xs" color={timeColor}>Now</Text>
        </Flex>
      )}
    </Box>
  );
});

MiniMetricChart.displayName = 'MiniMetricChart';

export default MiniMetricChart;
