import DynamicTable from './DynamicTable';

const HashboardsTable = () => {
  const columnsData = [
    {
      Header: 'STATUS',
      accessor: 'status',
      type: 'status',
    },
    {
      Header: 'URL',
      accessor: 'url',
      type: 'name',
    },
    {
      Header: 'HASHRATE',
      accessor: 'hashrate',
      type: 'name',
    },
    {
      Header: 'DIFF',
      accessor: 'diff',
      type: 'name',
    },
    {
      Header: 'SENT',
      accessor: 'sent',
      type: 'name',
    },
    {
      Header: 'USERNAME',
      accessor: 'username',
      type: 'name',
    },
    {
      Header: 'ACCEPT',
      accessor: 'accept',
      type: 'progress',
    },
    {
      Header: 'REJECT',
      accessor: 'reject',
      type: 'progress',
    },
  ];

  const tableData = [
    {
      status: 'Active',
      url: 'stratum.slushpool.com:3333',
      hashrate: '2.57 TH/s',
      diff: '3628',
      sent: '762345',
      username: 'michelem09.worker1',
      accept: 99.5,
      reject: 0.5,
    }    
  ];

  return (
    <DynamicTable
      columnsData={columnsData}
      tableData={tableData}
      tableTitle={`Pools`}
    />
  );
};

export default HashboardsTable;