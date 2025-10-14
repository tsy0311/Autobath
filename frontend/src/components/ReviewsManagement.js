import React, { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaTimes, FaUser, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reviews');
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, approved) => {
    try {
      await api.put(`/api/reviews/${reviewId}/approve`, { is_approved: approved });
      toast.success(`Review ${approved ? 'approved' : 'rejected'} successfully!`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review status');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.is_approved === 1) ||
      (filterStatus === 'pending' && review.is_approved === 0);
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    const matchesSearch = 
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesRating && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.is_approved === 1).length,
    pending: reviews.filter(r => r.is_approved === 0).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-large mb-4"></div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-management">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Reviews Management</h2>
        <p className="text-gray-600">Moderate and manage customer reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 font-semibold">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-semibold">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-semibold">Avg Rating</p>
          <p className="text-2xl font-bold text-blue-600">{stats.avgRating} ⭐</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            review.is_approved === 1
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                            {review.is_approved === 1 ? 'APPROVED' : 'PENDING'}
                          </span>
                          <span className="text-sm text-gray-500">#{review.id}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaUser className="text-secondary" />
                          <span className="font-semibold text-gray-800">{review.customer_name}</span>
                          <span className="text-sm text-gray-500">({review.customer_email})</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {review.service_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Service:</strong> {review.service_name}
                      </p>
                    )}

                    {review.title && (
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{review.title}</h4>
                    )}

                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      Submitted on {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {review.is_approved === 0 && (
                    <div className="flex md:flex-col gap-2 min-w-[140px]">
                      <button
                        onClick={() => updateReviewStatus(review.id, true)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.id, false)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                  {review.is_approved === 1 && (
                    <div className="flex items-center justify-center min-w-[140px]">
                      <span className="text-sm text-green-600 font-semibold">✓ Published</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;

