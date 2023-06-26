import type { APIRoute } from 'astro';

import { CType, Did } from '@kiltprotocol/sdk-js';
import { StatusCodes } from 'http-status-codes';

import { CType as CTypeModel } from '../models/ctype';
import { generatePath, paths } from '../paths';

export async function post({ request, url }: Parameters<APIRoute>[0]) {
  const contentType = request.headers.get('Content-Type');
  if (contentType !== 'application/json') {
    return new Response('Only JSON is accepted', {
      status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    });
  }

  const { cType, creator, extrinsicHash } = await request.json();
  if (!CType.isICType(cType)) {
    return new Response('Only ICType is accepted', {
      status: StatusCodes.UNPROCESSABLE_ENTITY,
    });
  }
  try {
    Did.parse(creator);
  } catch {
    return new Response('Creator is not a valid DID', {
      status: StatusCodes.UNPROCESSABLE_ENTITY,
    });
  }

  const { $id: id, $schema: schema, ...rest } = cType;
  if (await CTypeModel.findByPk(id)) {
    return new Response('This CType already exists', {
      status: StatusCodes.CONFLICT,
    });
  }

  await CTypeModel.create({
    id,
    schema,
    creator,
    extrinsicHash,
    createdAt: new Date(),
    ...rest,
  });

  const cTypeUrl = new URL(url);
  cTypeUrl.pathname = generatePath(paths.ctypeDetails, id);

  return new Response('', {
    status: StatusCodes.CREATED,
    headers: {
      Location: cTypeUrl.toString(),
    },
  });
}
