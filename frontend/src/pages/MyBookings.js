import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaCar, FaEnvelope, FaPhone, FaSearch } from 'react-icons/fa';
import api from '../services/api';

const MyBookings = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchBookings = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await api.get(`/api/bookings/customer/${encodeURIComponent(email)}`);
      setBookings(response.data.bookings || []);
      
      if (response.data.bookings.length === 0) {
        toast.info('No bookings found for this email');
      } else {
        toast.success(`Found ${response.data.bookings.length} booking(s)`);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              My Bookings
            </h1>
            <p className="text-xl text-gray-600">
              Track and manage your appointments
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">
              Find Your Bookings
            </h2>
            <form onSubmit={searchBookings} className="max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-secondary focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex items-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Search
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Enter the email address you used when making the booking
              </p>
            </form>
          </div>

          {/* Bookings List */}
          {searched && (
            <div className="space-y-6">
              {bookings.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    Your Bookings ({bookings.length})
                  </h2>
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-primary mb-2">
                              {booking.service_name || 'Service Appointment'}
                            </h3>
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Booking ID</div>
                            <div className="text-lg font-bold text-secondary">#{booking.id}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-3 text-gray-700">
                            <FaCalendarAlt className="text-secondary" />
                            <div>
                              <div className="text-sm text-gray-500">Date</div>
                              <div className="font-semibold">{formatDate(booking.date)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-gray-700">
                            <FaClock className="text-secondary" />
                            <div>
                              <div className="text-sm text-gray-500">Time</div>
                              <div className="font-semibold">{booking.time_slot}</div>
                            </div>
                          </div>

                          {booking.vehicle_type && (
                            <div className="flex items-center gap-3 text-gray-700">
                              <FaCar className="text-secondary" />
                              <div>
                                <div className="text-sm text-gray-500">Vehicle</div>
                                <div className="font-semibold capitalize">{booking.vehicle_type}</div>
                              </div>
                            </div>
                          )}

                          {booking.customer_phone && (
                            <div className="flex items-center gap-3 text-gray-700">
                              <FaPhone className="text-secondary" />
                              <div>
                                <div className="text-sm text-gray-500">Phone</div>
                                <div className="font-semibold">{booking.customer_phone}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="text-sm text-gray-500 mb-1">Notes:</div>
                            <p className="text-gray-700">{booking.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          {booking.status === 'pending' && (
                            <>
                              <a
                                href={`https://wa.me/60163399533?text=Hi%2C%20I%20need%20to%20reschedule%20my%20booking%20%23${booking.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline flex-1 text-center"
                              >
                                Reschedule
                              </a>
                              <a
                                href={`https://wa.me/60163399533?text=Hi%2C%20I%20need%20to%20cancel%20my%20booking%20%23${booking.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white flex-1 text-center"
                              >
                                Cancel
                              </a>
                            </>
                          )}
                          {booking.status === 'completed' && (
                            <a
                              href={`/booking?rebookService=${encodeURIComponent(booking.service_name)}`}
                              className="btn flex-1 text-center"
                            >
                              Book Again
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any bookings for <strong>{email}</strong>
                  </p>
                  <a href="/booking" className="btn inline-block">
                    Make Your First Booking
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          {!searched && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-blue-900 mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Enter the email address you used when booking</li>
                <li>Click "Search" to view all your bookings</li>
                <li>Manage, reschedule, or cancel your appointments</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;




