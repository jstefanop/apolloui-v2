import { createSlice } from '@reduxjs/toolkit';
import { serializeError } from '../utils/errorUtils';

// Helper function to deeply serialize any Moment objects
const serializeMomentObjects = (obj) => {
  if (!obj) return obj;

  // Check for Moment object (_isAMomentObject is a property of Moment instances)
  if (obj && typeof obj === 'object' && obj._isAMomentObject) {
    return obj.format ? obj.format() : String(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeMomentObjects);
  }

  // Handle plain objects
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeMomentObjects(obj[key]);
      }
    }
    return result;
  }

  return obj;
};

const initialState = {
  data: null,
  loading: false,
  error: null,
  // Reconstructed "last share" times, keyed by board uuid: { [uuid]: { sent, at } }.
  // The stat file only reports a cumulative share counter, never a timestamp, so
  // the real "last share" is the wall-clock moment sharesSent last changed. Kept
  // here (not in a fragile Apollo/localStorage type policy) and read by the miner
  // selector. Display-only; resets on reload (not persisted).
  lastShare: {},
};

const minerSlice = createSlice({
  name: 'miner',
  initialState,
  reducers: {
    updateMinerStats: (state, action) => {
      // Serialize any Moment objects before updating state
      const data = serializeMomentObjects(action.payload.data);
      state.data = data;
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);

      // Stamp each board's last-share time when its cumulative share count moves.
      const boards = data?.Miner?.stats?.result?.stats;
      if (Array.isArray(boards)) {
        const now = Date.now();
        for (const board of boards) {
          const uuid = board?.uuid;
          const sent = board?.pool?.intervals?.int_0?.sharesSent;
          if (uuid == null || sent == null) continue;
          const prev = state.lastShare[uuid];
          if (!prev || prev.sent !== sent) {
            state.lastShare[uuid] = { sent, at: now };
          }
        }
      }
    },
  },
});

export const { updateMinerStats } = minerSlice.actions;
export default minerSlice.reducer;