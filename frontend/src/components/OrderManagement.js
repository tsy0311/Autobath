import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaEye, FaImage, FaTruck, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId, verified) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/verify-payment`, {
        verified,
        verifiedBy: 'admin'
      });

      if (response.data.success) {
        toast.success(verified ? 'Payment verified successfully!' : 'Payment verification removed');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status });
      if (response.data.success) {
        toast.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Order Management</h2>
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{order.customer_name}</div>
                  <div className="text-xs text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0].image_url}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-xs text-gray-400"><i class="fas fa-image"></i></div>';
                                }}
                              />
                            ) : item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-xs text-gray-400"><i class="fas fa-image"></i></div>';
                                }}
                              />
                            ) : (
                              <div className="text-xs text-gray-400"><i className="fas fa-image"></i></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{item.product_name}</div>
                            {item.variant_name && (
                              <div className="text-xs text-secondary font-medium">
                                {item.variant_name}
                                {item.variant_price_adjustment !== 0 && (
                                  <span className="text-gray-500 ml-1">
                                    ({item.variant_price_adjustment > 0 ? '+' : ''}RM {item.variant_price_adjustment.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {item.brand} • Qty: {item.quantity} • RM {item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">No items found</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">RM {order.total_amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {order.payment_verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FaTimesCircle className="mr-1" /> Pending
                      </span>
                    )}
                  </div>
                  {order.payment_reference && (
                    <div className="text-xs text-gray-500 mt-1">Ref: {order.payment_reference}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-secondary hover:text-secondary-dark font-medium flex items-center gap-1"
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-2xl text-gray-400"><i class="fas fa-image"></i></div>';
                              }}
                            />
                          ) : item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="text-2xl text-gray-400"><i class="fas fa-image"></i></div>';
                              }}
                            />
                          ) : (
                            <div className="text-2xl text-gray-400"><i className="fas fa-image"></i></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{item.product_name}</h5>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          {item.variant_name && (
                            <p className="text-sm text-secondary font-medium">
                              Variant: {item.variant_name}
                              {item.variant_price_adjustment !== 0 && (
                                <span className="text-gray-500 ml-1">
                                  ({item.variant_price_adjustment > 0 ? '+' : ''}RM {item.variant_price_adjustment.toFixed(2)})
                                </span>
                              )}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500">Quantity: <span className="font-medium">{item.quantity}</span></span>
                            <span className="text-sm text-gray-500">Price: <span className="font-medium">RM {item.price.toFixed(2)}</span></span>
                            <span className="text-sm font-semibold text-gray-900">
                              Subtotal: RM {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 italic">No items found</div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Delivery Information</h4>
                <div className="flex items-center gap-2 text-sm">
                  {selectedOrder.delivery_option === 'delivery' ? (
                    <>
                      <FaTruck className="text-secondary" />
                      <span className="font-medium">Delivery</span>
                    </>
                  ) : (
                    <>
                      <FaStore className="text-secondary" />
                      <span className="font-medium">Self Collection</span>
                    </>
                  )}
                </div>
                {selectedOrder.delivery_address && (
                  <p className="text-sm text-gray-600 mt-2">{selectedOrder.delivery_address}</p>
                )}
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Payment Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{selectedOrder.payment_method?.toUpperCase() || 'TNG'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{selectedOrder.payment_reference || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-lg">RM {selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span>
                      {selectedOrder.payment_verified ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <FaCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-medium flex items-center gap-1">
                          <FaTimesCircle /> Pending Verification
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedOrder.payment_proof_url && (
                  <div className="mt-4">
                    <button
                      onClick={() => setViewingProof(selectedOrder.payment_proof_url)}
                      className="flex items-center gap-2 text-secondary hover:text-secondary-dark"
                    >
                      <FaImage /> View Payment Proof
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {!selectedOrder.payment_verified ? (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, true)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Verify Payment
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, false)}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Remove Verification
                  </button>
                )}
                
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {viewingProof && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setViewingProof(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            <img 
              src={viewingProof} 
              alt="Payment Proof" 
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setViewingProof(null)}
              className="mt-4 w-full px-4 py-2 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

