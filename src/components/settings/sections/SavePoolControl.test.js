import { renderWithProviders, screen } from '../../../test-utils';
import SavePoolControl from './SavePoolControl';

// One control per pool section. The bug it exists to prevent: a single control
// under the primary fields, which offered nothing for a custom backup pool and,
// when turned on, kept whichever pool the save handler happened to read.

const kept = {
  id: 1,
  name: 'Kept',
  url: 'stratum+tcp://a:1',
  username: 'w',
  password: 'p',
};

const render = (props) =>
  renderWithProviders(
    <SavePoolControl
      pool={{ url: 'stratum+tcp://b:2', username: 'me', password: 'x' }}
      profiles={[kept]}
      value={{ enabled: false, name: '' }}
      onChange={() => {}}
      visible
      idSuffix="primary"
      {...props}
    />
  );

describe('SavePoolControl', () => {
  it('offers to keep a pool that is not in the list', () => {
    render();
    expect(screen.getByText('Add pool to list')).toBeInTheDocument();
  });

  it('stays out of the way once that exact pool is kept', () => {
    render({ pool: kept });
    expect(screen.queryByText('Add pool to list')).not.toBeInTheDocument();
  });

  // The case the user hit: same URL, their own worker. Nothing was offered
  // because only the URL was compared.
  it('offers again when only the worker differs', () => {
    render({ pool: { ...kept, username: 'someone-else' } });
    expect(screen.getByText('Add pool to list')).toBeInTheDocument();
  });

  it('shows nothing when there is no save to hang it on', () => {
    const { container } = render({ visible: false });
    expect(container.textContent).toBe('');
  });

  it('shows nothing for a pool with no URL yet', () => {
    const { container } = render({ pool: { username: 'me' } });
    expect(container.textContent).toBe('');
  });

  it('reveals the name field only once switched on, seeded from the host', () => {
    const onChange = jest.fn();
    render({ onChange });

    screen.getByRole('checkbox').click();

    expect(onChange).toHaveBeenCalledWith({ enabled: true, name: 'b' });
  });

  // Two controls render at once; identical ids would make the backup label
  // focus the primary switch.
  it('gives each section its own control id', () => {
    const { container } = render({ idSuffix: 'backup' });
    expect(container.querySelector('#savePoolProfile-backup')).toBeInTheDocument();
  });
});
