import { MouseEvent, useCallback, useEffect, useState } from 'react';

import { paths } from '../../paths';
import { sessionHeader } from '../../utilities/sessionHeader';
import { exceptionToError } from '../../utilities/exceptionToError';

import { apiWindow, getCompatibleExtensions, getSession } from './session';

export function Moderation() {
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
          >
            Sign in with {kilt[extension].name}
          </button>
        ))}

        {error}
      </form>
    );
  }

  return <div></div>;
}
