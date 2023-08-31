import type { APIContext } from 'astro';

import { StatusCodes } from 'http-status-codes';
import { Op } from 'sequelize';

import { getSession } from '../session';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../../utilities/errorResponses';
import { CType } from '../../models/ctype';

export async function GET({ request, url }: APIContext) {
  try {
    const session = getSession(request);
    if (!session.authorized) {
      throw makeErrorResponse('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    const before = url.searchParams.get('before');

    const cTypes = await CType.findAll({
      where: {
        createdAt: { [Op.lte]: before ? new Date(before) : new Date() },
      },
      order: [['createdAt', 'DESC']],
      include: 'tags',
      limit: 20,
    });

    return new Response(JSON.stringify(cTypes), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
