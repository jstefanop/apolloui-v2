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

describe('serviceFailureIdOf', () => {
  const { serviceFailureIdOf } = require('./callFailure');
  const refused = (service, action) => ({
    data: null,
    errors: [{ message: 'x', extensions: { code: 'SERVICE_COMMAND_FAILED', service, action } }],
  });

  it('finds the message id of a refused service command', () => {
    expect(serviceFailureIdOf(refused('node', 'stop'))).toBe('service_error.node.stop');
    expect(serviceFailureIdOf({ error: { graphQLErrors: refused('solo', 'start').errors } })).toBe(
      'service_error.solo.start'
    );
  });

  it('is null for any other failure', () => {
    expect(serviceFailureIdOf({ data: null, errors: [{ message: 'Invalid pool' }] })).toBeNull();
    expect(serviceFailureIdOf(undefined)).toBeNull();
  });
});

describe('serviceFailureIdOf, from the payload of start/stop/restart', () => {
  const { serviceFailureIdOf } = require('./callFailure');

  // Exactly what the resolvers answer for a refused command (errorPayload.js):
  // the code in `type`, "service.action" in `path`.
  const payload = (domain, op, path) => ({
    data: { [domain]: { [op]: { error: { message: 'Could not x', type: 'SERVICE_COMMAND_FAILED', path } } } },
  });

  it.each([
    ['Node', 'start', 'node.start', 'service_error.node.start'],
    ['Node', 'restart', 'node.restart', 'service_error.node.restart'],
    ['Miner', 'stop', 'miner.stop', 'service_error.miner.stop'],
    ['Solo', 'restart', 'solo.restart', 'service_error.solo.restart'],
  ])('%s.%s -> %s', (domain, op, path, id) => {
    expect(serviceFailureIdOf(payload(domain, op, path))).toBe(id);
  });

  it('is null for a payload error that is anything else', () => {
    expect(serviceFailureIdOf({ data: { Node: { start: { error: { message: 'boom' } } } } })).toBeNull();
    expect(serviceFailureIdOf(payload('Node', 'start', 'not a path'))).toBeNull();
  });

  it('every id it can produce exists in all four locales', () => {
    const { flattenMessages } = require('./utils');
    const locales = ['en', 'it', 'de', 'es'].map((l) => flattenMessages(require(`../locales/${l}.json`)));
    for (const service of ['miner', 'node', 'solo']) {
      for (const action of ['start', 'stop', 'restart']) {
        for (const messages of locales) expect(messages[`service_error.${service}.${action}`]).toBeTruthy();
      }
    }
  });
});
