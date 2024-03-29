import DynamicTable from './DynamicTable';

const HashboardsTable = () => {
  const columnsData = [
    {
      Header: 'STATUS',
      accessor: 'status',
      type: 'status',
    },
    {
      Header: 'ID',
      accessor: 'id',
      type: 'name',
    },
    {
      Header: 'HASHRATE',
      accessor: 'hashrate',
      type: 'name',
    },
    {
      Header: 'TEMP',
      accessor: 'temp',
      type: 'name',
    },
    {
      Header: 'FAN SPEED',
      accessor: 'fanSpeed',
      type: 'name',
    },
    {
      Header: 'POWER',
      accessor: 'power',
      type: 'name',
    },
    {
      Header: 'VOLTAGE',
      accessor: 'voltage',
      type: 'name',
    },
    {
      Header: 'ERRORS',
      accessor: 'error',
      type: 'progress',
    },
    {
      Header: 'ACTIVE ASICS',
      accessor: 'activeAsics',
      type: 'progress',
    },
  ];

  const tableData = [
    {
      status: 'Active',
      id: 'HASHBOARD #0',
      hashrate: '2.97 TH/s',
      temp: '61°',
      fanSpeed: '2375 rpm',
      power: '202 w',
      voltage: '8.32 v',
      error: 2,
      activeAsics: 100
    }    
  ];

  return (
    <DynamicTable
      columnsData={columnsData}
      tableData={tableData}
      tableTitle={`Hasboards`}
    />
  );
};

export default HashboardsTable;