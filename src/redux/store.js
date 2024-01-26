import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { createWrapper } from 'next-redux-wrapper';
import { persistStore, persistReducer } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
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

const makeStore = () => {
  store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [thunkMiddleware, feedbackMiddleware],
  });

  store.__persistor = persistStore(store); // Nasty hack

  return store;
};

export { store };
export default createWrapper(makeStore);
