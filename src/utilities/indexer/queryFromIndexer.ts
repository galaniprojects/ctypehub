import { got } from 'got';

import { configuration } from '../configuration';
import { logger } from '../logger';

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

export interface FetchedData {
  data: Record<
    string,
    {
      totalCount?: number;
      nodes: Array<Record<string, unknown>>;
    }
  >;
}

export async function queryFromIndexer(query: string = queryBlocks) {
  try {
    // logger.info('indexer endpoint: ' + indexer.graphqlEndpoint);

    const response = await got
      .post(indexer.graphqlEndpoint, {
        json: {
          query,
        },
      })
      .json<FetchedData>();

    const entities = Object.entries(response.data);

    entities.length > 1 &&
      logger.error('Please, avoid multiple queries in a single request.');

    const [name, { totalCount, nodes: matches }] = entities[0];

    totalCount ??
      logger.error(
        'The query did not ask for total count. Please add field "totalCount" to your query.',
      );

    logger.info(
      `Completed querying '${name}' from GraphQL under ${indexer.graphqlEndpoint}.`,
    );

    // logger.info('Response from GraphQL: ' + JSON.stringify(response, null, 2));

    logger.info(
      `Got ${matches.length} out of ${totalCount} '${name}' matching query.`,
    );

    // matches.forEach((match, index) => {
    //   logger.info(
    //     `#${index} match from query: ${JSON.stringify(match, null, 2)}`,
    //   );
    // });

    return { totalCount, matches };
  } catch (error) {
    console.error(`Error Querying from ${indexer.graphqlEndpoint}:`, error);
  }
}
