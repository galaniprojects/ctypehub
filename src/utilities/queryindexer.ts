import { got } from 'got';

const graphqlEndpoint = 'http://localhost:7777/';
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

export async function queryFromIndexer(query: string) {
  try {
    const response = await got.post(graphqlEndpoint, {
      json: {
        query: queryBlocks,
      },
      responseType: 'json',
    });

    console.log('Response from GraphQL', JSON.stringify(response.body));

    return response.body;
  } catch (error) {
    console.error('Error:', error);
  }
}
