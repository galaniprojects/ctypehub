import { FormEvent, useCallback, useState } from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import {
  Blockchain,
  connect,
  CType,
  Did,
  disconnect,
  KiltAddress,
} from '@kiltprotocol/sdk-js';

import styles from './CreateForm.module.css';

import { InjectedAccount, SelectAccount } from '../SelectAccount/SelectAccount';
import { Modal } from '../Modal/Modal';
import { PropertyFields } from '../PropertyFields/PropertyFields';
import { getProperties } from '../PropertyFields/getProperties';
import { offsets } from '../../utilities/offsets';
import { getBlockchainEndpoint } from '../../utilities/getBlockchainEndpoint';
import { generatePath, paths } from '../../paths';

export function CreateForm() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const handleAddPropertyClick = useCallback(
    () => setPropertiesCount(propertiesCount + 1),
    [propertiesCount],
  );

  const [account, setAccount] = useState<InjectedAccount>();
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState(false);
  const unsetError = useCallback(() => setError(false), []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!account) {
          throw new Error('Cannot trigger submit without an account');
        }

        setProgress(true);
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string | undefined;
        const values = [...formData.entries()] as [string, string][];

        const properties = getProperties(propertiesCount, values);
        const cType = CType.fromProperties(title, properties);
        const cTypeUrl = generatePath(paths.ctypeDetails, cType.$id);

        const api = await connect(getBlockchainEndpoint());
        const existing = await api.query.ctype.ctypes(
          CType.idToHash(cType.$id),
        );
        if (existing.isSome) {
          const redirect = window.confirm(
            'Such CType already exists. Open its page?',
          );
          if (redirect) {
            window.location.href = cTypeUrl;
          }
          return;
        }

        const createTx = api.tx.ctype.add(CType.toChain(cType));
        const authorized = await window.kilt.sporran.signExtrinsicWithDid(
          createTx.toHex(),
          account.address as KiltAddress,
        );
        const creator = Did.parse(authorized.didKeyUri).did;
        const authorizedTx = api.tx(authorized.signed);

        const injected = await web3FromSource(account.meta.source);
        const signed = await authorizedTx.signAsync(account.address, injected);
        await Blockchain.submitSignedTx(signed);

        const extrinsicHash = signed.hash.toHex();
        const response = await fetch(paths.ctypes, {
          method: 'POST',
          body: JSON.stringify({ cType, extrinsicHash, creator, description }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          window.location.href = `${cTypeUrl}?success`;
          return;
        }

        console.error(response);
        setError(true);
      } finally {
        setProgress(false);
        await disconnect();
      }
    },
    [account, propertiesCount],
  );

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h3 className={styles.heading}>Create a Claim Type</h3>

      <p>
        <label className={styles.label}>
          Title:
          <input className={styles.input} name="title" required />
        </label>
      </p>

      <p>
        <label className={styles.label}>
          Description:
          <textarea className={styles.description} name="description" />
        </label>
      </p>

      {offsets(propertiesCount).map((index) => (
        <fieldset key={index} className={styles.fieldset}>
          <legend>Property {index + 1}</legend>
          <PropertyFields index={index} />
        </fieldset>
      ))}

      <fieldset className={styles.fieldset}>
        <legend>Property {propertiesCount + 1}</legend>
        <p>
          <button
            type="button"
            onClick={handleAddPropertyClick}
            className={styles.add}
          >
            Add Property ➕️
          </button>
        </p>
      </fieldset>

      <SelectAccount onSelect={setAccount} />

      <button type="submit" className={styles.submit}>
        Create Claim Type
      </button>

      {progress && (
        <Modal>
          <p className={styles.progress}>
            <span className={styles.spinner} />
            Storing the CType on the KILT blockchain
          </p>
        </Modal>
      )}

      {error && (
        <Modal>
          <output className={styles.output}>Error: Transaction Failed</output>
          <button type="button" onClick={unsetError} className={styles.retry}>
            Try again
          </button>
        </Modal>
      )}
    </form>
  );
}
