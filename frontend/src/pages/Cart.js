import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaMobile } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);
      
      // Create order with payment information
      const orderData = {
        items: items,
        total: getTotalPrice(),
        customerInfo: customerInfo,
        payment: paymentData,
        deliveryOption: paymentData.deliveryOption || 'collection',
        address: paymentData.address || null,
        status: 'pending'
      };

      const response = await api.post('/api/orders', orderData);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        setCustomerInfo({ name: '', email: '', phone: '' });
        navigate('/');
      } else {
        throw new Error(response.data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Validation
    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Open payment modal
    setShowPaymentModal(true);
  };

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="text-center py-16">
            <FaShoppingCart size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button className="btn" onClick={() => navigate('/products')}>
              Shop Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-20">
      <div className="container px-4">
        <div className="section-title">
          <h2 className="text-2xl sm:text-3xl md:text-4xl">Shopping Cart</h2>
          <p className="text-sm sm:text-base">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 sm:space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6">
                  {/* Mobile Layout */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-box text-xl sm:text-2xl text-secondary"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary mb-1 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">{item.category}</p>
                      <p className="text-xs sm:text-sm text-gray-600">RM {item.price.toFixed(2)} each</p>
                      {/* Subtotal on mobile */}
                      <p className="text-base sm:text-lg font-bold text-secondary mt-2 md:hidden">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {/* Delete button - top right on mobile */}
                    <button 
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors touch-manipulation flex-shrink-0 md:hidden"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash className="text-xs sm:text-sm" />
                    </button>
                  </div>
                  
                  {/* Quantity Controls & Subtotal - Bottom on mobile, inline on desktop */}
                  <div className="flex items-center justify-between mt-3 md:mt-0 md:flex-row md:gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5 sm:p-2">
                      <button 
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <FaMinus className="text-xs sm:text-sm" />
                      </button>
                      <span className="w-12 sm:w-14 text-center text-base sm:text-lg font-bold text-primary">
                        {item.quantity}
                      </span>
                      <button 
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-secondary hover:bg-secondary-dark text-white rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <FaPlus className="text-xs sm:text-sm" />
                      </button>
                    </div>
                    {/* Subtotal on desktop */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-lg font-bold text-primary min-w-[100px] text-right">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 sticky top-20 sm:top-24">
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2">
                <FaShoppingCart className="text-secondary" />
                Order Summary
              </h3>
              <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                <span className="text-gray-600">Items ({items.reduce((total, item) => total + item.quantity, 0)})</span>
                <span className="font-semibold">RM {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg md:text-xl font-bold text-primary pt-3 sm:pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className="text-secondary">RM {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <form className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6" onSubmit={handleCheckout}>
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">Customer Information</h3>
              
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-base sm:text-lg py-3 sm:py-4 font-bold shadow-lg hover:shadow-xl transition-all touch-manipulation"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span className="text-sm sm:text-base">Processing...</span>
                  </>
                ) : (
                  <>
                    <FaMobile className="text-lg sm:text-xl" />
                    <span>Pay with Touch 'n Go</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Secure payment via Touch 'n Go eWallet
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={{
          id: `ORDER_${Date.now()}`,
          items: items,
          total: getTotalPrice(),
          customerInfo: customerInfo
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
