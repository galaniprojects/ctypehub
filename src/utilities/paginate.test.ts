import type { FindOptions } from 'sequelize';

import type { Page } from 'astro';

import { describe, it, vi, expect } from 'vitest';

import { CType } from '../models/ctype';

import { paginate } from './paginate';

vi.mock('../models/ctype', () => ({
  CType: {
    scope: vi.fn().mockReturnThis(),
    findAll: vi.fn(),
    count: vi.fn(),
  },
  groupForAttestationsCount: [],
}));

const baseUrl = process.env.URL as string;

vi.mocked(CType.findAll).mockImplementation(
  async <Model>({ limit }: FindOptions = {}) => {
    const data = new Array(limit);
    return data as Model[];
  },
);

describe('paginate', () => {
  it('should return the correct data for home page', async () => {
    vi.mocked(CType.count).mockResolvedValue(39);

    const url = new URL(baseUrl);

    const paginated = await paginate(url);

    expect(paginated).toMatchObject<Page<CType>>({
      data: new Array(19),
      start: 39,
      end: 21,
      total: 39,
      currentPage: 3,
      size: 19,
      lastPage: 3,
      url: {
        current: baseUrl,
        prev: `${baseUrl}?page=2`,
        next: undefined,
      },
    });
  });

  it('should return the correct data for a page number', async () => {
    vi.mocked(CType.count).mockResolvedValue(39);

    const url = new URL(baseUrl);
    url.searchParams.set('page', '2');

    const paginated = await paginate(url);

    expect(paginated).toMatchObject<Page<CType>>({
      data: new Array(10),
      start: 20,
      end: 11,
      total: 39,
      currentPage: 2,
      size: 10,
      lastPage: 3,
      url: {
        current: `${baseUrl}?page=2`,
        prev: `${baseUrl}?page=1`,
        next: baseUrl,
      },
    });
  });

  it('should not change static page data when total data size increases', async () => {
    vi.mocked(CType.count).mockResolvedValue(49);

    const url = new URL(baseUrl);
    url.searchParams.set('page', '2');

    const before = await paginate(url);

    vi.mocked(CType.count).mockResolvedValue(123);

    const after = await paginate(url);

    expect(before.total).not.toBe(after.total);
    expect(before.lastPage).not.toBe(after.lastPage);

    expect(before.data.length).toBe(after.data.length);
    expect(before.start).toBe(after.start);
    expect(before.end).toBe(after.end);
    expect(before.size).toBe(after.size);
    expect(before.url).toEqual(after.url);
  });

  it('should not return data if the page does not exist', async () => {
    vi.mocked(CType.count).mockResolvedValue(49);
    const url = new URL(baseUrl);
    url.searchParams.set('page', '34');

    const { data } = await paginate(url);

    expect(data).toHaveLength(0);
  });

  it('should return data if the number of total entries is less than the page limit', async () => {
    vi.mocked(CType.count).mockResolvedValue(6);
    const url = new URL(baseUrl);

    const paginated = await paginate(url);

    expect(paginated).toMatchObject<Page<CType>>({
      data: new Array(6),
      start: 6,
      end: 1,
      total: 6,
      currentPage: 0,
      size: 6,
      lastPage: 0,
      url: {
        current: baseUrl,
        prev: undefined,
        next: undefined,
      },
    });
  });
});
