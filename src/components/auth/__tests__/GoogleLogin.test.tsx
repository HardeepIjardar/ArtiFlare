import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoogleLogin from '../GoogleLogin';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('GoogleLogin', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockGoogleLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      googleLogin: mockGoogleLogin,
    });
  });

  it('renders the Google login button', () => {
    render(<GoogleLogin />);
    
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  it('calls onSuccess when login is successful', async () => {
    mockGoogleLogin.mockResolvedValueOnce({ error: null });
    
    render(<GoogleLogin onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it('calls onError when login fails with an error object', async () => {
    const errorMessage = 'Login failed';
    mockGoogleLogin.mockResolvedValueOnce({ error: errorMessage });
    
    render(<GoogleLogin onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('calls onError when login throws an exception', async () => {
    const errorMessage = 'Unexpected error';
    mockGoogleLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<GoogleLogin onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles login without callbacks', async () => {
    mockGoogleLogin.mockResolvedValueOnce({ error: null });
    
    render(<GoogleLogin />);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalled();
    });
  });
}); 