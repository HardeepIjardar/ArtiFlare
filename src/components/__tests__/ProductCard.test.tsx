import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { AuthProvider } from '../../contexts/AuthContext';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import { db } from '../../services/firebase';
import { Product } from '../../services/firestore';

// Mock the firebase/firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

// Mock the firebase service
jest.mock('../../services/firebase', () => ({
  db: {},
}));

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  currency: 'INR',
  images: ['test-image.jpg'],
  category: 'Test Category',
  artisanId: 'artisan1',
  inventory: 10,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProps = {
  product: mockProduct,
  artisanName: 'Test Artisan',
  inCart: false,
  quantity: 1,
  showQuantitySelector: false,
  onAddToCart: jest.fn(),
  onIncrement: jest.fn(),
  onDecrement: jest.fn(),
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          {component}
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard {...mockProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('by Test Artisan')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('calls onAddToCart when Add to Cart button is clicked', () => {
    renderWithProviders(<ProductCard {...mockProps} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(mockProps.onAddToCart).toHaveBeenCalledWith('1');
  });

  it('shows quantity selector when showQuantitySelector is true', () => {
    renderWithProviders(
      <ProductCard {...mockProps} showQuantitySelector={true} />
    );
    
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onIncrement when + button is clicked', () => {
    renderWithProviders(
      <ProductCard {...mockProps} showQuantitySelector={true} />
    );
    
    const incrementButton = screen.getByText('+');
    fireEvent.click(incrementButton);
    
    expect(mockProps.onIncrement).toHaveBeenCalledWith('1');
  });

  it('calls onDecrement when - button is clicked', () => {
    renderWithProviders(
      <ProductCard {...mockProps} showQuantitySelector={true} />
    );
    
    const decrementButton = screen.getByText('-');
    fireEvent.click(decrementButton);
    
    expect(mockProps.onDecrement).toHaveBeenCalledWith('1');
  });

  it('navigates to product details when View Details is clicked', () => {
    renderWithProviders(<ProductCard {...mockProps} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    // Check if the URL has changed to the product details page
    expect(window.location.pathname).toBe('/products/1');
  });

  it('displays wishlist button for authenticated users', async () => {
    // Mock authenticated user
    const mockUser = { uid: 'test-uid' };
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      currentUser: mockUser,
    }));

    renderWithProviders(<ProductCard {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to wishlist|Remove from wishlist/i })).toBeInTheDocument();
    });
  });

  it('handles image loading error gracefully', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    };

    renderWithProviders(
      <ProductCard {...mockProps} product={productWithNoImages} />
    );
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });
}); 