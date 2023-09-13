import type { CTypeData } from '../../models/ctype';

import type { TagData } from '../../models/tag';

import { useCallback, useEffect, useState } from 'react';

import { sessionHeader } from '../../utilities/sessionHeader';
import { paths } from '../../paths';

export interface APICTypeData extends Omit<CTypeData, 'tags'> {
  tags?: TagData[];
}

export function useCTypes(sessionId: string | undefined) {
  const [cTypes, setCTypes] = useState<APICTypeData[]>([]);

  const fetchBefore = useCallback(
    async (before?: Date) => {
      if (!sessionId) {
        throw new Error('No session ID');
      }
      const headers = {
        'Content-Type': 'application/json',
        [sessionHeader]: sessionId,
      };

      const url = new URL(paths.moderationCTypes, location.origin);
      if (before) {
        url.searchParams.set('before', before.toISOString());
      }

      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        console.error(response);
        throw new Error('Unable to fetch CTypes');
      }

      const newCTypes = (await response.json()) as APICTypeData[];
      setCTypes((existingCTypes) => {
        const lastKnownId = existingCTypes.at(-1)?.id;
        while (newCTypes.some(({ id }) => id === lastKnownId)) {
          newCTypes.shift();
        }
        return [...existingCTypes, ...newCTypes];
      });
    },
    [sessionId],
  );

  const loadMore = useCallback(() => {
    (async () => {
      const oldest = cTypes.at(-1);
      if (oldest) {
        await fetchBefore(new Date(oldest.createdAt));
      }
    })();
  }, [cTypes, fetchBefore]);

  useEffect(() => {
    if (sessionId) {
      (async () => {
        await fetchBefore();
      })();
    }
  }, [fetchBefore, sessionId]);

  return { cTypes, loadMore };
}
