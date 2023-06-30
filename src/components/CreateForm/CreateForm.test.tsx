// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateForm } from './CreateForm';

describe('CreateForm', () => {
  it('should render', async () => {
    const { container, getByLabelText, getByText } = render(<CreateForm />);
    expect(container).toMatchSnapshot();

    await userEvent.click(getByText(/Add Property/));
    await waitFor(() => getByLabelText('Type:'));
    expect(container).toMatchSnapshot();
  });
});
