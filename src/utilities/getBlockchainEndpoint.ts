export function getBlockchainEndpoint() {
  const node = document.querySelector('[data-blockchain-endpoint]');
  return (node as HTMLElement).dataset.blockchainEndpoint as string;
}
