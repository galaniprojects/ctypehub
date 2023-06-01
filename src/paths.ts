export const paths = {
  ctypeDetails: '/[param]',
  ctypes: '/ctypes/[param]',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
