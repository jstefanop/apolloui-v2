import { createSelector } from 'reselect';
import { initialState } from '../../graphql/services';

const servicesDataSelector = (state) => state.services.data;
const servicesErrorSelector = (state) => state.services.error;
const servicesLoadingSelector = (state) => state.services.loading;

export const servicesSelector = createSelector(
  [servicesDataSelector, servicesErrorSelector, servicesLoadingSelector],
  (servicesData, servicesError, servicesLoading) => {
    const {
      Services: {
        stats: {
          error: errorStats,
          result,
        },
      },
    } = servicesData || initialState;

    const {
      data: servicesStatus = [],
    } = result || {};

    // Ensure servicesStatus is always an array
    const servicesStatusArray = Array.isArray(servicesStatus) ? servicesStatus : [];

    // Transform servicesStatusArray into an object keyed by serviceName
    const transformedData = servicesStatusArray.reduce((acc, service) => {
      acc[service.serviceName] = service;
      return acc;
    }, {});

    const errors = [...[servicesError, errorStats].filter(Boolean)];

    return {
      loading: servicesLoading,
      error: errors,
      data: !errors.length ? transformedData : null, // Return transformedData if no errors
    };
  }
);