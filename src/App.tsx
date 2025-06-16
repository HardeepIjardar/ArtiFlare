import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './ScrollToTop';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Layout components
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ArtisanLayout from './layouts/ArtisanLayout';

// Customer pages
import HomePage from './pages/customer/HomePage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import ProfilePage from './pages/customer/ProfilePage';
import WishlistPage from './pages/customer/WishlistPage';
import EditProfilePage from './pages/customer/EditProfilePage';
import SearchPage from './pages/customer/SearchPage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import FAQPage from './pages/customer/FAQPage';
import ShippingPage from './pages/customer/ShippingPage';
import ReturnsPage from './pages/customer/ReturnsPage';
import PrivacyPage from './pages/customer/PrivacyPage';
import TermsPage from './pages/customer/TermsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Artisan pages
import ArtisanDashboard from './pages/artisan/Dashboard';
import ArtisanProducts from './pages/artisan/Products';
import ArtisanOrders from './pages/artisan/Orders';
import ArtisanEarnings from './pages/artisan/Earnings';
import ArtisanSettings from './pages/artisan/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

// Add new pages for design
import OccasionsPage from './pages/customer/OccasionsPage';
import OccasionDetailPage from './pages/customer/OccasionDetailPage';
import HowItWorksPage from './pages/customer/HowItWorksPage';

// Add new components
import AddProduct from './components/artisan/AddProduct';

// Routes component that uses the contexts
function RoutesWithAuth() {
  const { currentUser } = useAuth();
  const { setUserId } = useCart();

  useEffect(() => {
    if (currentUser?.uid) {
      // Merge guest cart with user cart
      const guestCart = localStorage.getItem('cart_guest');
      const userCart = localStorage.getItem(`cart_${currentUser.uid}`);
      
      if (guestCart && (!userCart || userCart === '[]')) {
        // If user has no cart, use guest cart
        localStorage.setItem(`cart_${currentUser.uid}`, guestCart);
        localStorage.removeItem('cart_guest');
      } else if (guestCart && userCart && userCart !== '[]') {
        // Merge guest and user carts
        const guestItems = JSON.parse(guestCart);
        const userItems = JSON.parse(userCart);
        
        // Add guest items that aren't already in user cart
        const mergedItems = [...userItems];
        guestItems.forEach((guestItem: any) => {
          const existingItem = mergedItems.find(item => item.id === guestItem.id);
          if (existingItem) {
            // Update quantity if item already exists
            existingItem.quantity += guestItem.quantity;
          } else {
            // Add new item
            mergedItems.push(guestItem);
          }
        });
        
        localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(mergedItems));
        localStorage.removeItem('cart_guest');
      }
      
      // Update cart context with user ID
      setUserId(currentUser.uid);
    } else {
      // Reset to guest cart
      setUserId('guest');
    }
  }, [currentUser, setUserId]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="occasions" element={<OccasionsPage />} />
        <Route path="occasions/:occasion" element={<OccasionDetailPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id/tracking" element={<OrderTrackingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Artisan Routes - Protected with role */}
      <Route element={<ProtectedRoute allowedRoles={['artisan']} />}>
        <Route path="/artisan" element={<ArtisanLayout />}>
          <Route index element={<ArtisanDashboard />} />
          <Route path="products" element={<ArtisanProducts />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="orders" element={<ArtisanOrders />} />
          <Route path="earnings" element={<ArtisanEarnings />} />
          <Route path="settings" element={<ArtisanSettings />} />
        </Route>
      </Route>

      {/* Admin Routes - Protected with role */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <ScrollToTop />
            <RoutesWithAuth />
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
