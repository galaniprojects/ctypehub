export const paths = {
  home: '/',
  ctypes: '/ctype',
  ctypeDetails: '/ctype/[param]',
  tag: '/tag/[param]',
  session: '/session',
  moderationVerify: '/moderation/verify',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
