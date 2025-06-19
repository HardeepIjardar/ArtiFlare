import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateUserProfile } from '../../services/firestore';

const ArtisanSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = React.useState({
    shopName: '',
    description: '',
    category: '',
    bankAccount: '',
    payoutSchedule: 'Weekly',
    automaticPayout: false,
    shippingFrom: '',
    shippingOptions: {
      standard: false,
      express: false,
      international: false,
    },
    notifications: {
      newOrder: false,
      orderShipped: false,
      paymentReceived: false,
      newOrderEmail: false,
      newOrderSms: false,
      orderShippedEmail: false,
      orderShippedSms: false,
      paymentReceivedEmail: false,
      paymentReceivedSms: false,
    },
  });
  const [loading, setLoading] = React.useState(true);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      getUserData(currentUser.uid).then((data) => {
        if (data?.userData) {
          setForm(f => ({
            ...f,
            shopName: data.userData.companyName || '',
            description: data.userData.description || '',
            category: data.userData.category || '',
            bankAccount: data.userData.bankAccount || '',
            payoutSchedule: data.userData.payoutSchedule || 'Weekly',
            automaticPayout: !!data.userData.automaticPayout,
            shippingFrom: data.userData.shippingFrom || '',
            shippingOptions: {
              standard: !!data.userData.shippingStandard,
              express: !!data.userData.shippingExpress,
              international: !!data.userData.shippingInternational,
            },
            notifications: {
              newOrder: !!data.userData.notifyNewOrder,
              orderShipped: !!data.userData.notifyOrderShipped,
              paymentReceived: !!data.userData.notifyPaymentReceived,
              newOrderEmail: !!data.userData.notifyNewOrderEmail,
              newOrderSms: !!data.userData.notifyNewOrderSms,
              orderShippedEmail: !!data.userData.notifyOrderShippedEmail,
              orderShippedSms: !!data.userData.notifyOrderShippedSms,
              paymentReceivedEmail: !!data.userData.notifyPaymentReceivedEmail,
              paymentReceivedSms: !!data.userData.notifyPaymentReceivedSms,
            },
          }));
        }
        setLoading(false);
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === 'checkbox' && 'checked' in e.target) {
      checked = (e.target as HTMLInputElement).checked;
    }
    if (name.startsWith('shippingOptions.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, shippingOptions: { ...f.shippingOptions, [key]: checked } }));
    } else if (name.startsWith('notifications.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: checked } }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);
    await updateUserProfile(currentUser.uid, {
      companyName: form.shopName,
      description: form.description,
      category: form.category,
      bankAccount: form.bankAccount,
      payoutSchedule: form.payoutSchedule,
      automaticPayout: form.automaticPayout,
      shippingFrom: form.shippingFrom,
      shippingStandard: form.shippingOptions.standard,
      shippingExpress: form.shippingOptions.express,
      shippingInternational: form.shippingOptions.international,
      notifyNewOrder: form.notifications.newOrder,
      notifyOrderShipped: form.notifications.orderShipped,
      notifyPaymentReceived: form.notifications.paymentReceived,
      notifyNewOrderEmail: form.notifications.newOrderEmail,
      notifyNewOrderSms: form.notifications.newOrderSms,
      notifyOrderShippedEmail: form.notifications.orderShippedEmail,
      notifyOrderShippedSms: form.notifications.orderShippedSms,
      notifyPaymentReceivedEmail: form.notifications.paymentReceivedEmail,
      notifyPaymentReceivedSms: form.notifications.paymentReceivedSms,
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700" onClick={handleSave}>
          Save Changes
        </button>
      </div>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">Changes saved successfully!</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Shop Information</h2>
          <p className="mt-1 text-sm text-dark-500">
            Update your shop details and how they appear to customers
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="shop-name" className="block text-sm font-medium text-dark">
              Shop Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="shop-name"
                id="shop-name"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={form.shopName}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <p className="mt-2 text-sm text-dark-500">
              Brief description of your shop and the products you sell.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark">
              Shop Logo
            </label>
            <div className="mt-1 flex items-center">
              <span className="h-12 w-12 rounded-full overflow-hidden bg-sage-100">
                <svg className="h-full w-full text-sage-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <button
                type="button"
                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-dark hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Change
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-dark">
              Primary Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={form.category}
              onChange={handleChange}
            >
              <option>Home & Living</option>
              <option>Jewelry</option>
              <option>Art</option>
              <option>Clothing</option>
              <option>Accessories</option>
              <option>Paper Goods</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Payment Information</h2>
          <p className="mt-1 text-sm text-dark-500">
            Update your payment details and payout preferences
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="bank-account" className="block text-sm font-medium text-dark">
              Bank Account
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="bank-account"
                id="bank-account"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="••••••••1234"
                value={form.bankAccount}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="payout-schedule" className="block text-sm font-medium text-dark">
              Payout Schedule
            </label>
            <select
              id="payout-schedule"
              name="payout-schedule"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              value={form.payoutSchedule}
              onChange={handleChange}
            >
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="automatic-payout"
                name="automatic-payout"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={form.automaticPayout}
                onChange={handleChange}
              />
              <label htmlFor="automatic-payout" className="ml-2 block text-sm text-dark">
                Automatic payouts
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Shipping Settings</h2>
          <p className="mt-1 text-sm text-dark-500">
            Manage your shipping options and delivery methods
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="shipping-from" className="block text-sm font-medium text-dark">
              Shipping From
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="shipping-from"
                id="shipping-from"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={form.shippingFrom}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark">
              Shipping Options
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="standard-shipping"
                  name="shipping-option"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.shippingOptions.standard}
                  onChange={handleChange}
                />
                <label htmlFor="standard-shipping" className="ml-2 block text-sm text-dark">
                  Standard Shipping (3-5 business days)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="express-shipping"
                  name="shipping-option"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.shippingOptions.express}
                  onChange={handleChange}
                />
                <label htmlFor="express-shipping" className="ml-2 block text-sm text-dark">
                  Express Shipping (1-2 business days)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="international-shipping"
                  name="shipping-option"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.shippingOptions.international}
                  onChange={handleChange}
                />
                <label htmlFor="international-shipping" className="ml-2 block text-sm text-dark">
                  International Shipping
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Notification Preferences</h2>
          <p className="mt-1 text-sm text-dark-500">
            Choose how and when you'd like to be notified
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="new-order"
                  name="new-order"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.newOrder}
                  onChange={handleChange}
                />
                <label htmlFor="new-order" className="ml-2 block text-sm text-dark">
                  New order received
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="new-order-email"
                  name="new-order-email"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.newOrderEmail}
                  onChange={handleChange}
                />
                <label htmlFor="new-order-email" className="block text-sm text-dark-500">
                  Email
                </label>
                <input
                  id="new-order-sms"
                  name="new-order-sms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.newOrderSms}
                  onChange={handleChange}
                />
                <label htmlFor="new-order-sms" className="block text-sm text-dark-500">
                  SMS
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="order-shipped"
                  name="order-shipped"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.orderShipped}
                  onChange={handleChange}
                />
                <label htmlFor="order-shipped" className="ml-2 block text-sm text-dark">
                  Order shipped
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="order-shipped-email"
                  name="order-shipped-email"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.orderShippedEmail}
                  onChange={handleChange}
                />
                <label htmlFor="order-shipped-email" className="block text-sm text-dark-500">
                  Email
                </label>
                <input
                  id="order-shipped-sms"
                  name="order-shipped-sms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.orderShippedSms}
                  onChange={handleChange}
                />
                <label htmlFor="order-shipped-sms" className="block text-sm text-dark-500">
                  SMS
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="payment-received"
                  name="payment-received"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.paymentReceived}
                  onChange={handleChange}
                />
                <label htmlFor="payment-received" className="ml-2 block text-sm text-dark">
                  Payment received
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="payment-received-email"
                  name="payment-received-email"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.paymentReceivedEmail}
                  onChange={handleChange}
                />
                <label htmlFor="payment-received-email" className="block text-sm text-dark-500">
                  Email
                </label>
                <input
                  id="payment-received-sms"
                  name="payment-received-sms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={form.notifications.paymentReceivedSms}
                  onChange={handleChange}
                />
                <label htmlFor="payment-received-sms" className="block text-sm text-dark-500">
                  SMS
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanSettings; 