// GraphQL provides reusable units called fragments.
// Fragments let you construct sets of fields, and then include them in queries where needed.
// You can use the fragments by including them as fields prefixed by 3 points "...", like shown on 'wholeAttestation'.
// See documentation here: https://graphql.org/learn/queries/#fragments
// Try out yourself under https://indexer.kilt.io/ & https://dev-indexer.kilt.io/

export const wholeBlock = `
fragment wholeBlock on Block {
  id
  hash
  timeStamp
}`;

/** If used, 'wholeBlock' also needs to be included. */
export const wholeAttestation = `
fragment wholeAttestation on Attestation {
  id
  claimHash
  cTypeId
  issuerId
  payer
  delegationID
  valid
  creationBlock {
    ...wholeBlock
  }
  revocationBlock {
    ...wholeBlock
  }
  removalBlock {
    ...wholeBlock
  }
}`;

export const DidNames = `
fragment DidNames on Did {
  id
  web3NameId
}`;
