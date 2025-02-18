import {
  BalanceUtils,
  Blockchain,
  ConfigService,
  type KiltAddress,
  Utils,
} from '@kiltprotocol/sdk-js';

export async function endowAccount(address: KiltAddress) {
  const api = ConfigService.get('api');

  const tx = api.tx.balances.transferKeepAlive(
    address,
    BalanceUtils.toFemtoKilt(1000),
  );
  const faucet = Utils.Crypto.makeKeypairFromUri(
    'receive clutch item involve chaos clutch furnace arrest claw isolate okay together',
  );

  await Blockchain.signAndSubmitTx(tx, faucet);
}
