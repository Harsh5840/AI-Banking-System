import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';

describe('Home Page', () => {
  it('should render the hero section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/AI-Powered Banking/i)).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Double-Entry Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Fraud Detection/i)).toBeInTheDocument();
  });

  it('should show statistics section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Transactions Processed/i)).toBeInTheDocument();
  });
});