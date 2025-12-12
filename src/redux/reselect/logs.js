import { createSelector } from 'reselect';
import { initialState } from '../../graphql/logs';

const logsDataSelector = (state) => state.logs.data;
const logsErrorSelector = (state) => state.logs.error;
const logsLoadingSelector = (state) => state.logs.loading;

export const logsSelector = createSelector(
  logsDataSelector,
  logsErrorSelector,
  logsLoadingSelector,
  (logsData, logsError, logsLoading) => {
    const {
      Logs: {
        read: { error: errorLogs, result },
      },
    } = logsData ?? initialState;

    const errors = [...[logsError, errorLogs].filter(Boolean)];

    return {
      loading: logsLoading,
      error: errors,
      data: {
        content: result?.content,
        timestamp: result?.timestamp,
      },
    };
  }
);