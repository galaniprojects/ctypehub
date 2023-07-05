import {
  Attestation,
  ConfigService,
  CType,
  IAttestation,
} from '@kiltprotocol/sdk-js';

import { Attestation as AttestationModel } from '../models/attestation';

import { subScanEventGenerator } from './subScan';
import { logger } from './logger';

export type EventParams = [
  { type_name: 'AttesterOf'; value: `0x${string}` },
  { type_name: 'ClaimHashOf'; value: `0x${string}` },
  { type_name: 'CTypeHashOf'; value: `0x${string}` },
  { type_name: 'DelegationNodeIdOf'; value: `0x${string}` | null },
];

export async function scanAttestations() {
  const latestAttestation = await AttestationModel.findOne({
    order: [['createdAt', 'DESC']],
  });
  const fromBlock = latestAttestation
    ? Number(latestAttestation.dataValues.block)
    : 0;

  const eventGenerator = subScanEventGenerator(
    'attestation',
    'AttestationCreated',
    fromBlock,
  );

  const api = ConfigService.get('api');
  for await (const event of eventGenerator) {
    const { block, blockTimestampMs, params, extrinsicHash } = event;
    const claimHash = params[1].value;

    let attestation: IAttestation;
    try {
      const chainData = await api.query.attestation.attestations(claimHash);
      if (chainData.isNone) {
        // TODO: consider decoding the event params and using those instead
        logger.info(`Attestation ${claimHash} was deleted from the blockchain`);
        continue;
      }
      attestation = await Attestation.fromChain(chainData, claimHash);
    } catch (exception) {
      logger.error(exception, `Error fetching Attestation ${claimHash}`);
      continue;
    }

    const { owner, delegationId, cTypeHash } = attestation;
    const cTypeId = CType.hashToId(cTypeHash);
    const createdAt = new Date(blockTimestampMs);

    await AttestationModel.upsert({
      claimHash,
      cTypeId,
      owner,
      delegationId,
      createdAt,
      extrinsicHash,
      block: String(block),
    });
  }
}
