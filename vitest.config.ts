import { defineConfig } from 'vitest/config';
import GithubActionsReporter from 'vitest-github-actions-reporter';

export default defineConfig({
  test: {
    setupFiles: ['testing/setup.ts'],
    globalSetup: ['testing/globalSetup.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', new GithubActionsReporter()]
      : 'default',
    singleThread: true,
  },
});
