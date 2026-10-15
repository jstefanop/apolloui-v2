import { callFailure, runSteps } from './callFailure';

const ok = (domain, op) => ({ data: { [domain]: { [op]: { result: {}, error: null } } } });
const gqlError = (message) => ({ data: null, errors: [{ message }] });
const payloadError = (domain, op, message) => ({
  data: { [domain]: { [op]: { result: null, error: { message } } } },
});

describe('callFailure', () => {
  it('passes a clean response', () => {
    expect(callFailure(ok('Pool', 'update'))).toBeNull();
  });

  it('reads GraphQL errors, which errorPolicy all leaves in errors with data null', () => {
    expect(callFailure(gqlError('Invalid pool'))).toBe('Invalid pool');
  });

  it('reads an ApolloError in error', () => {
    expect(callFailure({ data: undefined, error: new Error('Failed to fetch') })).toBe('Failed to fetch');
  });

  it('reads an ApolloError handed back in errors', () => {
    expect(callFailure({ data: null, errors: new Error('Socket closed') })).toBe('Socket closed');
  });

  it('reads the resolver payload error', () => {
    expect(callFailure(payloadError('Auth', 'changePassword', 'Bad password'))).toBe('Bad password');
  });

  it('is not a success when nothing came back', () => {
    expect(callFailure(undefined)).toBeTruthy();
    expect(callFailure({ data: null })).toBeTruthy();
  });
});

// Each save path of the settings page, in the order the page runs it.
describe.each([
  ['settings', 'Settings', 'update'],
  ['pools', 'Pool', 'update'],
  ['password', 'Auth', 'changePassword'],
])('a save whose %s step fails', (name, domain, op) => {
  const stepsWith = (failure, after) => [
    { name: 'settings', run: async () => (name === 'settings' ? failure : ok('Settings', 'update')) },
    { name: 'pools', run: async () => (name === 'pools' ? failure : ok('Pool', 'update')) },
    { name: 'password', run: async () => (name === 'password' ? failure : ok('Auth', 'changePassword')) },
    { name: 'after', run: after },
  ];

  it.each([
    ['a GraphQL error', gqlError('Refused')],
    ['a payload error', payloadError(domain, op, 'Refused')],
    ['a transport error', { data: null, error: new Error('Refused') }],
  ])('stops on %s: nothing after it runs', async (_label, failure) => {
    const after = jest.fn();
    const out = await runSteps(stepsWith(failure, after));
    expect(out).toEqual({ ok: false, step: name, message: 'Refused' });
    expect(after).not.toHaveBeenCalled();
  });

  it('a thrown call is a failure too', async () => {
    const after = jest.fn();
    const steps = stepsWith(ok(domain, op), after);
    steps.find((s) => s.name === name).run = async () => {
      throw new Error('boom');
    };
    expect(await runSteps(steps)).toEqual({ ok: false, step: name, message: 'boom' });
    expect(after).not.toHaveBeenCalled();
  });
});

it('runs every step when all succeed', async () => {
  const after = jest.fn().mockResolvedValue(ok('Miner', 'restart'));
  const out = await runSteps([
    { name: 'settings', run: async () => ok('Settings', 'update') },
    { name: 'after', run: after },
  ]);
  expect(out).toEqual({ ok: true });
  expect(after).toHaveBeenCalledTimes(1);
});

// The restore is two writes in a row, like the save.
it('a restore stops after a failed settings write', async () => {
  const savePools = jest.fn();
  const out = await runSteps([
    { name: 'settings', run: async () => gqlError('Invalid settings') },
    { name: 'pools', run: savePools },
  ]);
  expect(out.ok).toBe(false);
  expect(savePools).not.toHaveBeenCalled();
});
