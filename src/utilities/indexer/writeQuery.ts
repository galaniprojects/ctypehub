export function writeQuery(
  entity: string,
  fields: string,
  querySize: number,
  offset: number,
  alias?: string,
) {
  return `
  query {
    ${alias ? alias + ':' : ''} ${entity}(orderBy: ID_ASC, first: ${querySize}, offset: ${offset}) {
    totalCount
      nodes {
        ${fields}
      }
    }
  }
`;
}
