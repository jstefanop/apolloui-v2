import { renderWithProviders, screen } from '../../test-utils';
import MinerStatus from './MinerStatus';
import NodeStatus from './NodeStatus';
import SoloMiningStatus from './SoloMiningStatus';
import useNodeStorage from '../../hooks/useNodeStorage';

// NodeStatus asks the API about the drive. These cases are about the service
// state machine, so the answer is stubbed; the storage branch has its own block.
jest.mock('../../hooks/useNodeStorage', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const withStorage = (over = {}) =>
  useNodeStorage.mockReturnValue({
    storage: null,
    loading: false,
    unavailable: false,
    state: null,
    ...over,
  });

// clearMocks wipes the implementation before each test, not just the calls.
beforeEach(() => withStorage());

// The pages hand these components the whole content area when the service is not
// online, so whatever they render is all the user sees. An absent status object
// is two different situations: still loading — the page draws its own per-card
// skeletons, so a status bar here would just be a grey slab floating above them
// — and answered-without-status, where the service is genuinely unreachable.
// Rendering nothing for both left the page blank, with no alert and no
// explanation, whenever the services subscription answered with an error.

const CASES = [
  {
    name: 'MinerStatus',
    Component: MinerStatus,
    unavailable: 'Miner status unavailable',
  },
  {
    name: 'NodeStatus',
    Component: NodeStatus,
    unavailable: 'Node status unavailable',
  },
  {
    name: 'SoloMiningStatus',
    Component: SoloMiningStatus,
    unavailable: 'Solo service unavailable',
  },
];

describe.each(CASES)('$name with no service status', ({ Component, unavailable }) => {
  it('renders nothing while the first push is still in flight', () => {
    const { container } = renderWithProviders(
      <Component serviceStatus={null} loading={true} />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Chakra's provider leaves an empty hidden span in the container, so assert
    // on what the user would see rather than on the container being bare.
    expect(container.textContent).toBe('');
  });

  it('reports the service unavailable once the subscription has answered', () => {
    renderWithProviders(<Component serviceStatus={null} loading={false} />);

    expect(screen.getByText(unavailable)).toBeInTheDocument();
  });

  it('treats an empty status object as answered too', () => {
    renderWithProviders(<Component serviceStatus={{}} loading={false} />);

    expect(screen.getByText(unavailable)).toBeInTheDocument();
  });
});

// A node with nowhere to live is offline for a reason no service state carries,
// and the plain offline message sends the user to a menu entry that is disabled.
describe('NodeStatus with no usable drive', () => {
  const offline = { node: { status: 'offline', requestedStatus: 'offline' } };

  it('explains the missing drive instead of the generic offline advice', () => {
    withStorage({ unavailable: true, state: 'no-drive' });
    renderWithProviders(<NodeStatus serviceStatus={offline} loading={false} />);

    expect(screen.getByText(/No SSD drive detected/i)).toBeInTheDocument();
    expect(screen.queryByText(/start it from the top menu/i)).not.toBeInTheDocument();
  });

  it('outranks the service state, whatever it says', () => {
    withStorage({ unavailable: true, state: 'unformatted' });
    renderWithProviders(
      <NodeStatus
        serviceStatus={{ node: { status: 'error', requestedStatus: 'online' } }}
        loading={false}
      />
    );

    expect(screen.getByText(/not formatted yet/i)).toBeInTheDocument();
  });

  it('keeps the ordinary offline message when the drive is fine', () => {
    withStorage({ state: 'ready' });
    renderWithProviders(<NodeStatus serviceStatus={offline} loading={false} />);

    expect(screen.getByText(/start it from the top menu/i)).toBeInTheDocument();
  });

  it('says nothing about drives before the device has answered', () => {
    withStorage(); // still unknown: no storage object yet
    renderWithProviders(<NodeStatus serviceStatus={offline} loading={false} />);

    expect(screen.getByText(/start it from the top menu/i)).toBeInTheDocument();
  });

  // The probe is not infallible: a drive mounted from a path it does not
  // recognise reads as unusable. Saying "your node is offline" on a page that is
  // showing live blocks is worse than saying nothing at all.
  it('never contradicts a node that is running', () => {
    withStorage({ unavailable: true, state: 'foreign' });
    const { container } = renderWithProviders(
      <NodeStatus
        serviceStatus={{ node: { status: 'online', requestedStatus: 'online' } }}
        loading={false}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/offline/i);
  });
});
