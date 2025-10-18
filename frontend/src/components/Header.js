import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const navItems = [
    { path: '/', label: "Home" },
    { path: '/booking', label: "Booking" },
    { path: '/products', label: "Products" },
    { path: '/contact', label: "Contact" },
    { path: '/faq', label: "FAQ" }
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-white to-gray-50 text-primary py-4 md:py-6 sticky top-0 z-50 shadow-lg border-b-4 border-secondary backdrop-blur-sm">
        <div className="w-11/12 max-w-6xl mx-auto grid grid-cols-3 items-center gap-2">
          {/* Menu Button - Left Column */}
          <div className="flex justify-start">
            <button 
              className="bg-gradient-to-r from-secondary to-secondary-dark border-none text-white text-xl md:text-2xl cursor-pointer p-2 md:p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl" 
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Logo - Center Column (perfectly centered) */}
          <div className="flex items-center justify-center">
            <Link to="/" className="no-underline text-inherit flex items-center" onClick={closeMenu}>
              <h1 className="text-sm xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-wide md:tracking-wider uppercase text-primary drop-shadow-sm transition-all duration-300 hover:scale-105 hover:text-secondary text-center whitespace-nowrap leading-tight">
                AUTOBATH
                <span className="hidden sm:block text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base tracking-wider mt-0 text-black font-medium opacity-80">
                  DETAILING & ACCESSORIES
                </span>
              </h1>
            </Link>
          </div>
          
          {/* Cart Button - Right Column */}
          <div className="flex items-center justify-end">
            <button 
              className="relative cursor-pointer text-primary text-lg md:text-xl p-2 md:p-3 rounded-full transition-all duration-300 bg-white shadow-md border-2 border-secondary/20 hover:bg-secondary hover:text-white hover:scale-110 hover:shadow-lg" 
              onClick={toggleCart}
            >
              <FaShoppingCart />
              <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] md:text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                {getTotalItems()}
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className={`fixed top-0 bottom-0 left-0 h-screen w-[85vw] sm:w-80 max-w-sm bg-gradient-to-br from-white via-gray-50 to-white shadow-2xl z-[60] transform transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}>
          <div className="h-screen flex flex-col">
            {/* Menu Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu</h2>
              <button 
                onClick={closeMenu}
                className="text-white text-2xl hover:rotate-90 transition-transform duration-300"
              >
                <FaTimes />
              </button>
            </div>

            {/* Menu Items */}
            <ul className="flex-1 overflow-y-auto py-4">
              {navItems.map((item, index) => (
                <li key={item.path} className="w-full">
                  <Link 
                    to={item.path} 
                    className={`block px-8 py-4 text-lg font-semibold border-b border-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-secondary hover:to-secondary-dark hover:text-white hover:pl-12 ${
                      location.pathname === item.path 
                        ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white pl-12 border-l-4 border-secondary-dark' 
                        : 'text-primary'
                    }`}
                    onClick={closeMenu}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Additional Links Section */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs uppercase text-gray-500 font-semibold mb-3 tracking-wider">{"More"}</p>
              <div className="space-y-2">
                <Link 
                  to="/gallery"
                  className="block text-sm text-gray-700 hover:text-secondary transition-colors py-2 px-3 rounded hover:bg-white"
                  onClick={closeMenu}
                >
                  {"Gallery"}
                </Link>
                <Link 
                  to="/my-bookings"
                  className="block text-sm text-gray-700 hover:text-secondary transition-colors py-2 px-3 rounded hover:bg-white"
                  onClick={closeMenu}
                >
                  {"Track Bookings"}
                </Link>
              </div>
            </div>

            {/* Menu Footer */}
            <div className="p-6 bg-gray-100 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Quick Contact</p>
              <div className="space-y-2">
                <a 
                  href="https://wa.me/60167700033"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-green-600 hover:text-green-700 font-semibold"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-500"
            onClick={closeMenu}
            style={{ top: 0, bottom: 0, left: 0, right: 0 }}
          ></div>
        )}
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
