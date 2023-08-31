import type { APIContext } from 'astro';

import { StatusCodes } from 'http-status-codes';

const credentials: Record<string, unknown> = {
  'http://dev.ctypehub.galaniprojects.de': {
    '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
    linked_dids: [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://identity.foundation/.well-known/did-configuration/v1',
        ],
        issuer: 'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY',
        issuanceDate: '2023-07-26T12:01:23.082Z',
        expirationDate: '2028-07-24T12:01:23.083Z',
        type: [
          'VerifiableCredential',
          'DomainLinkageCredential',
          'KiltCredential2020',
        ],
        credentialSubject: {
          id: 'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY',
          origin: 'https://dev.ctypehub.galaniprojects.de',
          rootHash:
            '0x9bd5cd61a115f41233c3acb0a233d6482c6d334a39fffb49b3d44a4950cfcd57',
        },
        proof: {
          type: 'KILTSelfSigned2020',
          proofPurpose: 'assertionMethod',
          verificationMethod:
            'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY#0x7c9d3d1ba1cb9f70915af0e5a356233bfcac727b57210f8a31b173c84e28a15b',
          signature:
            '0xaccd9a3ff2861f24f67c08bd066b4b0dd8b54f96a49bdd1d3d9fad1e3c3feb886024d850973371879629874c7532f1ab2824cd7b0eeb860350517dab7d9de104',
        },
      },
    ],
  },
  'http://localhost:3000': {
    '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
    linked_dids: [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://identity.foundation/.well-known/did-configuration/v1',
        ],
        issuer: 'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY',
        issuanceDate: '2023-07-26T11:54:26.840Z',
        expirationDate: '2028-07-24T11:54:26.840Z',
        type: [
          'VerifiableCredential',
          'DomainLinkageCredential',
          'KiltCredential2020',
        ],
        credentialSubject: {
          id: 'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY',
          origin: 'http://localhost:3000',
          rootHash:
            '0x61ff56cc865a8256c67d8ddd8781221a934c167238348db473329aeaf21019b7',
        },
        proof: {
          type: 'KILTSelfSigned2020',
          proofPurpose: 'assertionMethod',
          verificationMethod:
            'did:kilt:4tZYfZJk9FnfMj5FR2xXQYVoJJ59dL6NVMmD3UAy2br9DExY#0x7c9d3d1ba1cb9f70915af0e5a356233bfcac727b57210f8a31b173c84e28a15b',
          signature:
            '0x96a461255173d5daddcc9f0adf15cf2aaaec2c9d2e46b9d7648d5569ef30551ab199e954f0ae15cc8d4e3a68c77f8a73130479efd5becbd8e070ff9b231ebd0f',
        },
      },
    ],
  },
};

export async function GET({ url }: APIContext) {
  const { origin } = url;

  const configuration = credentials[origin];
  if (!configuration) {
    return new Response(`Not found for origin ${origin}`, {
      status: StatusCodes.NOT_FOUND,
    });
  }

  return new Response(JSON.stringify(configuration), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
