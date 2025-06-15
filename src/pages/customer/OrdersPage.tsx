import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../services/firestore';
import type { Order } from '../../services/firestore';

const OrdersPage: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const { orders, error } = await getUserOrders(currentUser.uid);
        if (error) {
          setError(error);
        } else {
          setOrders(orders);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark mb-6">Your Orders</h1>
      {loading || authLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-dark-500 text-center py-8">No orders found.</div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-dark">Order #{order.id}</h2>
                  <p className="text-dark-500 text-sm">
                    Placed on {order.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'bg-sage-100 text-sage-800'
                      : order.status === 'processing'
                      ? 'bg-primary-100 text-primary-800'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.status === 'delivered' && order.updatedAt && (
                    <p className="text-dark-500 text-sm mt-1">
                      Delivered on {order.updatedAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                  {order.status === 'processing' && order.updatedAt && (
                    <p className="text-dark-500 text-sm mt-1">
                      Last updated: {order.updatedAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {order.items.map((item, idx) => (
                <div
                  key={item.productId + idx}
                  className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center"
                >
                  <div className="md:w-1/4 mb-4 md:mb-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-sage-100 rounded-md flex items-center justify-center text-dark-300">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="md:w-2/4">
                    <h3 className="font-bold text-dark">{item.productName}</h3>
                    {item.customizations && (
                      <div className="text-dark-600 text-sm mt-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <div key={key}>
                            {key}: {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/4 text-right">
                    <p className="text-primary font-bold">{item.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    <p className="text-dark-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="text-dark-600 text-sm mb-2 md:mb-0">
                  <span className="font-medium">Total:</span> {order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </div>
                <div className="flex space-x-4">
                  <Link
                    to={`/orders/${order.id}/tracking`}
                    className="text-primary hover:text-primary-700 font-medium text-sm"
                  >
                    Track Order
                  </Link>
                  <button className="text-dark-600 hover:text-dark-800 font-medium text-sm">
                    View Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 