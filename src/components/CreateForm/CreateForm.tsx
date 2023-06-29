import {
  ChangeEvent,
  FormEvent,
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { web3FromSource } from '@polkadot/extension-dapp';
import {
  Blockchain,
  connect,
  CType,
  Did,
  disconnect,
  ICType,
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

type PropertyType = 'string' | 'integer' | 'number' | 'boolean' | 'reference';

function PropertyFields({ prefix }: { prefix: string }) {
  const [isArray, setIsArray] = useState(false);
  const handleArrayChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setIsArray(event.currentTarget.checked),
    [],
  );

  const [type, setType] = useState<PropertyType>('string');
  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      setType(event.currentTarget.value as typeof type),
    [],
  );

  // TODO: enums

  return (
    <Fragment>
      <p>
        <label className={styles.label}>
          Name:
          <input name={`${prefix}.name`} className={styles.input} required />
        </label>
      </p>
      <p>
        <label className={styles.label}>
          Type:
          <select
            name={`${prefix}.type`}
            className={styles.input}
            onChange={handleTypeChange}
          >
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="reference">reference</option>
          </select>
        </label>
      </p>

      {type === 'reference' && (
        <p>
          <label className={styles.label}>
            $id of Referenced Claim Type:
            <input
              name={`${prefix}.$ref`}
              className={styles.input}
              placeholder="kilt:ctype:0x…"
              pattern="kilt:ctype:0x[0-9a-f]+"
              required
            />
          </label>
        </p>
      )}

      {type === 'string' && (
        <Fragment>
          <div className={styles.group}>
            <p>
              <label className={styles.label}>
                Minimum length (optional):
                <input
                  name={`${prefix}.minLength`}
                  type="number"
                  min={0}
                  step={1}
                  className={styles.input}
                />
              </label>
            </p>
            <p>
              <label className={styles.label}>
                Maximum length (optional):
                <input
                  name={`${prefix}.maxLength`}
                  type="number"
                  min={0}
                  step={1}
                  className={styles.input}
                />
              </label>
            </p>
          </div>
          <p>
            <label className={styles.label}>
              Format (optional):
              <select name={`${prefix}.format`} className={styles.input}>
                <option value="">unset</option>
                <option value="date">date</option>
                <option value="time">time</option>
                <option value="uri">URI</option>
              </select>
            </label>
          </p>
        </Fragment>
      )}

      {['integer', 'number'].includes(type) && (
        <div className={styles.group}>
          <p>
            <label className={styles.label}>
              Minimum value (optional):
              <input
                name={`${prefix}.minimum`}
                type="number"
                className={styles.input}
              />
            </label>
          </p>
          <p>
            <label className={styles.label}>
              Maximum value (optional):
              <input
                name={`${prefix}.maximum`}
                type="number"
                className={styles.input}
              />
            </label>
          </p>
        </div>
      )}

      {['string', 'integer', 'number'].includes(type) && (
        <p>
          <label className={styles.label}>
            Comma-separated list of allowed values, no spaces (optional):
            <input
              name={`${prefix}.enum`}
              className={styles.input}
              pattern="[^,](,.+)*"
            />
          </label>
        </p>
      )}

      <p>
        <label className={styles.array}>
          <input
            name={`${prefix}.array`}
            type="checkbox"
            value="array"
            onChange={handleArrayChange}
          />
          is an array of such values
        </label>
      </p>

      {isArray && (
        <div className={styles.group}>
          <p>
            <label className={styles.label}>
              Minimum of items (optional):
              <input
                name={`${prefix}.minItems`}
                type="number"
                min={0}
                step={1}
                className={styles.input}
              />
            </label>
          </p>
          <p>
            <label className={styles.label}>
              Maximum of items (optional):
              <input
                name={`${prefix}.maxItems`}
                type="number"
                min={0}
                step={1}
                className={styles.input}
              />
            </label>
          </p>
        </div>
      )}
    </Fragment>
  );
}

function offsets(length: number) {
  return new Array(length).fill(1).map((dummy, index) => index);
}

function parseNumbersList(
  list: string | undefined,
  parse: (input: string) => number,
) {
  if (!list) {
    return undefined;
  }
  const numbersList = list.split(',').map((value) => parse(value));
  if (numbersList?.some(Number.isNaN)) {
    const error = `Cannot parse as list of numbers: ${list}`;
    alert(error);
    throw new Error(error);
  }
  return numbersList;
}

function getProperties(
  count: number,
  allValues: [string, string][],
): ICType['properties'] {
  const rawProperties = offsets(count).map((index) => {
    const prefix = `property[${index}].`;
    const matching = allValues.filter(
      ([name, value]) => name.startsWith(prefix) && value !== '',
    );
    return Object.fromEntries(
      matching.map(([name, value]) => [name.replace(prefix, ''), value]),
    );
  });

  return Object.fromEntries(
    rawProperties.map((property) => {
      const type = property.type as PropertyType;

      let data;
      if (type === 'reference') {
        data = { $ref: property.$ref };
      }

      if (type === 'boolean') {
        data = { type };
      }

      if (type === 'string') {
        const { format, minLength, maxLength, enum: list } = property;
        data = {
          type,
          ...(format && { format }),
          ...(minLength && { minLength: parseInt(minLength) }),
          ...(maxLength && { maxLength: parseInt(maxLength) }),
          ...(list && { enum: list.split(',') }),
        };
      }

      if (['integer', 'number'].includes(type)) {
        const { minimum, maximum, enum: list } = property;

        const parse = type === 'integer' ? parseInt : parseFloat;
        const numbersList = parseNumbersList(list, parse);

        data = {
          type,
          ...(minimum && { minimum: parseFloat(minimum) }),
          ...(maximum && { maximum: parseFloat(maximum) }),
          ...(numbersList && { enum: numbersList }),
        };
      }

      const { name, array, minItems, maxItems } = property;
      if (!array) {
        return [name, data];
      }

      return [
        name,
        {
          type: 'array',
          items: data,
          ...(minItems && { minItems: parseInt(minItems) }),
          ...(maxItems && { maxItems: parseInt(maxItems) }),
        },
      ];
    }),
  );
}

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
          <PropertyFields prefix={`property[${index}]`} />
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
