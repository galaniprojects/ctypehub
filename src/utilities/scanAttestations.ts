import { Did, type HexString, type ICType } from '@kiltprotocol/sdk-js';

import { Attestation as AttestationModel } from '../models/attestation';

import { subScanEventGenerator, type ParsedEvent } from './subScan';
import { logger } from './logger';

/** Extends the `event` with the parameters parsed,
 *  so that the parameters value extraction is easier and more elegant.
 *
 * @param event
 * @returns the extended event
 */
function parseParams(event: ParsedEvent) {
  return {
    ...event,
    parsedParams: Object.fromEntries(
      event.params.map((param) => [param.type_name, param.value]),
    ),
  };
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
    async (events: ParsedEvent[]) => events, // no transformation
  );

  for await (const event of eventGenerator) {
    const { block, blockTimestampMs, extrinsicHash } = event;
    // extract the parameters
    const params = parseParams(event).parsedParams;

    const createdAt = new Date(blockTimestampMs);

    const owner = Did.fromChain(
      params.AttesterOf as Parameters<typeof Did.fromChain>[0],
    );
    const claimHash = params.ClaimHashOf as HexString;
    const cTypeId: ICType['$id'] = `kilt:ctype:${params.CtypeHashOf as HexString}`;
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
