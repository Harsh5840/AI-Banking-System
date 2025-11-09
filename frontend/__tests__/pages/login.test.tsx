import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../../app/login/page';

describe('Login Page', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('should show OAuth buttons', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
  });
});