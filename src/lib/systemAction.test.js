import { runSystemAction } from './systemAction';

const ok = (domain, op) => ({ data: { [domain]: { [op]: { error: null } } } });
const refused = (domain, op, path) => ({
  data: { [domain]: { [op]: { error: { message: 'Could not x', type: 'SERVICE_COMMAND_FAILED', path } } } },
});
const feedbackOf = (dispatch) =>
  dispatch.mock.calls.map(([a]) => a).filter((a) => a.type === 'feedback/sendFeedback');

const SERVICE_ACTIONS = [
  ['stopMiner', 'Miner', 'stop'],
  ['startMiner', 'Miner', 'start'],
  ['restartMiner', 'Miner', 'restart'],
  ['stopNode', 'Node', 'stop'],
  ['startNode', 'Node', 'start'],
  ['stopSolo', 'Solo', 'stop'],
  ['startSolo', 'Solo', 'start'],
  ['restartSolo', 'Solo', 'restart'],
];

describe('runSystemAction on a service', () => {
  it.each(SERVICE_ACTIONS)('%s that succeeds adds no message of its own', async (action, domain, op) => {
    const dispatch = jest.fn();
    await runSystemAction({ dispatch, action, call: async () => ok(domain, op), title: 't', description: 'd' });
    // StatusTransitionFeedback announces it from the service status.
    expect(feedbackOf(dispatch)).toEqual([]);
    // The rest of the bookkeeping still happens.
    expect(dispatch.mock.calls.some(([a]) => a.type.startsWith('minerAction/'))).toBe(true);
  });

  it.each(SERVICE_ACTIONS)('%s that is refused gives exactly one localised error', async (action, domain, op) => {
    const dispatch = jest.fn();
    const path = `${domain.toLowerCase()}.${op}`;
    const done = await runSystemAction({
      dispatch,
      action,
      call: async () => refused(domain, op, path),
      title: 't',
      description: 'd',
    });
    expect(done).toBe(false);
    const sent = feedbackOf(dispatch);
    expect(sent).toHaveLength(1);
    expect(sent[0].payload).toMatchObject({ type: 'error', messageId: `service_error.${path}` });
    // The service did not start or stop: nothing records that it did.
    expect(dispatch.mock.calls.some(([a]) => a.type.startsWith('minerAction/'))).toBe(false);
  });
});

describe('runSystemAction on reboot and shutdown', () => {
  it.each(['rebootMcu', 'shutdownMcu'])('%s is announced at once, without waiting for an answer', async (action) => {
    const dispatch = jest.fn();
    // The connection drops with the system: the call never answers.
    await runSystemAction({ dispatch, action, call: () => new Promise(() => {}), title: 'Rebooting', description: 'wait' });
    const sent = feedbackOf(dispatch);
    expect(sent).toHaveLength(1);
    expect(sent[0].payload).toMatchObject({ message: 'Rebooting - wait', type: 'success' });
  });
});
