// The current setup of ts-jest panics on the first occurrence of import.meta,
// so we only access the environment variables via this file,
// and replace it whole via moduleNameMapper for ts-jest.

export const MODE = import.meta.env.MODE;
export const PROD = import.meta.env.PROD;
export const PORT = import.meta.env.PORT;
export const SUBSCAN_NETWORK = import.meta.env.SUBSCAN_NETWORK;
export const SECRET_SUBSCAN = import.meta.env.SECRET_SUBSCAN;
export const BLOCKCHAIN_ENDPOINT = import.meta.env.BLOCKCHAIN_ENDPOINT;
export const DATABASE_URI = import.meta.env.DATABASE_URI;
