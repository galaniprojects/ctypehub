import type { PropertyType } from './getProperties';

import { ChangeEvent, Fragment, useCallback, useState } from 'react';

import styles from './PropertyFields.module.css';

import { getPrefixByIndex } from './getPrefixByIndex';

export function PropertyFields({ index }: { index: number }) {
  const prefix = getPrefixByIndex(index);

  const [isArray, setIsArray] = useState(false);
  const handleArrayChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setIsArray(event.currentTarget.checked),
    [],
  );

  const [type, setType] = useState<PropertyType>('string');
  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      setType(event.currentTarget.value as PropertyType),
    [],
  );

  return (
    <Fragment>
      <p>
        <label className={styles.label}>
          Name:
          <input name={`${prefix}name`} className={styles.input} required />
        </label>
      </p>
      <p>
        <label className={styles.label}>
          Type:
          <select
            name={`${prefix}type`}
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
              name={`${prefix}$ref`}
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
                  name={`${prefix}minLength`}
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
                  name={`${prefix}maxLength`}
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
              <select name={`${prefix}format`} className={styles.input}>
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
                name={`${prefix}minimum`}
                type="number"
                className={styles.input}
              />
            </label>
          </p>
          <p>
            <label className={styles.label}>
              Maximum value (optional):
              <input
                name={`${prefix}maximum`}
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
              name={`${prefix}enum`}
              className={styles.input}
              pattern="[^,](,.+)*"
            />
          </label>
        </p>
      )}

      <p>
        <label className={styles.array}>
          <input
            name={`${prefix}array`}
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
                name={`${prefix}minItems`}
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
                name={`${prefix}maxItems`}
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
