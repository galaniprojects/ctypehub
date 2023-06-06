import { format } from 'prettier';

export async function getSnapshotHtmlForPath(path: string) {
  const response = await fetch(`${process.env.URL}${path}`);
  const html = await response.text();
  const pure = html
    .replace(/^.*<\/script>/s, '')
    .replace(/\bastro-\w+/g, '')
    .replace(/_[a-z0-9]{5}_\d/g, '')
    .replace(/ class=""/g, '')
    .replace('</head>', '')
    .replace('</html>', '');
  return format(pure, { parser: 'html' });
}
