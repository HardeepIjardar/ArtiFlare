import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const TestComponent = () => <div>Protected Content</div>;

const renderWithRouter = (component: React.ReactNode, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={component}>
          <Route path="/" element={<TestComponent />} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/admin" element={<div>Admin Page</div>} />
          <Route path="/artisan" element={<div>Artisan Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when authentication is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      isLoading: true,
    });

    renderWithRouter(<ProtectedRoute />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute />);
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid' },
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute />);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects admin routes when user is not an admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid' },
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />, ['/admin']);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects artisan routes when user is not an artisan', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid' },
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['artisan']} />, ['/artisan']);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access to admin routes when user is an admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid', role: 'admin' },
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />, ['/admin']);
    
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('allows access to artisan routes when user is an artisan', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid', role: 'artisan' },
      isLoading: false,
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['artisan']} />, ['/artisan']);
    
    expect(screen.getByText('Artisan Page')).toBeInTheDocument();
  });
}); 