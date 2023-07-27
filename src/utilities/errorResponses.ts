import type { StatusCodes } from 'http-status-codes';

import { logger } from './logger';

class ErrorResponse extends Error {}

export function makeErrorResponse(message: string, status: StatusCodes) {
  const error = new ErrorResponse(message);
  error.cause = new Response(message, { status });
  logger.warn(message);
  return error;
}

export function handleErrorResponse(exception: unknown) {
  if (!(exception instanceof ErrorResponse)) {
    throw exception;
  }
  if (!(exception.cause instanceof Response)) {
    throw exception;
  }
  return exception.cause;
}
