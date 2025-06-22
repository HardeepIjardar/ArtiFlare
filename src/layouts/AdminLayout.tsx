import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/firestore';
import { getDisplayName } from '../utils/errorHandling';

const AdminLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);

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

  useEffect(() => {
    if (currentUser) {
      getUserData(currentUser.uid).then(data => setFirestoreUser(data));
    } else {
      setFirestoreUser(null);
    }
  }, [currentUser]);

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
                  <span className="ml-2 text-dark">{getDisplayName(firestoreUser)}</span>
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
          <h2 className="text-xl font-bold text-dark mb-6">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link to="/admin" className="block py-2 px-4 rounded-md bg-primary-50 text-primary font-medium">
              Dashboard
            </Link>
            <Link to="/admin/users" className="block py-2 px-4 rounded-md text-dark hover:bg-primary-50 hover:text-primary">
              Users
            </Link>
            <Link to="/admin/products" className="block py-2 px-4 rounded-md text-dark hover:bg-primary-50 hover:text-primary">
              Products
            </Link>
            <Link to="/admin/orders" className="block py-2 px-4 rounded-md text-dark hover:bg-primary-50 hover:text-primary">
              Orders
            </Link>
            <Link to="/admin/settings" className="block py-2 px-4 rounded-md text-dark hover:bg-primary-50 hover:text-primary">
              Settings
            </Link>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
      
      <footer className="bg-dark-900 py-4">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-sm text-white">
            &copy; {new Date().getFullYear()} ArtiFlare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout; 