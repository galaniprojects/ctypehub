import { Op, Sequelize } from 'sequelize';

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  Blockchain,
  ConfigService,
  connect,
  CType,
  Did,
  DidUri,
  disconnect,
  ICType,
  KiltKeyringPair,
  SubmittableExtrinsic,
  Utils,
} from '@kiltprotocol/sdk-js';

import { CType as CTypeModel } from '../models/ctype';
import { endowAccount } from '../../testing/endowAccount';

import { EventParams, scanCTypes } from './scanCTypes';
import { configuration } from './configuration';
import { subScanEventGenerator } from './subScan';

vi.mock('./subScan');

let submitter: KiltKeyringPair;
let assertionMethod: KiltKeyringPair;
let did: DidUri;

async function createDid() {
  const authentication = Utils.Crypto.makeKeypairFromSeed();
  await endowAccount(authentication.address);
  const assertionMethod = Utils.Crypto.makeKeypairFromSeed();

  const tx = await Did.getStoreTx(
    {
      authentication: [authentication],
      assertionMethod: [assertionMethod],
    },
    authentication.address,
    async ({ data }) => ({
      signature: authentication.sign(data, { withType: false }),
      keyType: authentication.type,
    }),
  );
  await Blockchain.signAndSubmitTx(tx, authentication);

  const did = Did.getFullDidUri(authentication.address);

  return { assertionMethod, did };
}

let cType: ICType;
let extrinsic: SubmittableExtrinsic;

async function createCType() {
  cType = CType.fromProperties('Email', {
    Email: {
      type: 'string',
    },
  });

  const api = ConfigService.get('api');
  const tx = api.tx.ctype.add(CType.toChain(cType));

  extrinsic = await Did.authorizeTx(
    did,
    tx,
    async ({ data }) => ({
      signature: assertionMethod.sign(data, { withType: false }),
      keyType: assertionMethod.type,
    }),
    submitter.address,
  );

  await Blockchain.signAndSubmitTx(extrinsic, submitter);
}

let sequelize: Sequelize;

function mockCTypeEvent() {
  const mockParams: EventParams = [
    { type_name: 'CTypeCreatorOf', value: '0xexamplecreator' },
    { type_name: 'CTypeHashOf', value: CType.idToHash(cType.$id) },
  ];
  vi.mocked(subScanEventGenerator).mockImplementation(async function* () {
    yield {
      params: mockParams,
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
  assertionMethod = created.assertionMethod;
  did = created.did;

  await createCType();

  sequelize = (await import('./sequelize')).sequelize;
}, 30_000);

afterAll(async () => {
  await sequelize.close();
  await disconnect();
  // give the SDK time to log the disconnect message
  await new Promise((resolve) => setTimeout(resolve, 1000));
}, 10_000);

beforeEach(async () => {
  await CTypeModel.destroy({ truncate: true });
  vi.mocked(subScanEventGenerator).mockClear();
});

describe('scanCTypes', () => {
  it('should add new CType to the database', async () => {
    mockCTypeEvent();

    await scanCTypes();

    expect(subScanEventGenerator).toHaveBeenLastCalledWith(
      'ctype',
      'CTypeCreated',
      0,
    );
    const created = await CTypeModel.findByPk(cType.$id);
    expect(created).not.toBeNull();
    expect(created?.dataValues.title).toBe(cType.title);
  });

  it('should not add a CType if it already exists', async () => {
    mockCTypeEvent();

    await scanCTypes();

    const latestCType = await CTypeModel.findOne({
      order: [['createdAt', 'DESC']],
      where: {
        block: {
          [Op.not]: null,
        },
      },
    });

    const expectedFromBlock = Number(latestCType?.dataValues.block) + 1;

    vi.mocked(subScanEventGenerator).mockImplementation(async function* () {
      // yield nothing
    });

    await scanCTypes();

    expect(subScanEventGenerator).toHaveBeenCalledTimes(2);
    expect(subScanEventGenerator).toHaveBeenLastCalledWith(
      'ctype',
      'CTypeCreated',
      expectedFromBlock,
    );

    const { count } = await CTypeModel.findAndCountAll();
    expect(count).toBe(1);
  });

  it('should correctly upsert an existing CType', async () => {
    const { $id, $schema, title, properties, type } = cType;
    await CTypeModel.create({
      id: $id,
      schema: $schema,
      title,
      properties,
      type,
      creator: did,
      createdAt: new Date(),
      extrinsicHash: extrinsic.hash.toHex(),
    });

    const beforeUpsert = await CTypeModel.findByPk(cType.$id);

    if (!beforeUpsert) {
      throw new Error('Not found');
    }

    expect(beforeUpsert.dataValues.block).toBeNull();

    mockCTypeEvent();
    await scanCTypes();

    await beforeUpsert.reload();
    expect(beforeUpsert.dataValues.block).not.toBeNull();
  });
});
