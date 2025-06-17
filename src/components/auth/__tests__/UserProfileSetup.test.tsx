import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserProfileSetup from '../UserProfileSetup';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import { createUser } from '../../../services/firestore';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the firestore service
jest.mock('../../../services/firestore', () => ({
  createUser: jest.fn(),
}));

const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('UserProfileSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockCurrentUser,
    });
  });

  it('renders customer profile form correctly', () => {
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State\/Province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ZIP\/Postal Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Business\/Studio Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/About Your Craft/i)).not.toBeInTheDocument();
  });

  it('renders artisan profile form correctly', () => {
    renderWithRouter(<UserProfileSetup userType="artisan" />);
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State\/Province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ZIP\/Postal Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business\/Studio Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/About Your Craft/i)).toBeInTheDocument();
  });

  it('pre-fills display name from current user', () => {
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    const displayNameInput = screen.getByLabelText(/Full Name/i);
    expect(displayNameInput).toHaveValue('Test User');
  });

  it('handles form submission for customer profile', async () => {
    (createUser as jest.Mock).mockResolvedValueOnce({ error: null });
    
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith('test-uid', expect.objectContaining({
        displayName: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        role: 'customer',
      }));
    });
  });

  it('handles form submission for artisan profile', async () => {
    (createUser as jest.Mock).mockResolvedValueOnce({ error: null });
    
    renderWithRouter(<UserProfileSetup userType="artisan" />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Business\/Studio Name/i), { target: { value: 'Artisan Studio' } });
    fireEvent.change(screen.getByLabelText(/About Your Craft/i), { target: { value: 'Crafting beautiful items' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith('test-uid', expect.objectContaining({
        displayName: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        role: 'artisan',
        companyName: 'Artisan Studio',
        bio: 'Crafting beautiful items',
      }));
    });
  });

  it('shows error message when profile creation fails', async () => {
    const errorMessage = 'Failed to create profile';
    (createUser as jest.Mock).mockResolvedValueOnce({ error: errorMessage });
    
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows error when no user is found', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
    });
    
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    expect(screen.getByText('No user found. Please log in again.')).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    (createUser as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithRouter(<UserProfileSetup userType="customer" />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    // Button should be disabled and show loading state
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Profile/i })).not.toBeDisabled();
    });
  });
}); 