import React, { useMemo, useCallback } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import moment from '../../lib/moment';
import { GET_ANALYTICS_QUERY } from '../../graphql/analytics';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { displayHashrate } from '../../lib/utils';
import { INTERVAL_CONFIG } from './HashrateChart';
import MiniMetricChart from './MiniMetricChart';
import { MinerIcon } from '../UI/Icons/MinerIcon';
import { PoolIcon } from '../UI/Icons/PoolIcon';
import { MinerTempIcon } from '../UI/Icons/MinerTemp';
import { PowerIcon } from '../UI/Icons/PowerIcon';

/**
 * MinerMetricsGrid — 2×2 grid of standalone mini area chart cards.
 *
 * Props:
 *   interval         — 'tenmin'|'hour'|'day'
 *   currentHashrate  — { value, unit } object from minerSelector
 *   currentTemp      — number °C from minerSelector.avgBoardTemp
 *   currentPower     — number W  from minerSelector.minerPower
 */
const MinerMetricsGrid = React.memo(({
  interval = 'hour',
  currentHashrate,
  currentTemp,
  currentPower,
}) => {
  const config = INTERVAL_CONFIG[interval] || INTERVAL_CONFIG.hour;

  const { loading, data: queryData } = useQuery(GET_ANALYTICS_QUERY, {
    variables: { input: { interval } },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    pollInterval: interval === 'tenmin' ? 30000 : 60000,
  });

  const rawData = useMemo(() => {
    if (!queryData?.TimeSeries?.stats?.result?.data) return null;
    return queryData.TimeSeries.stats.result.data;
  }, [queryData]);

  const { data: limitedRaw } = useAnalyticsData(rawData);

  const slicedData = useMemo(() => {
    if (!limitedRaw?.length) return [];
    return limitedRaw.slice(-config.points);
  }, [limitedRaw, config.points]);

  // ISO labels (used for tooltip formatting inside MiniMetricChart)
  const labels = useMemo(
    () => slicedData.map((item) => item.date),
    [slicedData]
  );

  const hashrateData = useMemo(() => slicedData.map((item) => item.hashrate),    [slicedData]);
  const poolData     = useMemo(() => slicedData.map((item) => item.poolHashrate), [slicedData]);
  const tempData     = useMemo(() => slicedData.map((item) => item.temperature),  [slicedData]);
  const wattData     = useMemo(() => slicedData.map((item) => item.watts),        [slicedData]);

  // Split live values into number + unit for the header display
  const hashrateParts = useMemo(() => {
    if (!currentHashrate) return { num: null, unit: '' };
    const v = currentHashrate.value ?? currentHashrate;
    const u = currentHashrate.unit  ?? 'GH/s';
    const obj = displayHashrate(v, u, false, 2, true); // returns { value, unit }
    return { num: obj?.value ?? v, unit: obj?.unit ?? u };
  }, [currentHashrate]);

  // Pool hashrate: derive from the most recent analytics point
  const poolParts = useMemo(() => {
    const last = poolData.length ? poolData[poolData.length - 1] : null;
    if (last == null) return { num: null, unit: '' };
    const obj = displayHashrate(last, 'GH/s', false, 2, true);
    return { num: obj?.value ?? last, unit: obj?.unit ?? 'GH/s' };
  }, [poolData]);

  const tempParts  = { num: currentTemp  != null ? Number(currentTemp).toFixed(1)  : null, unit: '°C' };
  const powerParts = { num: currentPower != null ? Number(currentPower).toFixed(0) : null, unit: 'W'  };

  // Tooltip formatters: auto-scale GH/s → TH/s → PH/s as needed
  const hashrateTooltipFmt = useCallback(
    (v) => displayHashrate(v, 'GH/s', true, 2),
    []
  );

  const isLoading = loading && !slicedData.length;

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} width="100%">
      {/* Hashrate — blue/purple */}
      <MiniMetricChart
        title="Hashrate"
        icon={MinerIcon}
        valueNum={hashrateParts.num}
        valueUnit={hashrateParts.unit}
        labels={labels}
        data={hashrateData}
        colorFrom="#5E71D7"
        colorTo="#364285"
        tooltipFormatter={hashrateTooltipFmt}
        interval={interval}
        loading={isLoading}
      />

      {/* Pool Hashrate — teal */}
      <MiniMetricChart
        title="Pool Hashrate"
        icon={PoolIcon}
        valueNum={poolParts.num}
        valueUnit={poolParts.unit}
        labels={labels}
        data={poolData}
        colorFrom="#38B2AC"
        colorTo="#1D4044"
        tooltipFormatter={hashrateTooltipFmt}
        interval={interval}
        loading={isLoading}
      />

      {/* Temperature — orange → red */}
      <MiniMetricChart
        title="Temperature"
        icon={MinerTempIcon}
        valueNum={tempParts.num}
        valueUnit={tempParts.unit}
        labels={labels}
        data={tempData}
        colorFrom="#ED8936"
        colorTo="#9B2335"
        tooltipUnit="°C"
        interval={interval}
        loading={isLoading}
      />

      {/* Power Usage — amber → red */}
      <MiniMetricChart
        title="Power Usage"
        icon={PowerIcon}
        valueNum={powerParts.num}
        valueUnit={powerParts.unit}
        labels={labels}
        data={wattData}
        colorFrom="#ECC94B"
        colorTo="#9B2335"
        tooltipUnit="W"
        interval={interval}
        loading={isLoading}
      />
    </SimpleGrid>
  );
});

MinerMetricsGrid.displayName = 'MinerMetricsGrid';

export default MinerMetricsGrid;
