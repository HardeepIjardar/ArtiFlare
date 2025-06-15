import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Welcome, Artisan!</h1>
        <p className="text-dark-600 mt-1">Here's an overview of your store performance</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-dark mt-2">24</p>
          <p className="text-sage-500 text-sm mt-2">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Revenue</p>
          <p className="text-3xl font-bold text-dark mt-2">{1230..toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          <p className="text-sage-500 text-sm mt-2">+8% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Pending Orders</p>
          <p className="text-3xl font-bold text-primary mt-2">3</p>
          <p className="text-primary text-sm mt-2">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Product Listing</p>
          <p className="text-3xl font-bold text-dark mt-2">12</p>
          <p className="text-sage-500 text-sm mt-2">2 inactive</p>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-dark">Recent Orders</h2>
          <Link to="/artisan/orders" className="text-primary hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">#1089</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">John Smith</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">{129.00.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-sage-100 text-sage-800">
                    Shipped
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-500">May 12, 2023</td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">#1088</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">Sarah Jones</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">{79.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                    Processing
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-500">May 11, 2023</td>
              </tr>
              <tr>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">#1087</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">Michael Brown</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">{159.00.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-sage-100 text-sage-800">
                    Shipped
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-500">May 10, 2023</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold text-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/artisan/products/new" className="bg-sage-50 hover:bg-sage-100 p-4 rounded-lg border border-sage-200 text-center">
            <div className="text-sage-500 font-medium">Add New Product</div>
          </Link>
          <Link to="/artisan/orders" className="bg-primary-50 hover:bg-primary-100 p-4 rounded-lg border border-primary-200 text-center">
            <div className="text-primary font-medium">Process Orders</div>
          </Link>
          <Link to="/artisan/settings" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-dark-500 font-medium">Update Profile</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 