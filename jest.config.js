export default {
  coverageProvider: 'v8',
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: '<rootDir>/testing/globalSetup.ts',
  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: '<rootDir>/testing/globalTeardown.ts',
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    env$: '<rootDir>/testing/env.ts',
    '\\.css$': '<rootDir>/testing/identity-obj-proxy.js',
  },
  // Use this configuration option to add custom reporters to Jest
  reporters: ['default', 'github-actions'],
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/testing/jest.setup.ts'],
  // A map from regular expressions to paths to transformers
  transform: {
    '\\.tsx?$': 'ts-jest/legacy',
    'node_modules/@polkadot/.*': 'babel-jest',
    'node_modules/@babel/runtime/.*': 'babel-jest',
  },
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/(?!(@polkadot)|(@babel/runtime))'],
};
