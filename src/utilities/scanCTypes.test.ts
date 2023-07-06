import { Op } from 'sequelize';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  connect,
  CType,
  DidUri,
  disconnect,
  ICType,
  KiltKeyringPair,
  SubmittableExtrinsic,
  Utils,
} from '@kiltprotocol/sdk-js';

import { CType as CTypeModel } from '../models/ctype';
import { endowAccount } from '../../testing/endowAccount';
import { createDid } from '../../testing/createDid';
import { createCType } from '../../testing/createCType';

import { EventParams, scanCTypes } from './scanCTypes';
import { configuration } from './configuration';
import { subScanEventGenerator } from './subScan';

vi.mock('./subScan');

let submitter: KiltKeyringPair;
let did: DidUri;

let cType: ICType;
let extrinsic: SubmittableExtrinsic;

function mockCTypeEvent() {
  const mockParams: EventParams = [
    { type_name: 'CTypeCreatorOf', value: '0xexamplecreator' },
    { type_name: 'CTypeHashOf', value: CType.idToHash(cType.$id) },
  ];
  vi.mocked(subScanEventGenerator).mockImplementation(async function* () {
    yield {
      params: mockParams,
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

  ({ cType, extrinsic } = await createCType(
    did,
    created.assertionMethod,
    submitter,
  ));

  const { sequelize } = await import('./sequelize');

  return async function teardown() {
    await sequelize.close();
    await disconnect();
    // give the SDK time to log the disconnect message
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
}, 30_000);

beforeEach(async () => {
  await CTypeModel.destroy({ where: {} });
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

    const expectedFromBlock = Number(latestCType?.dataValues.block);

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
