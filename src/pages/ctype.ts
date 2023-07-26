import type { APIContext } from 'astro';

import { CType, Did } from '@kiltprotocol/sdk-js';
import { StatusCodes } from 'http-status-codes';

import { CType as CTypeModel } from '../models/ctype';
import { generatePath, paths } from '../paths';
import { TagData, Tag as TagModel } from '../models/tag';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../utilities/errorResponses';

export async function post({ request, url }: APIContext) {
  try {
    const contentType = request.headers.get('Content-Type');
    if (contentType !== 'application/json') {
      throw makeErrorResponse(
        'Only JSON is accepted',
        StatusCodes.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    const { cType, creator, extrinsicHash, description, tags } =
      await request.json();

    if (!CType.isICType(cType)) {
      throw makeErrorResponse(
        'Only ICType is accepted',
        StatusCodes.UNPROCESSABLE_ENTITY,
      );
    }

    try {
      Did.parse(creator);
    } catch {
      throw makeErrorResponse(
        'Creator is not a valid DID',
        StatusCodes.UNPROCESSABLE_ENTITY,
      );
    }

    const { $id: id, $schema: schema, ...rest } = cType;
    if (await CTypeModel.findByPk(id)) {
      throw makeErrorResponse(
        'This CType already exists',
        StatusCodes.CONFLICT,
      );
    }

    await CTypeModel.create({
      id,
      schema,
      creator,
      extrinsicHash,
      description,
      createdAt: new Date(),
      ...rest,
    });

    const cTypeTags: TagData[] = (tags as string[]).map((tag) => ({
      cTypeId: id,
      tagName: tag,
    }));
    await TagModel.bulkCreate(cTypeTags);

    const cTypeUrl = new URL(url);
    cTypeUrl.pathname = generatePath(paths.ctypeDetails, id);

    return new Response('', {
      status: StatusCodes.CREATED,
      headers: {
        Location: cTypeUrl.toString(),
      },
    });
  } catch (exception) {
    return handleErrorResponse(exception);
  }
}
