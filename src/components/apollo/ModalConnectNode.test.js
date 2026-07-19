import { screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { renderWithProviders } from '../../test-utils';
import ModalConnectNode from './ModalConnectNode';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

describe('ModalConnectNode', () => {
  it('fetches and renders the dedicated LAN credential only while open', () => {
    useQuery.mockReturnValue({
      data: {
        Node: {
          connectionInfo: {
            result: {
              username: 'futurebit',
              password: 'stable-lan-secret',
            },
            error: null,
          },
        },
      },
      loading: false,
      error: null,
    });

    renderWithProviders(
      <ModalConnectNode
        isOpen
        onClose={jest.fn()}
        address="192.168.50.10:8332"
      />
    );

    expect(screen.getByText('Address: 192.168.50.10:8332')).toBeInTheDocument();
    expect(screen.getByText('Username: futurebit')).toBeInTheDocument();
    expect(screen.getByText('Password: stable-lan-secret')).toBeInTheDocument();
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: false,
        fetchPolicy: 'no-cache',
      })
    );
  });
});
