import React from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

class GaugeChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      chartOptions: {}
    };
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData || this.state.chartData,
      chartOptions: this.props.chartOptions || this.state.chartOptions,
    });
  }

  render() {
    return (
      <>
        <div id="chart">
          <ReactApexChart
            options={this.state.chartOptions}
            series={this.state.chartData}
            type="radialBar"
          />
        </div>
      </>
    );
  }
}

export default GaugeChart;
