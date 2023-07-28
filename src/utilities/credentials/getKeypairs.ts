import { Utils } from '@kiltprotocol/sdk-js';
import { memoize } from 'lodash-es';

import { configuration } from '../configuration';
import { initKilt } from '../initKilt';

export const getKeypairs = memoize(async () => {
  await initKilt();

  const payer = Utils.Crypto.makeKeypairFromUri(configuration.payerMnemonic);

  const authentication = Utils.Crypto.makeKeypairFromUri(
    configuration.authenticationMnemonic,
  );

  const assertionMethod = Utils.Crypto.makeKeypairFromUri(
    configuration.assertionMethodMnemonic,
  );

  const keyAgreement = Utils.Crypto.makeEncryptionKeypairFromSeed(
    Utils.Crypto.mnemonicToMiniSecret(configuration.keyAgreementMnemonic),
  );

  return {
    payer,
    authentication,
    assertionMethod,
    keyAgreement,
  };
});
