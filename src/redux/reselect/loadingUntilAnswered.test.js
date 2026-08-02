import minerReducer, { updateMinerStats } from '../slices/minerSlice';
import nodeReducer, { updateNodeStats } from '../slices/nodeSlice';
import soloReducer, { updateSoloStats } from '../slices/soloSlice';
import servicesReducer, { updateServicesStatus } from '../slices/servicesSlice';
import mcuReducer, { updateMcuStats } from '../slices/mcuSlice';
import { resetReceivedOnRehydrate } from '../utils/answered';
import { persistConfig } from '../store';
import { minerSelector } from './miner';
import { nodeSelector } from './node';
import { soloSelector } from './solo';
import { servicesSelector } from './services';
import { mcuSelector } from './mcu';
// The graphql modules' initialState objects are the exact shape the selectors
// destructure — the same fallback they use themselves — so they stand in for a
// real payload without hand-rolling a fragile fake.
import { initialState as minerShape } from '../../graphql/miner';
import { initialState as nodeShape } from '../../graphql/node';
import { initialState as soloShape } from '../../graphql/solo';
import { initialState as servicesShape } from '../../graphql/services';
import { initialState as mcuShape } from '../../graphql/mcu';

// The stats arrive as WebSocket pushes, so between a page load and the first push
// there is nothing to draw. `data: null` cannot say that on its own — it reads the
// same as "answered with nothing" — and every page took it for an answer and drew
// its cards empty. These pin the contract the fix relies on: report loading until
// the device has actually answered, which is what every consumer branches on to
// show a skeleton.

const DOMAINS = [
  {
    name: 'miner',
    reducer: minerReducer,
    action: updateMinerStats,
    selector: minerSelector,
    key: 'miner',
    payload: minerShape,
  },
  {
    name: 'node',
    reducer: nodeReducer,
    action: updateNodeStats,
    selector: nodeSelector,
    key: 'node',
    payload: nodeShape,
  },
  {
    name: 'solo',
    reducer: soloReducer,
    action: updateSoloStats,
    selector: soloSelector,
    key: 'solo',
    payload: soloShape,
  },
  {
    name: 'services',
    reducer: servicesReducer,
    action: updateServicesStatus,
    selector: servicesSelector,
    key: 'services',
    payload: servicesShape,
  },
  {
    name: 'mcu',
    reducer: mcuReducer,
    action: updateMcuStats,
    selector: mcuSelector,
    key: 'mcu',
    payload: mcuShape,
  },
];

// Selectors are memoized on their inputs; a fresh store shape per assertion keeps
// one domain's reads from serving another's cached result.
const stateWith = (key, slice) => ({ [key]: slice });

describe.each(DOMAINS)(
  '$name: loading until the device has answered',
  ({ reducer, action, selector, key, payload }) => {
    const initial = reducer(undefined, { type: '@@INIT' });

    it('reports loading on a fresh store, before any push', () => {
      expect(initial.received).toBe(false);
      expect(selector(stateWith(key, initial)).loading).toBe(true);
    });

    it('still reports loading while the subscription is only connecting', () => {
      // A loading tick carries neither data nor error: not an answer.
      const s = reducer(initial, action({ loading: true, data: null, error: null }));
      expect(s.received).toBe(false);
      expect(selector(stateWith(key, s)).loading).toBe(true);
    });

    it('stops reporting loading once data arrives', () => {
      const s = reducer(initial, action({ loading: false, data: payload, error: null }));
      expect(s.received).toBe(true);
      expect(selector(stateWith(key, s)).loading).toBe(false);
    });

    it('stops reporting loading when the answer is an error', () => {
      // An error is an answer: the page must show it, not a skeleton forever.
      const s = reducer(
        initial,
        action({ loading: false, data: null, error: { message: 'boom' } })
      );
      expect(s.received).toBe(true);
      expect(selector(stateWith(key, s)).loading).toBe(false);
    });

    it('stays answered once it has answered', () => {
      const answered = reducer(
        initial,
        action({ loading: false, data: payload, error: null })
      );
      // A later empty tick must not send the UI back to a skeleton.
      const then = reducer(answered, action({ loading: false, data: null, error: null }));
      expect(then.received).toBe(true);
      expect(selector(stateWith(key, then)).loading).toBe(false);
    });
  }
);

// "The device has answered" is a fact about this session. The solo slice is
// persisted (store.js whitelist), so without stripping the flag it comes back
// true from the previous session: the page skips the skeleton and presents last
// session's stats as current until the first push replaces them.
describe('solo: the answered flag does not survive a reload', () => {
  const answered = soloReducer(
    soloReducer(undefined, { type: '@@INIT' }),
    updateSoloStats({ loading: false, data: soloShape, error: null })
  );

  // This is the leg redux-persist runs over each slice it rehydrates.
  const rehydrate = (slice) => resetReceivedOnRehydrate.out(slice, 'solo', {});

  it('comes back as never-answered, so the page still reports loading', () => {
    expect(answered.received).toBe(true);

    const rehydrated = rehydrate(answered);

    expect(rehydrated.received).toBe(false);
    expect(soloSelector(stateWith('solo', rehydrated)).loading).toBe(true);
  });

  it('keeps the stats that are persisted on purpose', () => {
    expect(rehydrate(answered).data).toEqual(answered.data);
  });

  it('is wired into the persist config', () => {
    expect(persistConfig.transforms).toContain(resetReceivedOnRehydrate);
  });
});
