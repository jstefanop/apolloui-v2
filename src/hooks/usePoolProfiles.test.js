import { renderHook } from '@testing-library/react';
import usePoolProfiles from './usePoolProfiles';

// What `save` reports back, because the settings page acts on it: a green toast
// and a cleared toggle for {ok:true}, so anything short of a profile coming back
// has to say so.
let mutationResult;
let refetch;

jest.mock('@apollo/client', () => ({
  // The documents are never parsed here, only handed to the mocked hooks.
  gql: () => ({}),
  useQuery: () => ({ data: undefined, loading: false, refetch: (...args) => refetch(...args) }),
  useMutation: () => [() => Promise.resolve(mutationResult)],
}));

const saved = (profile) => ({
  data: { PoolProfiles: { save: { result: { profile }, error: null } } },
});

const run = () => renderHook(() => usePoolProfiles()).result.current;

describe('usePoolProfiles.save', () => {
  beforeEach(() => {
    refetch = jest.fn().mockResolvedValue({});
  });

  it('keeps the profile the device returned', async () => {
    mutationResult = saved({ id: 1, name: 'Ocean home' });

    await expect(run().save({ name: 'Ocean home' })).resolves.toEqual({
      ok: true,
      profile: { id: 1, name: 'Ocean home' },
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('reports the error field of a rejected save', async () => {
    mutationResult = {
      data: { PoolProfiles: { save: { result: null, error: { message: 'disk is full' } } } },
    };

    await expect(run().save({})).resolves.toEqual({ ok: false, message: 'disk is full' });
  });

  // The one that made an unreachable device look like a saved pool: with
  // `onError` given, useMutation hands back the ApolloError itself — not an
  // array — so `errors[0]` was always undefined and the hook said ok.
  it('reports a transport failure, which arrives as an error object', async () => {
    mutationResult = { data: undefined, errors: new Error('Failed to fetch') };

    await expect(run().save({})).resolves.toEqual({
      ok: false,
      message: 'Failed to fetch',
    });
  });

  it('still reads the array shape of GraphQL errors', async () => {
    mutationResult = { data: null, errors: [{ message: 'Bad input' }] };

    await expect(run().save({})).resolves.toEqual({ ok: false, message: 'Bad input' });
  });

  it('refuses to call an empty answer a save', async () => {
    mutationResult = { data: undefined };

    const result = await run().save({});
    expect(result.ok).toBe(false);
    expect(result.message).toBeTruthy();
    expect(refetch).not.toHaveBeenCalled();
  });

  // Rereading the list is housekeeping: the save already happened, and the
  // rejection used to escape into the caller and skip the miner restart.
  it('does not fail, or throw, when the list cannot be reread', async () => {
    mutationResult = saved({ id: 2, name: 'Rented' });
    refetch = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(run().save({})).resolves.toMatchObject({ ok: true });
  });
});
