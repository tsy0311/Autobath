import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaInstagram, FaWhatsapp, FaClock, FaCalendarAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-8 sm:py-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              {"AUTOBATH"}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {"Professional car detailing services with premium products and expert care."}
            </p>
            <p className="text-gray-300 text-sm">
              &copy; {currentYear} {"AUTOBATH"}. {"All rights reserved."}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              {"Quick Links"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"Home"}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"Booking"}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"Contact Us"}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"FAQ"}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"Products"}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"Gallery"}
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  {"My Bookings"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              {"Contact Info"}
            </h3>
            <div className="space-y-3">
              <a 
                href="https://maps.app.goo.gl/gL9iTam3z9VrX3ev7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <FaMapMarkerAlt className="text-secondary group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor</span>
              </a>
              <a 
                href="mailto:autobath36@gmail.com"
                className="text-gray-300 hover:text-secondary transition-colors flex items-center gap-2 group"
              >
                <FaEnvelope className="text-secondary group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">autobath36@gmail.com</span>
              </a>
              <a 
                href="https://wa.me/60167700033?text=Hi%20AUTOBATH%2C%20I%27d%20like%20to%20book%20a%20service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2 group font-semibold"
              >
                <FaWhatsapp className="text-green-400 group-hover:scale-110 transition-transform text-xl" />
                <span className="group-hover:underline">{"WhatsApp Us"}</span>
              </a>
              <div className="text-gray-300 flex items-center gap-2 mt-3">
                <FaClock className="text-secondary" />
                <span>{"Fri-Sun: 9AM-6PM"}</span>
              </div>
              <div className="text-gray-300 flex items-center gap-2 text-sm">
                <FaCalendarAlt className="text-secondary" />
                <span>{"Also open on public holidays"}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              {"Follow Us"}
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/autobath_my" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-300 hover:text-secondary transition-colors duration-300 text-2xl"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-white/10 text-center">
          <p className="text-sm sm:text-base text-gray-300 font-semibold text-secondary">
            {"AUTOBATH"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
