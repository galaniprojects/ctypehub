// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateForm } from './CreateForm';

describe('CreateForm', () => {
  it('should render', async () => {
    const { container, queryAllByLabelText, getByText } = render(
      <CreateForm />,
    );
    expect(container).toMatchSnapshot();

    await userEvent.click(getByText(/Add Property/));
    await waitFor(() => queryAllByLabelText('Type:').length === 1);
    expect(container).toMatchSnapshot();
  });
});
