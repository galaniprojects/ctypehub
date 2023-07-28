import { promisify } from 'node:util';
import { ChildProcess, exec, spawn } from 'node:child_process';
import process from 'node:process';

import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

const env = {
  MODE: 'test',
  SUBSCAN_NETWORK: 'example',
  SECRET_SUBSCAN: 'SECRET_SUBSCAN',
  BLOCKCHAIN_ENDPOINT: '',
  DATABASE_URI: '',
  DID: 'placeholder',
  SECRET_PAYER_MNEMONIC: 'placeholder',
  SECRET_AUTHENTICATION_MNEMONIC: 'placeholder',
  SECRET_ASSERTION_METHOD_MNEMONIC: 'placeholder',
  SECRET_KEY_AGREEMENT_MNEMONIC: 'placeholder',
};

let server: ChildProcess;
let blockchainContainer: StartedTestContainer;
let databaseContainer: StartedTestContainer;

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
    const endpoint = `ws://${host}:${port}`;
    env.BLOCKCHAIN_ENDPOINT = endpoint;
    process.env.BLOCKCHAIN_ENDPOINT = endpoint;
  }

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
    const databaseUri = `postgres://postgres:${POSTGRES_PASSWORD}@${host}:${port}/postgres`;
    env.DATABASE_URI = databaseUri;
    process.env.DATABASE_URI = databaseUri;
  }

  // configure the tests to talk to a new Astro instance
  const yarn = (await promisify(exec)('which yarn')).stdout.trim();
  server = spawn(yarn, ['dev'], { detached: true, env });
  process.env.URL = await new Promise((resolve) => {
    server.stderr?.on('data', (buffer: Buffer) => {
      console.log(buffer.toString('utf-8'));
    });
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
