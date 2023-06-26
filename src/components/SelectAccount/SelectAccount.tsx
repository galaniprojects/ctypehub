import { ChangeEvent, useCallback, useState } from 'react';

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { connect, disconnect } from '@kiltprotocol/sdk-js';

import styles from './SelectAccount.module.css';

import { getBlockchainEndpoint } from '../../utilities/getBlockchainEndpoint';

export type InjectedAccount = Awaited<ReturnType<typeof web3Accounts>>[number];

const originName = 'CTypeHub';

interface Props {
  onSelect: (account: InjectedAccount) => void;
}

export function SelectAccount({ onSelect }: Props) {
  const [genesisHash, setGenesisHash] = useState<string>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>();

  const handleEnableClick = useCallback(async () => {
    const api = await connect(getBlockchainEndpoint());
    const apiGenesisHash = api.genesisHash.toHex();
    setGenesisHash(apiGenesisHash);
    await disconnect();

    await web3Enable(originName);
    const loaded = await web3Accounts();
    if (loaded.length === 0) {
      return;
    }

    setAccounts(loaded);

    const usable = loaded.find(
      ({ meta: { genesisHash } }) => genesisHash === apiGenesisHash,
    );
    if (usable) {
      onSelect(usable);
    }
  }, [onSelect]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (!accounts) {
        throw new Error('OnChange cannot be called before accounts');
      }
      const index = parseInt(event.currentTarget.value);
      onSelect(accounts[index]);
    },
    [accounts, onSelect],
  );

  return (
    <p className={styles.label}>
      <button onClick={handleEnableClick} className={styles.load} type="button">
        Load accounts
      </button>
      and{' '}
      <label>
        select payment KILT account:
        <select onChange={handleChange} className={styles.select} required>
          {accounts?.map(({ meta }, index) => {
            const disabled = meta.genesisHash !== genesisHash;
            return (
              <option value={index} key={index} disabled={disabled}>
                {disabled && '[Not KILT] '} {meta.name} ({meta.source})
              </option>
            );
          })}
        </select>
      </label>
    </p>
  );
}
