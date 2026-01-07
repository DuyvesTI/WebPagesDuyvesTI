import { render, screen } from '@testing-library/react';
import Hello from '../Hello';

describe('Hello', () => {
  it('renders the provided name', () => {
    render(<Hello name="World" />);
    expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  });
});
