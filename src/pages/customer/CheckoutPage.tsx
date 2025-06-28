import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateUserProfile, processOrder, removeUndefined } from '../../services/firestore';
import { useCart } from '../../contexts/CartContext';
import type { UserData, OrderItem, Address } from '../../services/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useCurrency } from '../../contexts/CurrencyContext';

const CheckoutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('standard');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    label: '',
    phoneNumber: '',
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    label: '',
    phoneNumber: '',
  });
  const { convertPrice, formatPrice } = useCurrency();
  const [addressError, setAddressError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      try {
        const result = await getUserData(currentUser.uid);
        setUserData(result.userData);
        console.log("CheckoutPage: Fetched user data", result.userData);
        
        if (!result.userData) return;

        // Set default address if available
        if (result.userData.addresses?.length) {
          const defaultAddress = result.userData.addresses.find(addr => addr.isDefault);
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

  const handleDeliveryOptionChange = (option: string) => {
    setSelectedDeliveryOption(option);
  };

  const validateAddress = (address: typeof newAddress) => {
    if (!address.label.trim() || !address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zipCode.trim() || !address.country.trim() || !address.phoneNumber.trim()) {
      return 'All fields are required.';
    }
    // Add more validation as needed (e.g., zip code/phone format)
    return null;
  };

  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    if (!currentUser) return;
    const validationError = validateAddress(newAddress);
    if (validationError) {
      setAddressError(validationError);
      return;
    }
    setIsSavingAddress(true);
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
      setUserData(refreshedUserData.userData);

      // 4. Optionally, select the new address and reset the form
      setSelectedAddress(newAddressData.id);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', label: '', phoneNumber: '' });
      setShowNewAddressForm(false);
    } catch (error) {
      // handle error
      console.error('Error saving address:', error);
    } finally {
      setIsSavingAddress(false);
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
      label: address.label || '',
      phoneNumber: address.phoneNumber || '',
    });
    setShowNewAddressForm(false);
  };

  const handleEditAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    if (!currentUser || !userData) return;
    const validationError = validateAddress(editAddress);
    if (validationError) {
      setAddressError(validationError);
      return;
    }
    setIsEditingAddress(true);
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
      setUserData(refreshedUserData.userData);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setIsEditingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeleteError(null);
    if (!currentUser || !userData) return;
    if ((userData.addresses || []).length === 1) {
      setDeleteError('You must have at least one address.');
      return;
    }
    try {
      const updatedAddresses = (userData.addresses || []).filter(addr => addr.id !== addressId);
      const result = await updateUserProfile(currentUser.uid, { addresses: updatedAddresses });
      if (result.error) {
        console.error('Failed to delete address:', result.error);
        return;
      }
      const refreshedUserData = await getUserData(currentUser.uid);
      setUserData(refreshedUserData.userData);
      // If the deleted address was selected, clear selection
      if (selectedAddress === addressId) setSelectedAddress('');
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const shippingCost = (() => {
    // New delivery charge structure based on subtotal
    if (cartTotal < 500) {
      return 50; // ₹50 for subtotal under ₹500
    } else {
      return 30; // ₹30 for subtotal above ₹500
    }
  })();
  const tax = cartTotal * 0.08; // 8% tax rate
  const orderTotal = cartTotal + shippingCost + tax;

  const handlePlaceOrder = async () => {
    setOrderError(null);
    setEmailWarning(null);
    setIsPlacingOrder(true);
    if (!currentUser) {
      alert('Please log in to place an order.');
      setIsPlacingOrder(false);
      return;
    }
    if (!userData) {
      alert('User data not loaded. Please try again.');
      setIsPlacingOrder(false);
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      setIsPlacingOrder(false);
      return;
    }
    if (!selectedAddress) {
      alert('Please select a shipping address.');
      setIsPlacingOrder(false);
      return;
    }
    // Ensure addresses are available before proceeding
    const addresses = userData.addresses || [];
    if (addresses.length === 0) {
      alert('Please add and select a shipping address.');
      setIsPlacingOrder(false);
      return;
    }
    const selectedAddressData: Address | undefined = addresses.find(addr => addr.id === selectedAddress);
    if (!selectedAddressData) {
      alert('Selected address not found.');
      setIsPlacingOrder(false);
      return;
    }

    // Ensure no undefined values are passed to Firestore for the address
    const cleanedShippingAddress = {
      id: selectedAddressData.id,
      street: selectedAddressData.street,
      city: selectedAddressData.city,
      state: selectedAddressData.state,
      zipCode: selectedAddressData.zipCode,
      country: selectedAddressData.country,
      isDefault: selectedAddressData.isDefault,
      label: selectedAddressData.label === undefined ? null : selectedAddressData.label, // Convert undefined to null, keep existing value otherwise
    };

    try {
      const orderItems = cartItems.map(item => {
        const orderItem: OrderItem = {
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          currency: item.currency,
          artisanId: item.artisan, // Assuming item.artisan contains the artisanId
        };

        if (item.image) {
          orderItem.image = item.image;
        }

        if (item.customization) {
          try {
            // Attempt to parse customization string. If it fails, customization will be skipped.
            orderItem.customizations = JSON.parse(item.customization);
          } catch (e) {
            console.error("Error parsing customization string for item", item.id, ":", e);
            // Do not include customizations if parsing fails to avoid undefined or invalid data
          }
        }
        return removeUndefined(orderItem); // Ensure individual order items are also cleaned
      });

      // Collect unique artisanIds from orderItems
      const artisanIds = Array.from(new Set(orderItems.map(item => item.artisanId)));

      const orderData = {
        userId: currentUser.uid,
        items: orderItems,
        artisanIds,
        total: orderTotal,
        status: 'pending' as const,
        shippingAddress: cleanedShippingAddress,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending' as const,
        shippingMethod: 'standard',
        shippingCost: shippingCost,
        tax: tax,
        discount: 0, // Ensure discount is always a number
        trackingNumber: undefined, // Explicitly set optional fields to undefined if not used
        notes: undefined, // Explicitly set optional fields to undefined if not used
      };

      // Clean orderData to remove any undefined fields before sending to Firestore
      const cleanedOrderData = removeUndefined(orderData);

      console.log("Order data being sent to Firestore:", JSON.stringify(cleanedOrderData, null, 2));

      const result = await processOrder(cleanedOrderData, orderItems);

      if (result?.id) {
        // 1. Fetch artisan data (assuming all items are from the same artisan)
        const artisanId = cartItems[0]?.artisan;
        let artisanData = null;
        if (artisanId) {
          const artisanResult = await getUserData(artisanId);
          artisanData = artisanResult.userData;
        }

        // 2. Prepare email payload
        const emailPayload = {
          customer: {
            email: userData.email,
            name: userData.displayName || userData.email,
          },
          artisan: {
            email: artisanData?.email || '',
            name: artisanData?.companyName || artisanData?.displayName || 'Artisan',
          },
          order: {
            id: result.id,
            products: cartItems.map(item => ({
              name: item.name,
              image: item.image || '',
              price: item.price,
              quantity: item.quantity,
            })),
            total: orderTotal,
            date: new Date().toLocaleDateString(),
          }
        };

        // 3. Call the backend email API
        try {
          await fetch('https://artiflare-backend.onrender.com/api/send-order-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
          });
        } catch (err) {
          console.error('Failed to send order emails:', err);
          setEmailWarning('Order placed, but confirmation email could not be sent. Please contact support if you do not receive an email.');
        }

        // 4. Continue with your existing logic
        setOrderSuccess('Order placed successfully!');
        clearCart(); // Empty the customer's cart
        navigate('/thank-you'); // Redirect to the new thank you page
      } 
    } catch (error: any) {
      let message = error?.message || 'Failed to place order: An unknown error occurred';
      if (error?.code === 'insufficient-inventory') {
        message = 'One or more products in your cart are out of stock. Please update your cart and try again.';
      } else if (error?.code === 'product-not-found') {
        message = 'One or more products in your cart could not be found. Please update your cart and try again.';
      }
      setOrderError(message);
      alert(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Centered loading overlay */}
      {isPlacingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <span className="animate-spin h-12 w-12 mb-4 border-t-4 border-b-4 border-primary rounded-full"></span>
            <span className="text-lg text-white font-semibold">Placing your order...</span>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-dark mb-6">Checkout</h1>
      {orderSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" aria-live="polite">{orderSuccess}</div>}
      
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
                        <p className="text-dark-600">{address.phoneNumber ? `Phone: ${address.phoneNumber}` : ''}</p>
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
                            id="address-label"
                          />
                          <input
                            type="text"
                            value={editAddress.street}
                            onChange={e => setEditAddress({ ...editAddress, street: e.target.value })}
                            placeholder="Street"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-street"
                          />
                          <input
                            type="text"
                            value={editAddress.city}
                            onChange={e => setEditAddress({ ...editAddress, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-city"
                          />
                          <input
                            type="text"
                            value={editAddress.state}
                            onChange={e => setEditAddress({ ...editAddress, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-state"
                          />
                          <input
                            type="text"
                            value={editAddress.zipCode}
                            onChange={e => setEditAddress({ ...editAddress, zipCode: e.target.value })}
                            placeholder="ZIP Code"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-zipCode"
                          />
                          <input
                            type="text"
                            value={editAddress.country}
                            onChange={e => setEditAddress({ ...editAddress, country: e.target.value })}
                            placeholder="Country"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-country"
                          />
                          <input
                            type="text"
                            value={editAddress.phoneNumber}
                            onChange={e => setEditAddress({ ...editAddress, phoneNumber: e.target.value })}
                            placeholder="Phone Number"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            id="address-phoneNumber-edit"
                          />
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-primary text-white rounded flex items-center justify-center"
                            disabled={isEditingAddress}
                          >
                            {isEditingAddress ? <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span> : null}
                            Save
                          </button>
                          <button type="button" className="px-3 py-1 border rounded" onClick={() => setEditingAddressId(null)}>Cancel</button>
                        </div>
                      </form>
                    )}
                    {deleteError && <p className="text-red-600 text-sm mb-2" aria-live="polite">{deleteError}</p>}
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
                    <label htmlFor="address-label" className="block text-sm font-medium text-dark-600 mb-1">Address Label</label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      placeholder="e.g., Home, Work"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-label"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address-street" className="block text-sm font-medium text-dark-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-street"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-city" className="block text-sm font-medium text-dark-600 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-city"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-state" className="block text-sm font-medium text-dark-600 mb-1">State/Province</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-state"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-zipCode" className="block text-sm font-medium text-dark-600 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-zipCode"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-country" className="block text-sm font-medium text-dark-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-country"
                    />
                  </div>
                  <div>
                    <label htmlFor="address-phoneNumber" className="block text-sm font-medium text-dark-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newAddress.phoneNumber}
                      onChange={e => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      id="address-phoneNumber"
                      placeholder="e.g., +91 9876543210"
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
                  {addressError && <p className="text-red-600 text-sm mb-2" aria-live="polite">{addressError}</p>}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
                    disabled={isSavingAddress || !newAddress.label.trim() || !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.zipCode.trim() || !newAddress.country.trim() || !newAddress.phoneNumber.trim()}
                  >
                    {isSavingAddress ? <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span> : null}
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-dark mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-dark font-medium">Standard Delivery</span>
                    <span className="text-dark-500 text-sm block">3-5 business days</span>
                  </div>
                  <div className="text-right">
                    <span className="text-dark font-medium">
                      {formatPrice(convertPrice(shippingCost, 'INR'))}
                    </span>
                    <span className="text-dark-500 text-sm block">
                      {cartTotal < 500 ? 'Orders under ₹500' : 'Orders above ₹500'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-dark-600 bg-blue-50 p-3 rounded-lg">
                <p><strong>Delivery Charges:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>₹50 for orders under ₹500</li>
                  <li>₹30 for orders above ₹500</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-bold text-dark mb-4">Payment Method</h2>
            <div className="space-y-4">
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
                <span className="text-dark font-medium">
                  {formatPrice(convertPrice(cartTotal, 'INR'))}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-dark-600">Shipping</span>
                <span className="ml-auto text-dark">
                  {formatPrice(convertPrice(shippingCost, 'INR'))}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-dark-600">Tax (8%)</span>
                <span className="ml-auto text-dark">
                  {formatPrice(convertPrice(tax, 'INR'))}
                </span>
              </div>
              <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-dark">Order Total</span>
                <span className="ml-auto text-primary font-bold">
                  {formatPrice(convertPrice(orderTotal, 'INR'))}
                </span>
              </div>
            </div>
            {orderError && <p className="text-red-600 text-sm mb-2" aria-live="polite">{orderError}</p>}
            {emailWarning && <p className="text-yellow-600 text-sm mb-2" aria-live="polite">{emailWarning}</p>}
            <button 
              onClick={handlePlaceOrder}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-700 flex items-center justify-center"
              disabled={isPlacingOrder}
            >
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