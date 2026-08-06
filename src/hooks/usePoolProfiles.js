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
      const { data: saved, errors } = await saveMutation({ variables: { input } });
      const payload = saved?.PoolProfiles?.save;
      const message = payload?.error?.message || errors?.[0]?.message;

      if (message) return { ok: false, message };

      await refetch();
      return { ok: true, profile: payload?.result?.profile };
    },
    [saveMutation, refetch]
  );

  return { profiles, loading, save, refetch };
};

export default usePoolProfiles;
