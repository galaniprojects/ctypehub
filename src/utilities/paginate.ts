import type { Page } from 'astro';

import { generatePath, paths } from '../paths';
import { CType } from '../models/ctype';

const limit = 10;

export async function paginate(page: string): Promise<Page<CType>> {
  const total = await CType.count();

  const lastPage = Math.floor(total / limit);

  const currentPage = Number(page);

  const offset = total - currentPage * limit;

  const data =
    currentPage >= lastPage
      ? []
      : await CType.findAll({
          offset,
          limit,
          order: [['createdAt', 'DESC']],
        });

  const path = paths.ctypes;

  const current = generatePath(path, String(currentPage));
  const prev =
    currentPage === 1 ? undefined : generatePath(path, String(currentPage - 1));
  const next =
    currentPage === lastPage - 1
      ? paths.home
      : generatePath(path, String(currentPage + 1));

  return {
    data,
    start: offset,
    end: offset + (data.length - 1),
    total,
    currentPage,
    size: limit,
    lastPage,
    url: {
      current,
      prev,
      next,
    },
  };
}

export async function getLatest(): Promise<Page<CType>> {
  const total = await CType.count();
  const lastPage = Math.floor(total / limit);
  const totalPaginated = (lastPage - 1) * limit;

  const size = total - totalPaginated;

  const data = await CType.findAll({
    limit: size,
    order: [['createdAt', 'DESC']],
  });

  const current = paths.home;

  return {
    data,
    start: 0,
    end: data.length - 1,
    total,
    currentPage: lastPage,
    lastPage,
    size,
    url: {
      current,
      next: undefined,
      prev:
        lastPage === 1
          ? undefined
          : generatePath(paths.ctypes, String(lastPage - 1)),
    },
  };
}
