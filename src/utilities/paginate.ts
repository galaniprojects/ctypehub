import type { Page } from 'astro';
import type { Attributes, Includeable, WhereOptions } from 'sequelize';

import { CType } from '../models/ctype';

export async function paginate(
  url: URL,
  where?: WhereOptions<Attributes<CType>>,
  include?: Includeable | Includeable[],
  pageLimit = 10,
): Promise<Page<CType>> {
  const page = url.searchParams.get('page');

  const isHomePage = !page || !Number.isInteger(Number(page));

  const total = await CType.count({ where });
  const lastPage = Math.floor(total / pageLimit);

  const currentPage = isHomePage ? lastPage : Number(page);
  const offset = isHomePage ? 0 : total - currentPage * pageLimit;
  const totalPaginated = Math.max(lastPage - 1, 0) * pageLimit;
  const size = isHomePage ? total - totalPaginated : pageLimit;

  const start = total - offset;
  const end = start - (size - 1);

  const data =
    currentPage > lastPage
      ? []
      : await CType.scope('stats').findAll({
          offset,
          limit: size,
          order: [['createdAt', 'DESC']],
          where,
          include,
        });

  const current = url.toString();

  const next = (() => {
    if (isHomePage) {
      return undefined;
    }
    if (currentPage > lastPage) {
      return undefined;
    }
    if (currentPage < 1) {
      return undefined;
    }
    const next = new URL(current);
    if (currentPage === lastPage - 1) {
      next.searchParams.delete('page');
      return next.toString();
    }
    next.searchParams.set('page', String(currentPage + 1));
    return next.toString();
  })();

  const prev = (() => {
    if (isHomePage && lastPage <= 1) {
      return undefined;
    }
    if (currentPage > lastPage) {
      return undefined;
    }
    if (currentPage <= 1) {
      return undefined;
    }

    const prev = new URL(current);
    prev.searchParams.set('page', String(currentPage - 1));
    return prev.toString();
  })();

  return {
    data,
    start,
    end,
    total,
    currentPage,
    size,
    lastPage,
    url: {
      current,
      prev,
      next,
    },
  };
}
