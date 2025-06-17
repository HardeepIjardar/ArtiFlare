import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePassword from '../ChangePassword';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ChangePassword', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockUpdatePassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      updatePassword: mockUpdatePassword,
    });
  });

  it('renders all form fields correctly', () => {
    render(<ChangePassword />);
    
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<ChangePassword onError={mockOnError} />);
    
    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'different123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('shows error when new password is too short', async () => {
    render(<ChangePassword onError={mockOnError} />);
    
    // Fill in the form with a short password
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'short' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    expect(screen.getByText('New password must be at least 6 characters long')).toBeInTheDocument();
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('calls onSuccess when password is updated successfully', async () => {
    mockUpdatePassword.mockResolvedValueOnce({ error: null });
    
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpass123');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it('calls onError when password update fails', async () => {
    const errorMessage = 'Failed to update password';
    mockUpdatePassword.mockResolvedValueOnce({ error: errorMessage });
    
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('toggles password visibility when show/hide buttons are clicked', () => {
    render(<ChangePassword />);
    
    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    
    // Initially all passwords should be hidden
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Click show buttons
    fireEvent.click(screen.getByRole('button', { name: /Show password/i }));
    fireEvent.click(screen.getByRole('button', { name: /Show password/i }));
    fireEvent.click(screen.getByRole('button', { name: /Show password/i }));
    
    // All passwords should be visible
    expect(currentPasswordInput).toHaveAttribute('type', 'text');
    expect(newPasswordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    // Click hide buttons
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    
    // All passwords should be hidden again
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('disables submit button while loading', async () => {
    mockUpdatePassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<ChangePassword />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    // Button should be disabled and show loading state
    expect(screen.getByRole('button', { name: /Updating/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update Password/i })).not.toBeDisabled();
    });
  });
}); 