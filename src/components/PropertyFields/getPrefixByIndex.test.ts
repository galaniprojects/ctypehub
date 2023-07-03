import { describe, it, expect } from 'vitest';

import { getPrefixByIndex } from './getPrefixByIndex';

describe('getPrefixByIndex', () => {
  it('should return a proper prefix', async () => {
    expect(getPrefixByIndex(0)).toBe('property[0].');
    expect(getPrefixByIndex(5)).toBe('property[5].');
  });
});
