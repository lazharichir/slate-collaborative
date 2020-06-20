import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import Button from "./record/component/Button";

test('renders learn react link', () => {
  const { getByText } = render(<Button active>learn react</Button>);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
