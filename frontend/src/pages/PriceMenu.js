import React from 'react';
import { FaCar, FaTruck, FaTools, FaSprayCan, FaStar } from 'react-icons/fa';

const PriceMenu = () => {
  const mainServices = [
    {
      category: 'Basic Wash',
      icon: <FaCar className="text-2xl" />,
      services: [
        { vehicle: 'Hatchback/Sedan', price: 80 },
        { vehicle: 'SUV', price: 90 },
        { vehicle: 'MPV/Truck', price: 100 }
      ]
    },
    {
      category: 'Premium Wash',
      icon: <FaStar className="text-2xl" />,
      services: [
        { vehicle: 'Hatchback/Sedan', price: 100 },
        { vehicle: 'SUV', price: 110 },
        { vehicle: 'MPV/Truck', price: 120 }
      ],
      popular: true
    },
    {
      category: 'Ultra Wash',
      icon: <FaSprayCan className="text-2xl" />,
      services: [
        { vehicle: 'Hatchback/Sedan', price: 200 },
        { vehicle: 'SUV', price: 230 },
        { vehicle: 'MPV/Truck', price: 250 }
      ]
    }
  ];

  const polishServices = [
    {
      category: '4 Step Polish Wax',
      services: [
        { vehicle: 'Hatchback/Sedan', price: 360 },
        { vehicle: 'SUV', price: 460 },
        { vehicle: 'MPV/Truck', price: 560 }
      ]
    },
    {
      category: '4 Steps Polish Ceramic Coating',
      services: [
        { vehicle: 'Hatchback/Sedan', price: 1100 },
        { vehicle: 'SUV', price: 1300 },
        { vehicle: 'MPV/Truck', price: 1500 }
      ]
    }
  ];

  const addOnServices = [
    { name: 'Fabric Seat Cleaning', price: 40, note: 'Per seat' },
    { name: 'Leather Seat Cleaning', price: 40, note: 'Per seat' },
    { name: 'Engine Bay Wash and Coat', price: 80 },
    { name: 'Part Polish', price: '35-50', note: 'Varies by area' },
    { name: 'Steam Interior', price: 30 },
    { name: 'Carpet Wash', price: 40 },
    { name: 'Rim Out Wash', price: 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            AUTOBATH Price Menu
          </h1>
          <p className="text-xl text-gray-600">
            Professional Car Detailing Services - Latest Pricing
          </p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            Effective: {new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Main Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
            <FaCar />
            Main Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainServices.map((service, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all hover:shadow-xl ${
                  service.popular
                    ? 'border-secondary border-4 relative'
                    : 'border-gray-200'
                }`}
              >
                {service.popular && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Most Popular
                  </div>
                )}
                <div className="bg-gradient-to-br from-primary to-secondary text-white p-6 text-center">
                  <div className="flex justify-center mb-3">{service.icon}</div>
                  <h3 className="text-2xl font-bold">{service.category}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {service.services.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-700">
                          {item.vehicle}
                        </span>
                        <span className="text-2xl font-bold text-secondary">
                          RM{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polish Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
            <FaSprayCan />
            Polish & Coating Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polishServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 text-center">
                  <h3 className="text-2xl font-bold">{service.category}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {service.services.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-700">
                          {item.vehicle}
                        </span>
                        <span className="text-2xl font-bold text-secondary">
                          RM{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-on Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
            <FaTools />
            Add-on Services
          </h2>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addOnServices.map((service, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-gray-800">
                      {service.name}
                    </span>
                    {service.note && (
                      <p className="text-sm text-gray-500 mt-1">
                        {service.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-secondary">
                    RM{service.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-gray-700 text-lg">
            <strong>Note:</strong> All prices are in Malaysian Ringgit (RM). 
            Prices may vary based on vehicle condition and additional requirements.
          </p>
          <p className="text-gray-600 mt-2">
            For bookings and inquiries, please contact us or use our online booking system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceMenu;

