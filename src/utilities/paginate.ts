import type { Page } from 'astro';

import { generatePath, paths } from '../paths';
import { CType } from '../models/ctype';

const limit = 10;

export async function paginate(page: string): Promise<Page<CType>> {
  const currentPage = Number(page);
  const total = await CType.count();
  const lastPage = Math.ceil(total / limit);

  const pageTooHigh = currentPage > lastPage;

  const offset = Math.max(total - currentPage * limit, 0);

  const data = pageTooHigh
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
    currentPage === lastPage
      ? undefined
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
