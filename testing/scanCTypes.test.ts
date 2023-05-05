/**
 * @jest-environment node
 */

import type { Sequelize } from 'sequelize';

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
  Utils,
} from '@kiltprotocol/sdk-js';

import * as env from '../src/utilities/env';
import {
  EventParams,
  getCTypeEvents,
  scanCTypes,
} from '../src/utilities/scanCTypes';
import { configuration } from '../src/utilities/configuration';
import { CType as CTypeModel } from '../src/models/ctype';

import { endowAccount, setup, submitter, teardown } from './integration.setup';

let postResponse = {};
jest.mock('got', () => ({
  got: {
    post: jest.fn().mockReturnValue({
      json: () => postResponse,
    }),
  },
}));

jest.mock('../src/utilities/env', () => ({
  URL: 'http://localhost:3000',
  SUBSCAN_HOST: 'example.com',
  SECRET_SUBSCAN: 'SECRET_SUBSCAN',
  BLOCKCHAIN_ENDPOINT: 'BLOCKCHAIN_ENDPOINT',
  DATABASE_URI: 'DATABASE_URI',
}));

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

async function createCType() {
  cType = CType.fromProperties('Email', {
    Email: {
      type: 'string',
    },
  });

  const api = ConfigService.get('api');
  const tx = api.tx.ctype.add(CType.toChain(cType));
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
}

let sequelize: Sequelize;

beforeAll(async () => {
  await setup();
  await connect(configuration.blockchainEndpoint);

  const created = await createDid();
  assertionMethod = created.assertionMethod;
  did = created.did;

  await createCType();

  const imported = await import('../src/utilities/sequelize');
  await imported.initModels();
  sequelize = imported.sequelize;
}, 30_000);

afterAll(async () => {
  await sequelize.close();
  await disconnect();
  await teardown();
}, 10_000);

beforeEach(() => {
  jest.mocked(got.post).mockClear();
});

describe('scanCTypes', () => {
  describe('getCTypeEvents', () => {
    it('should query the subscan API', async () => {
      postResponse = { data: { count: 0, events: [] } };
      await getCTypeEvents(10, 0, 0);
      expect(got.post).toHaveBeenCalledWith(
        'https://example.com/api/scan/events',
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
    });
  });

  describe('scanCTypes', () => {
    it('should add new CType to the database', async () => {
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
              block_timestamp: 1651756558000,
            },
          ],
        },
      };

      await scanCTypes();
      expect(got.post).toHaveBeenCalledTimes(2);
      expect(got.post).toHaveBeenLastCalledWith(
        'https://example.com/api/scan/events',
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
      postResponse = { data: { count: 0, events: [] } };

      const latestCType = await CTypeModel.findOne({
        order: [['block', 'DESC']],
      });
      const expectedFromBlock = Number(latestCType?.dataValues.block) + 1;

      await scanCTypes();

      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenLastCalledWith(
        'https://example.com/api/scan/events',
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
  });
});
