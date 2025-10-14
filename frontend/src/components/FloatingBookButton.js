import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';

const FloatingBookButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // Hide on booking page since they're already there
  const hiddenPaths = ['/booking', '/quick-booking'];
  const shouldHide = hiddenPaths.some(path => location.pathname.includes(path));

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (shouldHide) return null;

  return (
    <Link
      to="/booking"
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
      style={{
        boxShadow: '0 10px 40px rgba(193, 154, 107, 0.4)',
      }}
    >
      <FaCalendarAlt className="text-xl group-hover:animate-bounce" />
      <span className="font-bold text-lg hidden sm:inline">Book Now</span>
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
        Fast!
      </div>
    </Link>
  );
};

export default FloatingBookButton;


