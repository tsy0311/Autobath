
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCar, FaChair, FaClock,
  FaCheck, FaTag, FaShieldAlt, FaMobile, FaGift,
  FaArrowRight, FaCalendarAlt
} from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalPackages: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [servicesList, setServicesList] = useState([]);

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

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch data in parallel
      const [servicesRes, packagesRes] = await Promise.all([
        api.get('/api/services'),
        api.get('/api/service-packages')
      ]);

      const services = servicesRes.data.services || [];
      const packages = packagesRes.data.packages || [];

      setServicesList(services);
      setPackagesList(packages);

      // Calculate statistics
      setStats({
        totalServices: services.length,
        totalPackages: packages.length,
        averageRating: 4.8,
        totalReviews: 150
      });


    } catch (error) {
      console.error('Error fetching home data:', error);
      // Don't show error to user, just use default values
    }
  };


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
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 text-gray-100 leading-relaxed px-2">
            Transform your vehicle with our premium detailing packages and individual services
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Link to="/booking" className="btn btn-primary flex items-center gap-2">
              <FaCalendarAlt /> Book Now
            </Link>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3 sm:gap-6 md:gap-8 justify-center max-w-2xl mx-auto px-4">
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalServices}+</div>
            <div className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Services</div>
          </div>
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalPackages}</div>
            <div className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Packages</div>
          </div>
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.averageRating.toFixed(1)}</div>
            <div className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Rating</div>
          </div>
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalReviews}+</div>
            <div className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">Reviews</div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-bold text-primary mb-1">{"Happy Customers"}</h4>
              <p className="text-sm text-gray-600">{"Satisfied customers"}</p>
            </div>
            <div className="p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="text-4xl mb-3">⭐</div>
              <h4 className="font-bold text-primary mb-1">{"5-Star Rated"}</h4>
              <p className="text-sm text-gray-600">{"Rated service"}</p>
            </div>
            <div className="p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="text-4xl mb-3">✅</div>
              <h4 className="font-bold text-primary mb-1">{"Certified"}</h4>
              <p className="text-sm text-gray-600">{"Professional team"}</p>
            </div>
            <div className="p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="text-4xl mb-3">🌿</div>
              <h4 className="font-bold text-primary mb-1">{"Eco-Friendly"}</h4>
              <p className="text-sm text-gray-600">{"Eco-friendly products"}</p>
            </div>
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
            {/* Basic Package */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">{"Basic Package"}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-bold">RM 80.00</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">{"Essential detailing for regular maintenance"}</p>
                <div className="flex justify-between items-center mb-6 p-4 bg-secondary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 font-semibold">
                    <FaClock /> 1h 15m
                  </div>
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">All-in-one</div>
                </div>
                <Link to="/booking?package=1&type=package" className="btn btn-primary w-full text-center">
                  {"Book Basic Package"}
                </Link>
              </div>
            </div>

            {/* Premium Package */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary relative">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                {"Most Popular"}
              </div>
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">{"Premium Package"}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-bold">RM 138.00</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">{"Comprehensive detailing with premium products"}</p>
                <div className="flex justify-between items-center mb-6 p-4 bg-secondary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 font-semibold">
                    <FaClock /> 3h 0m
                  </div>
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">All-in-one</div>
                </div>
                <Link to="/booking?package=2&type=package" className="btn btn-primary w-full text-center">
                  {"Book Premium Package"}
                </Link>
              </div>
            </div>

            {/* Ultra Package */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">{"Ultra Package"}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-bold">RM 258.00</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">{"Complete transformation with ceramic coating"}</p>
                <div className="flex justify-between items-center mb-6 p-4 bg-secondary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 font-semibold">
                    <FaClock /> 8h 0m
                  </div>
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">All-in-one</div>
                </div>
                <Link to="/booking?package=3&type=package" className="btn btn-primary w-full text-center">
                  {"Book Ultra Package"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="section-title">
            <h2>{"Our Services"}</h2>
            <p>{"Individual services tailored to your needs"}</p>
            <Link to="/booking" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 transition-all duration-300 hover:text-secondary hover:translate-x-1">
              {"Book Services"} <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaCar />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">{"Exterior Detailing"}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{"Complete exterior cleaning and protection"}</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Paint Correction"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Ceramic Coating"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Wheel Cleaning"}</span>
                </div>
                <Link to="/booking?service=exterior&type=individual" className="btn w-full text-center">{"Book Exterior"}</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaChair />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">{"Interior Detailing"}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{"Deep cleaning and protection for your interior"}</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Leather Treatment"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Steam Cleaning"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Odor Elimination"}</span>
                </div>
                <Link to="/booking?service=interior&type=individual" className="btn w-full text-center">{"Book Interior"}</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-6xl">
                  <FaShieldAlt />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">{"Protection Services"}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{"Long-lasting protection for your vehicle"}</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Paint Protection Film"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"Ceramic Coating"}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> {"UV Protection"}</span>
                </div>
                <Link to="/booking?service=paint&type=individual" className="btn w-full text-center">{"Book Protection"}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feeds (3 posts) */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>{"Instagram Feeds"}</h2>
            <p>{"Follow our latest work on Instagram"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <a
                key={i}
                href="https://www.instagram.com/autobath_my/"
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary"
              >
                <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={require('../img/placeholder.jpg')}
                    alt="Instagram preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/50 rounded-full px-3 py-1">View on Instagram</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
