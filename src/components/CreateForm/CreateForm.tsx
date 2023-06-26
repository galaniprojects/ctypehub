import { FormEvent, useCallback, useState } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import {
  Blockchain,
  connect,
  CType,
  disconnect,
  KiltAddress,
} from '@kiltprotocol/sdk-js';

import styles from './CreateForm.module.css';

import { InjectedAccount, SelectAccount } from '../SelectAccount/SelectAccount';
import { getBlockchainEndpoint } from '../../utilities/getBlockchainEndpoint';

export function CreateForm() {
  const [account, setAccount] = useState<InjectedAccount>();

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!account) {
          // TODO better handling
          throw new Error('Account required');
        }

        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;

        const properties = {};
        const cType = CType.fromProperties(title, properties);

        const api = await connect(getBlockchainEndpoint());
        const createTx = api.tx.ctype.add(CType.toChain(cType));

        const authorized = await window.kilt.sporran.signExtrinsicWithDid(
          createTx.toHex(),
          account.address as KiltAddress,
        );
        const authorizedTx = api.tx(authorized.signed);

        const injected = await web3FromSource(account.meta.source);
        const signed = await authorizedTx.signAsync(account.address, injected);
        await Blockchain.submitSignedTx(signed);

        // TODO: post to backend
      } finally {
        await disconnect();
      }
    },
    [account],
  );

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label>
          Title:
          <input className={styles.title} name="title" required />
        </label>
      </p>

      <SelectAccount onSelect={setAccount} />

      <button type="submit" className={styles.submit}>
        Create
      </button>
    </form>
  );
}
