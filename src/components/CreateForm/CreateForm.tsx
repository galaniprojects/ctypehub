import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';
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
import { getBlockchainEndpoint } from '../../utilities/getBlockchainEndpoint';
import { generatePath, paths } from '../../paths';

function Modal({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const { current } = ref;
    current?.showModal();
    return () => {
      current?.close();
    };
  }, [ref]);

  return (
    <dialog ref={ref} className={styles.modal}>
      {children}
    </dialog>
  );
}

export function CreateForm() {
  const [account, setAccount] = useState<InjectedAccount>();
  const [error, setError] = useState(false);
  const unsetError = useCallback(() => setError(false), []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!account) {
          throw new Error('Cannot trigger submit without an account');
        }

        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;

        const properties = {};
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
          body: JSON.stringify({ cType, extrinsicHash, creator }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          window.location.href = cTypeUrl;
          return;
        }

        console.error(response);
        setError(true);
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
