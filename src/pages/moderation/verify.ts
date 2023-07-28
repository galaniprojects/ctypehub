import { randomBytes } from 'node:crypto';

import type { APIContext } from 'astro';

import { Credential, CType, Did, Message } from '@kiltprotocol/sdk-js';
import { StatusCodes } from 'http-status-codes';

import { logger } from '../../utilities/logger';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../../utilities/errorResponses';
import { decrypt, encrypt } from '../../utilities/credentials/cryptoCallbacks';
import { configuration } from '../../utilities/configuration';
import { getSession, sessionStorage } from '../session';
import { getAuthorizedCType } from '../../utilities/credentials/getAuthorizedCType';
import { getRequestJson } from '../../utilities/getRequestJson';

const trustedAttesters = [configuration.did];

async function getCTypes() {
  const cType = await getAuthorizedCType();
  const cTypeHash = CType.idToHash(cType.$id);
  return [{ cTypeHash, trustedAttesters }];
}

export async function get({ request }: APIContext) {
  try {
    logger.debug('Request credential started');

    const session = getSession(request);
    const { encryptionKeyUri } = session;

    logger.debug('Request credential CType found');

    const challenge = `0x${randomBytes(24).toString('hex')}`;
    sessionStorage.set(session.sessionId, {
      ...session,
      requestChallenge: challenge,
    });

    const cTypes = await getCTypes();
    const { did } = Did.parse(encryptionKeyUri);

    const message = Message.fromBody(
      {
        content: {
          cTypes,
          challenge,
        },
        type: 'request-credential',
      },
      configuration.did,
      did,
    );
    const output = await Message.encrypt(message, encrypt, encryptionKeyUri);

    logger.debug('Request credential completed');
    return new Response(JSON.stringify(output), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}

export async function post({ request }: APIContext) {
  try {
    logger.debug('Verification started');

    const payload = await getRequestJson(request);
    const message = await Message.decrypt(payload, decrypt);
    const messageBody = message.body;
    logger.debug('Message decrypted');

    Message.verifyMessageBody(messageBody);
    const { type } = messageBody;

    if (type === 'reject') {
      throw makeErrorResponse(
        'Message contains rejection',
        StatusCodes.CONFLICT,
      );
    }

    if (type !== 'submit-credential') {
      throw makeErrorResponse(
        'Message contains rejection',
        StatusCodes.BAD_REQUEST,
      );
    }

    const session = getSession(request);
    if (!session.requestChallenge) {
      throw makeErrorResponse('No request challenge', StatusCodes.FORBIDDEN);
    }

    const challenge = session.requestChallenge;

    const presentation = messageBody.content[0];
    const ctype = await getAuthorizedCType();
    const { revoked, attester } = await Credential.verifyPresentation(
      presentation,
      {
        ctype,
        challenge,
      },
    );

    if (revoked) {
      throw makeErrorResponse(
        'The attestation has been revoked',
        StatusCodes.FORBIDDEN,
      );
    }

    if (!trustedAttesters.includes(attester)) {
      throw makeErrorResponse(
        'Not an attester we requested',
        StatusCodes.FORBIDDEN,
      );
    }

    logger.debug('Verification completed');
    return new Response(null, { status: StatusCodes.NO_CONTENT });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
