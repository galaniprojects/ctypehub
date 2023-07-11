import type { AttestationData } from '../models/attestation';

export const mockAttestations: AttestationData[] = [
  {
    claimHash: '0x1',
    cTypeId: 'kilt:ctype:0x1',
    owner: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    delegationId: null,
    createdAt: new Date('2023-06-01T12:00:00'),
    extrinsicHash: '0xextrinsichash',
    block: '321',
  },
  {
    claimHash: '0x2',
    cTypeId: 'kilt:ctype:0x2',
    owner: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    delegationId: null,
    createdAt: new Date('2023-07-01T12:00:00'),
    extrinsicHash: '0xextrinsichash',
    block: '456',
  },
  {
    claimHash: '0x3',
    cTypeId: 'kilt:ctype:0x2',
    owner: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
    delegationId: null,
    createdAt: new Date('2023-07-01T12:00:00'),
    extrinsicHash: '0xextrinsichash',
    block: '456',
  },
];
