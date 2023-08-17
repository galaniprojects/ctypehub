import { describe, expect, it } from 'vitest';

import { StatusCodes } from 'http-status-codes';
import { CType } from '@kiltprotocol/sdk-js';

describe('endpoint /ctype', () => {
  const method = 'POST';
  const endpoint = `${process.env.URL}ctype`;
  const headers = { 'Content-Type': 'application/json' };

  it('should create a CType with tags', async () => {
    const properties = {};
    const cType = CType.fromProperties('New CType', properties);
    const creator = 'did:kilt:4rrkiRTZgsgxjJDFkLsivqqKTqdUTuxKk3FX3mKFAeMxsR5E';
    const extrinsicHash = '0x1234';
    const description = 'A CType';

    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify({
        cType,
        creator,
        extrinsicHash,
        description,
        tags: ['test', 'example'],
      }),
    });
    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.headers.get('Location')).toBe(
      `${process.env.URL}ctype/${cType.$id}`,
    );

    const { initializeDatabase } = await import('../utilities/sequelize');
    await initializeDatabase();

    const CTypeModel = (await import('../models/ctype')).CType;
    const stored = await CTypeModel.scope('stats').findByPk(cType.$id, {
      include: ['tags'],
    });
    expect(stored?.dataValues).toMatchObject({
      id: cType.$id,
      schema: cType.$schema,
      title: cType.title,
      properties,
      creator,
      extrinsicHash,
      description,
      block: null,
      isHidden: false,
      type: 'object',
    });
    const tags = stored?.dataValues.tags?.map(
      ({ dataValues: { tagName } }) => tagName,
    );
    expect(tags).toContain('test');
    expect(tags).toContain('example');

    await stored?.destroy();
  });

  it('should return an error if the CType already exists', async () => {
    const properties = {};
    const cType = CType.fromProperties('New CType', properties);
    const creator = 'did:kilt:4rrkiRTZgsgxjJDFkLsivqqKTqdUTuxKk3FX3mKFAeMxsR5E';
    const extrinsicHash = '0x1234';
    const tags = [] as string[];
    const body = JSON.stringify({ cType, creator, extrinsicHash, tags });

    const created = await fetch(endpoint, { method, headers, body });
    expect(created.status).toBe(StatusCodes.CREATED);

    const duplicate = await fetch(endpoint, { method, headers, body });
    expect(duplicate.status).toBe(StatusCodes.CONFLICT);
  });

  it('should return an error if the creator is not a valid DID', async () => {
    const properties = {};
    const cType = CType.fromProperties('New CType', properties);
    const creator = 'invalid';
    const extrinsicHash = '0x1234';
    const tags = [] as string[];
    const body = JSON.stringify({ cType, creator, extrinsicHash, tags });

    const response = await fetch(endpoint, { method, headers, body });
    expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('should return an error if the CType is not valid', async () => {
    const cType = { invalid: 'CType' };
    const creator = 'did:kilt:4rrkiRTZgsgxjJDFkLsivqqKTqdUTuxKk3FX3mKFAeMxsR5E';
    const extrinsicHash = '0x1234';
    const tags = [] as string[];
    const body = JSON.stringify({ cType, creator, extrinsicHash, tags });

    const response = await fetch(endpoint, { method, headers, body });
    expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('should return an error if the request body is not valid JSON', async () => {
    const body = 'invalid';

    const response = await fetch(endpoint, { method, headers, body });
    expect(response.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('should return an error if the Content-Type is not application/json', async () => {
    const headers = { 'Content-Type': 'text/plain' };
    const body = JSON.stringify({});

    const response = await fetch(endpoint, { method, headers, body });
    expect(response.status).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  });
});
