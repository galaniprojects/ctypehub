import { got } from 'got';

import { configuration } from '../configuration';
import { logger } from '../logger';
import { sleep } from '../sleep';

import { writeQuery } from './writeQuery';

const { indexer } = configuration;

const QUERY_INTERVAL_MS = 1000;
export const QUERY_SIZE = 10;

/** Example Query. */
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

export async function queryFromIndexer(query: string = queryBlocks) {
  logger.debug(
    `Querying from GraphQL under ${indexer.graphqlEndpoint}, using this payload: ${query} `,
  );
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

export async function* matchesGenerator<T extends Record<string, unknown>>(
  queryParams: Parameters<typeof writeQuery>[0],
): AsyncGenerator<T, void> {
  if (indexer.graphqlEndpoint === 'NONE') {
    return;
  }
  const writtenQuery = writeQuery(queryParams);
  const { totalCount, matches } = await queryFromIndexer(writtenQuery);

  if (matches === undefined) {
    throw new Error(
      'You need to include "nodes" as a field (with subfields) on your query to get matches.',
    );
  }
  if (totalCount === undefined) {
    throw new Error(
      'Please, include "totalCount" as a field on your query for better handling.',
    );
  }

  if (totalCount === 0) {
    logger.debug(
      `The Indexed Data under "${indexer.graphqlEndpoint}" has no matches for query: ${writtenQuery}.`,
    );
    return;
  }

  if (totalCount === matches.length) {
    for (const match of matches) {
      yield match as T;
    }
  } else {
    for (
      let index = queryParams.offset ?? 0;
      index < totalCount;
      index += QUERY_SIZE
    ) {
      queryParams.offset = index;
      const { matches } = await queryFromIndexer(writeQuery(queryParams));

      if (!matches) {
        continue;
        // maybe 'break' instead?
      }

      for (const match of matches) {
        yield match as T;
      }
      await sleep(QUERY_INTERVAL_MS);
    }
  }
}
