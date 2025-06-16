import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getProductById, getUserData, Product, getProductReviews, createReview, getProducts, Review } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/ProductCard';
import { useCurrency } from '../../contexts/CurrencyContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, updateQuantity: updateCartQuantity, cartItems, removeFromCart } = useCart();
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [artisanName, setArtisanName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { convertPrice, formatPrice } = useCurrency();
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const product = await getProductById(id);
        if (typeof product.id === 'string') {
          setProduct({
            ...product,
            id: product.id as string,
            createdAt: product.createdAt ? product.createdAt : new Date(),
            updatedAt: product.updatedAt ? product.updatedAt : new Date(),
            attributes: product.attributes ?? {},
            tags: product.tags ?? [],
            isCustomizable: product.isCustomizable ?? false
          });
          setSelectedImage(product.images && product.images.length > 0 ? product.images[0] : null);
          // Fetch artisan name
          try {
            const userData = await getUserData(product.artisanId);
            setArtisanName(userData?.companyName || userData?.displayName || 'Artisan');
          } catch (e) {
            setArtisanName('Artisan');
          }
        } else {
          setError('Product not found');
          setProduct(null);
        }
      } catch (err: any) {
        setError(err.message || 'Product not found');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Keep quantity and selector in sync with cartItems, but don't refetch product
  useEffect(() => {
    if (!product) return;
    if (cartItems.some(item => item.id === product.id)) {
      setShowQuantitySelector(true);
      const cartItem = cartItems.find(item => item.id === product.id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
    } else {
      setShowQuantitySelector(false);
      setQuantity(1);
    }
  }, [cartItems, product]);

  // Auto-switch product images every 5 seconds
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    let idx = product.images.findIndex(img => img === selectedImage);
    const interval = setInterval(() => {
      idx = (idx + 1) % product.images.length;
      setSelectedImage(product.images[idx]);
    }, 5000);
    return () => clearInterval(interval);
  }, [product, selectedImage]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewLoading(true);
      try {
        const { reviews, error } = await getProductReviews(id);
        if (error) setReviewError(error);
        else setReviews(reviews);
      } catch (err) {
        setReviewError('Failed to fetch reviews');
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return;
      const { products: rel, error } = await getProducts();
      if (!error) {
        setRelatedProducts(rel.filter(p => p.id !== product.id && (p.category === product.category || p.artisanId === product.artisanId)).slice(0, 4));
      }
    };
    fetchRelated();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      artisan: product.artisanId,
      customization: customization || undefined,
      image: product.images[0]
    });

    setShowQuantitySelector(true);
  };

  const incrementQuantity = () => {
    if (!product) return;
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateCartQuantity(product.id, newQuantity);
  };

  const decrementQuantity = () => {
    if (!product) return;
    if (quantity <= 1) {
      removeFromCart(product.id);
      setShowQuantitySelector(false);
      setQuantity(1);
    } else {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateCartQuantity(product.id, newQuantity);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !product) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const reviewData = {
        productId: product.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        rating: reviewRating,
        comment: reviewText,
      };
      const { error } = await createReview(reviewData);
      if (error) setReviewError(error);
      else {
        setReviewText('');
        setReviewRating(5);
        // Refresh reviews
        const { reviews } = await getProductReviews(product.id);
        setReviews(reviews);
      }
    } catch (err) {
      setReviewError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Products Link */}
      <div className="mb-4">
        <Link to="/products" className="text-primary hover:underline font-medium">&larr; Back to All Products</Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 flex flex-col items-center">
            {/* Image Gallery */}
            <div className="w-full flex flex-col items-center">
              <img
                src={selectedImage || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full max-w-md h-96 object-contain rounded-lg border mb-4"
              />
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 mt-2">
                  {product.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all duration-150 ${selectedImage === img ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-dark mb-2">{product.name}</h1>
            <p className="text-dark-500 mb-4">by <Link to={`/artisan/${product.artisanId}`} className="font-semibold text-primary hover:underline">{artisanName}</Link></p>
            <div className="mb-6 flex items-center space-x-4">
              {product.discountedPrice ? (
                <>
                  <span className="text-primary text-2xl font-bold">
                    {formatPrice(convertPrice(product.discountedPrice, product.currency || 'INR'))}
                  </span>
                  <span className="text-dark-500 line-through text-lg">
                    {formatPrice(convertPrice(product.price, product.currency || 'INR'))}
                  </span>
                </>
              ) : (
                <span className="text-primary text-2xl font-bold">
                  {formatPrice(convertPrice(product.price, product.currency || 'INR'))}
                </span>
              )}
              <span className="ml-4 text-sm text-dark-500">In stock: {product.inventory}</span>
            </div>
            <p className="text-dark-600 mb-6 whitespace-pre-line">{product.description}</p>
            {product.isCustomizable && (
              <div className="mb-6">
                <label className="block text-dark-700 mb-2">Customization</label>
                <textarea
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add your customization details..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex items-center space-x-4 mb-6">
              {!showQuantitySelector ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    type="button"
                    className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-700 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6h13" /></svg>
                    Add to Cart
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementQuantity}
                      type="button"
                      className="bg-gray-200 text-dark px-2 py-1 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-dark">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      type="button"
                      className="bg-gray-200 text-dark px-2 py-1 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => navigate('/cart')}
                    type="button"
                    className="ml-4 bg-primary text-white px-6 py-2 rounded hover:bg-primary-700 transition"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-dark mb-2">Product Details</h2>
              <ul className="list-disc list-inside text-dark-600 space-y-1">
                <li>Category: {product.category}</li>
                {product.subcategory && <li>Subcategory: {product.subcategory}</li>}
                {product.materials && <li>Materials: {product.materials.join(', ')}</li>}
                {product.occasion && <li>Perfect for: {product.occasion}</li>}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <li>Attributes: {Object.entries(product.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</li>
                )}
                {product.tags && product.tags.length > 0 && (
                  <li>Tags: {product.tags.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="border-t mt-8 pt-8 px-6 bg-gray-50 rounded-b-lg">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          {reviewLoading ? (
            <div>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-dark-500">No reviews yet.</div>
          ) : (
            <div className="space-y-4 mb-6">
              <div className="flex items-center mb-2">
                <span className="text-xl font-bold text-primary mr-2">{product.averageRating ? product.averageRating.toFixed(1) : '5.0'}</span>
                <span className="text-yellow-400">{'★'.repeat(Math.round(product.averageRating || 5))}</span>
                <span className="ml-2 text-dark-500">({product.totalReviews || reviews.length} reviews)</span>
              </div>
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="bg-white rounded p-4 border">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold text-dark mr-2">{review.userName}</span>
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                  </div>
                  <div className="text-dark-600">{review.comment}</div>
                  <div className="text-xs text-dark-400 mt-1">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          )}
          {currentUser ? (
            <form onSubmit={handleReviewSubmit} className="bg-white border rounded p-4 mb-6">
              <h3 className="font-semibold mb-2">Add a Review</h3>
              <div className="flex items-center mb-2">
                <label className="mr-2">Rating:</label>
                <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="border rounded px-2 py-1">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Write your review..."
                rows={3}
                required
              />
              {reviewError && !reviewError.toLowerCase().includes('firestore') && (
                <div className="text-red-500 mb-2">{reviewError}</div>
              )}
              <button type="submit" disabled={submittingReview} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-white border rounded p-4 mb-6 text-center text-dark-500">
              Please <RouterLink to="/login" className="text-primary font-semibold hover:underline">login</RouterLink> to add a review
            </div>
          )}
        </div>
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t mt-8 pt-8 px-6 bg-gray-50 rounded-b-lg pb-12">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard
                  key={rp.id}
                  product={rp}
                  artisanName={artisanName}
                  inCart={cartItems.some(item => item.id === rp.id)}
                  quantity={cartItems.find(item => item.id === rp.id)?.quantity || 1}
                  showQuantitySelector={false}
                  onAddToCart={() => handleAddToCart(rp.id)}
                  onIncrement={() => {}}
                  onDecrement={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 