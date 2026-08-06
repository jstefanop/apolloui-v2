import { renderWithProviders, fireEvent } from '../../../test-utils';
import PoolSettings from './PoolSettings';
import { buildPoolOptions, matchPoolOption } from '../../../lib/poolOptions';

// The dropdown and the URL field, and which of the two owns the other.
//
// The selection is derived from what is configured; only a deliberate pick locks
// the URL. Storing the selection instead cost both directions: a configured pool
// that matched an entry opened with its URL greyed out, and a pick survived the
// Discard that took its URL away.

let ctx;

jest.mock('../context/SettingsContext', () => ({
  useSettings: () => ctx,
}));

jest.mock('../../../contexts/DeviceConfigContext', () => ({
  useDeviceConfig: () => ({ minerFamily: 'legacy', isHybrid: false }),
}));

const options = buildPoolOptions();
const ocean = options.find((o) => o.name === 'Ocean.xyz');
const braiins = options.find((o) => o.name === 'Braiins');

const setup = (pool, { soloMining = false, saveOffered = false } = {}) => {
  ctx = {
    settings: { pool, backupPool: { enabled: false }, nodeEnableSoloMining: soloMining },
    setSettings: (next) => {
      ctx = { ...ctx, settings: next };
    },
    setErrorForm: () => {},
    poolProfiles: [],
    poolToSave: { primary: { enabled: false, name: '' } },
    setPoolToSave: () => {},
    poolSaveOffered: { primary: saveOffered },
  };
  const view = renderWithProviders(<PoolSettings />);
  return {
    ...view,
    url: () => view.container.querySelector('input[name="url"]'),
    select: () => view.container.querySelector('#poolPreset'),
    reload: () => view.rerender(<PoolSettings />),
  };
};

const configured = (url) => ({ url, username: 'worker', password: 'x' });

describe('PoolSettings pool selection', () => {
  it('shows the configured pool in the dropdown and still lets its URL be edited', () => {
    const view = setup(configured(ocean.url));

    expect(view.select().value).toBe(ocean.key);
    // The regression: matching a preset is not the same as picking one, and only
    // a pick has any business locking the field.
    expect(view.url().disabled).toBe(false);
  });

  it('locks the URL to a preset the user picked', () => {
    const view = setup(configured(ocean.url));

    fireEvent.change(view.select(), { target: { value: braiins.key } });
    view.reload();

    expect(view.select().value).toBe(braiins.key);
    expect(view.url().disabled).toBe(true);
  });

  it('lets the URL be typed again once Custom is picked', () => {
    const view = setup(configured(ocean.url));

    fireEvent.change(view.select(), { target: { value: 'custom' } });
    view.reload();

    expect(view.url().disabled).toBe(false);
  });

  // Discard: the settings revert under the pick, which then names a pool the
  // fields no longer hold — and used to keep the URL locked to it.
  it('drops a pick the settings no longer back', () => {
    const view = setup(configured(braiins.url));

    fireEvent.change(view.select(), { target: { value: ocean.key } });
    view.reload();
    expect(view.url().disabled).toBe(true);

    ctx = { ...ctx, settings: { ...ctx.settings, pool: configured(braiins.url) } };
    view.reload();

    expect(view.select().value).toBe(matchPoolOption(options, { url: braiins.url }).key);
    expect(view.url().disabled).toBe(false);
  });
});

describe('PoolSettings save-pool offer', () => {
  it('offers to keep an edited pool', () => {
    const view = setup(configured('stratum+tcp://mine:1'), { saveOffered: true });
    expect(view.getByText('Add pool to list')).toBeInTheDocument();
  });

  // Solo mining rewrites the pool to the local ckpool, and every other control
  // here is disabled for it. Keeping that pool would put 127.0.0.1 in the list
  // for a later save to point a normal miner at.
  it('makes no offer while solo mining owns the pool', () => {
    const view = setup(configured('stratum+tcp://127.0.0.1:3333'), {
      saveOffered: true,
      soloMining: true,
    });
    expect(view.queryByText('Add pool to list')).not.toBeInTheDocument();
  });
});
