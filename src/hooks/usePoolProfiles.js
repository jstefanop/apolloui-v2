import { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_POOL_PROFILES_QUERY,
  SAVE_POOL_PROFILE_MUTATION,
} from '../graphql/poolProfiles';

// The pools the user has kept, and the one call that adds to them.
//
// `save` returns a message instead of throwing: it runs as part of saving
// settings, and a pool that could not be remembered must not fail the save that
// actually applied it.
export const usePoolProfiles = () => {
  const { data, loading, refetch } = useQuery(GET_POOL_PROFILES_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [saveMutation] = useMutation(SAVE_POOL_PROFILE_MUTATION, {
    onError: () => {},
  });

  const profiles = data?.PoolProfiles?.list?.result?.profiles ?? [];

  const save = useCallback(
    async (input) => {
      // errorPolicy leaves GraphQL failures in `errors` with data null, so both
      // have to be read: checking only one reports success for a failed save.
      //
      // `errors` arrives in two shapes. With `onError` given, useMutation
      // returns the ApolloError *itself* for a transport failure, not an array
      // of GraphQL errors — reading only `errors[0]` turned an unreachable
      // device into a green toast for a pool that was never kept.
      const { data: saved, errors } = await saveMutation({ variables: { input } });
      const payload = saved?.PoolProfiles?.save;
      const message =
        payload?.error?.message ||
        (Array.isArray(errors) ? errors[0]?.message : errors?.message);

      if (message) return { ok: false, message };

      const profile = payload?.result?.profile;
      // No profile and no message either: nothing came back, so nothing was
      // saved. Success is the one thing this cannot report.
      if (!profile) return { ok: false, message: 'The pool could not be saved' };

      // Refreshing the list is housekeeping — a save that already happened must
      // not be reported as failed because the list could not be reread.
      await refetch().catch(() => {});
      return { ok: true, profile };
    },
    [saveMutation, refetch]
  );

  return { profiles, loading, save, refetch };
};

export default usePoolProfiles;
