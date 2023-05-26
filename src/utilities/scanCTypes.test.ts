import { Op, Sequelize } from 'sequelize';

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { got } from 'got';
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

import * as env from './env';
import {
  EventParams,
  EventsResponseJson,
  getCTypeEvents,
  scanCTypes,
} from './scanCTypes';
import { configuration } from './configuration';

let postResponse: EventsResponseJson;
jest.mock('got', () => ({
  got: {
    post: jest.fn().mockReturnValue({
      json: () => postResponse,
    }),
  },
}));

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
  postResponse = {
    data: {
      count: 1,
      events: [
        {
          params: JSON.stringify(mockParams),
          block_timestamp: 1602732456,
          extrinsic_hash: extrinsic.hash.toHex(),
        },
      ],
    },
  };
}

beforeAll(async () => {
  await connect(configuration.blockchainEndpoint);

  submitter = Utils.Crypto.makeKeypairFromSeed(undefined, 'sr25519');
  await endowAccount(submitter.address);

  const created = await createDid();
  assertionMethod = created.assertionMethod;
  did = created.did;

  await createCType();

  const imported = await import('./sequelize');
  await imported.initModels();
  sequelize = imported.sequelize;
}, 30_000);

afterAll(async () => {
  await sequelize.close();
  await disconnect();
}, 10_000);

beforeEach(async () => {
  await CTypeModel.destroy({ truncate: true });
  jest.mocked(got.post).mockClear();
});

describe('scanCTypes', () => {
  describe('getCTypeEvents', () => {
    it('should query the subscan API', async () => {
      postResponse = { data: { count: 0, events: null } };
      const cTypeEvents = await getCTypeEvents(10, 0, 0);
      expect(got.post).toHaveBeenCalledWith(
        'https://example.api.subscan.io/api/scan/events',
        {
          headers: { 'X-API-Key': env.SECRET_SUBSCAN },
          json: {
            call: 'CTypeCreated',
            finalized: true,
            from_block: 10,
            module: 'ctype',
            page: 0,
            row: 0,
          },
        },
      );
      expect(cTypeEvents.count).toBe(0);
      expect(cTypeEvents.events).toBeUndefined();
    });
  });

  describe('scanCTypes', () => {
    it('should add new CType to the database', async () => {
      mockCTypeEvent();

      await scanCTypes();
      expect(got.post).toHaveBeenCalledTimes(2);
      expect(got.post).toHaveBeenLastCalledWith(
        'https://example.api.subscan.io/api/scan/events',
        {
          headers: { 'X-API-Key': env.SECRET_SUBSCAN },
          json: {
            call: 'CTypeCreated',
            finalized: true,
            from_block: 0,
            module: 'ctype',
            page: 0,
            row: 100,
          },
        },
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

      postResponse = { data: { count: 0, events: [] } };

      await scanCTypes();

      expect(got.post).toHaveBeenCalledTimes(3);
      expect(got.post).toHaveBeenLastCalledWith(
        'https://example.api.subscan.io/api/scan/events',
        {
          headers: { 'X-API-Key': env.SECRET_SUBSCAN },
          json: {
            call: 'CTypeCreated',
            finalized: true,
            from_block: expectedFromBlock,
            module: 'ctype',
            page: 0,
            row: 1,
          },
        },
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
});
