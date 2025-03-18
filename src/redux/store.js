import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import * as reducers from './reducers';
import feedbackMiddleware from './middlewares';

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['auth', 'minerAction'],
  timeout: null,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers(reducers)
);

let store;
let persistor;

const makeStore = () => {
  store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(feedbackMiddleware),
  });

  persistor = persistStore(store);

  return store;
};

export { store, persistor };
export default createWrapper(makeStore, { debug: false });
