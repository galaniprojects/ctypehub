import type { ICType } from '@kiltprotocol/sdk-js';

import { Fragment } from 'react';

import styles from './Property.module.css';

import { generatePath, paths } from '../../paths';

function isKiltCTypeRef(ref: string): ref is ICType['$id'] {
  const regex = /^kilt:ctype:0x([a-fA-F0-9]+)(#\/properties\/.+)?$/;
  return regex.test(ref);
}

function $refToHref($ref: string) {
  if (isKiltCTypeRef($ref)) {
    return generatePath(paths.ctypeDetails, $ref);
  }
  return $ref;
}

interface Props {
  ofArray?: boolean;
  value: ICType['properties'][string];
}

export function Property({ ofArray, value }: Props) {
  if ('$ref' in value) {
    return (
      <Fragment>
        <dt className={styles.term}>Referenced Claim Type:</dt>
        <dd className={styles.definition}>
          <a className={styles.anchor} href={$refToHref(value.$ref)}>
            {value.$ref}
          </a>
        </dd>
      </Fragment>
    );
  }

  const { type } = value;
  if (type === 'array') {
    const { items, minItems, maxItems } = value;
    return (
      <Fragment>
        <dt className={styles.term}>Type:</dt>
        <dd className={styles.definition}>array</dd>

        {minItems && (
          <Fragment>
            <dt className={styles.term}>Minimum number of values:</dt>
            <dd className={styles.definition}>{minItems}</dd>
          </Fragment>
        )}

        {maxItems && (
          <Fragment>
            <dt className={styles.term}>Maximum number of values:</dt>
            <dd className={styles.definition}>{maxItems}</dd>
          </Fragment>
        )}

        <Property ofArray value={items} />
      </Fragment>
    );
  }

  const isString = type === 'string';
  const isNumeric = type === 'number' || type === 'integer';

  return (
    <Fragment>
      <dt className={styles.term}>{ofArray ? 'Type of items:' : 'Type:'}</dt>
      <dd className={styles.definition}>{type}</dd>

      {(isString || isNumeric) && value.enum && (
        <Fragment>
          <dt className={styles.term}>Allowed values:</dt>
          <dd className={styles.definition}>
            <ul>
              {value.enum.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </dd>
        </Fragment>
      )}

      {isString && value.format && (
        <Fragment>
          <dt className={styles.term}>Format:</dt>
          <dd className={styles.definition}>
            {value.format === 'uri' ? 'URI' : value.format}
          </dd>
        </Fragment>
      )}

      {isString && value.minLength && (
        <Fragment>
          <dt className={styles.term}>Minimum length:</dt>
          <dd className={styles.definition}>{value.minLength}</dd>
        </Fragment>
      )}

      {isString && value.maxLength && (
        <Fragment>
          <dt className={styles.term}>Maximum length:</dt>
          <dd className={styles.definition}>{value.maxLength}</dd>
        </Fragment>
      )}

      {isNumeric && value.minimum && (
        <Fragment>
          <dt className={styles.term}>Minimum value:</dt>
          <dd className={styles.definition}>{value.minimum}</dd>
        </Fragment>
      )}

      {isNumeric && value.maximum && (
        <Fragment>
          <dt className={styles.term}>Maximum value:</dt>
          <dd className={styles.definition}>{value.maximum}</dd>
        </Fragment>
      )}
    </Fragment>
  );
}
