import { format } from 'prettier';

import { configuration } from '../src/utilities/configuration';

export async function getSnapshotHtmlForPath(path: string) {
  const response = await fetch(`${configuration.baseUri}test/${path}`);
  const html = await response.text();
  const pure = html.replace(/^.*<\/script>/s, '').replace(/ astro-\w+/g, '');
  return format(pure, { parser: 'html' });
}
