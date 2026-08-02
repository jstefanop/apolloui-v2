import { renderWithProviders, screen } from '../../test-utils';
import DynamicTable from './DynamicTable';

const columnsData = [
  { Header: 'Address', accessor: 'addr', type: 'name' },
  { Header: 'Status', accessor: 'status', type: 'status' },
];

describe('DynamicTable pagination footer', () => {
  it('does not caption the loading skeletons with a count of zero', () => {
    // The count is read off the data, which is empty by definition while
    // loading — captioning the skeleton rows with it reads as a broken table
    // rather than a loading one.
    renderWithProviders(
      <DynamicTable
        loading={true}
        columnsData={columnsData}
        tableData={[]}
        tableTitle="Peers"
      />
    );

    expect(
      screen.queryByText('Showing 1 to 0 of 0 entries')
    ).not.toBeInTheDocument();
  });

  it('shows the count once the rows are there', () => {
    renderWithProviders(
      <DynamicTable
        loading={false}
        columnsData={columnsData}
        tableData={[{ addr: '10.0.0.1', status: 'Active' }]}
        tableTitle="Peers"
      />
    );

    expect(screen.getByText('Showing 1 to 1 of 1 entries')).toBeInTheDocument();
  });
});
