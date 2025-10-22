import React, { useState, useEffect } from 'react';
import { FaClock, FaCar, FaMotorcycle, FaTools, FaGem, FaStar } from 'react-icons/fa';
import api from '../services/api';

const ServiceMenu = () => {
  const [services, setServices] = useState([]);
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');

  useEffect(() => {
    fetchServices();
    fetchServicePackages();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      if (response.data && response.data.success && Array.isArray(response.data.services)) {
        setServices(response.data.services);
      } else {
        console.error('Unexpected services data format:', response.data);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchServicePackages = async () => {
    try {
      const response = await api.get('/api/service-packages');
      if (response.data && response.data.success && Array.isArray(response.data.packages)) {
        setServicePackages(response.data.packages);
      } else {
        console.error('Unexpected service packages data format:', response.data);
        setServicePackages([]);
      }
    } catch (error) {
      console.error('Error fetching service packages:', error);
      setServicePackages([]);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle': return <FaMotorcycle className="text-blue-500" />;
      case 'hatchback': return <FaCar className="text-green-500" />;
      case 'sedan/suv': return <FaCar className="text-purple-500" />;
      case 'truck/mpv': return <FaCar className="text-orange-500" />;
      default: return <FaCar className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Motorcycle': return <FaMotorcycle className="text-blue-500" />;
      case 'Add-on': return <FaTools className="text-yellow-500" />;
      case 'Protection': return <FaStar className="text-green-500" />;
      case 'Coating': return <FaGem className="text-purple-500" />;
      case 'Polish': return <FaStar className="text-gold-500" />;
      default: return <FaTools className="text-gray-500" />;
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const filterServicesByVehicleType = (servicesList) => {
    if (!Array.isArray(servicesList)) return [];
    if (selectedVehicleType === 'all') return servicesList;
    return servicesList.filter(service => 
      service.vehicle_types && service.vehicle_types.includes(selectedVehicleType)
    );
  };

  const groupServicesByCategory = (servicesList) => {
    if (!Array.isArray(servicesList)) {
      return {};
    }
    const grouped = {};
    servicesList.forEach(service => {
      const category = service.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  };

  const filteredServices = Array.isArray(services) ? filterServicesByVehicleType(services) : [];
  const filteredPackages = Array.isArray(servicePackages) ? filterServicesByVehicleType(servicePackages) : [];
  const groupedServices = groupServicesByCategory(filteredServices);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading our service menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚗 AUTOBATH Service Menu
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Professional Car Care Services & Packages
            </p>
            
            {/* Vehicle Type Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => setSelectedVehicleType('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVehicleType === 'all'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Vehicles
              </button>
              <button
                onClick={() => setSelectedVehicleType('motorcycle')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedVehicleType === 'motorcycle'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaMotorcycle /> Motorcycle
              </button>
              <button
                onClick={() => setSelectedVehicleType('hatchback')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedVehicleType === 'hatchback'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaCar /> Hatchback
              </button>
              <button
                onClick={() => setSelectedVehicleType('sedan/suv')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedVehicleType === 'sedan/suv'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaCar /> Sedan/SUV
              </button>
              <button
                onClick={() => setSelectedVehicleType('truck/mpv')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedVehicleType === 'truck/mpv'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaCar /> Truck/MPV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Packages Section */}
      {filteredPackages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📦 Service Packages</h2>
            <p className="text-lg text-gray-600">Complete car care solutions for every vehicle type</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{pkg.name}</h3>
                    {getVehicleTypeIcon(pkg.vehicle_type)}
                  </div>
                  <p className="text-primary-light">{pkg.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-primary">RM {pkg.price}</span>
                    <div className="flex items-center text-gray-500">
                      <FaClock className="mr-1" />
                      <span className="text-sm">{formatDuration(pkg.duration_minutes)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pkg.services && pkg.services.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pkg.services.slice(0, 3).map((service, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                              {service.name}
                            </li>
                          ))}
                          {pkg.services.length > 3 && (
                            <li className="text-primary font-medium">
                              +{pkg.services.length - 3} more services
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🔧 Individual Services</h2>
          <p className="text-lg text-gray-600">Specialized services for specific needs</p>
        </div>

        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category} className="mb-16">
            <div className="flex items-center mb-8">
              <div className="mr-4 text-3xl">
                {getCategoryIcon(category)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{category} Services</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">RM {service.base_price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{formatDuration(service.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center">
                      {service.vehicle_types && service.vehicle_types.map((vt, index) => (
                        <span key={index} className="flex items-center mr-2">
                          {getVehicleTypeIcon(vt)}
                          <span className="ml-1 text-xs">{vt}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {service.bike_type && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700 font-medium">
                        Bike Type: {service.bike_type}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Service?</h2>
          <p className="text-xl text-primary-light mb-8">
            Contact us now to schedule your appointment or get a personalized quote
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              📞 Call Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary transition-colors">
              📅 Book Online
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMenu;
