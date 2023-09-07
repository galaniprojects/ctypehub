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
  imprint: '/imprint',
  terms: '/terms',
  privacy: '/privacy',
};

export function generatePath(path: string, param: string) {
  return path.replace('[param]', param);
}
