// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateForm } from './CreateForm';
import { useSupportedExtensions } from './useSupportedExtensions';

vi.mock('./useSupportedExtensions');
vi.mocked(useSupportedExtensions).mockReturnValue([
  { key: 'sporran', name: 'Sporran' },
]);

describe('CreateForm', () => {
  it('should render', async () => {
    const { container, queryAllByLabelText, getByText, getByLabelText } =
      render(<CreateForm />);
    expect(container).toMatchSnapshot();

    await userEvent.click(getByText(/Add Property/));
    await waitFor(() => queryAllByLabelText('Type:').length === 1);
    expect(container).toMatchSnapshot('adding property');

    await userEvent.type(
      getByLabelText('Tags (Optional):'),
      'tag1  ,tag2, x, tag3,',
    );
    expect(container).toMatchSnapshot('with tags');
  });
});
