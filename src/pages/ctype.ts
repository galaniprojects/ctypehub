import { type APIContext } from 'astro';
import { CType, Did, type DidUri, type HexString } from '@kiltprotocol/sdk-js';
import { StatusCodes } from 'http-status-codes';

import { CType as CTypeModel } from '../models/ctype';
import { generatePath, paths } from '../paths';
import { type TagDataInput, Tag as TagModel } from '../models/tag';
import {
  handleErrorResponse,
  makeErrorResponse,
} from '../utilities/errorResponses';
import { getRequestJson } from '../utilities/getRequestJson';

interface Input {
  cType: unknown;
  creator: DidUri;
  extrinsicHash: HexString;
  description: string;
  tags: string[];
}

export async function POST({ request, url }: APIContext) {
  try {
    const { cType, creator, extrinsicHash, description, tags } =
      await getRequestJson<Input>(request);

    if (!CType.isICType(cType)) {
      throw makeErrorResponse(
        'Only ICType is accepted',
        StatusCodes.UNPROCESSABLE_ENTITY,
      );
    }

    try {
      Did.validateUri(creator, 'Did');
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

    const cTypeTags: TagDataInput[] = tags.map((tag) => ({
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
