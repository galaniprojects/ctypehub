export const paths = {
  home: '/',
  ctypeDetails: '/[param]',
  ctypes: '/ctypes/page-[param]',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
