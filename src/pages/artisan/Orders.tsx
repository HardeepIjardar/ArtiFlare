import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToArtisanOrders, getUserData } from '../../services/firestore';
import { useCurrency } from '../../contexts/CurrencyContext';

const statusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800',
  shipped: 'bg-sage-100 text-sage-800',
  processing: 'bg-primary-100 text-primary-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ArtisanOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const { convertPrice, formatPrice } = useCurrency();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [customerNames, setCustomerNames] = React.useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('All orders');

  React.useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsubscribe = subscribeToArtisanOrders(currentUser.uid, async (orders) => {
      setOrders(orders);
      // Fetch customer names for these orders
      const userIds = Array.from(new Set(orders.map(order => order.userId)));
      const names: { [userId: string]: string } = {};
      await Promise.all(userIds.map(async (userId) => {
        const res = await getUserData(userId);
        names[userId] = res?.userData?.displayName || res?.userData?.companyName || 'Customer';
      }));
      setCustomerNames(names);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const filteredOrders = statusFilter === 'All orders'
    ? orders
    : orders.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Orders</h1>
        <div>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>All orders</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-dark-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-dark-400">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark">{customerNames[order.userId] || 'Customer'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status?.toLowerCase()] || ''}`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {formatPrice(convertPrice(order.total || 0, 'INR'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/artisan/orders/${order.id}`} className="text-primary hover:text-primary-700">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-500">
              Showing <span className="font-medium">{filteredOrders.length === 0 ? 0 : 1}</span> to <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
            </div>
            {/* Pagination can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanOrders; 