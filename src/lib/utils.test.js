import { isValidBitcoinAddress, isCompatibleBitcoinAddress, calculateWattsPerTh } from './utils';
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

describe('calculateWattsPerTh', () => {
  // A miner that has just restarted — which happens on every settings change —
  // draws power before its averaging window has any hashrate in it. Dividing by
  // that zero produced Infinity, and CountUp renders Infinity as "NaN", so the
  // power card showed NaN every time a mode was switched.
  it('returns 0 while a restarting miner reports watts but no hashrate yet', () => {
    expect(calculateWattsPerTh(186.6, 0)).toBe(0);
  });

  it('computes the ratio once both numbers are real', () => {
    expect(calculateWattsPerTh(100, 8)).toBe(12.5);
  });

  it('never returns a value the UI cannot render', () => {
    const cases = [
      [NaN, 8], [100, NaN], [Infinity, 8], [100, Infinity],
      [null, 8], [100, null], [undefined, undefined],
      // globalHashrate is a { value, unit } object: a 0 value used to fall
      // through to the object itself, which divided watts by an object.
      [100, { value: 0, unit: 'H/s' }],
    ];
    for (const [watts, hashrate] of cases) {
      const result = calculateWattsPerTh(watts, hashrate);
      expect(Number.isFinite(result)).toBe(true);
    }
  });

  it('accepts numeric strings, which is how some stat fields arrive', () => {
    expect(calculateWattsPerTh('100', '8')).toBe(12.5);
  });
});
