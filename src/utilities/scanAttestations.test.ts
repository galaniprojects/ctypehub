import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Attestation,
  Blockchain,
  Claim,
  ConfigService,
  connect,
  Credential,
  CType,
  Did,
  type DidUri,
  disconnect,
  type IAttestation,
  type ICType,
  type KiltKeyringPair,
  type SubmittableExtrinsic,
  Utils,
} from '@kiltprotocol/sdk-js';

import { CType as CTypeModel } from '../models/ctype';
import { Attestation as AttestationModel } from '../models/attestation';
import { endowAccount } from '../../testing/endowAccount';
import { createDid } from '../../testing/createDid';
import { createCType } from '../../testing/createCType';
import { resetDatabase } from '../../testing/resetDatabase';

import { configuration } from './configuration';
import { subScanEventGenerator } from './subScan';
import { scanAttestations } from './scanAttestations';

vi.mock('./subScan');

let submitter: KiltKeyringPair;
let did: DidUri;

let cType: ICType;
let extrinsic: SubmittableExtrinsic;
let attestation: IAttestation;

async function createAttestation(assertionMethod: KiltKeyringPair) {
  const claim = Claim.fromCTypeAndClaimContents(
    cType,
    { Email: 'test@example.com' },
    did,
  );
  const credential = Credential.fromClaim(claim);
  const attestation = Attestation.fromCredentialAndDid(credential, did);

  const api = ConfigService.get('api');
  const tx = api.tx.attestation.add(
    attestation.claimHash,
    attestation.cTypeHash,
    null,
  );

  const extrinsic = await Did.authorizeTx(
    did,
    tx,
    async ({ data }) => ({
      signature: assertionMethod.sign(data, { withType: false }),
      keyType: assertionMethod.type,
    }),
    submitter.address,
  );
  await Blockchain.signAndSubmitTx(extrinsic, submitter);

  return { attestation, extrinsic };
}

function mockAttestationEvent() {
  const mockParams = [
    {
      type_name: 'AttesterOf',
      value: Utils.Crypto.u8aToHex(
        Utils.Crypto.decodeAddress(Did.toChain(did)),
      ),
    },
    { type_name: 'ClaimHashOf', value: attestation.claimHash },
    { type_name: 'CtypeHashOf', value: CType.idToHash(cType.$id) },
    { type_name: 'Option<DelegationNodeIdOf>', value: null },
  ];
  const mockParsedParams = {
    AttesterOf: Utils.Crypto.u8aToHex(
      Utils.Crypto.decodeAddress(Did.toChain(did)),
    ),
    ClaimHashOf: attestation.claimHash,
    CtypeHashOf: CType.idToHash(cType.$id),
    'Option<DelegationNodeIdOf>': null,
  };

  vi.mocked(subScanEventGenerator).mockImplementation(async function* () {
    yield {
      params: mockParams,
      parsedParams: mockParsedParams,
      block: 123456,
      blockTimestampMs: 160273245600,
      extrinsicHash: extrinsic.hash.toHex(),
    };
  });
}

beforeAll(async () => {
  await connect(configuration.blockchainEndpoint);

  submitter = Utils.Crypto.makeKeypairFromSeed(undefined, 'sr25519');
  await endowAccount(submitter.address);

  const created = await createDid();
  did = created.did;

  cType = (await createCType(did, created.assertionMethod, submitter)).cType;

  ({ attestation, extrinsic } = await createAttestation(
    created.assertionMethod,
  ));

  const { sequelize, initializeDatabase } = await import('./sequelize');
  await initializeDatabase();

  return async function teardown() {
    await sequelize.close();
    await disconnect();
    // give the SDK time to log the disconnect message
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
}, 30_000);

beforeEach(async () => {
  await resetDatabase();

  const { $id, $schema, title, properties, type } = cType;
  await CTypeModel.create({
    id: $id,
    schema: $schema,
    title,
    properties,
    type,
    creator: did,
    createdAt: new Date(),
    extrinsicHash: '0xexampleextrinsichash',
  });

  vi.mocked(subScanEventGenerator).mockClear();
});

describe('scanAttestations', () => {
  it('should add new attestation to the database', async () => {
    mockAttestationEvent();

    await scanAttestations();

    expect(subScanEventGenerator).toHaveBeenLastCalledWith(
      'attestation',
      'AttestationCreated',
      0,
    );
    const created = await AttestationModel.findByPk(attestation.claimHash);
    expect(created).not.toBeNull();
    expect(created?.dataValues.cTypeId).toBe(cType.$id);
  });

  it('should not add a CType if it already exists', async () => {
    mockAttestationEvent();

    await scanAttestations();

    const latestAttestation = await AttestationModel.findOne({
      order: [['createdAt', 'DESC']],
    });

    const expectedFromBlock = Number(latestAttestation?.dataValues.block);

    vi.mocked(subScanEventGenerator).mockImplementation(async function* () {
      // yield nothing
    });

    await scanAttestations();

    expect(subScanEventGenerator).toHaveBeenCalledTimes(2);
    expect(subScanEventGenerator).toHaveBeenLastCalledWith(
      'attestation',
      'AttestationCreated',
      expectedFromBlock,
    );

    const count = await AttestationModel.count();
    expect(count).toBe(1);
  });

  it('should correctly upsert an existing CType', async () => {
    const { claimHash, cTypeHash, owner, delegationId } = attestation;
    const cTypeId = CType.hashToId(cTypeHash);

    await AttestationModel.create({
      claimHash,
      cTypeId,
      owner,
      delegationId,
      block: '0',
      extrinsicHash: extrinsic.hash.toHex(),
      createdAt: new Date(),
    });

    const beforeUpsert = await AttestationModel.findByPk(claimHash);

    if (!beforeUpsert) {
      throw new Error('Not found');
    }

    expect(beforeUpsert.dataValues.block).toBe('0');

    mockAttestationEvent();
    await scanAttestations();

    await beforeUpsert.reload();
    expect(beforeUpsert.dataValues.block).not.toBeNull();
  });
});
