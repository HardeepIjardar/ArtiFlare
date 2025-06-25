import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, getArtisanOrders, getProductsByArtisan } from '../../services/firestore';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = React.useState<string>('Artisan');
  const [ordersCount, setOrdersCount] = React.useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = React.useState<number>(0);
  const [productsCount, setProductsCount] = React.useState<number>(0);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [customerNames, setCustomerNames] = React.useState<{[userId: string]: string}>({});

  React.useEffect(() => {
    if (currentUser) {
      getUserData(currentUser.uid).then((data) => {
        if (data?.userData) {
          setDisplayName(data.userData.companyName || data.userData.displayName || 'Artisan');
        }
      });
      // Fetch orders and products for stats
      getArtisanOrders(currentUser.uid).then(async ({ orders }) => {
        setOrdersCount(orders.length);
        setPendingOrdersCount(orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length);
        // Sort by createdAt descending and take 5 most recent
        const sorted = [...orders].sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0));
          const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0));
          return bDate.getTime() - aDate.getTime();
        });
        const top5 = sorted.slice(0, 5);
        setRecentOrders(top5);
        // Fetch customer names for these orders
        const userIds = Array.from(new Set(top5.map(order => order.userId)));
        const names: {[userId: string]: string} = {};
        await Promise.all(userIds.map(async (userId) => {
          const res = await getUserData(userId);
          names[userId] = res?.userData?.displayName || res?.userData?.companyName || 'Customer';
        }));
        setCustomerNames(names);
      });
      getProductsByArtisan(currentUser.uid).then(({ products }) => {
        setProductsCount(products.length);
      });
    }
  }, [currentUser]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Welcome, {displayName}!</h1>
        <p className="text-dark-600 mt-1">Here's an overview of your store performance</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-dark mt-2">{ordersCount}</p>
          <p className="text-sage-500 text-sm mt-2">&nbsp;</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Revenue</p>
          <p className="text-3xl font-bold text-dark mt-2">{1230..toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          <p className="text-sage-500 text-sm mt-2">+8% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Pending Orders</p>
          <p className="text-3xl font-bold text-primary mt-2">{pendingOrdersCount}</p>
          <p className="text-primary text-sm mt-2">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-dark-500 font-medium">Product Listing</p>
          <p className="text-3xl font-bold text-dark mt-2">{productsCount}</p>
          <p className="text-sage-500 text-sm mt-2">&nbsp;</p>
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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-dark-400">No recent orders found.</td>
              </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">#{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">{customerNames[order.userId] || 'Customer'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark">{order.total?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-sage-100 text-sage-800' : order.status === 'processing' ? 'bg-primary-100 text-primary-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</td>
              </tr>
                ))
              )}
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