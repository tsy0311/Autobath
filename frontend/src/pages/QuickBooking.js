import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaCar, FaCheck } from 'react-icons/fa';
import api from '../services/api';

const QuickBooking = () => {
  const { token } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadBookingData = async () => {
    try {
      const response = await api.get(`/api/bookings/quick/${token}`);
      setBookingData(response.data.bookingData);
    } catch (error) {
      toast.error('Invalid or expired booking link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/bookings/quick', {
        token,
        name,
        phone
      });
      
      toast.success('Booking confirmed successfully!');
      setCompleted(true);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create booking';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner mb-4"></div>
          <h2 className="text-2xl font-bold">Loading booking details...</h2>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Booking Link</h2>
          <p className="text-gray-600 mb-6">This booking link is invalid or has expired.</p>
          <a href="/booking" className="btn">Make New Booking</a>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
          <div className="text-green-500 text-6xl mb-4">
            <FaCheck className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you, {name}! Your booking has been confirmed. 
            We'll see you on {bookingData.date} at {bookingData.timeSlot}.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Booking Details:</h3>
            <p className="text-sm text-gray-600"><strong>Service:</strong> {bookingData.service}</p>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600"><strong>Time:</strong> {bookingData.timeSlot}</p>
          </div>
          <a href="/" className="btn mt-6">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Quick Booking</h2>
            <p className="text-xl text-white/90">Complete your booking in just 2 steps!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Booking Details */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Pre-Selected Service</h3>
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-6 space-y-3">
                <div className="flex items-center text-gray-700">
                  <FaCar className="mr-3 text-secondary" />
                  <span className="font-semibold">Service:</span>
                  <span className="ml-2">{bookingData.service}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaCalendarAlt className="mr-3 text-secondary" />
                  <span className="font-semibold">Date:</span>
                  <span className="ml-2">{new Date(bookingData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaClock className="mr-3 text-secondary" />
                  <span className="font-semibold">Time:</span>
                  <span className="ml-2">{bookingData.timeSlot}</span>
                </div>
              </div>
            </div>

            {/* Customer Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-primary">Your Information</h3>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+60 123456789"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> By confirming this booking, you agree to arrive on time. 
                  If you need to cancel or reschedule, please contact us at least 24 hours in advance.
                </p>
              </div>

              <button
                type="submit"
                className="btn w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Confirming...
                  </>
                ) : (
                  <>
                    <FaCheck className="inline mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBooking;

