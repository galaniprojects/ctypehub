import type { FindOptions } from 'sequelize';

import { describe, it, jest } from '@jest/globals';

import { CType } from '../models/ctype';

import { paginate } from './paginate';

jest.mock('../models/ctype');

const baseUrl = process.env.URL as string;

jest
  .mocked(CType.findAll)
  .mockImplementation(async <M>({ limit }: FindOptions) => {
    const data = new Array(limit);
    return Promise.resolve(data as M[]);
  });

describe('paginate', () => {
  it('should return the correct data for home page', async () => {
    jest.mocked(CType.count).mockResolvedValue(39);

    const url = new URL(baseUrl);

    const {
      data,
      start,
      end,
      total,
      currentPage,
      size,
      lastPage,
      url: { current, prev, next },
    } = await paginate(url);

    expect(data).toHaveLength(19);
    expect(start).toBe(39);
    expect(end).toBe(21);
    expect(total).toBe(39);
    expect(currentPage).toBe(3);
    expect(size).toBe(19);
    expect(lastPage).toBe(3);
    expect(current).toBe(baseUrl);
    expect(prev).toBe(`${baseUrl}?page=2`);
    expect(next).toBeUndefined();
  });

  it('should return the correct data for a page number', async () => {
    jest.mocked(CType.count).mockResolvedValue(39);

    const url = new URL(baseUrl);
    url.searchParams.set('page', '2');

    const {
      data,
      start,
      end,
      total,
      currentPage,
      size,
      lastPage,
      url: { current, prev, next },
    } = await paginate(url);

    expect(data).toHaveLength(10);
    expect(start).toBe(20);
    expect(end).toBe(11);
    expect(total).toBe(39);
    expect(currentPage).toBe(2);
    expect(size).toBe(10);
    expect(lastPage).toBe(3);
    expect(current).toBe(`${baseUrl}?page=2`);
    expect(prev).toBe(`${baseUrl}?page=1`);
    expect(next).toBe(baseUrl);
  });

  it('should not change static page data when total data size increases', async () => {
    jest.mocked(CType.count).mockResolvedValue(49);

    const url = new URL(baseUrl);
    url.searchParams.set('page', '2');

    const before = await paginate(url);

    jest.mocked(CType.count).mockResolvedValue(123);

    const after = await paginate(url);

    expect(before.total).not.toBe(after.total);
    expect(before.lastPage).not.toBe(after.lastPage);

    expect(before.data.length).toBe(after.data.length);
    expect(before.start).toBe(after.start);
    expect(before.end).toBe(after.end);
    expect(before.size).toBe(after.size);
    expect(before.url).toEqual(after.url);

    jest.mocked(CType.count).mockResolvedValue(123);
  });

  it('should not return data if the page does not exist', async () => {
    jest.mocked(CType.count).mockResolvedValue(49);
    const url = new URL(baseUrl);
    url.searchParams.set('page', '34');

    const { data } = await paginate(url);

    expect(data).toHaveLength(0);
  });

  it('should return data if the number of total entries is less than the page limit', async () => {
    jest.mocked(CType.count).mockResolvedValue(6);
    const url = new URL(baseUrl);

    const {
      data,
      start,
      end,
      total,
      currentPage,
      size,
      lastPage,
      url: { current, prev, next },
    } = await paginate(url);

    expect(data).toHaveLength(6);
    expect(start).toBe(6);
    expect(end).toBe(1);
    expect(total).toBe(6);
    expect(currentPage).toBe(0);
    expect(size).toBe(6);
    expect(lastPage).toBe(0);
    expect(current).toBe(baseUrl);
    expect(prev).toBeUndefined();
    expect(next).toBeUndefined();
  });
});
