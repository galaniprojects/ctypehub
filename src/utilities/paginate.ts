import type { Page } from 'astro';

import { paths } from '../paths';
import { CType } from '../models/ctype';

export async function paginate(url: URL, pageLimit = 10): Promise<Page<CType>> {
  const page = url.searchParams.get('page');

  const isHomePage = !page || !Number.isInteger(Number(page));

  const total = await CType.count();
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
      : await CType.findAll({
          offset,
          limit: size,
          order: [['createdAt', 'DESC']],
        });

  const current = url.toString();

  const next = () => {
    if (isHomePage) {
      return undefined;
    }
    if (currentPage === lastPage - 1) {
      return new URL(paths.home, current).toString();
    }
    const next = new URL(current);
    next.searchParams.set('page', String(currentPage + 1));
    return next.toString();
  };

  const prev = () => {
    if (isHomePage && lastPage <= 1) {
      return undefined;
    }

    if (currentPage === 1) {
      return undefined;
    }

    const prev = new URL(current);
    prev.searchParams.set('page', String(currentPage - 1));
    return prev.toString();
  };

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
      prev: prev(),
      next: next(),
    },
  };
}
