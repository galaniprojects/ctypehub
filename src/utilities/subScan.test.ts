import { beforeEach, describe, expect, it, vi } from 'vitest';

import { got } from 'got';

import {
  EventsResponseJson,
  getEvents,
  subScanEventGenerator,
} from './subScan';
import { configuration } from './configuration';

let postResponse: EventsResponseJson;
vi.mock('got', () => ({
  got: {
    post: vi.fn().mockReturnValue({
      json: () => postResponse,
    }),
  },
}));

beforeEach(() => {
  vi.mocked(got.post).mockClear();
});

const module = 'ctype';
const call = 'CTypeCreated';

describe('subScan', () => {
  describe('getEvents', () => {
    it('should query the subscan API', async () => {
      postResponse = { data: { count: 0, events: null } };

      await getEvents({
        module,
        call,
        fromBlock: 10,
        page: 0,
        row: 0,
      });

      expect(got.post).toHaveBeenCalledWith(
        'https://example.api.subscan.io/api/scan/events',
        {
          headers: { 'X-API-Key': configuration.subscan.secret },
          json: {
            module,
            call,
            from_block: 10,
            page: 0,
            row: 0,
            finalized: true,
          },
        },
      );
    });

    it('should return the count when no events exist', async () => {
      postResponse = { data: { count: 0, events: null } };

      const cTypeEvents = await getEvents({
        module,
        call,
        fromBlock: 10,
        page: 0,
        row: 0,
      });

      expect(cTypeEvents.count).toBe(0);
      expect(cTypeEvents.events).toBeUndefined();
    });

    it('should return parsed events in reverse order', async () => {
      postResponse = {
        data: {
          count: 2,
          events: [
            {
              params: '[{ "fake": "JSON" }]',
              block_num: 123,
              block_timestamp: 123_456,
              extrinsic_hash: '0xCAFECAFE',
            },
            {
              params: '[{ "JSON": "fake" }]',
              block_num: 789,
              block_timestamp: 789_123,
              extrinsic_hash: '0xFACEFACE',
            },
          ],
        },
      };

      const cTypeEvents = await getEvents({
        module,
        call,
        fromBlock: 10,
        page: 0,
        row: 0,
      });

      expect(cTypeEvents.count).toBe(2);
      expect(cTypeEvents.events).toEqual([
        {
          params: [{ JSON: 'fake' }],
          block: 789,
          blockTimestampMs: 789_123_000,
          extrinsicHash: '0xFACEFACE',
        },
        {
          params: [{ fake: 'JSON' }],
          block: 123,
          blockTimestampMs: 123_456_000,
          extrinsicHash: '0xCAFECAFE',
        },
      ]);
    });
  });

  describe('subScanEventGenerator', () => {
    it('should iterate through pages in reverse order', async () => {
      postResponse = { data: { count: 200, events: [] } };

      const eventGenerator = subScanEventGenerator(module, call, 0);

      for await (const event of eventGenerator) {
        expect(event).toBeDefined();
      }

      expect(got.post).toHaveBeenCalledTimes(3);
      const { calls } = vi.mocked(got.post).mock;

      // get count
      expect(calls[0][1]).toMatchObject({ json: { page: 0, row: 1 } });

      // get last page
      expect(calls[1][1]).toMatchObject({ json: { page: 1, row: 100 } });

      // get first page
      expect(calls[2][1]).toMatchObject({ json: { page: 0, row: 100 } });
    });

    it('should yield events in reverse order', async () => {
      vi.mocked(got.post)
        .mockReturnValueOnce({
          // @ts-expect-error but the code doesn’t care about the other members
          json: () => ({ data: { count: 200 } }),
        })
        .mockReturnValueOnce({
          // @ts-expect-error but the code doesn’t care about the other members
          json: () => ({
            data: {
              count: 200,
              events: [
                {
                  block_timestamp: 1,
                  params: '"JSON"',
                  extrinsic_hash: '0xCAFECAFE',
                },
                {
                  block_timestamp: 0,
                  params: '"JSON"',
                  extrinsic_hash: '0xFACEFACE',
                },
              ],
            },
          }),
        })
        .mockReturnValueOnce({
          // @ts-expect-error but the code doesn’t care about the other members
          json: () => ({
            data: {
              count: 200,
              events: [
                {
                  block_timestamp: 3,
                  params: '"JSON"',
                  extrinsic_hash: '0xCAFECAFE',
                },
                {
                  block_timestamp: 2,
                  params: '"JSON"',
                  extrinsic_hash: '0xFACEFACE',
                },
              ],
            },
          }),
        });

      const eventGenerator = subScanEventGenerator(module, call, 0);

      const events = [];
      for await (const event of eventGenerator) {
        events.push(event);
      }

      const timestamps = events.map(({ blockTimestampMs }) => blockTimestampMs);
      expect(timestamps).toEqual([0, 1000, 2000, 3000]);
    });
  });
});
