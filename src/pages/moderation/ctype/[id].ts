import type { APIContext } from 'astro';

import { StatusCodes } from 'http-status-codes';

import { getRequestJson } from '../../../utilities/getRequestJson';
import { CType } from '../../../models/ctype';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../../../utilities/errorResponses';
import { getSession } from '../../session';
import { logger } from '../../../utilities/logger';

export async function PATCH({ request, params }: APIContext) {
  try {
    logger.debug('CType moderation started');

    const { id } = params;
    const { isHidden } = await getRequestJson<{ isHidden: boolean }>(request);

    const session = getSession(request);
    if (!session.authorized) {
      throw makeErrorResponse('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    logger.debug('Session authorized, toggling cType visibility');

    const [updatedCount] = await CType.update({ isHidden }, { where: { id } });

    if (updatedCount === 0) {
      throw makeErrorResponse('CType not found', StatusCodes.NOT_FOUND);
    }

    logger.debug('CType moderation successful');

    return new Response(null, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
