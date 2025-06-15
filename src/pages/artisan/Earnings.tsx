import React from 'react';

const ArtisanEarnings: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">Earnings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-medium text-dark-500">Total Earnings</h2>
          <p className="mt-2 text-3xl font-bold text-dark">{4385.23.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          <div className="mt-1 flex items-center text-sm text-green-600">
            <svg className="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-1">15.3% from last month</span>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-medium text-dark-500">This Month</h2>
          <p className="mt-2 text-3xl font-bold text-dark">{1245.80.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          <div className="mt-1 flex items-center text-sm text-green-600">
            <svg className="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-1">23.1% from last month</span>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-sm font-medium text-dark-500">Available for Withdrawal</h2>
          <p className="mt-2 text-3xl font-bold text-dark">{985.42.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          <div className="mt-2">
            <button className="text-white bg-primary hover:bg-primary-700 px-4 py-2 rounded text-sm">
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-dark">Monthly Earnings</h2>
        </div>
        <div className="p-6">
          <div className="relative h-80">
            {/* This would be replaced with an actual chart component in a real app */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-dark-500">Chart showing monthly earnings</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-dark">Recent Transactions</h2>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              <option>Last 30 days</option>
              <option>Last 60 days</option>
              <option>Last 90 days</option>
              <option>All transactions</option>
            </select>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Transaction
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-dark">Sale - Handcrafted Wooden Planter</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">May 12, 2023</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">#12345</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                <span className="text-green-600">+{34.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-dark">Sale - Custom Embroidered Pillow</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">May 10, 2023</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">#12344</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                <span className="text-green-600">+{29.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-dark">Withdrawal</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">May 8, 2023</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">-</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                <span className="text-red-600">-{250.00.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-dark">Sale - Artisan Scented Candle Set</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">May 5, 2023</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">#12343</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                <span className="text-green-600">+{74.97.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-dark">Refund - Artisan Scented Candle</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">May 1, 2023</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">#12342</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Refunded
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                <span className="text-red-600">-{24.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">20</span> transactions
            </div>
            <div className="flex-1 flex justify-end">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-dark-700 bg-white hover:bg-gray-50 opacity-50 cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-dark-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanEarnings; 