import { memoize } from 'lodash-es';

import { initialize } from './utilities/initialize';

const initializedOnce = memoize(initialize);

export async function onRequest(unused: unknown, next: () => unknown) {
  await initializedOnce();
  return await next();
}
