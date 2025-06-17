import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getProducts, getUserData } from '../../services/firestore';
import { Product } from '../../types/product';
import ProductCard from '../../components/ProductCard';
import { getErrorMessage } from '../../utils/errorHandling';
import { db } from '../../services/firebase';
import { Timestamp } from 'firebase/firestore';

const ProductsPage: React.FC = () => {
  const { addToCart, updateQuantity: updateCartQuantity, cartItems, removeFromCart } = useCart();
  const [showQuantitySelector, setShowQuantitySelector] = useState<{ [key: string]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artisanNames, setArtisanNames] = useState<{ [key: string]: string }>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const fetchProductsAndArtisans = async () => {
      try {
        const { products: fetchedProducts, error: productsError } = await getProducts();
        if (productsError) {
          setError(getErrorMessage(productsError));
          console.error('ProductsPage error:', productsError);
          // @ts-ignore
          console.log('Firebase project ID:', db.app.options.projectId);
        } else {
          setProducts(fetchedProducts);
          // Initialize quantities and showQuantitySelector
          const initialQuantities: { [key: string]: number } = {};
          const initialShowQuantitySelector: { [key: string]: boolean } = {};
          fetchedProducts.forEach(product => {
            initialQuantities[product.id] = 1;
            initialShowQuantitySelector[product.id] = false;
          });
          setQuantities(initialQuantities);
          setShowQuantitySelector(initialShowQuantitySelector);

          // Fetch artisan names
          const uniqueArtisanIds = Array.from(new Set(fetchedProducts.map(p => p.artisanId)));
          const namesMap: { [key: string]: string } = {};
          await Promise.all(uniqueArtisanIds.map(async (artisanId) => {
            try {
              const result = await getUserData(artisanId);
              if (result.userData) {
                const name = result.userData.companyName || result.userData.displayName || 'Artisan';
                namesMap[artisanId] = name;
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
        console.error('ProductsPage catch error:', err);
        // @ts-ignore
        console.log('Firebase project ID:', db.app.options.projectId);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndArtisans();
  }, []);

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

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        artisan: product.artisanId,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        currency: product.currency || 'INR'
      });
      setShowQuantitySelector(prev => ({ ...prev, [productId]: true }));
    }
  };

  const handleIncrement = (productId: string) => {
    const newQuantity = (quantities[productId] || 1) + 1;
    setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    updateCartQuantity(productId, newQuantity);
  };

  const handleDecrement = (productId: string) => {
    const currentQuantity = quantities[productId] || 1;
    if (currentQuantity <= 1) {
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

  // Filter products by all selected filters
  const filteredProducts = products
    .filter(product =>
      (!selectedOccasion || product.occasion?.toLowerCase() === selectedOccasion.toLowerCase()) &&
      (!selectedCategory || product.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
      (!priceRange.min || product.price >= priceRange.min) &&
      (priceRange.max === Infinity || product.price <= priceRange.max)
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') {
        const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : (a.createdAt || new Date(0));
        const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : (b.createdAt || new Date(0));
        return bDate.getTime() - aDate.getTime();
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:text-primary-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-dark mb-6">All Products</h1>
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
                {/* Occasion Filter */}
                <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion
                </label>
                <select
                  id="occasion"
                  value={selectedOccasion}
                  onChange={e => setSelectedOccasion(e.target.value)}
                  className="block w-full mb-4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="">All Occasions</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="christmas">Christmas</option>
                  <option value="valentines">Valentine's Day</option>
                  <option value="housewarming">Housewarming</option>
                </select>
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
                  <option value="jewelry">Jewelry</option>
                  <option value="home-decor">Home Decor</option>
                  <option value="clothing">Clothing</option>
                  <option value="art">Art</option>
                  <option value="accessories">Accessories</option>
                  <option value="ceramics">Ceramics</option>
                  <option value="woodwork">Woodwork</option>
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
                      value={priceRange.max === Infinity ? '' : priceRange.max}
                      onChange={e => setPriceRange(pr => ({ ...pr, max: parseFloat(e.target.value) || Infinity }))}
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
                    setSelectedOccasion('');
                    setSelectedCategory('');
                    setPriceRange({ min: 0, max: Infinity });
                    setSortBy('');
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              artisanName={artisanNames[product.artisanId] || 'Artisan'}
              inCart={cartItems.some(item => item.id === product.id)}
              quantity={quantities[product.id] || 1}
              showQuantitySelector={!!showQuantitySelector[product.id]}
              onAddToCart={handleAddToCart}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemoveFromCart={() => {}}
              onUpdateQuantity={() => {}}
              onToggleWishlist={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 