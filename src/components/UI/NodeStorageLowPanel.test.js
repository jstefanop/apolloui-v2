import { renderWithProviders, screen } from '../../test-utils';
import NodeStorageLowPanel from './NodeStorageLowPanel';

const GB = 1024 * 1024 * 1024;

describe('NodeStorageLowPanel', () => {
  it('warns, with the figure, when the device says the drive is low', () => {
    renderWithProviders(<NodeStorageLowPanel storage={{ low: true, free: String(5 * GB) }} />);
    expect(screen.getByText(/running out of space/i)).toBeInTheDocument();
    expect(screen.getByText(/Only 5 GB left/i)).toBeInTheDocument();
  });

  it('renders nothing while there is room', () => {
    renderWithProviders(<NodeStorageLowPanel storage={{ low: false, free: String(400 * GB) }} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders nothing before the device has answered', () => {
    renderWithProviders(<NodeStorageLowPanel storage={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not invent a figure it was not given', () => {
    // low without free: the flag came through, the measurement did not.
    renderWithProviders(<NodeStorageLowPanel storage={{ low: true, free: null }} />);
    expect(screen.getByText(/Only \? left/i)).toBeInTheDocument();
  });
});
