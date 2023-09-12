import type { ICType } from '@kiltprotocol/sdk-js';

import { offsets } from '../../utilities/offsets';

import { getPrefixByIndex } from './getPrefixByIndex';
import { parseNumbersList } from './parseNumbersList';

export type PropertyType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'reference';

export function getProperties(
  count: number,
  allValues: Array<[string, string]>,
): ICType['properties'] {
  const rawProperties = offsets(count).map((index) => {
    const prefix = getPrefixByIndex(index);
    const matching = allValues.filter(
      ([name, value]) => name.startsWith(prefix) && value !== '',
    );
    return Object.fromEntries(
      matching.map(([name, value]) => [name.replace(prefix, ''), value]),
    );
  });

  // I couldn’t fix that
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
