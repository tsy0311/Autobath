
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClock, FaMobile, FaGift,FaTag,
  FaArrowRight, FaCalendarAlt
} from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicePackages();
  }, []);

  const fetchServicePackages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/service-packages');
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Error fetching service packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] flex flex-col items-center justify-center text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={require('../img/dashboard.jpg')} 
            alt="Professional car detailing"
            loading="eager"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Professional Car Detailing Services
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 text-gray-100 leading-relaxed px-2">
            Transform your vehicle with our premium detailing packages and individual services
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 sm:mb-10 px-2">
            All services use Koch Chemie products directly from Germany
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Link to="/booking" className="btn btn-primary flex items-center gap-2">
              <FaCalendarAlt /> Book Now
            </Link>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Car detailing background"
            loading="lazy"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container relative z-10">
          <div className="section-title">
            <h2>{"Why Choose AUTOBATH?"}</h2>
            <p>{"We provide exceptional car detailing services with cutting-edge technology"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaTag />
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">{"Dynamic Pricing"}</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">{"Our pricing adapts based on vehicle size, condition, and service complexity"}</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaClock />
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">{"Smart Booking System"}</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">{"AI-powered scheduling prevents conflicts and optimizes service delivery"}</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaGift />
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">{"Loyalty Program"}</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">{"Earn points with every service and enjoy exclusive discounts"}</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaMobile />
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">{"Mobile Ready"}</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">{"Fully responsive design works perfectly on all devices"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>{"Service Packages"}</h2>
            <p>{"Choose from our carefully crafted packages"}</p>
            <Link to="/booking" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 transition-all duration-300 hover:text-secondary hover:translate-x-1">
              {"Book Services"} <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 animate-pulse">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-32"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              packages.map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary ${pkg.is_popular ? 'relative' : ''}`}
                >
                  {pkg.is_popular && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                      Most Popular
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">{pkg.name}</h3>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl font-bold">RM{pkg.finalPrice?.toFixed(2) || pkg.base_price?.toFixed(2)}</span>
                      {pkg.discount_percentage > 0 && (
                        <span className="text-sm opacity-80 line-through">RM{pkg.base_price?.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">{pkg.description}</p>
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Includes:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.name.includes('Basic Wash') ? (
                          <>
                            <li>• Exterior wash</li>
                            <li>• Wheel cleaning</li>
                            <li>• Interior vacuum</li>
                            <li>• Basic protection</li>
                          </>
                        ) : pkg.name.includes('Premium Wash') ? (
                          <>
                            <li>• Pre-wash treatment</li>
                            <li>• Premium exterior wash</li>
                            <li>• Interior deep clean</li>
                            <li>• S002 Spray selant protection</li>
                            <li>• Tire shine</li>
                            <li>• Wheel detailing</li>
                          </>
                        ) : pkg.name.includes('Ultra') ? (
                          <>
                            <li>• Complete pre-wash</li>
                            <li>• Premium exterior wash</li>
                            <li>• Interior deep cleaning</li>
                            <li>• S002 Spray selant protection</li>
                            <li>• Paint protection</li>
                            <li>• Premium tire treatment</li>
                            <li>• Wheel ceramic coating</li>
                            <li>• VIP treatment - Free Snooker Playing</li>
                          </>
                        ) : pkg.includedServices && pkg.includedServices.length > 0 ? (
                          pkg.includedServices.map((service, serviceIndex) => (
                            <li key={serviceIndex}>• {service.name}</li>
                          ))
                        ) : pkg.services && pkg.services.length > 0 ? (
                          pkg.services.map((serviceId, serviceIndex) => (
                            <li key={serviceIndex}>• Service {serviceId}</li>
                          ))
                        ) : (
                          <li>• Professional detailing services</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mb-6 p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 font-semibold">
                        <FaClock /> {Math.floor(pkg.duration_minutes / 60)}h {pkg.duration_minutes % 60}m
                      </div>
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">All-in-one</div>
                    </div>
                    <Link 
                      to={`/booking?package=${pkg.id}&type=package`} 
                      className="btn btn-primary w-full text-center"
                    >
                      Book {pkg.name}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>


      {/* Instagram Feeds (3 posts) */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>{"Instagram Feeds"}</h2>
            <p>{"Follow our latest work on Instagram @autobath_my"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram Post 1 */}
            <a
              href="https://www.instagram.com/p/C8XxYxYxYxY/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="AUTOBATH car detailing work"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = require('../img/placeholder.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">View on Instagram</div>
                <div className="absolute top-3 right-3 text-white text-2xl">📸</div>
              </div>
            </a>

            {/* Instagram Post 2 */}
            <a
              href="https://www.instagram.com/p/C8XxYxYxYxY/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1563720228757-4b4a4a4a4a4a?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="AUTOBATH premium detailing"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = require('../img/placeholder.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">View on Instagram</div>
                <div className="absolute top-3 right-3 text-white text-2xl">✨</div>
              </div>
            </a>

            {/* Instagram Post 3 */}
            <a
              href="https://www.instagram.com/p/C8XxYxYxYxY/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3"
                  alt="AUTOBATH ceramic coating"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = require('../img/placeholder.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">View on Instagram</div>
                <div className="absolute top-3 right-3 text-white text-2xl">🚗</div>
              </div>
            </a>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/autobath_my/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors"
            >
              Follow us on Instagram @autobath_my
            </a>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
