import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getProducts, getUserData } from '../../services/firestore';
import { Product } from '../../types/product';
import ProductCard from '../../components/ProductCard';
import { getErrorMessage } from '../../utils/errorHandling';

const OccasionDetailPage: React.FC = () => {
  const { occasion } = useParams<{ occasion: string }>();
  const { addToCart, updateQuantity: updateCartQuantity, cartItems, removeFromCart } = useCart();
  const [showQuantitySelector, setShowQuantitySelector] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artisanNames, setArtisanNames] = useState<{ [key: string]: string }>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const [sortBy, setSortBy] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { products: fetchedProducts, error: productsError } = await getProducts();
        if (productsError) {
          setError(getErrorMessage(productsError));
        } else {
          setProducts(fetchedProducts);
          // Fetch artisan names for all products
          const uniqueArtisanIds = Array.from(new Set(fetchedProducts.map(p => p.artisanId)));
          const namesMap: { [key: string]: string } = {};
          await Promise.all(uniqueArtisanIds.map(async (artisanId) => {
            try {
              const result = await getUserData(artisanId);
              if (result.userData) {
                namesMap[artisanId] = result.userData.companyName || result.userData.displayName || 'Artisan';
              } else if (result.error) {
                console.error(`Error fetching artisan data for ${artisanId}:`, result.error);
              }
            } catch (err: unknown) {
              console.error(`Error fetching artisan data for ${artisanId}:`, err);
              namesMap[artisanId] = 'Artisan';
            }
          }));
          setArtisanNames(namesMap);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const handleAddToCartClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // First add 1 item to cart immediately
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      artisan: product.artisanId,
      image: product.images ? product.images[0] : '',
      currency: product.currency || 'INR',
    });
    
    // Show quantity selector for adjusting
    setShowQuantitySelector(prev => ({ ...prev, [productId]: true }));
    // Initialize quantity to 1
    setQuantities(prev => ({ ...prev, [productId]: 1 }));
  };

  const incrementQuantity = (productId: string) => {
    const newQuantity = (quantities[productId] || 1) + 1;
    setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    updateCartQuantity(productId, newQuantity);
  };

  const decrementQuantity = (productId: string) => {
    const currentQuantity = quantities[productId] || 1;
    if (currentQuantity <= 1) {
      // Remove from cart if quantity would be 0
      removeFromCart(productId);
      setShowQuantitySelector(prev => ({ ...prev, [productId]: false }));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } else {
      const newQuantity = currentQuantity - 1;
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
      updateCartQuantity(productId, newQuantity);
    }
  };

  // Filter products by occasion and other filters
  const occasionProducts = products
    .filter(product => 
      product.occasion?.toLowerCase() === occasion?.toLowerCase() &&
      (!selectedCategory || product.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
      (!priceRange.min || product.price >= priceRange.min) &&
      (!priceRange.max || product.price <= priceRange.max)
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime();
      return 0;
    });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-dark mb-6 capitalize">
            {occasion} Gifts
            <span className="text-dark-500 text-lg font-normal ml-2">
              ({occasionProducts.length} products)
            </span>
          </h1>
          <div className="relative">
            <button
              ref={filterBtnRef}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700 focus:outline-none"
              onClick={() => setFilterOpen(v => !v)}
            >
              Filter
            </button>
            {filterOpen && (
              <div ref={filterRef} className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-10 p-6">
                {/* X Close Button */}
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg font-bold focus:outline-none"
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filter"
                  type="button"
                >
                  ×
                </button>
                {/* Occasion (disabled, preselected) */}
                <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion
                </label>
                <input
                  id="occasion"
                  value={occasion}
                  disabled
                  className="block w-full mb-4 pl-3 pr-10 py-2 text-base border-gray-200 bg-gray-100 rounded-md text-gray-500 cursor-not-allowed"
                />
                {/* Category Filter */}
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="block w-full mb-4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {/* Price Range Filter */}
                <div className="flex items-center mb-4 gap-2">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      id="min-price"
                      type="number"
                      min="0"
                      value={priceRange.min === 0 ? '' : priceRange.min}
                      onChange={e => setPriceRange(pr => ({ ...pr, min: parseFloat(e.target.value) || 0 }))}
                      className="block w-full pl-2 pr-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  <span className="mx-2 text-gray-500">-</span>
                  <div className="flex-1">
                    <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      id="max-price"
                      type="number"
                      min="0"
                      value={priceRange.max === 0 ? '' : priceRange.max}
                      onChange={e => setPriceRange(pr => ({ ...pr, max: parseFloat(e.target.value) || 0 }))}
                      className="block w-full pl-2 pr-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                {/* Sort By Filter */}
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="block w-full mb-2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
                {/* Reset Button */}
                <button
                  className="mt-4 w-full bg-gray-200 text-dark py-2 rounded hover:bg-gray-300 transition-colors duration-150"
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: 0 });
                    setSortBy('');
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        {occasionProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-medium text-dark mb-2">No products found</h2>
            <p className="text-dark-500 mb-6">We couldn't find any products for this occasion.</p>
            <Link 
              to="/products" 
              className="inline-block bg-primary hover:bg-primary-700 text-white font-bold py-2 px-6 rounded"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {occasionProducts.map(product => {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  artisanName={artisanNames[product.artisanId] || 'Artisan'}
                  inCart={cartItems.some(item => item.id === product.id)}
                  quantity={quantities[product.id] || 1}
                  showQuantitySelector={!!showQuantitySelector[product.id]}
                  onAddToCart={handleAddToCartClick}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  onRemoveFromCart={() => {}}
                  onUpdateQuantity={() => {}}
                  onToggleWishlist={() => {}}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OccasionDetailPage; 