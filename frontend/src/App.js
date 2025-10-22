import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingBookButton from './components/FloatingBookButton';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import QuickBooking from './pages/QuickBooking';
import Gallery from './pages/Gallery';
import FAQ from './pages/FAQ';
import MyBookings from './pages/MyBookings';
import ServiceMenu from './pages/ServiceMenu';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
          <div className="App">
          <ScrollToTop />
          <Routes>
            {/* Public Routes with Header/Footer */}
            <Route path="/" element={<><Header /><Home /><Footer /><FloatingBookButton /></>} />
            <Route path="/home" element={<><Header /><Home /><Footer /><FloatingBookButton /></>} />
            <Route path="/products" element={<><Header /><Products /><Footer /><FloatingBookButton /></>} />
            <Route path="/product/:id" element={<><Header /><ProductDetail /><Footer /><FloatingBookButton /></>} />
            <Route path="/service-menu" element={<><Header /><ServiceMenu /><Footer /></>} />
            <Route path="/contact" element={<><Header /><Contact /><Footer /><FloatingBookButton /></>} />
            <Route path="/booking" element={<><Header /><Booking /><Footer /><FloatingBookButton /></>} />
            <Route path="/cart" element={<><Header /><Cart /><Footer /></>} />
            <Route path="/gallery" element={<><Header /><Gallery /><Footer /><FloatingBookButton /></>} />
            <Route path="/faq" element={<><Header /><FAQ /><Footer /></>} />
            <Route path="/my-bookings" element={<><Header /><MyBookings /><Footer /></>} />
            {/* Payment test route removed */}
            <Route path="/quick-booking/:token" element={<><Header /><QuickBooking /><Footer /></>} />
            
            {/* Auth Routes (No Header/Footer) */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Protected Admin Routes (No Header/Footer for clean admin UI) */}
            <Route 
              path="/admin/dev" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Catch-all Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <a 
                      href="/" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
// Force rebuild - Tue Oct 21 21:47:27 +08 2025
