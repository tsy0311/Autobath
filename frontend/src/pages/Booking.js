import React, { useEffect, useState, useMemo } from 'react';
import { FaClock, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const steps = [
  { id: 1, title: 'Select Service' },
  { id: 2, title: 'Choose Time' },
  { id: 3, title: 'Your Details' },
  { id: 4, title: 'Review & Confirm' }
];

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [bufferTime, setBufferTime] = useState(15);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState('');

  // Service selection
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vehicleType, setVehicleType] = useState('sedan/suv');
  const [serviceType, setServiceType] = useState('package'); // package or individual
  const [motorcycleCategory, setMotorcycleCategory] = useState('normal'); // normal | sportbike

  // Customer details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Removed touchedSlot mobile workaround; rely on native click for better mobile compatibility

  // Internal calendar state (replaces native date picker for cross-device support)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Simplified: rely on native click events for mobile to avoid suppressed interactions
  const openDatePicker = () => setIsCalendarOpen((v) => !v);

  const formatYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const buildCalendarDays = (monthStart) => {
    // monthStart is set to the 1st of the month
    const start = new Date(monthStart);
    const startWeekday = (start.getDay() + 6) % 7; // make Monday=0 for nicer grid
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const days = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i++) days.push(null);
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), d));
    }
    // Trailing to complete weeks
    const tail = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < tail; i++) days.push(null);
    return days;
  };

  const handleSelectCalendarDate = (d) => {
    if (!d) return;
    if (d < today) return; // disallow past dates
    setDate(formatYYYYMMDD(d));
    setIsCalendarOpen(false);
  };




  // Load services and packages on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading services and packages...');
        console.log('API base URL:', api.defaults.baseURL);
        
        // Load both services and packages
        const [servicesRes, packagesRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/service-packages')
        ]);
        
        console.log('Services response:', servicesRes.data);
        console.log('Packages response:', packagesRes.data);
        
        setServices(servicesRes.data.services || []);
        setPackages(packagesRes.data.packages || []);
      } catch (error) {
        console.error('Error loading services/packages:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        toast.error(`Failed to load services/packages: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Check URL parameters for pre-selected service/package
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const packageId = urlParams.get('package');
    const type = urlParams.get('type');

    if (packageId && type === 'package') {
      setServiceType('package');
      const packageData = packages.find(p => p.id === parseInt(packageId));
      if (packageData) {
        setSelectedPackage(packageData);
        setSelectedService(null);
        setCurrentStep(2);
      }
    } else if (serviceId && type === 'individual') {
      setServiceType('individual');
      // Find service by ID from API data
      const serviceData = services.find(s => s.id === parseInt(serviceId));
      if (serviceData) {
        setSelectedService(serviceData);
        setSelectedPackage(null);
        setCurrentStep(2);
      }
    }
  }, [packages, services]);


  // Load available slots when date changes
  useEffect(() => {
    if (!date || (!selectedPackage && !selectedService)) {
      setAvailableSlots([]);
      setSlot('');
      return;
    }
    
    setSlotsLoading(true);
    setSlot('');
    
    // Calculate estimated duration
    const duration = selectedPackage?.duration_minutes || selectedService?.duration_minutes || 60;
    
    api
      .get('/api/bookings/availability', { params: { date, duration } })
      .then(({ data }) => {
        setAvailableSlots(data?.slots || []);
        setExistingBookings(data?.existingBookings || []);
        setBufferTime(data?.bufferTime || 15);
        
        if (data?.closed) {
          toast.info('We are closed on the selected date. Please choose another day.');
        } else if (data?.slots?.length === 0 && data?.existingBookings?.length > 0) {
          toast.warning(`No available slots for this service duration (${formatDuration(duration)}). The bay is fully booked on this date.`);
        } else if (data?.slots?.length === 0) {
          toast.info('No available time slots for the selected date and service.');
        }
      })
      .catch(() => toast.error('Failed to load availability'))
      .finally(() => setSlotsLoading(false));
  }, [date, selectedPackage, selectedService]);

  const canProceedStep1 = selectedPackage || !!selectedService; // Packages or individual services
  const canProceedStep2 = date && slot;
  const canProceedStep3 = name && email;

  const goNext = () => setCurrentStep((s) => Math.min(4, s + 1));
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // Calculate price based on vehicle type and service
  const calculateServicePrice = (service, vehicleType) => {
    const basePrice = service.base_price;
    
    // Vehicle type multipliers based on official menu
    const multipliers = {
      'hatchback': 1.0,
      'sedan/suv': 1.0,
      'truck/mpv': 1.2
    };
    
    // Special pricing for specific services based on official menu
    if (service.name.includes('Basic Wash')) {
      const prices = {
        'hatchback': 78,
        'sedan/suv': 88,
        'truck/mpv': 108
      };
      return prices[vehicleType] || basePrice;
    }
    
    if (service.name.includes('Premium Wash')) {
      const prices = {
        'hatchback': 120,
        'sedan/suv': 150,
        'truck/mpv': 190
      };
      return prices[vehicleType] || basePrice;
    }
    
    if (service.name.includes('Ultra')) {
      const prices = {
        'hatchback': 190,
        'sedan/suv': 230,
        'truck/mpv': 260
      };
      return prices[vehicleType] || basePrice;
    }
    
    // For individual services, apply multiplier
    return Math.round(basePrice * (multipliers[vehicleType] || 1.0));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const serviceName = selectedPackage?.name || selectedService?.name;
      const duration = selectedPackage?.duration_minutes || selectedService?.duration_minutes || 60;
      
      await api.post('/api/bookings', {
        name,
        email,
        phone,
        service: serviceName,
        date,
        timeSlot: slot,
        notes,
        vehicleType,
        serviceType,
        packageId: selectedPackage?.id,
        serviceId: selectedService?.id,
        duration
      });
      toast.success('Booking request submitted! We will confirm shortly.');
      // Reset and go to step 1
      setCurrentStep(1);
      setDate('');
      setSlot('');
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setSelectedPackage(null);
      setSelectedService(null);
      setServiceType('package');
    } catch (err) {
      console.error('Booking error:', err);
      console.error('Error response:', err?.response);
      console.error('Error message:', err?.message);
      
      if (err?.response?.status === 409) {
        const conflictMessage = err?.response?.data?.message || 'That slot conflicts with another booking.';
        toast.error(conflictMessage, { autoClose: 5000 });
        
        // Refresh availability
        try {
          const duration = selectedPackage?.duration_minutes || selectedService?.duration_minutes || 60;
          const { data } = await api.get('/api/bookings/availability', { params: { date, duration } });
          setAvailableSlots(data?.slots || []);
          setExistingBookings(data?.existingBookings || []);
        } catch (_) {}
        setCurrentStep(2);
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to submit booking';
        toast.error(`Booking failed: ${errorMessage}`);
        console.error('Full error details:', {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Packages...</h2>
          <p className="text-white/80">Please wait while we load our service packages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-secondary-dark">
      <div className="relative min-h-screen py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Book an Appointment</h2>
            <p className="text-xl text-white/90">Quick, friendly, and step-by-step—like a simple form.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${
                    currentStep === s.id ? 'text-secondary' : 
                    currentStep > s.id ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                      currentStep === s.id ? 'bg-secondary text-white' : 
                      currentStep > s.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > s.id ? <FaCheck /> : s.id}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-center hidden sm:block">{s.title}</div>
                    <div className="text-xs font-medium text-center block sm:hidden">
                      {s.title.split(' ')[0]}
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > s.id ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Select Your Service</h3>
                  

                  {vehicleType === 'motorcycle' ? (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Motorcycle Category</label>
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg font-medium ${motorcycleCategory === 'normal' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => { setMotorcycleCategory('normal'); setSelectedService(null); }}
                          >
                            Normal Bike
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg font-medium ${motorcycleCategory === 'sportbike' ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => { setMotorcycleCategory('sportbike'); setSelectedService(null); }}
                          >
                            Sportbike
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {services
                          .filter(svc => svc.category === 'Motorcycle' && svc.bike_type === motorcycleCategory)
                          .map((svc) => (
                            <div
                              key={svc.id}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative h-full ${
                                selectedService?.id === svc.id
                                  ? 'border-secondary bg-secondary/5 shadow-lg'
                                  : 'border-gray-200 hover:border-secondary hover:shadow-md'
                              }`}
                              onClick={() => setSelectedService(svc)}
                            >
                              <div className="flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-primary mb-2">{svc.name}</h4>
                                    {svc.description && (
                                      <p className="text-gray-600">{svc.description}</p>
                                    )}
                                  </div>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 flex-shrink-0 ${
                                    selectedService?.id === svc.id
                                      ? 'bg-secondary text-white'
                                      : 'border-2 border-gray-300'
                                  }`}>
                                    {selectedService?.id === svc.id && <FaCheck className="text-sm" />}
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm mt-auto">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-secondary text-lg">RM {calculateServicePrice(svc, vehicleType).toFixed(2)}</span>
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <FaClock className="text-xs" />
                                      <span>{Math.floor(svc.duration_minutes / 60)}h {svc.duration_minutes % 60}m</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Service Type Selection */}
                      <div className="mb-6">
                        <div className="flex justify-center space-x-4">
                          <button
                            type="button"
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                              serviceType === 'package'
                                ? 'bg-secondary text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => {
                              setServiceType('package');
                              setSelectedService(null);
                            }}
                          >
                            Service Packages
                          </button>
                          <button
                            type="button"
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                              serviceType === 'individual'
                                ? 'bg-secondary text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => {
                              setServiceType('individual');
                              setSelectedPackage(null);
                            }}
                          >
                            Individual Services
                          </button>
                        </div>
                      </div>

                      {/* Service Packages */}
                      {serviceType === 'package' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {packages
                            .filter(pkg => pkg.vehicle_type === 'sedan/suv')
                            .sort((a, b) => {
                              // Sort: Basic (left), Premium (middle), Ultra (right)
                              const order = { 'Basic': 1, 'Premium': 2, 'Ultra': 3 };
                              return order[a.name.split(' ')[0]] - order[b.name.split(' ')[0]];
                            })
                            .map(packageData => (
                            <div 
                              key={packageData.id}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative h-full ${
                                selectedPackage?.id === packageData.id 
                                  ? 'border-secondary bg-secondary/5 shadow-lg' 
                                  : 'border-gray-200 hover:border-secondary hover:shadow-md'
                              }`}
                              onClick={() => setSelectedPackage(packageData)}
                            >
                              {packageData.is_popular === 1 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  Popular
                                </div>
                              )}
                              <div className="flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-primary mb-2">
                                      {packageData.name.replace(' - Hatchback', '').replace(' - Sedan/SUV', '').replace(' - Truck/MPV', '')}
                                    </h4>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 flex-shrink-0 ${
                                    selectedPackage?.id === packageData.id 
                                      ? 'bg-secondary text-white' 
                                      : 'border-2 border-gray-300'
                                  }`}>
                                    {selectedPackage?.id === packageData.id && <FaCheck className="text-sm" />}
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm mt-auto">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-secondary text-lg">RM {packageData.finalPrice?.toFixed(2) || '0.00'}</span>
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <FaClock /> {formatDuration(packageData.duration_minutes)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Individual Services (dynamic from backend) */}
                      {serviceType === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {services
                            .filter(svc => {
                              if (vehicleType === 'motorcycle') {
                                return svc.category === 'Motorcycle' && svc.bike_type === motorcycleCategory;
                              } else {
                                // Map vehicle types for compatibility
                                const vehicleTypeMap = {
                                  'hatchback': 'sedan',
                                  'sedan/suv': 'suv', 
                                  'truck/mpv': 'truck'
                                };
                                const mappedType = vehicleTypeMap[vehicleType] || vehicleType;
                                return svc.vehicle_types && svc.vehicle_types.includes(mappedType);
                              }
                            })
                            .length === 0 ? (
                            <div className="col-span-full text-center text-gray-600">
                              No individual services available for {vehicleType === 'motorcycle' ? `${motorcycleCategory} motorcycle` : vehicleType}
                            </div>
                          ) : (
                            services
                              .filter(svc => {
                                if (vehicleType === 'motorcycle') {
                                  return svc.category === 'Motorcycle' && svc.bike_type === motorcycleCategory;
                                } else {
                                  // Map vehicle types for compatibility
                                  const vehicleTypeMap = {
                                    'hatchback': 'sedan',
                                    'sedan/suv': 'suv', 
                                    'truck/mpv': 'truck'
                                  };
                                  const mappedType = vehicleTypeMap[vehicleType] || vehicleType;
                                  return svc.vehicle_types && svc.vehicle_types.includes(mappedType);
                                }
                              })
                              .map((svc) => (
                              <div
                                key={svc.id}
                                className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative h-full ${
                                  selectedService?.id === svc.id
                                    ? 'border-secondary bg-secondary/5 shadow-lg'
                                    : 'border-gray-200 hover:border-secondary hover:shadow-md'
                                }`}
                                onClick={() => setSelectedService(svc)}
                              >
                                <div className="flex flex-col justify-between h-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-primary mb-2">
                                        {svc.name.replace(' - Hatchback', '').replace(' - Sedan/SUV', '').replace(' - MPV/Truck', '').replace(' - Normal Bike', '').replace(' - Sportbike', '')}
                                      </h4>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-4 flex-shrink-0 ${
                                      selectedService?.id === svc.id ? 'bg-secondary text-white' : 'border-2 border-gray-300'
                                    }`}>
                                      {selectedService?.id === svc.id && <FaCheck className="text-sm" />}
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-sm mt-auto">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-secondary text-lg">RM {calculateServicePrice(svc, vehicleType).toFixed(2)}</span>
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <FaClock className="text-xs" />
                                        <span>{Math.floor(svc.duration_minutes / 60)}h {svc.duration_minutes % 60}m</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}

                </div>

                <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
                  <button 
                    className="btn w-full sm:w-auto" 
                    disabled={!canProceedStep1} 
                    onClick={goNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-4">Choose Date & Time</h3>
                  
                  {/* Single Bay Info Box */}
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-l-4 border-secondary rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-secondary">🏪 Single Bay System:</span> We have one premium washing bay to ensure each vehicle gets our full attention. Time slots shown are based on your service duration and include a {bufferTime}-minute cleanup buffer.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select date</label>
                      <button
                        type="button"
                        onClick={openDatePicker}
                        className={`w-full px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                          date
                            ? 'border-secondary text-secondary hover:bg-secondary/5'
                            : 'border-gray-300 text-gray-700 hover:border-secondary hover:bg-secondary/5'
                        }`}
                        aria-haspopup="dialog"
                        aria-expanded={isCalendarOpen}
                      >
                        {date
                          ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Choose date'}
                      </button>

                      {isCalendarOpen && (
                        <div className="mt-3 p-4 border-2 rounded-xl bg-white shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <button
                              type="button"
                              className="px-3 py-1 rounded border hover:bg-gray-50"
                              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                            >
                              Prev
                            </button>
                            <div className="font-semibold text-primary">
                              {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <button
                              type="button"
                              className="px-3 py-1 rounded border hover:bg-gray-50"
                              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                            >
                              Next
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-gray-600 mb-2">
                            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                              <div key={d} className="text-center">{d}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {buildCalendarDays(calendarMonth).map((d, idx) => {
                              if (!d) return <div key={idx} className="h-10" />;
                              const disabled = d < today;
                              const selected = date && isSameDay(d, new Date(date));
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleSelectCalendarDate(d)}
                                  className={`h-10 rounded-lg border text-sm transition-colors ${
                                    selected
                                      ? 'border-secondary bg-secondary text-white'
                                      : disabled
                                        ? 'border-gray-200 text-gray-300'
                                        : 'border-gray-200 hover:border-secondary hover:bg-secondary/5'
                                  }`}
                                >
                                  {d.getDate()}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                              onClick={() => setIsCalendarOpen(false)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selected Service</label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-primary mb-2">
                          {selectedPackage?.name || selectedService?.name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaClock /> {formatDuration(selectedPackage?.duration_minutes || selectedService?.duration_minutes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Bookings Timeline */}
                  {date && existingBookings.length > 0 && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <FaCalendarAlt /> Existing Bookings on {date}
                      </h4>
                      <div className="space-y-2">
                        {existingBookings.map((booking, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-blue-600 flex-shrink-0" />
                                <span className="font-semibold text-gray-800">
                                  {booking.time} - {booking.endTime}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {formatDuration(booking.duration)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {booking.service || 'Service booked'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-3 italic">
                        ⚠️ Note: {bufferTime}-minute cleanup buffer added between services
                      </p>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available time slots 
                      {availableSlots.length > 0 && (
                        <span className="ml-2 text-green-600 font-normal">
                          ({availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available)
                        </span>
                      )}
                    </label>
                    {/* Mobile-friendly native select fallback */}
                    {date && availableSlots.length > 0 && (
                      <div className="sm:hidden mb-4">
                        <select
                          className="w-full px-3 py-3 border-2 rounded-lg"
                          value={slot || ''}
                          onChange={(e) => setSlot(e.target.value)}
                        >
                          <option value="" disabled>
                            {slot ? 'Change time' : 'Choose a time'}
                          </option>
                          {availableSlots.map((s) => (
                            <option key={`opt-${s}`} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {slotsLoading ? (
                      <p className="text-gray-500 text-center py-4">Loading slots...</p>
                    ) : date ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {availableSlots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`p-3 sm:p-4 rounded-lg border-2 transition-all font-medium text-sm sm:text-base min-h-[48px] touch-manipulation ${
                                slot === s 
                                  ? 'border-secondary bg-secondary text-white shadow-lg scale-105' 
                                  : 'border-gray-200 hover:border-secondary hover:bg-secondary/5 active:scale-95'
                              }`}
                              onClick={() => setSlot(s)}
                              onPointerDown={() => setSlot(s)}
                              onTouchStart={() => setSlot(s)}
                              style={{ 
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent',
                                WebkitTouchCallout: 'none',
                                WebkitUserSelect: 'none',
                                userSelect: 'none'
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                          <p className="text-yellow-800 font-semibold mb-2">⚠️ No Available Slots</p>
                          <p className="text-sm text-gray-600 mb-4">
                            {existingBookings.length > 0 
                              ? `All time slots are booked for your selected service (${formatDuration(selectedPackage?.duration_minutes || selectedService?.duration_minutes || 60)}). The washing bay can only serve one vehicle at a time.`
                              : 'We are closed on this date or no slots match your service duration.'
                            }
                          </p>
                          <div className="space-y-2 text-sm text-left bg-white rounded-lg p-4">
                            <p className="font-semibold text-gray-800">💡 Suggestions:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              <li>Choose a different date</li>
                              <li>Select a shorter service package</li>
                              <li>Contact us via WhatsApp for special arrangements</li>
                            </ul>
                          </div>
                        </div>
                      )
                    ) : (
                      <p className="text-gray-500 text-center py-4">Pick a date to view availability.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                  <button className="btn btn-outline order-2 sm:order-1" onClick={goBack}>Back</button>
                  <button className="btn order-1 sm:order-2" disabled={!canProceedStep2} onClick={goNext}>Next</button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Your Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                      <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 1xxxxxxxx" />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                      <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                  <button className="btn btn-outline order-2 sm:order-1" onClick={goBack}>Back</button>
                  <button className="btn order-1 sm:order-2" disabled={!canProceedStep3} onClick={goNext}>Next</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Review & Confirm</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Service Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{selectedPackage?.name || selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle Type:</span>
                          <span className="font-medium">{vehicleType.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{formatDuration(selectedPackage?.duration_minutes || selectedService?.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Appointment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Time:</span>
                          <span className="font-medium">{slot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Completion:</span>
                          <span className="font-medium text-green-600">
                            {(() => {
                              const duration = selectedPackage?.duration_minutes || selectedService?.duration_minutes || 60;
                              const [hours, minutes] = slot.split(':');
                              const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
                              const endMinutes = startMinutes + duration;
                              const endHours = Math.floor(endMinutes / 60);
                              const endMins = endMinutes % 60;
                              return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50 -mx-6 px-6 py-2 rounded">
                          <span className="text-gray-600 text-sm">⏱️ Total Duration:</span>
                          <span className="font-bold text-blue-600">{formatDuration(selectedPackage?.duration_minutes || selectedService?.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-primary">Customer Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{phone || 'Not provided'}</span>
                        </div>
                        {notes && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Notes:</span>
                            <span className="font-medium">{notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                  <button className="btn btn-outline order-2 sm:order-1" onClick={goBack}>Back</button>
                  <button className="btn order-1 sm:order-2" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;


