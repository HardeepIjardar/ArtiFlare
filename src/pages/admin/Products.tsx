import React from 'react';
import { Link } from 'react-router-dom';

const AdminProducts: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">All Products</h1>
        <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700">
          Add New Product
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">Search products</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-dark-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Search products"
                  type="search"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  <option>All categories</option>
                  <option>Home & Living</option>
                  <option>Jewelry</option>
                  <option>Art</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                </select>
              </div>
              
              <div>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  <option>All artisans</option>
                  <option>Emma's Crafts</option>
                  <option>Woodwork Wonders</option>
                  <option>Paper & Petals</option>
                  <option>Clay Creations</option>
                </select>
              </div>
              
              <div>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Out of Stock</option>
                  <option>Pending Review</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Artisan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-sage-100 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-dark">Handcrafted Wooden Planter</div>
                    <div className="text-sm text-dark-500">SKU: WP-1234</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Emma's Crafts</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Home & Living</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">{34.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-primary hover:text-primary-700 mr-4">Edit</a>
                <a href="#" className="text-dark-500 hover:text-dark-700">Delete</a>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-sage-100 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-dark">Custom Embroidered Pillow</div>
                    <div className="text-sm text-dark-500">SKU: EP-5678</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Paper & Petals</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Home & Living</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">{29.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-primary hover:text-primary-700 mr-4">Edit</a>
                <a href="#" className="text-dark-500 hover:text-dark-700">Delete</a>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-sage-100 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-dark">Artisan Scented Candle Set</div>
                    <div className="text-sm text-dark-500">SKU: SC-9012</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Woodwork Wonders</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Home & Living</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">{24.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Out of Stock
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-primary hover:text-primary-700 mr-4">Edit</a>
                <a href="#" className="text-dark-500 hover:text-dark-700">Delete</a>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-sage-100 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-dark">Handwoven Basket</div>
                    <div className="text-sm text-dark-500">SKU: HB-3456</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Baskets & Beyond</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Home & Living</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">{39.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending Review
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-primary hover:text-primary-700 mr-4">Edit</a>
                <a href="#" className="text-dark-500 hover:text-dark-700">Delete</a>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-sage-100 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-dark">Ceramic Mug Set</div>
                    <div className="text-sm text-dark-500">SKU: CM-7890</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Clay Creations</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">Home & Living</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-dark">{42.99.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-primary hover:text-primary-700 mr-4">Edit</a>
                <a href="#" className="text-dark-500 hover:text-dark-700">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">852</span> products
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

export default AdminProducts; 