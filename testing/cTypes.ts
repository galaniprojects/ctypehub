import type { CTypeData } from '../src/models/ctype';

export const cTypes: Record<string, CTypeData> = {
  example: {
    id: 'kilt:ctype:0x1',
    schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'Example CType',
    properties: { example: { type: 'string' }, isExample: { type: 'boolean' } },
    type: 'object',
    creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    createdAt: new Date('2023-05-01T12:00:00'),
    extrinsicHash: '0xexamplehash',
    description: 'This is some example cType data',
    block: '123',
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
    createdAt: new Date('2023-05-01T12:00:00'),
    extrinsicHash: '0xexamplenestedhash',
    description: 'This is an example of a CType with a nested property',
    block: '321',
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
    createdAt: new Date('2023-05-01T12:00:00'),
    extrinsicHash: '0xexamplehash',
    description: 'This is an example of a CType with a nested CType',
    block: '456',
  },
};
