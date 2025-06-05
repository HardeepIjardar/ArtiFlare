import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData } from '../../services/firestore';
import ChangePassword from '../../components/auth/ChangePassword';
import type { UserData } from '../../services/firestore';

const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-primary hover:text-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get initials for the avatar
  const getInitials = () => {
    if (!userData || !userData.displayName) return '';
    const names = userData.displayName.split(' ');
    return names.map((name: string) => name.charAt(0).toUpperCase()).join('');
  };

  // Format creation date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Your Profile</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:w-1/3 p-6 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary text-2xl font-bold">
                {getInitials()}
              </div>
              <h2 className="mt-4 text-xl font-bold text-dark">{userData?.displayName || 'User'}</h2>
              <p className="text-dark-500">{userData?.email || ''}</p>
              <p className="text-dark-500 mt-1">
                Member since {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
              </p>
              <Link to="/profile/edit" className="mt-4 bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary-50">
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-dark-500">Full Name</h3>
                <p className="text-dark">{userData?.displayName || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dark-500">Email Address</h3>
                <p className="text-dark">{userData?.email || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dark-500">Phone Number</h3>
                <p className="text-dark">{userData?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-dark-500">Shipping Addresses</h3>
                {userData?.addresses && userData.addresses.length > 0 ? (
                  <div className="space-y-4 mt-2">
                    {userData.addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-dark">{address.label || 'Address'}</p>
                            <p className="text-dark-600">{address.street}</p>
                            <p className="text-dark-600">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-dark-600">{address.country}</p>
                          </div>
                          {address.isDefault && (
                            <span className="bg-primary-100 text-primary text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500 italic">No addresses provided</p>
                )}
                <Link to="/profile/edit" className="text-primary text-sm hover:text-primary-700 mt-2 inline-block">
                  {userData?.addresses && userData.addresses.length > 0 ? 'Manage Addresses' : 'Add Address'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-dark">Recent Orders</h2>
            <Link to="/orders" className="text-primary hover:text-primary-700 text-sm font-medium">
              View All Orders
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Order data will be fetched and displayed here in a future update */}
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-dark mb-4">Account Settings</h2>
          <div className="space-y-4">
            <button 
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-dark hover:text-dark-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
            <button className="text-dark hover:text-dark-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notification Preferences
            </button>
            <button 
              onClick={handleLogout}
              className="text-primary hover:text-primary-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div className="mt-6">
          <ChangePassword 
            onSuccess={() => {
              setShowChangePassword(false);
              // You can add a success notification here
            }}
            onError={(error) => {
              // You can add an error notification here
              console.error('Password change error:', error);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 