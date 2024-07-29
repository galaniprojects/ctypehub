import { got } from 'got';

import { configuration } from '../configuration';
import { logger } from '../logger';

// import { sleep } from '../sleep';

const { indexer } = configuration;

// const QUERY_INTERVAL_MS = 1000;

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
      nodes?: Array<Record<string, unknown>>;
    }
  >;
}

interface BadQueryError {
  error: {
    errors: Array<{
      message: string;
      extensions: {
        code: string;
        exception: { stacktrace: string[] };
      };
    }>;
  };
}

function isBadQueryError(response: object): response is BadQueryError {
  const responseFields = Object.keys(response);
  return responseFields.includes('error');
}
export async function queryFromIndexer(query: string = queryBlocks) {
  // logger.info('indexer endpoint: ' + indexer.graphqlEndpoint);

  const response = await got
    .post(indexer.graphqlEndpoint, {
      json: {
        query,
      },
    })
    .json<FetchedData | BadQueryError>();

  if (isBadQueryError(response)) {
    response.error.errors.forEach((err) => {
      logger.error(
        `Query to endpoint "${indexer.graphqlEndpoint}" resulted on Error: "${err.message}"`,
      );
    });
    throw new Error(
      `Bad Query to endpoint "${indexer.graphqlEndpoint}". Please, check the logs ad correct the query.`,
    );
  }

  const entities = Object.entries(response.data);

  entities.length > 1 &&
    logger.error('Please, avoid multiple queries in a single request.');

  const [name, { totalCount, nodes: matches }] = entities[0];

  totalCount ??
    logger.error(
      'The query did not ask for total count. Please add field "totalCount" to your query.',
    );

  matches ??
    logger.error(
      'You need to include "nodes" as a field (with subfields) on your query to get matches.',
    );

  logger.info(
    `Completed querying '${name}' from GraphQL under ${indexer.graphqlEndpoint}.`,
  );

  // logger.info('Response from GraphQL: ' + JSON.stringify(response, null, 2));

  logger.info(
    `Got ${matches ? matches.length : 'none'} out of ${totalCount} '${name}' matching query.`,
  );

  // matches.forEach((match, index) => {
  //   logger.info(
  //     `#${index} match from query: ${JSON.stringify(match, null, 2)}`,
  //   );
  // });

  return { totalCount, matches };
}

export async function* matchesGenerator(query: string = queryBlocks) {
  if (indexer.graphqlEndpoint === 'NONE') {
    return;
  }
  const { totalCount: count, matches } = await queryFromIndexer(query);

  if (matches === undefined) {
    throw new Error(
      'You need to include "nodes" as a field (with subfields) on your query to get matches.',
    );
  }

  // const blockRange = `${fromBlock} - ${fromBlock + BLOCK_RANGE_SIZE}`;

  if (count === 0) {
    logger.debug(
      `The Indexed Data under "${indexer.graphqlEndpoint}" has no matches for query: ${query}.`,
    );
    // await sleep(QUERY_INTERVAL_MS);
    // continue;
  }
  for (const match of matches) {
    yield match;
  }
}
