/// <reference types="astro/client" />

import type { DidResourceUri, KiltAddress } from '@kiltprotocol/sdk-js';

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
