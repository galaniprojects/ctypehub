import { describe, it, expect, vi } from 'vitest';

import { parseNumbersList } from './parseNumbersList';

describe('parseNumbersList', () => {
  it('should handle undefined', async () => {
    expect(parseNumbersList(undefined, parseInt)).toBeUndefined();
    expect(parseNumbersList(undefined, parseFloat)).toBeUndefined();
  });
  it('should parse the list of integers', async () => {
    expect(parseNumbersList('1,2,3,4,5', parseInt)).toEqual([1, 2, 3, 4, 5]);
    expect(parseNumbersList('1.2,3.4,5', parseInt)).toEqual([1, 3, 5]);
  });
  it('should parse the list of floats', async () => {
    expect(parseNumbersList('1.2,3.4,5', parseFloat)).toEqual([1.2, 3.4, 5]);
  });
  it('should throw when detecting not a number', async () => {
    globalThis.alert = vi.fn();
    expect(() => parseNumbersList('1,a,2', parseInt)).toThrow(
      /Cannot parse as list of numbers/,
    );
    expect(() => parseNumbersList('1,a,2', parseFloat)).toThrow(
      /Cannot parse as list of numbers/,
    );
  });
});
