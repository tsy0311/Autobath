import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaDollarSign, FaFilter, FaSearch, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setOrderDetails(response.data.order);
        setSelectedOrder(orderId);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load order details';
      toast.error(errorMsg);
      console.log('Error details:', error.response);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}!`);
        fetchOrders();
        if (selectedOrder === orderId) {
          fetchOrderDetails(orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update order status';
      toast.error(errorMsg);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-large mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-management">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Orders Management</h2>
        <p className="text-gray-600">View and manage all product orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 font-semibold">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-semibold">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-semibold">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">RM {stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">Order #{order.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-secondary" />
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="font-semibold text-gray-800">{order.customer_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-800 text-sm">{order.customer_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-semibold text-gray-800">RM {order.total_amount}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Ordered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEye /> View Details
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Start Processing
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && orderDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Order #{orderDetails.id}</h3>
                <p className="text-white/90">Order Details</p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderDetails(null);
                }}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUser className="text-secondary" /> Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-semibold text-gray-800">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-semibold text-gray-800">{orderDetails.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-semibold text-gray-800">{orderDetails.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date:</p>
                    <p className="font-semibold text-gray-800">{new Date(orderDetails.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShoppingCart className="text-green-600" /> Order Items
                </h4>
                {orderDetails.items && orderDetails.items.length > 0 ? (
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name || 'Product'}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">RM {parseFloat(item.price).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Total: RM {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No order items available</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[orderDetails.status] || 'bg-gray-100 text-gray-800'}`}>
                    {orderDetails.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-secondary">RM {parseFloat(orderDetails.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              {orderDetails.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      updateOrderStatus(orderDetails.id, 'processing');
                      setSelectedOrder(null);
                      setOrderDetails(null);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Start Processing
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(orderDetails.id, 'cancelled');
                      setSelectedOrder(null);
                      setOrderDetails(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
              {orderDetails.status === 'processing' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      updateOrderStatus(orderDetails.id, 'completed');
                      setSelectedOrder(null);
                      setOrderDetails(null);
                    }}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderDetails(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;

