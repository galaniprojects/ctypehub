import { QUERY_SIZE } from './queryFromIndexer';

export function buildQuery({
  entity,
  alias,
  fields,
  querySize = QUERY_SIZE,
  offset = 0,
  filter,
  fragments,
}: {
  entity: string;
  alias?: string;
  fields: string[];
  filter?: string;
  querySize?: number;
  offset?: number;
  fragments?: string[];
}) {
  // BlockIDs are strings, this means that "42" > "1000"
  // Sadly, time_stamps can only be use to order queries of blocks.
  // Specially for queries with many matches, it is important to request an order of the results, to avoid duplicates and assure totality.
  // It does not matter what the order criterion is used as long as it is consistent.
  // ID_ASC exists for all entities, so it should work as a general approach.
  return `
  query {
    ${alias ? alias + ':' : ''} ${entity}(orderBy: ID_ASC, first: ${querySize}, offset: ${offset}, ${filter ? 'filter: ' + filter : ''}) {
      totalCount
      nodes {
        ${fields.join('\n        ')}
      }
    }
  }
  ${fragments ? fragments.join('\n') : ''}
`;
}
