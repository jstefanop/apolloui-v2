import React from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const GaugeChart = ({ id, chartData, chartOptions }) => {
  return (
    <div id={id}>
      <ReactApexChart
        options={chartOptions}
        series={chartData}
        type="radialBar"
      />
    </div>
  );
};

export default GaugeChart;
