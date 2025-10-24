
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
      console.log('Service packages response:', response.data);
      const packages = response.data.packages || [];
      console.log('Filtered packages (sedan/suv):', packages.filter(pkg => pkg.vehicle_type === 'sedan/suv'));
      setPackages(packages);
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
                      packages
                        .filter(pkg => pkg.vehicle_type === 'sedan/suv')
                        .sort((a, b) => {
                          // Sort: Basic (left), Premium (middle), Ultra (right)
                          const order = { 'Basic': 1, 'Premium': 2, 'Ultra': 3 };
                          return order[a.name.split(' ')[0]] - order[b.name.split(' ')[0]];
                        })
                        .map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary ${pkg.is_popular === 1 ? 'relative' : ''}`}
                >
                  {pkg.is_popular === 1 && (
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
            {/* Instagram Reel 1 */}
            <a
              href="https://www.instagram.com/reel/DP_DUZOD_Iy/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src={require('../img/g63.jpeg')}
                  alt="AUTOBATH car detailing reel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    console.error('Error loading g63.jpeg:', e);
                    e.target.src = require('../img/placeholder.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">Watch Reel</div>
                <div className="absolute top-3 right-3 text-white text-2xl">🎬</div>
              </div>
            </a>

            {/* Instagram Reel 2 */}
            <a
              href="https://www.instagram.com/reel/DP0RuDyktzy/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src={require('../img/mers.jpeg')}
                  alt="AUTOBATH premium detailing reel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">Watch Reel</div>
                <div className="absolute top-3 right-3 text-white text-2xl">✨</div>
              </div>
            </a>

            {/* Instagram Reel 3 */}
            <a
              href="https://www.instagram.com/reel/DQFJJMDk8u_/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
            >
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img
                  src={require('../img/shop.jpeg')}
                  alt="AUTOBATH ceramic coating reel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    console.error('Error loading shop.jpeg:', e);
                    e.target.src = require('../img/placeholder.jpg');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">Watch Reel</div>
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

      {/* AUTOBATH Cafe Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="container relative z-10">
          {/* Horizontal Bar - 224px height matching logo */}
          <div className="h-56 w-full mb-16 flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
            {/* Logo centered in the bar */}
            <img 
              src={require('../img/autobathCafe.PNG')} 
              alt="AUTOBATH Cafe Logo" 
              className="h-56 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Header Content below black bar */}
          <div className="text-center mb-16">
            {/* Beverages Title with Icon */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black">Beverages</h2>
            </div>
            
            {/* Highlight Notice */}
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-sm font-bold border-2 border-yellow-300">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Hot Snacks • Creamy Drinks • Fresh Juices Only
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Fresh Series */}
            <div className="space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-black mb-8 text-center">FRESH SERIES</h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">SUNSET GLOW</h4>
                      <p className="text-sm text-gray-600">Orange Juice</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">10.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">MANGO STORM</h4>
                      <p className="text-sm text-gray-600">Mango Juice</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">10.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">RED RUSH</h4>
                      <p className="text-sm text-gray-600">Watermelon Juice</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">10.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">LEMON SPARK</h4>
                      <p className="text-sm text-gray-600">Lemon Black Tea</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">7.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">GOLDEN PASSION</h4>
                      <p className="text-sm text-gray-600">Passion Fruit Tea</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">7.90</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creamy Series */}
            <div className="space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-black mb-8 text-center">CREAMY SERIES</h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">ORIGINAL THAI</h4>
                      <p className="text-sm text-gray-600">Thai Milk Tea</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">8.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">CREAMY OOLONG</h4>
                      <p className="text-sm text-gray-600">Oolong Milk Tea</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">8.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">THAI GREEN</h4>
                      <p className="text-sm text-gray-600">Thai Green Milk Tea</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">8.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">HONEY WHISPER BLACK TEA</h4>
                      <p className="text-sm text-gray-600">Honey Black Tea</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">6.90</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <h4 className="text-lg font-bold text-black">MILO BLAST</h4>
                      <p className="text-sm text-gray-600">MILO FRESH MILK</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">6.90</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Snacks Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold text-black mb-8 text-center">SNACKS</h3>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <h4 className="text-lg font-bold text-black">FRIES</h4>
                    <p className="text-sm text-gray-600">Crispy & Golden</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">5.50</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <h4 className="text-lg font-bold text-black">NUGGETS</h4>
                    <p className="text-sm text-gray-600">Tender & Juicy</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">6.50</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <h4 className="text-lg font-bold text-black">POPCORN CHICKEN</h4>
                    <p className="text-sm text-gray-600">Spicy & Crunchy</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">7.50</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-pink-50 rounded-lg border-l-4 border-pink-400">
                  <div>
                    <h4 className="text-lg font-bold text-black">SNOW MOCHI 雪梅娘</h4>
                    <p className="text-sm text-gray-600">4pcs per box • Pre-order Only</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-semibold">Flavors:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Thailand Mango</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Durian (Limited)</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Strawberry</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Oreo</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-pink-600">20.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-black mb-4">📍 Visit AUTOBATH Cafe</h3>
              <p className="text-gray-700 mb-6 text-lg">
                Located within AUTOBATH car detailing shop - enjoy fresh beverages and light snacks while waiting for your car service!
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-semibold mb-3">
                  📞 Call <span className="text-primary font-bold">+6012-3574548</span> for pre-order
                </p>
                <div className="flex justify-center gap-4">
                  <a 
                    href="tel:+60123574548" 
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call Now
                  </a>
                  <a 
                    href="https://wa.me/60123574548?text=Hi%2C%20I%20would%20like%20to%20place%20a%20pre-order%20for%20AUTOBATH%20Cafe" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-semibold">Open Daily</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="font-semibold">Fresh Made</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="font-semibold">Light Snacks Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
