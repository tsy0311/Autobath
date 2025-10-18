import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaPhone, FaEnvelope, FaCar, FaCheck, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    // Optimistic UI: update local state without page reload
    const previous = bookings;
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    try {
      await api.put(`/api/bookings/${bookingId}`, { status: newStatus });
      toast.success(`Booking ${newStatus} successfully!`);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
      // Revert on failure
      setBookings(previous);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-large mb-4"></div>
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-management">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Bookings Management</h2>
        <p className="text-gray-600">View and manage all service bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 font-semibold">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-semibold">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-semibold">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 font-semibold">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">#{booking.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-secondary" />
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="font-semibold text-gray-800">{booking.customer_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Date & Time</p>
                          <p className="font-semibold text-gray-800">{booking.date} at {booking.time_slot}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaCar className="text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500">Service</p>
                          <p className="font-semibold text-gray-800">{booking.service_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-800 text-sm">{booking.customer_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-800">{booking.customer_phone || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaClock className="text-red-600" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-800">{booking.duration_minutes || 60} min</p>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaCheck /> Confirm
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaTimes /> Cancel
                        </button>
                        {/* Quick WhatsApp message */}
                        {booking.customer_phone && (
                          <a
                            href={`https://wa.me/${booking.customer_phone.replace(/\D/g,'')}`} 
                            target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#25D366] text-white rounded-lg font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                          >
                            WhatsApp Customer
                          </a>
                        )}
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Complete
                      </button>
                    )}
                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                      <span className="text-sm text-gray-500 text-center py-2">No actions available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;

