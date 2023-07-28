import type { DidResourceUri, IEncryptedMessage } from '@kiltprotocol/sdk-js';

import type { CheckSessionInput, GetSessionOutput } from '../../pages/session';

import { paths } from '../../paths';

import { sessionHeader } from '../../utilities/sessionHeader';

interface PubSubSession {
  listen: (
    callback: (message: IEncryptedMessage) => Promise<void>,
  ) => Promise<void>;
  close: () => Promise<void>;
  send: (message: IEncryptedMessage) => Promise<void>;
  encryptionKeyUri: DidResourceUri;
  encryptedChallenge: string;
  nonce: string;
}

interface InjectedWindowProvider {
  startSession: (
    dAppName: string,
    dAppEncryptionKeyUri: DidResourceUri,
    challenge: string,
  ) => Promise<PubSubSession>;
  name: string;
  version: string;
  specVersion: '3.0';
}

export const apiWindow = window as unknown as {
  kilt: Record<string, InjectedWindowProvider>;
};

export function getCompatibleExtensions(): Array<string> {
  return Object.entries(apiWindow.kilt)
    .filter(([, provider]) => provider.specVersion.startsWith('3.'))
    .map(([name]) => name);
}

export type Session = PubSubSession & {
  sessionId: string;
  name: string;
};

async function getSessionValues() {
  const request = await fetch(paths.session);
  if (!request.ok) {
    console.error(request);
    throw new Error('Could not get session values');
  }
  return (await request.json()) as GetSessionOutput;
}

async function checkSession(json: CheckSessionInput, sessionId: string) {
  const request = await fetch(paths.session, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [sessionHeader]: sessionId,
    },
    body: JSON.stringify(json),
  });
  if (!request.ok) {
    console.error(request);
    throw new Error('Could not check session values');
  }
}

export async function getSession(
  provider: InjectedWindowProvider,
): Promise<Session> {
  if (!provider) {
    throw new Error('No provider');
  }

  const { dAppEncryptionKeyUri, challenge, sessionId } =
    await getSessionValues();
  const dAppName = 'CTypeHub';

  const session = await provider.startSession(
    dAppName,
    dAppEncryptionKeyUri,
    challenge,
  );

  const { encryptionKeyUri, encryptedChallenge, nonce } = session;
  await checkSession(
    {
      encryptionKeyUri,
      encryptedChallenge,
      nonce,
    },
    sessionId,
  );

  const { name } = provider;

  return { ...session, sessionId, name };
}
