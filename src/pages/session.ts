import { randomBytes } from 'node:crypto';

import type { APIContext } from 'astro';
import type { DidResourceUri, DidUri } from '@kiltprotocol/sdk-js';

import { Did, Utils } from '@kiltprotocol/sdk-js';

import { StatusCodes } from 'http-status-codes';

import { didDocumentPromise } from '../utilities/didDocument';
import { logger } from '../utilities/logger';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../utilities/errorResponses';
import { getRequestJson } from '../utilities/getRequestJson';
import { decrypt } from '../utilities/cryptoCallbacks';
import { sessionHeader } from '../utilities/sessionHeader';

export interface BasicSession {
  sessionId: string;
  did?: DidUri;
  encryptionKeyUri?: DidResourceUri;
  didChallenge?: string;
  didConfirmed?: boolean;
  requestChallenge?: string;
}

export type Session = BasicSession & {
  did: DidUri;
  encryptionKeyUri: DidResourceUri;
};

export const sessionStorage = new Map<string, BasicSession>();

function startSession() {
  const sessionId = `0x${randomBytes(24).toString('hex')}`;
  const challenge = `0x${randomBytes(24).toString('hex')}`;

  sessionStorage.set(sessionId, { sessionId, didChallenge: challenge });

  return {
    challenge,
    sessionId,
  };
}

export function getBasicSession(request: Request) {
  const sessionId = request.headers.get(sessionHeader);
  if (!sessionId) {
    throw makeErrorResponse(
      `Required header ${sessionHeader} is missing`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const session = sessionStorage.get(sessionId);
  if (!session) {
    throw makeErrorResponse(
      `Unknown or expired session ${sessionId}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  return session;
}

export function getSession(request: Request) {
  const session = getBasicSession(request);

  const { did, didConfirmed, encryptionKeyUri } = session;
  if (!did || !didConfirmed || !encryptionKeyUri) {
    throw makeErrorResponse('Unconfirmed DID', StatusCodes.BAD_REQUEST);
  }

  return { ...session, did, encryptionKeyUri };
}

export interface GetSessionOutput {
  dAppEncryptionKeyUri: DidResourceUri;
  sessionId: string;
  challenge: string;
}

export async function get() {
  const { did, keyAgreementKey } = await didDocumentPromise;
  const dAppEncryptionKeyUri: DidResourceUri = `${did}${keyAgreementKey.id}`;
  const response: GetSessionOutput = {
    dAppEncryptionKeyUri,
    ...startSession(),
  };
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export interface CheckSessionInput {
  encryptionKeyUri: DidResourceUri;
  encryptedChallenge: string;
  nonce: string;
}

export async function post({ request }: APIContext) {
  try {
    logger.debug('Session confirmation started');

    const { encryptionKeyUri, encryptedChallenge, nonce } =
      (await getRequestJson(request)) as CheckSessionInput;

    async function getEncryptionKey(uri: DidResourceUri) {
      try {
        Did.validateUri(uri, 'ResourceUri');
      } catch {
        throw makeErrorResponse(
          'encryptionKeyUri is not a valid DidResourceUri',
          StatusCodes.BAD_REQUEST,
        );
      }

      try {
        return await Did.resolveKey(uri);
      } catch (exception) {
        logger.error(exception);
        throw makeErrorResponse(
          'Cannot resolve encryption key',
          StatusCodes.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const encryptionKey = await getEncryptionKey(encryptionKeyUri);
    logger.debug('Session confirmation resolved DID encryption key');

    async function decryptChallenge() {
      try {
        const { keyAgreementKey, did } = await didDocumentPromise;

        const { data } = await decrypt({
          data: Utils.Crypto.coToUInt8(encryptedChallenge),
          nonce: Utils.Crypto.coToUInt8(nonce),
          keyUri: `${did}${keyAgreementKey.id}`,
          peerPublicKey: encryptionKey.publicKey,
        });
        logger.debug('Session confirmation decrypted challenge');
        return Utils.Crypto.u8aToHex(data);
      } catch (exception) {
        logger.error(exception);
        throw makeErrorResponse(
          `Could not decrypt challenge: ${exception}`,
          StatusCodes.FORBIDDEN,
        );
      }
    }

    const session = getBasicSession(request);
    const decryptedChallenge = await decryptChallenge();

    if (decryptedChallenge !== session.didChallenge) {
      throw makeErrorResponse(
        'Challenge signature mismatch',
        StatusCodes.FORBIDDEN,
      );
    }
    sessionStorage.set(session.sessionId, {
      ...session,
      did: encryptionKey.controller,
      encryptionKeyUri,
      didConfirmed: true,
    });

    logger.debug('Session confirmation succeeded');
    return new Response(null, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
