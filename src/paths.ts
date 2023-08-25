export const paths = {
  home: '/',
  ctypes: '/ctype',
  create: '/create',
  ctypeDetails: '/ctype/[param]',
  tag: '/tag/[param]',
  session: '/session',
  moderationVerify: '/moderation/verify',
  moderationCTypes: '/moderation/ctype',
  moderationCType: '/moderation/ctype/[param]',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
