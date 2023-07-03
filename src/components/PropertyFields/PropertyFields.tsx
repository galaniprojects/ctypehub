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

  const [isEnum, setIsEnum] = useState<boolean>();
  const handleIsEnumChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setIsEnum(event.currentTarget.value === 'enum'),
    [],
  );

  const [type, setType] = useState<PropertyType>('string');
  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newType = event.currentTarget.value as PropertyType;
      setType(newType);
      if (!['string', 'integer', 'number'].includes(newType)) {
        setIsEnum(undefined);
      }
    },
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
            $id of Referenced Claim Type or one of its properties
            <input
              name={`${prefix}$ref`}
              className={styles.input}
              placeholder="kilt:ctype:0x…"
              pattern="kilt:ctype:0x[0-9a-f]+(#/properties/.+)?"
              required
            />
          </label>
        </p>
      )}

      {['string', 'integer', 'number'].includes(type) && (
        <fieldset className={styles.fieldset}>
          <legend>Limitations (optional)</legend>

          <p className={styles.group}>
            <label className={styles.array}>
              <input
                name={`${prefix}limitations`}
                type="radio"
                value="any"
                onChange={handleIsEnumChange}
              />
              any matching value
            </label>
            <label className={styles.array}>
              <input
                name={`${prefix}limitations`}
                type="radio"
                value="enum"
                onChange={handleIsEnumChange}
              />
              fixed set of values
            </label>
          </p>

          {isEnum === false && type === 'string' && (
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

          {isEnum === false && ['integer', 'number'].includes(type) && (
            <div className={styles.group}>
              <p>
                <label className={styles.label}>
                  Minimum value (optional):
                  <input
                    name={`${prefix}minimum`}
                    type="number"
                    className={styles.input}
                    step="any"
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
                    step="any"
                  />
                </label>
              </p>
            </div>
          )}

          {isEnum && (
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
        </fieldset>
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
              Minimum number of values (optional):
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
              Maximum number of values (optional):
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
