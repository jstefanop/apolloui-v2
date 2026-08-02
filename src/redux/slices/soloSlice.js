import { createSlice } from '@reduxjs/toolkit';
import { markAnswered } from '../utils/answered';
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
  // Set by markAnswered(); see redux/utils/answered.js for why `data: null`
  // cannot stand in for it.
  received: false,
  loading: false,
  error: null,
};

const soloSlice = createSlice({
  name: 'solo',
  initialState,
  reducers: {
    updateSoloStats: (state, action) => {
      markAnswered(state, action.payload);
      // Serialize any Moment objects before updating state
      state.data = serializeMomentObjects(action.payload.data);
      state.loading = action.payload.loading;
      state.error = serializeError(action.payload.error);
    },
  },
});

export const { updateSoloStats } = soloSlice.actions;
export default soloSlice.reducer;
