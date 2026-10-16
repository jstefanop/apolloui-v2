import { reportFailure } from './reportFailure';

describe('reportFailure', () => {
  it('says nothing for a call that went through', () => {
    const dispatch = jest.fn();
    expect(reportFailure(dispatch, { data: { Solo: { start: { success: true, error: null } } } })).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('reports a refused service command with the id of its localised text', () => {
    const dispatch = jest.fn();
    const result = {
      data: {
        Solo: { start: { success: false, error: { message: 'Could not start the solo pool', type: 'SERVICE_COMMAND_FAILED', path: 'solo.start' } } },
      },
    };
    expect(reportFailure(dispatch, result)).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].payload).toMatchObject({
      messageId: 'service_error.solo.start',
      type: 'error',
    });
  });

  it('reports any other failure by its message', () => {
    const dispatch = jest.fn();
    expect(reportFailure(dispatch, { data: null, errors: [{ message: 'nope' }] })).toBe(true);
    expect(dispatch.mock.calls[0][0].payload).toMatchObject({ message: 'nope', messageId: null });
  });
});
