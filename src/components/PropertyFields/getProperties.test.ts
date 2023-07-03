import { describe, it, expect } from 'vitest';
import { CType } from '@kiltprotocol/sdk-js';

import { getProperties } from './getProperties';

const extras: [string, string][] = [
  ['title', 'Title'],
  ['description', ''],
];

describe('getProperties', () => {
  it('should return empty object for no fields', async () => {
    const properties = getProperties(0, [...extras]);
    expect(properties).toEqual({});
    CType.fromProperties('title', properties);
  });

  it('should return a reference property', async () => {
    const $ref =
      'kilt:ctype:0x7cd3b15a245460f794c188d8927c5b5d58e9777f7a2dd99fd7f123206916364d';
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'reference'],
      ['property[0].$ref', $ref],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({ Name: { $ref } });
    CType.fromProperties('title', properties);
  });

  it('should return a boolean property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'boolean'],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({ Name: { type: 'boolean' } });
    CType.fromProperties('title', properties);
  });

  it('should return a basic string property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'string'],
      ['property[0].format', ''],
      ['property[0].minLength', ''],
      ['property[0].maxLength', ''],
      ['property[0].enum', ''],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({ Name: { type: 'string' } });
    CType.fromProperties('title', properties);
  });

  it('should return a full-blown string property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'string'],
      ['property[0].format', 'uri'],
      ['property[0].minLength', '10'],
      ['property[0].maxLength', '50'],
      ['property[0].enum', 'mailto:a@b,https://www.example.org'],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: {
        type: 'string',
        format: 'uri',
        minLength: 10,
        maxLength: 50,
        enum: ['mailto:a@b', 'https://www.example.org'],
      },
    });
    CType.fromProperties('title', properties);
  });

  it('should wrap the string property in array', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'string'],
      ['property[0].format', ''],
      ['property[0].minLength', ''],
      ['property[0].maxLength', ''],
      ['property[0].enum', ''],
      ['property[0].array', 'array'],
      ['property[0].minItems', ''],
      ['property[0].maxItems', ''],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: { type: 'array', items: { type: 'string' } },
    });
    CType.fromProperties('title', properties);
  });

  it('should provide all array features', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'string'],
      ['property[0].format', ''],
      ['property[0].minLength', ''],
      ['property[0].maxLength', ''],
      ['property[0].enum', ''],
      ['property[0].array', 'array'],
      ['property[0].minItems', '1'],
      ['property[0].maxItems', '5'],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 5,
      },
    });
    CType.fromProperties('title', properties);
  });

  it('should return a basic integer property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'integer'],
      ['property[0].minimum', ''],
      ['property[0].maximum', ''],
      ['property[0].enum', ''],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({ Name: { type: 'integer' } });
    CType.fromProperties('title', properties);
  });

  it('should return a full-blown integer property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'integer'],
      ['property[0].minimum', '10'],
      ['property[0].maximum', '50'],
      ['property[0].enum', '20,40'],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: {
        type: 'integer',
        minimum: 10,
        maximum: 50,
        enum: [20, 40],
      },
    });
    CType.fromProperties('title', properties);
  });

  it('should return a basic number property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'number'],
      ['property[0].minimum', ''],
      ['property[0].maximum', ''],
      ['property[0].enum', ''],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({ Name: { type: 'number' } });
    CType.fromProperties('title', properties);
  });

  it('should return a full-blown number property', async () => {
    const properties = getProperties(1, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'number'],
      ['property[0].minimum', '1.2'],
      ['property[0].maximum', '5.6'],
      ['property[0].enum', '2.3,4.5'],
      ['property[0].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: {
        type: 'number',
        minimum: 1.2,
        maximum: 5.6,
        enum: [2.3, 4.5],
      },
    });
    CType.fromProperties('title', properties);
  });

  it('should return multiple properties', async () => {
    const properties = getProperties(3, [
      ['property[0].name', 'Name'],
      ['property[0].type', 'string'],
      ['property[0].format', ''],
      ['property[0].minLength', ''],
      ['property[0].maxLength', ''],
      ['property[0].enum', ''],
      ['property[0].array', ''],
      ['property[0].minItems', ''],
      ['property[0].maxItems', ''],
      ['property[1].name', 'Age'],
      ['property[1].type', 'integer'],
      ['property[1].minimum', ''],
      ['property[1].maximum', ''],
      ['property[1].enum', ''],
      ['property[1].array', ''],
      ['property[2].name', 'IsCool'],
      ['property[2].type', 'boolean'],
      ['property[2].array', ''],
      ...extras,
    ]);
    expect(properties).toEqual({
      Name: { type: 'string' },
      Age: { type: 'integer' },
      IsCool: { type: 'boolean' },
    });
    CType.fromProperties('title', properties);
  });
});
