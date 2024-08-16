import { promisify } from 'node:util';
import { type ChildProcess, exec, spawn } from 'node:child_process';
import process from 'node:process';

import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

const env = {
  MODE: 'test',
  GRAPHQL_ENDPOINT: 'placeholder',
  BLOCKCHAIN_ENDPOINT: '',
  DATABASE_URI: '',
  DID: 'placeholder',
  SECRET_PAYER_MNEMONIC: 'placeholder',
  SECRET_AUTHENTICATION_MNEMONIC: 'placeholder',
  SECRET_ASSERTION_METHOD_MNEMONIC: 'placeholder',
  SECRET_KEY_AGREEMENT_MNEMONIC: 'placeholder',
  TZ: 'UTC',
  PATH: process.env.PATH,
};

let server: ChildProcess;
let blockchainContainer: StartedTestContainer;
let databaseContainer: StartedPostgreSqlContainer;

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
  databaseContainer = await new PostgreSqlContainer().start();
  const databaseUri = databaseContainer.getConnectionUri();
  env.DATABASE_URI = databaseUri;
  process.env.DATABASE_URI = databaseUri;

  // configure the tests to talk to a new Astro instance
  const pnpm = (await promisify(exec)('which pnpm')).stdout.trim();
  server = spawn(pnpm, ['dev'], { detached: true, env });
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
    if (server.pid !== undefined) {
      process.kill(-server.pid);
    }
  });
  await blockchainContainer.stop();
  await databaseContainer.stop();
}
