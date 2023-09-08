import type { APIContext } from 'astro';

import { memoize } from 'lodash-es';

import { initialize } from './utilities/initialize';
import { paths } from './paths';

const initializedOnce = memoize(initialize);

export async function onRequest(context: APIContext, next: () => unknown) {
  const staticRoutes = [
    `${paths.imprint}/`,
    `${paths.terms}/`,
    `${paths.privacy}/`,
  ];

  if (!staticRoutes.includes(context.url.pathname)) {
    await initializedOnce();
  }

  return await next();
}
