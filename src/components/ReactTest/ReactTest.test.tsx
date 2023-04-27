import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react';

import { ReactTest } from './ReactTest';

describe('ReactTest', () => {
  it('should match snapshot', async () => {
    const { container } = render(<ReactTest />);
    expect(container).toMatchSnapshot();
  });
});
