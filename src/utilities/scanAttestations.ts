import { CType, Did, type HexString } from '@kiltprotocol/sdk-js';
import { hexToU8a } from '@polkadot/util';

import { Attestation as AttestationModel } from '../models/attestation';

import { subScanEventGenerator } from './subScan';
import { logger } from './logger';

function getDidUriFromAccountHex(didAccount: HexString) {
  logger.debug('DID as HexString of Account Address: ' + didAccount);
  // SubScan returns some AttesterOf values as hex without the "0x" prefix.
  // So we first parsed to a Uint8Array via `hexToU8a`, which can handle HexStrings with or without the prefix.
  const didU8a = hexToU8a(didAccount);

  const didUri = Did.fromChain(didU8a as Parameters<typeof Did.fromChain>[0]);
  logger.debug('Corresponding DID-URI: ' + didUri);
  return didUri;
}

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

  for await (const event of eventGenerator) {
    const { block, blockTimestampMs, extrinsicHash } = event;
    const params = event.parsedParams;

    const createdAt = new Date(blockTimestampMs);
    const owner = getDidUriFromAccountHex(params.AttesterOf as HexString);
    const claimHash = params.ClaimHashOf as HexString;
    const cTypeHash = params.CtypeHashOf as HexString;
    const cTypeId = CType.hashToId(cTypeHash);
    const delegationId = params[
      'Option<DelegationNodeIdOf>'
    ] as HexString | null;

    try {
      await AttestationModel.upsert({
        claimHash,
        cTypeId,
        owner,
        delegationId,
        createdAt,
        extrinsicHash,
        block: String(block),
      });
    } catch (exception) {
      if ((exception as Error).name === 'SequelizeForeignKeyConstraintError') {
        // Likely a broken CType which we haven’t saved to the database
        logger.debug(`Ignoring attestation ${claimHash} for unknown CType`);
        continue;
      }
      throw exception;
    }
  }
}
