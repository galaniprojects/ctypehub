import { ChangeEvent, useCallback, useState } from 'react';

import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { connect, disconnect } from '@kiltprotocol/sdk-js';

import inputStyles from '../Input/Input.module.css';
import buttonStyles from '../Button.module.css';

export type InjectedAccount = Awaited<ReturnType<typeof web3Accounts>>[number];

const originName = 'CTypeHub';

// TODO
const BLOCKCHAIN_ENDPOINT = 'wss://peregrine.kilt.io';

interface Props {
  onSelect: (account: InjectedAccount) => void;
}

export function SelectAccount({ onSelect }: Props) {
  const [genesisHash, setGenesisHash] = useState<string>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>();

  const handleEnableClick = useCallback(async () => {
    const api = await connect(BLOCKCHAIN_ENDPOINT);
    setGenesisHash(api.genesisHash.toHex());
    await disconnect();

    await web3Enable(originName);
    const loaded = await web3Accounts();

    setAccounts(loaded);
    onSelect(loaded[0]);
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

  if (!accounts) {
    return (
      <button
        onClick={handleEnableClick}
        className={buttonStyles.primary}
        type="button"
      >
        Select payment KILT account
      </button>
    );
  }

  return (
    <select onChange={handleChange} className={inputStyles.component}>
      {accounts.map(({ meta }, index) => {
        const disabled = meta.genesisHash !== genesisHash;
        return (
          <option value={index} key={index} disabled={disabled}>
            {disabled && '[Not KILT]'} {meta.name} ({meta.source})
          </option>
        );
      })}
    </select>
  );
}
