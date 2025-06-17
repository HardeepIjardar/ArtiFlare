import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProductForm from '../EditProductForm';
import { useAuth } from '../../../contexts/AuthContext';
import { updateProduct } from '../../../services/firestore';
import { uploadMultipleImages, deleteImage } from '../../../services/storage';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the firestore service
jest.mock('../../../services/firestore', () => ({
  updateProduct: jest.fn(),
}));

// Mock the storage service
jest.mock('../../../services/storage', () => ({
  uploadMultipleImages: jest.fn(),
  deleteImage: jest.fn(),
}));

describe('EditProductForm', () => {
  const mockProduct = {
    id: 'test-product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    discountedPrice: 80,
    category: 'jewelry',
    subcategory: 'necklace',
    inventory: 10,
    isCustomizable: true,
    materials: ['gold', 'silver'],
    occasion: 'wedding',
    tags: ['handmade', 'luxury'],
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    currency: 'INR',
    artisanId: 'test-artisan-id',
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-user-id' },
    });
  });

  it('renders form with initial product data', () => {
    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/Price/i)).toHaveValue('100');
    expect(screen.getByLabelText(/Discounted Price/i)).toHaveValue('80');
    expect(screen.getByLabelText(/Inventory Quantity/i)).toHaveValue('10');
    expect(screen.getByLabelText(/Category/i)).toHaveValue('jewelry');
    expect(screen.getByLabelText(/Subcategory/i)).toHaveValue('necklace');
    expect(screen.getByLabelText(/Occasion/i)).toHaveValue('wedding');
  });

  it('handles form submission successfully', async () => {
    (updateProduct as jest.Mock).mockResolvedValueOnce({ success: true });

    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Update form fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Updated Product' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '150' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Product/i }));

    await waitFor(() => expect(updateProduct).toHaveBeenCalledWith('test-product-id', expect.objectContaining({
      name: 'Updated Product',
      price: 150,
    })));
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });

  it('handles form submission error', async () => {
    (updateProduct as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Failed to update product',
    });

    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Product/i }));

    await waitFor(() => expect(screen.getByText('Failed to update product')).toBeInTheDocument());
    await waitFor(() => expect(mockOnSuccess).not.toHaveBeenCalled());
  });

  it('handles image upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImageUrl = 'https://example.com/new-image.jpg';
    (uploadMultipleImages as jest.Mock).mockResolvedValueOnce([mockImageUrl]);

    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const fileInput = screen.getByLabelText(/Upload Images/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(uploadMultipleImages).toHaveBeenCalledWith(
        [mockFile],
        `products/${mockProduct.id}/images`
      );
    });
  });

  it('handles image deletion', async () => {
    (deleteImage as jest.Mock).mockResolvedValueOnce(undefined);

    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Remove Image/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteImage).toHaveBeenCalledWith(mockProduct.images[0]);
    });
  });

  it('validates required fields', async () => {
    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // Clear required fields
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Inventory Quantity/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: '' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Product/i }));

    expect(screen.getByLabelText(/Product Name/i)).toBeInvalid();
    expect(screen.getByLabelText(/Price/i)).toBeInvalid();
    expect(screen.getByLabelText(/Inventory Quantity/i)).toBeInvalid();
    expect(screen.getByLabelText(/Category/i)).toBeInvalid();
  });

  it('handles cancel button click', () => {
    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    (updateProduct as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Update Product/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Updating/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 