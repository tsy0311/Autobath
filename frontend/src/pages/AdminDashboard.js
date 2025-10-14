import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaShoppingCart, FaStar, FaDollarSign, FaChartLine, FaCog, FaSignOutAlt, FaHome, FaKey, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ProductManagement from '../components/ProductManagement';
import BookingsManagement from '../components/BookingsManagement';
import CustomersManagement from '../components/CustomersManagement';
import ReviewsManagement from '../components/ReviewsManagement';
import OrdersManagement from '../components/OrdersManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [customersRes, bookingsRes, ordersRes, reviewsRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/bookings'),
        api.get('/api/orders'),
        api.get('/api/reviews')
      ]);

      const customers = customersRes.data.customers;
      const bookings = bookingsRes.data.bookings || [];
      const orders = ordersRes.data.orders || [];
      const reviews = reviewsRes.data.reviews;

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalBookings = bookings.length;
      const totalCustomers = customers.length;
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Recent activity
      const recentBookings = bookings.slice(0, 5);
      const recentOrders = orders.slice(0, 5);
      const recentReviews = reviews.slice(0, 5);

      // Booking status distribution
      const bookingStats = {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      };

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStart = month.toISOString().split('T')[0];
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        monthlyRevenue.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        });
      }

      setStats({
        totalRevenue,
        totalBookings,
        totalCustomers,
        totalReviews,
        averageRating,
        recentBookings,
        recentOrders,
        recentReviews,
        bookingStats,
        monthlyRevenue
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p style={{ color: '#dc3545' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-secondary text-white shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Branding & Welcome */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1 sm:mb-2">
                AUTOBATH Admin
              </h1>
              <p className="text-white/90 text-sm sm:text-base md:text-lg">
                Welcome back, <span className="font-semibold text-secondary">{user?.fullName || user?.username}</span>! 👋
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button 
                onClick={() => navigate('/')}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-white/30"
              >
                <FaHome className="text-sm sm:text-base" /> <span className="hidden sm:inline">Website</span><span className="sm:hidden">Home</span>
              </button>
              <button 
                onClick={() => setIsChangePasswordOpen(true)}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-white/30"
              >
                <FaKey className="text-sm sm:text-base" /> <span className="hidden sm:inline">Password</span><span className="sm:hidden">Pass</span>
              </button>
              <button 
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-500/90 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <FaSignOutAlt className="text-sm sm:text-base" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8"  >

        {/* Modern Navigation Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1.5 sm:p-2 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex gap-1.5 sm:gap-2 min-w-max">
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine className="text-sm sm:text-base" /> <span className="hidden xs:inline">Overview</span>
            </button>
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <FaBox className="text-sm sm:text-base" /> Products
            </button>
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'bookings' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <FaCalendarAlt className="text-sm sm:text-base" /> Bookings
            </button>
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'customers' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <FaUsers className="text-sm sm:text-base" /> Customers
            </button>
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'reviews' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              <FaStar className="text-sm sm:text-base" /> Reviews
            </button>
            <button 
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <FaShoppingCart className="text-sm sm:text-base" /> Orders
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <ProductManagement />
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <BookingsManagement />
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <CustomersManagement />
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <ReviewsManagement />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersManagement />
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content"  >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Total Revenue</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaDollarSign className="text-2xl sm:text-3xl text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Total Bookings</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt className="text-2xl sm:text-3xl text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Total Customers</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-2xl sm:text-3xl text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Avg Rating</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)} ⭐</p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaStar className="text-2xl sm:text-3xl text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Booking Status Distribution</h3>
                <div className="booking-stats">
                  {Object.entries(stats.bookingStats).map(([status, count]) => (
                    <div key={status} className="status-item">
                      <div 
                        className="status-color" 
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                      <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Monthly Revenue</h3>
                <div className="revenue-chart">
                  {stats.monthlyRevenue.map((item, index) => (
                    <div key={index} className="revenue-item">
                      <div className="revenue-bar-container">
                        <div 
                          className="revenue-bar"
                          style={{ 
                            height: `${Math.max((item.revenue / Math.max(...stats.monthlyRevenue.map(r => r.revenue))) * 100, 5)}%`
                          }}
                        ></div>
                      </div>
                      <div className="revenue-label">{item.month}</div>
                      <div className="revenue-value">{formatCurrency(item.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-sm sm:text-base text-blue-600" /> Recent Bookings
                </h3>
                <div className="activity-list">
                  {stats.recentBookings.map(booking => (
                    <div key={booking.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{booking.customer_name}</div>
                        <div className="activity-details">{booking.service_type} - {booking.date} {booking.time_slot}</div>
                      </div>
                      <div 
                        className="activity-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaShoppingCart className="text-sm sm:text-base text-green-600" /> Recent Orders
                </h3>
                <div className="activity-list">
                  {stats.recentOrders.map(order => (
                    <div key={order.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{order.customer_name}</div>
                        <div className="activity-details">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="activity-amount">{formatCurrency(order.total_amount)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaStar className="text-sm sm:text-base text-yellow-600" /> Recent Reviews
                </h3>
                <div className="activity-list">
                  {stats.recentReviews.map(review => (
                    <div key={review.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{review.customer_name}</div>
                        <div className="activity-details">{review.service_name || 'Service Review'}</div>
                      </div>
                      <div className="activity-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Change Password Modal */}
        <ChangePasswordModal 
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
