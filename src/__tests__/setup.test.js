import { fireEvent, screen, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import { useLazyQuery } from '@apollo/client';
import { renderWithProviders } from '../test-utils';
import Setup from '../pages/setup';

jest.mock('next/router', () => ({ useRouter: () => ({ reload: jest.fn() }) }));
jest.mock('../contexts/DeviceConfigContext', () => ({
  useDeviceConfig: () => ({ deviceType: 'solo-node' }),
}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(() => [jest.fn(), {}]),
}));

const VALID_ADDR = 'bc1q' + 'a'.repeat(38); // passes isValidBitcoinAddress

// Drive the solo-node wizard: Welcome -> Wallet (valid address) -> Password.
const gotoPasswordStep = async () => {
  renderWithProviders(<Setup />);
  fireEvent.click(screen.getByRole('button')); // Welcome "get started" -> wallet
  const walletInput = document.querySelector('input');
  fireEvent.change(walletInput, { target: { value: VALID_ADDR } });
  fireEvent.submit(walletInput.closest('form')); // valid address -> password step
  await waitFor(() => expect(document.querySelectorAll('input').length).toBe(2));
};

const submitPasswords = (pw, verify) => {
  const [pwInput, verifyInput] = document.querySelectorAll('input');
  fireEvent.change(pwInput, { target: { value: pw } });
  fireEvent.change(verifyInput, { target: { value: verify } });
  fireEvent.submit(pwInput.closest('form'));
};

describe('Setup wizard — password step validation (solo-node path)', () => {
  it('rejects a password shorter than 8 characters', async () => {
    await gotoPasswordStep();
    submitPasswords('123', '123');
    expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    await gotoPasswordStep();
    submitPasswords('longpass1', 'longpass2');
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('rejects an invalid wallet address on the wallet step', async () => {
    renderWithProviders(<Setup />);
    fireEvent.click(screen.getByRole('button')); // Welcome -> wallet
    const walletInput = document.querySelector('input');
    fireEvent.change(walletInput, { target: { value: 'not-a-btc-address' } });
    fireEvent.submit(walletInput.closest('form'));
    expect(await screen.findByText('Please add a valid Bitcoin address')).toBeInTheDocument();
    // stays on the wallet step (no password inputs yet)
    expect(document.querySelectorAll('input').length).toBe(1);
  });
});


// The wizard used to CREATE a pool, which left whatever was already configured
// in place. The miner config is built from the lowest priority first, so with
// two pools sharing priority 1 the older one won and the pool chosen here
// silently became the backup — the device kept mining to the previous pool.
// A factory-fresh device hid it: the only other pool sits at priority 99.
describe('Setup wizard — pools', () => {
  it('replaces the pool set rather than adding to it', () => {
    renderWithProviders(<Setup />);

    const documents = useLazyQuery.mock.calls
      .map(([document]) => (document ? print(document) : ''))
      .join('\n');

    expect(documents).toContain('updateAll');
    expect(documents).not.toContain('create (input: $input)');
  });
});
