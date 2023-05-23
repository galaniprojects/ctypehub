import { spawn } from 'node:child_process';

import { GenericContainer, Wait } from 'testcontainers';

import { globalShared } from './globalShared';

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
    process.env.BLOCKCHAIN_ENDPOINT = `ws://${host}:${port}`;
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
    process.env.DATABASE_URI = `postgres://postgres:${POSTGRES_PASSWORD}@${host}:${port}/postgres`;
  }

  // configure the tests to talk to a new Astro instance
  globalShared.server = spawn('which', ['yarn'], {
    detached: true,
    env: { MODE: 'test', DATABASE_URI: process.env.DATABASE_URI },
  });
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
