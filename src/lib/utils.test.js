import { isValidBitcoinAddress, isCompatibleBitcoinAddress, calculateWattsPerTh, fitTextSize, bytesPairToSize } from './utils';
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

describe('fitTextSize', () => {
  const cqiOf = (value) => Number(value.match(/([\d.]+)cqi/)[1]);

  // The two failures that brought this in: John does not want the digits cut
  // off with an ellipsis, and the number must not wrap onto a second line.
  it('gives a longer string a smaller share of the container', () => {
    expect(cqiOf(fitTextSize(13))).toBeLessThan(cqiOf(fitTextSize(6)));
  });

  it('leaves room for the padding around the text', () => {
    // 13 characters at this size occupy under the full container width.
    const cqi = cqiOf(fitTextSize(13));
    expect(13 * 0.62 * cqi).toBeLessThan(100);
  });

  // The bounds are part of the clamp() string whatever the input, so asserting
  // on the text proves nothing. What matters is the number between them.
  it('asks for more than the container when there is little to draw', () => {
    // One character would happily take the whole card; the ceiling holds it.
    expect(cqiOf(fitTextSize(1))).toBeGreaterThan(100);
    expect(fitTextSize(1)).toContain('5rem)');
  });

  it('asks for almost nothing when there is far too much', () => {
    // 200 characters cannot fit at any readable size; the floor holds it.
    expect(cqiOf(fitTextSize(200))).toBeLessThan(1);
    expect(fitTextSize(200)).toContain('clamp(1.1rem,');
  });

  it('keeps a scaled line subordinate to the one above it', () => {
    expect(cqiOf(fitTextSize(13, { scale: 0.62 }))).toBeLessThan(cqiOf(fitTextSize(13)));
  });

  it('does not divide by nothing', () => {
    expect(() => fitTextSize(0)).not.toThrow();
    expect(() => fitTextSize(undefined)).not.toThrow();
    expect(cqiOf(fitTextSize(0))).toBeGreaterThan(0);
  });
});

describe('bytesPairToSize', () => {
  const GB = 1024 ** 3;
  const TB = 1024 ** 4;

  // The reason it exists: formatted separately these became "500/4 TB", which
  // reads as five hundred terabytes of four.
  it('puts both figures in the unit the total would choose', () => {
    expect(bytesPairToSize(500 * GB, 4 * TB)).toEqual({
      part: '0.5',
      total: '4 TB',
      unit: null,
    });
  });

  it('keeps a pair that already shares a unit as it was', () => {
    expect(bytesPairToSize(373 * GB, 932 * GB)).toEqual({
      part: '373',
      total: '932 GB',
      unit: null,
    });
  });

  // A nearly full disk rendered as "0.0" is indistinguishable from a reading we
  // do not have — and that is the moment the number matters most.
  it('gives each figure its own unit when they are far apart', () => {
    expect(bytesPairToSize(3 * GB, 4 * TB)).toEqual({
      part: '3 GB',
      total: '4 TB',
      unit: null,
    });
  });

  it('says nothing when it has nothing to say', () => {
    expect(bytesPairToSize(null, 4 * TB)).toBeNull();
    expect(bytesPairToSize(100, 0)).toBeNull();
    expect(bytesPairToSize(undefined, undefined)).toBeNull();
  });
});
