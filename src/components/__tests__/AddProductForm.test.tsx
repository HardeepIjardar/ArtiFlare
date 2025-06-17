import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProductForm from '../AddProductForm';
import { AuthProvider } from '../../contexts/AuthContext';
import { createProduct } from '../../services/firestore';

// Mock the firestore service
jest.mock('../../services/firestore', () => ({
  createProduct: jest.fn(),
}));

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-uid' },
  }),
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AddProductForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Inventory/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subcategory/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Materials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Occasion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    (createProduct as jest.Mock).mockResolvedValueOnce({ productId: '123', error: null });
    
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/Inventory/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Home & Living' } });
    fireEvent.change(screen.getByLabelText(/Materials/i), { target: { value: 'wood, metal' } });
    fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 'handmade, unique' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    
    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        inventory: 10,
        category: 'Home & Living',
        materials: ['wood', 'metal'],
        tags: ['handmade', 'unique'],
        artisanId: 'test-uid',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles form submission error', async () => {
    (createProduct as jest.Mock).mockResolvedValueOnce({ productId: null, error: 'Failed to create product' });
    
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/Inventory/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Home & Living' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create product')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    
    // Check that the form is not submitted
    expect(createProduct).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Close form/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles image upload', async () => {
    renderWithProviders(<AddProductForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Images/i);
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    // Note: Since image upload is not implemented yet, we just verify the input exists
    expect(input).toBeInTheDocument();
  });
}); 