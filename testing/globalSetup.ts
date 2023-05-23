import { promisify } from 'node:util';
import { exec, spawn } from 'node:child_process';

import { GenericContainer, Wait } from 'testcontainers';

import { globalShared } from './globalShared';
import * as envMock from './env';

const env = { ...envMock, PROD: '', BLOCKCHAIN_ENDPOINT: '', DATABASE_URI: '' };

export default async function globalSetup() {
  const WS_PORT = 9944;

  // configure the code to use a local blank instance of blockchain
  globalShared.blockchainContainer = await new GenericContainer(
    'kiltprotocol/mashnet-node:latest',
  )
    .withCommand(['--dev', `--ws-port=${WS_PORT}`, '--ws-external'])
    .withExposedPorts(WS_PORT)
    .withWaitStrategy(Wait.forLogMessage(`:${WS_PORT}`))
    .start();

  {
    const port = globalShared.blockchainContainer.getMappedPort(WS_PORT);
    const host = globalShared.blockchainContainer.getHost();
    const endpoint = `ws://${host}:${port}`;
    env.BLOCKCHAIN_ENDPOINT = endpoint;
    process.env.BLOCKCHAIN_ENDPOINT = endpoint;
  }

  // configure the code to use a local blank database
  const DB_PORT = 5432;
  const POSTGRES_PASSWORD = 'postgres';
  globalShared.databaseContainer = await new GenericContainer('postgres')
    .withEnvironment({ POSTGRES_PASSWORD })
    .withExposedPorts(DB_PORT)
    .start();

  {
    const port = globalShared.databaseContainer.getMappedPort(DB_PORT);
    const host = globalShared.databaseContainer.getHost();
    const databaseUri = `postgres://postgres:${POSTGRES_PASSWORD}@${host}:${port}/postgres`;
    env.DATABASE_URI = databaseUri;
    process.env.DATABASE_URI = databaseUri;
  }

  // configure the tests to talk to a new Astro instance
  const yarn = (await promisify(exec)('which yarn')).stdout.trim();
  globalShared.server = spawn(yarn, ['dev'], { detached: true, env });
  process.env.URL = await new Promise((resolve) => {
    /*globalShared.server.stderr?.on('data', (buffer: Buffer) => {
      console.log(buffer.toString('utf-8'));
    });*/
    globalShared.server.stdout?.on('data', async (buffer: Buffer) => {
      const text = buffer.toString('utf-8');
      console.log(text);
      const match = text.match(/http:\S+/);
      if (!match) {
        return;
      }
      await fetch(`${match[0]}liveness`);
      resolve(match[0]);
    });
  });
}
