import { format } from 'prettier';

function getOriginalImagePath(input: string) {
  return input.replace(/\/@fs.*(\/src\/.*)\?.*/g, '$1');
}

export async function getSnapshotHtmlForPath(path: string) {
  const response = await fetch(`${process.env.URL}${path}`);
  const html = await response.text();
  const pure = html
    .replace(/^.*<\/script>/s, '')
    .replace(/\bdata-astro-cid-\w+/g, '')
    .replace(
      /\/@fs.*(\/src\/.*)\?.*?"/g,
      (match) => `${getOriginalImagePath(match)}"`,
    )
    .replace(/\/(_image\?href=.*?)"/g, (match) => {
      const url = new URL(match, 'http://localhost');
      return `${getOriginalImagePath(url.searchParams.get('href') as string)}"`;
    })
    .replace(/_[a-z0-9]{5}_\d+/g, '')
    .replace('</head>', '')
    .replace('</html>', '');
  return format(pure, { parser: 'html' });
}
