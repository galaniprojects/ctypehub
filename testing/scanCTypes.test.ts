/**
 * @jest-environment node
 */

import type { Sequelize } from 'sequelize';

import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
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
import { getCTypeEvents } from '../src/utilities/scanCTypes';
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

  it('should allow sequelize queries (delete me)', async () => {
    const latestCType = await CTypeModel.findOne({
      order: [['block', 'DESC']],
    });
    expect(latestCType).toBeNull();
  });
});
