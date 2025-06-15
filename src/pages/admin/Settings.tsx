import React from 'react';

const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin Settings</h1>
        <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700">
          Save Changes
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">General Settings</h2>
          <p className="mt-1 text-sm text-dark-500">
            Configure the general settings for your platform
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="site-name" className="block text-sm font-medium text-dark">
              Platform Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="site-name"
                id="site-name"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="ArtiFlare"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-dark">
              Tagline
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="tagline"
                id="tagline"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="Discover unique handcrafted treasures"
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
                rows={3}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="ArtiFlare is a platform that connects talented artisans with customers who appreciate handcrafted quality goods."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-dark">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>CAD (C$)</option>
                <option>AUD (A$)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-dark">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
                <option>Pacific Time (PT)</option>
                <option>UTC</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date-format" className="block text-sm font-medium text-dark">
                Date Format
              </label>
              <select
                id="date-format"
                name="date-format"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Payment Settings</h2>
          <p className="mt-1 text-sm text-dark-500">
            Configure payment gateways and transaction settings
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-dark">Payment Gateways</h3>
              <button className="text-primary text-sm font-medium hover:text-primary-700">
                Add Gateway
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-white rounded-md flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h7v-2H7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-dark">Stripe</h4>
                    <p className="text-sm text-dark-500">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-primary text-sm font-medium hover:text-primary-700">
                    Configure
                  </button>
                  <button className="text-dark-500 text-sm font-medium hover:text-dark-700">
                    Disconnect
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-white rounded-md flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.32 21.97a.78.78 0 0 1-.26-.3c-8.8-16.3 1-24.7 1-24.7l.42-.26a7.21 7.21 0 0 1 2.28-.71 4.79 4.79 0 0 1 1.9 0c.64.15 1.41.55 1.73.86 2.32 2.24 1.08 8.77 1.08 8.77s-.64-2.12-1.5-2.85c-.87 2.11.49 6.61.49 6.61S14.76 8.7 13.9 7.46c-.87 2.75.16 7.27.16 7.27s-.74-3-1.37-3.52c-.63 3.15.46 7.2.46 7.2s-.57-2.36-1.17-3.17c-.53 3.32 1.32 8.08 1.32 8.08.34.76-4.35 1.21-4.98-.35z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-dark">PayPal</h4>
                    <p className="text-sm text-dark-500">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-primary text-sm font-medium hover:text-primary-700">
                    Configure
                  </button>
                  <button className="text-dark-500 text-sm font-medium hover:text-dark-700">
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="platform-fee" className="block text-sm font-medium text-dark">
                Platform Fee (%)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="platform-fee"
                  id="platform-fee"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  defaultValue="10"
                />
              </div>
              <p className="mt-1 text-xs text-dark-500">
                Percentage fee charged on each transaction
              </p>
            </div>
            
            <div>
              <label htmlFor="payout-threshold" className="block text-sm font-medium text-dark">
                Payout Threshold (₹)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="payout-threshold"
                  id="payout-threshold"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  defaultValue="50"
                />
              </div>
              <p className="mt-1 text-xs text-dark-500">
                Minimum amount required for artisan payouts
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="payout-schedule" className="block text-sm font-medium text-dark">
              Default Payout Schedule
            </label>
            <select
              id="payout-schedule"
              name="payout-schedule"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option>Weekly (Every Monday)</option>
              <option>Bi-weekly (Every other Monday)</option>
              <option>Monthly (1st of each month)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Email Settings</h2>
          <p className="mt-1 text-sm text-dark-500">
            Configure email notifications and templates
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="sender-email" className="block text-sm font-medium text-dark">
              Sender Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="sender-email"
                id="sender-email"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="noreply@artisangiftexpress.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="sender-name" className="block text-sm font-medium text-dark">
              Sender Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="sender-name"
                id="sender-name"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue="Artisan Gift Express"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-dark mb-2">Email Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="new-order"
                    name="new-order"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="new-order" className="ml-2 block text-sm text-dark">
                    New Order
                  </label>
                </div>
                <button className="text-primary text-sm font-medium hover:text-primary-700">
                  Edit Template
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="order-status"
                    name="order-status"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="order-status" className="ml-2 block text-sm text-dark">
                    Order Status Updates
                  </label>
                </div>
                <button className="text-primary text-sm font-medium hover:text-primary-700">
                  Edit Template
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="user-registration"
                    name="user-registration"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="user-registration" className="ml-2 block text-sm text-dark">
                    User Registration
                  </label>
                </div>
                <button className="text-primary text-sm font-medium hover:text-primary-700">
                  Edit Template
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="artisan-application"
                    name="artisan-application"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="artisan-application" className="ml-2 block text-sm text-dark">
                    Artisan Application
                  </label>
                </div>
                <button className="text-primary text-sm font-medium hover:text-primary-700">
                  Edit Template
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="password-reset"
                    name="password-reset"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="password-reset" className="ml-2 block text-sm text-dark">
                    Password Reset
                  </label>
                </div>
                <button className="text-primary text-sm font-medium hover:text-primary-700">
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 