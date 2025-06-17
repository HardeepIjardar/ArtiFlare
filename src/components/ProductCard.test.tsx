import { render, screen, fireEvent } from '@testing-library/react';
import { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-id' },
    isAuthenticated: true,
  }),
}));

// Mock CurrencyContext
jest.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    formatPrice: (price: number) => `$${price.toFixed(2)}`,
  }),
}));

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  image: '/test-image.jpg',
  category: 'test-category',
  artisanId: 'artisan123',
  inventory: 50,
  currency: 'USD',
  images: ['/test-image.jpg'],
  createdAt: new Date(),
  updatedAt: new Date(),
  averageRating: 4.5,
  totalReviews: 100
};

const mockProps = {
  product: mockProduct,
  artisanName: 'Test Artisan',
  inCart: false,
  quantity: 1,
  onAddToCart: jest.fn(),
  onRemoveFromCart: jest.fn(),
  onUpdateQuantity: jest.fn(),
  onToggleWishlist: jest.fn(),
  showQuantitySelector: true,
  onIncrement: jest.fn(),
  onDecrement: jest.fn()
};

describe('ProductCard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders product information correctly', () => {
    render(<ProductCard {...mockProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Artisan')).toBeInTheDocument();
  });

  it('navigates to product detail page when clicked', () => {
    render(<ProductCard {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('product-card'));
    expect(mockNavigate).toHaveBeenCalledWith('/products/1');
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    render(<ProductCard {...mockProps} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockProps.onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('shows quantity selector when product is in cart', () => {
    render(<ProductCard {...mockProps} inCart={true} />);
    
    expect(screen.getByTestId('quantity-selector')).toBeInTheDocument();
  });
});
