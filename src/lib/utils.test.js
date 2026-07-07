import { isValidBitcoinAddress, isCompatibleBitcoinAddress } from './utils';
import { render, screen } from '@testing-library/react';

// Synthetic addresses that hit the exact length branches of the validators.
const bech32 = (len) => 'bc1q' + 'a'.repeat(len - 4); // bc1q...  (P2WPKH=42, P2WSH=62)
const taproot = (len) => 'bc1p' + 'a'.repeat(len - 4); // bc1p...  (P2TR=62)
const LEGACY = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';

describe('isValidBitcoinAddress', () => {
  it('accepts a legacy P2PKH address', () => {
    expect(isValidBitcoinAddress(LEGACY)).toBe(true);
  });
  it('accepts a bech32 P2WPKH address', () => {
    expect(isValidBitcoinAddress(bech32(42))).toBe(true);
  });
  it('rejects garbage', () => {
    expect(isValidBitcoinAddress('not-an-address')).toBe(false);
  });
  it('accepts an alphanumeric worker suffix', () => {
    expect(isValidBitcoinAddress(`${bech32(42)}.worker1`)).toBe(true);
  });
  it('rejects a non-alphanumeric worker suffix', () => {
    expect(isValidBitcoinAddress(`${bech32(42)}.bad!`)).toBe(false);
  });
});

describe('isCompatibleBitcoinAddress (solo mining payout)', () => {
  it('P2WPKH bc1q (42) is compatible', () => {
    expect(isCompatibleBitcoinAddress(bech32(42))).toBe(true);
  });
  it('P2WSH bc1q (62) is NOT compatible', () => {
    expect(isCompatibleBitcoinAddress(bech32(62))).toBe(false);
  });
  it('P2TR bc1p (62) is NOT compatible', () => {
    expect(isCompatibleBitcoinAddress(taproot(62))).toBe(false);
  });
  it('legacy address is treated as compatible', () => {
    expect(isCompatibleBitcoinAddress(LEGACY)).toBe(true);
  });
});

describe('RTL smoke', () => {
  it('renders a component into jsdom', () => {
    render(<div>hello apollo</div>);
    expect(screen.getByText('hello apollo')).toBeInTheDocument();
  });
});
