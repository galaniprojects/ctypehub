import { got } from 'got';

import { configuration } from '../configuration';

const { indexer } = configuration;

const queryBlocks = `
  query {
    blocks(orderBy: TIME_STAMP_DESC, first: 3) {
      totalCount
      nodes {
        id
        timeStamp
        hash
      }
    }
  }
`;

export async function queryFromIndexer(query: string = queryBlocks) {
  try {
    const response = await got.post(indexer.graphqlEndpoint, {
      json: {
        query,
      },
      responseType: 'json',
    });

    console.log('Response from GraphQL', JSON.stringify(response.body));

    return response.body;
  } catch (error) {
    console.error('Error:', error);
  }
}
