import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createWrapper } from 'next-redux-wrapper';

// Import reducers/slices
import minerReducer from './slices/minerSlice';
import nodeReducer from './slices/nodeSlice';
import mcuReducer from './slices/mcuSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import wifiReducer from './slices/wifiSlice';
import feedbackReducer, {
  sendFeedback,
  resetFeedback,
} from './slices/feedbackSlice';
import minerActionReducer from './slices/minerActionSlice';
import servicesReducer from './slices/servicesSlice';
import logsReducer from './slices/logsSlice';
import soloReducer from './slices/soloSlice';

// Custom middleware
const feedbackMiddleware = (store) => (next) => (action) => {
  // Check if the action type matches the sendFeedback action type
  if (action.type === sendFeedback.type) {
    next(action);
    setTimeout(() => {
      store.dispatch(resetFeedback());
    }, 10000);
  } else {
    next(action);
  }
};

// Middleware to force serialization of all actions
const serializationMiddleware = () => (next) => (action) => {
  // Function to deeply serialize all data, including Moment objects
  const serializeDeep = (data) => {
    if (!data) return data;

    try {
      // This ensures all objects are fully serializable
      // It will convert Moment objects to strings automatically
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      console.error('Non-serializable data in Redux action:', e);
      return data; // Return original if serialization fails
    }
  };

  // Create a serialized version of the action
  const serializedAction = {
    ...action,
    payload: action.payload ? serializeDeep(action.payload) : action.payload
  };

  return next(serializedAction);
};

// Configure persistance
const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['auth', 'minerAction'],
  timeout: null,
};

// Combine reducers
const rootReducer = {
  miner: minerReducer,
  node: nodeReducer,
  mcu: mcuReducer,
  analytics: analyticsReducer,
  settings: settingsReducer,
  wifi: wifiReducer,
  feedback: feedbackReducer,
  minerAction: minerActionReducer,
  services: servicesReducer,
  logs: logsReducer,
  solo: soloReducer,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, (state, action) => {
  const combinedReducer = Object.keys(rootReducer).reduce((acc, key) => {
    acc[key] = rootReducer[key](state?.[key], action);
    return acc;
  }, {});
  return combinedReducer;
});

let store;
let persistor;

// Create store with middlewares
const makeStore = () => {
  store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignora solo le azioni specifiche che potrebbero ancora contenere dati non serializzabili
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            sendFeedback.type,
            resetFeedback.type,
            'miner/updateMinerStats',
            'node/updateNodeStats',
          ],
          // Mantieni alcune ignoredPaths per sicurezza
          ignoredPaths: [
            'node.data.timestamp',
            'services.data',
            'miner.data.Miner.stats.result.stats',
            'miner.data.Miner.online.result',
          ],
        },
      }).concat(serializationMiddleware, feedbackMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  persistor = persistStore(store);
  return store;
};

export { store, persistor };
export default createWrapper(makeStore, { debug: false });