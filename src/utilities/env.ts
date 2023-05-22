// This file addresses two issues.
// 1) During the build process Astro captures and inlines the values of environment variables accessed via import.meta.env.*, meanwhile process.env.* cannot be used in the development mode.
// 2) The current setup of ts-jest panics on the first occurrence of import.meta, so this whole file has to be replaced via moduleNameMapper.

export const MODE = import.meta.env.MODE;
export const PROD = import.meta.env.PROD;

export const PORT = globalThis.process.env.PORT || import.meta.env.PORT;

export const URL = globalThis.process.env.URL || import.meta.env.URL;

export const SUBSCAN_HOST =
  globalThis.process.env.SUBSCAN_HOST || import.meta.env.SUBSCAN_HOST;

export const SECRET_SUBSCAN =
  globalThis.process.env.SECRET_SUBSCAN || import.meta.env.SECRET_SUBSCAN;

export const BLOCKCHAIN_ENDPOINT =
  globalThis.process.env.BLOCKCHAIN_ENDPOINT ||
  import.meta.env.BLOCKCHAIN_ENDPOINT;

export const DATABASE_URI =
  globalThis.process.env.DATABASE_URI || import.meta.env.DATABASE_URI;
