import { presetPools } from './utils';

// The pool dropdown, addressed by something stable.
//
// It used to be the index into the hardcoded `presetPools` array — `value={i}`,
// then `presetPools[e.target.value]` on the way back. That only works while the
// list is a constant. Saved pools are inserted in name order, so every new one
// shifts the entries after it and the same index means a different pool than it
// did a second ago.
//
// Keys are strings because that is what a <select> gives back: read one and you
// get the option, whatever moved.

export const CUSTOM_KEY = 'custom';

const presetKey = (preset) => (preset.id === 'custom' ? CUSTOM_KEY : `preset:${preset.url}`);

export const savedKey = (profile) => `saved:${profile.id}`;

// Presets first (the pools we ship), then what the user kept, then the entry
// that opens the fields for typing — it belongs last, after the shortcuts.
export const buildPoolOptions = (profiles = []) => {
  const presets = presetPools
    .filter((p) => p.id !== 'custom')
    .map((p) => ({ key: presetKey(p), name: p.name, url: p.url, webUrl: p.webUrl }));

  const saved = (profiles || []).map((p) => ({
    key: savedKey(p),
    name: p.name,
    url: p.url,
    username: p.username,
    password: p.password,
    saved: true,
  }));

  const custom = presetPools.find((p) => p.id === 'custom');

  return [
    ...presets,
    ...saved,
    { key: CUSTOM_KEY, name: custom?.name ?? 'Setup Custom Pool', isCustom: true },
  ];
};

export const findPoolOption = (options, key) =>
  options.find((option) => option.key === key) ?? null;

// Which entry a pool already in settings corresponds to, so reopening the page
// shows what is actually configured rather than a blank select. A saved profile
// wins over a preset with the same URL: the user named that one.
export const matchPoolOption = (options, pool) => {
  if (!pool?.url) return null;
  const byUrl = options.filter((option) => option.url === pool.url);
  return byUrl.find((option) => option.saved) ?? byUrl[0] ?? null;
};

// Whether "add this to the list" has anything to offer: only a pool typed by
// hand. Picking a preset or an already-saved profile has nothing new to keep.
export const isSaveablePool = (option) => !!option?.isCustom;

// A first suggestion for the name field, so the common case is one keystroke:
// the host, without the stratum scheme or the port.
export const suggestPoolName = (url) => {
  if (!url) return '';
  const withoutScheme = String(url).replace(/^[a-z+]+:\/\//i, '');
  return withoutScheme.split('/')[0].split(':')[0];
};
