import {
  buildPoolOptions,
  findPoolOption,
  matchPoolOption,
  isPoolAlreadySaved,
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

describe('isPoolAlreadySaved', () => {
  const kept = { url: 'stratum+tcp://a:1', username: 'w', password: 'p' };
  const profiles = [{ id: 1, name: 'Kept', ...kept }];

  it('is true only for the exact pool that was kept', () => {
    expect(isPoolAlreadySaved(profiles, kept)).toBe(true);
  });

  // The case that sent the user looking: their own worker on a preset pool. The
  // URL never moved, so a URL-only comparison said "already saved" and the offer
  // to keep it never appeared.
  it('is false when only the worker differs', () => {
    expect(isPoolAlreadySaved(profiles, { ...kept, username: 'other' })).toBe(false);
  });

  it('is false when only the password differs', () => {
    expect(isPoolAlreadySaved(profiles, { ...kept, password: 'other' })).toBe(false);
  });

  it('treats null and empty as the same absent value', () => {
    const bare = [{ id: 2, name: 'Bare', url: 'stratum+tcp://b:2', username: null, password: null }];
    expect(isPoolAlreadySaved(bare, { url: 'stratum+tcp://b:2', username: '', password: '' })).toBe(true);
  });

  it('never counts a preset as saved — a preset carries no worker', () => {
    const preset = buildPoolOptions().find((o) => o.url);
    expect(isPoolAlreadySaved([], { url: preset.url, username: 'w' })).toBe(false);
  });

  it('is false with nothing kept at all', () => {
    expect(isPoolAlreadySaved([], kept)).toBe(false);
    expect(isPoolAlreadySaved(undefined, kept)).toBe(false);
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
