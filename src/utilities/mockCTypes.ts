import type { CTypeData } from '../models/ctype';

export const mockCTypes: Record<string, CTypeData> = {
  example: {
    id: 'kilt:ctype:0x1',
    schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'Example CType',
    properties: { example: { type: 'string' }, isExample: { type: 'boolean' } },
    type: 'object',
    creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    createdAt: new Date('2023-05-01T12:00:00'),
    description: 'This is some example cType data',
    block: '123',
    attestationsCount: 1,
    tags: [
      {
        dataValues: {
          cTypeId: 'kilt:ctype:0x1',
          tagName: 'example',
          search: '',
        },
      },
    ],
    isHidden: false,
  },
  nestedProperty: {
    id: 'kilt:ctype:0x2',
    schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'Example nested CType property',
    properties: {
      example: { $ref: 'kilt:ctype:0x1#/properties/example' },
      hasNestedProperty: { type: 'boolean' },
    },
    type: 'object',
    creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    createdAt: new Date('2023-05-01T12:01:00'),
    description: 'This is an example of a CType with a nested property',
    block: '321',
    attestationsCount: 22,
    isHidden: false,
  },
  nestedCType: {
    id: 'kilt:ctype:0x3',
    schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'Example nested CType',
    properties: {
      example: {
        $ref: 'kilt:ctype:0x1',
      },
      hasNestedCType: {
        type: 'boolean',
      },
    },
    type: 'object',
    creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    createdAt: new Date('2023-05-01T12:02:00'),
    description: 'This is an example of a CType with a nested CType',
    block: '456',
    attestationsCount: 333,
    isHidden: false,
  },
  hidden: {
    id: 'kilt:ctype:0x4',
    schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'Hidden CType',
    properties: { example: { type: 'string' }, isExample: { type: 'boolean' } },
    type: 'object',
    creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    createdAt: new Date('2023-05-01T12:00:00'),
    description: 'This is some example cType data',
    block: '123',
    attestationsCount: 1,
    tags: [
      {
        dataValues: {
          cTypeId: 'kilt:ctype:0x1',
          tagName: 'example',
          search: '',
        },
      },
    ],
    isHidden: true,
  },
  everything: {
    id: 'kilt:ctype:0x060fe62fbe19e99f3440d829dec705f92d35b833d8c8927d8d94462737af2d90',
    schema:
      'ipfs://bafybeiah66wbkhqbqn7idkostj2iqyan2tstc4tpqt65udlhimd7hcxjyq/',
    title: 'Everything everywhere',
    description: '…all the time',
    additionalProperties: false,
    properties: {
      Array: {
        items: {
          format: 'date',
          type: 'string',
        },
        type: 'array',
      },
      Boolean: {
        type: 'boolean',
      },
      Integer: {
        enum: [1, 10000, 2, 3, 4],
        type: 'integer',
      },
      Number: {
        maximum: 56.78,
        minimum: 12.34,
        type: 'number',
      },
      Reference: {
        $ref: 'kilt:ctype:0xa8e68ac37f1a062b1432840d883e4c8be71deca13d539e0b00a8a74f4e3f6789',
      },
      String: {
        maxLength: 100,
        minLength: 1,
        type: 'string',
      },
    },
    type: 'object',
    creator: 'did:kilt:4rrkiRTZgsgxjJDFkLsivqqKTqdUTuxKk3FX3mKFAeMxsR5E',
    attestationsCount: 4444,
    createdAt: new Date('2023-05-01T12:03:00'),
    block: '456',
    isHidden: false,
  },
};
