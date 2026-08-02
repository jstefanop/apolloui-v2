import { renderWithProviders, screen } from '../../test-utils';
import MinerStatus from './MinerStatus';
import NodeStatus from './NodeStatus';
import SoloMiningStatus from './SoloMiningStatus';

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
