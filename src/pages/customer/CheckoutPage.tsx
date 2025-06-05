import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateUserProfile } from '../../services/firestore';
import { useCart } from '../../contexts/CartContext';
import type { UserData } from '../../services/firestore';
import { v4 as uuidv4 } from 'uuid';

const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    label: ''
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    label: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
        // Set default address if available
        if (data.addresses?.length) {
          const defaultAddress = data.addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [currentUser, navigate]);

  const handleAddressChange = (addressId: string) => {
    setSelectedAddress(addressId);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // 1. Save the new address to Firestore
      const newAddressData = { ...newAddress, id: uuidv4(), isDefault: userData?.addresses?.length === 0 };
      const updatedAddresses = [...(userData?.addresses || []), newAddressData];
      const result = await updateUserProfile(currentUser.uid, { addresses: updatedAddresses });

      if (result.error) {
        // handle error
        return;
      }

      // 2. Fetch the latest user data from Firestore
      const refreshedUserData = await getUserData(currentUser.uid);

      // 3. Update the local state so the UI re-renders
      setUserData(refreshedUserData);

      // 4. Optionally, select the new address and reset the form
      setSelectedAddress(newAddressData.id);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', label: '' });
      setShowNewAddressForm(false);
    } catch (error) {
      // handle error
      console.error('Error saving address:', error);
    }
  };

  const handleEditClick = (address: any) => {
    setEditingAddressId(address.id);
    setEditAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      label: address.label || ''
    });
    setShowNewAddressForm(false);
  };

  const handleEditAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;
    try {
      const updatedAddresses = (userData.addresses || []).map(addr =>
        addr.id === editingAddressId ? { ...addr, ...editAddress } : addr
      );
      const result = await updateUserProfile(currentUser.uid, { addresses: updatedAddresses });
      if (result.error) {
        console.error('Failed to update address:', result.error);
        return;
      }
      const refreshedUserData = await getUserData(currentUser.uid);
      setUserData(refreshedUserData);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser || !userData) return;
    try {
      const updatedAddresses = (userData.addresses || []).filter(addr => addr.id !== addressId);
      const result = await updateUserProfile(currentUser.uid, { addresses: updatedAddresses });
      if (result.error) {
        console.error('Failed to delete address:', result.error);
        return;
      }
      const refreshedUserData = await getUserData(currentUser.uid);
      setUserData(refreshedUserData);
      // If the deleted address was selected, clear selection
      if (selectedAddress === addressId) setSelectedAddress('');
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const shippingCost = 5.99;
  const tax = cartTotal * 0.08; // 8% tax rate
  const orderTotal = cartTotal + shippingCost + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Checkout</h1>
      
      <div className="md:flex md:space-x-6">
        <div className="md:w-2/3">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-dark mb-4">Shipping Information</h2>
            
            {/* Existing Addresses */}
            {userData?.addresses && userData.addresses.length > 0 && (
              <div className="space-y-4 mb-6">
                {userData.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedAddress === address.id ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => handleAddressChange(address.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-dark">{address.label || 'Address'}</p>
                        <p className="text-dark-600">{address.street}</p>
                        <p className="text-dark-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-dark-600">{address.country}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {address.isDefault && (
                          <span className="bg-primary-100 text-primary text-xs px-2 py-1 rounded mb-1">
                            Default
                          </span>
                        )}
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={e => { e.stopPropagation(); handleEditClick(address); }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:underline"
                          onClick={e => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {/* Edit Address Form */}
                    {editingAddressId === address.id && (
                      <form onSubmit={handleEditAddressSubmit} className="mt-4 space-y-2 bg-gray-50 p-4 rounded">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editAddress.label}
                            onChange={e => setEditAddress({ ...editAddress, label: e.target.value })}
                            placeholder="Label"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editAddress.street}
                            onChange={e => setEditAddress({ ...editAddress, street: e.target.value })}
                            placeholder="Street"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editAddress.city}
                            onChange={e => setEditAddress({ ...editAddress, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editAddress.state}
                            onChange={e => setEditAddress({ ...editAddress, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editAddress.zipCode}
                            onChange={e => setEditAddress({ ...editAddress, zipCode: e.target.value })}
                            placeholder="ZIP Code"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={editAddress.country}
                            onChange={e => setEditAddress({ ...editAddress, country: e.target.value })}
                            placeholder="Country"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button type="submit" className="px-3 py-1 bg-primary text-white rounded">Save</button>
                          <button type="button" className="px-3 py-1 border rounded" onClick={() => setEditingAddressId(null)}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Button */}
            <button
              onClick={() => setShowNewAddressForm(true)}
              className="text-primary hover:text-primary-700 font-medium mb-4"
            >
              + Add New Address
            </button>

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleNewAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">Address Label</label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      placeholder="e.g., Home, Work"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-dark-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">State/Province</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-dark hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-dark mb-4">Delivery Options</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <input
                  id="standard"
                  name="deliveryOption"
                  type="radio"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked
                />
                <label htmlFor="standard" className="ml-3 flex flex-col">
                  <span className="text-dark font-medium">Standard Delivery</span>
                  <span className="text-dark-500 text-sm">3-5 business days</span>
                </label>
                <span className="ml-auto text-dark">$5.99</span>
              </div>
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <input
                  id="express"
                  name="deliveryOption"
                  type="radio"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="express" className="ml-3 flex flex-col">
                  <span className="text-dark font-medium">Express Delivery</span>
                  <span className="text-dark-500 text-sm">1-2 business days</span>
                </label>
                <span className="ml-auto text-dark">$12.99</span>
              </div>
              <div className="flex items-center p-4 border border-primary-200 bg-primary-50 rounded-lg">
                <input
                  id="sos"
                  name="deliveryOption"
                  type="radio"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="sos" className="ml-3 flex flex-col">
                  <span className="text-dark font-medium">SOS Delivery</span>
                  <span className="text-primary text-sm">Delivered within 3 hours (select areas)</span>
                </label>
                <span className="ml-auto text-primary font-bold">$24.99</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Payment Method</h2>
            <div className="space-y-4">
              {/* Credit/Debit Card */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="card"
                    name="paymentMethod"
                    type="radio"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={() => handlePaymentMethodChange('card')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="card" className="ml-3">
                    <span className="text-dark font-medium">Credit / Debit Card</span>
                  </label>
                </div>
                {selectedPaymentMethod === 'card' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="1234 1234 1234 1234"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-1">Expiration Date</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="MM / YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-1">CVC</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* UPI */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="upi"
                    name="paymentMethod"
                    type="radio"
                    checked={selectedPaymentMethod === 'upi'}
                    onChange={() => handlePaymentMethodChange('upi')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="upi" className="ml-3">
                    <span className="text-dark font-medium">UPI</span>
                  </label>
                </div>
                {selectedPaymentMethod === 'upi' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Enter UPI ID"
                    />
                  </div>
                )}
              </div>

              {/* Net Banking */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="netbanking"
                    name="paymentMethod"
                    type="radio"
                    checked={selectedPaymentMethod === 'netbanking'}
                    onChange={() => handlePaymentMethodChange('netbanking')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="netbanking" className="ml-3">
                    <span className="text-dark font-medium">Net Banking</span>
                  </label>
                </div>
                {selectedPaymentMethod === 'netbanking' && (
                  <div className="mt-4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                      <option value="">Select Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* COD */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input
                    id="cod"
                    name="paymentMethod"
                    type="radio"
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3">
                    <span className="text-dark font-medium">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3 mt-6 md:mt-0">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-bold text-dark mb-4">Order Summary</h2>
            <div className="divide-y divide-gray-200">
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Products ({cartItems.length})</span>
                <span className="text-dark font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Shipping</span>
                <span className="text-dark font-medium">₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark-500">Tax</span>
                <span className="text-dark font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-dark font-bold">Total</span>
                <span className="text-primary font-bold">₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded mt-6">
              Place Order
            </button>
            <Link 
              to="/cart" 
              className="w-full border border-dark-300 text-dark hover:bg-gray-50 font-medium py-2 px-4 rounded text-center block mt-4"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 