import type { CTypeData } from '../../models/ctype';

import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react';

import { CTypeOverview } from './CTypeOverview';

const mockCTypeData: CTypeData = {
  id: 'kilt:ctype:0xexample',
  schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'Example CType',
  properties: { example: { type: 'string' }, isExample: { type: 'boolean' } },
  type: 'object',
  creator: 'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY',
  createdAt: new Date(1684341336000),
  extrinsicHash: '0xexamplehash',
  description: 'This is some example cType data',
  block: '123',
};

describe('CTypeOverview', () => {
  it('should match snapshot', async () => {
    const { container } = render(<CTypeOverview cTypeData={mockCTypeData} />);
    expect(container).toMatchSnapshot();
  });
});
