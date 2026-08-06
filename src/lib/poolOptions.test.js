import {
  buildPoolOptions,
  findPoolOption,
  matchPoolOption,
  isSaveablePool,
  suggestPoolName,
  savedKey,
  CUSTOM_KEY,
} from './poolOptions';

const saved = [
  { id: 4, name: 'Ocean home', url: 'stratum+tcp://mine.ocean.xyz:3334', username: 'bc1q.w1' },
  { id: 7, name: 'Rented', url: 'stratum+tcp://rent:3333', username: 'w2', password: 'p' },
];

describe('buildPoolOptions', () => {
  it('keeps the custom entry last, after the saved ones', () => {
    const options = buildPoolOptions(saved);
    expect(options[options.length - 1].key).toBe(CUSTOM_KEY);
    expect(options.filter((o) => o.saved).map((o) => o.name)).toEqual([
      'Ocean home',
      'Rented',
    ]);
  });

  it('works with no saved pools at all', () => {
    expect(buildPoolOptions()).toEqual(buildPoolOptions([]));
    expect(buildPoolOptions().some((o) => o.key === CUSTOM_KEY)).toBe(true);
  });

  // The whole point of the file: a key must survive the list changing under it.
  it('gives an option the same key whatever else joins the list', () => {
    const before = findPoolOption(buildPoolOptions([saved[1]]), savedKey(saved[1]));
    const after = findPoolOption(buildPoolOptions(saved), savedKey(saved[1]));

    expect(before.name).toBe('Rented');
    expect(after.name).toBe('Rented');
  });

  it('carries the worker and password of a saved pool', () => {
    const option = findPoolOption(buildPoolOptions(saved), savedKey(saved[1]));
    expect(option).toMatchObject({ username: 'w2', password: 'p' });
  });
});

describe('findPoolOption', () => {
  it('returns null for a key that is not there', () => {
    expect(findPoolOption(buildPoolOptions(saved), 'saved:999')).toBeNull();
  });
});

describe('matchPoolOption', () => {
  it('preselects the saved profile over a preset with the same URL', () => {
    const presetUrl = buildPoolOptions().find((o) => o.url).url;
    const options = buildPoolOptions([{ id: 1, name: 'Mine', url: presetUrl }]);

    expect(matchPoolOption(options, { url: presetUrl })).toMatchObject({
      name: 'Mine',
      saved: true,
    });
  });

  it('falls back to the preset when nothing was saved', () => {
    const options = buildPoolOptions();
    const presetUrl = options.find((o) => o.url).url;

    expect(matchPoolOption(options, { url: presetUrl }).url).toBe(presetUrl);
  });

  it('matches nothing for a URL the list has never seen', () => {
    expect(matchPoolOption(buildPoolOptions(saved), { url: 'stratum+tcp://nope:1' })).toBeNull();
    expect(matchPoolOption(buildPoolOptions(saved), {})).toBeNull();
    expect(matchPoolOption(buildPoolOptions(saved), null)).toBeNull();
  });
});

describe('isSaveablePool', () => {
  it('offers to save only a pool typed by hand', () => {
    const options = buildPoolOptions(saved);
    expect(isSaveablePool(findPoolOption(options, CUSTOM_KEY))).toBe(true);
    expect(isSaveablePool(findPoolOption(options, savedKey(saved[0])))).toBe(false);
    expect(isSaveablePool(options[0])).toBe(false);
    expect(isSaveablePool(null)).toBe(false);
  });
});

describe('suggestPoolName', () => {
  it.each([
    ['stratum+tcp://mine.ocean.xyz:3334', 'mine.ocean.xyz'],
    ['stratum+tcp://rent.pool.io:3333/path', 'rent.pool.io'],
    ['pool.example.com:3333', 'pool.example.com'],
    ['', ''],
    [undefined, ''],
  ])('%s -> %s', (url, expected) => {
    expect(suggestPoolName(url)).toBe(expected);
  });
});
