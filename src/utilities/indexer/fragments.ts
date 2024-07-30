export const wholeBlock = `
fragment wholeBlock on Block {
  id
  hash
  timeStamp
}`;

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
