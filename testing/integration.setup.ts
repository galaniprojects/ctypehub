import { ChildProcess, spawn } from 'node:child_process';
import process from 'node:process';

import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { format } from 'prettier';

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

let server: ChildProcess;
let blockchainContainer: StartedTestContainer;
let databaseContainer: StartedTestContainer;
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

  // configure the tests to talk to a new Astro instance
  server = spawn('yarn', ['dev'], {
    detached: true,
    env: { MODE: 'test', DATABASE_URI: configuration.databaseUri },
  });
  configuration.baseUri = await new Promise((resolve) => {
    /*server.stderr?.on('data', (buffer: Buffer) => {
      console.log(buffer.toString('utf-8'));
    });*/
    server.stdout?.on('data', async (buffer: Buffer) => {
      const text = buffer.toString('utf-8');
      // console.log(text);
      const match = text.match(/http:\S+/);
      if (!match) {
        return;
      }
      await fetch(`${match[0]}liveness`);
      resolve(match[0]);
    });
  });
}

export async function teardown() {
  await new Promise<void>((resolve) => {
    server.on('close', resolve);
    if (server.pid) {
      process.kill(-server.pid);
    }
  });
  await blockchainContainer.stop();
  await databaseContainer.stop();
}

export async function getSnapshotHtmlForPath(path: string) {
  const response = await fetch(`${configuration.baseUri}test/${path}`);
  const html = await response.text();
  const pure = html.replace(/^.*<\/script>/s, '').replace(/ astro-\w+/g, '');
  return format(pure, { parser: 'html' });
}
