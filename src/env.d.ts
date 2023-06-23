/// <reference types="astro/client" />

import type { DidResourceUri, KiltAddress } from '@kiltprotocol/sdk-js';

declare module 'jest-serializer-vue';

declare global {
  interface Window {
    kilt: Record<
      string,
      {
        signExtrinsicWithDid: (
          extrinsic: string,
          signer: KiltAddress,
        ) => Promise<{ signed: string; didKeyUri: DidResourceUri }>;
      }
    >;
  }
}
