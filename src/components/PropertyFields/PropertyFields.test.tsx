// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PropertyFields } from './PropertyFields';

describe('<PropertyFields />', () => {
  it('renders correctly', async () => {
    const { container, getByLabelText } = render(<PropertyFields index={0} />);
    expect(container).toMatchSnapshot('string');

    await userEvent.click(getByLabelText('any matching value'));
    expect(container).toMatchSnapshot('string limitations');

    const name = getByLabelText('Name:');
    await userEvent.type(name, 'Name');

    const select = getByLabelText('Type:');

    await userEvent.selectOptions(select, 'boolean');
    expect(container).toMatchSnapshot('boolean');

    await userEvent.selectOptions(select, 'reference');
    expect(container).toMatchSnapshot('reference');

    await userEvent.selectOptions(select, 'number');
    expect(container).toMatchSnapshot('number');

    await userEvent.selectOptions(select, 'integer');
    expect(container).toMatchSnapshot('integer');

    await userEvent.click(getByLabelText('any matching value'));
    expect(container).toMatchSnapshot('integer limitations');

    await userEvent.click(getByLabelText('fixed set of values'));
    expect(container).toMatchSnapshot('integer enum');

    const array = getByLabelText(/array/i);
    await userEvent.click(array);
    expect(container).toMatchSnapshot('integer array');
  });
});
