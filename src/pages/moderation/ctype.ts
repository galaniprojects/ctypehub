import type { APIContext } from 'astro';

import type { ICType } from '@kiltprotocol/sdk-js';

import { StatusCodes } from 'http-status-codes';

import { getRequestJson } from '../../utilities/getRequestJson';
import { CType } from '../../models/ctype';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../../utilities/errorResponses';
import { getSession } from '../session';

export async function post({ request }: APIContext) {
  try {
    const { id, isHidden } = (await getRequestJson(request)) as {
      id: ICType['$id'];
      isHidden: boolean;
    };
    getSession(request);

    const [updatedCount] = await CType.update({ isHidden }, { where: { id } });

    if (!updatedCount) {
      throw makeErrorResponse('CType not found', StatusCodes.NOT_FOUND);
    }

    return new Response(null, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
