import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { getMinerHashboardType, getNodeErrorMessage } from './utils';

describe('getMinerHashboardType (internal vs USB hashboard)', () => {
  it('serial ttyS1 → Internal', () => {
    renderWithProviders(<div>{getMinerHashboardType('/dev/ttyS1')}</div>);
    expect(screen.getByText(/Internal/)).toBeInTheDocument();
  });
  it('USB (ttyACM) → External', () => {
    renderWithProviders(<div>{getMinerHashboardType('/dev/ttyACM0')}</div>);
    expect(screen.getByText(/External/)).toBeInTheDocument();
  });
});

describe('getNodeErrorMessage (error → message/type)', () => {
  // intl omitted → getMessage returns the message id, easy to assert.
  it('no error → null sentence, warning', () => {
    expect(getNodeErrorMessage([], null)).toEqual({ sentence: null, type: 'warning' });
  });
  it('ECONNREFUSED → connection_refused', () => {
    expect(getNodeErrorMessage([{ code: 'ECONNREFUSED' }], null).sentence).toBe('node.error.connection_refused');
  });
  it('code -28 (warmup) → starting_up, info', () => {
    const r = getNodeErrorMessage([{ code: -28 }], null);
    expect(r.sentence).toBe('node.error.starting_up');
    expect(r.type).toBe('info');
  });
  it('authentication type → waiting_response, info', () => {
    const r = getNodeErrorMessage([{ type: 'authentication' }], null);
    expect(r.sentence).toBe('node.error.waiting_response');
    expect(r.type).toBe('info');
  });
});
