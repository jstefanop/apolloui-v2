import React from 'react';
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

class LineChart extends React.Component {
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
            type='area'
            width='100%'
            height='100%'
          />
        )}
      </>
    );
  }
}

export default LineChart;
