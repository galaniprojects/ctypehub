import { describe, expect, it } from 'vitest';

import { getRequestJson } from './getRequestJson';

describe('getRequestJson', () => {
  it('should return the parsed JSON', async () => {
    const request = new Request('http://example.org/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    });
    const result = await getRequestJson(request);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should throw an error if the content type is not JSON', async () => {
    const request = new Request('http://example.org/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'foo',
    });
    await expect(getRequestJson(request)).rejects.toThrow(
      'Only JSON is accepted',
    );
  });
});
