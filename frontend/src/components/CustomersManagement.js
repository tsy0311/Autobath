import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCar, FaStar, FaDollarSign, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const [detailsRes, historyRes] = await Promise.all([
        api.get(`/api/customers/${customerId}`),
        api.get(`/api/customers/${customerId}/history`)
      ]);
      
      setCustomerDetails({
        ...detailsRes.data.customer,
        serviceHistory: historyRes.data.history || []
      });
      setSelectedCustomer(customerId);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load customer details';
      toast.error(errorMsg);
      console.log('Error details:', error.response);
    }
  };

  const getLoyaltyBadge = (tier) => {
    const badges = {
      bronze: 'bg-amber-700 text-white',
      silver: 'bg-gray-400 text-white',
      gold: 'bg-yellow-500 text-white',
      platinum: 'bg-purple-600 text-white'
    };
    return badges[tier] || 'bg-gray-300 text-gray-700';
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-large mb-4"></div>
        <p className="text-gray-600">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers-management">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Customer Management</h2>
          <p className="text-gray-600">View customer information and service history</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Customers</p>
          <p className="text-3xl font-bold text-secondary">{customers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Customers Found</h3>
          <p className="text-gray-500">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => fetchCustomerDetails(customer.id)}
            >
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-1">{customer.name}</h3>
                  {customer.loyalty_tier && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getLoyaltyBadge(customer.loyalty_tier)}`}>
                      {customer.loyalty_tier.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <FaUser className="text-2xl text-secondary" />
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaEnvelope className="text-blue-600" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-green-600" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.vehicle_make && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCar className="text-purple-600" />
                    <span>{customer.vehicle_make} {customer.vehicle_model}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Loyalty Points</p>
                  <p className="text-lg font-bold text-secondary flex items-center gap-1">
                    <FaStar /> {customer.loyalty_points || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                    <FaDollarSign /> RM {customer.total_spent || 0}
                  </p>
                </div>
              </div>

              <button className="mt-4 w-full py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && customerDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{customerDetails.name}</h3>
                <p className="text-white/90">{customerDetails.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetails(null);
                }}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-secondary" /> Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {customerDetails.email}</p>
                    <p><strong>Phone:</strong> {customerDetails.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {customerDetails.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCar className="text-purple-600" /> Vehicle Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Make:</strong> {customerDetails.vehicle_make || 'N/A'}</p>
                    <p><strong>Model:</strong> {customerDetails.vehicle_model || 'N/A'}</p>
                    <p><strong>Year:</strong> {customerDetails.vehicle_year || 'N/A'}</p>
                    <p><strong>Color:</strong> {customerDetails.vehicle_color || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaStar className="text-yellow-600" /> Loyalty Program
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tier:</strong> <span className={`px-2 py-1 rounded ${getLoyaltyBadge(customerDetails.loyalty_tier)}`}>{customerDetails.loyalty_tier || 'N/A'}</span></p>
                    <p><strong>Points:</strong> {customerDetails.loyalty_points || 0}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaDollarSign className="text-green-600" /> Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Spent:</strong> RM {customerDetails.total_spent || 0}</p>
                    <p><strong>Last Service:</strong> {customerDetails.last_service_date || 'Never'}</p>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4 text-lg">Service History</h4>
                {!customerDetails.serviceHistory || customerDetails.serviceHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No service history available</p>
                ) : (
                  <div className="space-y-3">
                    {customerDetails.serviceHistory.map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{service.service_name || service.service_type || 'Service'}</p>
                          <p className="text-sm text-gray-600">{service.date} {service.time_slot ? `at ${service.time_slot}` : ''}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          service.status === 'completed' ? 'bg-green-100 text-green-800' :
                          service.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetails(null);
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

export default CustomersManagement;

