import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../../app/dashboard/page';

describe('Dashboard Page', () => {
  it('should render dashboard layout', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should display account summary cards', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Total Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
  });

  it('should show quick action buttons', () => {
    render(<DashboardPage />);
    
    expect(screen.getByRole('button', { name: /New Transaction/i })).toBeInTheDocument();
  });
});