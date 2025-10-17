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
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Booking from './pages/Booking';
import PaymentTestPage from './pages/PaymentTestPage';
import QuickBooking from './pages/QuickBooking';
import Gallery from './pages/Gallery';
import FAQ from './pages/FAQ';
import MyBookings from './pages/MyBookings';

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
            <Route path="/products" element={<><Header /><Products /><Footer /><FloatingBookButton /></>} />
            <Route path="/contact" element={<><Header /><Contact /><Footer /><FloatingBookButton /></>} />
            <Route path="/booking" element={<><Header /><Booking /><Footer /><FloatingBookButton /></>} />
            <Route path="/cart" element={<><Header /><Cart /><Footer /></>} />
            <Route path="/gallery" element={<><Header /><Gallery /><Footer /><FloatingBookButton /></>} />
            <Route path="/faq" element={<><Header /><FAQ /><Footer /></>} />
            <Route path="/my-bookings" element={<><Header /><MyBookings /><Footer /></>} />
            <Route path="/payment-test" element={<><Header /><PaymentTestPage /><Footer /></>} />
            <Route path="/quick-booking/:token" element={<><Header /><QuickBooking /><Footer /></>} />
            
            {/* Auth Routes (No Header/Footer) */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Admin Routes (No Header/Footer for clean admin UI) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
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
