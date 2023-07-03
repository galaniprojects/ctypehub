export const paths = {
  home: '/',
  ctypes: '/ctype',
  ctypeDetails: '/ctype/[param]',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
