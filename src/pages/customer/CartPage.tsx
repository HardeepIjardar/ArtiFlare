import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData } from '../../services/firestore';
import { useCurrency } from '../../contexts/CurrencyContext';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [artisanNames, setArtisanNames] = useState<{ [key: string]: string }>({});
  const { convertPrice, formatPrice } = useCurrency();

  useEffect(() => {
    const fetchArtisanNames = async () => {
      const uniqueArtisanIds = Array.from(new Set(cartItems.map(item => item.artisan)));
      const namesMap: { [key: string]: string } = {};
      await Promise.all(uniqueArtisanIds.map(async (artisanId) => {
        const userData = await getUserData(artisanId);
        if (userData) {
          namesMap[artisanId] = userData.companyName || userData.displayName || 'Artisan';
        }
      }));
      setArtisanNames(namesMap);
    };
    if (cartItems.length > 0) fetchArtisanNames();
  }, [cartItems]);

  const shippingCost = 5.99;
  const tax = cartTotal * 0.08; // 8% tax rate
  const orderTotal = cartTotal + shippingCost + tax;

  // Handle checkout button click
  const handleCheckout = () => {
    if (!currentUser) {
      // If user is not logged in, redirect to login page with return URL
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      // User is logged in, proceed to checkout
      navigate('/checkout');
    }
  };

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-dark mb-6">Your Cart</h1>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/products" 
            className="inline-block bg-primary hover:bg-primary-700 text-white font-bold py-2 px-6 rounded"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Your Cart</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3 p-6">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
                  <div className="h-24 w-24 bg-sage-100 rounded-md flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-md" />}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-dark">{item.name}</h3>
                    <p className="text-dark-500 text-sm">by {artisanNames[item.artisan] || 'Artisan'}</p>
                    {item.customization && (
                      <div className="flex mt-2">
                        <p className="text-dark-600 text-sm">
                          Customization: "{item.customization}"
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeFromCart(item.id);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                        >
                          <span>-</span>
                        </button>
                        <span className="text-dark">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <span>+</span>
                        </button>
                      </div>
                      <p className="text-primary font-bold">
                        {formatPrice(convertPrice(item.price * item.quantity, item.currency || 'INR'))}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="ml-4 text-dark-400 hover:text-dark-700"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/3 bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Order Summary</h2>
            <div className="divide-y divide-gray-200">
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Subtotal</span>
                <span className="text-dark font-medium">{cartTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Shipping</span>
                <span className="text-dark font-medium">{shippingCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Tax</span>
                <span className="text-dark font-medium">{tax.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark font-bold">Total</span>
                <span className="text-primary font-bold">{orderTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded text-center block"
              >
                Proceed to Checkout
              </button>
              <Link 
                to="/products" 
                className="w-full border border-dark-300 text-dark hover:bg-gray-50 font-medium py-2 px-4 rounded text-center block mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 