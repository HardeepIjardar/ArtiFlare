import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddProduct from '../AddProduct';
import { useAuth } from '../../../contexts/AuthContext';
import { createProduct } from '../../../services/firestore';
import { uploadMultipleImages } from '../../../services/storage';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the firestore service
jest.mock('../../../services/firestore', () => ({
  createProduct: jest.fn(),
}));

// Mock the storage service
jest.mock('../../../services/storage', () => ({
  uploadMultipleImages: jest.fn(),
}));

describe('AddProduct', () => {
  const mockCurrentUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockCurrentUser,
    });
  });

  it('renders form with initial empty values', () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Discounted Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Inventory Quantity/i)).toHaveValue('1');
    expect(screen.getByLabelText(/Category/i)).toHaveValue('');
    expect(screen.getByLabelText(/Subcategory/i)).toHaveValue('');
    expect(screen.getByLabelText(/Occasion/i)).toHaveValue('');
  });

  it('handles form submission successfully', async () => {
    (createProduct as jest.Mock).mockResolvedValueOnce({ error: null });

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Inventory Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'jewelry' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Product',
      price: 100,
      inventory: 10,
      category: 'jewelry',
      artisanId: mockCurrentUser.uid,
    })));
    await waitFor(() => expect(screen.getByText('Product created successfully!')).toBeInTheDocument());
  });

  it('handles form submission error', async () => {
    (createProduct as jest.Mock).mockResolvedValueOnce({
      error: 'Failed to create product',
    });

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Inventory Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'jewelry' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create product')).toBeInTheDocument();
    });
  });

  it('handles image upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImageUrl = 'https://example.com/new-image.jpg';
    (uploadMultipleImages as jest.Mock).mockResolvedValueOnce([mockImageUrl]);

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText(/Upload Images/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(uploadMultipleImages).toHaveBeenCalledWith(
        [mockFile],
        `products/${mockCurrentUser.uid}/images`
      );
    });
  });

  it('handles image removal', async () => {
    const mockImageUrl = 'https://example.com/image.jpg';
    (uploadMultipleImages as jest.Mock).mockResolvedValueOnce([mockImageUrl]);

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Upload an image
    const fileInput = screen.getByLabelText(/Upload Images/i);
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByAltText('Product image')).toBeInTheDocument();
    });

    // Remove the image
    const removeButton = screen.getByRole('button', { name: /Remove Image/i });
    fireEvent.click(removeButton);

    expect(screen.queryByAltText('Product image')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Submit form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    expect(screen.getByLabelText(/Product Name/i)).toBeInvalid();
    expect(screen.getByLabelText(/Price/i)).toBeInvalid();
    expect(screen.getByLabelText(/Inventory Quantity/i)).toBeInvalid();
    expect(screen.getByLabelText(/Category/i)).toBeInvalid();
  });

  it('shows error when user is not logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
    });

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Inventory Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'jewelry' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    expect(screen.getByText('You must be logged in to add a product.')).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    (createProduct as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Inventory Quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'jewelry' },
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Add Product/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Adding/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 