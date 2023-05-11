// can’t use import.meta.env in Jest, but as a module this can be mocked away
export const {
  MODE,
  PROD,
  PORT,
  URL,
  SUBSCAN_HOST,
  SECRET_SUBSCAN,
  BLOCKCHAIN_ENDPOINT,
  DATABASE_URI,
} = import.meta.env;
