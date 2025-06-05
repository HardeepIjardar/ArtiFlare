import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserData } from '../../services/firestore';
import { v4 as uuidv4 } from 'uuid';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    displayName: '',
    phoneNumber: '',
  });

  const [addresses, setAddresses] = useState<Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    label?: string;
  }>>([]);

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    label: '',
    isDefault: false
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setForm({
            displayName: userData.displayName || '',
            phoneNumber: userData.phoneNumber || '',
          });
          setAddresses(userData.addresses || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = () => {
    if (newAddress.isDefault) {
      // If new address is set as default, remove default from other addresses
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }
    setAddresses(prev => [...prev, { ...newAddress, id: uuidv4() }]);
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      label: '',
      isDefault: false
    });
    setShowNewAddressForm(false);
  };

  const handleRemoveAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('No user found. Please log in again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user profile in Firestore
      const userData = {
        displayName: form.displayName,
        phoneNumber: form.phoneNumber,
        addresses: addresses
      };
      
      const result = await updateUserProfile(currentUser.uid, userData);
      
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={form.displayName}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Shipping Addresses</h3>
            <button
              type="button"
              onClick={() => setShowNewAddressForm(true)}
              className="text-primary hover:text-primary-700 font-medium"
            >
              + Add New Address
            </button>
          </div>

          {/* Existing Addresses */}
          <div className="space-y-4 mb-6">
            {addresses.map((address) => (
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
                  <div className="flex items-center space-x-2">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="text-primary text-sm hover:text-primary-700"
                      >
                        Set as Default
                      </button>
                    )}
                    {address.isDefault && (
                      <span className="bg-primary-100 text-primary text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(address.id)}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Address Form */}
          {showNewAddressForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Label
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={newAddress.label}
                    onChange={handleNewAddressChange}
                    placeholder="e.g., Home, Work"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleNewAddressChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleNewAddressChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleNewAddressChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={newAddress.zipCode}
                      onChange={handleNewAddressChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={newAddress.country}
                      onChange={handleNewAddressChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={handleNewAddressChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700"
                  >
                    Add Address
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage; 