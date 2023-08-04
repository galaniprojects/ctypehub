import type { CTypeData } from '../../models/ctype';

import { MouseEvent, useCallback, useEffect, useState } from 'react';

import styles from './Moderation.module.css';
import buttonStyles from '../Button.module.css';
import containerStyles from '../Container.module.css';

import { generatePath, paths } from '../../paths';
import { sessionHeader } from '../../utilities/sessionHeader';
import { exceptionToError } from '../../utilities/exceptionToError';

import { apiWindow, getCompatibleExtensions, getSession } from './session';

function CType({ sessionId, cType }: { sessionId: string; cType: CTypeData }) {
  const {
    id,
    createdAt,
    title,
    properties,
    description,
    tags,
    isHidden: initialIsHidden,
  } = cType;

  const [isHidden, setIsHidden] = useState(initialIsHidden);
  const [processing, setProcessing] = useState(false);

  const toggleHidden = useCallback(async () => {
    try {
      setProcessing(true);
      const headers = {
        'Content-Type': 'application/json',
        [sessionHeader]: sessionId,
      };
      const response = await fetch(paths.moderationCType, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, isHidden: !isHidden }),
      });

      if (!response.ok) {
        throw new Error('Unable to moderate CType');
      }
      setIsHidden(!isHidden);
    } catch (exception) {
      console.error(exception);
    } finally {
      setProcessing(false);
    }
  }, [id, isHidden, sessionId]);

  const propertyNames = Object.keys(properties).join(', ');
  const tagNames = tags?.map((tag) => `#${tag}`).join(', ');

  return (
    <tr className={styles.tableRow}>
      <td
        className={`${styles.tableDataDate} ${isHidden ? styles.hidden : ''}`}
      >
        {createdAt.toLocaleString()}
      </td>
      <td className={styles.tableDataDetails}>
        <p className={isHidden ? styles.hidden : ''}>
          {!isHidden && (
            <a
              href={generatePath(paths.ctypeDetails, id)}
              className={styles.link}
            >
              {title}
            </a>
          )}
          {isHidden && title}
        </p>
        {description && (
          <p className={isHidden ? styles.hidden : ''}>{description}</p>
        )}
        {propertyNames && (
          <p className={isHidden ? styles.hidden : ''}>{propertyNames}</p>
        )}
        {tagNames && (
          <p className={isHidden ? styles.hidden : ''}>{tagNames}</p>
        )}
      </td>
      <td className={styles.tableDataHidden}>
        <button
          type="button"
          onClick={toggleHidden}
          disabled={processing}
          aria-busy={processing}
          className={isHidden ? styles.unhide : styles.hide}
          aria-label={isHidden ? 'Unhide CType' : 'Hide CType'}
        />
      </td>
    </tr>
  );
}

interface Props {
  cTypes: CTypeData[];
}

export function Moderation({ cTypes }: Props) {
  const { kilt } = apiWindow;

  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState<string>();

  const [extensions, setExtensions] = useState(getCompatibleExtensions());
  useEffect(() => {
    function handler() {
      setExtensions(getCompatibleExtensions());
    }

    window.dispatchEvent(new CustomEvent('kilt-dapp#initialized'));
    window.addEventListener('kilt-extension#initialized', handler);
    return () =>
      window.removeEventListener('kilt-extension#initialized', handler);
  }, []);

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      try {
        const extension = event.currentTarget.value;

        const session = await getSession(kilt[extension]);

        const { sessionId } = session;
        const headers = {
          'Content-Type': 'application/json',
          [sessionHeader]: sessionId,
        };

        // define in advance how to handle the response from the extension
        await session.listen(async (message) => {
          // decrypt the message and verify credential in the backend:
          const response = await fetch(paths.moderationVerify, {
            method: 'POST',
            headers,
            body: JSON.stringify(message),
          });
          if (response.ok) {
            setSessionId(sessionId);
          } else {
            setError('unknown');
          }
        });

        // encrypt message on the backend
        const response = await fetch(paths.moderationVerify, { headers });
        const message = await response.json();

        // forward the encrypted message to the extension
        await session.send(message);
      } catch (exception) {
        const { message } = exceptionToError(exception);
        if (message.includes('closed') || message.includes('Rejected')) {
          setError('closed');
        } else if (message.includes('Not authorized')) {
          setError('rejected');
        } else {
          setError('unknown');
          console.error(exception);
        }
      }
    },
    [kilt],
  );

  if (!sessionId) {
    return (
      <form>
        {extensions.length === 0 && <p>Looking for a wallet…</p>}

        {extensions.map((extension) => (
          <button
            key={extension}
            onClick={handleClick}
            value={extension}
            type="button"
            className={buttonStyles.primary}
          >
            Sign in with {kilt[extension].name}
          </button>
        ))}

        {error}
      </form>
    );
  }

  return (
    <div className={containerStyles.container}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr className={styles.tableRow}>
            <th className={styles.tableHeaderDate}>Creation Date</th>
            <th className={styles.tableHeaderDetails}>Details</th>
            <th className={styles.tableHeaderHidden}>Hidden</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {cTypes.map((cType) => (
            <CType key={cType.id} sessionId={sessionId} cType={cType} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
