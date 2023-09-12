import type { DidResourceUri, KiltAddress } from '@kiltprotocol/sdk-js';

declare global {
  interface Window {
    kilt: Record<
      string,
      {
        name: string;
        signExtrinsicWithDid: (
          extrinsic: string,
          signer: KiltAddress,
        ) => Promise<{ signed: string; didKeyUri: DidResourceUri }>;
      }
    >;
  }
}
