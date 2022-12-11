import React, { Component } from 'react';
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

class ColumnChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  render() {
    return (
      <>
        {typeof window !== 'undefined' && (
          <ReactApexChart
            options={this.state.chartOptions}
            series={this.state.chartData}
            type='bar'
            width='100%'
            height='100%'
          />
        )}
      </>
    );
  }
}

export default ColumnChart;
