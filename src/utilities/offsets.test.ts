import { describe, it, expect } from 'vitest';

import { offsets } from './offsets';

describe('offsets', () => {
  it('should generate the list of offsets', async () => {
    expect(offsets(1)).toEqual([0]);
    expect(offsets(5)).toEqual([0, 1, 2, 3, 4]);
  });
});
