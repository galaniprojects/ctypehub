import { describe, expect, it } from 'vitest';
import { StatusCodes } from 'http-status-codes';

import { handleErrorResponse, makeErrorResponse } from './errorResponses';

describe('errorResponses', () => {
  describe('makeErrorResponse', () => {
    it('should make an instance of Error', () => {
      const error = makeErrorResponse('foo', StatusCodes.BAD_REQUEST);
      expect(error).toBeInstanceOf(Error);
    });
    it('should create a proper Response', async () => {
      const error = makeErrorResponse('foo', StatusCodes.BAD_REQUEST);
      const response = await error.cause;
      if (!(response instanceof Response)) {
        throw new Error('Expected cause to be an instance of Response');
      }
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(await response.text()).toBe('foo');
    });
  });

  describe('handleErrorResponse', () => {
    it('should throw if the exception is not an ErrorResponse', () => {
      const error = new Error();
      expect(() => {
        handleErrorResponse(error);
      }).toThrow(error);
    });

    it('should throw if the exception.cause is not a Response', () => {
      const error = makeErrorResponse('foo', StatusCodes.BAD_REQUEST);
      delete error.cause;
      expect(() => {
        handleErrorResponse(error);
      }).toThrow(error);
    });

    it('should return exception.cause if it is a Response', () => {
      const error = makeErrorResponse('foo', StatusCodes.BAD_REQUEST);
      expect(handleErrorResponse(error)).toBe(error.cause);
    });
  });
});
