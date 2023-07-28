import { StatusCodes } from 'http-status-codes';

import { makeErrorResponse } from './errorResponses';
import { logger } from './logger';

export async function getRequestJson(request: Request) {
  const contentType = request.headers.get('Content-Type');
  if (contentType !== 'application/json') {
    throw makeErrorResponse(
      'Only JSON is accepted',
      StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    );
  }

  try {
    return await request.json();
  } catch (exception) {
    logger.warn(exception);
    throw makeErrorResponse(
      `Could not parse JSON: ${exception}`,
      StatusCodes.UNPROCESSABLE_ENTITY,
    );
  }
}
