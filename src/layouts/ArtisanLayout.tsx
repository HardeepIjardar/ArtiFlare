import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/firestore';

const ArtisanLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      getUserData(currentUser.uid).then(data => setFirestoreUser(data));
    } else {
      setFirestoreUser(null);
    }
  }, [currentUser]);

  useEffect(() => {
    // Close the profile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-white shadow-sm border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center mr-3">
                <Logo size={40} />
              </div>
              <Link to="/" className="text-lg font-bold text-primary">
                ArtiFlare
              </Link>
            </div>
            <div className="flex items-center">
              <div className="relative" ref={profileMenuRef}>
                <button 
                  className="flex items-center focus:outline-none"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <FaUserCircle className="h-8 w-8 text-primary" />
                  {firestoreUser?.userData?.displayName || firestoreUser?.userData?.companyName ? (
                    <span className="ml-2 text-dark font-semibold">
                      {firestoreUser.userData?.displayName || firestoreUser.userData?.companyName}
                    </span>
                  ) : null}
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <Link 
                      to="/" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Browse Products
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Add logout functionality here
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-[#e0e0e0] p-6">
          <h2 className="text-xl font-bold text-dark mb-6">Artisan Dashboard</h2>
          <nav className="space-y-2">
            <NavLink 
              to="/artisan" 
              end
              className={({ isActive }) => 
                `block py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary font-medium' 
                    : 'text-dark hover:bg-primary-50 hover:text-primary'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/artisan/products" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary font-medium' 
                    : 'text-dark hover:bg-primary-50 hover:text-primary'
                }`
              }
            >
              Products
            </NavLink>
            <NavLink 
              to="/artisan/orders" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary font-medium' 
                    : 'text-dark hover:bg-primary-50 hover:text-primary'
                }`
              }
            >
              Orders
            </NavLink>
            <NavLink 
              to="/artisan/earnings" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary font-medium' 
                    : 'text-dark hover:bg-primary-50 hover:text-primary'
                }`
              }
            >
              Earnings
            </NavLink>
            <NavLink 
              to="/artisan/settings" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary font-medium' 
                    : 'text-dark hover:bg-primary-50 hover:text-primary'
                }`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
      
      <footer className="bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center mr-3">
                  <Logo size={40} />
                </div>
                <span className="text-xl font-bold text-primary">ArtiFlare</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting artisans with customers seeking unique, handcrafted gifts. Discover the perfect personalized present for your loved ones.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-primary transition-colors duration-300">All Products</Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-gray-400 hover:text-primary transition-colors duration-300">How It Works</Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-primary transition-colors duration-300">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors duration-300">Contact Us</Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-primary transition-colors duration-300">FAQ</Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-400 hover:text-primary transition-colors duration-300">Shipping & Delivery</Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-400 hover:text-primary transition-colors duration-300">Returns & Refunds</Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors duration-300">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors duration-300">Terms & Conditions</Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for exclusive offers and updates.
              </p>
              <form className="space-y-2" onSubmit={(e) => {
                e.preventDefault();
                // Add newsletter subscription logic here
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-md bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
                >
                  <span>Subscribe</span>
                  <svg className="animate-spin h-5 w-5 ml-2 hidden" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} ArtiFlare. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-4 mt-4 md:mt-0">
                <span className="text-gray-400 text-xs">We Accept:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-white rounded-md shadow p-2 flex items-center justify-center h-11 w-16">
                    <img src="/visa.svg" alt="Visa" className="h-6 w-auto" />
                  </span>
                  <span className="bg-white rounded-md shadow p-2 flex items-center justify-center h-11 w-16">
                    <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
                  </span>
                  <span className="bg-white rounded-md shadow p-2 flex items-center justify-center h-11 w-16">
                    <img src="/amex.svg" alt="American Express" className="h-6 w-auto" />
                  </span>
                  <span className="bg-white rounded-md shadow p-2 flex items-center justify-center h-11 w-16">
                    <img src="/paypal.svg" alt="PayPal" className="h-6 w-auto" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArtisanLayout; 