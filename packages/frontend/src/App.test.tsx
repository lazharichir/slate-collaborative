import React from 'react';
import {render} from '@testing-library/react';
import Button from "./editor/Button";

test('renders learn react link', () => {
  const { getByText } = render(<Button active>learn react</Button>);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
