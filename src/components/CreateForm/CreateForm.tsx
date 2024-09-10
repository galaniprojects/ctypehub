import {
  connect,
  CType,
  Did,
  disconnect,
  type KiltAddress,
} from '@kiltprotocol/sdk-js';
import { web3FromSource } from '@polkadot/extension-dapp';
import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useState,
} from 'react';

import styles from './CreateForm.module.css';

import { generatePath, paths } from '../../paths';
import { getBlockchainEndpoint } from '../../utilities/getBlockchainEndpoint';
import { offsets } from '../../utilities/offsets';
import { Modal } from '../Modal/Modal';
import { PropertyFields } from '../PropertyFields/PropertyFields';
import { getProperties } from '../PropertyFields/getProperties';
import {
  type InjectedAccount,
  SelectAccount,
} from '../SelectAccount/SelectAccount';

import { useSupportedExtensions } from './useSupportedExtensions';

export function CreateForm() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const handleAddPropertyClick = useCallback(
    () => setPropertiesCount(propertiesCount + 1),
    [propertiesCount],
  );

  const [tags, setTags] = useState<string[]>([]);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().replace(/,/g, '').toLowerCase();
      if (!trimmed || trimmed.length < 2 || tags.includes(trimmed)) {
        return;
      }
      setTags([...tags, trimmed]);
    },
    [tags],
  );

  const handleTagInputKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { key, currentTarget } = event;

      if (![',', 'Backspace'].includes(key)) {
        return;
      }

      if (key === ',' && currentTarget.value) {
        addTag(currentTarget.value);
        currentTarget.value = '';
      }
      if (key === 'Backspace' && !currentTarget.value && tags.length > 0) {
        const lastTag = tags.slice(-1)[0];
        setTags(tags.slice(0, -1));
        currentTarget.value = lastTag;
      }
    },
    [addTag, tags],
  );

  const handleTagInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      addTag(event.currentTarget.value);
      event.currentTarget.value = '';
    },
    [addTag],
  );

  const handleRemoveTag = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setTags(tags.filter((tag) => tag !== event.currentTarget.value));
    },
    [tags],
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
        const values = [...formData.entries()] as Array<[string, string]>;

        const properties = getProperties(propertiesCount, values);
        const cType = CType.fromProperties(title, properties);
        const cTypeUrl = generatePath(paths.ctypeDetails, cType.$id);

        const api = await connect(getBlockchainEndpoint());
        const existing = await api.query.ctype.ctypes(
          CType.idToHash(cType.$id),
        );
        if (existing.isSome) {
          const redirect = window.confirm(
            'An identical CType already exists. Open its page?',
          );
          if (redirect) {
            window.location.href = cTypeUrl;
          }
          return;
        }

        const nativeEvent = event.nativeEvent as SubmitEvent;
        const submitter = nativeEvent.submitter as HTMLButtonElement;
        const extensionKey = submitter.value;
        const extension = window.kilt[extensionKey];

        const createTx = api.tx.ctype.add(CType.toChain(cType));
        const authorized = await extension.signExtrinsicWithDid(
          createTx.toHex(),
          account.address as KiltAddress,
        );
        const creator = Did.parse(authorized.didKeyUri).did;
        const authorizedTx = api.tx(authorized.signed);

        const injected = await web3FromSource(account.meta.source);
        await authorizedTx.signAndSend(account.address, injected);

        const response = await fetch(paths.ctypes, {
          method: 'POST',
          body: JSON.stringify({
            cType,
            creator,
            description,
            tags,
          }),
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
    [account, propertiesCount, tags],
  );

  const extensions = useSupportedExtensions();

  return (
    <section className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.heading}>Create a Claim Type</h3>

        <p>
          To create a Claim Type you need a{' '}
          <a
            className={styles.anchor}
            href="https://kilt-protocol.org/get-did/index.html"
          >
            KILT DID
          </a>{' '}
          and the{' '}
          <a className={styles.anchor} href="https://www.sporran.org/">
            Sporran wallet
          </a>{' '}
          (or another wallet supporting the{' '}
          <a
            className={styles.anchor}
            href="https://github.com/KILTprotocol/spec-ext-didsign-api"
          >
            DID Sign API Specification v1.1+
          </a>
          )
        </p>

        <p>
          <label className={styles.label}>
            Title:
            <input className={styles.input} name="title" required />
          </label>
        </p>

        <p>
          <label className={styles.label}>
            Description (optional):
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
              Add Property
            </button>
          </p>
        </fieldset>

        <div className={styles.label}>
          <label htmlFor="tagInput">Tags (Optional):</label>
          <ul className={styles.tags}>
            {tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  aria-label="remove tag"
                  className={styles.removeTag}
                  value={tag}
                  onClick={handleRemoveTag}
                />
              </li>
            ))}

            <li className={styles.tagInputContainer}>
              <input
                id="tagInput"
                className={styles.tagInput}
                onKeyUp={handleTagInputKeyUp}
                onBlur={handleTagInputBlur}
                maxLength={50}
                aria-describedby="tagInputDescription"
              />
            </li>
          </ul>
          <p id="tagInputDescription" className={styles.tagInputDescription}>
            Enter a comma after each tag
          </p>
        </div>

        <SelectAccount onSelect={setAccount} />

        {extensions.length === 0 && <p>No wallets detected</p>}
        {extensions.map(({ key, name }) => (
          <button type="submit" className={styles.submit} value={key} key={key}>
            Create Claim Type via {name}
          </button>
        ))}

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
    </section>
  );
}
