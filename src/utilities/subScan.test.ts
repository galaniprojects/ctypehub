import { beforeEach, describe, expect, it, vi } from 'vitest';

import { got } from 'got';

import { ConfigService, type connect } from '@kiltprotocol/sdk-js';

import {
  getEvents,
  subScanEventGenerator,
  type EventsListJSON,
  type EventsParamsJSON,
} from './subScan';
import { configuration } from './configuration';

const api = {
  query: {
    system: {
      number: () => ({ toNumber: () => 12345 }),
    },
  },
} as unknown as Awaited<ReturnType<typeof connect>>;
ConfigService.set({ api });

let postResponse: EventsListJSON | EventsParamsJSON;
vi.mock('got', () => ({
  got: {
    post: vi.fn().mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      json: () => postResponse,
    }),
  },
}));

beforeEach(() => {
  vi.mocked(got.post).mockClear();
});

const module = 'ctype';
const eventId = 'CTypeCreated';

describe('subScan', () => {
  describe('getEvents', () => {
    it('should query the subscan API', async () => {
      postResponse = { data: { count: 0, events: null } };

      await getEvents({
        module,
        eventId,
        fromBlock: 10,
        page: 0,
        row: 0,
      });

      expect(got.post).toHaveBeenCalledWith(
        'https://example.api.subscan.io/api/v2/scan/events',
        {
          headers: { 'X-API-Key': configuration.subscan.secret },
          json: {
            module,
            event_id: eventId,
            block_range: '10-100010',
            order: 'asc',
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
        eventId,
        fromBlock: 10,
        page: 0,
        row: 0,
      });

      expect(cTypeEvents.count).toBe(0);
      expect(cTypeEvents.events).toBeUndefined();
    });
  });

  describe('subScanEventGenerator', () => {
    it('should iterate through pages in reverse order', async () => {
      postResponse = { data: { count: 200, events: [] } };

      const eventGenerator = subScanEventGenerator(
        module,
        eventId,
        0,
        async (events) => events,
      );

      for await (const event of eventGenerator) {
        expect(event).toBeDefined();
      }

      expect(got.post).toHaveBeenCalledTimes(6);
      const { calls } = vi.mocked(got.post).mock;

      // get count
      expect(calls[0][1]).toMatchObject({ json: { page: 0, row: 1 } });

      // get last page
      expect(calls[2][1]).toMatchObject({ json: { page: 1, row: 100 } });

      // get first page
      expect(calls[4][1]).toMatchObject({ json: { page: 0, row: 100 } });
    });
  });
  it('should get events in batches if current block is higher than block range', async () => {
    const api = {
      query: {
        system: {
          number: () => ({ toNumber: () => 150000 }),
        },
      },
    } as unknown as Awaited<ReturnType<typeof connect>>;
    ConfigService.set({ api });

    postResponse = { data: { count: 100, events: [] } };

    const eventGenerator = subScanEventGenerator(
      module,
      eventId,
      0,
      async (events) => events,
    );

    for await (const event of eventGenerator) {
      expect(event).toBeDefined();
    }

    expect(got.post).toHaveBeenCalledTimes(8);
    const { calls } = vi.mocked(got.post).mock;

    expect(calls[3][1]).toMatchObject({
      json: { block_range: '100000-200000', page: 0, row: 100 },
    });
  });
});
