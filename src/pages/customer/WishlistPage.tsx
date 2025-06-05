import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getProducts, Product } from '../../services/firestore';
import ProductCard from '../../components/ProductCard';

const WishlistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [artisanNames, setArtisanNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return;
      setLoading(true);
      const wishlistRef = doc(db, 'wishlists', currentUser.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      if (wishlistSnap.exists()) {
        const wishlistData = wishlistSnap.data();
        const productIds: string[] = wishlistData.products || [];
        if (productIds.length > 0) {
          // Fetch all products in wishlist
          const { products } = await getProducts();
          const filteredProducts = products.filter(p => productIds.includes(p.id));
          setWishlistProducts(filteredProducts);

          // Fetch artisan names
          const uniqueArtisanIds = Array.from(new Set(filteredProducts.map(p => p.artisanId)));
          const names: { [key: string]: string } = {};
          await Promise.all(
            uniqueArtisanIds.map(async (artisanId) => {
              const userRef = doc(db, 'users', artisanId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                names[artisanId] = userData.companyName || userData.displayName || 'Artisan';
              } else {
                names[artisanId] = 'Artisan';
              }
            })
          );
          setArtisanNames(names);
        } else {
          setWishlistProducts([]);
          setArtisanNames({});
        }
      } else {
        setWishlistProducts([]);
        setArtisanNames({});
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [currentUser]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">Loading wishlist...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Your Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-dark">Your wishlist is empty</h2>
          <p className="mt-2 text-dark-500">Browse our products and add your favorites to your wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              artisanName={artisanNames[product.artisanId] || 'Artisan'}
              inCart={false}
              quantity={1}
              showQuantitySelector={false}
              onAddToCart={() => {}}
              onIncrement={() => {}}
              onDecrement={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 