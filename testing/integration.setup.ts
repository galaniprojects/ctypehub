import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import {
  BalanceUtils,
  Blockchain,
  ConfigService,
  connect,
  disconnect,
  init,
  KiltAddress,
  KiltKeyringPair,
  Utils,
} from '@kiltprotocol/sdk-js';

import { configuration } from '../src/utilities/configuration';

export let blockchainContainer: StartedTestContainer;
export let databaseContainer: StartedTestContainer;
export let submitter: KiltKeyringPair;

export async function endowAccount(address: KiltAddress) {
  const api = ConfigService.get('api');

  const tx = api.tx.balances.transfer(address, BalanceUtils.toFemtoKilt(1000));
  const faucet = Utils.Crypto.makeKeypairFromUri(
    'receive clutch item involve chaos clutch furnace arrest claw isolate okay together',
  );

  await Blockchain.signAndSubmitTx(tx, faucet);
}

export async function setup() {
  const WS_PORT = 9944;

  // configure the code to use a local blank instance of blockchain
  blockchainContainer = await new GenericContainer(
    'kiltprotocol/mashnet-node:latest',
  )
    .withCommand(['--dev', `--ws-port=${WS_PORT}`, '--ws-external'])
    .withExposedPorts(WS_PORT)
    .withWaitStrategy(Wait.forLogMessage(`:${WS_PORT}`))
    .start();

  {
    const port = blockchainContainer.getMappedPort(WS_PORT);
    const host = blockchainContainer.getHost();
    configuration.blockchainEndpoint = `ws://${host}:${port}`;
  }

  // endow account
  await init({ submitTxResolveOn: Blockchain.IS_IN_BLOCK });
  await connect(configuration.blockchainEndpoint);

  submitter = Utils.Crypto.makeKeypairFromSeed(undefined, 'sr25519');
  await endowAccount(submitter.address);

  await disconnect();

  // configure the code to use a local blank database
  const DB_PORT = 5432;
  const POSTGRES_PASSWORD = 'postgres';
  databaseContainer = await new GenericContainer('postgres')
    .withEnvironment({ POSTGRES_PASSWORD })
    .withExposedPorts(DB_PORT)
    .start();

  {
    const port = databaseContainer.getMappedPort(DB_PORT);
    const host = databaseContainer.getHost();
    configuration.databaseUri = `postgres://postgres:${POSTGRES_PASSWORD}@${host}:${port}/postgres`;
  }
}

export async function teardown() {
  await blockchainContainer.stop();
  await databaseContainer.stop();
}
