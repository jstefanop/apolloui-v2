import DynamicTable from './DynamicTable';

const ConnectionsTable = () => {
  const columnsData = [
    {
      Header: 'IP ADDRESS',
      accessor: 'ip',
      type: 'name',
    },
    {
      Header: 'CLIENT',
      accessor: 'client',
      type: 'name',
    }
  ];

  const tableData = [
    {
      ip: '109.255.106.206:8333',
      client: '/Satoshi:0.20.0(TaproothatesElon)/',
    },
    {
      ip: '3.10.5.123:8333',
      client: '/Satoshi:0.21.1/',
    },
    {
      ip: '211.198.5.219:8333',
      client: '/Satoshi:24.0.0/',
    },
    {
      ip: '47.188.230.76:8333',
      client: '/Satoshi:22.0.0/',
    },
    {
      ip: '179.222.141.191:8333',
      client: '/Satoshi:22.0.0/',
    },
  ];

  return (
    <DynamicTable
      columnsData={columnsData}
      tableData={tableData}
      tableTitle={`Node connections`}
    />
  );
};

export default ConnectionsTable;