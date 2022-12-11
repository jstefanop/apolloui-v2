import { configureStore } from '@reduxjs/toolkit';
import { applyMiddleware, combineReducers } from 'redux';
import { createWrapper } from 'next-redux-wrapper';
import { persistStore, persistReducer } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import * as reducers from './reducers';

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['auth'],
  timeout: null,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers(reducers)
);

const makeStore = () => {
  /*
  const sagaMiddleware = createSagaMiddleware({
    onError(err) {
      Sentry.captureException(err);
    },
  });
  */
  const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [thunkMiddleware],
  });

  /*
  store.runSagaTask = () => {
    store.sagaTask = sagaMiddleware.run(rootSaga);
  };

  store.runSagaTask();
  */

  store.__persistor = persistStore(store); // Nasty hack

  return store;
};

export default createWrapper(makeStore);
